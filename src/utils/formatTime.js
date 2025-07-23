import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)
export function formatTime(time) {
  return dayjs(time).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
}
