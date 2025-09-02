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

    const mappedCity = cityMapping[city] || city;
    const apiUrl = `${BASE_URL}/${endpoint}?Authorization=${API_KEY}&locationName=${mappedCity}`;

    console.log(`🌍 API 請求: ${city} -> ${mappedCity}`);
    console.log(`🔗 URL: ${apiUrl}`);

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
  console.log('🔍 處理天氣資料:', JSON.stringify(rawData, null, 2));

  const location = rawData.records?.location?.find(
    (loc) => loc.locationName === cityName
  );

  if (!location) {
    console.log(`❌ 找不到城市: ${cityName}`);
    console.log(
      '📍 可用城市:',
      rawData.records?.location?.map((loc) => loc.locationName)
    );
    return null;
  }

  console.log('✅ 找到城市:', location.locationName);
  console.log('🌤️ 天氣元素:', location.weatherElement);

  const elements = location.weatherElement;

  // 天氣狀況
  const weatherElement = elements?.find((el) => el.elementName === 'Wx');
  const weather =
    weatherElement?.time?.[0]?.parameter?.parameterName || '無資料';

  // 最高溫度
  const maxTempElement = elements?.find((el) => el.elementName === 'MaxT');
  const maxTemp = maxTempElement?.time?.[0]?.parameter?.parameterName || '25';

  // 最低溫度
  const minTempElement = elements?.find((el) => el.elementName === 'MinT');
  const minTemp = minTempElement?.time?.[0]?.parameter?.parameterName || '20';

  // 降雨機率
  const popElement = elements?.find((el) => el.elementName === 'PoP');
  const pop = popElement?.time?.[0]?.parameter?.parameterName || '0';

  console.log('📊 解析結果:', { weather, maxTemp, minTemp, pop });

  return {
    id: `${cityName}-${Date.now()}`,
    cityName,
    temperature: parseInt(maxTemp), // 使用最高溫度
    description: weather,
    humidity: 60, // 預設值
    windSpeed: 2.5, // 預設值
    pressure: 1013, // 預設值
    icon: getIcon(weather),
    lastUpdated: new Date().toISOString(),
  };
}

// 處理預報資料
function processForecast(rawData, cityName) {
  console.log('🔍 處理預報資料:', JSON.stringify(rawData, null, 2));

  const location = rawData.records?.location?.find(
    (loc) => loc.locationName === cityName
  );

  if (!location) {
    console.log(`❌ 找不到城市: ${cityName}`);
    return { cityName, forecast: [] };
  }

  console.log('✅ 找到城市:', location.locationName);

  // 從實際 API 資料解析預報
  const weatherElement = location.weatherElement?.find(
    (el) => el.elementName === 'Wx'
  );
  const maxTempElement = location.weatherElement?.find(
    (el) => el.elementName === 'MaxT'
  );
  const minTempElement = location.weatherElement?.find(
    (el) => el.elementName === 'MinT'
  );
  const popElement = location.weatherElement?.find(
    (el) => el.elementName === 'PoP'
  );

  if (!weatherElement || !maxTempElement || !minTempElement) {
    console.log('❌ 缺少必要的天氣元素');
    return { cityName, forecast: [] };
  }

  // 建立預報資料
  const forecasts = weatherElement.time.map((timeSlot, index) => {
    const date = new Date(timeSlot.startTime);
    const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

    const maxTemp =
      maxTempElement.time[index]?.parameter?.parameterName || '25';
    const minTemp =
      minTempElement.time[index]?.parameter?.parameterName || '20';
    const weather = timeSlot.parameter?.parameterName || '無資料';
    const rainChance = popElement.time[index]?.parameter?.parameterName || '0';

    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek,
      maxTemp: parseInt(maxTemp),
      minTemp: parseInt(minTemp),
      description: weather,
      icon: getIcon(weather),
      rainChance: parseInt(rainChance),
    };
  });

  console.log('📊 預報結果:', forecasts);
  return { cityName, forecast: forecasts };
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
