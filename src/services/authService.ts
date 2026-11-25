import { Student } from '../types';

export interface AdminLoginResult {
  success: boolean;
  user?: Student;
  message?: string;
  code?: string;
}

export const AuthService = {
  /**
   * Gửi yêu cầu đăng nhập Admin tới Vercel Serverless API (/api/admin-auth).
   * Mật khẩu được đối chiếu phía máy chủ bằng biến môi trường ADMIN_PASSWORD,
   * không bao giờ lưu hay lộ trên trình duyệt.
   */
  async loginAdmin(identifier: string, password: string): Promise<AdminLoginResult> {
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.user) {
        return { success: true, user: data.user as Student };
      }

      return {
        success: false,
        code: data.code,
        message: data.message || 'Thông tin đăng nhập hoặc mật khẩu chưa chính xác.',
      };
    } catch {
      return {
        success: false,
        message: 'Không thể kết nối máy chủ xác thực. Vui lòng thử lại.',
      };
    }
  },

  /**
   * Xác minh phiên đăng nhập Admin từ HttpOnly Cookie trên máy chủ.
   * Ngăn chặn hành vi sửa LocalStorage bằng F12 DevTools để giả mạo quyền Admin.
   */
  async verifyAdminSession(): Promise<{ authenticated: boolean; user?: Student }> {
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) return { authenticated: false };
      const data = await res.json().catch(() => ({}));
      if (data.authenticated && data.user) {
        return { authenticated: true, user: data.user as Student };
      }
      return { authenticated: false };
    } catch {
      return { authenticated: false };
    }
  },

  /**
   * Hủy HttpOnly Cookie phiên đăng nhập Admin trên máy chủ.
   */
  async logoutAdmin(): Promise<void> {
    try {
      await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // Ignore network errors on logout
    }
  },
};
