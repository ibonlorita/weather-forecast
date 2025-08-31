// Redux Store 設定
// 匯入 Redux Toolkit 的 store 設定函數
import { configureStore } from '@reduxjs/toolkit'
// 匯入我們定義的天氣 API
import { weatherApi } from './weatherApi'

// 建立 Redux store
export const store = configureStore({
  reducer: {
    // 將 weatherApi 的 reducer 加入到 store 中
    // 使用動態屬性名稱，等於 weatherApi: weatherApi.reducer
    [weatherApi.reducerPath]: weatherApi.reducer,
  },
  // 設定中介軟體（middleware）
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()                  // 取得預設的中介軟體
      .concat(weatherApi.middleware),       // 加入 RTK Query 的中介軟體，處理快取和請求
})

// 匯出型別定義，供 TypeScript 使用
export type RootState = ReturnType<typeof store.getState>     // 整個 state 的型別
export type AppDispatch = typeof store.dispatch               // dispatch 函數的型別