// 靜態 API 模擬 - 用於 GitHub Pages 部署
window.mockWeatherAPI = {
  // 模擬即時天氣資料
  getCurrentWeather: (cityName) => {
    const mockData = {
      success: true,
      data: {
        id: `${cityName}-${Date.now()}`,
        cityName: cityName,
        temperature: Math.floor(Math.random() * 15) + 20, // 20-35度
        description: ['晴天', '多雲', '陰天', '小雨'][
          Math.floor(Math.random() * 4)
        ],
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        windSpeed: (Math.random() * 5 + 1).toFixed(1), // 1-6 m/s
        pressure: Math.floor(Math.random() * 20) + 1000, // 1000-1020 hPa
        icon: '🌤️',
        lastUpdated: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return Promise.resolve(mockData);
  },

  // 模擬預報資料
  getForecast: (cityName) => {
    const forecasts = Array.from({ length: 5 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return {
        date: date.toISOString().split('T')[0],
        dayOfWeek: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        maxTemp: Math.floor(Math.random() * 8) + 25,
        minTemp: Math.floor(Math.random() * 8) + 18,
        description: ['晴天', '多雲', '陰天', '小雨'][
          Math.floor(Math.random() * 4)
        ],
        icon: '🌤️',
        rainChance: Math.floor(Math.random() * 100),
      };
    });

    const mockData = {
      success: true,
      data: { cityName, forecasts },
      timestamp: new Date().toISOString(),
    };

    return Promise.resolve(mockData);
  },
};

// 攔截 fetch 請求到 /api 端點
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.startsWith('/api/weather')) {
    const urlObj = new URL(url, window.location.origin);
    const city = urlObj.searchParams.get('city');
    const type = urlObj.searchParams.get('type') || 'current';

    if (type === 'forecast') {
      return window.mockWeatherAPI.getForecast(city).then((data) => ({
        ok: true,
        json: () => Promise.resolve(data),
        status: 200,
        statusText: 'OK',
      }));
    } else {
      return window.mockWeatherAPI.getCurrentWeather(city).then((data) => ({
        ok: true,
        json: () => Promise.resolve(data),
        status: 200,
        statusText: 'OK',
      }));
    }
  }

  return originalFetch.apply(this, arguments);
};

console.log('🌤️ 天氣 API 模擬已載入 - 適用於 GitHub Pages 部署');
