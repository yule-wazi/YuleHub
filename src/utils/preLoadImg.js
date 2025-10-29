// 预渲染图片
export function preLoadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, src })
    img.onerror = reject
    img.src = src
  })
}
