import { useState } from 'react'

export const useLocalStorage = <T>(
  key: string,
  initialValue: T // 預設值
): [T, (value: T | ((prev: T) => T)) => void] => {

  // 初始值從 localStorage 中獲取
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      // 嘗試從 localStorage 中獲取值
      const item = window.localStorage.getItem(key)
      // 如果有資料就解析 JSON, 沒有就用預設值
      return item ? JSON.parse(item) : initialValue
    
    } catch {
      // 如果解析失敗（資料損壞）,回傳預設值
      return initialValue

    }
  })

  // 設定新值的函數
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // 處理函數式的更新, 像是setState 的 callback 形式
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // 更新 React 狀態
      setStoredValue(valueToStore)
      // 同步寫入 localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    }
    // 儲存失敗，顯示警告但不中斷應用程式
    catch(error) {
      console.error('localStorage 儲存失敗:', error)
    }
  }
  // 回傳狀態值 和 設定的函數
  return [storedValue, setValue]
}