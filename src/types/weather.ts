// 單筆天氣資料完整結構 
export interface WeatherData {
  id: string;
  cityName: string;
  temperature: number; // 溫度
  description: string; // 描述
  humidity: number; // 濕度
  windSpeed: number; // 風速
  pressure: number; // 氣壓
  icon: string; 
  lastUpdated: string; // 更新時間
  rainProbability?: string; // 降雨機率
}

// 預報中單日資要結構
export interface ForecastItem {
  date: string;
  dayOfWeek: string;
  maxTemp: number;
  minTemp: number;
  description: string;
  icon: string;
  rainChance: number;
}

// 多日預報資料完整結構
export interface ForecastData {
  cityName: string;
  forecast: ForecastItem[];
}

// 統一的API回傳結構
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;

}

// 城市資訊的資料結構
export interface City {
  id: string;
  name: string;
  displayName: string;
}

