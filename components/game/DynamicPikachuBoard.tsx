'use client';

import dynamic from 'next/dynamic';

// Khai báo dynamic với ssr: false ở trong file có 'use client' là hợp lệ 100%
const GameComponent = dynamic(() => import('./PikachuBoard'), {
  ssr: false,
  loading: () => (
    <div style={{ color: '#facc15', textAlign: 'center', padding: '50px' }}>
      Đang tải dữ liệu Game...
    </div>
  ),
});

export default function DynamicPikachuBoard({ theme }: { theme: string }) {
  return <GameComponent theme={theme} />;
}
