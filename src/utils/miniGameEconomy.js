/**
 * HỆ THỐNG KINH TẾ MINI-GAME:
 * - Ví Sao Bông dùng chung (đồng bộ giữa Thị Trấn chính & các trang Mini-Game độc lập).
 * - Lượt chơi mỗi ngày: 1 lượt miễn phí / ngày / mini-game (reset 00:00).
 *   + Chơi xong (thắng hay thua) đều trừ 1 lượt.
 *   + Hết lượt có thể đổi bằng Sao: tối đa 3 lần / ngày / game với giá tăng dần 30 -> 50 -> 70 Sao.
 * - Mở khóa Mini-Game mở rộng: đạt mốc Huy Hiệu HOẶC mở sớm bằng Sao Bông.
 */

import { getTodayDateString } from './storage';

const STAR_WALLET_KEY = 'TTSB_STAR_WALLET_V1';
const BADGE_COUNT_KEY = 'TTSB_BADGE_COUNT_V1';
const DAILY_PLAYS_KEY = 'TTSB_MINIGAME_PLAYS_V1';
const UNLOCKED_GAMES_KEY = 'TTSB_UNLOCKED_MINIGAMES_V1';

export const FREE_DAILY_PLAYS = 1;
export const EXTRA_PLAY_COSTS = [30, 50, 70]; // Tối đa 3 lần đổi/ngày/game

// --- 1. VÍ SAO BÔNG & SỐ HUY HIỆU ĐỒNG BỘ ---
export function getStarBalance() {
  try {
    const raw = localStorage.getItem(STAR_WALLET_KEY);
    if (raw === null) {
      // Tặng 100 Sao khởi đầu cho cư dân mới để trải nghiệm hệ thống đổi lượt / mua đồ
      localStorage.setItem(STAR_WALLET_KEY, '100');
      return 100;
    }
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
  } catch {
    return 100;
  }
}

export function addStars(amount) {
  const delta = Math.max(0, Math.floor(Number(amount) || 0));
  const next = getStarBalance() + delta;
  try {
    localStorage.setItem(STAR_WALLET_KEY, String(next));
  } catch {
    // ignore
  }
  return next;
}

export function spendStars(amount) {
  const cost = Math.max(0, Math.floor(Number(amount) || 0));
  const cur = getStarBalance();
  if (cur < cost) return { ok: false, balance: cur };
  const next = cur - cost;
  try {
    localStorage.setItem(STAR_WALLET_KEY, String(next));
  } catch {
    // ignore
  }
  return { ok: true, balance: next };
}

export function syncBadgeCountToStorage(count) {
  try {
    localStorage.setItem(BADGE_COUNT_KEY, String(Math.max(0, Math.floor(Number(count) || 0))));
  } catch {
    // ignore
  }
}

export function getStoredBadgeCount() {
  try {
    return Math.max(0, Math.floor(Number(localStorage.getItem(BADGE_COUNT_KEY)) || 0));
  } catch {
    return 0;
  }
}

