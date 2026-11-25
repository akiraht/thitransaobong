import { SafeStorage, getTodayDateString } from './storage';
import { loadAdminCustomQuests } from './adminDataStore';

export const DAILY_QUESTS_STORAGE_KEY = 'TTSB_DAILY_QUESTS_V1';

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

const ALL_DAILY_QUEST_CANDIDATES = [
  // Lv.0 residents (8 cư dân khởi đầu trên Map 1, 2, 3)
  {
    id: 'dq_sun',
    actionType: 'sun',
    npcId: 'sun',
    npcName: 'Cô Nắng Mai',
    icon: '🥐',
    mapId: 'map_hope_hill',
    mapName: 'Đỉnh Đồi Hy Vọng',
    title: 'Bốc 1 chiếc bánh quy từ Cô Nắng Mai',
    rewardStars: 15,
  },
  {
    id: 'dq_moon',
    actionType: 'moon',
    npcId: 'moon',
    npcName: 'Chú Trăng Khuyết',
    icon: '🌙',
    mapId: 'map_astronomy_valley',
    mapName: 'Thung Lũng Thiên Văn',
    title: 'Thắp đèn bầu trời đêm cùng Chú Trăng Khuyết',
    rewardStars: 15,
  },
  {
    id: 'dq_daily_comic',
    actionType: 'read_daily_comic',
    npcId: 'aurora',
    npcName: 'Bà Cực Quang',
    icon: '📖',
    mapId: 'map_astronomy_valley',
    mapName: 'Thung Lũng Thiên Văn',
    title: 'Đọc xong 1 tập Truyện Tranh tại Lều Cực Quang',
    rewardStars: 20,
  },
  {
    id: 'dq_dewdrop',
    actionType: 'dewdrop',
    npcId: 'dewdrop',
    npcName: 'Bé Sương Mai',
    icon: '💧',
    mapId: 'map_weather_lane',
    mapName: 'Ngõ Thời Tiết',
    title: 'Ghé Nhà Kính Bé Sương Mai tưới mầm thói quen',
    rewardStars: 15,
  },
  {
    id: 'dq_breeze',
    actionType: 'breeze',
    npcId: 'breeze',
    npcName: 'Chú Gió Mát',
    icon: '🍃',
    mapId: 'map_weather_lane',
    mapName: 'Ngõ Thời Tiết',
    title: 'Thổi bay 1 muộn phiền tại Cối Xay Gió',
    rewardStars: 15,
  },
  {
    id: 'dq_sunset',
    actionType: 'sunset',
    npcId: 'sunset',
    npcName: 'Chị Hoàng Hôn',
    icon: '☕',
    mapId: 'map_weather_lane',
    mapName: 'Ngõ Thời Tiết',
    title: 'Ghé Cà Phê Hoàng Hôn ghi điều biết ơn cuối ngày',
    rewardStars: 15,
  },
  // Lv.1+ residents
  {
    id: 'dq_rainbow',
    actionType: 'rainbow',
    npcId: 'rainbow',
    npcName: 'Chị Cầu Vồng',
    icon: '🌈',
    mapId: 'map_hope_hill',
    mapName: 'Đỉnh Đồi Hy Vọng',
    title: 'Xem bản tin thời tiết cảm xúc của Chị Cầu Vồng',
    rewardStars: 15,
  },
  {
    id: 'dq_shooting_star',
    actionType: 'shooting_star',
    npcId: 'shooting_star',
    npcName: 'Bé Sao Băng',
    icon: '💌',
    mapId: 'map_hope_hill',
    mapName: 'Đỉnh Đồi Hy Vọng',
    title: 'Ghé Bưu Điện Bé Sao Băng gửi lời chúc bầu trời',
    rewardStars: 20,
  },
  {
    id: 'dq_nebula',
    actionType: 'nebula',
    npcId: 'nebula',
    npcName: 'Chị Ngân Hà',
    icon: '🍵',
    mapId: 'map_astronomy_valley',
    mapName: 'Thung Lũng Thiên Văn',
    title: 'Tập hít thở 4-4-4 thư giãn tại Tiệm Trà Chị Ngân Hà',
    rewardStars: 15,
  },
  // Lv.2+ residents
  {
    id: 'dq_spark',
    actionType: 'spark',
    npcId: 'spark',
    npcName: 'Anh Tia Chớp',
    icon: '🎧',
    mapId: 'map_hope_hill',
    mapName: 'Đỉnh Đồi Hy Vọng',
    title: 'Bật giai điệu Lofi thư giãn của Anh Tia Chớp',
    rewardStars: 10,
  },
  {
    id: 'dq_snowflake',
    actionType: 'snowflake',
    npcId: 'snowflake',
    npcName: 'Cô Tuyết Bông',
    icon: '❄️',
    mapId: 'map_weather_lane',
    mapName: 'Ngõ Thời Tiết',
    title: 'Đóng băng 1 khoảnh khắc vui cùng Cô Tuyết Bông',
    rewardStars: 15,
  },
  // Lv.3+ residents
  {
    id: 'dq_north_star',
    actionType: 'north_star',
    npcId: 'north_star',
    npcName: 'Ông Sao Bắc Đẩu',
    icon: '🧭',
    mapId: 'map_astronomy_valley',
    mapName: 'Thung Lũng Thiên Văn',
    title: 'Xoay La Bàn Định Hướng tại Ngọn Hải Đăng',
    rewardStars: 15,
  },
  {
    id: 'dq_mischief_any',
    actionType: 'inworld_quest_complete',
    npcId: 'storm_cloud',
    npcName: 'Cư dân Hẻm Xoáy',
    icon: '🌀',
    mapId: 'map_mischief_alley',
    mapName: 'Hẻm Xoáy Tinh Nghịch',
    title: 'Hoàn thành 1 nhiệm vụ trên bản đồ ở Hẻm Xoáy',
    rewardStars: 20,
  },
];

