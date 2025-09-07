const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// 啟用 CORS
app.use(cors());
app.use(express.json());

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

// ✅ 修正：處理當前天氣資料（使用正確的資料結構）
function processWeatherData(graphqlData) {
  console.log(
    '🔍 處理 GraphQL 天氣資料:',
    JSON.stringify(graphqlData, null, 2)
  );

  try {
    const locations = graphqlData?.data?.forecast?.Locations;
    if (!locations || locations.length === 0) {
      console.log('❌ 沒有找到地點資料');
      return null;
    }

    const location = locations[0];
    console.log('🏙️ 處理地點:', location.LocationName);

    // ✅ 修正：根據 Schema 正確解析資料
    const temperature =
      location.Temperature?.[0]?.Time?.[0]?.Temperature || '0';
    const weather = location.Weather?.[0]?.Time?.[0]?.Weather || '晴時多雲';
    const windSpeed = location.WindSpeed?.[0]?.Time?.[0]?.WindSpeed || '0';

    // 濕度和氣壓可能沒有，使用預設值
    const humidity = 60; // GraphQL 中可能沒有濕度資料
    const pressure = 1013; // GraphQL 中可能沒有氣壓資料

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

// ✅ 修正：處理預報資料
function processForecastData(graphqlData) {
  console.log(
    '🔍 處理 GraphQL 預報資料:',
    JSON.stringify(graphqlData, null, 2)
  );

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

    // 取前7天的資料
    const forecast = [];
    const maxDays = Math.min(7, temperatureData.length);

    for (let i = 0; i < maxDays; i++) {
      const tempTime = temperatureData[i]?.Time?.[0];
      const weatherTime = weatherData[i]?.Time?.[0];
      const popTime = popData[i]?.Time?.[0];

      forecast.push({
        date: tempTime?.StartTime || '',
        maxTemp: parseFloat(tempTime?.Temperature) || 0,
        minTemp: parseFloat(tempTime?.Temperature) || 0, // GraphQL 可能沒有分最高最低溫
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

// ✅ 修正：天氣 API 端點
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

    // ✅ 修正：根據官方範例的正確 GraphQL 查詢
    let graphqlQuery;
    if (type === 'forecast') {
      // 7天預報查詢（根據 Schema）
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
      // 當前天氣查詢（簡化版）
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

    console.log(`🔗 GraphQL URL: ${GRAPHQL_URL}`);
    console.log(`🔑 API Key: ${API_KEY}`);

    // ✅ 修正：使用 URL 參數方式傳遞 Authorization（根據 curl 範例）
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
    console.log('📡 GraphQL 回應:', JSON.stringify(data, null, 2));

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
  });
});

// ✅ 新增：測試 GraphQL 連線的端點
app.get('/api/test-graphql', async (req, res) => {
  try {
    // 簡單的測試查詢
    const testQuery = `
      query test {
        forecast(LocationName: "臺北市") {
          Locations {
            LocationName
            Geocode
          }
        }
      }
    `;

    const urlWithAuth = `${GRAPHQL_URL}?Authorization=${API_KEY}`;

    const response = await fetch(urlWithAuth, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: testQuery,
      }),
    });

    const data = await response.json();

    res.json({
      success: response.ok,
      status: response.status,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 天氣 API 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🔑 使用 API 金鑰: ${API_KEY}`);
  console.log(`🌐 GraphQL 端點: ${GRAPHQL_URL}`);
  console.log(`🧪 測試端點: http://localhost:${PORT}/api/test-graphql`);
});
