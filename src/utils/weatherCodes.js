// WMO 天氣代碼對照（Open-Meteo 使用的標準），轉成中文說明和 emoji
const CODE_MAP = {
  0: { label: '晴朗', icon: '☀️' },
  1: { label: '大致晴朗', icon: '🌤️' },
  2: { label: '多雲時晴', icon: '⛅' },
  3: { label: '陰天', icon: '☁️' },
  45: { label: '有霧', icon: '🌫️' },
  48: { label: '霧淞', icon: '🌫️' },
  51: { label: '毛毛雨', icon: '🌦️' },
  53: { label: '毛毛雨', icon: '🌦️' },
  55: { label: '毛毛雨（大）', icon: '🌦️' },
  56: { label: '凍雨', icon: '🌧️' },
  57: { label: '凍雨（大）', icon: '🌧️' },
  61: { label: '小雨', icon: '🌧️' },
  63: { label: '中雨', icon: '🌧️' },
  65: { label: '大雨', icon: '🌧️' },
  66: { label: '凍雨', icon: '🌧️' },
  67: { label: '凍雨（大）', icon: '🌧️' },
  71: { label: '小雪', icon: '🌨️' },
  73: { label: '中雪', icon: '🌨️' },
  75: { label: '大雪', icon: '🌨️' },
  77: { label: '雪粒', icon: '🌨️' },
  80: { label: '陣雨', icon: '🌦️' },
  81: { label: '陣雨（大）', icon: '🌦️' },
  82: { label: '強陣雨', icon: '⛈️' },
  85: { label: '陣雪', icon: '🌨️' },
  86: { label: '強陣雪', icon: '🌨️' },
  95: { label: '雷雨', icon: '⛈️' },
  96: { label: '雷雨（冰雹）', icon: '⛈️' },
  99: { label: '雷雨（強冰雹）', icon: '⛈️' },
}

export function describeWeatherCode(code) {
  return CODE_MAP[code] || { label: '天氣', icon: '🌡️' }
}
