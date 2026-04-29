'use client';

import React, { useState } from 'react';
import { themeSeoContent } from '@/lib/seoContent';

interface FAQSectionProps {
  theme?: string;
}

export default function FAQSection({ theme = 'pokemon' }: FAQSectionProps) {
  const content = themeSeoContent[theme] || themeSeoContent['pokemon'];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Ép kiểu cho index là number
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Check an toàn: Chắc chắn có data faqs (có chữ 's') mới render
  if (!content || !content.faqs) return null;

  return (
    <section
      style={{
        width: '100%',
        padding: '0 1rem 3rem 1rem',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: '#1F2937',
          padding: '2.5rem 3rem',
          borderRadius: '16px',
          border: '1px solid #374151',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <h2
          style={{
            color: '#03A9F4',
            textAlign: 'center',
            fontSize: '2.2rem',
            marginBottom: '1.5rem',
            lineHeight: '1.3',
            marginTop: 0,
          }}
        >
          Câu Hỏi Thường Gặp
        </h2>

        <div>
          {/* ĐIỂM CỐT TỬ: Ép kiểu rõ ràng cho faq và idx trong vòng lặp map */}
          {content.faqs.map(
            (faq: { question: string; answer: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  marginBottom: '10px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    backgroundColor: openIndex === idx ? '#374151' : '#111827',
                    color: '#E5E7EB',
                    border: 'none',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <span>{faq.question}</span>
                  <span style={{ color: '#03A9F4', fontSize: '0.9rem' }}>
                    {openIndex === idx ? '▲' : '▼'}
                  </span>
                </button>

                {openIndex === idx && (
                  <div
                    style={{
                      padding: '15px 20px',
                      backgroundColor: '#1F2937',
                      color: '#9CA3AF',
                      lineHeight: '1.6',
                      fontSize: '1rem',
                      borderTop: '1px solid #374151',
                    }}
                  >
                    <p style={{ margin: 0 }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
