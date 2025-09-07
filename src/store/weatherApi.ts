import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { WeatherData, ForecastData, ApiResponse } from '../types/weather'

// 根據環境自動選擇 API 基礎 URL
const getBaseUrl = () => {
  // 本地開發環境
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api'
  }
  // 生產環境（GitHub Pages）
  return process.env.REACT_APP_API_URL + '/api' || 'https://weather-forecast-g4ss.onrender.com/api'
}

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getBaseUrl(),
    // 增加錯誤處理
    validateStatus: (response, body) => {
      if (response.status === 200 && body?.success === false) {
        return false // 將 API 錯誤轉換為 HTTP 錯誤
      }
      return response.status < 400
    }
  }),
  tagTypes: ['Weather', 'Forecast'],
  endpoints: (builder) => ({
    getCurrentWeather: builder.query<WeatherData, string>({
      query: (cityName) => ({
        url: 'weather',
        params: {city: cityName, type: 'current'}
      }),
      providesTags: (result, error, cityName) => [{ type: 'Weather', id: cityName }],
      transformResponse: (response: ApiResponse<WeatherData>) => {
        if (!response.data) {
          throw new Error('天氣資料為空')
        }
        return response.data
      }
    }),
    getForecast: builder.query<ForecastData, string>({
      query: (cityName) => ({
        url: 'weather',
        params: {city: cityName, type: 'forecast'}
      }),
      providesTags: (result, error, cityName) => [{type: 'Forecast', id: cityName}],
      transformResponse: (response: ApiResponse<ForecastData>) => {
        if (!response.data) {
          throw new Error('預報資料為空')
        }
        return response.data
      }
    }),
  }),
})

export const { 
  useGetCurrentWeatherQuery, 
  useGetForecastQuery, 
} = weatherApi


export default weatherApi.reducer
