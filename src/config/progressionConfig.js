/**
 * HỆ THỐNG HUY HIỆU 5 CẤP BẬC (6 BỘ CHỦ ĐỀ × 5 BẬC = 30 HUY HIỆU)
 * VÀ HỆ THỐNG CẤP ĐỘ MỞ KHÓA CƯ DÂN TỪ TỪ (LV.0 → LV.5)
 */

export const BADGE_TIERS = [
  {
    tier: 1,
    key: 'bronze',
    name: 'Đồng',
    emoji: '🥉',
    bg: '#FDE8D7',
    border: '#B45309',
    text: '#78350F',
  },
  {
    tier: 2,
    key: 'silver',
    name: 'Bạc',
    emoji: '🥈',
    bg: '#F1F5F9',
    border: '#64748B',
    text: '#334155',
  },
  {
    tier: 3,
    key: 'gold',
    name: 'Vàng',
    emoji: '🥇',
    bg: '#FEF9C3',
    border: '#CA8A04',
    text: '#713F12',
  },
  {
    tier: 4,
    key: 'diamond',
    name: 'Kim Cương',
    emoji: '💎',
    bg: '#E0F2FE',
    border: '#0284C7',
    text: '#0C4A6E',
  },
  {
    tier: 5,
    key: 'crystal',
    name: 'Pha Lê Sao',
    emoji: '🔮',
    bg: '#F3E8FF',
    border: '#9333EA',
    text: '#581C87',
  },
];

/**
 * 6 BỘ HUY HIỆU THEO CHỦ ĐỀ (MỖI BỘ 5 CẤP ĐỘ = TỔNG 30 HUY HIỆU)
 */
export const BADGE_CATEGORIES = [
  {
    id: 'quests',
    icon: '🎯',
    name: 'Hành Trình Nhiệm Vụ',
    statKey: 'totalQuestsCompleted',
    unit: 'nhiệm vụ',
    thresholds: [1, 5, 15, 40, 100],
    titles: ['Tập Sự', 'Chăm Chỉ', 'Tận Tụy', 'Kỳ Cựu', 'Cộng Sự Thị Trưởng'],
  },
  {
    id: 'streak',
    icon: '🔥',
    name: 'Chuỗi Chuyên Cần',
    statKey: 'dailyStreak',
    unit: 'ngày liên tục',
    thresholds: [1, 3, 7, 14, 30],
    titles: ['Khởi Hành', 'Bé Ngoan', 'Kiên Trì', 'Bền Bỉ', 'Đại Sứ Sao Bông'],
  },
  {
    id: 'comics',
    icon: '📖',
    name: 'Mọt Sách Truyện Tranh',
    statKey: 'collectedComicsCount',
    unit: 'tập truyện',
    thresholds: [1, 3, 6, 12, 20],
    titles: ['Độc Giả Nhí', 'Yêu Truyện', 'Mọt Sách', 'Thủ Thư', 'Học Giả Sao Bông'],
  },
  {
    id: 'hearts',
    icon: '💖',
    name: 'Trái Tim Ấm Áp',
    statKey: 'likesReceived',
    unit: 'trái tim',
    thresholds: [2, 8, 20, 50, 100],
    titles: ['Nụ Cười Nhỏ', 'Ấm Áp', 'Dịu Dàng', 'Tỏa Sáng', 'Ngôi Sao Yêu Thương'],
  },
  {
    id: 'wishes',
    icon: '💌',
    name: 'Sứ Giả Bầu Trời',
    statKey: 'wishesAndMemories',
    unit: 'lời chúc & ký ức',
    thresholds: [1, 3, 7, 15, 30],
    titles: ['Gieo Hạt', 'Người Nhắn Gửi', 'Sứ Giả Sao', 'Người Giữ Ký Ức', 'Huyền Thoại Bầu Trời'],
  },
  {
    id: 'explorer',
    icon: '🧭',
    name: 'Thám Hiểm Thị Trấn',
    statKey: 'exploredActionsCount',
    unit: 'tương tác cư dân',
    thresholds: [2, 6, 15, 30, 60],
    titles: ['Làm Quen', 'Dạo Phố', 'Thổ Địa', 'Nhà Thám Hiểm', 'Chinh Phục Thị Trấn'],
  },
];

