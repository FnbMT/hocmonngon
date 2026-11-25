/**
 * Tiện ích băm mật khẩu phía client bằng Web Crypto API (SHA-256 + Salt ngẫu nhiên).
 * Định dạng lưu trữ: `sha256$<saltHex>$<hashHex>`
 * Dùng cho tài khoản Học viên và Giảng viên để không bao giờ lưu mật khẩu dạng chữ thuần lên Firestore.
 */

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(hashBuffer));
}

export function isHashedPassword(value?: string): boolean {
  return Boolean(value && value.startsWith('sha256$') && value.split('$').length === 3);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = bytesToHex(saltBytes);
  const hash = await sha256Hex(`${salt}:${plainPassword}`);
  return `sha256$${salt}$${hash}`;
}

export async function verifyPassword(plainPassword: string, storedPassword?: string): Promise<boolean> {
  if (!plainPassword || !storedPassword) return false;

  if (isHashedPassword(storedPassword)) {
    const [, salt, expectedHash] = storedPassword.split('$');
    const actualHash = await sha256Hex(`${salt}:${plainPassword}`);
    // Constant-time string comparison
    if (actualHash.length !== expectedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < actualHash.length; i++) {
      diff |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
    }
    return diff === 0;
  }

  // Fallback tương thích ngược cho tài khoản giảng viên cũ chưa chuyển đổi sang hash
  return plainPassword === storedPassword;
}
