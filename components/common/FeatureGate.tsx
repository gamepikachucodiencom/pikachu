'use client';

import React from 'react';

interface FeatureGateProps {
  feature?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ children }: FeatureGateProps) {
  // Đã gỡ bỏ logic khóa tính năng và coming-soon.
  // Giờ nó chỉ đơn giản là hiển thị luôn nội dung bên trong.
  return <>{children}</>;
}
