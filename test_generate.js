// 图片生成服务测试脚本
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const BASE_URL = "http://1.116.47.250:8000";
const TEST_IMAGE_PATH = path.join(__dirname, "test_image.jpg"); // 请将测试图片放在同目录下

async function testHealthCheck() {
  try {
    console.log("测试健康检查端点...");
    const response = await fetch(`${BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`健康检查失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("健康检查结果:", data);
    
    if (data.status !== "healthy") {
      throw new Error(`服务状态异常: ${data.status}`);
    }
    
    console.log("✅ 健康检查测试通过");
    return true;
  } catch (error) {
    console.error("❌ 健康检查测试失败:", error.message);
    return false;
  }
}

async function testGenerateWithUrl() {
  try {
    console.log("测试图片生成功能...");
    
    // 检查测试图片是否存在
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      throw new Error(`测试图片不存在: ${TEST_IMAGE_PATH}`);
    }
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));
    formData.append('username', 'testuser');
    formData.append('prompt', '现代简约客厅，阳光充足');
    formData.append('return_type', 'url');
    
    console.log("正在发送生成请求...");
    const response = await fetch(`${BASE_URL}/generate`, {
      method: 'POST',
      body: formData,
      timeout: 1200000 // 1200秒超时
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`生成请求失败: ${response.status}, ${errorText}`);
    }
    
    const result = await response.json();
    console.log("生成结果:", result);
    
    if (result.status !== "success") {
      throw new Error(`生成状态异常: ${result.status}`);
    }
    
    if (!result.outputs || result.outputs.length === 0) {
      throw new Error("没有返回输出图片");
    }
    
    // 验证URL可访问性
    console.log("验证图片URL可访问性...");
    for (const url of result.outputs) {
      const fullUrl = `${BASE_URL}${url}`;
      console.log(`检查URL: ${fullUrl}`);
      
      const imgResponse = await fetch(fullUrl);
      if (!imgResponse.ok) {
        throw new Error(`图片URL无法访问: ${fullUrl}, 状态: ${imgResponse.status}`);
      }
      
      const contentType = imgResponse.headers.get("Content-Type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error(`返回的不是图片类型: ${contentType}`);
      }
      
      console.log(`图片URL有效: ${fullUrl}`);
    }
    
    console.log("✅ 图片生成测试通过");
    return true;
  } catch (error) {
    console.error("❌ 图片生成测试失败:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("开始测试图片生成服务...");
  
  const healthCheckResult = await testHealthCheck();
  if (!healthCheckResult) {
    console.error("健康检查失败，跳过后续测试");
    return;
  }
  
  await testGenerateWithUrl();
  
  console.log("测试完成");
}

runTests().catch(error => {
  console.error("测试过程中发生未捕获异常:", error);
}); 