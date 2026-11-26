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
    shortTitle: 'Chơi Cờ Caro 3×3 & 16×16',
    icon: '⭕',
    genre: 'Trí tuệ • Cờ bàn',
    accentBg: '#E8F6FF',
    accentBorder: '#0284C7',
    rewardHearts: 3,
    rewardStars: 25,
    desc: 'Chọn chế độ Tic-Tac-Toe 3×3 (3 ô thắng) hoặc Cờ Caro 16×16 (5 ô liên tiếp) đấu trí cùng Bác Mây Xốp!',
  },
  baking: {
    id: 'baking',
    npcId: 'sun',
    npcName: 'Cô Nắng Mai',
    houseName: 'Tiệm Bánh Bình Minh',
    title: 'Tiệm Bánh Bình Minh',
    shortTitle: 'Làm Bánh Ngọt',
    icon: '🧁',
    genre: 'Mô phỏng • Quán bánh',
    accentBg: '#FFF3B0',
    accentBorder: '#D97706',
    rewardHearts: 3,
    rewardStars: 30,
    desc: 'Đón tiếp cư dân ghé quầy bếp, chọn đúng cốt bánh, kem phủ, topping và canh lò nướng vàng ươm!',
  },
  puzzle: {
    id: 'puzzle',
    npcId: 'moon',
    npcName: 'Chú Trăng Khuyết',
    houseName: 'Tháp Đèn Lồng Trăng Khuyết',
    title: 'Ghép Tranh Puzzle Đêm Sao',
    shortTitle: 'Ghép Tranh Puzzle',
    icon: '🧩',
    genre: 'Puzzle • Kéo thả',
    accentBg: '#EFE5FF',
    accentBorder: '#7C3AED',
    rewardHearts: 4,
    rewardStars: 45,
    desc: 'Kéo thả các mảnh ghép vào khung tranh với 3 cấp độ 3×3, 5×5 và 7×7 — càng khó thưởng càng lớn!',
  },
  racing: {
    id: 'racing',
    npcId: 'breeze',
    npcName: 'Chú Gió Mát',
    houseName: 'Cối Xay Gió Nhỏ',
    title: 'Đua Ván Trượt Mây',
    shortTitle: 'Đua Ván Trượt Mây',
    icon: '🏎️',
    genre: 'Vô hạn • Tốc độ x1–x10',
    accentBg: '#DFF8EB',
    accentBorder: '#059669',
    rewardHearts: 3,
    rewardStars: 30,
    desc: 'Lướt ván vô hạn trên 3 làn mây, tốc độ tăng dần x1→x10, né mây giông! Đạt x2 & 15 sao để hoàn thành NV ngày!',
  },
  duel: {
    id: 'duel',
    npcId: 'storm_cloud',
    npcName: 'Nhóc Mây Giông',
    houseName: 'Trạm Mưa Rào Rầu Rĩ',
    title: 'Đại Chiến Lâu Đài Tuyết',
    shortTitle: 'Ném Tuyết Tọa Độ',
    icon: '❄️',
    genre: 'Tọa độ • Ném tuyết',
    accentBg: '#FFE4EE',
    accentBorder: '#E11D48',
    rewardHearts: 4,
    rewardStars: 35,
    desc: 'Kéo lùi canh góc & lực ném tuyết vượt chướng ngại vật giữa 2 lâu đài băng cùng Nhóc Mây Giông!',
  },
  flappy: {
    id: 'flappy',
    npcId: 'shooting_star',
    npcName: 'Bé Sao Băng',
    houseName: 'Bưu Điện Sao Băng',
    title: 'Sao Băng Lướt Mây',
    shortTitle: 'Bay Né Sét & Xương Rồng',
    icon: '🪽',
    genre: 'Phản xạ • Flappy',
    accentBg: '#FFE2EC',
    accentBorder: '#DB2777',
    rewardHearts: 3,
    rewardStars: 30,
    desc: 'Chạm màn hình hoặc nhấn Space để Bé Sao Bông né Tia Sét & Cây Xương Rồng! Đạt 24 sao hoàn thành NV ngày!',
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
