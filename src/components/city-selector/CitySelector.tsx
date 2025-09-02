import { useState, useEffect } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { CITIES } from '../../utils/constants'
import Dropdown from './Dropdown'
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
  // 根據搜尋關鍵字過濾城市列表
  const filteredCities = CITIES.filter( city => 
    city.displayName.includes(searchTerm) || city.name.includes(searchTerm)
  )
  console.log('CITIES:', CITIES) // 檢查 CITIES 常數
  console.log('filteredCities:', filteredCities, 'searchTerm:', searchTerm) // 檢查過濾結果

  // 城市的選擇邏輯（事件處理）
  const handleCitySelect = (cityName: string) => {
    onCityChange(cityName) 
    setIsDropdownOpen(false)
    setSearchTerm('') // 清空搜尋關鍵字

    // 重新搜尋歷史，最多保留五筆
    if (!searchHistory.includes(cityName)) {
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
      // 檢查點擊是否發生在元件容器外
      if (!target.closest(`.${styles.container}`)) {
        setIsDropdownOpen(false)
      }
    }
    // 綁定滑鼠按下事件監聽
    document.addEventListener('mousedown', handleClickOutside) 
    // 移除事件監聽避免記憶體洩漏（清理函數）
    return () => document.removeEventListener('mousedown', handleClickOutside) 
  }, []) 

  // 當前城市的顯示名稱
  const currentCityDisplay = CITIES.find(city => city.name === selectedCity)?.displayName || selectedCity
  console.log('currentCityDisplay', currentCityDisplay, 'selectedCity', selectedCity) // 除錯用
  
  
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>選擇城市</h3>
      
      {/* 狀態顯示 */}
      <div style={{ 
        fontSize: '14px', 
        color: 'white', 
        marginBottom: '10px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '5px'
      }}>
        <strong>狀態檢查:</strong><br/>
        • 下拉選單: {isDropdownOpen ? '✅ 開啟' : '❌ 關閉'}<br/>
        • 城市數量: {CITIES.length}<br/>
        • 搜尋詞: "{searchTerm}"<br/>
        • 過濾結果: {filteredCities.length} 個城市
      </div>
      
      {/* 測試按鈕 */}
      {/* <button 
        onClick={() => {
          console.log('Test button clicked')
          console.log('CITIES:', CITIES)
          console.log('isDropdownOpen:', isDropdownOpen)
          setIsDropdownOpen(!isDropdownOpen)
        }}
        style={{ 
          marginBottom: '10px', 
          padding: '5px 10px', 
          fontSize: '12px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        測試下拉選單 (CITIES: {CITIES.length})
      </button> */}
      
      {/* 簡單測試顯示 */}
      {/* <div style={{ 
        backgroundColor: 'yellow', 
        color: 'black', 
        padding: '10px', 
        marginBottom: '10px',
        fontSize: '14px'
      }}>
        <strong>簡單測試:</strong><br/>
        • 點擊紅色按鈕後，這個黃色區塊應該會顯示<br/>
        • 如果黃色區塊可見，說明組件正常渲染<br/>
        • 如果看不到黃色區塊，說明有樣式問題
      </div> */}
      
      {/* 搜尋輸入匡 */}
      <div className={styles.searchBox}>
        <input 
          type="text"
          placeholder={`目前: ${currentCityDisplay}`}
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => {
            setIsDropdownOpen(true)
          }}
          onClick={() => {
            setIsDropdownOpen(true)
          }}
        />
        <span className={styles.searchIcon}>
          🔍
        </span>
      </div>
      
      {/* 下拉選單 */}
      <Dropdown 
        isOpen={isDropdownOpen}
        filteredCities={filteredCities}
        selectedCity={selectedCity}
        searchTerm={searchTerm}
        showHistory={showHistory}
        searchHistory={searchHistory}
        onCitySelect={handleCitySelect}
      />
    </div>
  )
}

export default CitySelector