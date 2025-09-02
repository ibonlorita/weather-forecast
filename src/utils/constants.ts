import { City } from "../types/weather";

export const CITIES: City[] = [
  {id: 'taipei', name: '臺北市', displayName: '台北市'},
  {id: 'newTaipei', name: '新北市', displayName: '新北市'},
  {id: 'taoyuan', name: '桃園市', displayName: '桃園市'},
  {id: 'hsinchu', name: '新竹市', displayName: '新竹市'},
  {id: 'taichung', name: '台中市', displayName: '台中市'},
  {id: 'changhuaCounty', name: '彰化縣', displayName: '彰化縣'},
  {id: 'nantouCounty', name: '南投縣', displayName: '南投縣'},
  {id: 'yunlinCounty', name: '雲林縣', displayName: '雲林縣'},
  {id: 'chiayiCounty', name: '嘉義縣', displayName: '嘉義縣'},
  {id: 'chiayiCity', name: '嘉義市', displayName: '嘉義市'},
  {id: 'tainan', name: '台南市', displayName: '台南市'},
  {id: 'kaohsiung', name: '高雄市', displayName: '高雄市'},
  {id: 'pingtungCounty', name: '屏東縣', displayName: '屏東縣'},
  {id: 'yilanCounty', name: '宜蘭縣', displayName: '宜蘭縣'},
  {id: 'hualienCounty', name: '花蓮縣', displayName: '花蓮縣'},
  {id: 'taitungCounty', name: '台東縣', displayName: '台東縣'},
  {id: 'penghuCounty', name: '澎湖縣', displayName: '澎湖縣'},
  {id: 'kinmenCounty', name: '金門縣', displayName: '金門縣'},
  {id: 'lienchiangCounty', name: '連江縣', displayName: '連江縣'},
]

export const API_CONFIG = {
  POLLING_INTERVAL: 300000, // 5分鐘
  CACHE_TIME: 600000, // 10分鐘
}