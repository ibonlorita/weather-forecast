import { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import WeatherCard from './components/weather-card/WeatherCard'
import CitySelector from './components/city-selector/CitySelector'
import { useLocalStorage } from './hooks/useLocalStorage'
import { CITIES } from './utils/constants'
import './App.scss'

const App: React.FC = () => {
  
  const [selectedCity, setSelectedCity] = useLocalStorage<string>('selected-city', '臺北市')
  
  // 管理檢視模式：即時天氣 vs 5日預報
  const [viewMode, setViewMode] = useState<'current' | 'forecast'>('current')
  
  // 管理自動更新功能的開關
  const [isPollingEnabled, setIsPollingEnabled] = useState(true)

  
  // 檢查所選城市是否為有效城市
  useEffect(() => {
    // 使用 some() 方法檢查 CITIES 陣列中是否存在符合條件的城市
    const isValidCity = CITIES.some(city => city.name === selectedCity)
    
    // 如果選中的城市無效，重設為預設城市
    if (!isValidCity) {
      setSelectedCity('臺北市')
    }
  }, [selectedCity, setSelectedCity])



  
  // 處理城市變更的回調
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    // 因為使用 useLocalStorage，這裡會自動同步到瀏覽器的本地儲存
  }

  // 處理檢視模式切換
  const handleViewModeChange = (mode: 'current' | 'forecast') => {
    setViewMode(mode)
  }

  const togglePolling = () => {
    setIsPollingEnabled(prev => {
      return !prev
    })
  }

  // 取得當前城市的顯示名稱
  const currentCityDisplay = CITIES.find(city => city.name === selectedCity)?.displayName || selectedCity


  return (
    <Provider store={store}>
      <div className="app-container">
        
        <header className="app-header">
          <h1 className="app-title">🌤️ 天氣預報</h1>
          <p className="app-subtitle">
            即時天氣資料 • RTK Query • TypeScript
          </p>
          
          <div className="api-status">
            <span className="status-dot"></span>
            中央氣象署官方API
          </div>
        </header>

        <main className="app-main">
          <div className="app-layout">
            
            {/* 左側邊欄：城市選擇與控制面板 */}
            <aside className="app-sidebar">
              
              {/* 城市選擇器元件 */}
              <CitySelector
                selectedCity={selectedCity}       
                onCityChange={handleCityChange}   
                showHistory={true}                 
              />

              <div className="control-panel">
                <h4 className="control-title">顯示設定</h4>
                
                <div className="view-mode-toggle">
                  <button
                    className={`toggle-button ${
                      viewMode === 'current' ? 'active' : ''
                    }`}

                    onClick={() => handleViewModeChange('current')}
                  >
                    📍 即時天氣
                  </button>
                  <button
                    className={`toggle-button ${
                      viewMode === 'forecast' ? 'active' : ''
                    }`}
                    onClick={() => handleViewModeChange('forecast')}
                  >
                    📅 5日預報
                  </button>
                </div>

                {/* 自動更新切換開關 */}
                <div className="polling-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={isPollingEnabled}        // 受控組件：綁定狀態
                      onChange={togglePolling}          // 狀態變更處理
                      className="toggle-checkbox"
                    />
                    <span className="toggle-slider"></span>
                    自動更新 (5分鐘)
                  </label>
                </div>

                {/* 當前選擇資訊顯示 */}
                <div className="current-info">
                  <div className="info-item">
                    <span className="info-label">當前城市:</span>
                    <span className="info-value">{currentCityDisplay}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">顯示模式:</span>
                    <span className="info-value">
                      {viewMode === 'current' ? '即時天氣' : '5日預報'}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* 右側內容區：天氣資訊顯示 */}
            <section className="app-content">
              
              {/* 天氣卡片元件 */}
              <WeatherCard
                cityName={selectedCity}                      // 傳入城市名稱
                showForecast={viewMode === 'forecast'}       // 根據檢視模式決定顯示內容
                enablePolling={isPollingEnabled}             // 啟用自動更新
              />

              {/* 技術資訊展示卡片 */}
              <div className="additional-info">
                <div className="info-card">
                  <h4>🔧 技術特色</h4>
                  <ul>
                    <li>RTK Query 自動快取管理</li>
                    <li>TypeScript 完整型別支援</li>
                    <li>Vercel API Routes 代理</li>
                    <li>響應式設計與錯誤處理</li>
                  </ul>
                </div>

                <div className="info-card">
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


        <footer className="app-footer">
          <p>
            資料來源：中央氣象署開放資料平台 | 
            技術棧：React 18 + RTK Query + TypeScript + Vercel
          </p>
          <p className="footer-note">
            本專案為學習展示用途，展現現代前端開發技術整合能力
          </p>
        </footer>
      </div>
    </Provider>
  )
}

export default App