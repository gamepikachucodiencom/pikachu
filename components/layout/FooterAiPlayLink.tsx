'use client';

import { useOpenAiGameSetup } from '@/stores/hooks';

export default function FooterAiPlayLink() {
  const openAiGameSetup = useOpenAiGameSetup();

  return (
    <a
      href="/choi-co-tuong-voi-may"
      onClick={(e) => {
        e.preventDefault();
        openAiGameSetup('Chơi Với Máy (AI)');
      }}
    >
      Chơi Với Máy (AI)
    </a>
  );
}
