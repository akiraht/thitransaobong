import { SafeStorage } from './storage';

export const USER_ACCOUNTS_KEY = 'TTSB_USER_ACCOUNTS_V1';
export const BLOCKED_IPS_KEY = 'TTSB_BLOCKED_IPS_V1';
export const BLOCKED_DEVICES_KEY = 'TTSB_BLOCKED_DEVICES_V1';
const DEVICE_ID_KEY = 'TTSB_DEVICE_ID_V1';
const CLIENT_IP_CACHE_KEY = 'TTSB_CLIENT_IP_V1';

export const ADMIN_USERNAME = (import.meta.env.VITE_ADMIN_USERNAME || 'admin_saobong').trim();
export const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'AdminSaoBong2026!').trim();

export const TEST_ACCOUNT_CREDENTIALS = {
  vip: {
    username: 'tester_vip',
    password: 'VipUser123!',
    presetType: 'vip_full',
    presetStats: {
      totalQuestsCompleted: 120,
      dailyStreak: 35,
      collectedComicsCount: 25,
      likesReceived: 150,
      wishesAndMemories: 40,
      exploredActionsCount: 80,
    },
  },
  basic: {
    username: 'tester_basic',
    password: 'BasicUser123!',
    presetType: 'basic',
    presetStats: {
      totalQuestsCompleted: 0,
      dailyStreak: 0,
      collectedComicsCount: 0,
      likesReceived: 0,
      wishesAndMemories: 0,
      exploredActionsCount: 0,
    },
  },
};

/**
 * Tạo hoặc lấy mã định danh thiết bị bền vững trên trình duyệt.
 */
export function getOrCreateDeviceId() {
  try {
    let existing = SafeStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
    existing = `DEV-${Date.now().toString(36).toUpperCase()}-${rand}`;
    SafeStorage.setItem(DEVICE_ID_KEY, existing);
    return existing;
  } catch {
    return 'DEV-UNKNOWN';
  }
}

/**
 * Phân tích thông tin thiết bị & trình duyệt dễ đọc cho Admin.
 */
export function getDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return { deviceId: 'DEV-SERVER', deviceLabel: 'Unknown Device', userAgent: '' };
  }
  const ua = navigator.userAgent || '';
  let os = 'Khác';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Trình duyệt';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  const formFactor = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
  const screenStr =
    typeof window !== 'undefined' && window.screen
      ? `${window.screen.width}×${window.screen.height}`
      : '';

  return {
    deviceId: getOrCreateDeviceId(),
    deviceLabel: `${formFactor} • ${os} (${browser})${screenStr ? ` [${screenStr}]` : ''}`,
    userAgent: ua,
  };
}

/**
 * Lấy IP công khai của thiết bị (có cache trong sessionStorage, timeout 3s, fallback offline).
 */
export async function fetchClientIp() {
  try {
    const cached = sessionStorage.getItem(CLIENT_IP_CACHE_KEY);
    if (cached && cached !== 'Offline / Local') return cached;
  } catch {
    // ignore
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        try {
          sessionStorage.setItem(CLIENT_IP_CACHE_KEY, data.ip);
        } catch {
          // ignore
        }
        return data.ip;
      }
    }
  } catch {
    // Offline hoặc bị chặn CORS
  }
  return 'Offline / Local';
}

export function getCachedClientIp() {
  try {
    return sessionStorage.getItem(CLIENT_IP_CACHE_KEY) || 'Offline / Local';
  } catch {
    return 'Offline / Local';
  }
}

/**
 * Đánh giá độ mạnh mật khẩu:
 * Yêu cầu tối thiểu để đăng ký: >= 8 ký tự, có chữ hoa, chữ thường và chữ số.
 */
export function evaluatePasswordStrength(password = '') {
  const pwd = String(password || '');
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  let score = 0;
  if (hasMinLen) score += 1;
  if (hasUpper && hasLower) score += 1;
  if (hasDigit) score += 1;
  if (hasSpecial || pwd.length >= 12) score += 1;

  const missing = [];
  if (!hasMinLen) missing.push('ít nhất 8 ký tự');
  if (!hasUpper) missing.push('1 chữ hoa (A-Z)');
  if (!hasLower) missing.push('1 chữ thường (a-z)');
  if (!hasDigit) missing.push('1 chữ số (0-9)');

  const valid = hasMinLen && hasUpper && hasLower && hasDigit;

  const meta =
    score <= 1
      ? { label: 'Yếu', color: '#EF4444' }
      : score === 2
        ? { label: 'Trung bình', color: '#F59E0B' }
        : score === 3
          ? { label: 'Mạnh', color: '#10B981' }
          : { label: 'Rất mạnh', color: '#8B5CF6' };

  return {
    valid,
    score,
    label: meta.label,
    color: meta.color,
    hasMinLen,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    missing,
  };
}

