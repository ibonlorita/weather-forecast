import { City } from "../types/weather";

export const CITYES: City[] = [
  {id: 'taipei', name: '台北', displayName: '台北市'},
  {id: 'newTaipei', name: '新北', displayName: '新北市'},
  {id: 'taoyuan', name: '桃園', displayName: '桃園市'},
  {id: 'hsinchu', name: '新竹', displayName: '新竹市'},
  {id: 'taichung', name: '台中', displayName: '台中市'},
  {id: 'changhuaCounty', name: '彰化', displayName: '彰化縣'},
  {id: 'nantouCounty', name: '南投', displayName: '南投縣'},
  {id: 'yunlinCounty', name: '雲林', displayName: '雲林縣'},
  {id: 'chiayiCounty', name: '嘉義', displayName: '嘉義縣'},
  {id: 'chiayiCity', name: '嘉義市', displayName: '嘉義市'},
  {id: 'tainan', name: '台南', displayName: '台南市'},
  {id: 'kaohsiung', name: '高雄', displayName: '高雄市'},
  {id: 'pingtungCounty', name: '屏東', displayName: '屏東縣'},
  {id: 'yilanCounty', name: '宜蘭', displayName: '宜蘭縣'},
  {id: 'hualienCounty', name: '花蓮', displayName: '花蓮縣'},
  {id: 'taitungCounty', name: '台東', displayName: '台東縣'},
  {id: 'penghuCounty', name: '澎湖', displayName: '澎湖縣'},
  {id: 'kinmenCounty', name: '金門', displayName: '金門縣'},
  {id: 'lienchiangCounty', name: '連江', displayName: '連江縣'},
]

export const API_CONFIG = {
  POLLING_INTERVAL: 300000, // 5分鐘
  CACHE_TIME: 600000, // 10分鐘
}