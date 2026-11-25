import { SafeStorage, getTodayDateString } from './storage';

export const INWORLD_QUESTS_STORAGE_KEY = 'TTSB_INWORLD_QUESTS_V1';

/**
 * Các điểm spawn an toàn (trên đường đá / bãi cỏ trống đi được) trên 4 map
 * Kèm gợi ý vị trí tự nhiên để người chơi tự khám phá.
 */
const SPAWN_SPOTS_POOL = [
  // 1. Đỉnh Đồi Hy Vọng
  { mapId: 'map_hope_hill', mapName: 'Đỉnh Đồi Hy Vọng', x: 42.0, y: 58.5, hint: 'Gần lối đá phía tây Lọ Sao Hy Vọng' },
  { mapId: 'map_hope_hill', mapName: 'Đỉnh Đồi Hy Vọng', x: 64.0, y: 65.5, hint: 'Bên con đường đá gần Tiệm Bánh Bình Minh' },
  { mapId: 'map_hope_hill', mapName: 'Đỉnh Đồi Hy Vọng', x: 45.0, y: 83.5, hint: 'Dưới chân đồi gần Đài Sao' },
  { mapId: 'map_hope_hill', mapName: 'Đỉnh Đồi Hy Vọng', x: 52.0, y: 36.5, hint: 'Trên sườn đồi gần Nhà Của Bạn' },

  // 2. Thung Lũng Thiên Văn
  { mapId: 'map_astronomy_valley', mapName: 'Thung Lũng Thiên Văn', x: 35.0, y: 55.0, hint: 'Bên lối cỏ gần Tiệm Trà Tinh Vân' },
  { mapId: 'map_astronomy_valley', mapName: 'Thung Lũng Thiên Văn', x: 66.0, y: 54.0, hint: 'Gần Đài Quan Sát Bác Sao Thổ' },
  { mapId: 'map_astronomy_valley', mapName: 'Thung Lũng Thiên Văn', x: 49.0, y: 76.0, hint: 'Gần bờ Hồ Sen Ngân Hà phía dưới' },

  // 3. Ngõ Thời Tiết
  { mapId: 'map_weather_lane', mapName: 'Ngõ Thời Tiết', x: 34.0, y: 56.0, hint: 'Gần Nhà Kính Bé Sương Mai' },
  { mapId: 'map_weather_lane', mapName: 'Ngõ Thời Tiết', x: 65.0, y: 52.0, hint: 'Gần Cối Xay Gió Chú Gió Mát' },
  { mapId: 'map_weather_lane', mapName: 'Ngõ Thời Tiết', x: 52.0, y: 74.0, hint: 'Trên lối đi giữa Tiệm Kem Tuyết & Cà Phê Hoàng Hôn' },

  // 4. Hẻm Xoáy Tinh Nghịch
  { mapId: 'map_mischief_alley', mapName: 'Hẻm Xoáy Tinh Nghịch', x: 32.0, y: 52.0, hint: 'Gần Trạm Mưa Giông của Nhóc Mây Giông' },
  { mapId: 'map_mischief_alley', mapName: 'Hẻm Xoáy Tinh Nghịch', x: 64.0, y: 58.0, hint: 'Gần Lều Ảo Ảnh của Cậu Sương Mù' },
  { mapId: 'map_mischief_alley', mapName: 'Hẻm Xoáy Tinh Nghịch', x: 40.0, y: 78.0, hint: 'Dọc đường đá xoáy phía dưới Hầm Xoáy Nhỏ' },
];

