'use client';

import { useState, useEffect } from 'react';
import styles from './BackToTop.module.css';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Kiểm tra vị trí cuộn chuột để hiện/ẩn nút
  useEffect(() => {
    const toggleVisibility = () => {
      // Nếu cuộn xuống quá 500px thì hiện nút
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Hàm cuộn mượt mà lên top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Hiệu ứng trượt mượt mà
    });
  };

  return (
    <button
      className={`${styles.backToTopBtn} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      title="Lên đầu trang"
    >
      {/* Icon mũi tên hướng lên, bác có thể thay bằng SVG nếu muốn */}
      <span className={styles.arrow}>▲</span>
    </button>
  );
}
