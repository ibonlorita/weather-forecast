import { useState, useEffect } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { CITIES } from '../../utils/constants'
import styles from './CitySelector.module.scss' 

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (cityName: string) => void
  showHistory?: boolean
}


const CitySelector = ({ selectedCity, onCityChange, showHistory = false }: CitySelectorProps) => {
  // 搜尋關鍵字
  const [searchTerm, setSearchTerm] = useState('')
  // 下拉選單開關
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  // 搜尋歷史
  const [searchHistory, setSearchHistory] =useLocalStorage<string[]>('city-search-history', [])
  // 過濾城市
  const filteredCities = CITIES.filter( city => 
    city.displayName.includes(searchTerm) || city.name.includes(searchTerm)
  )

  // 城市的選擇（事件處理）
  const handleCitySelect = (cityName: string) => {
    onCityChange(cityName) 
    setIsDropdownOpen(false)
    setSearchTerm('') // 清空搜尋關鍵字

    // 重新搜尋歷史，最多保留五筆
    if (!searchHistory.includes(selectedCity)) {
      const newHistory = [cityName, ...searchHistory.slice(0, 4)]
      setSearchHistory(newHistory)
    }
  }

  // 搜尋輸入處理
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setIsDropdownOpen(true)
  }

  // 點擊其他地方，下拉選單則關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(`.${styles.container}`)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside) // 綁定事件
    return () => document.removeEventListener('mousedown', handleClickOutside) // 清理事件
  }, []) 

  // 當前城市顯示邏輯
  const currentCityDisplay = CITIES.find(city => city.name === selectedCity)?.displayName || selectedCity
  
  
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>選擇城市</h3>

      {/* 搜尋輸入匡 */}
      <div className={styles.searchBox}>
        <input 
          type="text"
          placeholder={`目前: ${currentCityDisplay}`}
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownOpen(true)}
        />
        <span className={styles.searchIcon}>
          🔍
        </span>
      </div>
      
      {/* 下拉選單 */}
      {isDropdownOpen && (
        <div className={styles.dropdown}>
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
                      onClick={() => handleCitySelect(city.name)}
                    >
                      <span className={styles.cityName}>{city.displayName}</span>
                      <span className={styles.cityCode}>{city.name}</span>
                    </div>
                  ))
                }
              </div>
            )}

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
                          onClick={() => handleCitySelect(cityName)}
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
                            onClick={() => handleCitySelect(city.name)}
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
      )}
    </div>
  )
}

export default CitySelector