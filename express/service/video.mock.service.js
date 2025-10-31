import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { LIMITSIZE } from '../config/globalVar.js'
import { shufflingList } from '../utils/shuffling.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MOCK_FILE_PATH = path.join(__dirname, '../mock/video.mock.json')

// 读取mock数据
function readMockData() {
  try {
    const data = fs.readFileSync(MOCK_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('读取mock数据失败:', err)
    return { videos: [] }
  }
}

class VideoMockService {
  // 获取视频列表（带分页）
  list(offset) {
    const { videos } = readMockData()
    const start = offset
    const end = start + LIMITSIZE
    const result = videos.slice(start, end)

    // 保持labels为数组格式（MySQL JSON_ARRAYAGG返回JSON数组）
    return result.map((item) => ({
      ...item,
      labels: item.labels || [],
    }))
  }

  // 获取作者信息（从videos中查找）
  author(name) {
    const { videos } = readMockData()
    // 从视频数据中查找作者信息
    const authorVideo = videos.find((v) => v.author === name)
    if (authorVideo) {
      return [
        {
          id: authorVideo.id,
          name: authorVideo.author,
          img: authorVideo.authorImg || '',
        },
      ]
    }
    return []
  }

  // 搜索视频（通过标签匹配）
  search(keyword, offset) {
    const { videos } = readMockData()
    const filtered = videos.filter((video) => {
      const labels = video.labels || []
      return (
        labels.some((label) => label.toLowerCase().includes(keyword.toLowerCase())) ||
        video.title.toLowerCase().includes(keyword.toLowerCase())
      )
    })

    const start = offset
    const end = start + LIMITSIZE
    const result = filtered.slice(start, end)

    return result.map((item) => ({
      ...item,
      labels: item.labels || [],
    }))
  }

  // 获取总数
  count() {
    const { videos } = readMockData()
    return { count: videos.length }
  }

  // 获取Feed列表（随机排序）
  feed(limit) {
    const { videos } = readMockData()
    const shuffled = shufflingList([...videos])
    const result = shuffled.slice(0, limit)

    return result.map((item) => ({
      ...item,
      labels: item.labels || [],
    }))
  }
}

export default new VideoMockService()
