import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)
export function formatTime(time) {
  return dayjs(time).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
}

// 获取当前时间减去1天的日期，格式为YYYY-MM-DD
export function getYesterdayDate(subDays = 1) {
  return dayjs().subtract(subDays, 'day').format('YYYY-MM-DD')
}

// 获取指定日期减去N天的日期，格式为YYYY-MM-DD
export function getPreviousDate(dateStr, days = 1) {
  return dayjs(dateStr).subtract(days, 'day').format('YYYY-MM-DD')
}
