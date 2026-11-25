import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

const COOKIE_NAME = 'hmn_admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 giờ
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // Khóa 15 phút nếu sai 5 lần liên tiếp

// Bộ đếm chống dò mật khẩu (brute-force) theo IP trong bộ nhớ runtime
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

function getClientIp(req: IncomingMessage): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function sha256Buffer(value: string): Buffer {
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

function safeCompare(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha256Buffer(a), sha256Buffer(b));
}

function getAdminConfig() {
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hocmonngon.vn').trim().toLowerCase();
  const sessionSecret = (process.env.ADMIN_SESSION_SECRET || '').trim() ||
    (adminPassword ? crypto.createHash('sha256').update(`hmn-secret:${adminPassword}`).digest('hex') : '');

  return { adminPassword, adminUsername, adminEmail, sessionSecret };
}

function signSessionToken(payloadObj: Record<string, unknown>, secret: string): string {
  const payload = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string, secret: string): Record<string, unknown> | null {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (!safeCompare(sig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
    if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    if (parsed.role !== 'admin') return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers.cookie || '';
  const cookies: Record<string, string> = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      cookies[k] = decodeURIComponent(v);
    }
  });
  return cookies;
}

function isSecureRequest(req: IncomingMessage): boolean {
  return (
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.VERCEL === '1' ||
    process.env.NODE_ENV === 'production'
  );
}

function buildAdminUser(adminEmail: string) {
  return {
    id: 'admin-master',
    name: 'Quản Trị Viên Hệ Thống',
    email: adminEmail,
    phone: '0988409798',
    role: 'admin' as const,
    registeredAt: '2025-01-01',
  };
}

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const maybeReq = req as IncomingMessage & { body?: unknown };
    if (maybeReq.body && typeof maybeReq.body === 'object') {
      resolve(maybeReq.body as Record<string, unknown>);
      return;
    }
    if (typeof maybeReq.body === 'string') {
      try {
        resolve(JSON.parse(maybeReq.body));
        return;
      } catch {
        resolve({});
        return;
      }
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const { adminPassword, adminUsername, adminEmail, sessionSecret } = getAdminConfig();
  const secureFlag = isSecureRequest(req) ? '; Secure' : '';

  // 1. GET /api/admin-auth -> Xác minh phiên đăng nhập Admin từ HttpOnly Cookie
  if (req.method === 'GET') {
    if (!adminPassword || !sessionSecret) {
      res.statusCode = 200;
      res.end(JSON.stringify({ authenticated: false, configured: false }));
      return;
    }

    const cookies = parseCookies(req);
    const token = cookies[COOKIE_NAME];
    const verified = token ? verifySessionToken(token, sessionSecret) : null;

    if (!verified) {
      res.statusCode = 200;
      res.end(JSON.stringify({ authenticated: false, configured: true }));
      return;
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        authenticated: true,
        configured: true,
        user: buildAdminUser(adminEmail),
      })
    );
    return;
  }

  // 2. POST /api/admin-auth -> Đăng nhập hoặc Đăng xuất Admin
  if (req.method === 'POST') {
    const body = await parseBody(req);
    const action = typeof body.action === 'string' ? body.action : 'login';

    // Đăng xuất: hủy HttpOnly cookie
    if (action === 'logout') {
      res.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secureFlag}`
      );
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // Kiểm tra xem biến môi trường ADMIN_PASSWORD đã được thiết lập thủ công chưa
    if (!adminPassword || !sessionSecret) {
      res.statusCode = 503;
      res.end(
        JSON.stringify({
          success: false,
          code: 'ADMIN_NOT_CONFIGURED',
          message:
            'Tài khoản Quản trị viên chưa được thiết lập mật khẩu trên máy chủ. Vui lòng cấu hình biến môi trường ADMIN_PASSWORD trên Vercel (hoặc file .env ở máy cá nhân).',
        })
      );
      return;
    }

    const ip = getClientIp(req);
    const record = failedAttempts.get(ip);
    const now = Date.now();
    if (record && record.lockedUntil > now) {
      const remainMin = Math.ceil((record.lockedUntil - now) / 60000);
      res.statusCode = 429;
      res.end(
        JSON.stringify({
          success: false,
          code: 'RATE_LIMITED',
          message: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${remainMin} phút.`,
        })
      );
      return;
    }

    const identifier = typeof body.identifier === 'string' ? body.identifier.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const isIdentifierMatch =
      (identifier.length > 0 && safeCompare(identifier, adminUsername)) ||
      (identifier.length > 0 && safeCompare(identifier, adminEmail));
    const isPasswordMatch = password.length > 0 && safeCompare(password, adminPassword);

    if (!isIdentifierMatch || !isPasswordMatch) {
      const nextCount = (record?.count || 0) + 1;
      failedAttempts.set(ip, {
        count: nextCount,
        lockedUntil: nextCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_MS : 0,
      });

      res.statusCode = 401;
      res.end(
        JSON.stringify({
          success: false,
          message: 'Thông tin đăng nhập hoặc mật khẩu chưa chính xác.',
        })
      );
      return;
    }

    // Đăng nhập thành công -> reset bộ đếm và cấp HttpOnly Cookie ký HMAC-SHA256
    failedAttempts.delete(ip);

    const token = signSessionToken(
      {
        sub: 'admin-master',
        role: 'admin',
        iat: now,
        exp: now + SESSION_TTL_MS,
      },
      sessionSecret
    );

    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${Math.floor(
        SESSION_TTL_MS / 1000
      )}${secureFlag}`
    );

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        user: buildAdminUser(adminEmail),
      })
    );
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
