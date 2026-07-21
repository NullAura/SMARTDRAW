import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const baseUrl = (process.env.IMAGE_SERVICE_URL || 'http://127.0.0.1:9000').replace(/\/$/, '')
const testImagePath = path.join(currentDirectory, 'test_image.jpg')

async function assertJson(response, context) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`${context}失败：HTTP ${response.status}`)
  }
  if (!data) throw new Error(`${context}返回的不是 JSON`)
  return data
}

async function testHealthCheck() {
  const response = await fetch(`${baseUrl}/health`, {
    signal: AbortSignal.timeout(10000)
  })
  const data = await assertJson(response, '健康检查')
  if (data.status !== 'healthy') throw new Error(`服务状态异常：${data.status}`)
  console.log('✓ 图片服务健康检查通过')
}

async function testGenerate() {
  const image = await readFile(testImagePath)
  const formData = new FormData()
  formData.append('image', new Blob([image], { type: 'image/jpeg' }), 'test_image.jpg')
  formData.append('username', 'testuser')
  formData.append('prompt', '现代简约客厅，阳光充足')
  formData.append('return_type', 'url')

  const response = await fetch(`${baseUrl}/generate`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(120000)
  })
  const data = await assertJson(response, '图片生成')
  if (data.status !== 'success' || !Array.isArray(data.outputs) || !data.outputs.length) {
    throw new Error('图片生成响应格式无效')
  }

  for (const output of data.outputs) {
    const outputUrl = new URL(output, baseUrl)
    const imageResponse = await fetch(outputUrl, { signal: AbortSignal.timeout(10000) })
    if (!imageResponse.ok || !imageResponse.headers.get('content-type')?.startsWith('image/')) {
      throw new Error(`输出图片不可访问：${outputUrl}`)
    }
  }
  console.log('✓ 图片生成集成测试通过')
}

try {
  await testHealthCheck()
  await testGenerate()
} catch (error) {
  console.error(`✗ ${error.message}`)
  process.exitCode = 1
}
