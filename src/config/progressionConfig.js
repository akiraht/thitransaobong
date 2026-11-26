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

export function getBadgeImagePath(categoryId, tierKey) {
  return `/images/badges/${categoryId}_${tierKey}.webp`;
}

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
      statKey: cat.statKey,
      unit: cat.unit,
      tier: tierObj.tier,
      tierKey: tierObj.key,
      tierName: tierObj.name,
      tierEmoji: tierObj.emoji,
      tierBg: tierObj.bg,
      tierBorder: tierObj.border,
      tierText: tierObj.text,
      icon: tierObj.emoji,
      image: getBadgeImagePath(cat.id, tierObj.key),
      name: `${cat.name} (${tierObj.name})`,
      titleName: titleText,
      title: `${tierObj.emoji} ${titleText}`,
      requirement: req,
      desc: `Đạt mốc ${req} ${cat.unit}`,
      check: (stats) => (Number(stats?.[cat.statKey]) || 0) >= req,
    };
  })
);

export function getBadgeById(badgeId) {
  if (!badgeId) return null;
  return ALL_BADGES.find((b) => b.id === badgeId) || null;
}

/**
 * HỆ THỐNG CẤP ĐỘ NHÂN VẬT (LV.0 → LV.5) & MỞ KHÓA KHU VỰC (PHƯƠNG ÁN 2)
 * - Lv.0 (0 huy hiệu): Mở sẵn toàn bộ 16 cư dân tại 3 Map chính (Đỉnh Đồi, Thiên Văn, Ngõ Thời Tiết) + 5/6 Mini-Game!
 * - Lv.1 (2 huy hiệu): Mở khóa Khu Phố Bí Mật Map 4 — Hẻm Xoáy Tinh Nghịch (4 cư dân tinh nghịch + game Ném Tuyết)!
 * - Lv.2 → Lv.5: Mở khóa Danh hiệu, Skin nhân vật đặc biệt, Truyện tranh & đặc quyền cư dân.
 */
export const MAP_UNLOCK_LEVELS = {
  map_hope_hill: 0,
  map_astronomy_valley: 0,
  map_weather_lane: 0,
  map_mischief_alley: 1,
};

export function getMapUnlockLevel(mapId) {
  return MAP_UNLOCK_LEVELS[mapId] ?? 0;
}

export function isMapUnlockedAtLevel(mapId, level = 0) {
  return level >= getMapUnlockLevel(mapId);
}

