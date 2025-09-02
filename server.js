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

// 城市名稱對應表 - 將簡體字轉換為中央氣象署 API 使用的繁體字
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
    const temperature = location.Temperature?.[0];
    const humidity = location.RelativeHumidity?.[0];
    const windSpeed = location.WindSpeed?.[0];
    const pressure = location.AirPressure?.[0];
    const weather = location.Weather?.[0];

    if (!temperature) {
      console.log('❌ 沒有找到溫度資料');
      return null;
    }

    const tempData = temperature.Time?.[0];
    const tempValue = tempData?.Temperature?.Value || 0;

    const result = {
      city: location.LocationName,
      temperature: tempValue,
      humidity: humidity?.Time?.[0]?.RelativeHumidity?.Value || 60,
      windSpeed: windSpeed?.Time?.[0]?.WindSpeed?.Value || 0,
      pressure: pressure?.Time?.[0]?.AirPressure?.Value || 1013,
      weather: weather?.Time?.[0]?.WeatherDescription || '晴時多雲',
      updateTime: tempData?.StartTime || new Date().toISOString(),
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
    const temperature = location.Temperature;
    const weather = location.Weather;
    const rainChance = location.PoP; // 降雨機率

    if (!temperature || temperature.length === 0) {
      console.log('❌ 沒有找到預報溫度資料');
      return null;
    }

    const forecast = temperature.slice(0, 7).map((temp, index) => {
      const tempData = temp.Time?.[0];
      const weatherData = weather?.[index]?.Time?.[0];
      const rainData = rainChance?.[index]?.Time?.[0];

      return {
        date: tempData?.StartTime || '',
        maxTemp: tempData?.MaxTemperature?.Value || 0,
        minTemp: tempData?.MinTemperature?.Value || 0,
        weather: weatherData?.WeatherDescription || '晴時多雲',
        rainChance: rainData?.PoP?.Value || 0,
      };
    });

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

    // GraphQL 查詢 - 根據類型選擇不同的查詢
    let graphqlQuery;
    if (type === 'forecast') {
      // 7天預報查詢
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
                  MaxTemperature {
                    Value
                    Unit
                  }
                  MinTemperature {
                    Value
                    Unit
                  }
                }
              }
              Weather {
                ElementName
                Time {
                  StartTime
                  EndTime
                  WeatherDescription
                }
              }
              PoP {
                ElementName
                Time {
                  StartTime
                  EndTime
                  PoP {
                    Value
                    Unit
                  }
                }
              }
            }
          }
        }
      `;
    } else {
      // 當前天氣查詢
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
                  Temperature {
                    Value
                    Unit
                  }
                }
              }
              RelativeHumidity {
                ElementName
                Time {
                  StartTime
                  EndTime
                  RelativeHumidity {
                    Value
                    Unit
                  }
                }
              }
              WindSpeed {
                ElementName
                Time {
                  StartTime
                  EndTime
                  WindSpeed {
                    Value
                    Unit
                  }
                }
              }
              AirPressure {
                ElementName
                Time {
                  StartTime
                  EndTime
                  AirPressure {
                    Value
                    Unit
                  }
                }
              }
              Weather {
                ElementName
                Time {
                  StartTime
                  EndTime
                  WeatherDescription
                }
              }
            }
          }
        }
      `;
    }

    console.log(`🔗 GraphQL URL: ${GRAPHQL_URL}`);
    console.log(`🔑 API Key: ${API_KEY}`);

    // 發送 GraphQL 請求
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: API_KEY,
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

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 天氣 API 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🔑 使用 API 金鑰: ${API_KEY}`);
  console.log(`🌐 GraphQL 端點: ${GRAPHQL_URL}`);
});
