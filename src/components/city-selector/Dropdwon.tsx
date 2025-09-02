import { CITIES } from '../../utils/constants'
import styles from './CitySelector.module.scss'

// 城市資料
interface CityData {
  id: string | number
  name: string
  displayName: string
}

// 下拉選單元件 Props
interface DropdownProps {
  isOpen: boolean
  filteredCities: CityData[]
  selectedCity: string
  searchTerm: string
  searchHistory: string[]
  showHistory?: boolean
  onCitySelect: (cityName: string) => void
}



const Dropdown = ({
  isOpen,
  filteredCities,
  selectedCity,
  searchTerm,
  showHistory = false,
  searchHistory,
  onCitySelect
}: DropdownProps) => {
  
  // 如果下拉選單未開啟，則不渲染
  if (!isOpen) return null

  return (
    <div className={styles.dropdown}>
      {/* 城市列表 */}
        {
          filteredCities.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>城市是列表</div>
              {
                filteredCities.map(city => (
                  <div 
                    key={city.id}
                    className={`${styles.cityItem} ${
                      city.name === selectedCity ? styles.selected : ''
                    }`}
                    onClick={() => onCitySelect(city.name)}
                  >
                    <span className={styles.cityName}>{city.displayName}</span>
                    <span className={styles.cityCode}>{city.name}</span>
                  </div>
                ))
              }
            </div>
          )
        }

        {/* 搜尋歷史 */}
        {
          showHistory && searchHistory.length > 0 && searchTerm === '' && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>搜尋歷史</div>
              {
                searchHistory.map((cityName, idx) => {
                  const cityInfo = CITIES.find(city => city.name === cityName)
                  return (
                    <div
                      key={`${cityName}-$`}                        
                      className={`${styles.cityItem} ${styles.historyItem}`}
                      onClick={() => onCitySelect(cityName)}
                    >
                      <span className={styles.cityName}>
                        {cityInfo?.displayName || cityName}
                      </span>
                      <span className={styles.historyTag}>歷史</span>
                    </div>
                  )
                })
              }
              
              {/* 快速選擇按鈕 */}
              <div className={styles.quickSelect}>
                <div className={styles.quickTitle}>快速選擇</div>
                <div className={styles.quickButtons}>
                  {
                    CITIES.slice(0, 6).map( city => (
                      <button
                        key={city.id}
                        className={`${styles.quickButton} ${
                          city.name === selectedCity ? styles.active : ''
                        }`}
                        onClick={() => onCitySelect(city.name)}
                      >
                        {city.displayName}
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>
          )
        }
    </div>
  )
}

export default Dropdown