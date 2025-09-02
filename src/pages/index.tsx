// 首頁元件
import React, { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '../store'
import WeatherCard from '../components/weather-card/WeatherCard'
import CitySelector from '../components/city-selector/CitySelector'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { CITIES } from '../utils/constants'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useLocalStorage<string>('selected-city', '臺北市')
  const [viewMode, setViewMode] = useState<'current' | 'forecast'>('current')
  const [isPollingEnabled, setIsPollingEnabled] = useState(true)

  // 檢查城市名稱有效性
  useEffect(() => {
    const isValidCity = CITIES.some(city => city.name === selectedCity)
    if (!isValidCity) {
      setSelectedCity('臺北市')
    }
  }, [selectedCity, setSelectedCity])

  // 處理城市變更
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
  }

  // 處理檢視模式切換
  const handleViewModeChange = (mode: 'current' | 'forecast') => {
    setViewMode(mode)
  }

  // 切換自動更新
  const togglePolling = () => {
    setIsPollingEnabled(prev => !prev)
  }

  return (
    <Provider store={store}>
      <div className={styles.container}>
        {/* 頁面標題 */}
        <header className={styles.header}>
          <h1 className={styles.title}>🌤️ 智能天氣預報</h1>
          <p className={styles.subtitle}>
            即時天氣資料 • RTK Query • TypeScript
          </p>
          
          {/* API狀態指示器 */}
          <div className={styles.apiStatus}>
            <span className={styles.statusDot}></span>
            中央氣象署官方API
          </div>
        </header>

        {/* 主要內容區域 */}
        <main className={styles.main}>
          <div className={styles.layout}>
            
            {/* 左側：城市選擇器 */}
            <aside className={styles.sidebar}>
              <CitySelector
                selectedCity={selectedCity}
                onCityChange={handleCityChange}
                showHistory={true}
              />

              {/* 控制面板 */}
              <div className={styles.controlPanel}>
                <h4 className={styles.controlTitle}>顯示設定</h4>
                
                {/* 檢視模式切換 */}
                <div className={styles.viewModeToggle}>
                  <button
                    className={`${styles.toggleButton} ${
                      viewMode === 'current' ? styles.active : ''
                    }`}
                    onClick={() => handleViewModeChange('current')}
                  >
                    📍 即時天氣
                  </button>
                  <button
                    className={`${styles.toggleButton} ${
                      viewMode === 'forecast' ? styles.active : ''
                    }`}
                    onClick={() => handleViewModeChange('forecast')}
                  >
                    📅 5日預報
                  </button>
                </div>

                {/* 自動更新切換 */}
                <div className={styles.pollingToggle}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={isPollingEnabled}
                      onChange={togglePolling}
                      className={styles.toggleCheckbox}
                    />
                    <span className={styles.toggleSlider}></span>
                    自動更新 (5分鐘)
                  </label>
                </div>

                {/* 當前選擇資訊 */}
                <div className={styles.currentInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>當前城市:</span>
                    <span className={styles.infoValue}>
                      {CITIES.find(city => city.name === selectedCity)?.displayName || selectedCity}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>顯示模式:</span>
                    <span className={styles.infoValue}>
                      {viewMode === 'current' ? '即時天氣' : '5日預報'}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* 右側：天氣資訊 */}
            <section className={styles.content}>
              <WeatherCard
                cityName={selectedCity}
                showForecast={viewMode === 'forecast'}
                enablePolling={isPollingEnabled}
              />

              {/* 技術資訊卡片 */}
              <div className={styles.additionalInfo}>
                <div className={styles.infoCard}>
                  <h4>🔧 技術特色</h4>
                  <ul>
                    <li>RTK Query 自動快取管理</li>
                    <li>TypeScript 完整型別支援</li>
                    <li>Vercel API Routes 代理</li>
                    <li>響應式設計與錯誤處理</li>
                  </ul>
                </div>

                <div className={styles.infoCard}>
                  <h4>📊 資料來源</h4>
                  <p>
                    本應用使用<strong>中央氣象署開放資料平台</strong>提供的即時天氣資訊，
                    透過自建API代理解決CORS跨域問題，確保資料的即時性與準確性。
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* 頁腳 */}
        <footer className={styles.footer}>
          <p>
            資料來源：中央氣象署開放資料平台 | 
            技術棧：React 18 + RTK Query + TypeScript + Vercel
          </p>
          <p className={styles.footerNote}>
            本專案為學習展示用途，展現現代前端開發技術整合能力
          </p>
        </footer>
      </div>
    </Provider>
  )
}

export default HomePage