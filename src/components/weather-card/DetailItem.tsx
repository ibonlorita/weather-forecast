import styles from './WeatherCard.module.scss'

interface DetailItemProps {
  label: string
  value: string | number
  unit?: string
}


const DetailItem = ({label, value, unit = ''}: DetailItemProps) => {
  return (
    <div className={styles.detailItem}>
      <div className={styles.detailLabel}>{label}</div>
      <div className={styles.detailValue}>{value}{unit}</div>
    </div>
  )

}

export default DetailItem