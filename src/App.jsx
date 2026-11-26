import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GOOGLE_SHEET_SCRIPT_URL,
  TOTAL_INITIAL_STARS,
  COOLDOWN_MS,
  STORAGE_KEY,
  RESIDENT_STORAGE_KEY,
  MOOD_CONFIG,
  DAILY_SUNNY_QUESTS
} from './config/constants';
import {
  SafeStorage,
  getTodayDateString,
  formatDurationHMS,
  loadInitialState,
  loadResidentProfile
} from './utils/storage';
import { buildQuotesDatabase } from './data/quotesData';
import CharacterAvatar from './components/CharacterAvatar';
import TownStreetScene from './components/TownStreetScene';
import ComicSpeechModal from './components/ComicSpeechModal';
import OnboardingModals from './components/OnboardingModals';
import UserHouseModal from './components/UserHouseModal';
import SkillModals from './components/SkillModals';
import ExtendedSkillModals from './components/ExtendedSkillModals';
import DailyComicModal from './components/DailyComicModal';
import CelebrationShareModal from './components/CelebrationShareModal';
import HistorySidebar from './components/HistorySidebar';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { townAudio } from './utils/audioEngine';
import {
  ALL_BADGES,
  getLevelInfoFromBadgeCount,
  getResidentUnlockLevel,
  getUnlockedSkins,
} from './config/progressionConfig';
import { TOWN_CHARACTERS } from './data/characterSprites';
import {
  INWORLD_QUEST_IDS,
  loadDailyInWorldQuests,
  saveDailyInWorldQuests,
  buildDailyInWorldQuests,
} from './utils/inWorldQuests';
import {
  loadDailyQuestsState,
  applyQuestAction,
  applyQuestById,
  applyDailyQuestItemCollect,
  claimDailyCompletionBox,
} from './utils/dailyQuestService';
import {
  loadCollectedComics,
  saveCollectedComics,
} from './data/dailyComicsData';
import { getAllAdminComics } from './utils/adminDataStore';
import {
  fetchClientIp,
  updateUserProfileInfo,
  checkCurrentUserBlocked,
  ensureSeedTestAccounts,
} from './utils/userAuthService';
import { consumePendingMiniGameRewards } from './config/minigamesConfig';

