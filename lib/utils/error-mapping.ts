/**
 * Vietnamese Error Message Mapping
 * Translates technical errors (especially from Supabase) into friendly Vietnamese messages
 */

/**
 * Supabase Auth Error Codes and Messages
 * Reference: https://supabase.com/docs/reference/javascript/auth-error-codes
 */
const SUPABASE_AUTH_ERRORS: Record<string, string> = {
  // Invalid credentials
  'Invalid login credentials': 'Email hoặc mật khẩu không chính xác.',
  'invalid_credentials': 'Email hoặc mật khẩu không chính xác.',
  'Invalid email or password': 'Email hoặc mật khẩu không chính xác.',

  // User not found
  'User not found': 'Không tìm thấy tài khoản này.',
  'user_not_found': 'Không tìm thấy tài khoản này.',

  // Email confirmation
  'Email not confirmed': 'Vui lòng xác nhận email của bạn trước khi đăng nhập.',
  'email_not_confirmed': 'Vui lòng xác nhận email của bạn trước khi đăng nhập.',
  'Email not verified': 'Vui lòng xác nhận email của bạn trước khi đăng nhập.',

  // Password errors
  'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'Password is too short': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'Password is too weak': 'Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn.',

  // Email errors
  'Email already registered': 'Email này đã được đăng ký.',
  'User already registered': 'Tài khoản này đã tồn tại.',
  'email_already_exists': 'Email này đã được đăng ký.',

  // Session errors
  'Session not found': 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  'JWT expired': 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  'token_expired': 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',

  // Rate limiting
  'Too many requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau vài phút.',
  'rate_limit_exceeded': 'Quá nhiều yêu cầu, vui lòng thử lại sau vài phút.',

  // Provider errors
  'Provider is not enabled': 'Phương thức đăng nhập này chưa được kích hoạt.',
  'Unsupported provider': 'Phương thức đăng nhập này không được hỗ trợ.',
};

/**
 * PostgreSQL Error Codes
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const POSTGRES_ERROR_CODES: Record<string, string> = {
  // Unique violation
  '23505': 'Dữ liệu này đã tồn tại (ví dụ: email hoặc tên đăng nhập đã có người dùng).',
  // Foreign key violation
  '23503': 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại.',
  // Not null violation
  '23502': 'Vui lòng điền đầy đủ thông tin bắt buộc.',
  // Check violation
  '23514': 'Dữ liệu không đúng định dạng, vui lòng kiểm tra lại.',
};

/**
 * Network/Connection Errors
 */
const NETWORK_ERRORS: Record<string, string> = {
  'Network request failed': 'Kết nối mạng không ổn định, vui lòng thử lại.',
  'Failed to fetch': 'Kết nối mạng không ổn định, vui lòng thử lại.',
  'NetworkError': 'Kết nối mạng không ổn định, vui lòng thử lại.',
  'timeout': 'Kết nối mạng không ổn định, vui lòng thử lại.',
  'ETIMEDOUT': 'Kết nối mạng không ổn định, vui lòng thử lại.',
  'ECONNREFUSED': 'Không thể kết nối đến máy chủ, vui lòng thử lại sau.',
};

/**
 * Extracts error message from various error types
 */
function extractErrorMessage(error: any): string {
  // If it's already a string
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object
  if (error instanceof Error) {
    return error.message;
  }

  // If it's a Supabase error object
  if (error?.message) {
    return error.message;
  }

  // If it's an object with error property
  if (error?.error?.message) {
    return error.error.message;
  }

  // Fallback
  return 'Đã có lỗi xảy ra';
}

/**
 * Checks if error message contains a specific pattern (case-insensitive)
 */
function errorMatches(errorMessage: string, patterns: string[]): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return patterns.some((pattern) => lowerMessage.includes(pattern.toLowerCase()));
}

/**
 * Gets Vietnamese error message from any error object
 * @param error - Error object from Supabase, database, or network
 * @returns Friendly Vietnamese error message
 */
export function getVietnameseError(error: any): string {
  if (!error) {
    return 'Đã có lỗi xảy ra, vui lòng thử lại sau.';
  }

  const errorMessage = extractErrorMessage(error);

  // Check Supabase Auth errors
  for (const [key, value] of Object.entries(SUPABASE_AUTH_ERRORS)) {
    if (
      errorMessage.toLowerCase().includes(key.toLowerCase()) ||
      error?.code === key ||
      error?.status === key
    ) {
      return value;
    }
  }

  // Check PostgreSQL error codes
  if (error?.code && POSTGRES_ERROR_CODES[error.code]) {
    return POSTGRES_ERROR_CODES[error.code];
  }

  // Check for duplicate key violations in error message
  if (
    errorMatches(errorMessage, [
      'duplicate key',
      'unique constraint',
      'already exists',
      'violates unique constraint',
    ])
  ) {
    return 'Dữ liệu này đã tồn tại (ví dụ: email hoặc tên đăng nhập đã có người dùng).';
  }

  // Check network errors
  for (const [key, value] of Object.entries(NETWORK_ERRORS)) {
    if (
      errorMessage.toLowerCase().includes(key.toLowerCase()) ||
      error?.name === key ||
      error?.code === key
    ) {
      return value;
    }
  }

  // Check for connection timeout patterns
  if (
    errorMatches(errorMessage, [
      'connection timeout',
      'request timeout',
      'timeout',
      'timed out',
    ])
  ) {
    return 'Kết nối mạng không ổn định, vui lòng thử lại.';
  }

  // Check for password-related errors
  if (
    errorMatches(errorMessage, [
      'password',
      'mật khẩu',
      'too short',
      'too weak',
      'minimum length',
    ])
  ) {
    if (errorMessage.toLowerCase().includes('6')) {
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    return 'Mật khẩu không hợp lệ, vui lòng kiểm tra lại.';
  }

  // Check for email-related errors
  if (
    errorMatches(errorMessage, [
      'email',
      'invalid email',
      'email format',
      'email already',
    ])
  ) {
    if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exists')) {
      return 'Email này đã được đăng ký.';
    }
    if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('format')) {
      return 'Email không đúng định dạng.';
    }
  }

  // Generic fallback
  return 'Đã có lỗi xảy ra, vui lòng thử lại sau.';
}

/**
 * Helper function to get Vietnamese error message
 * This is a convenience wrapper that also logs the error for debugging
 * @param error - Error object
 * @param context - Optional context string for logging
 * @returns Vietnamese error message
 */
export function getVietnameseErrorWithLog(
  error: any,
  context?: string
): string {
  const message = getVietnameseError(error);
  if (context) {
    console.error(`[${context}]`, message, error);
  } else {
    console.error('[Error]', message, error);
  }
  return message;
}

