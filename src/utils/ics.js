import { sessionTypeLabel } from './session.js'

function pad(n) { return String(n).padStart(2, '0') }

// 產生行事曆用的本地時間戳記（不含時區資訊，Outlook / Google / Apple 都會當作裝置本地時間處理）
function toICSDateTime(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-')
  const [hh, mm] = (timeStr || '00:00').split(':')
  return `${y}${m}${d}T${pad(hh)}${pad(mm)}00`
}

function escapeText(str = '') {
  return String(str).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function buildEvent(session, memberName) {
  const start = toICSDateTime(session.date, session.startTime)
  const end = toICSDateTime(session.date, session.endTime || session.startTime)
  const attendees = (session.attendeeIds || []).map(memberName).join('、')
  const desc = [
    `費用：$${session.totalCost}（付款人 ${memberName(session.payerId)}）`,
    attendees && `出席：${attendees}`,
  ].filter(Boolean).join('\\n')
  return [
    'BEGIN:VEVENT',
    `UID:${session.id}@yundongla`,
    `DTSTAMP:${toICSDateTime(session.date, '00:00')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText('運動啦・' + sessionTypeLabel(session))}`,
    session.location ? `LOCATION:${escapeText(session.location)}` : '',
    `DESCRIPTION:${escapeText(desc)}`,
    'END:VEVENT',
  ].filter(Boolean).join('\r\n')
}

export function buildICS(sessions, memberName) {
  const events = sessions.map(s => buildEvent(s, memberName)).join('\r\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//yundongla//zh-Hant//',
    'CALSCALE:GREGORIAN',
    events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICS(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