// Danh sách phẳng 30 huy hiệu để tương thích & tra cứu nhanh
export const ALL_BADGES = BADGE_CATEGORIES.flatMap((cat) =>
  BADGE_TIERS.map((tierObj, idx) => {
    const req = cat.thresholds[idx];
    const titleText = cat.titles[idx];
    return {
      id: `${cat.id}_${tierObj.key}`,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      tier: tierObj.tier,
      tierKey: tierObj.key,
      tierName: tierObj.name,
      tierEmoji: tierObj.emoji,
      tierBg: tierObj.bg,
      tierBorder: tierObj.border,
      tierText: tierObj.text,
      icon: tierObj.emoji,
      name: `${cat.name} (${tierObj.name})`,
      title: `${tierObj.emoji} ${titleText}`,
      requirement: req,
      desc: `Đạt mốc ${req} ${cat.unit}`,
      check: (stats) => (Number(stats?.[cat.statKey]) || 0) >= req,
    };
  })
);

/**
 * HỆ THỐNG CẤP ĐỘ NHÂN VẬT (LV.0 → LV.5) & MỞ KHÓA CƯ DÂN TỪ TỪ
 * - Lv.0 (0 huy hiệu): 8 cư dân khởi đầu (Map 1: 3, Map 2: 2, Map 3: 3)
 * - Số huy hiệu cần để lên Lv mới tăng dần: +2 -> +3 -> +4 -> +5 -> +6 (0, 2, 5, 9, 14, 20)
 */
export const LEVEL_DEFINITIONS = [
  {
    level: 0,
    minBadges: 0,
    title: '🌱 Cư Dân Tập Sự',
    unlockResidents: [
      // Map 1 (3): Đỉnh Đồi Hy Vọng
      'star',
      'cloud',
      'sun',
      // Map 2 (2): Thung Lũng Thiên Văn
      'moon',
      'aurora',
      // Map 3 (3): Ngõ Thời Tiết
      'dewdrop',
      'breeze',
      'sunset',
    ],
    unlockNote: 'Khởi đầu với 8 cư dân tại Đỉnh Đồi (3), Thiên Văn (2) & Ngõ Thời Tiết (3).',
  },
  {
    level: 1,
    minBadges: 2,
    title: '⭐ Bạn Thân Thị Trấn',
    unlockResidents: ['rainbow', 'shooting_star', 'nebula'],
    unlockNote: 'Mở khóa Chị Cầu Vồng, Bé Sao Băng & Chị Ngân Hà + nhiệm vụ mới!',
  },
  {
    level: 2,
    minBadges: 5,
    title: '🌈 Người Gieo Nắng Ấm',
    unlockResidents: ['spark', 'snowflake', 'saturn'],
    unlockNote: 'Mở khóa Anh Tia Chớp, Cô Tuyết Bông & Tủ Sách Bác Sao Thổ!',
  },
  {
    level: 3,
    minBadges: 9,
    title: '🌙 Nhà Thám Hiểm Sao',
    unlockResidents: ['firefly', 'north_star', 'storm_cloud'],
    unlockNote: 'Mở khóa Bé Đom Đóm, Ông Sao Bắc Đẩu & cổng vào Hẻm Xoáy (Nhóc Mây Giông)!',
  },
  {
    level: 4,
    minBadges: 14,
    title: '💎 Hiệp Sĩ Sao Bông',
    unlockResidents: ['whirlwind', 'black_hole'],
    unlockNote: 'Mở khóa Tí Lốc Xoáy & Bé Hố Đen cùng chuỗi nhiệm vụ săn đồ khắp thị trấn!',
  },
  {
    level: 5,
    minBadges: 20,
    title: '👑 Đại Sứ Pha Lê',
    unlockResidents: ['mirage_fog'],
    unlockNote: 'Mở khóa cư dân cuối cùng Cậu Sương Mù — trọn bộ 20/20 cư dân Thị Trấn Sao Bông!',
  },
];

export function getLevelInfoFromBadgeCount(unlockedBadgeCount = 0) {
  let current = LEVEL_DEFINITIONS[0];
  for (const def of LEVEL_DEFINITIONS) {
    if (unlockedBadgeCount >= def.minBadges) {
      current = def;
    }
  }
  const next = LEVEL_DEFINITIONS.find((d) => d.level === current.level + 1) || null;
  const unlockedSet = new Set();
  for (const def of LEVEL_DEFINITIONS) {
    if (def.level <= current.level) {
      def.unlockResidents.forEach((id) => unlockedSet.add(id));
    }
  }
  return {
    level: current.level,
    title: current.title,
    currentDef: current,
    nextDef: next,
    badgesToNextLevel: next ? Math.max(0, next.minBadges - unlockedBadgeCount) : 0,
    unlockedResidentIds: unlockedSet,
  };
}

export function getResidentUnlockLevel(residentId) {
  if (residentId === 'user_house') return 0;
  for (const def of LEVEL_DEFINITIONS) {
    if (def.unlockResidents.includes(residentId)) return def.level;
  }
  return 0;
}
