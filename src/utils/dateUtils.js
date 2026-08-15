import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns'

export function buildCalendarGrid(monthDate) {
  const start = startOfWeek(startOfMonth(monthDate))
  const end = endOfWeek(endOfMonth(monthDate))
  const days = []
  let d = start
  while (d <= end) {
    days.push(d)
    d = addDays(d, 1)
  }
  return days
}

export const fmt = (d, f = 'yyyy-MM-dd') => format(d, f)
export { isSameMonth, isSameDay }

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
export function fmtDateWithWeekday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${format(d, 'yyyy/MM/dd')}（週${WEEKDAYS[d.getDay()]}）`
}
