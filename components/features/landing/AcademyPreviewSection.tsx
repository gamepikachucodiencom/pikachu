'use client';

import { useRouter } from 'next/navigation';
import styles from './AcademyPreviewSection.module.css';
import Link from 'next/link';

// Dữ liệu mô phỏng cho "Học Viện Kỳ Thủ"
const academyItems = [
  {
    id: 1,
    title: 'Phá Giải Thất Tinh Tụ Hội',
    excerpt:
      'Một trong tứ đại danh cục của cờ thế giang hồ. Cầm Đỏ đi trước, làm sao để thủ hòa hoặc lật ngược thế cờ trước sức ép ngàn cân?',
    image: '/assets/web/puzzle-1.png', // Bác tìm ảnh cờ thế ghép vào nhé
    tag: 'CỜ THẾ',
    tagColor: '#d32f2f', // Màu đỏ
    action: 'Vào Giải Ngay ➔',
  },
  {
    id: 2,
    title: 'Bí Kíp Pháo Đầu Phá Bình Phong Mã',
    excerpt:
      'Khóa học tương tác từng nước đi. Nắm vững đòn công sát chí mạng của Pháo Đầu khi đối đầu với trận pháp phòng ngự kiên cố nhất.',
    image: '/assets/web/lesson-1.png',
    tag: 'KHÓA HỌC',
    tagColor: '#f59e0b', // Màu cam
    action: 'Học Ngay ➔',
  },
  {
    id: 3,
    title: 'Sát Chiêu Thực Dụng: Đơn Xe Quả Pháo',
    excerpt:
      'Rèn luyện nhãn quan chiến thuật trong cờ tàn. Áp dụng đòn phối hợp Xe Pháo cơ bản để ép sát tướng địch chỉ trong 5 nước.',
    image: '/assets/web/endgame-1.png',
    tag: 'LUYỆN TẬP',
    tagColor: '#1976d2', // Màu xanh dương
    action: 'Thử Sức ➔',
  },
];

export default function AcademyPreviewSection() {
  const router = useRouter();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleBadge}>HỌC VIỆN KỲ THỦ</div>
          <h2 className={styles.title}>Nâng Cao Kỳ Nghệ</h2>
          <p className={styles.subTitle}>
            Giải đố cờ thế và rèn luyện kỹ năng qua các ván đấu kinh điển
          </p>
        </div>

        <div className={styles.grid}>
          {academyItems.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageBox}>
                <div
                  className={styles.categoryBadge}
                  style={{ backgroundColor: item.tagColor }}
                >
                  {item.tag}
                </div>
                <div
                  className={styles.thumbnail}
                  style={{
                    backgroundImage: `url(${item.image}), linear-gradient(#e0e0e0, #f5f5f5)`,
                  }}
                />
              </div>
              <div className={styles.contentBox}>
                <h3 className={styles.blogTitle}>{item.title}</h3>
                <p className={styles.excerpt}>{item.excerpt}</p>
                <button
                  className={styles.readMoreBtn}
                  style={{ color: item.tagColor }}
                >
                  {item.action}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.footer}>
            <Link href="/cach-choi-co-tuong" className={styles.viewAllBtn}>
              Vào Học Viện Khám Phá Thêm
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
