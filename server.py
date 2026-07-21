"""SmartDraw AI gateway.

Credentials are loaded from ``server/.env`` or the process environment and are
never sent to the browser.
"""

from __future__ import annotations

import base64
import logging
import os
import uuid
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from waitress import serve

PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / "server" / ".env")

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("smartdraw.ai")


def env_int(name: str, default: int, minimum: int = 1) -> int:
    raw_value = os.getenv(name, str(default))
    try:
        return max(minimum, int(raw_value))
    except ValueError as exc:
        raise RuntimeError(f"环境变量 {name} 必须是整数") from exc


def env_list(name: str, default: str) -> list[str]:
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


def endpoint(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


HUNYUAN_API_KEY = os.getenv("HUNYUAN_API_KEY", "").strip()
HUNYUAN_API_BASE_URL = os.getenv(
    "HUNYUAN_API_BASE_URL", "https://api.hunyuan.cloud.tencent.com/v1"
).strip()
HUNYUAN_MODEL = os.getenv("HUNYUAN_MODEL", "hunyuan-turbos-latest").strip()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_API_BASE_URL = os.getenv("OPENAI_API_BASE_URL", "https://api.openai.com/v1").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna").strip()

MAX_UPLOAD_BYTES = env_int("MAX_UPLOAD_BYTES", 10 * 1024 * 1024)
UPSTREAM_TIMEOUT_SECONDS = env_int("UPSTREAM_TIMEOUT_SECONDS", 60)
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": env_list(
                "AI_CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173"
            )
        }
    },
)


def request_id() -> str:
    if "request_id" not in g:
        supplied_id = request.headers.get("X-Request-ID", "").strip()
        g.request_id = (supplied_id or uuid.uuid4().hex[:16])[:64]
    return g.request_id


def detected_image_type(content: bytes) -> str | None:
    """Return the MIME type from a small, explicit set of file signatures."""
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return "image/webp"
    return None


def error_response(message: str, status: int, req_id: str):
    return jsonify({"error": message, "request_id": req_id}), status


def parse_upstream_json(response: requests.Response, req_id: str) -> dict[str, Any] | None:
    try:
        return response.json()
    except ValueError:
        logger.warning("[%s] 上游返回非 JSON 响应，状态码=%s", req_id, response.status_code)
        return None


def upstream_error(response: requests.Response, req_id: str):
    logger.warning("[%s] 上游请求失败，状态码=%s", req_id, response.status_code)
    if response.status_code == 429:
        return error_response("请求过于频繁，请稍后再试", 429, req_id)
    if response.status_code in {401, 403}:
        return error_response("AI 服务认证失败，请联系管理员", 502, req_id)
    return error_response("AI 服务暂时不可用，请稍后再试", 502, req_id)


@app.after_request
def apply_response_headers(response):
    response.headers["X-Request-ID"] = request_id()
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.errorhandler(413)
def upload_too_large(_error):
    return error_response("图片大小超过限制", 413, request_id())


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "healthy",
            "providers": {
                "hunyuan_configured": bool(HUNYUAN_API_KEY),
                "openai_configured": bool(OPENAI_API_KEY),
            },
        }
    )


@app.post("/api/polish")
def polish_prompt():
    req_id = request_id()
    data = request.get_json(silent=True)
    prompt = data.get("prompt") if isinstance(data, dict) else None

    if not isinstance(prompt, str) or not prompt.strip():
        return error_response("提示词不能为空", 400, req_id)
    prompt = prompt.strip()
    if len(prompt) > 1000:
        return error_response("提示词长度不能超过 1000 个字符", 400, req_id)
    if not HUNYUAN_API_KEY:
        return error_response("润色服务尚未配置", 503, req_id)

    payload = {
        "model": HUNYUAN_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "你是专业的家居设计提示词优化助手。保留用户原意，补充空间、材质、"
                    "光线与风格细节，输出一段清晰且可直接用于图像生成的中文提示词。"
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 500,
        "enable_enhancement": True,
    }

    try:
        response = requests.post(
            endpoint(HUNYUAN_API_BASE_URL, "chat/completions"),
            headers={
                "Authorization": f"Bearer {HUNYUAN_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=(5, UPSTREAM_TIMEOUT_SECONDS),
        )
    except requests.Timeout:
        return error_response("AI 服务请求超时，请稍后再试", 504, req_id)
    except requests.RequestException:
        logger.exception("[%s] 无法连接混元服务", req_id)
        return error_response("AI 服务暂时不可用，请稍后再试", 502, req_id)

    if not response.ok:
        return upstream_error(response, req_id)

    result = parse_upstream_json(response, req_id)
    try:
        polished_prompt = result["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError, AttributeError):
        return error_response("AI 服务返回格式异常", 502, req_id)

    return jsonify({"polished_prompt": polished_prompt, "request_id": req_id})


@app.post("/api/openai_review")
def openai_review():
    req_id = request_id()
    uploaded_file = request.files.get("file")

    if uploaded_file is None or not uploaded_file.filename:
        return error_response("请上传图片文件", 400, req_id)
    if uploaded_file.mimetype not in ALLOWED_IMAGE_TYPES:
        return error_response("仅支持 JPEG、PNG 或 WebP 图片", 415, req_id)
    if not OPENAI_API_KEY:
        return error_response("图片评价服务尚未配置", 503, req_id)

    file_content = uploaded_file.stream.read(MAX_UPLOAD_BYTES + 1)
    if not file_content:
        return error_response("图片文件不能为空", 400, req_id)
    if len(file_content) > MAX_UPLOAD_BYTES:
        return error_response("图片大小超过限制", 413, req_id)
    actual_mimetype = detected_image_type(file_content)
    if actual_mimetype is None or actual_mimetype != uploaded_file.mimetype:
        return error_response("图片内容与文件类型不符", 415, req_id)

    data_url = (
        f"data:{actual_mimetype};base64,"
        f"{base64.b64encode(file_content).decode('ascii')}"
    )
    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "你是专业的家居设计评价专家。请从整体风格、空间布局、色彩材质、"
                    "家具摆放和装饰细节进行分析，并给出具体、可执行的改进建议。"
                ),
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "请分析这张家居图片。"},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            },
        ],
        "max_completion_tokens": 1000,
    }

    try:
        response = requests.post(
            endpoint(OPENAI_API_BASE_URL, "chat/completions"),
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=(5, UPSTREAM_TIMEOUT_SECONDS),
        )
    except requests.Timeout:
        return error_response("图片评价服务请求超时", 504, req_id)
    except requests.RequestException:
        logger.exception("[%s] 无法连接图片评价服务", req_id)
        return error_response("图片评价服务暂时不可用", 502, req_id)

    if not response.ok:
        return upstream_error(response, req_id)

    result = parse_upstream_json(response, req_id)
    try:
        review = result["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError, AttributeError):
        return error_response("图片评价服务返回格式异常", 502, req_id)

    return jsonify({"review": review, "request_id": req_id})


if __name__ == "__main__":
    host = os.getenv("AI_HOST", "127.0.0.1")
    port = env_int("AI_PORT", 8000)
    logger.info(
        "AI gateway 启动于 %s:%s（混元=%s，OpenAI=%s）",
        host,
        port,
        "已配置" if HUNYUAN_API_KEY else "未配置",
        "已配置" if OPENAI_API_KEY else "未配置",
    )
    serve(app, host=host, port=port)
