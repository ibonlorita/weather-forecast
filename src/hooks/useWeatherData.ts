import { useGetCurrentWeatherQuery, useGetForecastQuery } from '../store/weatherApi'

interface UseWeatherDataOptions {
  enablePolling?: boolean // 是否啟用自動輪詢更新
  pollingInterval?: number
} 

// 整合當前天氣 和 預報資料
export const useWeatherData = (cityName: string, options: UseWeatherDataOptions = {}) => {
  // 選項中解構，提供預設
  const { enablePolling = false, pollingInterval = 300000 } = options

  // 當前天氣資料，並重新命名回傳值
  const {
    data: currentWeather, 
    isLoading: currentWeatherLoading,
    error: currentWeatherError,
    refetch: refetchCurrentWeather,
  } = useGetCurrentWeatherQuery(cityName, {
    skip: !cityName,
    pollingInterval: enablePolling ? pollingInterval : 0,
  })

  // 取得預報資料
  const {
    data: forecast,
    isLoading: forecastLoading,
    error: forecastError,
    refetch: refetchForecastData,
  } = useGetForecastQuery(cityName, {
    skip: !cityName,
  })

  return {
    currentWeather,
    currentWeatherLoading,
    currentWeatherError,
    forecast,
    forecastLoading,
    forecastError,
    refetchWeather: refetchCurrentWeather,
    refetchForecast: refetchForecastData,
  }
  
}
