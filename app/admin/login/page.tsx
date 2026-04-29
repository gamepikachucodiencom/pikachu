'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      const isAdmin =
        user?.user_metadata?.role === 'admin' ||
        user?.user_metadata?.isAdmin === true;

      if (!isAdmin) {
        await supabase.auth.signOut();
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Admin Login</h2>
          <p className={styles.subtitle}>Restricted access - Admin only</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && (
            <div className={styles.errorBox}>
              <div className={styles.errorText}>{error}</div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="email-address">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`${styles.input} ${styles.inputFirst}`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`${styles.input} ${styles.inputLast}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
