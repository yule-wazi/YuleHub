// 预渲染图片
export function preLoadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = resolve
  })
}
