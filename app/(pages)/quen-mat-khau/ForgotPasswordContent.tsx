'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import { EMAIL_REGEX } from '@/lib/constants/validation';
import { getVietnameseError } from '@/lib/utils/error-mapping';
import styles from './ForgotPasswordContent.module.css';

export default function ForgotPasswordContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const getCurrentPathWithQuery = () => {
    if (typeof window === 'undefined') return '/quen-mat-khau';
    return `${window.location.pathname}${window.location.search}`;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'Email là bắt buộc';
    if (!EMAIL_REGEX.test(value)) return 'Email không hợp lệ';
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError(undefined);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/dang-nhap?reset=true`,
        }
      );

      if (error) throw error;

      setEmailSent(true);
      showToast(
        'Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu. Nếu không thấy email, hãy kiểm tra thư mục spam.',
        'success'
      );
    } catch (error) {
      showToast(getVietnameseError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.content}>
            <h2 className={styles.title}>
              Email đã được gửi
            </h2>
            <p className={styles.description}>
              Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến địa chỉ email
              của bạn. Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
            </p>
            <p className={styles.description}>
              Nếu không thấy email, hãy kiểm tra thư mục spam hoặc thử lại sau
              vài phút.
            </p>
            <button
              className={styles.button}
              onClick={() =>
                router.push(`/dang-nhap?next=${encodeURIComponent(getCurrentPathWithQuery())}`)
              }
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        Quên Mật Khẩu
      </h1>
      <p className={styles.pageDescription}>
        Nhập email của bạn để nhận liên kết đặt lại mật khẩu
      </p>

      <div className={styles.paper}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={`${styles.input} ${emailError ? styles.inputError : ''}`}
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) {
                  setEmailError(undefined);
                }
              }}
            />
            {emailError && (
              <span className={styles.errorMessage}>{emailError}</span>
            )}
          </div>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Gửi Email Đặt Lại Mật Khẩu'}
          </button>
          <Link href="/dang-nhap" className={styles.link}>
            Quay lại đăng nhập
          </Link>
        </form>
      </div>
    </div>
  );
}

