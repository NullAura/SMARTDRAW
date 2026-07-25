function dataUrlToFile(dataUrl, filename) {
  const [metadata, encoded] = dataUrl.split(',')
  if (!encoded) throw new Error('INVALID_IMAGE_DATA')

  const mimeType = metadata.match(/data:(.*?);/)?.[1] || 'image/jpeg'
  const decoded = atob(encoded)
  const bytes = Uint8Array.from(decoded, character => character.charCodeAt(0))
  return new File([bytes], filename, { type: mimeType })
}

function createPlaceholder(item) {
  const size = 400
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('CANVAS_UNAVAILABLE')

  canvas.width = size
  canvas.height = size

  const gradient = context.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#f8f4eb')
  gradient.addColorStop(1, '#e5dfd3')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  context.strokeStyle = '#dccfbf'
  context.lineWidth = 10
  context.strokeRect(10, 10, size - 20, size - 20)

  context.fillStyle = '#3c2913'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = 'bold 160px Arial'
  context.fillText(item.name.charAt(0), size / 2, 180)
  context.font = 'bold 36px Arial'
  const displayName = item.name.length > 10 ? `${item.name.slice(0, 10)}...` : item.name
  context.fillText(displayName, size / 2, 300)

  const preview = canvas.toDataURL('image/jpeg', 0.9)
  return {
    file: dataUrlToFile(preview, `${item.name}.jpg`),
    preview,
    dimensions: { width: size, height: size },
    productInfo: { ...item }
  }
}

export async function createCartProductImage(item) {
  if (!item?.name) throw new Error('INVALID_PRODUCT')

  if (item.imageUrl) {
    try {
      const response = await fetch(item.imageUrl)
      if (!response.ok) throw new Error(`HTTP_${response.status}`)
      const blob = await response.blob()
      const type = blob.type || 'image/jpeg'
      const extension = type.split('/')[1] || 'jpg'
      return {
        file: new File([blob], `${item.name}.${extension}`, { type }),
        preview: item.imageUrl,
        dimensions: { width: 400, height: 400 },
        productInfo: { ...item }
      }
    } catch {
      // 跨域或图片失效时使用本地占位图，避免中断选择流程。
    }
  }

  return createPlaceholder(item)
}
