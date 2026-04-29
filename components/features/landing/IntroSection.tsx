import React from 'react';
import styles from './IntroSection.module.css';
import { themeSeoContent } from '@/lib/seoContent'; // Bác nhớ check lại đường dẫn file này nhé

interface IntroSectionProps {
  theme?: string;
}

export default function IntroSection({ theme = 'pokemon' }: IntroSectionProps) {
  // Bốc đúng data của theme hiện hành ra, nếu không có thì lấy bài pokemon làm gốc
  const content = themeSeoContent[theme] || themeSeoContent['pokemon'];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* NẠP TIÊU ĐỀ ĐỘNG */}
        <h2 className={styles.h2Title}>{content.introTitle}</h2>

        <div className={styles.content}>
          <div className={styles.introParagraphs}>
            {/* NẠP CÁC ĐOẠN VĂN ĐỘNG BẰNG VÒNG LẶP MAP */}
            {content.introParagraphs.map((para: string, idx: number) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
