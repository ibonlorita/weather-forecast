export const getWeatherIcon = (description: string): string => {
  const desc = description.toLowerCase();
  if (desc.includes('晴')) return '☀️'
  if (desc.includes('雨')) return '🌧️'
  if (desc.includes('雲') || desc.includes('陰')) return '☁️'
  if (desc.includes('雷')) return '⚡️'
  if (desc.includes('雪')) return '❄️'
  if (desc.includes('風')) return '🌬️'
  return '🌤️'
}

// 格式化溫度顯示，加上攝氏度符號
export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`
}

// 格式化時間顯示為中文本地化格式
export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('zh-TW', {
    month: 'short', // 短月份格式
    day: 'numeric', // 數字日期
    hour: '2-digit', // 兩位數小時
    minute: '2-digit', // 兩位數分鐘
  })
}

// 根據溫度與濕度計算人體舒適度
export const getComfortLevel = (temp: number, humidity: number): string=> {
  if (temp < 10) return '寒冷'
  if (temp > 35) return '炎熱'
  if (humidity > 80) return '潮濕'
  if (temp >= 20 && temp <= 26 && humidity >= 40 && humidity <= 70) return '舒適'
  return '一般'
}

