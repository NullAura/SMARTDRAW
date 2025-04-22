import os
from waitress import serve
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import requests
import json
import time
import traceback
from datetime import datetime
from colorama import init, Fore, Back, Style

# 初始化colorama
init(autoreset=True)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 混元API配置
HUNYUAN_API_KEY = "***REMOVED***"  # 直接配置API密钥
HUNYUAN_API_BASE_URL = "https://api.hunyuan.cloud.tencent.com/v1"

def print_error(error_type, error_message, error_details=None):
    """在终端打印彩色错误信息"""
    print(f"\n{Fore.RED}{'='*80}")
    print(f"{Fore.RED}错误类型: {error_type}")
    print(f"{Fore.RED}错误信息: {error_message}")
    if error_details:
        print(f"{Fore.YELLOW}详细信息:")
        print(json.dumps(error_details, ensure_ascii=False, indent=2))
    print(f"{Fore.RED}{'='*80}\n")

@app.route('/api/polish', methods=['POST'])
def polish_prompt():
    request_id = f"req_{int(time.time())}_{os.urandom(4).hex()}"
    print(f"{Fore.GREEN}[{request_id}] 收到润色请求")
    
    try:
        data = request.get_json()
        if not data:
            print(f"{Fore.RED}[{request_id}] 请求体为空")
            return jsonify({'error': '请求数据格式错误', 'request_id': request_id}), 400
            
        prompt = data.get('prompt')
        if not prompt:
            print(f"{Fore.RED}[{request_id}] 提示词为空")
            return jsonify({'error': '提示词不能为空', 'request_id': request_id}), 400
            
        if len(prompt) > 1000:
            print(f"{Fore.RED}[{request_id}] 提示词过长: {len(prompt)}字符")
            return jsonify({'error': '提示词长度不能超过1000个字符', 'request_id': request_id}), 400
            
        if not HUNYUAN_API_KEY:
            print(f"{Fore.RED}[{request_id}] 混元API密钥未配置")
            return jsonify({'error': '服务器配置错误，请联系管理员', 'request_id': request_id}), 500
            
        print(f"{Fore.CYAN}[{request_id}] 开始润色提示词: {prompt[:50]}...")
        
        headers = {
            'Authorization': f'Bearer {HUNYUAN_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'hunyuan-turbos-latest',
            'messages': [
                {
                    'role': 'system',
                    'content': '你是一个专业的家居设计提示词优化助手。请帮我优化以下提示词，使其更加专业、详细和富有创意。保持原有的核心意思，但可以添加更多细节和描述。'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.7,
            'max_tokens': 500,
            'enable_enhancement': True
        }
        
        start_time = time.time()
        try:
            response = requests.post(
                f'{HUNYUAN_API_BASE_URL}/chat/completions',
                headers=headers,
                json=payload,
                timeout=30
            )
        except requests.exceptions.Timeout:
            print(f"{Fore.RED}[{request_id}] 请求超时")
            return jsonify({'error': '请求超时，请稍后再试', 'request_id': request_id}), 504
        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}[{request_id}] 请求异常: {str(e)}")
            return jsonify({'error': '网络错误，请稍后再试', 'request_id': request_id}), 500
            
        end_time = time.time()
        request_duration = end_time - start_time
        print(f"{Fore.CYAN}[{request_id}] API请求耗时: {request_duration:.2f}秒")
        
        if response.status_code != 200:
            error_details = {
                'status_code': response.status_code,
                'response_text': response.text,
                'request_duration': request_duration
            }
            
            if response.status_code == 429:
                print(f"{Fore.RED}[{request_id}] 请求过于频繁")
                return jsonify({'error': '请求过于频繁，请稍后再试', 'request_id': request_id}), 429
            elif response.status_code == 401:
                print(f"{Fore.RED}[{request_id}] API认证失败")
                return jsonify({'error': 'API认证失败，请联系管理员', 'request_id': request_id}), 500
            else:
                print(f"{Fore.RED}[{request_id}] AI服务暂时不可用")
                return jsonify({'error': 'AI服务暂时不可用，请稍后再试', 'request_id': request_id}), 503
                
        result = response.json()
        if not result.get('choices') or not result['choices'][0].get('message'):
            print(f"{Fore.RED}[{request_id}] 返回数据格式错误")
            return jsonify({'error': '润色服务暂时不可用，请稍后再试', 'request_id': request_id}), 500
            
        polished_prompt = result['choices'][0]['message']['content'].strip()
        print(f"{Fore.GREEN}[{request_id}] 润色成功完成")
        
        return jsonify({
            'polished_prompt': polished_prompt,
            'request_id': request_id,
            'duration': request_duration
        })
        
    except Exception as e:
        print(f"{Fore.RED}[{request_id}] 未知错误: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': '润色服务暂时不可用，请稍后再试', 'request_id': request_id}), 500

if __name__ == '__main__':
    print(f"\n{Fore.GREEN}{'='*50}")
    print(f"{Fore.GREEN}服务器启动")
    print(f"{Fore.GREEN}混元API配置: {'已配置' if HUNYUAN_API_KEY else '未配置'}")
    print(f"{Fore.GREEN}{'='*50}\n")
    
    # 开发环境
    if os.environ.get('FLASK_ENV') == 'development':
        app.run(debug=True)
    # 生产环境
    else:
        serve(app, host='0.0.0.0', port=5000) 