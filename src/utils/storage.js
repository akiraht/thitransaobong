import {
  STORAGE_KEY,
  RESIDENT_STORAGE_KEY,
  TOTAL_INITIAL_STARS,
  DEFAULT_SHEET_WISHES
} from '../config/constants';

export const SafeStorage = {
  mem: {},
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return Object.prototype.hasOwnProperty.call(this.mem, key) ? this.mem[key] : null;
    }
  },
  setItem(key, val) {
    try {
      window.localStorage.setItem(key, val);
    } catch (e) {
      this.mem[key] = String(val);
    }
  }
};

export function getTodayDateString() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch (e) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export function formatDurationHMS(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function loadInitialState() {
  const todayStr = getTodayDateString();
  let saved = null;
  try {
    const raw = SafeStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {
    saved = null;
  }

  if (!saved || saved.dateKey !== todayStr) {
    const fresh = {
      dateKey: todayStr,
      selectedMood: null,
      sharedRemainingStars: TOTAL_INITIAL_STARS,
      drawnStarIds: [],
      lastDrawTimestamp: 0,
      todayHistory: [],
      townUnlockedToday: false,
      wishSubmittedToday: false,
      sheetWishes: saved && Array.isArray(saved.sheetWishes) ? saved.sheetWishes : DEFAULT_SHEET_WISHES
    };
    SafeStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  if (typeof saved.sharedRemainingStars !== 'number') {
    saved.sharedRemainingStars = Math.max(
      0,
      TOTAL_INITIAL_STARS - (saved.drawnStarIds ? saved.drawnStarIds.length : 0)
    );
  }
  if (typeof saved.townUnlockedToday !== 'boolean') {
    saved.townUnlockedToday = (saved.todayHistory && saved.todayHistory.length > 0) || false;
  }
  if (!Array.isArray(saved.sheetWishes)) {
    saved.sheetWishes = DEFAULT_SHEET_WISHES;
  }
  return saved;
}

export function loadResidentProfile() {
  try {
    const raw = SafeStorage.getItem(RESIDENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return {
    isLoggedIn: false,
    nickname: '',
    pin: '',
    savedStars: [],
    mySentWishes: [],
    likedWishIds: [],
    moodCalendar: []
  };
}