export default function App() {
  const quotesByMood = useMemo(() => buildQuotesDatabase(), []);
  const [appState, setAppState] = useState(() => loadInitialState());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Onboarding Modal Step:
  // If user hasn't drawn a star today, automatically starts with 'mood' modal ("Ngày hôm nay của bạn thế nào?")
  const [modalStep, setModalStep] = useState(() => {
    const init = loadInitialState();
    return init.townUnlockedToday ? null : 'mood';
  });
  const [activeLetter, setActiveLetter] = useState(null);
  const [isJarShaking, setIsJarShaking] = useState(false);
  const [welcomeBannerVisible, setWelcomeBannerVisible] = useState(false);

  // Comic Speech Modal State when clicking a character on the street
  const [selectedStreetChar, setSelectedStreetChar] = useState(null);

  // Resident Profile & Town Features States
  const [resident, setResident] = useState(() => loadResidentProfile());
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [residentTab, setResidentTab] = useState('card');
  const [authNicknameInput, setAuthNicknameInput] = useState('');
  const [authPinInput, setAuthPinInput] = useState('');
  const [isNightMode, setIsNightMode] = useState(false);
  const [timeMode, setTimeMode] = useState('auto'); // 'auto' | 'morning' | 'afternoon' | 'evening' | 'night'

  const timePeriod = useMemo(() => {
    if (isNightMode) return 'night';
    if (timeMode !== 'auto') return timeMode;
    const now = new Date(nowMs);
    const timeVal = now.getHours() + now.getMinutes() / 60;
    // 05:30 -> 11:00: Buổi sáng trong veo
    if (timeVal >= 5.5 && timeVal < 11.0) return 'morning';
    // 11:00 -> 17:30: Buổi trưa chiều vàng ấm
    if (timeVal >= 11.0 && timeVal < 17.5) return 'afternoon';
    // 17:30 -> 19:15: Buổi tối chập choạng hoàng hôn
    if (timeVal >= 17.5 && timeVal < 19.25) return 'evening';
    // 19:15 -> 05:30: Ban đêm sâu thẳm đầy sao & đom đóm
    return 'night';
  }, [nowMs, timeMode, isNightMode]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [activeAmbientSound, setActiveAmbientSound] = useState(null);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(15);
  const [activeSkillPanel, setActiveSkillPanel] = useState(null); // null | 'weather' | 'breathe' | 'quest' | 'wish'
  const [activeExtendedSkill, setActiveExtendedSkill] = useState(null); // cư dân 09-16
  const [isComicModalOpen, setIsComicModalOpen] = useState(false);
  const [adminComics, setAdminComics] = useState([]);

  useEffect(() => {
    getAllAdminComics().then((list) => setAdminComics(list));
  }, []);
  const [hasReadTodayComic, setHasReadTodayComic] = useState(() => {
    try {
      return SafeStorage.getItem('TTSB_READ_COMIC_DATE_V1') === getTodayDateString();
    } catch {
      return false;
    }
  });
  const [collectedComics, setCollectedComics] = useState(() => loadCollectedComics());
  const [dailyQuestsState, setDailyQuestsState] = useState(() =>
    loadDailyQuestsState(getLevelInfoFromBadgeCount(0).unlockedResidentIds)
  );
  const [inWorldQuests, setInWorldQuests] = useState(() => loadDailyInWorldQuests());
  const [isQuestHudOpen, setIsQuestHudOpen] = useState(false);
  const [celebrationQueue, setCelebrationQueue] = useState([]);

  const enqueueCelebration = (evt) => {
    if (!evt) return;
    setCelebrationQueue((prev) => [...prev, evt]);
  };
  const [dailyQuestText, setDailyQuestText] = useState(DAILY_SUNNY_QUESTS[0]);
  const [breathePhase, setBreathePhase] = useState('🌬️ Hít vào nhẹ nhàng... (4 giây)');
  const [toastMsg, setToastMsg] = useState('');

  // Footer Wish Form States
  const [nickname, setNickname] = useState(() => loadResidentProfile().nickname || '');
  const [wishMood, setWishMood] = useState('all');
  const [wishStamp, setWishStamp] = useState('star');
  const [wishMessage, setWishMessage] = useState('');
  const [wishError, setWishError] = useState(false);

  const toastTimeoutRef = useRef(null);
  const sleepTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg('');
    }, 3400);
  };

  const updateState = (updater) => {
    setAppState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      SafeStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateResident = (updater) => {
    setResident((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      SafeStorage.setItem(RESIDENT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const residentStats = useMemo(() => {
    const cleanName = (resident.nickname || '').trim().toLowerCase();
    const sheetMatchedWishes = (appState.sheetWishes || []).filter(
      (w) => cleanName && (w.nickname || '').trim().toLowerCase() === cleanName
    );
    const localSent = resident.mySentWishes || [];
    const mergedMap = new Map();
    [...localSent, ...sheetMatchedWishes].forEach((w) => {
      if (w && w.id) mergedMap.set(w.id, w);
    });
    const myWishesList = Array.from(mergedMap.values());
    const totalLikesReceived = myWishesList.reduce((sum, w) => sum + (Number(w.likes) || 0), 0);
    const preset = resident.isLoggedIn ? resident.testPresetStats : null;
    const isBasicPreset = resident.isLoggedIn && resident.testPresetType === 'basic';
    const isVipPreset = resident.isLoggedIn && resident.testPresetType === 'vip_full';

    const rawStats = {
      wishesSent: myWishesList.length,
      likesReceived: totalLikesReceived + (Number(resident.townHearts) || 0),
      savedCount: (resident.savedStars || []).length,
      wishesAndMemories: myWishesList.length + (resident.savedStars || []).length,
      dailyStreak: dailyQuestsState?.dailyStreak || 0,
      totalQuestsCompleted: dailyQuestsState?.totalQuestsCompleted || 0,
      collectedComicsCount: collectedComics.length,
      exploredActionsCount: Number(resident.exploredActionsCount) || 0,
      myWishesList
    };

    const stats = isVipPreset && preset
      ? {
          ...rawStats,
          totalQuestsCompleted: Math.max(rawStats.totalQuestsCompleted, preset.totalQuestsCompleted),
          dailyStreak: Math.max(rawStats.dailyStreak, preset.dailyStreak),
          collectedComicsCount: Math.max(rawStats.collectedComicsCount, preset.collectedComicsCount),
          likesReceived: Math.max(rawStats.likesReceived, preset.likesReceived),
          wishesAndMemories: Math.max(rawStats.wishesAndMemories, preset.wishesAndMemories),
          exploredActionsCount: Math.max(rawStats.exploredActionsCount, preset.exploredActionsCount),
        }
      : isBasicPreset
        ? {
            ...rawStats,
            totalQuestsCompleted: 0,
            dailyStreak: 0,
            collectedComicsCount: 0,
            likesReceived: 0,
            wishesAndMemories: 0,
            exploredActionsCount: 0,
          }
        : rawStats;
    const unlockedBadges = ALL_BADGES.filter((b) => b.check(stats));
    const unlockedBadgeIdSet = new Set(unlockedBadges.map((b) => b.id));
    const levelInfo = getLevelInfoFromBadgeCount(unlockedBadges.length);
    const unlockedSkins = getUnlockedSkins(levelInfo.level, unlockedBadgeIdSet);
    const pinnedBadge = resident.pinnedBadgeId
      ? unlockedBadges.find((b) => b.id === resident.pinnedBadgeId)
      : null;
    const highestTierBadge = unlockedBadges.reduce(
      (best, b) => (!best || b.tier >= best.tier ? b : best),
      null
    );
    const currentBadge = pinnedBadge || highestTierBadge || {
      icon: '🌱',
      title: levelInfo.title,
    };
    return {
      ...stats,
      unlockedBadges,
      unlockedSkins,
      levelInfo,
      currentBadge,
      currentTitle: levelInfo.title
    };
  }, [resident, appState.sheetWishes, dailyQuestsState, collectedComics]);

  // Theo dõi mở khóa Huy hiệu mới, Skin mới & Lên Cấp (Level Up) -> Bật Modal Chúc Mừng + Nút Share MXH
  const progressionInitRef = useRef(false);
  const prevUnlockedIdsRef = useRef(new Set());
  const prevUnlockedSkinIdsRef = useRef(new Set());
  const prevLevelRef = useRef(0);

  useEffect(() => {
    const unlockedIds = residentStats.unlockedBadges.map((b) => b.id);
    const unlockedSkinIds = (residentStats.unlockedSkins || []).map((s) => s.id);
    const currentLv = residentStats.levelInfo.level;

    if (!progressionInitRef.current) {
      // Khởi tạo từ SafeStorage để không bắn lại modal cũ khi reload trang
      try {
        const storedSeen = JSON.parse(SafeStorage.getItem('TTSB_SEEN_BADGES_V1') || 'null');
        const storedSeenSkins = JSON.parse(SafeStorage.getItem('TTSB_SEEN_SKINS_V1') || 'null');
        const storedLv = SafeStorage.getItem('TTSB_SEEN_LEVEL_V1');
        if (Array.isArray(storedSeen)) {
          prevUnlockedIdsRef.current = new Set(storedSeen);
        } else {
          prevUnlockedIdsRef.current = new Set(unlockedIds);
          SafeStorage.setItem('TTSB_SEEN_BADGES_V1', JSON.stringify(unlockedIds));
        }
        if (Array.isArray(storedSeenSkins)) {
          prevUnlockedSkinIdsRef.current = new Set(storedSeenSkins);
        } else {
          prevUnlockedSkinIdsRef.current = new Set(unlockedSkinIds);
          SafeStorage.setItem('TTSB_SEEN_SKINS_V1', JSON.stringify(unlockedSkinIds));
        }
        if (storedLv !== null) {
          prevLevelRef.current = Number(storedLv) || 0;
        } else {
          prevLevelRef.current = currentLv;
          SafeStorage.setItem('TTSB_SEEN_LEVEL_V1', String(currentLv));
        }
      } catch {
        prevUnlockedIdsRef.current = new Set(unlockedIds);
        prevUnlockedSkinIdsRef.current = new Set(unlockedSkinIds);
        prevLevelRef.current = currentLv;
      }
      progressionInitRef.current = true;
      return;
    }

    // 1. Kiểm tra huy hiệu mới đạt được
    const newlyUnlocked = residentStats.unlockedBadges.filter(
      (b) => !prevUnlockedIdsRef.current.has(b.id)
    );
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((b) => {
        prevUnlockedIdsRef.current.add(b.id);
        enqueueCelebration({
          type: 'badge',
          icon: b.tierEmoji,
          badgeImage: b.image,
          badgeTierKey: b.tierKey,
          badgeTitleName: b.titleName,
          badgeBg: b.tierBg,
          badgeBorder: b.tierBorder,
          subtitle: `🏅 Huy Hiệu Bậc ${b.tierName} Mới!`,
          title: b.name,
          description: `${b.desc} — Đã đạt ${residentStats.unlockedBadges.length}/${ALL_BADGES.length} huy hiệu!`,
          shareText: `🏅 Mình vừa mở khóa huy hiệu "${b.name}" (${b.tierEmoji} ${b.titleName}) tại Thị Trấn Sao Bông!`,
        });
      });
      SafeStorage.setItem(
        'TTSB_SEEN_BADGES_V1',
        JSON.stringify(Array.from(prevUnlockedIdsRef.current))
      );
    }

    // 2. Kiểm tra lên Level mới (+ Thông báo đặc biệt khi mở khóa Map 4: Hẻm Xoáy ở LV.1)
    if (currentLv > prevLevelRef.current) {
      const prevLv = prevLevelRef.current;
      const lvDef = residentStats.levelInfo.currentDef;
      const unlockedNames = (lvDef.unlockResidents || []).map((cid) => {
        const found = TOWN_CHARACTERS.find((c) => c.id === cid);
        return found ? found.name : cid;
      });
      prevLevelRef.current = currentLv;
      SafeStorage.setItem('TTSB_SEEN_LEVEL_V1', String(currentLv));

      if (prevLv < 1 && currentLv >= 1) {
        enqueueCelebration({
          type: 'level_up',
          icon: '🌀',
          badgeBg: '#FFE4EE',
          badgeBorder: '#E11D48',
          subtitle: '🎉 MỞ KHÓA BẢN ĐỒ MỚI — MAP 4!',
          title: '🌀 Hẻm Xoáy Tinh Nghịch Đã Mở Cửa!',
          description:
            'Chúc mừng bạn đạt LV.1 (2 Huy Hiệu)! Cổng vào Hẻm Xoáy Tinh Nghịch cùng 4 cư dân siêu quậy và Mini-Game Đại Chiến Lâu Đài Tuyết đã sẵn sàng chờ bạn khám phá!',
          unlockedNames: ['Nhóc Mây Giông', 'Tí Lốc Xoáy', 'Bé Hố Đen', 'Cậu Sương Mù'],
          shareText:
            '🌀 Mình vừa đạt LV.1 và mở khóa Khu Phố Bí Mật Hẻm Xoáy Tinh Nghịch tại Thị Trấn Sao Bông!',
        });
      } else {
        enqueueCelebration({
          type: 'level_up',
          icon: '⬆️',
          badgeBg: '#FFF4BD',
          badgeBorder: '#CA8A04',
          subtitle: `🎉 Chúc Mừng Lên Cấp LV.${currentLv}!`,
          title: lvDef.title,
          description: lvDef.unlockNote,
          unlockedNames,
          shareText: `🎉 Mình vừa lên LV.${currentLv} (${lvDef.title}) tại Thị Trấn Sao Bông!`,
        });
      }
    }

    // 3. Kiểm tra Skin trang phục mới mở khóa (theo LV > 2 hoặc Huy hiệu Kim Cương / Pha Lê Sao)
    const newlyUnlockedSkins = (residentStats.unlockedSkins || []).filter(
      (s) => s.unlockType !== 'free' && !prevUnlockedSkinIdsRef.current.has(s.id)
    );
    if (newlyUnlockedSkins.length > 0) {
      newlyUnlockedSkins.forEach((s) => {
        prevUnlockedSkinIdsRef.current.add(s.id);
        enqueueCelebration({
          type: 'skin_unlock',
          icon: '🎭',
          badgeImage: s.image,
          badgeTierKey: s.tierKey || 'gold',
          badgeTitleName: s.unlockShort,
          badgeBg: s.tierKey === 'crystal' ? '#F3E8FF' : s.tierKey === 'diamond' ? '#E0F2FE' : '#FEF9C3',
          badgeBorder: s.tierKey === 'crystal' ? '#9333EA' : s.tierKey === 'diamond' ? '#0284C7' : '#CA8A04',
          subtitle: '🎭 Mở Khóa Trang Phục Skin Mới!',
          title: s.name,
          description: `${s.desc} — Về Ngôi Nhà Của Bạn → Tủ Đồ Skin để mặc thử ngay nhé!`,
          shareText: `🎭 Mình vừa mở khóa trang phục "${s.name}" cho Bé Sao Bông tại Thị Trấn Sao Bông! ✨`,
        });
      });
      SafeStorage.setItem(
        'TTSB_SEEN_SKINS_V1',
        JSON.stringify(Array.from(prevUnlockedSkinIdsRef.current))
      );
    }
  }, [residentStats.unlockedBadges, residentStats.unlockedSkins, residentStats.levelInfo]);

  // Đồng bộ danh sách nhiệm vụ ngày với cư dân đã mở khóa
  useEffect(() => {
    setDailyQuestsState((prev) => {
      const allowed = residentStats.levelInfo.unlockedResidentIds;
      const hasLocked = (prev?.quests || []).some((q) => !q.done && !allowed.has(q.npcId));
      if (!hasLocked) return prev;
      return loadDailyQuestsState(allowed);
    });
  }, [residentStats.levelInfo.level]);

  useEffect(() => {
    if (activeSkillPanel !== 'breathe') return;
    const phases = [
      '🌬️ Hít vào nhẹ nhàng... (4 giây)',
      '✨ Giữ hơi ấm trong tim... (4 giây)',
      '🍃 Thở ra mọi mệt mỏi... (4 giây)'
    ];
    let idx = 0;
    setBreathePhase(phases[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setBreathePhase(phases[idx]);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeSkillPanel]);

  const toggleMusicBox = () => {
    if (isMusicPlaying) {
      townAudio.stopLofi();
      setIsMusicPlaying(false);
      showToast('🔇 Đã tắt đài nhạc Lofi của Anh Tia Chớp.');
      return;
    }
    const started = townAudio.startLofi();
    if (started) {
      setIsMusicPlaying(true);
      showToast('🎧 Đang phát giai điệu Lofi Sao Bông êm dịu!');
    } else {
      showToast('⚠️ Trình duyệt của bạn đang chặn phát âm thanh.');
    }
  };

  const handleStopAmbient = () => {
    townAudio.stopAmbient();
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
    setActiveAmbientSound(null);
    showToast('🔇 Đã tắt âm thanh ru ngủ của Bé Đom Đóm.');
  };

  const handleStartAmbient = (type, minutes = 15) => {
    const started = townAudio.startAmbient(type);
    if (!started) {
      showToast('⚠️ Trình duyệt đang chặn phát âm thanh.');
      return;
    }
    setActiveAmbientSound(type);
    setSleepTimerMinutes(minutes);
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    sleepTimeoutRef.current = setTimeout(() => {
      townAudio.stopAmbient();
      setActiveAmbientSound(null);
    }, minutes * 60 * 1000);

    const labels = {
      rain: '🌧️ Đang phát tiếng Mưa Rơi êm dịu',
      night_breeze: '🌙 Đang phát tiếng Gió Đêm Hè',
      fireplace: '🔥 Đang phát tiếng Lửa Trại tí tách',
    };
    showToast(`${labels[type] || '🎵 Đang phát âm thanh'} (tự tắt sau ${minutes}p)`);
  };

  const handleRewardHearts = (sourceId, amount, message) => {
    const todayKey = getTodayDateString();
    const claimKey = `${todayKey}:${sourceId}`;
    const alreadyClaimed = (resident.claimedDailyRewards || []).includes(claimKey);
    if (!alreadyClaimed) {
      updateResident((prev) => ({
        ...prev,
        townHearts: (Number(prev.townHearts) || 0) + amount,
        claimedDailyRewards: [...(prev.claimedDailyRewards || []).slice(-30), claimKey],
      }));
    }
    showToast(alreadyClaimed ? `${message.replace(/\(\+\d+ Tim\)/, '').trim()} (Đã nhận tim hôm nay rồi 💖)` : message);
  };

  const updateInWorldQuests = (updater) => {
    setInWorldQuests((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveDailyInWorldQuests(next);
      return next;
    });
  };

  const triggerDailyQuestProgress = (actionType) => {
    setDailyQuestsState((prev) => {
      const { next, completedNow } = applyQuestAction(prev, actionType);
      if (completedNow) {
        setTimeout(() => {
          showToast(`🎯 Xong nhiệm vụ ngày: "${completedNow.title}" (+${completedNow.rewardStars} ⭐)`);
        }, 120);
      }
      return next;
    });
  };

  const handleClaimDailyBox = () => {
    setDailyQuestsState((prev) => {
      const next = claimDailyCompletionBox(prev);
      if (next !== prev) {
        showToast(`🎁 Nhận +50 Sao Bông! Chuỗi chuyên cần: 🔥 ${next.dailyStreak} ngày!`);
      }
      return next;
    });
  };

  const handleCompleteDailyQuiz = (questId, explanation) => {
    setDailyQuestsState((prev) => {
      const { next, completedNow } = applyQuestById(prev, questId);
      if (completedNow) {
        setTimeout(() => {
          showToast(
            explanation
              ? `🎉 ${explanation} (+${completedNow.rewardStars} ⭐)`
              : `🎉 Trả lời chính xác! Xong "${completedNow.title}" (+${completedNow.rewardStars} ⭐)`
          );
        }, 80);
      }
      return next;
    });
  };

  const handleCollectDailyQuestItem = (questId, targetId) => {
    setDailyQuestsState((prev) => {
      const { next, collectedTarget, completedNow } = applyDailyQuestItemCollect(prev, questId, targetId);
      if (completedNow) {
        setTimeout(() => {
          showToast(`🎉 Đã tìm đủ vật phẩm cho "${completedNow.title}" (+${completedNow.rewardStars} ⭐)`);
        }, 80);
      } else if (collectedTarget) {
        setTimeout(() => {
          showToast(`${collectedTarget.icon || '✨'} Đã nhặt ${collectedTarget.label}!`);
        }, 80);
      }
      return next;
    });
  };

  const handleCollectComic = (comic) => {
    if (!comic || !comic.id) return;
    if (collectedComics.some((c) => c.id === comic.id)) {
      showToast('📚 Tập truyện này đã có trong Tủ Sách Kỷ Niệm rồi!');
      return;
    }
    const next = [comic, ...collectedComics];
    setCollectedComics(next);
    saveCollectedComics(next);
    showToast(`📚 Đã sưu tầm "${comic.title}" vào Tủ Sách của Bác Sao Thổ! (${next.length}/7)`);
  };

  const handleAcceptInWorldQuest = (questId) => {
    const q = inWorldQuests?.quests?.[questId];
    if (!q || q.status !== 'idle') return;
    updateInWorldQuests((prev) => ({
      ...prev,
      quests: {
        ...prev.quests,
        [questId]: { ...prev.quests[questId], status: 'active' },
      },
    }));
    showToast(`📜 Đã nhận "${q.title}"! Chạm icon 📜 góc trên trái để xem gợi ý vị trí trên các map.`);
  };

  const handleCollectQuestTarget = (questId, targetId) => {
    const q = inWorldQuests?.quests?.[questId];
    if (!q || q.status !== 'active') return;
    const target = q.targets.find((t) => t.id === targetId);
    if (!target || target.collected) return;

    const nextTargets = q.targets.map((t) => (t.id === targetId ? { ...t, collected: true } : t));
    const collectedCount = nextTargets.filter((t) => t.collected).length;
    const allDone = collectedCount >= nextTargets.length;

    let nextStatus = 'active';
    if (allDone) {
      nextStatus = q.requiresReturn ? 'ready_to_claim' : 'completed';
    }

    updateInWorldQuests((prev) => ({
      ...prev,
      quests: {
        ...prev.quests,
        [questId]: {
          ...prev.quests[questId],
          status: nextStatus,
          targets: nextTargets,
        },
      },
    }));

    if (allDone) {
      if (q.requiresReturn) {
        showToast(`${target.icon} Đã nhặt ${target.label}! ${q.returnHint}`);
      } else {
        handleRewardHearts(
          questId,
          q.rewardHearts,
          `🎉 Hoàn thành "${q.title}"! (+${q.rewardHearts} Tim)`
        );
        triggerDailyQuestProgress('inworld_quest_complete');
      }
    } else if (target.truth) {
      showToast(`${target.truth} (${collectedCount}/${nextTargets.length})`);
    } else {
      showToast(`${target.icon} Đã thu thập ${target.label}! (${collectedCount}/${nextTargets.length})`);
    }
  };

  const handleClaimInWorldQuest = (questId) => {
    const q = inWorldQuests?.quests?.[questId];
    if (!q || q.status !== 'ready_to_claim') return;
    updateInWorldQuests((prev) => ({
      ...prev,
      quests: {
        ...prev.quests,
        [questId]: { ...prev.quests[questId], status: 'completed' },
      },
    }));
    handleRewardHearts(
      questId,
      q.rewardHearts,
      `🌈 ${q.npcName} vui lắm! Hoàn thành "${q.title}" (+${q.rewardHearts} Tim)`
    );
    triggerDailyQuestProgress('inworld_quest_complete');
  };

  useEffect(() => {
    return () => {
      townAudio.stopLofi();
      townAudio.stopAmbient();
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    };
  }, []);

  const syncFromGoogleSheet = () => {
    if (!GOOGLE_SHEET_SCRIPT_URL || !GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) return;
    fetch(GOOGLE_SHEET_SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        updateState((prev) => {
          const next = { ...prev };
          if (typeof data.remainingStars === 'number') {
            next.sharedRemainingStars = Math.max(0, data.remainingStars);
          }
          if (Array.isArray(data.wishes)) {
            next.sheetWishes = data.wishes.map((w, idx) => ({
              id: w.id || 'GSHEET-' + idx,
              timestamp: w.timestamp || '',
              nickname: w.nickname || 'Người lạ',
              authorTitle: w.authorTitle || '🕊️ Sứ Giả Bầu Trời',
              stamp: w.stamp || 'star',
              likes: Number(w.likes) || 0,
              mood: w.mood || 'all',
              message: w.message || '',
              approved: true
            }));
          }
          return next;
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTs = Date.now();
      setNowMs(currentTs);

      const todayStr = getTodayDateString();
      setAppState((prev) => {
        if (prev.dateKey !== todayStr) {
          const resetState = {
            ...prev,
            dateKey: todayStr,
            selectedMood: null,
            sharedRemainingStars: TOTAL_INITIAL_STARS,
            drawnStarIds: [],
            lastDrawTimestamp: 0,
            todayHistory: [],
            townUnlockedToday: false,
            wishSubmittedToday: false
          };
          SafeStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
          const freshQuests = buildDailyInWorldQuests(todayStr);
          saveDailyInWorldQuests(freshQuests);
          setInWorldQuests(freshQuests);
          setDailyQuestsState(loadDailyQuestsState());
          setHasReadTodayComic(false);
          setModalStep('mood');
          return resetState;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    syncFromGoogleSheet();
    const syncTimer = setInterval(syncFromGoogleSheet, 30000);
    return () => clearInterval(syncTimer);
  }, []);

  const remainingCooldownMs = appState.lastDrawTimestamp
    ? Math.max(0, COOLDOWN_MS - (nowMs - appState.lastDrawTimestamp))
    : 0;

  const remainingStarsCount =
    typeof appState.sharedRemainingStars === 'number'
      ? Math.max(0, appState.sharedRemainingStars)
      : Math.max(0, TOTAL_INITIAL_STARS - (appState.drawnStarIds ? appState.drawnStarIds.length : 0));

  // Bước 1: Chọn cảm xúc trong Modal
  const handleSelectMood = (moodKey) => {
    updateState((prev) => ({
      ...prev,
      selectedMood: moodKey
    }));

    const todayKey = getTodayDateString();
    updateResident((prev) => {
      const cal = Array.isArray(prev.moodCalendar) ? [...prev.moodCalendar] : [];
      const filtered = cal.filter((item) => item.dateKey !== todayKey);
      return {
        ...prev,
        moodCalendar: [{ dateKey: todayKey, mood: moodKey }, ...filtered].slice(0, 7)
      };
    });
  };

  // Bước 2: Bấm "Mở hộp sao" -> Ẩn Modal cảm xúc & Hiện Modal Hộp Sao
  const handleProceedToJarModal = () => {
    if (!appState.selectedMood) {
      showToast('👆 Hãy chọn cảm xúc của bạn trước nhé!');
      return;
    }
    setModalStep('jar');
  };

  // Bước 3: Mở sao trong Modal Hộp Sao -> Hiện Modal Bức Thư Ngôi Sao Hy Vọng
  const handleDrawStar = () => {
    if (remainingCooldownMs > 0) {
      showToast(`⏳ Mỗi thiết bị chỉ mở sao 4 giờ 1 lần! Còn ${formatDurationHMS(remainingCooldownMs)} nữa nhé.`);
      return;
    }

    if (!appState.selectedMood || !MOOD_CONFIG[appState.selectedMood]) {
      setModalStep('mood');
      return;
    }

    if (remainingStarsCount <= 0) {
      showToast('🌟 Cả 2,000 ngôi sao hôm nay đã được mở hết! Hộp sao sẽ tự động làm mới vào 00:00 ngày mai.');
      return;
    }

    setIsJarShaking(true);
    setTimeout(() => setIsJarShaking(false), 750);

    const moodKey = appState.selectedMood;
    const drawnSet = new Set(appState.drawnStarIds || []);

    const approvedSheetCandidates = (appState.sheetWishes || [])
      .filter((w) => w.approved === true && w.message && (w.mood === moodKey || w.mood === 'all') && !drawnSet.has(w.id))
      .map((w) => ({
        id: w.id,
        mood: moodKey,
        text: w.message,
        sender: w.nickname || 'Người lạ',
        authorTitle: w.authorTitle || '🕊️ Sứ Giả Bầu Trời',
        stamp: w.stamp || 'star',
        likes: Number(w.likes) || 0,
        fromSheet: true
      }));

    const builtInCandidates = (quotesByMood[moodKey] || []).filter((q) => !drawnSet.has(q.id));

    let chosenStar = null;
    if (approvedSheetCandidates.length > 0 && Math.random() < 0.35) {
      chosenStar = approvedSheetCandidates[Math.floor(Math.random() * approvedSheetCandidates.length)];
    } else if (builtInCandidates.length > 0) {
      chosenStar = builtInCandidates[Math.floor(Math.random() * builtInCandidates.length)];
    } else if (approvedSheetCandidates.length > 0) {
      chosenStar = approvedSheetCandidates[0];
    } else {
      const anyMoodPool = Object.values(quotesByMood)
        .flat()
        .filter((q) => !drawnSet.has(q.id));
      if (anyMoodPool.length === 0) return;
      chosenStar = anyMoodPool[Math.floor(Math.random() * anyMoodPool.length)];
    }

    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const currentSharedNumber = remainingStarsCount;

    const historyRecord = {
      id: chosenStar.id,
      mood: moodKey,
      text: chosenStar.text,
      sender: chosenStar.sender || 'Bầu Trời Sao ✨',
      authorTitle: chosenStar.authorTitle || '✨ Người Gác Đền Sao',
      stamp: chosenStar.stamp || 'star',
      likes: Number(chosenStar.likes) || 0,
      fromSheet: !!chosenStar.fromSheet,
      timeStr,
      starNumber: currentSharedNumber
    };

    updateState((prev) => ({
      ...prev,
      sharedRemainingStars: Math.max(
        0,
        (typeof prev.sharedRemainingStars === 'number' ? prev.sharedRemainingStars : TOTAL_INITIAL_STARS) - 1
      ),
      drawnStarIds: [...(prev.drawnStarIds || []), chosenStar.id],
      lastDrawTimestamp: Date.now(),
      todayHistory: [historyRecord, ...(prev.todayHistory || [])]
    }));

    setActiveLetter(historyRecord);
    setModalStep('letter');

    if (GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) {
      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'draw_star' })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.remainingStars === 'number') {
            updateState((prev) => ({
              ...prev,
              sharedRemainingStars: Math.max(0, data.remainingStars)
            }));
          }
        })
        .catch(() => {});
    }
  };

  // Bước 4: Đóng Modal Bức Thư -> Mở cửa toàn bộ ngôi nhà nhân vật & Hiện lời chào "Chào mừng bạn đến thị trấn sao bông"
  const handleCloseLetterAndUnlockTown = () => {
    const wasUnlocked = appState.townUnlockedToday;
    setModalStep(null);
    setActiveLetter(null);
    updateState((prev) => ({
      ...prev,
      townUnlockedToday: true
    }));
    if (!wasUnlocked) {
      setWelcomeBannerVisible(true);
    }
  };

  // Click vào Đài Lọ Sao Trung Tâm trên phố
  const handleClickCentralFountain = () => {
    if (remainingCooldownMs > 0) {
      showToast(
        `⏳ Bạn đã nhận sao trong khung giờ này rồi! Mở lại sau ${formatDurationHMS(
          remainingCooldownMs
        )} hoặc xem lại thẻ sao ở nút góc phải nhé.`
      );
      return;
    }
    setModalStep('mood');
  };

  // Kích hoạt Kỹ Năng từ Hộp Thoại Truyện Tranh của từng nhân vật
  const handleTriggerCharacterSkill = (charId) => {
    setSelectedStreetChar(null);
    updateResident((prev) => ({
      ...prev,
      exploredActionsCount: (Number(prev.exploredActionsCount) || 0) + 1,
    }));

    if (charId === 'star') {
      handleClickCentralFountain();
      return;
    }
    if (charId === 'cloud') {
      // Bác Mây Xốp: Quản lý Thẻ Cư Dân & Bảng tên Nhà
      setResidentTab('card');
      setIsResidentModalOpen(true);
      return;
    }
    if (charId === 'rainbow') {
      // Chị Cầu Vồng: Dự báo Thời tiết Thị trấn
      setActiveSkillPanel('weather');
      triggerDailyQuestProgress('rainbow');
      return;
    }
    if (charId === 'moon') {
      setIsNightMode((prev) => {
        const next = !prev;
        if (next) {
          setTimeMode('night');
          showToast('🌌 Chú Trăng Khuyết đã thắp sáng Bầu Trời Khuya Thị Trấn!');
          triggerDailyQuestProgress('moon');
        } else {
          setTimeMode('auto');
          showToast('🕒 Đã chuyển bầu trời về chế độ Thời Gian Thực Tự Động!');
        }
        return next;
      });
      return;
    }
    if (charId === 'sun') {
      const randomQuest = DAILY_SUNNY_QUESTS[Math.floor(Math.random() * DAILY_SUNNY_QUESTS.length)];
      setDailyQuestText(randomQuest);
      setActiveSkillPanel('quest');
      triggerDailyQuestProgress('sun');
      return;
    }
    if (charId === 'shooting_star') {
      setActiveSkillPanel('wish');
      triggerDailyQuestProgress('shooting_star');
      return;
    }
    if (charId === 'nebula') {
      setActiveSkillPanel('breathe');
      triggerDailyQuestProgress('nebula');
      return;
    }
    if (charId === 'spark') {
      toggleMusicBox();
      triggerDailyQuestProgress('spark');
      return;
    }
    // 4 Mini-game Ngõ Gió Xoáy (17-20) chạy trực tiếp như Nhiệm vụ trên 4 bản đồ
    if (INWORLD_QUEST_IDS.includes(charId)) {
      const q = inWorldQuests?.quests?.[charId];
      if (!q || q.status === 'idle') {
        handleAcceptInWorldQuest(charId);
      } else if (q.status === 'active') {
        setIsQuestHudOpen(true);
      } else if (q.status === 'ready_to_claim') {
        handleClaimInWorldQuest(charId);
      } else {
        showToast(`✅ Bạn đã hoàn thành "${q.title}" hôm nay rồi! Hẹn ngày mai nhé 💖`);
      }
      return;
    }
    // 8 cư dân mở rộng (09 – 16: bao gồm Bà Cực Quang & Bác Sao Thổ)
    const extendedIds = ['dewdrop', 'breeze', 'snowflake', 'aurora', 'saturn', 'firefly', 'sunset', 'north_star'];
    if (extendedIds.includes(charId)) {
      setActiveExtendedSkill(charId);
      triggerDailyQuestProgress(charId);
    }
  };

  const handleLikeLetter = (letter) => {
    if (!letter) return;
    const likedIds = resident.likedWishIds || [];
    if (likedIds.includes(letter.id)) {
      showToast('💖 Bạn đã gửi tim ấm áp cho ngôi sao này rồi!');
      return;
    }
    const nextLikes = (Number(letter.likes) || 0) + 1;
    updateResident((prev) => ({
      ...prev,
      likedWishIds: [...(prev.likedWishIds || []), letter.id],
      mySentWishes: (prev.mySentWishes || []).map((w) => (w.id === letter.id ? { ...w, likes: nextLikes } : w))
    }));
    updateState((prev) => ({
      ...prev,
      sheetWishes: (prev.sheetWishes || []).map((w) => (w.id === letter.id ? { ...w, likes: nextLikes } : w)),
      todayHistory: (prev.todayHistory || []).map((h) => (h.id === letter.id ? { ...h, likes: nextLikes } : h))
    }));
    setActiveLetter((prev) => (prev && prev.id === letter.id ? { ...prev, likes: nextLikes } : prev));
    showToast('💖 Đã gửi 1 trái tim ấm áp đến tác giả bức thư!');

    if (GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) {
      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'like_wish',
          wishId: letter.id
        })
      }).catch(() => {});
    }
  };

  const handleToggleSaveMemory = (letter) => {
    if (!letter) return;
    const savedList = resident.savedStars || [];
    const exists = savedList.some((s) => s.id === letter.id);
    let nextSaved = [];
    if (exists) {
      nextSaved = savedList.filter((s) => s.id !== letter.id);
      showToast('Đã gỡ ngôi sao khỏi Lọ Sao Ký Ức.');
    } else {
      if (savedList.length >= 10) {
        showToast('🏺 Lọ Sao Ký Ức tối đa 10 ngôi sao!');
        return;
      }
      nextSaved = [letter, ...savedList];
      showToast('🏺 Đã cất ngôi sao vào Lọ Sao Ký Ức trong Ngôi Nhà Của Bạn!');
    }
    updateResident((prev) => ({
      ...prev,
      savedStars: nextSaved
    }));

    if (resident.isLoggedIn && GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) {
      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sync_user',
          nickname: resident.nickname,
          pin: resident.pin,
          savedStars: nextSaved
        })
      }).catch(() => {});
    }
  };

  useEffect(() => {
    fetchClientIp().catch(() => {});
    ensureSeedTestAccounts().catch(() => {});

    // Nhận phần thưởng Mini-Game nếu người chơi vừa thắng và quay về thị trấn
    const pendingRewards = consumePendingMiniGameRewards();
    if (pendingRewards.length > 0) {
      const totalHearts = pendingRewards.reduce((sum, r) => sum + (Number(r.hearts) || 0), 0);
      const totalStars = pendingRewards.reduce((sum, r) => sum + (Number(r.stars) || 0), 0);
      const lastGame = pendingRewards[pendingRewards.length - 1];
      updateResident((prev) => ({
        ...prev,
        townHearts: (Number(prev.townHearts) || 0) + totalHearts,
        exploredActionsCount: (Number(prev.exploredActionsCount) || 0) + pendingRewards.length,
      }));
      showToast(
        `🎮 Thưởng Mini-Game "${lastGame.gameTitle}": +${totalHearts} 💖 Tim & +${totalStars} ⭐ Sao!`
      );
    }
  }, []);

  const handleAuthSuccess = (user, mode) => {
    if (!user) return;
    updateResident((prev) => ({
      ...prev,
      isLoggedIn: true,
      userId: user.id,
      username: user.username,
      nickname: user.username,
      email: user.email || '',
      phone: user.phone || '',
      birthday: user.birthday || '',
      testPresetType: user.presetType || null,
      testPresetStats: user.presetStats || null,
      avatarChoice:
        user.presetType === 'basic' ? 'user_character' : prev.avatarChoice || 'user_character',
    }));
    setNickname(user.username);
    showToast(
      mode === 'register'
        ? `🎉 Chào mừng cư dân mới "${user.username}"! Bảng tên Ngôi Nhà trên phố đã được gắn tên bạn!`
        : user.presetType === 'vip_full'
          ? `👑 Đã đăng nhập tài khoản Test VIP "${user.username}" (Full LV.5 • 30 Huy hiệu • 18 Skin)!`
          : user.presetType === 'basic'
            ? `🌱 Đã đăng nhập tài khoản Test Cơ Bản "${user.username}" (LV.0 • 0 Huy hiệu)!`
            : `🏡 Chào mừng "${user.username}" trở lại Thị Trấn Sao Bông!`
    );
  };

  const handleUpdateProfileInfo = ({ email, phone, birthday }) => {
    const uname = resident.username || resident.nickname;
    updateUserProfileInfo(uname, { email, phone, birthday });
    updateResident((prev) => ({
      ...prev,
      email: email || '',
      phone: phone || '',
      birthday: birthday || '',
    }));
    showToast('💾 Đã lưu thông tin đồng bộ & khôi phục tài khoản!');
  };

  const handleResidentAuthSubmit = (e) => {
    e.preventDefault();
    const cleanNick = authNicknameInput.trim();
    const cleanPin = authPinInput.trim();
    if (!cleanNick || cleanPin.length < 4) {
      showToast('⚠️ Vui lòng nhập Tên Cư Dân và Mã PIN đủ 4 chữ số nhé!');
      return;
    }

    updateResident((prev) => ({
      ...prev,
      isLoggedIn: true,
      nickname: cleanNick,
      pin: cleanPin
    }));
    setNickname(cleanNick);
    showToast(`🏡 Bảng tên Ngôi Nhà trên phố đã đổi thành "Nhà của ${cleanNick}"!`);

    if (GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) {
      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'upsert_user',
          nickname: cleanNick,
          pin: cleanPin,
          savedStars: resident.savedStars || [],
          moodCalendar: resident.moodCalendar || []
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status === 'pin_mismatch') {
            showToast('⚠️ Tên cư dân này đã có chủ sở hữu với mã PIN khác!');
            return;
          }
          if (data && data.user) {
            updateResident((prev) => ({
              ...prev,
              isLoggedIn: true,
              nickname: cleanNick,
              pin: cleanPin,
              savedStars:
                Array.isArray(data.user.savedStars) && data.user.savedStars.length > 0
                  ? data.user.savedStars
                  : prev.savedStars,
              moodCalendar:
                Array.isArray(data.user.moodCalendar) && data.user.moodCalendar.length > 0
                  ? data.user.moodCalendar
                  : prev.moodCalendar
            }));
          }
        })
        .catch(() => {});
    }
  };

  const handleCopyQuote = () => {
    if (!activeLetter) return;
    const textToCopy = `"${activeLetter.text}"`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(
        () => showToast('📋 Đã sao chép lời chúc vào bộ nhớ tạm!'),
        () => fallbackCopy(textToCopy)
      );
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('📋 Đã sao chép thành công!');
    } catch (e) {
      showToast('⚠️ Không thể sao chép tự động.');
    }
    document.body.removeChild(ta);
  };

  const handleWishSubmit = (e) => {
    e.preventDefault();
    if (appState.wishSubmittedToday) return;

    const blockCheck = checkCurrentUserBlocked(resident.username || resident.nickname);
    if (blockCheck.isBlocked) {
      showToast(`🚫 Không thể gửi lời chúc: ${blockCheck.reason}`);
      return;
    }

    const trimmedMsg = wishMessage.trim();
    if (!trimmedMsg) {
      setWishError(true);
      return;
    }
    setWishError(false);

    const finalNickname =
      nickname.trim().length > 0
        ? nickname.trim()
        : resident.isLoggedIn && resident.nickname
        ? resident.nickname
        : 'Người lạ';

    const now = new Date();
    const timeStr =
      'Hôm nay, ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    const newWishRow = {
      id: 'WISH-' + Date.now(),
      timestamp: timeStr,
      nickname: finalNickname,
      authorTitle: residentStats.currentTitle || '🕊️ Sứ Giả Bầu Trời',
      stamp: wishStamp || 'star',
      likes: 0,
      mood: wishMood || 'all',
      message: trimmedMsg,
      approved: false
    };

    updateState((prev) => ({
      ...prev,
      wishSubmittedToday: true,
      sheetWishes: [newWishRow, ...(prev.sheetWishes || [])]
    }));

    updateResident((prev) => ({
      ...prev,
      mySentWishes: [newWishRow, ...(prev.mySentWishes || [])]
    }));

    if (GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) {
      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'submit_wish',
          ...newWishRow
        })
      }).catch(() => {});
    }

    setWishMessage('');
  };

  const historyList = appState.todayHistory || [];

  return (
    <div
      style={{ height: '100dvh', minHeight: '100vh', maxHeight: '100dvh' }}
      className={`w-screen overflow-hidden flex flex-col justify-between text-[#593A47] selection:bg-pink-200 selection:text-[#593A47] transition-colors duration-700 ${
        timePeriod === 'night' || timePeriod === 'evening' ? 'bg-[#1D2448]' : 'bg-[#C8EFEA]'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap');
        .kawaii-font {
          font-family: 'Quicksand', sans-serif;
        }
        .kawaii-card {
          background: rgba(255, 253, 249, 0.94);
          backdrop-filter: blur(6px);
          border: 3.5px solid #593A47;
          border-radius: 28px;
          box-shadow: 0 8px 0 #593A47, 0 14px 24px rgba(89, 58, 71, 0.16);
        }
        .kawaii-card-sm {
          background: #FFFFFF;
          border: 3px solid #593A47;
          border-radius: 22px;
          box-shadow: 0 5px 0 #593A47;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        }
        .kawaii-card-sm:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 0 #593A47;
        }
        .kawaii-btn {
          border: 3px solid #593A47;
          border-radius: 9999px;
          box-shadow: 0 5px 0 #593A47;
          transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          user-select: none;
        }
        .kawaii-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 7px 0 #593A47;
        }
        .kawaii-btn:active:not(:disabled) {
          transform: translateY(3px);
          box-shadow: 0 2px 0 #593A47;
        }
        .mood-btn {
          border: 3px solid #593A47;
          border-radius: 24px;
          box-shadow: 0 5px 0 #593A47;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mood-btn:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 9px 0 #593A47;
        }
        .mood-btn.selected {
          transform: translateY(-5px) scale(1.06);
          box-shadow: 0 9px 0 #593A47, 0 0 0 5px rgba(255, 133, 169, 0.45);
        }
        /* Comic Book Dialog Box Style */
        .comic-speech-box {
          background-color: #FFFDF7;
          background-image: radial-gradient(#FFD1E1 1.75px, transparent 1.75px);
          background-size: 16px 16px;
          border: 4px solid #593A47;
          border-radius: 28px;
          box-shadow: 10px 10px 0 #593A47, 0 20px 40px rgba(89, 58, 71, 0.35);
        }
        .letter-paper {
          background-color: #FFFDF7;
          background-image: repeating-linear-gradient(
            transparent,
            transparent 31px,
            #F5E1EA 31px,
            #F5E1EA 32px
          );
          border: 3.5px solid #593A47;
          border-radius: 24px;
          box-shadow: 0 10px 0 #593A47, 0 20px 40px rgba(89, 58, 71, 0.3);
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes jarWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-6deg) scale(1.04); }
          40% { transform: rotate(6deg) scale(1.06); }
          60% { transform: rotate(-4deg) scale(1.04); }
          80% { transform: rotate(4deg) scale(1.02); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.86) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes starFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(2deg); }
        }
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(5px) translateY(-5px); }
        }
        @keyframes moonSway {
          0%, 100% { transform: rotate(-4deg) translateY(0px); }
          50% { transform: rotate(5deg) translateY(-5px); }
        }
        @keyframes sunBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes cometFly {
          0%, 100% { transform: translate(0px, 0px) rotate(-2deg); }
          50% { transform: translate(6px, -6px) rotate(3deg); }
        }
        @keyframes rainbowFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }
        @keyframes sparkGroove {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          25% { transform: translateY(-5px) rotate(3deg); }
          75% { transform: translateY(-3px) rotate(-2deg); }
        }
        .animate-float { animation: floatSlow 4s ease-in-out infinite; }
        .jar-interactive:hover { animation: jarWiggle 0.75s ease-in-out infinite; }
        .jar-shaking { animation: jarWiggle 0.45s ease-in-out 2; }
        .pop-in { animation: popIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .char-star-float { animation: starFloat 3.4s ease-in-out infinite; }
        .char-cloud-drift { animation: cloudDrift 4.2s ease-in-out infinite; }
        .char-moon-sway { animation: moonSway 3.8s ease-in-out infinite; }
        .char-sun-bounce { animation: sunBounce 3s ease-in-out infinite; }
        .char-comet-fly { animation: cometFly 3.2s ease-in-out infinite; }
        .char-rainbow-float { animation: rainbowFloat 3.6s ease-in-out infinite; }
        .char-spark-groove { animation: sparkGroove 1.8s ease-in-out infinite; }
        /* Exciting Modal & Gacha Animations */
        @keyframes modalSpringEnter {
          0% { opacity: 0; transform: scale(0.72) translateY(28px) rotate(-1.5deg); }
          65% { opacity: 1; transform: scale(1.03) translateY(-4px) rotate(0.5deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
        }
        @keyframes letterUnfoldEnter {
          0% { opacity: 0; transform: perspective(700px) rotateX(-38deg) translateY(45px) scale(0.82); }
          70% { opacity: 1; transform: perspective(700px) rotateX(6deg) translateY(-6px) scale(1.02); }
          100% { opacity: 1; transform: perspective(700px) rotateX(0deg) translateY(0) scale(1); }
        }
        @keyframes jarGachaShake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-12deg) scale(1.08); }
          30% { transform: rotate(12deg) scale(1.12); }
          45% { transform: rotate(-14deg) scale(1.14); }
          60% { transform: rotate(14deg) scale(1.12); }
          75% { transform: rotate(-8deg) scale(1.08); }
        }
        @keyframes starBurstFly {
          0% { opacity: 0; transform: translateY(30px) scale(0.3) rotate(0deg); }
          50% { opacity: 1; transform: translateY(-45px) scale(1.5) rotate(180deg); }
          100% { opacity: 0; transform: translateY(-110px) scale(2.1) rotate(360deg); }
        }
        @keyframes confettiFall {
          0% { opacity: 0; transform: translateY(-20px) rotate(0deg) scale(0.7); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translateY(92vh) rotate(360deg) scale(1.15); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmerSweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .modal-spring-enter {
          animation: modalSpringEnter 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .letter-unfold-enter {
          animation: letterUnfoldEnter 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .jar-gacha-shake {
          animation: jarGachaShake 0.62s ease-in-out infinite;
        }
        .star-burst-fly {
          animation: starBurstFly 0.65s ease-out forwards;
        }
        .confetti-fall {
          animation: confettiFall 2.6s ease-in-out infinite;
        }
        .spin-slow {
          animation: spinSlow 14s linear infinite;
        }
        .shimmer-btn {
          background-size: 200% 200%;
          animation: shimmerSweep 3s ease infinite;
        }
        /* Roaming Kawaii Animals (Thỏ, Chó Cún, Mèo, Cừu di chuyển quanh đồi) */
        @keyframes petRoamPath1 {
          0% { transform: translate(0px, 0px) scaleX(-1); }
          25% { transform: translate(38px, -10px) scaleX(-1); }
          49% { transform: translate(72px, 4px) scaleX(-1); }
          50% { transform: translate(72px, 4px) scaleX(1); }
          75% { transform: translate(36px, 10px) scaleX(1); }
          100% { transform: translate(0px, 0px) scaleX(1); }
        }
        @keyframes petRoamPath2 {
          0% { transform: translate(0px, 0px) scaleX(-1); }
          20% { transform: translate(28px, 8px) translateY(-5px) scaleX(-1); }
          49% { transform: translate(58px, -6px) scaleX(-1); }
          50% { transform: translate(58px, -6px) scaleX(1); }
          80% { transform: translate(24px, 6px) translateY(-4px) scaleX(1); }
          100% { transform: translate(0px, 0px) scaleX(1); }
        }
        @keyframes petRoamPath3 {
          0% { transform: translate(0px, 0px) scaleX(1); }
          25% { transform: translate(-34px, -8px) scaleX(1); }
          49% { transform: translate(-64px, 6px) scaleX(1); }
          50% { transform: translate(-64px, 6px) scaleX(-1); }
          75% { transform: translate(-30px, 10px) scaleX(-1); }
          100% { transform: translate(0px, 0px) scaleX(-1); }
        }
        .pet-roam-1 { animation: petRoamPath1 11s ease-in-out infinite; }
        .pet-roam-2 { animation: petRoamPath2 9.5s ease-in-out infinite; }
        .pet-roam-3 { animation: petRoamPath3 12.5s ease-in-out infinite; }
      `}</style>

      <div
        style={{ height: '100dvh', minHeight: '100vh', maxHeight: '100dvh' }}
        className="kawaii-font relative z-10 w-screen overflow-hidden flex flex-col justify-between"
      >
        {/* MAIN INTERACTIVE STREET SCENE ("THỊ TRẤN SAO BÔNG" - 100dvh Fullscreen) */}
        <main className="flex-1 w-full h-full overflow-hidden">
          <TownStreetScene
            timePeriod={timePeriod}
            timeMode={timeMode}
            onChangeTimeMode={(mode) => {
              setIsNightMode(false);
              setTimeMode(mode);
            }}
            isNightMode={isNightMode}
            isMusicPlaying={isMusicPlaying}
            activeAmbientSound={activeAmbientSound}
            onToggleMusic={toggleMusicBox}
            onStopAmbient={handleStopAmbient}
            hasUnreadDailyComic={!hasReadTodayComic}
            onOpenComicModal={() => setIsComicModalOpen(true)}
            levelInfo={residentStats.levelInfo}
            unlockedBadgeCount={residentStats.unlockedBadges.length}
            totalBadgeCount={ALL_BADGES.length}
            onLockedResidentClick={(char, unlockLv) => {
              showToast(
                `🔒 ${char.name} mở khóa ở LV.${unlockLv}! Thu thập thêm huy hiệu để lên cấp nhé.`
              );
            }}
            dailyQuestsState={dailyQuestsState}
            onClaimDailyBox={handleClaimDailyBox}
            onCompleteDailyQuiz={handleCompleteDailyQuiz}
            onCollectDailyQuestItem={handleCollectDailyQuestItem}
            inWorldQuests={inWorldQuests}
            isQuestHudOpen={isQuestHudOpen}
            onToggleQuestHud={() => setIsQuestHudOpen((prev) => !prev)}
            onCollectQuestTarget={handleCollectQuestTarget}
            isTownUnlocked={appState.townUnlockedToday}
            welcomeBannerVisible={welcomeBannerVisible}
            remainingStarsCount={remainingStarsCount}
            remainingCooldownMs={remainingCooldownMs}
            formatDurationHMS={formatDurationHMS}
            resident={resident}
            residentStats={residentStats}
            historyCount={historyList.length}
            onOpenHistoryModal={() => setIsSidebarOpen(true)}
            isMovementLocked={Boolean(
              selectedStreetChar ||
              activeSkillPanel ||
              activeExtendedSkill ||
              isComicModalOpen ||
              isQuestHudOpen ||
              celebrationQueue.length > 0 ||
              isResidentModalOpen ||
              isSidebarOpen ||
              modalStep
            )}
            onSelectCharacter={(char) => {
              if (!residentStats.levelInfo.unlockedResidentIds.has(char.id)) {
                const lv = getResidentUnlockLevel(char.id);
                showToast(`🔒 ${char.name} mở khóa ở LV.${lv}! Thu thập thêm huy hiệu để gặp gỡ nhé.`);
                return;
              }
              setSelectedStreetChar(char);
            }}
            onOpenUserHouse={() => setIsResidentModalOpen(true)}
            onClickCentralStarFountain={handleClickCentralFountain}
          />
        </main>

        {/* RIGHT SLIDE-IN SIDEBAR: TODAY'S OPENED STAR CARDS */}
        <HistorySidebar
          isOpen={isSidebarOpen}
          historyList={historyList}
          onClose={() => setIsSidebarOpen(false)}
          onSelectHistoryItem={(item) => {
            setActiveLetter(item);
            setModalStep('letter');
          }}
        />

        {/* CHUỖI 3 MODAL MỞ ĐẦU (CHỌN CẢM XÚC -> HỘP SAO -> BỨC THƯ NGÔI SAO HY VỌNG) */}
        <OnboardingModals
          step={modalStep}
          selectedMood={appState.selectedMood}
          remainingStarsCount={remainingStarsCount}
          isJarShaking={isJarShaking}
          activeLetter={activeLetter}
          likedWishIds={resident.likedWishIds}
          savedStars={resident.savedStars}
          isLoggedIn={resident.isLoggedIn}
          onSelectMood={handleSelectMood}
          onProceedToJarModal={handleProceedToJarModal}
          onDrawStarFromJarModal={handleDrawStar}
          onCloseFlowAndUnlockTown={handleCloseLetterAndUnlockTown}
          onAuthSuccess={handleAuthSuccess}
          onLikeLetter={handleLikeLetter}
          onToggleSaveMemory={handleToggleSaveMemory}
          onCopyQuote={handleCopyQuote}
        />

        {/* HỘP THOẠI TRUYỆN TRANH KHI CLICK VÀO TỪNG NHÂN VẬT TRÊN PHỐ */}
        <ComicSpeechModal
          character={selectedStreetChar}
          isNightMode={isNightMode}
          isMusicPlaying={isMusicPlaying}
          questInfo={selectedStreetChar ? inWorldQuests?.quests?.[selectedStreetChar.id] || null : null}
          onClose={() => setSelectedStreetChar(null)}
          onTriggerSkill={handleTriggerCharacterSkill}
        />

        {/* MODAL NGÔI NHÀ CỦA USER & THẺ CƯ DÂN (BÁC MÂY XỐP QUẢN LÝ) */}
        <UserHouseModal
          isOpen={isResidentModalOpen}
          resident={resident}
          residentStats={residentStats}
          residentTab={residentTab}
          setResidentTab={setResidentTab}
          onAuthSuccess={handleAuthSuccess}
          onUpdateProfileInfo={handleUpdateProfileInfo}
          onLogout={() =>
            updateResident((prev) => ({
              ...prev,
              isLoggedIn: false,
              testPresetType: null,
              testPresetStats: null,
            }))
          }
          onToggleSaveMemory={handleToggleSaveMemory}
          onSelectAvatar={(avatarId, skinName) => {
            updateResident((prev) => ({
              ...prev,
              avatarChoice: avatarId
            }));
            showToast(
              skinName
                ? `🎭 Đã mặc trang phục "${skinName}" cho bạn nhỏ!`
                : '✨ Đã thay đổi ngoại hình cho bạn nhỏ thành công!'
            );
          }}
          onToggleNightSleepy={() => {
            updateResident((prev) => {
              const nextDisabled = !prev.disableNightSleepy;
              showToast(
                nextDisabled
                  ? '🌙 Đã tắt tự mặc Bé Ngái Ngủ (22h–04h), bạn nhỏ sẽ mặc skin bạn chọn cả ngày!'
                  : '🌙 Đã bật tự mặc Bé Ngái Ngủ trong khung giờ 22h–04h!'
              );
              return {
                ...prev,
                disableNightSleepy: nextDisabled,
              };
            });
          }}
          onShowToast={showToast}
          onPinBadge={(badgeId, badgeInfo) => {
            updateResident((prev) => ({
              ...prev,
              pinnedBadgeId: badgeId || null
            }));
            if (badgeId && badgeInfo) {
              showToast(`📌 Đã ghim huy hiệu "${badgeInfo.titleName}" lên Thẻ Cư Dân!`);
            } else {
              showToast('📌 Đã bỏ ghim huy hiệu khỏi Thẻ Cư Dân.');
            }
          }}
          onClose={() => setIsResidentModalOpen(false)}
        />

        {/* MODAL KỸ NĂNG ĐẶC BIỆT (GỬI THƯ BẦU TRỜI CỦA BÉ SAO BĂNG, DỰ BÁO THỜI TIẾT, HÍT THỞ 60S, BÁNH NẮNG) */}
        <SkillModals
          activeSkillPanel={activeSkillPanel}
          remainingStarsCount={remainingStarsCount}
          approvedWishCount={(appState.sheetWishes || []).filter((w) => w.approved).length}
          breathePhase={breathePhase}
          dailyQuestText={dailyQuestText}
          onNewQuest={() =>
            setDailyQuestText(DAILY_SUNNY_QUESTS[Math.floor(Math.random() * DAILY_SUNNY_QUESTS.length)])
          }
          wishSubmittedToday={appState.wishSubmittedToday}
          nickname={nickname}
          setNickname={setNickname}
          wishMood={wishMood}
          setWishMood={setWishMood}
          wishStamp={wishStamp}
          setWishStamp={setWishStamp}
          wishMessage={wishMessage}
          setWishMessage={setWishMessage}
          wishError={wishError}
          setWishError={setWishError}
          onWishSubmit={handleWishSubmit}
          onClose={() => setActiveSkillPanel(null)}
        />

        {/* MODAL KỸ NĂNG MỞ RỘNG CHO 12 CƯ DÂN (SỐ 09 – SỐ 20) */}
        <ExtendedSkillModals
          activePanel={activeExtendedSkill}
          activeAmbientSound={activeAmbientSound}
          sleepTimerMinutes={sleepTimerMinutes}
          onStartAmbient={handleStartAmbient}
          onStopAmbient={handleStopAmbient}
          onRewardHearts={handleRewardHearts}
          onShowToast={showToast}
          onClose={() => setActiveExtendedSkill(null)}
        />

        {/* MODAL TỦ TRUYỆN & TRUYỆN TRANH MỖI NGÀY (MỞ TỪ ICON SÁCH TRÊN TOP MENU) */}
        <DailyComicModal
          isOpen={isComicModalOpen}
          playerLevel={residentStats.levelInfo.level}
          residentName={resident.nickname || 'Cư dân Sao Bông'}
          collectedComics={collectedComics}
          customComics={adminComics}
          hasReadTodayComic={hasReadTodayComic}
          onCollectComic={handleCollectComic}
          onFinishedReadingComic={(comic) => {
            SafeStorage.setItem('TTSB_READ_COMIC_DATE_V1', getTodayDateString());
            setHasReadTodayComic(true);
            triggerDailyQuestProgress('read_daily_comic');
            setIsComicModalOpen(false);
            enqueueCelebration({
              type: 'comic_done',
              icon: '📖',
              badgeBg: '#F3E8FF',
              badgeBorder: '#9333EA',
              subtitle: '📖 Đã Đọc Xong Truyện Tranh Hôm Nay!',
              title: comic?.title || 'Truyện Tranh Thị Trấn Sao Bông',
              description: comic?.moral || 'Cảm ơn bạn đã dành chút thời gian thư giãn cùng cư dân thị trấn!',
              shareText: `📖 Mình vừa đọc xong tập "${comic?.title}" tại Thị Trấn Sao Bông — "${comic?.moral}" ✨`,
            });
          }}
          onShowToast={showToast}
          onClose={() => setIsComicModalOpen(false)}
        />

        {/* MODAL CHÚC MỪNG & CHIA SẺ MẠNG XÃ HỘI (HUY HIỆU / LEVEL UP / ĐỌC XONG TRUYỆN) */}
        <CelebrationShareModal
          event={celebrationQueue[0] || null}
          onShowToast={showToast}
          onClose={() => setCelebrationQueue((prev) => prev.slice(1))}
        />

        {/* BANNER GỢI Ý CÀI ĐẶT PWA LÊN MÀN HÌNH CHÍNH */}
        <PwaInstallPrompt
          isVisible={Boolean(
            appState.townUnlockedToday &&
            !selectedStreetChar &&
            !activeSkillPanel &&
            !activeExtendedSkill &&
            !isComicModalOpen &&
            !isQuestHudOpen &&
            !isResidentModalOpen &&
            !isSidebarOpen &&
            !modalStep
          )}
        />

        {/* TOAST BANNER (Trên mobile hiện phía trên để không đè dock & hộp thoại ở đáy) */}
        {toastMsg && (
          <div className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm sm:w-auto sm:top-auto sm:left-auto sm:translate-x-0 sm:bottom-5 sm:right-5 z-[9995] bg-[#FFF3B0] border-[3px] border-[#593A47] rounded-2xl px-4 py-2.5 sm:py-3 shadow-[0_6px_0_#593A47] font-extrabold text-xs sm:text-base text-[#593A47] text-center sm:text-left pointer-events-none pop-in">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
