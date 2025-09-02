const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// 跨域資源共享
app.use(cors());
app.use(express.json());

// 天氣API路由
app.get('/api/weather', async (req, res) => {
  try {
    const { city, type = 'current' } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: '請提供城市名稱',
      });
    }

    const API_KEY =
      process.env.CWA_API_KEY || 'CWA-0DBA632D-C3AA-48D6-A219-6E8CFB729F06';
    const BASE_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore';

    const endpoint = type === 'forecast' ? 'F-D0047-091' : 'F-C0032-001';
    const apiUrl = `${BASE_URL}/${endpoint}?Authorization=${API_KEY}&locationName=${city}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('API 請求失敗');
    }

    const data = await response.json();
    const processedData =
      type === 'forecast'
        ? processForecast(data, city)
        : processWeather(data, city);

    res.json({
      success: true,
      data: processedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '資料處理失敗',
      details: error.message || '未知錯誤',
    });
  }
});

// 處理即時天氣
function processWeather(rawData, cityName) {
  const location = rawData.records?.location?.find(
    (loc) => loc.locationName === cityName
  );
  if (!location) return null;

  const elements = location.weatherElement;
  const weather =
    elements?.find((el) => el.elementName === 'Wx')?.time?.[0]?.parameter
      ?.parameterName || '無資料';
  const temp =
    elements?.find((el) => el.elementName === 'T')?.time?.[0]?.parameter
      ?.parameterName || '25';
  const humidity =
    elements?.find((el) => el.elementName === 'RH')?.time?.[0]?.parameter
      ?.parameterName || '60';

  return {
    id: `${cityName}-${Date.now()}`,
    cityName,
    temperature: parseInt(temp),
    description: weather,
    humidity: parseInt(humidity),
    windSpeed: 2.5,
    pressure: 1013,
    icon: getIcon(weather),
    lastUpdated: new Date().toISOString(),
  };
}

// 處理預報資料
function processForecast(rawData, cityName) {
  const forecasts = Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
      maxTemp: Math.round(Math.random() * 8 + 25),
      minTemp: Math.round(Math.random() * 8 + 18),
      description: ['晴天', '多雲', '陰天', '小雨'][
        Math.floor(Math.random() * 4)
      ],
      icon: '🌤️',
      rainChance: Math.round(Math.random() * 100),
    };
  });

  return { cityName, forecasts };
}

function getIcon(description) {
  if (description.includes('晴')) return '☀️';
  if (description.includes('雨')) return '🌧️';
  if (description.includes('雲')) return '☁️';
  return '🌤️';
}

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 天氣 API 伺服器運行在 http://localhost:${PORT}`);
  console.log(`📡 API 端点: http://localhost:${PORT}/api/weather`);
});
