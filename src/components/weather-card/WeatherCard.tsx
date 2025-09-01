import { useWeatherData } from '../../hooks/useWeatherData'
import { getComfortLevel } from '../../utils/weatherUtils'
import { formatTime } from '../../utils/weatherUtils'
import LoadingSpinner from '../loading-spinner'
import ErrorFallback from '../error-fallback'
import ForecastItem from './ForecastItem'
import DetailItem from './DetailItem'
import styles from './WeatherCard.module.scss'

interface WeatherCardProps {
  cityName: string
  showForecast?: boolean
  enablePolling?: boolean
}


const WeatherCard: React.FC<WeatherCardProps> = ({
  cityName,
  showForecast = true,
  enablePolling = false
}) => {
  const {
    currentWeather,
    currentWeatherLoading,
    currentWeatherError,
    forecast,
    forecastLoading,
    forecastError,
    refetchWeather,
    refetchForecast,
  } = useWeatherData(cityName, {
    enablePolling,
    pollingInterval: 300000,
  })
  

  //載入狀態
  if (showForecast ? forecastLoading : currentWeatherLoading) {
    return (
      <div className={styles.card}>
        <LoadingSpinner 
          message={`載入${showForecast ? '預報' : '天氣'}資料中...`}
          size="medium"
        />
      </div>
    )
  }

  // 錯誤狀態
  if (showForecast ? forecastError : currentWeatherError) {
    return (
      <div className={styles.card}>
        <ErrorFallback 
          error={showForecast ? forecastError : currentWeatherError}
          onRetry={showForecast ? refetchForecast : refetchWeather}
          cityName={cityName}
        />
      </div>
    )
  }

  // 天氣預報顯示 
  if (showForecast && forecast) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
        <h2 className={styles.cityName}>{forecast?.cityName} - 5日預報</h2>
        </div>
        <div className={styles.forecastGrid}>

          { forecast?.forecast.map((day, index) => (
              <ForecastItem 
                key={day.date}
                {...day}
                isToday={index === 0}
              />
          ))}

        </div>
      </div>
    )
  }


  // 即時天氣顯示
  if (currentWeather) {
    // 計算溫度與濕度，確認 currentWeather 存在
    const comfortLevel = getComfortLevel(currentWeather.temperature, currentWeather.humidity)
    
    // 定義 DetailItem內 資料結構
    const weatherInfo = [
      { label: '體感', value: comfortLevel },
      { label: '濕度', value: currentWeather.humidity, unit: '%' },
      { label: '風速', value: currentWeather.windSpeed, unit: ' m/s' },
      { label: '氣壓', value: currentWeather.pressure, unit: ' hPa' }
    ]
    
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.cityName}>{currentWeather.cityName}</h2>
          <div className={styles.lastUpdated}>
            最後更新時間: {formatTime(currentWeather.lastUpdated)}
          </div>
          <div className={styles.description}>
            {currentWeather.description}
          </div>
        </div>

        <div className={styles.weatherDetails}>

          {weatherInfo.map((item, idx) => (
            <DetailItem
              key={idx}
              label={item.label}
              value={item.value}
              unit={item.unit}
            />
          ))}

        </div>

        <button className={styles.refreshButton} onClick={refetchWeather}>
          🔄 重新整理
        </button>

      </div>
    )
  
  }

  return (
    <div className={styles.card}>
      <div className={styles.noData}>暫無天氣資料</div>
    </div>
  )

}

export default WeatherCard