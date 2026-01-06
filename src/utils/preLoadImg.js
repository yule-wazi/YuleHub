// 预渲染图片
export function preLoadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, src })
    img.onerror = (err) => {
      console.log('图片加载失败，尝试切换格式')
      // 尝试切换后缀
      let alternativeUrl = null
      if (src.endsWith('.png')) {
        alternativeUrl = src.replace(/\.png$/i, '.jpg')
      } else if (src.endsWith('.jpg') || src.endsWith('.jpeg')) {
        alternativeUrl = src.replace(/\.(jpg|jpeg)$/i, '.png')
      }
      // 如果有替代URL，尝试加载
      if (alternativeUrl) {
        console.log('尝试加载替代格式:', alternativeUrl)
        const alternativeImg = new Image()
        alternativeImg.onload = () => {
          console.log('替代格式加载成功')
          resolve({
            width: alternativeImg.naturalWidth,
            height: alternativeImg.naturalHeight,
            src: alternativeUrl,
          })
        }
        alternativeImg.onerror = () => {
          console.log('替代格式也加载失败')
          reject(new Error('图片加载失败，所有格式都尝试过了'))
        }
        alternativeImg.src = alternativeUrl
      } else {
        reject(new Error('图片加载失败'))
      }
    }
    img.src = src
  })
}