// --- 2. HỆ THỐNG LƯỢT CHƠI MỖI NGÀY & ĐỔI LƯỢT BẰNG SAO (30 -> 50 -> 70) ---
function loadTodayPlayStore() {
  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(DAILY_PLAYS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.dateKey === today && typeof parsed.games === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const fresh = { dateKey: today, games: {} };
  try {
    localStorage.setItem(DAILY_PLAYS_KEY, JSON.stringify(fresh));
  } catch {
    // ignore
  }
  return fresh;
}

function saveTodayPlayStore(store) {
  try {
    localStorage.setItem(DAILY_PLAYS_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function getDailyPlayInfo(gameId) {
  const store = loadTodayPlayStore();
  const entry = store.games[gameId] || { used: 0, purchased: 0 };
  const totalGranted = FREE_DAILY_PLAYS + entry.purchased;
  const remainingPlays = Math.max(0, totalGranted - entry.used);
  const purchasesToday = entry.purchased;
  const maxPurchases = EXTRA_PLAY_COSTS.length;
  const nextBuyCost = purchasesToday < maxPurchases ? EXTRA_PLAY_COSTS[purchasesToday] : null;

  return {
    usedToday: entry.used,
    purchasesToday,
    maxPurchases,
    totalGranted,
    remainingPlays,
    nextBuyCost,
    canBuyMore: nextBuyCost !== null,
  };
}

/**
 * Trừ 1 lượt chơi (gọi khi kết thúc 1 ván — dù thắng hay thua đều trừ).
 */
export function consumeMiniGamePlay(gameId) {
  if (!gameId) return getDailyPlayInfo(gameId);
  const store = loadTodayPlayStore();
  const entry = store.games[gameId] || { used: 0, purchased: 0 };
  entry.used += 1;
  store.games[gameId] = entry;
  saveTodayPlayStore(store);
  return getDailyPlayInfo(gameId);
}

/**
 * Đổi Sao để mua thêm 1 lượt chơi (tối đa 3 lần/ngày: 30 -> 50 -> 70 Sao).
 */
export function purchaseExtraMiniGamePlay(gameId) {
  const info = getDailyPlayInfo(gameId);
  if (!info.canBuyMore || info.nextBuyCost === null) {
    return {
      ok: false,
      reason: 'limit',
      message: 'Bạn đã đổi tối đa 3 lượt chơi thêm cho mini-game này hôm nay rồi!',
      info,
      balance: getStarBalance(),
    };
  }

  const spend = spendStars(info.nextBuyCost);
  if (!spend.ok) {
    return {
      ok: false,
      reason: 'stars',
      message: `Cần ${info.nextBuyCost} ⭐ Sao (hiện có ${spend.balance} ⭐). Hãy làm nhiệm vụ hoặc chơi mini-game khác để kiếm thêm Sao nhé!`,
      info,
      balance: spend.balance,
    };
  }

  const store = loadTodayPlayStore();
  const entry = store.games[gameId] || { used: 0, purchased: 0 };
  entry.purchased += 1;
  store.games[gameId] = entry;
  saveTodayPlayStore(store);

  return {
    ok: true,
    cost: info.nextBuyCost,
    info: getDailyPlayInfo(gameId),
    balance: spend.balance,
  };
}

// --- 3. MỞ KHÓA MINI-GAME MỞ RỘNG (HUY HIỆU HOẶC ĐỔI SAO) ---
function loadPurchasedUnlocks() {
  try {
    const raw = localStorage.getItem(UNLOCKED_GAMES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isMiniGameUnlocked(game, badgeCount = getStoredBadgeCount()) {
  if (!game) return false;
  const reqBadges = Number(game.unlockBadges) || 0;
  const reqStars = Number(game.unlockStars) || 0;
  if (reqBadges <= 0 && reqStars <= 0) return true;
  if (reqBadges > 0 && badgeCount >= reqBadges) return true;
  return loadPurchasedUnlocks().includes(game.id);
}

export function unlockMiniGameWithStars(game) {
  if (!game) return { ok: false, message: 'Mini-game không tồn tại.' };
  if (isMiniGameUnlocked(game)) {
    return { ok: true, already: true, balance: getStarBalance() };
  }
  const cost = Number(game.unlockStars) || 0;
  if (cost <= 0) return { ok: false, message: 'Mini-game này không cần mở khóa bằng Sao.' };

  const spend = spendStars(cost);
  if (!spend.ok) {
    return {
      ok: false,
      message: `Cần ${cost} ⭐ Sao để mở khóa sớm (hiện có ${spend.balance} ⭐).`,
      balance: spend.balance,
    };
  }

  const prev = loadPurchasedUnlocks();
  if (!prev.includes(game.id)) {
    try {
      localStorage.setItem(UNLOCKED_GAMES_KEY, JSON.stringify([...prev, game.id]));
    } catch {
      // ignore
    }
  }
  return { ok: true, cost, balance: spend.balance };
}