export function generateDailyQuestsForDate(dateKey = getTodayDateString(), unlockedResidentIds = null) {
  const rng = seededRandom(`DAILY_QUESTS:${dateKey}`);
  const customQuests = loadAdminCustomQuests().filter((q) => q && q.enabled !== false);
  const allCandidates = [...customQuests, ...ALL_DAILY_QUEST_CANDIDATES];

  const allowed = unlockedResidentIds
    ? allCandidates.filter(
        (q) =>
          q.questType === 'quiz' ||
          q.questType === 'collect' ||
          unlockedResidentIds.has(q.npcId)
      )
    : allCandidates;

  const pool = allowed.length >= 5 ? allowed : allCandidates.slice(0, 6);
  // Luôn ưu tiên có 1 nhiệm vụ đọc truyện tranh hôm nay + các nhiệm vụ tùy chỉnh từ Admin + ngẫu nhiên từ cư dân đã mở khóa
  const comicQuest = pool.find((q) => q.id === 'dq_daily_comic');
  const pinnedCustom = pool.filter((q) => q.isCustom && q.id !== 'dq_daily_comic');
  const others = pool
    .filter((q) => !q.isCustom && q.id !== 'dq_daily_comic')
    .sort(() => rng() - 0.5);

  const selected = [];
  if (comicQuest) selected.push({ ...comicQuest, done: false });
  for (const q of [...pinnedCustom, ...others]) {
    if (selected.length >= 5) break;
    const clonedTargets = Array.isArray(q.targets)
      ? q.targets.map((t) => ({ ...t, collected: false }))
      : undefined;
    selected.push({ ...q, ...(clonedTargets ? { targets: clonedTargets } : {}), done: false });
  }
  return selected;
}

export function forceRefreshTodayQuests(prevState, unlockedResidentIds = null) {
  const todayKey = getTodayDateString();
  const freshQuests = generateDailyQuestsForDate(todayKey, unlockedResidentIds);
  const doneIds = new Set((prevState?.quests || []).filter((q) => q.done).map((q) => q.id));
  const merged = freshQuests.map((q) => ({ ...q, done: doneIds.has(q.id) }));
  const next = {
    ...(prevState || {
      boxClaimed: false,
      dailyStreak: 0,
      lastStreakDate: null,
      totalQuestsCompleted: 0,
      bonusStars: 0,
    }),
    dateKey: todayKey,
    quests: merged,
  };
  saveDailyQuestsState(next);
  return next;
}

