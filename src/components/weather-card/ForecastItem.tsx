import { formatTime } from '../../utils/weatherUtils'
import styles from '../weather-card/WeatherCard.module.scss'

interface ForecastItemProps {
  date: string
  dayOfWeek: string
  icon: string
  maxTemp: number
  minTemp: number
  description: string
  rainChance: number
  isToday: boolean
} 

const ForecastItem: React.FC<ForecastItemProps> = ({ 
   date,
   dayOfWeek, 
   icon, 
   maxTemp, 
   minTemp, 
   description, 
   rainChance,
   isToday 
  }) => {
    return (
      <div className={styles.forecastItem}>
        <div className={styles.forecastDate}>
          {isToday ? '今天' : `星期${dayOfWeek}`} {formatTime(date)}
        </div>
        <div className={styles.forecastIcon}>{icon}</div>
        <div className={styles.forecastTemp}>
          {maxTemp}° / {minTemp}°
        </div>
        <div className={styles.forecastDesc}>{description}</div>
        <div className={styles.forecastRain}>🌧️ {rainChance}%</div>
      </div>
    )
  }

export default ForecastItem