export const LEVEL_DEFINITIONS = [
  {
    level: 0,
    minBadges: 0,
    title: '🌱 Cư Dân Tập Sự',
    unlockResidents: [
      // Map 1: Đỉnh Đồi Hy Vọng (5)
      'star',
      'cloud',
      'sun',
      'shooting_star',
      'rainbow',
      // Map 2: Thung Lũng Thiên Văn (6)
      'moon',
      'nebula',
      'aurora',
      'saturn',
      'firefly',
      'north_star',
      // Map 3: Ngõ Thời Tiết (5)
      'spark',
      'dewdrop',
      'breeze',
      'snowflake',
      'sunset',
    ],
    unlockNote: 'Mở sẵn 16 cư dân tại 3 bản đồ chính (Đỉnh Đồi, Thiên Văn & Ngõ Thời Tiết) cùng 5 Mini-Game!',
  },
  {
    level: 1,
    minBadges: 2,
    title: '⭐ Bạn Thân Thị Trấn',
    unlockMapId: 'map_mischief_alley',
    unlockResidents: ['storm_cloud', 'whirlwind', 'black_hole', 'mirage_fog'],
    unlockNote:
      'Mở khóa Khu Phố Bí Mật Map 4 — Hẻm Xoáy Tinh Nghịch (4 nhân vật tinh nghịch + Mini-Game Ném Tuyết Tọa Độ)!',
  },
  {
    level: 2,
    minBadges: 5,
    title: '🌈 Người Gieo Nắng Ấm',
    unlockResidents: [],
    unlockNote: 'Mở khóa danh hiệu Người Gieo Nắng Ấm & các tập truyện tranh đặc biệt mới!',
  },
  {
    level: 3,
    minBadges: 9,
    title: '🌙 Nhà Thám Hiểm Sao',
    unlockResidents: [],
    unlockNote: 'Mở khóa trang phục đặc biệt Thám Hiểm Sao (LV.3) trong Tủ Đồ Ngôi Nhà!',
  },
  {
    level: 4,
    minBadges: 14,
    title: '💎 Hiệp Sĩ Sao Bông',
    unlockResidents: [],
    unlockNote: 'Mở khóa trang phục Hiệp Sĩ Sao Bông (LV.4) cùng danh hiệu cao quý!',
  },
  {
    level: 5,
    minBadges: 20,
    title: '👑 Đại Sứ Pha Lê',
    unlockResidents: [],
    unlockNote: 'Đạt cấp độ tối thượng Đại Sứ Pha Lê & mở khóa trang phục Pha Lê Sao (LV.5)!',
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

/**
 * HỆ THỐNG TỦ ĐỒ 18 SKIN NHÂN VẬT NGƯỜI CHƠI (BÉ SAO BÔNG)
 * - 3 skin mặc định mở sẵn
 * - 3 skin mở khóa theo Cấp Độ (> LV.2: LV.3, LV.4, LV.5)
 * - 12 skin mở khóa theo Huy Hiệu bậc Kim Cương (diamond) & Pha Lê Sao (crystal)
 */
export const PLAYER_SKINS = [
  // --- NHÓM 1: MẶC ĐỊNH (3) ---
  {
    id: 'user_character',
    name: 'Bé Sao Bông',
    desc: 'Nguyên bản đáng yêu',
    image: '/images/player/user_character.webp',
    group: 'default',
    unlockType: 'free',
    unlockShort: 'Mặc định',
    unlockLabel: 'Mở sẵn cho mọi cư dân',
  },
  {
    id: 'user_hardworking',
    name: 'Bé Chăm Chỉ',
    desc: 'Học tập & cần mẫn',
    image: '/images/player/user_hardworking.webp',
    group: 'default',
    unlockType: 'free',
    unlockShort: 'Mặc định',
    unlockLabel: 'Mở sẵn cho mọi cư dân',
  },
  {
    id: 'user_happy',
    name: 'Bé Vui Tươi',
    desc: 'Cười tít rạng rỡ',
    image: '/images/player/user_happy.webp',
    group: 'default',
    unlockType: 'free',
    unlockShort: 'Mặc định',
    unlockLabel: 'Mở sẵn cho mọi cư dân',
  },

  // --- NHÓM 2: MỞ KHÓA THEO CẤP ĐỘ (LV > 2: LV.3, LV.4, LV.5) ---
  {
    id: 'skin_lv3_star_explorer',
    name: 'Nhà Thám Hiểm Sao',
    desc: 'Mũ nồi sao trời & đèn lồng đêm',
    image: '/images/player/skin_lv3_star_explorer.webp',
    group: 'level',
    unlockType: 'level',
    requiredLevel: 3,
    tierKey: 'gold',
    unlockShort: 'LV.3',
    unlockLabel: 'Đạt Cấp Độ LV.3 (9 Huy hiệu)',
  },
  {
    id: 'skin_lv4_star_knight',
    name: 'Hiệp Sĩ Sao Bông',
    desc: 'Áo choàng hiệp sĩ & khiên ngôi sao',
    image: '/images/player/skin_lv4_star_knight.webp',
    group: 'level',
    unlockType: 'level',
    requiredLevel: 4,
    tierKey: 'diamond',
    unlockShort: 'LV.4',
    unlockLabel: 'Đạt Cấp Độ LV.4 (14 Huy hiệu)',
  },
  {
    id: 'skin_lv5_crystal_ambassador',
    name: 'Đại Sứ Pha Lê',
    desc: 'Vương miện pha lê & quyền trượng sao',
    image: '/images/player/skin_lv5_crystal_ambassador.webp',
    group: 'level',
    unlockType: 'level',
    requiredLevel: 5,
    tierKey: 'crystal',
    unlockShort: 'LV.5',
    unlockLabel: 'Đạt Cấp Độ LV.5 (20 Huy hiệu)',
  },

  // --- NHÓM 3: MỞ KHÓA THEO HUY HIỆU KIM CƯƠNG & PHA LÊ SAO (12) ---
  {
    id: 'skin_quests_diamond',
    name: 'Hướng Đạo Sao',
    desc: 'Dải băng hướng đạo & cờ hiệu nhiệm vụ',
    image: '/images/player/skin_quests_diamond.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'quests_diamond',
    categoryId: 'quests',
    tierKey: 'diamond',
    unlockShort: '💎 Nhiệm Vụ',
    unlockLabel: 'Đạt Huy hiệu Hành Trình Nhiệm Vụ (Kim Cương)',
  },
  {
    id: 'skin_quests_crystal',
    name: 'Cộng Sự Thị Trưởng',
    desc: 'Mũ chóp mini & cuộn sắc lệnh sao',
    image: '/images/player/skin_quests_crystal.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'quests_crystal',
    categoryId: 'quests',
    tierKey: 'crystal',
    unlockShort: '🔮 Nhiệm Vụ',
    unlockLabel: 'Đạt Huy hiệu Hành Trình Nhiệm Vụ (Pha Lê Sao)',
  },
  {
    id: 'skin_streak_diamond',
    name: 'Ngọn Lửa Bền Bỉ',
    desc: 'Áo choàng tai sao & đèn lồng ấm áp',
    image: '/images/player/skin_streak_diamond.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'streak_diamond',
    categoryId: 'streak',
    tierKey: 'diamond',
    unlockShort: '💎 Chuỗi Ngày',
    unlockLabel: 'Đạt Huy hiệu Chuỗi Chuyên Cần (Kim Cương)',
  },
  {
    id: 'skin_streak_crystal',
    name: 'Đại Sứ Bình Minh',
    desc: 'Áo choàng bình minh & vòng lửa sao',
    image: '/images/player/skin_streak_crystal.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'streak_crystal',
    categoryId: 'streak',
    tierKey: 'crystal',
    unlockShort: '🔮 Chuỗi Ngày',
    unlockLabel: 'Đạt Huy hiệu Chuỗi Chuyên Cần (Pha Lê Sao)',
  },
  {
    id: 'skin_comics_diamond',
    name: 'Thủ Thư Sao Bông',
    desc: 'Mũ beret nâu, kính vàng & sách truyện',
    image: '/images/player/skin_comics_diamond.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'comics_diamond',
    categoryId: 'comics',
    tierKey: 'diamond',
    unlockShort: '💎 Truyện Tranh',
    unlockLabel: 'Đạt Huy hiệu Mọt Sách Truyện Tranh (Kim Cương)',
  },
  {
    id: 'skin_comics_crystal',
    name: 'Học Giả Phép Thuật',
    desc: 'Mũ phù thủy sao & trang truyện bay lượn',
    image: '/images/player/skin_comics_crystal.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'comics_crystal',
    categoryId: 'comics',
    tierKey: 'crystal',
    unlockShort: '🔮 Truyện Tranh',
    unlockLabel: 'Đạt Huy hiệu Mọt Sách Truyện Tranh (Pha Lê Sao)',
  },
  {
    id: 'skin_hearts_diamond',
    name: 'Thiên Thần Ấm Áp',
    desc: 'Cánh bông thiên thần & trái tim pha lê',
    image: '/images/player/skin_hearts_diamond.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'hearts_diamond',
    categoryId: 'hearts',
    tierKey: 'diamond',
    unlockShort: '💎 Trái Tim',
    unlockLabel: 'Đạt Huy hiệu Trái Tim Ấm Áp (Kim Cương)',
  },
  {
    id: 'skin_hearts_crystal',
    name: 'Cupid Ngôi Sao',
    desc: 'Hào quang trái tim & đũa phép yêu thương',
    image: '/images/player/skin_hearts_crystal.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'hearts_crystal',
    categoryId: 'hearts',
    tierKey: 'crystal',
    unlockShort: '🔮 Trái Tim',
    unlockLabel: 'Đạt Huy hiệu Trái Tim Ấm Áp (Pha Lê Sao)',
  },
  {
    id: 'skin_wishes_diamond',
    name: 'Bưu Tá Bầu Trời',
    desc: 'Mũ ca-lô cánh nhỏ & túi thư sao',
    image: '/images/player/skin_wishes_diamond.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'wishes_diamond',
    categoryId: 'wishes',
    tierKey: 'diamond',
    unlockShort: '💎 Lời Chúc',
    unlockLabel: 'Đạt Huy hiệu Sứ Giả Bầu Trời (Kim Cương)',
  },
  {
    id: 'skin_wishes_crystal',
    name: 'Người Giữ Ngân Hà',
    desc: 'Áo choàng ngân hà & lọ sao băng sáng',
    image: '/images/player/skin_wishes_crystal.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'wishes_crystal',
    categoryId: 'wishes',
    tierKey: 'crystal',
    unlockShort: '🔮 Lời Chúc',
    unlockLabel: 'Đạt Huy hiệu Sứ Giả Bầu Trời (Pha Lê Sao)',
  },
  {
    id: 'skin_explorer_diamond',
    name: 'Phi Công Thám Hiểm',
    desc: 'Kính phi công & la bàn ngôi sao',
    image: '/images/player/skin_explorer_diamond.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'explorer_diamond',
    categoryId: 'explorer',
    tierKey: 'diamond',
    unlockShort: '💎 Thám Hiểm',
    unlockLabel: 'Đạt Huy hiệu Thám Hiểm Thị Trấn (Kim Cương)',
  },
  {
    id: 'skin_explorer_crystal',
    name: 'Thuyền Trưởng Bầu Trời',
    desc: 'Mũ thuyền trưởng khinh khí cầu & ống nhòm',
    image: '/images/player/skin_explorer_crystal.webp',
    group: 'badge',
    unlockType: 'badge',
    requiredBadgeId: 'explorer_crystal',
    categoryId: 'explorer',
    tierKey: 'crystal',
    unlockShort: '🔮 Thám Hiểm',
    unlockLabel: 'Đạt Huy hiệu Thám Hiểm Thị Trấn (Pha Lê Sao)',
  },
];

export function isSkinUnlocked(skin, level = 0, unlockedBadgeIdSet = new Set()) {
  if (!skin) return false;
  if (skin.unlockType === 'free') return true;
  if (skin.unlockType === 'level') return level >= (skin.requiredLevel || 0);
  if (skin.unlockType === 'badge') return unlockedBadgeIdSet.has(skin.requiredBadgeId);
  return false;
}

export function getUnlockedSkins(level = 0, unlockedBadgeIdSet = new Set()) {
  return PLAYER_SKINS.filter((skin) => isSkinUnlocked(skin, level, unlockedBadgeIdSet));
}

export function getPlayerSkinById(skinId) {
  return PLAYER_SKINS.find((s) => s.id === skinId) || PLAYER_SKINS[0];
}
