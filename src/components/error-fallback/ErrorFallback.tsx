import styles from './ErrorFallback.module.scss'

interface ErrorFallbackProps {
  error?: any
  message?: string
  onRetry?: () => void
  cityName?: string
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  message,
  onRetry, // 重新載入
  cityName
}) => {
  const getErrorMessage = (): string => {
    if (message) return message
    if (error?.status === 404) return `找不到 ${cityName || '該城市'} 的天氣資料` 
    if (error?.status === 500) return '伺服器暫時無法回應，請稍後再試'
    return '載入天氣資料時發生錯誤'
  }

  return (
    <div className={styles.container}>
      <div className={styles.errorBox}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorTitle}>載入失敗</div>
        <p className={styles.errorMessage}>{getErrorMessage()}</p>
        {
          onRetry && (
            <button className={styles.retryButton} onClick={onRetry}>🔄 重新載入</button>
          )
        }
      </div>
    </div>
  )
}



export default ErrorFallback