import { useState } from 'react'
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
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
  }

  }
  
  
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        選擇城市
      </h3>

    </div>

  )

}

export default CitySelector