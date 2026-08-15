// 將上傳的圖片壓縮成小尺寸的 JPEG dataURL，直接存進 Firestore 文件裡，
// 不需要 Firebase Storage，也就不需要信用卡 / Blaze 方案。
export function fileToCompressedDataURL(file, maxDim = 240, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width); width = maxDim
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height); height = maxDim
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
