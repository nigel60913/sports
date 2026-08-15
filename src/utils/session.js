// 相容新舊資料：新版場次用 activityTypes（陣列，可複選），
// 舊版場次用 activityType（單一字串），這裡統一轉成陣列與顯示字串。
export function sessionTypes(s) {
  if (Array.isArray(s.activityTypes) && s.activityTypes.length) return s.activityTypes
  if (s.activityType) return [s.activityType]
  return []
}

export function sessionTypeLabel(s) {
  return sessionTypes(s).join('、') || '未分類'
}

export function sessionEmoji(s) {
  const types = sessionTypes(s)
  if (types.includes('羽球')) return '🏸'
  if (types.includes('匹克球')) return '🎾'
  return '⚡️'
}
