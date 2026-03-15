// 格式化数字（大于1000显示k）
export default function formatNumber(num) {
  if (!Number.isFinite(num)) return num
  if (!num) return 0
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}