// Hash deterministic theo chuỗi ngày để cùng 1 ngày vị trí random ổn định & trải đều các map
function seededRandom(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDistinctMapSpots(count, seedKey, excludeMapIds = []) {
  const rng = seededRandom(seedKey);
  const candidates = SPAWN_SPOTS_POOL.filter((s) => !excludeMapIds.includes(s.mapId));
  const shuffled = [...candidates].sort(() => rng() - 0.5);

  const picked = [];
  const usedMaps = new Set();

  // Ưu tiên chọn rải đều các map khác nhau trước
  for (const spot of shuffled) {
    if (picked.length >= count) break;
    if (!usedMaps.has(spot.mapId)) {
      picked.push(spot);
      usedMaps.add(spot.mapId);
    }
  }
  // Nếu cần thêm điểm hơn số map hiện có
  for (const spot of shuffled) {
    if (picked.length >= count) break;
    if (!picked.includes(spot)) {
      picked.push(spot);
    }
  }
  return picked;
}

export const INWORLD_QUEST_IDS = ['black_hole', 'mirage_fog', 'storm_cloud', 'whirlwind'];

export function buildDailyInWorldQuests(dateKey = getTodayDateString()) {
  const lostSpots = pickDistinctMapSpots(3, `${dateKey}:black_hole`);
  const bubbleSpots = pickDistinctMapSpots(3, `${dateKey}:mirage_fog`);
  const candySpots = pickDistinctMapSpots(1, `${dateKey}:storm_cloud`, ['map_mischief_alley']);
  const leafSpots = pickDistinctMapSpots(3, `${dateKey}:whirlwind`);

  return {
    dateKey,
    quests: {
      black_hole: {
        id: 'black_hole',
        npcId: 'black_hole',
        npcName: 'Bé Hố Đen',
        icon: '🕳️',
        title: 'Truy Tìm 3 Món Đồ Thất Lạc',
        desc: 'Tìm 3 món đồ bị Bé Hố Đen hút nhầm rơi rải rác khắp thị trấn.',
        rewardHearts: 2,
        requiresReturn: false,
        status: 'idle', // 'idle' | 'active' | 'ready_to_claim' | 'completed'
        targets: [
          { id: 'bh_1', icon: '🥄', label: 'Thìa kem tuyết', ...lostSpots[0], collected: false },
          { id: 'bh_2', icon: '👓', label: 'Kính đọc sách', ...lostSpots[1], collected: false },
          { id: 'bh_3', icon: '🥐', label: 'Bánh sừng bò', ...lostSpots[2], collected: false },
        ],
      },
      mirage_fog: {
        id: 'mirage_fog',
        npcId: 'mirage_fog',
        npcName: 'Cậu Sương Mù',
        icon: '🫧',
        title: 'Chạm Tan 3 Bong Bóng Ảo Ảnh',
        desc: 'Tìm và chạm vỡ 3 quả bong bóng suy diễn đang trôi trên các phân khu.',
        rewardHearts: 2,
        requiresReturn: false,
        status: 'idle',
        targets: [
          {
            id: 'mf_1',
            icon: '🫧',
            label: 'Bong bóng Lo Âu',
            truth: '🫧 Sự thật: Mọi người không chú ý lỗi nhỏ của bạn nhiều như bạn nghĩ đâu!',
            ...bubbleSpots[0],
            collected: false,
          },
          {
            id: 'mf_2',
            icon: '🫧',
            label: 'Bong bóng Suy Diễn',
            truth: '✨ Sự thật: Hầu hết những điều ta lo lắng thái quá đều chưa từng xảy ra.',
            ...bubbleSpots[1],
            collected: false,
          },
          {
            id: 'mf_3',
            icon: '🫧',
            label: 'Bong bóng Áp Lực',
            truth: '💖 Sự thật: Bạn được phép nghỉ ngơi mà không cần phải cảm thấy có lỗi.',
            ...bubbleSpots[2],
            collected: false,
          },
        ],
      },
      storm_cloud: {
        id: 'storm_cloud',
        npcId: 'storm_cloud',
        npcName: 'Nhóc Mây Giông',
        icon: '⛈️',
        title: 'Tìm Kẹo Ngọt Dỗ Nhóc Mây Giông',
        desc: 'Đi tìm viên kẹo dâu ngọt ngào rồi mang về Hẻm Xoáy dỗ Nhóc Mây Giông nín khóc.',
        rewardHearts: 2,
        requiresReturn: true,
        returnMapId: 'map_mischief_alley',
        returnHint: 'Quay lại Hẻm Xoáy Tinh Nghịch đưa kẹo cho Nhóc Mây Giông (Số 17)',
        status: 'idle',
        targets: [
          { id: 'sc_1', icon: '🍬', label: 'Viên Kẹo Dâu Ngọt', ...candySpots[0], collected: false },
        ],
      },
      whirlwind: {
        id: 'whirlwind',
        npcId: 'whirlwind',
        npcName: 'Tí Lốc Xoáy',
        icon: '🌪️',
        title: 'Thu Gom 3 Chiếc Lá Bị Cuốn Bay',
        desc: 'Tí Lốc Xoáy chạy quá nhanh làm bay 3 chiếc lá quý khắp thị trấn — hãy gom lại giúp Tí!',
        rewardHearts: 2,
        requiresReturn: false,
        status: 'idle',
        targets: [
          { id: 'ww_1', icon: '🍃', label: 'Lá Bạc Hà', ...leafSpots[0], collected: false },
          { id: 'ww_2', icon: '🍀', label: 'Cỏ Bốn Lá', ...leafSpots[1], collected: false },
          { id: 'ww_3', icon: '🍁', label: 'Lá Phong Đỏ', ...leafSpots[2], collected: false },
        ],
      },
    },
  };
}

export function loadDailyInWorldQuests() {
  const todayKey = getTodayDateString();
  try {
    const raw = SafeStorage.getItem(INWORLD_QUESTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.dateKey === todayKey && parsed.quests) {
        return parsed;
      }
    }
  } catch {}
  const fresh = buildDailyInWorldQuests(todayKey);
  SafeStorage.setItem(INWORLD_QUESTS_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveDailyInWorldQuests(state) {
  SafeStorage.setItem(INWORLD_QUESTS_STORAGE_KEY, JSON.stringify(state));
}
