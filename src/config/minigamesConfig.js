/**
 * CẤU HÌNH HỆ THỐNG MINI-GAME KAWAII TẠI NHÀ CƯ DÂN NPC
 * Mỗi mini-game chạy trên một trang riêng (/minigame/:gameId) dùng React.lazy
 * để không làm nặng bundle của trang thị trấn chính.
 */

export const MINIGAME_REWARD_STORAGE_KEY = 'TTSB_MINIGAME_PENDING_REWARD_V1';

export const MINIGAMES_CONFIG = {
  caro: {
    id: 'caro',
    npcId: 'cloud',
    npcName: 'Bác Mây Xốp',
    houseName: 'Tòa Thị Chính Mây Xốp',
    title: 'Cờ Caro Bầu Trời',
    shortTitle: 'Chơi Cờ Caro 9×9',
    icon: '⭕',
    genre: 'Trí tuệ • Cờ bàn',
    accentBg: '#E8F6FF',
    accentBorder: '#0284C7',
    rewardHearts: 3,
    rewardStars: 25,
    desc: 'Đấu trí Cờ Caro 9×9 (xếp 5 ô liên tiếp thắng) cùng Thị Trưởng Bác Mây Xốp với 3 cấp độ AI!',
  },
  baking: {
    id: 'baking',
    npcId: 'sun',
    npcName: 'Cô Nắng Mai',
    houseName: 'Tiệm Bánh Bình Minh',
    title: 'Tiệm Bánh Bình Minh',
    shortTitle: 'Làm Bánh Ngọt',
    icon: '🧁',
    genre: 'Mô phỏng • Làm bánh',
    accentBg: '#FFF3B0',
    accentBorder: '#D97706',
    rewardHearts: 3,
    rewardStars: 30,
    desc: 'Chọn cốt bánh, kem phủ, topping đúng đơn đặt hàng của cư dân và canh lửa nướng vàng ươm!',
  },
  puzzle: {
    id: 'puzzle',
    npcId: 'moon',
    npcName: 'Chú Trăng Khuyết',
    houseName: 'Tháp Đèn Lồng Trăng Khuyết',
    title: 'Xếp Hình Đêm Sao',
    shortTitle: 'Xếp Hình 3×3',
    icon: '🧩',
    genre: 'Xếp hình • Giải đố',
    accentBg: '#EFE5FF',
    accentBorder: '#7C3AED',
    rewardHearts: 3,
    rewardStars: 25,
    desc: 'Trượt các mảnh ghép để hoàn thiện bức tranh kawaii lung linh của các cư dân Thị Trấn Sao Bông!',
  },
  racing: {
    id: 'racing',
    npcId: 'breeze',
    npcName: 'Chú Gió Mát',
    houseName: 'Cối Xay Gió Nhỏ',
    title: 'Đua Ván Trượt Mây',
    shortTitle: 'Đua Ván Trượt Mây',
    icon: '🏎️',
    genre: 'Tốc độ • Arcade',
    accentBg: '#DFF8EB',
    accentBorder: '#059669',
    rewardHearts: 3,
    rewardStars: 30,
    desc: 'Lướt ván trên 3 làn mây trời, né mây giông & lốc xoáy, thu thập đủ 15 ngôi sao tốc độ để về đích!',
  },
  duel: {
    id: 'duel',
    npcId: 'storm_cloud',
    npcName: 'Nhóc Mây Giông',
    houseName: 'Trạm Mưa Rào Rầu Rĩ',
    title: 'Đại Chiến Bóng Tuyết',
    shortTitle: 'Đối Kháng Bóng Tuyết',
    icon: '⚔️',
    genre: 'Đối kháng • Chiến thuật',
    accentBg: '#FFE4EE',
    accentBorder: '#E11D48',
    rewardHearts: 4,
    rewardStars: 35,
    desc: 'Đấu đối kháng dễ thương 3 chiêu (Ném Tuyết • Khiên Băng • Siêu Cầu Sao) cùng Nhóc Mây Giông!',
  },
};

export const MINIGAMES_LIST = Object.values(MINIGAMES_CONFIG);

export function getMiniGameById(gameId) {
  return MINIGAMES_CONFIG[gameId] || null;
}

export function getMiniGameByNpcId(npcId) {
  return MINIGAMES_LIST.find((g) => g.npcId === npcId) || null;
}

/**
 * Lưu phần thưởng mini-game để khi quay lại Thị Trấn chính sẽ tự động cộng Tim/Sao & bắn thông báo.
 */
export function queueMiniGameReward({ gameId, gameTitle, hearts = 2, stars = 20 }) {
  try {
    const raw = localStorage.getItem(MINIGAME_REWARD_STORAGE_KEY);
    const prev = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(prev) ? prev : [];
    list.push({
      id: `mg_${Date.now()}`,
      gameId,
      gameTitle,
      hearts: Number(hearts) || 0,
      stars: Number(stars) || 0,
      earnedAt: Date.now(),
    });
    localStorage.setItem(MINIGAME_REWARD_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

export function consumePendingMiniGameRewards() {
  try {
    const raw = localStorage.getItem(MINIGAME_REWARD_STORAGE_KEY);
    if (!raw) return [];
    localStorage.removeItem(MINIGAME_REWARD_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
