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
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchHistory, setSearchHistory] =useLocalStorage<string[]>('city-search-history', [])
  
  const filteredCities = CITIES.filter( city => 
    city.displayName.includes(searchTerm) || city.name.includes(searchTerm)
  )

  const handleCitySelect = (cityName: string) => {
    onCityChange(cityName)
    setIsDropdownOpen(false)
    setSearchTerm('')
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