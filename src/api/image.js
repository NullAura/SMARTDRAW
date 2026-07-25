const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000

export async function generateDesignImage(formData, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.error || `图片服务请求失败（HTTP ${response.status}）`)
    }
    if (data?.status !== 'success' || !Array.isArray(data.outputs) || !data.outputs.length) {
      throw new Error('图片服务返回格式无效')
    }
    return data.outputs.at(-1)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('图片生成请求超时')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}
