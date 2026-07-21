import importlib.util
import io
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


MODULE_PATH = Path(__file__).resolve().parents[1] / "server.py"
SPEC = importlib.util.spec_from_file_location("smartdraw_ai_gateway", MODULE_PATH)
gateway = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(gateway)


class AIGatewayTests(unittest.TestCase):
    def setUp(self):
        gateway.app.config.update(TESTING=True)
        self.client = gateway.app.test_client()

    def test_health_does_not_expose_credentials(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "healthy")
        self.assertNotIn("api_key", str(payload).lower())
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    def test_polish_rejects_empty_prompt(self):
        response = self.client.post("/api/polish", json={"prompt": "  "})
        self.assertEqual(response.status_code, 400)

    def test_polish_uses_server_side_key_and_tls_defaults(self):
        upstream = Mock(ok=True, status_code=200)
        upstream.json.return_value = {
            "choices": [{"message": {"content": "优化后的提示词"}}]
        }
        with patch.object(gateway, "HUNYUAN_API_KEY", "test-key"), patch.object(
            gateway.requests, "post", return_value=upstream
        ) as post:
            response = self.client.post("/api/polish", json={"prompt": "现代客厅"})

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("verify", post.call_args.kwargs)
        self.assertEqual(post.call_args.kwargs["headers"]["Authorization"], "Bearer test-key")

    def test_review_rejects_non_image_upload(self):
        with patch.object(gateway, "OPENAI_API_KEY", "test-key"):
            response = self.client.post(
                "/api/openai_review",
                data={"file": (io.BytesIO(b"not an image"), "payload.txt")},
                content_type="multipart/form-data",
            )
        self.assertEqual(response.status_code, 415)

    def test_review_rejects_forged_image_mime_type(self):
        with patch.object(gateway, "OPENAI_API_KEY", "test-key"):
            response = self.client.post(
                "/api/openai_review",
                data={"file": (io.BytesIO(b"not really jpeg"), "payload.jpg", "image/jpeg")},
                content_type="multipart/form-data",
            )
        self.assertEqual(response.status_code, 415)

    def test_request_id_is_consistent(self):
        response = self.client.post(
            "/api/polish",
            json={"prompt": ""},
            headers={"X-Request-ID": "test-request-id"},
        )
        self.assertEqual(response.get_json()["request_id"], "test-request-id")
        self.assertEqual(response.headers["X-Request-ID"], "test-request-id")


if __name__ == "__main__":
    unittest.main()
