// server.js - 修正版本（適用於 GitHub Pages + Render 部署）

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ 修正：設定正確的 CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ibonlorita.github.io', // 你的 GitHub Pages 網域
    'https://weather-forecast-ibonlorita.pages.dev', // 如果使用 Cloudflare Pages
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// 額外的 CORS 處理中介軟體
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// 中央氣象局 GraphQL API 設定
const API_KEY =
  process.env.CWA_API_KEY || 'CWA-4AA1B522-C0F7-4BD7-9F6E-5205915A438F';
const GRAPHQL_URL = 'https://opendata.cwa.gov.tw/linked/graphql';

// 城市名稱對應表
const cityMapping = {
  台北市: '臺北市',
  新北市: '新北市',
  桃園市: '桃園市',
  新竹市: '新竹市',
  台中市: '臺中市',
  彰化縣: '彰化縣',
  南投縣: '南投縣',
  雲林縣: '雲林縣',
  嘉義縣: '嘉義縣',
  嘉義市: '嘉義市',
  台南市: '臺南市',
  高雄市: '高雄市',
  屏東縣: '屏東縣',
  宜蘭縣: '宜蘭縣',
  花蓮縣: '花蓮縣',
  台東縣: '臺東縣',
  澎湖縣: '澎湖縣',
  金門縣: '金門縣',
  連江縣: '連江縣',
};

// 處理當前天氣資料
function processWeatherData(graphqlData) {
  console.log('🔍 處理 GraphQL 天氣資料');

  try {
    const locations = graphqlData?.data?.forecast?.Locations;
    if (!locations || locations.length === 0) {
      console.log('❌ 沒有找到地點資料');
      return null;
    }

    const location = locations[0];
    console.log('🏙️ 處理地點:', location.LocationName);

    const temperature =
      location.Temperature?.[0]?.Time?.[0]?.Temperature || '0';
    const weather = location.Weather?.[0]?.Time?.[0]?.Weather || '晴時多雲';
    const windSpeed = location.WindSpeed?.[0]?.Time?.[0]?.WindSpeed || '0';

    const humidity = 60;
    const pressure = 1013;

    const result = {
      city: location.LocationName,
      temperature: parseFloat(temperature) || 0,
      humidity: humidity,
      windSpeed: parseFloat(windSpeed) || 0,
      pressure: pressure,
      weather: weather,
      updateTime:
        location.Temperature?.[0]?.Time?.[0]?.StartTime ||
        new Date().toISOString(),
    };

    console.log('✅ 處理後的天氣資料:', result);
    return result;
  } catch (error) {
    console.error('❌ 處理天氣資料時發生錯誤:', error);
    return null;
  }
}

// 處理預報資料
function processForecastData(graphqlData) {
  console.log('🔍 處理 GraphQL 預報資料');

  try {
    const locations = graphqlData?.data?.forecast?.Locations;
    if (!locations || locations.length === 0) {
      console.log('❌ 沒有找到預報地點資料');
      return null;
    }

    const location = locations[0];
    const temperatureData = location.Temperature || [];
    const weatherData = location.Weather || [];
    const popData = location.ProbabilityOfPrecipitation || [];

    const forecast = [];
    const maxDays = Math.min(7, temperatureData.length);

    for (let i = 0; i < maxDays; i++) {
      const tempTime = temperatureData[i]?.Time?.[0];
      const weatherTime = weatherData[i]?.Time?.[0];
      const popTime = popData[i]?.Time?.[0];

      forecast.push({
        date: tempTime?.StartTime || '',
        maxTemp: parseFloat(tempTime?.Temperature) || 0,
        minTemp: parseFloat(tempTime?.Temperature) || 0,
        weather: weatherTime?.Weather || '晴時多雲',
        rainChance: parseFloat(popTime?.ProbabilityOfPrecipitation) || 0,
      });
    }

    console.log('✅ 處理後的預報資料:', forecast);
    return forecast;
  } catch (error) {
    console.error('❌ 處理預報資料時發生錯誤:', error);
    return null;
  }
}

// 天氣 API 端點
app.get('/api/weather', async (req, res) => {
  try {
    const { city, type } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: '請提供城市名稱',
      });
    }

    const mappedCity = cityMapping[city] || city;
    console.log(`🌍 API 請求: ${city} -> ${mappedCity}`);
    console.log(`📊 請求類型: ${type}`);

    let graphqlQuery;
    if (type === 'forecast') {
      graphqlQuery = `
        query forecast($city: String!) {
          forecast(LocationName: $city) {
            Locations {
              LocationName
              Geocode
              Latitude
              Longitude
              Temperature {
                ElementName
                Time {
                  StartTime
                  EndTime
                  Temperature
                }
              }
              Weather {
                ElementName
                Time {
                  StartTime
                  EndTime
                  Weather
                  WeatherCode
                }
              }
              ProbabilityOfPrecipitation {
                ElementName
                Time {
                  StartTime
                  EndTime
                  ProbabilityOfPrecipitation
                }
              }
            }
          }
        }
      `;
    } else {
      graphqlQuery = `
        query forecast($city: String!) {
          forecast(LocationName: $city) {
            Locations {
              LocationName
              Geocode
              Latitude
              Longitude
              Temperature {
                ElementName
                Time {
                  StartTime
                  EndTime
                  Temperature
                }
              }
              Weather {
                ElementName
                Time {
                  StartTime
                  EndTime
                  Weather
                  WeatherCode
                }
              }
              WindSpeed {
                ElementName
                Time {
                  StartTime
                  EndTime
                  WindSpeed
                  BeaufortScale
                }
              }
            }
          }
        }
      `;
    }

    const urlWithAuth = `${GRAPHQL_URL}?Authorization=${API_KEY}`;

    const response = await fetch(urlWithAuth, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { city: mappedCity },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('❌ GraphQL 錯誤:', data.errors);
      return res.status(500).json({
        success: false,
        message: 'GraphQL 查詢錯誤',
        errors: data.errors,
      });
    }

    let processedData;
    if (type === 'forecast') {
      processedData = processForecastData(data);
    } else {
      processedData = processWeatherData(data);
    }

    if (!processedData) {
      return res.status(404).json({
        success: false,
        message: '無法處理天氣資料',
      });
    }

    res.json({
      success: true,
      data: processedData,
    });
  } catch (error) {
    console.error('❌ API 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤',
      error: error.message,
    });
  }
});

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '天氣 API 服務正常運行',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors_origins: corsOptions.origin,
  });
});

// 根路徑
app.get('/', (req, res) => {
  res.json({
    message: '🌤️ 台灣天氣預報 API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      weather: '/api/weather?city=臺北市',
      forecast: '/api/weather?city=臺北市&type=forecast',
    },
    frontend: 'https://ibonlorita.github.io/weather-forecast/',
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 天氣 API 伺服器運行在 port ${PORT}`);
  console.log(`🔑 使用 API 金鑰: ${API_KEY}`);
  console.log(`🌐 GraphQL 端點: ${GRAPHQL_URL}`);
  console.log(`🔒 CORS 允許的來源:`, corsOptions.origin);
});