/**
 * Băm mật khẩu bằng SHA-256 (Web Crypto API) kèm salt riêng từng tài khoản.
 */
export async function hashPassword(password, salt) {
  const input = `TTSB_AUTH_V2::${salt}::${password}`;
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const enc = new TextEncoder().encode(input);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Fallback cho môi trường HTTP local không có crypto.subtle
  }
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  return `fb_${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
}

// ===================== QUẢN LÝ DANH SÁCH USER & BLOCKLIST =====================

export function loadUserAccounts() {
  try {
    const raw = SafeStorage.getItem(USER_ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserAccounts(list) {
  SafeStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(list || []));
}

export function loadBlockedIps() {
  try {
    const raw = SafeStorage.getItem(BLOCKED_IPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBlockedIps(list) {
  SafeStorage.setItem(BLOCKED_IPS_KEY, JSON.stringify(list || []));
}

export function loadBlockedDevices() {
  try {
    const raw = SafeStorage.getItem(BLOCKED_DEVICES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBlockedDevices(list) {
  SafeStorage.setItem(BLOCKED_DEVICES_KEY, JSON.stringify(list || []));
}

export function toggleBlockUser(userId, blocked, reason = 'Vi phạm quy định cộng đồng') {
  const users = loadUserAccounts();
  const next = users.map((u) =>
    u.id === userId
      ? {
          ...u,
          blocked: Boolean(blocked),
          blockReason: blocked ? reason : '',
          blockedAt: blocked ? new Date().toISOString() : null,
        }
      : u
  );
  saveUserAccounts(next);
  return next;
}

export function toggleBlockIp(ip, blocked, reason = 'Chặn IP spam') {
  if (!ip || ip === 'Offline / Local') return loadBlockedIps();
  const list = loadBlockedIps();
  const filtered = list.filter((item) => item.ip !== ip);
  const next = blocked
    ? [{ ip, reason, blockedAt: new Date().toISOString() }, ...filtered]
    : filtered;
  saveBlockedIps(next);
  return next;
}

export function toggleBlockDevice(deviceId, blocked, reason = 'Chặn thiết bị spam') {
  if (!deviceId) return loadBlockedDevices();
  const list = loadBlockedDevices();
  const filtered = list.filter((item) => item.deviceId !== deviceId);
  const next = blocked
    ? [{ deviceId, reason, blockedAt: new Date().toISOString() }, ...filtered]
    : filtered;
  saveBlockedDevices(next);
  return next;
}

/**
 * Kiểm tra người dùng / IP / thiết bị hiện tại có đang bị Admin chặn hay không.
 */
export function checkCurrentUserBlocked(username = '') {
  const deviceId = getOrCreateDeviceId();
  const currentIp = getCachedClientIp();

  const blockedDevices = loadBlockedDevices();
  const devBlock = blockedDevices.find((d) => d.deviceId === deviceId);
  if (devBlock) {
    return {
      isBlocked: true,
      reason: devBlock.reason || 'Thiết bị này đã bị tạm khóa do vi phạm quy định cộng đồng.',
    };
  }

  if (currentIp && currentIp !== 'Offline / Local') {
    const blockedIps = loadBlockedIps();
    const ipBlock = blockedIps.find((i) => i.ip === currentIp);
    if (ipBlock) {
      return {
        isBlocked: true,
        reason: ipBlock.reason || 'Địa chỉ IP này đã bị tạm khóa do phát hiện hành vi spam.',
      };
    }
  }

  const cleanUser = String(username || '').trim().toLowerCase();
  if (cleanUser) {
    const users = loadUserAccounts();
    const matched = users.find((u) => u.usernameLower === cleanUser);
    if (matched?.blocked) {
      return {
        isBlocked: true,
        reason: matched.blockReason || 'Tài khoản của bạn đã bị Quản trị viên tạm khóa.',
      };
    }
  }

  return { isBlocked: false, reason: '' };
}

/**
 * Tự động khởi tạo 2 tài khoản test mẫu (1 tài khoản Full LV.5/30 Huy hiệu/18 Skin + 1 tài khoản Cơ bản)
 * nếu chưa tồn tại trong danh sách local.
 */
export async function ensureSeedTestAccounts() {
  const users = loadUserAccounts();
  let changed = false;
  const nextUsers = [...users];
  const { deviceId, deviceLabel, userAgent } = getDeviceInfo();
  const nowIso = new Date().toISOString();

  const seeds = [
    {
      id: 'usr_seed_tester_vip',
      username: TEST_ACCOUNT_CREDENTIALS.vip.username,
      password: TEST_ACCOUNT_CREDENTIALS.vip.password,
      email: 'vip.tester@saobong.town',
      phone: '0900000999',
      birthday: '2000-01-01',
      presetType: TEST_ACCOUNT_CREDENTIALS.vip.presetType,
      presetStats: TEST_ACCOUNT_CREDENTIALS.vip.presetStats,
    },
    {
      id: 'usr_seed_tester_basic',
      username: TEST_ACCOUNT_CREDENTIALS.basic.username,
      password: TEST_ACCOUNT_CREDENTIALS.basic.password,
      email: '',
      phone: '',
      birthday: '',
      presetType: TEST_ACCOUNT_CREDENTIALS.basic.presetType,
      presetStats: TEST_ACCOUNT_CREDENTIALS.basic.presetStats,
    },
  ];

  for (const seed of seeds) {
    const lower = seed.username.toLowerCase();
    if (!nextUsers.some((u) => u.usernameLower === lower)) {
      const salt = `seed_${lower}_v1`;
      const passwordHash = await hashPassword(seed.password, salt);
      nextUsers.push({
        id: seed.id,
        username: seed.username,
        usernameLower: lower,
        role: 'user',
        isTestPreset: true,
        presetType: seed.presetType,
        presetStats: seed.presetStats,
        salt,
        passwordHash,
        email: seed.email,
        phone: seed.phone,
        birthday: seed.birthday,
        ip: '127.0.0.1 (Test)',
        lastIp: '127.0.0.1 (Test)',
        deviceId,
        deviceLabel,
        userAgent,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        blocked: false,
        blockReason: '',
      });
      changed = true;
    }
  }

  if (changed) {
    saveUserAccounts(nextUsers);
  }
  return nextUsers;
}

/**
 * Đăng nhập dành riêng cho trang Quản Trị (manunit.*).
 * Từ chối mọi tài khoản cư dân thông thường (role !== 'admin').
 */
export function loginAdminAccount({ username, password }) {
  const cleanUser = String(username || '').trim();
  const pwd = String(password || '');
  if (!cleanUser || !pwd) {
    return { ok: false, error: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu Quản trị!' };
  }

  const lower = cleanUser.toLowerCase();
  if (lower !== ADMIN_USERNAME.toLowerCase()) {
    const users = loadUserAccounts();
    if (users.some((u) => u.usernameLower === lower)) {
      return {
        ok: false,
        error: '🚫 Tài khoản cư dân không có quyền truy cập trang Quản trị!',
      };
    }
    return { ok: false, error: 'Tên đăng nhập hoặc mật khẩu Quản trị không chính xác.' };
  }

  if (pwd !== ADMIN_PASSWORD) {
    return { ok: false, error: 'Tên đăng nhập hoặc mật khẩu Quản trị không chính xác.' };
  }

  return {
    ok: true,
    admin: {
      username: ADMIN_USERNAME,
      role: 'admin',
    },
  };
}

/**
 * Đăng ký tài khoản cư dân mới (Username + Mật khẩu mạnh).
 */
export async function registerUserAccount({ username, password }) {
  await ensureSeedTestAccounts();
  const cleanUsername = String(username || '').trim();
  if (cleanUsername.length < 3 || cleanUsername.length > 32) {
    return { ok: false, error: 'Tên đăng nhập cần từ 3 đến 32 ký tự nhé!' };
  }

  if (cleanUsername.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    return {
      ok: false,
      error: '🚫 Tên đăng nhập này thuộc hệ thống Quản trị, vui lòng chọn tên cư dân khác!',
    };
  }

  const strength = evaluatePasswordStrength(password);
  if (!strength.valid) {
    return {
      ok: false,
      error: `Mật khẩu chưa đủ mạnh: cần ${strength.missing.join(', ')}.`,
    };
  }

  const ip = await fetchClientIp();
  const blockCheck = checkCurrentUserBlocked(cleanUsername);
  if (blockCheck.isBlocked) {
    return { ok: false, error: `🚫 Không thể đăng ký: ${blockCheck.reason}` };
  }

  const users = loadUserAccounts();
  const lower = cleanUsername.toLowerCase();
  if (users.some((u) => u.usernameLower === lower)) {
    return {
      ok: false,
      error: 'Tên đăng nhập này đã có cư dân sử dụng rồi. Bạn chọn tên khác hoặc chuyển sang Đăng nhập nhé!',
    };
  }

  const { deviceId, deviceLabel, userAgent } = getDeviceInfo();
  const salt = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const passwordHash = await hashPassword(password, salt);
  const nowIso = new Date().toISOString();

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    username: cleanUsername,
    usernameLower: lower,
    role: 'user',
    salt,
    passwordHash,
    email: '',
    phone: '',
    birthday: '',
    ip,
    lastIp: ip,
    deviceId,
    deviceLabel,
    userAgent,
    createdAt: nowIso,
    lastLoginAt: nowIso,
    blocked: false,
    blockReason: '',
  };

  saveUserAccounts([newUser, ...users]);
  return { ok: true, user: newUser };
}

/**
 * Đăng nhập tài khoản cư dân (chỉ cho phép role: 'user', từ chối tài khoản Admin).
 */
export async function loginUserAccount({ username, password }) {
  await ensureSeedTestAccounts();
  const cleanUsername = String(username || '').trim();
  const pwd = String(password || '');
  if (!cleanUsername || !pwd) {
    return { ok: false, error: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu nhé!' };
  }

  if (cleanUsername.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    return {
      ok: false,
      error: '🚫 Tài khoản Quản trị viên không được phép sử dụng trong ứng dụng cư dân!',
    };
  }

  const ip = await fetchClientIp();
  const blockCheck = checkCurrentUserBlocked(cleanUsername);
  if (blockCheck.isBlocked) {
    return { ok: false, error: `🚫 Không thể đăng nhập: ${blockCheck.reason}` };
  }

  const users = loadUserAccounts();
  const lower = cleanUsername.toLowerCase();
  const idx = users.findIndex((u) => u.usernameLower === lower);
  if (idx === -1) {
    return {
      ok: false,
      error: 'Không tìm thấy tài khoản này. Bạn hãy kiểm tra lại tên hoặc bấm "Đăng ký cư dân" nhé!',
    };
  }

  const target = users[idx];
  const candidateHash = await hashPassword(pwd, target.salt);
  if (candidateHash !== target.passwordHash) {
    return { ok: false, error: 'Mật khẩu chưa chính xác. Bạn thử nhập lại nhé!' };
  }

  const { deviceId, deviceLabel, userAgent } = getDeviceInfo();
  const updatedUser = {
    ...target,
    lastIp: ip,
    ip: target.ip || ip,
    deviceId,
    deviceLabel,
    userAgent,
    lastLoginAt: new Date().toISOString(),
  };
  const nextUsers = [...users];
  nextUsers[idx] = updatedUser;
  saveUserAccounts(nextUsers);

  return { ok: true, user: updatedUser };
}

/**
 * Cập nhật thông tin bổ sung (Email, SĐT, Ngày sinh) — không bắt buộc.
 */
export function updateUserProfileInfo(username, { email = '', phone = '', birthday = '' }) {
  const lower = String(username || '').trim().toLowerCase();
  if (!lower) return null;
  const users = loadUserAccounts();
  let updated = null;
  const next = users.map((u) => {
    if (u.usernameLower !== lower) return u;
    updated = {
      ...u,
      email: String(email || '').trim(),
      phone: String(phone || '').trim(),
      birthday: String(birthday || '').trim(),
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (updated) saveUserAccounts(next);
  return updated;
}

/**
 * Đổi mật khẩu mạnh cho tài khoản đang đăng nhập.
 */
export async function changeUserPassword(username, currentPassword, newPassword) {
  const lower = String(username || '').trim().toLowerCase();
  const users = loadUserAccounts();
  const idx = users.findIndex((u) => u.usernameLower === lower);
  if (idx === -1) {
    return { ok: false, error: 'Không tìm thấy tài khoản trong hệ thống.' };
  }

  const target = users[idx];
  const curHash = await hashPassword(currentPassword, target.salt);
  if (curHash !== target.passwordHash) {
    return { ok: false, error: 'Mật khẩu hiện tại chưa đúng.' };
  }

  const strength = evaluatePasswordStrength(newPassword);
  if (!strength.valid) {
    return {
      ok: false,
      error: `Mật khẩu mới chưa đủ mạnh: cần ${strength.missing.join(', ')}.`,
    };
  }

  const newSalt = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const newHash = await hashPassword(newPassword, newSalt);
  const next = [...users];
  next[idx] = {
    ...target,
    salt: newSalt,
    passwordHash: newHash,
    updatedAt: new Date().toISOString(),
  };
  saveUserAccounts(next);
  return { ok: true };
}
