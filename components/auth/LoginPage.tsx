'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores';
import { getPageMetadata } from '@/lib/seo/metadata';
import { EMAIL_REGEX, PASSWORD_VALIDATION } from '@/lib/constants/validation';
import { getVietnameseError } from '@/lib/utils/error-mapping';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import styles from './LoginPage.module.css';

type ViewMode = 'login' | 'UPDATE_PASSWORD';
const DEFAULT_REDIRECT_PATH = '/';

const resolveSafeNextPath = (nextPath: string | null): string => {
  if (!nextPath) return DEFAULT_REDIRECT_PATH;
  if (!nextPath.startsWith('/')) return DEFAULT_REDIRECT_PATH;
  if (nextPath.startsWith('//')) return DEFAULT_REDIRECT_PATH;

  return nextPath;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setProfile } = useAuthStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>('login');
  const [activeTab, setActiveTab] = useState<string>('login');
  const meta = getPageMetadata('/dang-nhap');
  const nextPath = resolveSafeNextPath(searchParams.get('next'));

  // Check for tab query parameter on mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    } else if (tab === 'login') {
      setActiveTab('login');
    }
  }, [searchParams]);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [registerErrors, setRegisterErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  }>({});

  // Update password form state
  const [updatePasswordForm, setUpdatePasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [updatePasswordErrors, setUpdatePasswordErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    registerConfirm: false,
    update: false,
    updateConfirm: false,
  });

  // Validation functions
  const validateLoginForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!EMAIL_REGEX.test(loginForm.email)) {
      errors.email = 'Email không hợp lệ';
    }
    if (loginForm.password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
      errors.password = `Mật khẩu phải có ít nhất ${PASSWORD_VALIDATION.MIN_LENGTH} ký tự`;
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      username?: string;
    } = {};
    if (!EMAIL_REGEX.test(registerForm.email)) {
      errors.email = 'Email không hợp lệ';
    }
    if (registerForm.password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
      errors.password = `Mật khẩu phải có ít nhất ${PASSWORD_VALIDATION.MIN_LENGTH} ký tự`;
    }
    if (registerForm.confirmPassword !== registerForm.password) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }
    if (registerForm.username.length < 3) {
      errors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    }
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUpdatePasswordForm = () => {
    const errors: { password?: string; confirmPassword?: string } = {};
    if (updatePasswordForm.password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
      errors.password = `Mật khẩu phải có ít nhất ${PASSWORD_VALIDATION.MIN_LENGTH} ký tự`;
    }
    if (updatePasswordForm.confirmPassword !== updatePasswordForm.password) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }
    setUpdatePasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Detect password recovery mode
  useEffect(() => {
    // Check URL hash for recovery token
    const checkHashForRecovery = () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        setView('UPDATE_PASSWORD');
        return;
      }
    };

    // Check immediately
    checkHashForRecovery();

    // Listen for PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('UPDATE_PASSWORD');
      }
    });

    // Also check hash on hash change (in case it's set after component mounts)
    const handleHashChange = () => {
      checkHashForRecovery();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setProfile(profile);
        }

        showToast('Chào mừng bạn trở lại!', 'success');

        router.push(nextPath);
      }
    } catch (error) {
      showToast(`Lỗi đăng nhập: ${getVietnameseError(error)}`, 'error');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    setLoading(true);
    try {
      // Sanitize and validate email
      let email: string;

      // Type check: ensure email is a string
      if (typeof registerForm.email !== 'string') {
        throw new Error('Email must be a string');
      }

      // Force trim and lowercase
      email = registerForm.email.trim().toLowerCase();

      // Sign up (no email verification)
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: registerForm.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            username: registerForm.username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Profile is automatically created by database trigger (handle_new_user)
        // No need to manually insert profile

        // DELETE OR COMMENT OUT THIS BLOCK
        // const { error: profileError } = await supabase.from('profiles').insert({
        //   id: data.user.id,
        //   email: email, // Use sanitized email
        //   username: registerForm.username,
        //   knb: 100, // Starting KNB
        //   wins: 0,
        //   losses: 0,
        //   draws: 0,
        // });
        // if (profileError) throw profileError;

        setUser(data.user);
        setProfile({
          id: data.user.id,
          email: email, // Use sanitized email
          username: registerForm.username,
          elo_rating: 1200,
          wins: 0,
          losses: 0,
          draws: 0,
          current_theme_id: 'default',
          knb: 100,
        });

        showToast('Tài khoản của bạn đã được tạo!', 'success');

        router.push(nextPath);
      }
    } catch (error) {
      showToast(`Lỗi đăng ký: ${getVietnameseError(error)}`, 'error');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
          : '/auth/callback';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        // Check if it's a provider not enabled error
        // Let the catch block handle all errors with Vietnamese messages
        throw error;
      }
      // Note: signInWithOAuth redirects automatically, so we don't need to handle success
    } catch (error) {
      showToast(`Lỗi: ${getVietnameseError(error)}`, 'error');
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUpdatePasswordForm()) return;
    setLoading(true);

    try {
      // Check if we have a valid session or user (recovery token should create a session)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If no session, check if we can get user (recovery might work without full session)
      if (!session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error(
            'Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới từ trang quên mật khẩu.'
          );
        }
      }

      // Update the password directly
      const { data, error } = await supabase.auth.updateUser({
        password: updatePasswordForm.password,
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      // Verify the update was successful
      if (!data?.user) {
        throw new Error('Không thể cập nhật mật khẩu. Vui lòng thử lại.');
      }

      // Clear the hash from URL immediately
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }

      showToast('Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.', 'success');

      // Switch back to login view and reset form immediately
      setView('login');
      setUpdatePasswordForm({ password: '', confirmPassword: '' });
      setUpdatePasswordErrors({});
    } catch (error) {
      console.error('Error updating password:', error);
      showToast(`Lỗi: ${getVietnameseError(error)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render password update form if in recovery mode
  if (view === 'UPDATE_PASSWORD') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>
          Đặt Lại Mật Khẩu
        </h1>
        <p className={styles.description}>
          Vui lòng nhập mật khẩu mới của bạn
        </p>

        <div className={styles.paper}>
          <form onSubmit={handleUpdatePassword} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mật khẩu mới</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword.update ? 'text' : 'password'}
                  className={`${styles.input} ${updatePasswordErrors.password ? styles.inputError : ''}`}
                  placeholder="Nhập mật khẩu mới"
                  required
                  value={updatePasswordForm.password}
                  onChange={(e) =>
                    setUpdatePasswordForm({ ...updatePasswordForm, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowPassword({ ...showPassword, update: !showPassword.update })
                  }
                >
                  {showPassword.update ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {updatePasswordErrors.password && (
                <span className={styles.errorMessage}>{updatePasswordErrors.password}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Xác nhận mật khẩu mới</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword.updateConfirm ? 'text' : 'password'}
                  className={`${styles.input} ${updatePasswordErrors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  value={updatePasswordForm.confirmPassword}
                  onChange={(e) =>
                    setUpdatePasswordForm({
                      ...updatePasswordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      updateConfirm: !showPassword.updateConfirm,
                    })
                  }
                >
                  {showPassword.updateConfirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {updatePasswordErrors.confirmPassword && (
                <span className={styles.errorMessage}>
                  {updatePasswordErrors.confirmPassword}
                </span>
              )}
            </div>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Lưu Mật Khẩu'}
            </button>
            <Link
              href="/dang-nhap"
              className={styles.link}
              style={{ textAlign: 'center', display: 'block', marginTop: 'var(--spacing-sm)' }}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                setView('login');
                setUpdatePasswordForm({ password: '', confirmPassword: '' });
                setUpdatePasswordErrors({});
                if (typeof window !== 'undefined') {
                  window.history.replaceState(null, '', window.location.pathname);
                }
              }}
            >
              Quay lại đăng nhập
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{meta.h1}</h1>
      <p className={styles.description}>{meta.description}</p>

      <div className={styles.paper}>
        <div className={styles.tabs}>
          <div className={styles.tabsList}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'register' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Đăng Ký
            </button>
          </div>

          <div
            className={`${styles.tabPanel} ${activeTab === 'login' ? styles.tabPanelActive : ''}`}
          >
            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={`${styles.input} ${loginErrors.email ? styles.inputError : ''}`}
                  placeholder="your@email.com"
                  required
                  value={loginForm.email}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, email: e.target.value });
                    if (loginErrors.email) {
                      setLoginErrors({ ...loginErrors, email: undefined });
                    }
                  }}
                />
                {loginErrors.email && (
                  <span className={styles.errorMessage}>{loginErrors.email}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mật khẩu</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showPassword.login ? 'text' : 'password'}
                    className={`${styles.input} ${styles.passwordInput} ${loginErrors.password ? styles.inputError : ''}`}
                    placeholder="Mật khẩu của bạn"
                    required
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value });
                      if (loginErrors.password) {
                        setLoginErrors({ ...loginErrors, password: undefined });
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowPassword({ ...showPassword, login: !showPassword.login })
                    }
                  >
                    {showPassword.login ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {loginErrors.password && (
                  <span className={styles.errorMessage}>{loginErrors.password}</span>
                )}
              </div>
              <Link href="/quen-mat-khau" className={styles.link}>
                Quên mật khẩu?
              </Link>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
              </button>
            </form>
          </div>

          <div
            className={`${styles.tabPanel} ${activeTab === 'register' ? styles.tabPanelActive : ''}`}
          >
            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tên người dùng</label>
                <input
                  type="text"
                  className={`${styles.input} ${registerErrors.username ? styles.inputError : ''}`}
                  placeholder="username"
                  required
                  value={registerForm.username}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, username: e.target.value });
                    if (registerErrors.username) {
                      setRegisterErrors({ ...registerErrors, username: undefined });
                    }
                  }}
                />
                {registerErrors.username && (
                  <span className={styles.errorMessage}>{registerErrors.username}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={`${styles.input} ${registerErrors.email ? styles.inputError : ''}`}
                  placeholder="your@email.com"
                  required
                  value={registerForm.email}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, email: e.target.value });
                    if (registerErrors.email) {
                      setRegisterErrors({ ...registerErrors, email: undefined });
                    }
                  }}
                />
                {registerErrors.email && (
                  <span className={styles.errorMessage}>{registerErrors.email}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mật khẩu</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showPassword.register ? 'text' : 'password'}
                    className={`${styles.input} ${styles.passwordInput} ${registerErrors.password ? styles.inputError : ''}`}
                    placeholder="Mật khẩu của bạn"
                    required
                    value={registerForm.password}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, password: e.target.value });
                      if (registerErrors.password) {
                        setRegisterErrors({ ...registerErrors, password: undefined });
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowPassword({ ...showPassword, register: !showPassword.register })
                    }
                  >
                    {showPassword.register ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {registerErrors.password && (
                  <span className={styles.errorMessage}>{registerErrors.password}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Xác nhận mật khẩu</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showPassword.registerConfirm ? 'text' : 'password'}
                    className={`${styles.input} ${styles.passwordInput} ${registerErrors.confirmPassword ? styles.inputError : ''}`}
                    placeholder="Nhập lại mật khẩu"
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                      if (registerErrors.confirmPassword) {
                        setRegisterErrors({ ...registerErrors, confirmPassword: undefined });
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        registerConfirm: !showPassword.registerConfirm,
                      })
                    }
                  >
                    {showPassword.registerConfirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <span className={styles.errorMessage}>
                    {registerErrors.confirmPassword}
                  </span>
                )}
              </div>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerText}>Hoặc</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className={styles.googleButton}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
        </button>
      </div>
    </div>
  );
}
