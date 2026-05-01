import Link from 'next/link';
// Xóa luôn cái import FooterAiPlayLink đi nhé bác, Pikachu làm gì có AI đánh cờ
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          {/* CỘT 1: THƯƠNG HIỆU */}
          <div className={styles.brandCol}>
            <h2 className={styles.logo}>
              Pikachu<span>.online</span>
            </h2>
            <p className={styles.slogan}>
              Nền tảng chơi game Pikachu (Onet Connect Animal) trực tuyến miễn
              phí, mượt mà và tối ưu đa nền tảng nhất hiện nay. Nơi hội tụ ký ức
              tuổi thơ của hàng triệu game thủ.
            </p>
          </div>

          {/* CỘT 2: KHÁM PHÁ CÁC THEME (SEO INTERNAL LINKS) */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Khám Phá</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/">Pikachu Pokemon</Link>
              </li>
              <li>
                <Link href="/pikachu-co-dien-2003">Pikachu Cổ Điển 2003</Link>
              </li>
              <li>
                <Link href="/pikachu-hoa-qua">Pikachu Hoa Quả</Link>
              </li>
              <li>
                <Link href="/pikachu-dong-vat">Pikachu Động Vật</Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: THEME MỞ RỘNG & TÍNH NĂNG */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Thử Thách</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/pikachu-do-an">Pikachu Đồ Ăn</Link>
              </li>
              <li>
                <Link href="/pikachu-banh-keo">Pikachu Bánh Kẹo</Link>
              </li>
              <li>
                <Link href="/pikachu-emoji">Pikachu Emoji</Link>
              </li>
              <li>
                <Link href="/pikachu-mat-chuoc">Pikachu Mạt Chược</Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: HỖ TRỢ & CỘNG ĐỒNG */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Hỗ Trợ</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/lien-he">Góp Ý / Báo Lỗi</Link>
              </li>
              <li>
                <Link href="/dieu-khoan">Điều Khoản Sử Dụng</Link>
              </li>
              <li>
                <Link href="/bao-mat">Chính Sách Bảo Mật</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* PHẦN ĐÁY DƯỚI CÙNG */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            &copy; {currentYear} Pikachu.online. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
