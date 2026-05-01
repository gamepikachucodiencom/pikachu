import { type NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Chỉ đơn giản là cho phép request đi tiếp, không cần check đăng nhập Supabase nữa
  return NextResponse.next();
}
