import styles from './SectionDivider.module.css';

export default function SectionDivider() {
  return (
    <div className={styles.dividerWrapper}>
      {/* Đường kẻ mờ bên trái */}
      <div className={styles.lineLeft}></div>

      {/* Họa tiết ở giữa (Bác có thể thay bằng icon quân cờ nếu thích) */}
      <div className={styles.ornament}>♦</div>

      {/* Đường kẻ mờ bên phải */}
      <div className={styles.lineRight}></div>
    </div>
  );
}