export function loadDailyQuestsState(unlockedResidentIds = null) {
  const todayKey = getTodayDateString();
  try {
    const raw = SafeStorage.getItem(DAILY_QUESTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.dateKey === todayKey && Array.isArray(parsed.quests)) {
        // Nếu có nhiệm vụ thuộc cư dân chưa mở khóa (từ bản cũ), lọc và thay bằng cư dân đã mở khóa
        if (unlockedResidentIds) {
          const hasLocked = parsed.quests.some((q) => !q.done && !unlockedResidentIds.has(q.npcId));
          if (hasLocked) {
            const refreshed = generateDailyQuestsForDate(todayKey, unlockedResidentIds);
            const doneMap = new Set(parsed.quests.filter((q) => q.done).map((q) => q.id));
            const merged = refreshed.map((q) => ({ ...q, done: doneMap.has(q.id) }));
            const next = { ...parsed, quests: merged };
            SafeStorage.setItem(DAILY_QUESTS_STORAGE_KEY, JSON.stringify(next));
            return next;
          }
        }
        return parsed;
      }
      if (parsed) {
        const next = {
          dateKey: todayKey,
          quests: generateDailyQuestsForDate(todayKey, unlockedResidentIds),
          boxClaimed: false,
          dailyStreak: Number(parsed.dailyStreak) || 0,
          lastStreakDate: parsed.lastStreakDate || null,
          totalQuestsCompleted: Number(parsed.totalQuestsCompleted) || 0,
          bonusStars: Number(parsed.bonusStars) || 0,
        };
        SafeStorage.setItem(DAILY_QUESTS_STORAGE_KEY, JSON.stringify(next));
        return next;
      }
    }
  } catch {}

  const fresh = {
    dateKey: todayKey,
    quests: generateDailyQuestsForDate(todayKey, unlockedResidentIds),
    boxClaimed: false,
    dailyStreak: 0,
    lastStreakDate: null,
    totalQuestsCompleted: 0,
    bonusStars: 0,
  };
  SafeStorage.setItem(DAILY_QUESTS_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveDailyQuestsState(state) {
  SafeStorage.setItem(DAILY_QUESTS_STORAGE_KEY, JSON.stringify(state));
}

function getYesterdayDateString(todayStr) {
  const [y, m, d] = todayStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function applyQuestAction(prevState, actionType) {
  if (!prevState || !Array.isArray(prevState.quests)) return { next: prevState, completedNow: null };
  let completedNow = null;
  let gainedStars = 0;

  const nextQuests = prevState.quests.map((q) => {
    if (!q.done && q.actionType === actionType) {
      completedNow = q;
      gainedStars += q.rewardStars || 15;
      return { ...q, done: true };
    }
    return q;
  });

  if (!completedNow) return { next: prevState, completedNow: null };

  const next = {
    ...prevState,
    quests: nextQuests,
    totalQuestsCompleted: (Number(prevState.totalQuestsCompleted) || 0) + 1,
    bonusStars: (Number(prevState.bonusStars) || 0) + gainedStars,
  };
  saveDailyQuestsState(next);
  return { next, completedNow };
}

export function applyQuestById(prevState, questId) {
  if (!prevState || !Array.isArray(prevState.quests)) return { next: prevState, completedNow: null };
  let completedNow = null;
  let gainedStars = 0;

  const nextQuests = prevState.quests.map((q) => {
    if (!q.done && q.id === questId) {
      completedNow = q;
      gainedStars += q.rewardStars || 15;
      return { ...q, done: true };
    }
    return q;
  });

  if (!completedNow) return { next: prevState, completedNow: null };

  const next = {
    ...prevState,
    quests: nextQuests,
    totalQuestsCompleted: (Number(prevState.totalQuestsCompleted) || 0) + 1,
    bonusStars: (Number(prevState.bonusStars) || 0) + gainedStars,
  };
  saveDailyQuestsState(next);
  return { next, completedNow };
}

export function applyDailyQuestItemCollect(prevState, questId, targetId) {
  if (!prevState || !Array.isArray(prevState.quests)) {
    return { next: prevState, collectedTarget: null, completedNow: null };
  }
  let collectedTarget = null;
  let completedNow = null;
  let gainedStars = 0;

  const nextQuests = prevState.quests.map((q) => {
    if (q.id !== questId || q.done || !Array.isArray(q.targets)) return q;
    const nextTargets = q.targets.map((t) => {
      if (t.id === targetId && !t.collected) {
        collectedTarget = t;
        return { ...t, collected: true };
      }
      return t;
    });
    if (!collectedTarget) return q;
    const allDone = nextTargets.every((t) => t.collected);
    if (allDone) {
      completedNow = { ...q, targets: nextTargets, done: true };
      gainedStars += q.rewardStars || 20;
      return completedNow;
    }
    return { ...q, targets: nextTargets };
  });

  if (!collectedTarget) return { next: prevState, collectedTarget: null, completedNow: null };

  const next = {
    ...prevState,
    quests: nextQuests,
    totalQuestsCompleted: completedNow
      ? (Number(prevState.totalQuestsCompleted) || 0) + 1
      : Number(prevState.totalQuestsCompleted) || 0,
    bonusStars: (Number(prevState.bonusStars) || 0) + gainedStars,
  };
  saveDailyQuestsState(next);
  return { next, collectedTarget, completedNow };
}

export function claimDailyCompletionBox(prevState) {
  if (!prevState || prevState.boxClaimed) return prevState;
  const allDone = prevState.quests.every((q) => q.done);
  if (!allDone) return prevState;

  const today = prevState.dateKey;
  const yesterday = getYesterdayDateString(today);
  const isConsecutive = prevState.lastStreakDate === yesterday;
  const nextStreak = isConsecutive ? (Number(prevState.dailyStreak) || 0) + 1 : 1;

  const next = {
    ...prevState,
    boxClaimed: true,
    dailyStreak: nextStreak,
    lastStreakDate: today,
    bonusStars: (Number(prevState.bonusStars) || 0) + 50,
  };
  saveDailyQuestsState(next);
  return next;
}
