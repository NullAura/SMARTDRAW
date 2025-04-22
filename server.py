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
import socket
import dns.resolver
import base64

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
HUNYUAN_API_KEY = "***REMOVED***"
HUNYUAN_API_BASE_URL = "https://api.hunyuan.cloud.tencent.com/v1/chat/completions"

# OpenAI API配置
OPENAI_API_KEY = "***REMOVED***"
OPENAI_API_BASE_URL = "https://api.gptsapi.net"

def check_network_connection():
    """检查网络连接状态"""
    try:
        # 检查DNS解析
        resolver = dns.resolver.Resolver()
        resolver.timeout = 5
        resolver.lifetime = 5
        answers = resolver.resolve('api.hunyuan.cloud.tencent.com', 'A')
        ip_addresses = [str(rdata) for rdata in answers]
        print(f"{Fore.CYAN}DNS解析结果: {ip_addresses}")
        
        # 检查TCP连接
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((ip_addresses[0], 443))
        sock.close()
        return True
    except Exception as e:
        print(f"{Fore.RED}网络连接检查失败: {str(e)}")
        return False

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
    print(f"{Fore.CYAN}[{request_id}] 请求头信息:", dict(request.headers))
    
    try:
        # 检查网络连接
        print(f"{Fore.CYAN}[{request_id}] 开始检查网络连接")
        if not check_network_connection():
            print(f"{Fore.RED}[{request_id}] 网络连接检查失败")
            return jsonify({
                'error': '网络连接异常，请检查网络设置',
                'request_id': request_id
            }), 503
            
        print(f"{Fore.CYAN}[{request_id}] 开始解析请求数据")
        data = request.get_json()
        if not data:
            print(f"{Fore.RED}[{request_id}] 请求体为空")
            return jsonify({'error': '请求数据格式错误', 'request_id': request_id}), 400
            
        prompt = data.get('prompt')
        if not prompt:
            print(f"{Fore.RED}[{request_id}] 提示词为空")
            return jsonify({'error': '提示词不能为空', 'request_id': request_id}), 400
            
        print(f"{Fore.CYAN}[{request_id}] 提示词长度: {len(prompt)} 字符")
        if len(prompt) > 1000:
            print(f"{Fore.RED}[{request_id}] 提示词过长: {len(prompt)}字符")
            return jsonify({'error': '提示词长度不能超过1000个字符', 'request_id': request_id}), 400
            
        if not HUNYUAN_API_KEY:
            print(f"{Fore.RED}[{request_id}] 混元API密钥未配置")
            return jsonify({'error': '服务器配置错误，请联系管理员', 'request_id': request_id}), 500
            
        print(f"{Fore.CYAN}[{request_id}] 开始润色提示词: {prompt[:50]}...")
        
        headers = {
            'Authorization': f'Bearer {HUNYUAN_API_KEY}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
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
        
        print(f"{Fore.CYAN}[{request_id}] 请求参数:")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        print(f"{Fore.CYAN}[{request_id}] API URL: {HUNYUAN_API_BASE_URL}")
        print(f"{Fore.CYAN}[{request_id}] Headers: {json.dumps({k: '***' if k == 'Authorization' else v for k, v in headers.items()}, ensure_ascii=False, indent=2)}")
        
        start_time = time.time()
        try:
            response = requests.post(
                HUNYUAN_API_BASE_URL,
                headers=headers,
                json=payload,
                timeout=60,  # 增加超时时间到60秒
                verify=False  # 临时禁用SSL验证以排除证书问题
            )
        except requests.exceptions.Timeout:
            error_details = {
                'request_duration': time.time() - start_time,
                'endpoint': HUNYUAN_API_BASE_URL,
                'headers': {k: '***' if k == 'Authorization' else v for k, v in headers.items()}
            }
            print_error('请求超时', 'API请求超过60秒未响应', error_details)
            return jsonify({'error': '请求超时，请稍后再试', 'request_id': request_id}), 504
        except requests.exceptions.RequestException as e:
            error_details = {
                'error_type': type(e).__name__,
                'error_message': str(e),
                'request_duration': time.time() - start_time,
                'endpoint': HUNYUAN_API_BASE_URL
            }
            print_error('请求异常', str(e), error_details)
            return jsonify({'error': '网络错误，请稍后再试', 'request_id': request_id}), 500
            
        end_time = time.time()
        request_duration = end_time - start_time
        print(f"{Fore.CYAN}[{request_id}] API请求耗时: {request_duration:.2f}秒")
        
        if response.status_code != 200:
            error_details = {
                'status_code': response.status_code,
                'response_headers': dict(response.headers),
                'response_text': response.text,
                'request_duration': request_duration,
                'request_url': HUNYUAN_API_BASE_URL,
                'request_headers': {k: '***' if k == 'Authorization' else v for k, v in headers.items()}
            }
            
            if response.status_code == 429:
                print_error('请求频率限制', 'API请求过于频繁', error_details)
                return jsonify({'error': '请求过于频繁，请稍后再试', 'request_id': request_id}), 429
            elif response.status_code == 401:
                print_error('认证失败', 'API密钥无效或过期', error_details)
                return jsonify({'error': 'API认证失败，请联系管理员', 'request_id': request_id}), 500
            else:
                print_error('服务错误', f'API返回错误状态码: {response.status_code}', error_details)
                return jsonify({'error': 'AI服务暂时不可用，请稍后再试', 'request_id': request_id}), 503
                
        result = response.json()
        if not result.get('choices') or not result['choices'][0].get('message'):
            error_details = {
                'response_data': result,
                'request_duration': request_duration
            }
            print_error('数据格式错误', 'API返回数据格式不符合预期', error_details)
            return jsonify({'error': '润色服务暂时不可用，请稍后再试', 'request_id': request_id}), 500
            
        polished_prompt = result['choices'][0]['message']['content'].strip()
        print(f"{Fore.GREEN}[{request_id}] 润色成功完成")
        
        return jsonify({
            'polished_prompt': polished_prompt,
            'request_id': request_id,
            'duration': request_duration
        })
        
    except Exception as e:
        error_details = {
            'error_type': type(e).__name__,
            'error_message': str(e),
            'traceback': traceback.format_exc()
        }
        print_error('未知错误', str(e), error_details)
        return jsonify({'error': '润色服务暂时不可用，请稍后再试', 'request_id': request_id}), 500

@app.route('/api/openai_review', methods=['POST'])
def get_openai_review():
    request_id = f"req_{int(time.time())}_{os.urandom(4).hex()}"
    print(f"{Fore.GREEN}[{request_id}] 收到OpenAI评价请求")
    
    try:
        if 'file' not in request.files:
            print(f"{Fore.RED}[{request_id}] 未收到文件")
            return jsonify({'error': '请上传图片文件', 'request_id': request_id}), 400
            
        file = request.files['file']
        if not file:
            print(f"{Fore.RED}[{request_id}] 文件为空")
            return jsonify({'error': '文件不能为空', 'request_id': request_id}), 400
            
        if not OPENAI_API_KEY:
            print(f"{Fore.RED}[{request_id}] OpenAI API密钥未配置")
            return jsonify({'error': '服务器配置错误，请联系管理员', 'request_id': request_id}), 500
            
        print(f"{Fore.CYAN}[{request_id}] 开始处理文件")
        
        # 保存文件到临时目录
        temp_dir = os.path.join(os.getcwd(), 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        temp_file_path = os.path.join(temp_dir, f"{request_id}_{file.filename}")
        file.save(temp_file_path)
        
        try:
            # 读取文件内容
            with open(temp_file_path, 'rb') as f:
                file_content = f.read()
            
            # 准备请求头
            headers = {
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            }
            
            # 构建请求体
            payload = {
                'model': 'gpt-4o',
                'messages': [
                    {
                        'role': 'system',
                        'content': '你是一个专业的家居设计评价专家。请根据提供的家居图片，从以下几个方面进行分析：\n1. 整体风格和氛围\n2. 空间布局和功能性\n3. 色彩搭配和材质选择\n4. 家具选择和摆放\n5. 装饰细节\n6. 改进建议\n请用专业但易懂的语言进行评价，并给出具体的改进建议。'
                    },
                    {
                        'role': 'user',
                        'content': [
                            {
                                'type': 'image_url',
                                'image_url': {
                                    'url': f"data:image/jpeg;base64,{base64.b64encode(file_content).decode('utf-8')}"
                                }
                            },
                            {
                                'type': 'text',
                                'text': '请分析这张家居图片，给出专业的评价和改进建议。'
                            }
                        ]
                    }
                ],
                'max_tokens': 1000
            }
            
            print(f"{Fore.CYAN}[{request_id}] 开始发送请求到OpenAI")
            print(f"{Fore.CYAN}[{request_id}] API URL: {OPENAI_API_BASE_URL}/v1/chat/completions")
            print(f"{Fore.CYAN}[{request_id}] Headers: {json.dumps({k: '***' if k == 'Authorization' else v for k, v in headers.items()}, ensure_ascii=False, indent=2)}")
            print(f"{Fore.CYAN}[{request_id}] Payload: {json.dumps(payload, ensure_ascii=False, indent=2)}")
            
            start_time = time.time()
            
            try:
                response = requests.post(
                    f'{OPENAI_API_BASE_URL}/v1/chat/completions',
                    headers=headers,
                    json=payload,
                    timeout=60
                )
            except requests.exceptions.Timeout:
                print(f"{Fore.RED}[{request_id}] 请求超时")
                return jsonify({'error': 'OpenAI API请求超时', 'request_id': request_id}), 504
            except requests.exceptions.RequestException as e:
                print(f"{Fore.RED}[{request_id}] 请求异常: {str(e)}")
                return jsonify({'error': f'OpenAI API请求失败: {str(e)}', 'request_id': request_id}), 500
            
            end_time = time.time()
            request_duration = end_time - start_time
            print(f"{Fore.CYAN}[{request_id}] API请求耗时: {request_duration:.2f}秒")
            print(f"{Fore.CYAN}[{request_id}] 响应状态码: {response.status_code}")
            print(f"{Fore.CYAN}[{request_id}] 响应内容: {response.text}")
            
            if response.status_code != 200:
                error_details = {
                    'status_code': response.status_code,
                    'response_text': response.text,
                    'request_duration': request_duration
                }
                print(f"{Fore.RED}[{request_id}] OpenAI API错误: {error_details}")
                return jsonify({'error': f'OpenAI API请求失败: {response.text}', 'request_id': request_id}), 500
                
            result = response.json()
            if not result.get('choices') or not result['choices'][0].get('message'):
                print(f"{Fore.RED}[{request_id}] 返回数据格式错误")
                return jsonify({'error': '评价服务暂时不可用，请稍后再试', 'request_id': request_id}), 500
                
            review = result['choices'][0]['message']['content'].strip()
            print(f"{Fore.GREEN}[{request_id}] 评价成功完成")
            
            return jsonify({
                'review': review,
                'request_id': request_id,
                'duration': request_duration
            })
            
        finally:
            # 清理临时文件
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except Exception as e:
        print(f"{Fore.RED}[{request_id}] 未知错误: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'评价服务暂时不可用: {str(e)}', 'request_id': request_id}), 500

if __name__ == '__main__':
    print(f"\n{Fore.GREEN}{'='*50}")
    print(f"{Fore.GREEN}服务器启动")
    print(f"{Fore.GREEN}混元API配置: {'已配置' if HUNYUAN_API_KEY else '未配置'}")
    print(f"{Fore.GREEN}API端点: {HUNYUAN_API_BASE_URL}")
    print(f"{Fore.GREEN}OpenAI API配置: {'已配置' if OPENAI_API_KEY else '未配置'}")
    print(f"{Fore.GREEN}API端点: {OPENAI_API_BASE_URL}")
    print(f"{Fore.GREEN}{'='*50}\n")
    
    # 开发环境
    if os.environ.get('FLASK_ENV') == 'development':
        app.run(debug=True, port=8000)
    # 生产环境
    else:
        serve(app, host='0.0.0.0', port=8000) 