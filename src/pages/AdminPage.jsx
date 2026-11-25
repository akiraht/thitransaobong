import React, { useState, useEffect } from 'react';
import {
  compressImageFileToWebpDataUrl,
  getAllAdminComics,
  saveAdminComic,
  deleteAdminComic,
  loadAdminCustomQuests,
  saveAdminCustomQuests,
  exportAdminBackupJson,
} from '../utils/adminDataStore';
import { BUILTIN_DAILY_COMICS } from '../data/dailyComicsData';
import ComicBookViewer from '../components/ComicBookViewer';
import { STORAGE_KEY } from '../config/constants';
import { SafeStorage, loadInitialState } from '../utils/storage';

const ADMIN_PIN = (import.meta.env.VITE_ADMIN_PIN || '1234').trim();

const TOWN_MAP_OPTIONS = [
  { id: 'map_hope_hill', name: 'Đỉnh Đồi Hy Vọng' },
  { id: 'map_astronomy_valley', name: 'Thung Lũng Thiên Văn' },
  { id: 'map_weather_lane', name: 'Ngõ Thời Tiết' },
  { id: 'map_mischief_alley', name: 'Hẻm Xoáy Tinh Nghịch' },
];

const QUEST_NPC_PRESETS = [
  { npcId: 'sun', actionType: 'sun', npcName: 'Cô Nắng Mai', icon: '🥐', mapId: 'map_hope_hill', mapName: 'Đỉnh Đồi Hy Vọng' },
  { npcId: 'rainbow', actionType: 'rainbow', npcName: 'Chị Cầu Vồng', icon: '🌈', mapId: 'map_hope_hill', mapName: 'Đỉnh Đồi Hy Vọng' },
  { npcId: 'shooting_star', actionType: 'shooting_star', npcName: 'Bé Sao Băng', icon: '💌', mapId: 'map_hope_hill', mapName: 'Đỉnh Đồi Hy Vọng' },
  { npcId: 'spark', actionType: 'spark', npcName: 'Anh Tia Chớp', icon: '🎧', mapId: 'map_hope_hill', mapName: 'Đỉnh Đồi Hy Vọng' },
  { npcId: 'moon', actionType: 'moon', npcName: 'Chú Trăng Khuyết', icon: '🌙', mapId: 'map_astronomy_valley', mapName: 'Thung Lũng Thiên Văn' },
  { npcId: 'nebula', actionType: 'nebula', npcName: 'Chị Ngân Hà', icon: '🍵', mapId: 'map_astronomy_valley', mapName: 'Thung Lũng Thiên Văn' },
  { npcId: 'north_star', actionType: 'north_star', npcName: 'Ông Sao Bắc Đẩu', icon: '🧭', mapId: 'map_astronomy_valley', mapName: 'Thung Lũng Thiên Văn' },
  { npcId: 'dewdrop', actionType: 'dewdrop', npcName: 'Bé Sương Mai', icon: '💧', mapId: 'map_weather_lane', mapName: 'Ngõ Thời Tiết' },
  { npcId: 'breeze', actionType: 'breeze', npcName: 'Chú Gió Mát', icon: '🍃', mapId: 'map_weather_lane', mapName: 'Ngõ Thời Tiết' },
  { npcId: 'sunset', actionType: 'sunset', npcName: 'Chị Hoàng Hôn', icon: '☕', mapId: 'map_weather_lane', mapName: 'Ngõ Thời Tiết' },
  { npcId: 'snowflake', actionType: 'snowflake', npcName: 'Cô Tuyết Bông', icon: '❄️', mapId: 'map_weather_lane', mapName: 'Ngõ Thời Tiết' },
  { npcId: 'storm_cloud', actionType: 'inworld_quest_complete', npcName: 'Cư dân Hẻm Xoáy', icon: '🌀', mapId: 'map_mischief_alley', mapName: 'Hẻm Xoáy Tinh Nghịch' },
];

const RANDOM_SAFE_COORDS = [
  { x: 24, y: 66 },
  { x: 38, y: 74 },
  { x: 62, y: 72 },
  { x: 76, y: 64 },
  { x: 48, y: 80 },
  { x: 28, y: 54 },
  { x: 70, y: 55 },
];

function createEmptyCollectItem(idx = 0) {
  const spot = RANDOM_SAFE_COORDS[idx % RANDOM_SAFE_COORDS.length];
  const map = TOWN_MAP_OPTIONS[idx % TOWN_MAP_OPTIONS.length];
  return {
    id: `item_${Date.now()}_${idx}`,
    icon: idx === 0 ? '⭐' : idx === 1 ? '🍀' : '🐚',
    label: `Vật phẩm ${idx + 1}`,
    mapId: map.id,
    mapName: map.name,
    hint: 'Tìm quanh bãi cỏ ven đường nhé!',
    x: spot.x,
    y: spot.y,
  };
}

/**
 * TRANG QUẢN TRỊ ĐỘC LẬP DARK MODE (/admin)
 * - Đầy đủ trang Danh Sách + Xem trước + Thêm mới + Chỉnh sửa + Xóa cho Truyện, Nhiệm Vụ (3 loại), Lời Chúc.
 */
export default function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('TTSB_ADMIN_AUTH') === '1';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('comics'); // 'comics' | 'quests' | 'wishes'
  const [toast, setToast] = useState('');

  // Dữ liệu chính
  const [adminComics, setAdminComics] = useState([]);
  const [customQuests, setCustomQuests] = useState(() => loadAdminCustomQuests());
  const [sheetWishes, setSheetWishes] = useState(() => loadInitialState().sheetWishes || []);

  // --- TRẠNG THÁI TAB TRUYỆN ---
  const [comicMode, setComicMode] = useState('list'); // 'list' | 'form'
  const [editingComicId, setEditingComicId] = useState(null);
  const [previewComic, setPreviewComic] = useState(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [previewPageIdx, setPreviewPageIdx] = useState(0);

  const [comicTitle, setComicTitle] = useState('');
  const [comicAuthor, setComicAuthor] = useState('Ban Biên Tập Thị Trấn');
  const [comicMinLevel, setComicMinLevel] = useState(0);
  const [comicMoral, setComicMoral] = useState('');
  const [pinAsToday, setPinAsToday] = useState(true);
  const [draftPages, setDraftPages] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSavingComic, setIsSavingComic] = useState(false);

  // --- TRẠNG THÁI TAB NHIỆM VỤ ---
  const [questMode, setQuestMode] = useState('list'); // 'list' | 'form'
  const [editingQuestId, setEditingQuestId] = useState(null);
  const [previewQuest, setPreviewQuest] = useState(null);

  const [questType, setQuestType] = useState('quiz'); // 'quiz' | 'collect' | 'visit'
  const [questTitle, setQuestTitle] = useState('');
  const [questRewardStars, setQuestRewardStars] = useState(20);
  // Quiz fields
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [quizCorrectIdx, setQuizCorrectIdx] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState('');
  // Collect fields
  const [collectItems, setCollectItems] = useState(() => [createEmptyCollectItem(0), createEmptyCollectItem(1)]);
  // Visit fields
  const [questPresetIdx, setQuestPresetIdx] = useState(0);

  // --- TRẠNG THÁI TAB LỜI CHÚC ---
  const [wishFilter, setWishFilter] = useState('all'); // 'all' | 'approved' | 'hidden'
  const [wishMode, setWishMode] = useState('list'); // 'list' | 'form'
  const [editingWishId, setEditingWishId] = useState(null);
  const [wishName, setWishName] = useState('');
  const [wishMsg, setWishMsg] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const reloadComics = async () => {
    const list = await getAllAdminComics();
    setAdminComics(list);
  };

  useEffect(() => {
    document.title = 'Admin Dark — Thị Trấn Sao Bông';
    reloadComics();
  }, []);

  const persistSheetWishes = (nextWishes) => {
    setSheetWishes(nextWishes);
    const current = loadInitialState();
    SafeStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, sheetWishes: nextWishes }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsUnlocked(true);
      setPinError('');
      setPinInput('');
      try {
        sessionStorage.setItem('TTSB_ADMIN_AUTH', '1');
      } catch {}
    } else {
      setPinError('Mã PIN chưa đúng (mặc định: 1234).');
    }
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('TTSB_ADMIN_AUTH');
    } catch {}
  };

  // ===================== CRUD TRUYỆN TRANH =====================
  const openCreateComicForm = () => {
    setEditingComicId(null);
    setComicTitle('');
    setComicAuthor('Ban Biên Tập Thị Trấn');
    setComicMinLevel(0);
    setComicMoral('');
    setPinAsToday(true);
    setDraftPages([]);
    setComicMode('form');
  };

  const openEditComicForm = (comic) => {
    setEditingComicId(comic.id);
    setComicTitle(comic.title || '');
    setComicAuthor(comic.author || 'Ban Biên Tập Thị Trấn');
    setComicMinLevel(Number(comic.minLevel) || 0);
    setComicMoral(comic.moral || '');
    setPinAsToday(Boolean(comic.pinAsToday));
    setDraftPages(
      (comic.pages || []).map((p, idx) => ({
        id: `pg_edit_${idx}_${Date.now()}`,
        imageUrl: p.imageUrl || '',
        caption: p.caption || '',
        fileName: `Trang ${idx + 1}`,
        sizeKb: p.imageUrl ? Math.round((p.imageUrl.length * 3) / 4 / 1024) : 0,
      }))
    );
    setComicMode('form');
  };

  const handleSelectComicImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setIsCompressing(true);
    try {
      const processed = [];
      for (const file of files) {
        const webpDataUrl = await compressImageFileToWebpDataUrl(file, 1200, 0.82);
        const approxKb = Math.round((webpDataUrl.length * 3) / 4 / 1024);
        processed.push({
          id: `pg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          imageUrl: webpDataUrl,
          caption: '',
          fileName: file.name,
          sizeKb: approxKb,
        });
      }
      setDraftPages((prev) => [...prev, ...processed]);
      showToast(`🖼️ Đã nén xong ${processed.length} trang ảnh sang WebP!`);
    } catch (err) {
      showToast(`⚠️ Lỗi xử lý ảnh: ${err?.message || 'Không xác định'}`);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const moveDraftPage = (idx, dir) => {
    setDraftPages((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const handleSaveComic = async (e) => {
    e.preventDefault();
    if (!comicTitle.trim() || draftPages.length === 0 || isSavingComic) return;
    setIsSavingComic(true);
    try {
      await saveAdminComic({
        ...(editingComicId ? { id: editingComicId } : {}),
        title: comicTitle.trim(),
        author: comicAuthor.trim() || 'Ban Biên Tập Thị Trấn',
        minLevel: Number(comicMinLevel) || 0,
        moral: comicMoral.trim() || 'Mỗi ngày đều có một câu chuyện dịu dàng chờ bạn khám phá!',
        pinAsToday,
        pages: draftPages.map((p) => ({
          type: 'image',
          imageUrl: p.imageUrl,
          caption: p.caption.trim() || undefined,
        })),
      });
      await reloadComics();
      setComicMode('list');
      setEditingComicId(null);
      showToast(editingComicId ? '✅ Đã cập nhật tập truyện!' : '✅ Đã xuất bản tập truyện mới!');
    } catch (err) {
      showToast(`⚠️ Không thể lưu truyện: ${err?.message || 'Lỗi IndexedDB'}`);
    } finally {
      setIsSavingComic(false);
    }
  };

  const handleDeleteComic = async (id, title) => {
    if (!window.confirm(`Xóa tập truyện "${title}"?`)) return;
    await deleteAdminComic(id);
    await reloadComics();
    showToast(`🗑️ Đã xóa "${title}".`);
  };

  // ===================== CRUD NHIỆM VỤ (3 LOẠI) =====================
  const openCreateQuestForm = (defaultType = 'quiz') => {
    setEditingQuestId(null);
    setQuestType(defaultType);
    setQuestTitle('');
    setQuestRewardStars(20);
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrectIdx(0);
    setQuizExplanation('');
    setCollectItems([createEmptyCollectItem(0), createEmptyCollectItem(1)]);
    setQuestPresetIdx(0);
    setQuestMode('form');
  };

  const openEditQuestForm = (q) => {
    setEditingQuestId(q.id);
    const detectedType = q.questType || (q.quiz ? 'quiz' : Array.isArray(q.targets) ? 'collect' : 'visit');
    setQuestType(detectedType);
    setQuestTitle(q.title || '');
    setQuestRewardStars(q.rewardStars || 20);
    if (detectedType === 'quiz' && q.quiz) {
      setQuizQuestion(q.quiz.question || '');
      const opts = Array.isArray(q.quiz.options) ? [...q.quiz.options] : ['', '', '', ''];
      while (opts.length < 4) opts.push('');
      setQuizOptions(opts.slice(0, 4));
      setQuizCorrectIdx(Number(q.quiz.correctIndex) || 0);
      setQuizExplanation(q.quiz.explanation || '');
    } else if (detectedType === 'collect' && Array.isArray(q.targets)) {
      setCollectItems(q.targets.map((t) => ({ ...t })));
    } else {
      const pIdx = QUEST_NPC_PRESETS.findIndex((p) => p.npcId === q.npcId);
      setQuestPresetIdx(pIdx >= 0 ? pIdx : 0);
    }
    setQuestMode('form');
  };

  const fillQuestExample = () => {
    if (questType === 'quiz') {
      setQuestTitle('Đố vui buổi sáng tại Đỉnh Đồi');
      setQuestRewardStars(20);
      setQuizQuestion('Cư dân nào nướng mẻ bánh sừng bò mật ong thơm lừng mỗi sáng?');
      setQuizOptions(['Cô Nắng Mai', 'Bác Mây Xốp', 'Chú Trăng Khuyết', 'Bé Sương Mai']);
      setQuizCorrectIdx(0);
      setQuizExplanation('Chính xác! Cô Nắng Mai là chủ Tiệm Bánh Bình Minh!');
    } else if (questType === 'collect') {
      setQuestTitle('Thu thập 2 Hạt Sao Rơi quanh thị trấn');
      setQuestRewardStars(25);
      setCollectItems([
        {
          id: `item_${Date.now()}_0`,
          icon: '⭐',
          label: 'Hạt Sao Bình Minh',
          mapId: 'map_hope_hill',
          mapName: 'Đỉnh Đồi Hy Vọng',
          hint: 'Lấp lánh gần bãi cỏ phía dưới Tiệm Bánh Bình Minh',
          x: 30,
          y: 68,
        },
        {
          id: `item_${Date.now()}_1`,
          icon: '🌙',
          label: 'Mảnh Trăng Nhỏ',
          mapId: 'map_astronomy_valley',
          mapName: 'Thung Lũng Thiên Văn',
          hint: 'Nằm gần con đường giữa Thung Lũng Thiên Văn',
          x: 64,
          y: 70,
        },
      ]);
    } else {
      setQuestPresetIdx(0);
      setQuestTitle('Ghé Tiệm Bánh Bình Minh nhận 1 chiếc bánh quy từ Cô Nắng Mai');
      setQuestRewardStars(15);
    }
    showToast('✨ Đã điền mẫu ví dụ! Bạn có thể chỉnh lại rồi bấm Lưu.');
  };

  const handleSaveQuest = (e) => {
    e.preventDefault();
    if (!questTitle.trim()) return;

    const id = editingQuestId || `dq_custom_${Date.now()}`;
    let payload = null;

    if (questType === 'quiz') {
      const cleanOpts = quizOptions.map((o) => o.trim());
      if (!quizQuestion.trim() || cleanOpts.some((o) => !o)) {
        showToast('⚠️ Hãy điền đủ Câu hỏi và cả 4 đáp án A, B, C, D nhé!');
        return;
      }
      payload = {
        id,
        isCustom: true,
        enabled: true,
        questType: 'quiz',
        actionType: `custom_quiz_${id}`,
        npcId: 'star',
        npcName: 'Đố Vui Thị Trấn',
        icon: '❓',
        mapId: 'map_hope_hill',
        mapName: 'Toàn Thị Trấn',
        title: questTitle.trim(),
        rewardStars: Math.max(5, Math.min(100, Number(questRewardStars) || 20)),
        quiz: {
          question: quizQuestion.trim(),
          options: cleanOpts,
          correctIndex: Number(quizCorrectIdx) || 0,
          explanation: quizExplanation.trim() || 'Chính xác! Bạn hiểu Thị Trấn Sao Bông quá đi!',
        },
      };
    } else if (questType === 'collect') {
      if (collectItems.length === 0) {
        showToast('⚠️ Cần ít nhất 1 vật phẩm trên bản đồ!');
        return;
      }
      const normalizedTargets = collectItems.map((it, idx) => {
        const m = TOWN_MAP_OPTIONS.find((opt) => opt.id === it.mapId) || TOWN_MAP_OPTIONS[0];
        return {
          id: it.id || `t_${Date.now()}_${idx}`,
          icon: it.icon.trim() || '⭐',
          label: it.label.trim() || `Vật phẩm ${idx + 1}`,
          mapId: m.id,
          mapName: m.name,
          hint: it.hint.trim() || `Tìm quanh khu vực ${m.name}`,
          x: Math.max(12, Math.min(88, Number(it.x) || 45)),
          y: Math.max(42, Math.min(86, Number(it.y) || 68)),
          collected: false,
        };
      });
      payload = {
        id,
        isCustom: true,
        enabled: true,
        questType: 'collect',
        actionType: `custom_collect_${id}`,
        npcId: 'star',
        npcName: 'Tìm Vật Phẩm',
        icon: '🔍',
        mapId: normalizedTargets[0].mapId,
        mapName: normalizedTargets[0].mapName,
        title: questTitle.trim(),
        rewardStars: Math.max(5, Math.min(100, Number(questRewardStars) || 25)),
        targets: normalizedTargets,
      };
    } else {
      const preset = QUEST_NPC_PRESETS[questPresetIdx] || QUEST_NPC_PRESETS[0];
      payload = {
        id,
        isCustom: true,
        enabled: true,
        questType: 'visit',
        actionType: preset.actionType,
        npcId: preset.npcId,
        npcName: preset.npcName,
        icon: preset.icon,
        mapId: preset.mapId,
        mapName: preset.mapName,
        title: questTitle.trim(),
        rewardStars: Math.max(5, Math.min(100, Number(questRewardStars) || 15)),
      };
    }

    const next = editingQuestId
      ? customQuests.map((q) => (q.id === editingQuestId ? { ...payload, enabled: q.enabled } : q))
      : [payload, ...customQuests];

    setCustomQuests(next);
    saveAdminCustomQuests(next);
    SafeStorage.removeItem('TTSB_DAILY_QUESTS_V1');
    setQuestMode('list');
    setEditingQuestId(null);
    showToast(editingQuestId ? '✅ Đã cập nhật nhiệm vụ!' : '✅ Đã tạo nhiệm vụ mới & đưa vào game!');
  };

  const handleToggleQuest = (id) => {
    const next = customQuests.map((q) => (q.id === id ? { ...q, enabled: q.enabled === false } : q));
    setCustomQuests(next);
    saveAdminCustomQuests(next);
    SafeStorage.removeItem('TTSB_DAILY_QUESTS_V1');
  };

  const handleDeleteQuest = (id, title) => {
    if (!window.confirm(`Xóa nhiệm vụ "${title}"?`)) return;
    const next = customQuests.filter((q) => q.id !== id);
    setCustomQuests(next);
    saveAdminCustomQuests(next);
    SafeStorage.removeItem('TTSB_DAILY_QUESTS_V1');
    showToast('🗑️ Đã xóa nhiệm vụ.');
  };

  // ===================== CRUD LỜI CHÚC =====================
  const openCreateWishForm = () => {
    setEditingWishId(null);
    setWishName('');
    setWishMsg('');
    setWishMode('form');
  };

  const openEditWishForm = (w) => {
    setEditingWishId(w.id);
    setWishName(w.nickname || '');
    setWishMsg(w.message || '');
    setWishMode('form');
  };

  const handleSaveWish = (e) => {
    e.preventDefault();
    if (!wishMsg.trim()) return;
    if (editingWishId) {
      persistSheetWishes(
        sheetWishes.map((w) =>
          w.id === editingWishId
            ? { ...w, nickname: wishName.trim() || 'Ban Biên Tập', message: wishMsg.trim() }
            : w
        )
      );
      showToast('✅ Đã cập nhật lời chúc!');
    } else {
      const wish = {
        id: `ADMIN_WISH_${Date.now()}`,
        timestamp: new Date().toISOString(),
        nickname: wishName.trim() || 'Ban Biên Tập',
        authorTitle: '🌟 Quản Trị Thị Trấn',
        stamp: 'star',
        likes: 1,
        mood: 'all',
        message: wishMsg.trim(),
        approved: true,
      };
      persistSheetWishes([wish, ...sheetWishes]);
      showToast('💌 Đã thêm lời chúc vào Lọ Sao!');
    }
    setWishMode('list');
    setEditingWishId(null);
  };

  const handleToggleWishApproved = (id) => {
    persistSheetWishes(sheetWishes.map((w) => (w.id === id ? { ...w, approved: !w.approved } : w)));
  };

  const handleDeleteWish = (id) => {
    if (!window.confirm('Xóa lời chúc này?')) return;
    persistSheetWishes(sheetWishes.filter((w) => w.id !== id));
    showToast('🗑️ Đã xóa lời chúc.');
  };

  const handleDownloadBackup = async () => {
    const json = await exportAdminBackupJson(sheetWishes);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thitransaobong-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📦 Đã tải file backup JSON về máy!');
  };

  const filteredWishes = sheetWishes.filter((w) => {
    if (wishFilter === 'approved') return Boolean(w.approved);
    if (wishFilter === 'hidden') return !w.approved;
    return true;
  });

  // ===================== MÀN HÌNH ĐĂNG NHẬP PIN (DARK MODE) =====================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="w-full max-w-md bg-[#111827] rounded-2xl shadow-2xl border border-slate-800 p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-3xl items-center justify-center mb-1">
              🛠️
            </div>
            <h1 className="text-xl font-bold text-white">Sao Bông Admin</h1>
            <p className="text-sm text-slate-400">
              Hệ thống quản trị độc lập (Local IndexedDB)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Mã PIN Quản Trị (mặc định: <code className="text-amber-400">1234</code>)
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Nhập mã PIN..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none text-center text-lg tracking-widest font-semibold text-white"
              />
              {pinError && <p className="mt-1.5 text-xs font-semibold text-rose-400">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
            >
              Đăng nhập trang Admin
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-center">
            <a href="/" className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition">
              ⬅️ Quay lại game Thị Trấn Sao Bông
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ===================== GIAO DIỆN DASHBOARD DARK MODE =====================
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR TRÁI */}
      <aside className="w-full md:w-64 bg-[#111827] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between md:block">
          <div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>🌟</span>
              <span>Sao Bông Admin</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Dark CMS • Local Storage</p>
          </div>
          <a
            href="/"
            className="md:hidden px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700"
          >
            ⬅️ Vào Game
          </a>
        </div>

        <nav className="p-3 flex md:flex-col gap-1.5 overflow-x-auto flex-1">
          {[
            { id: 'comics', icon: '🖼️', label: 'Truyện Tranh', count: adminComics.length + BUILTIN_DAILY_COMICS.length },
            { id: 'quests', icon: '🎯', label: 'Nhiệm Vụ', count: customQuests.length },
            { id: 'wishes', icon: '💌', label: 'Lời Chúc & Backup', count: sheetWishes.length },
          ].map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => {
                setActiveTab(nav.id);
                setComicMode('list');
                setQuestMode('list');
                setWishMode('list');
              }}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left flex items-center justify-between gap-2 whitespace-nowrap transition ${
                activeTab === nav.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>
                {nav.icon} {nav.label}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-900 border border-slate-700 text-slate-300">
                {nav.count}
              </span>
            </button>
          ))}
        </nav>

        <div className="hidden md:flex flex-col gap-2 p-4 border-t border-slate-800">
          <a
            href="/"
            className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold text-center transition"
          >
            ⬅️ Mở Game Thị Trấn Sao Bông
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            🔒 Khóa phiên Admin
          </button>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* ======================== TAB 1: TRUYỆN TRANH ======================== */}
        {activeTab === 'comics' && comicMode === 'list' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">🖼️ Danh Sách Truyện Tranh</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Xem trước, chỉnh sửa hoặc xóa truyện ảnh bạn đăng; đồng thời xem lại kho truyện Manga có sẵn.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateComicForm}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition"
              >
                ➕ Tạo Truyện Ảnh Mới
              </button>
            </div>

            {/* PHẦN A: TRUYỆN ẢNH DO ADMIN TẠO */}
            <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  📸 Truyện Tranh Ảnh Của Bạn ({adminComics.length})
                </h3>
              </div>

              {adminComics.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-700 rounded-xl space-y-2">
                  <p className="text-sm text-slate-400">Chưa có tập truyện ảnh nào.</p>
                  <button
                    type="button"
                    onClick={openCreateComicForm}
                    className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold"
                  >
                    ➕ Đăng tập truyện đầu tiên ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {adminComics.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {c.pages?.[0]?.imageUrl ? (
                          <img
                            src={c.pages[0].imageUrl}
                            alt={c.title}
                            className="w-12 h-16 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-950"
                          />
                        ) : (
                          <div className="w-12 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-xl shrink-0">
                            📖
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                            {c.pinAsToday && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                                Ghim hôm nay
                              </span>
                            )}
                            <span className="truncate">{c.title}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {c.pages?.length || 0} trang ảnh • LV.{c.minLevel || 0}+ • ✍️ {c.author}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewComic(c);
                            setPreviewPageIdx(0);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                        >
                          👁️ Xem
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditComicForm(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComic(c.id, c.title)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PHẦN B: KHO TRUYỆN MANGA CÓ SẴN TRONG GAME */}
            <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                📚 Kho Truyện Manga Mặc Định Trong Game ({BUILTIN_DAILY_COMICS.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {BUILTIN_DAILY_COMICS.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-200 truncate">📖 {c.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {c.pages?.length || 0} trang Manga • LV.{c.minLevel || 0}+ • Mặc định (chỉ xem)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewComic(c);
                        setPreviewPageIdx(0);
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      👁️ Xem
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FORM TẠO / SỬA TRUYỆN */}
        {activeTab === 'comics' && comicMode === 'form' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingComicId ? '✏️ Chỉnh Sửa Tập Truyện' : '➕ Tạo Tập Truyện Ảnh Mới'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Ảnh upload sẽ tự nén sang WebP tối ưu cho điện thoại.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComicMode('list')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                ⬅️ Về Danh Sách
              </button>
            </div>

            <form
              onSubmit={handleSaveComic}
              className="bg-[#111827] rounded-2xl border border-slate-800 p-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tên tập truyện *</label>
                  <input
                    type="text"
                    required
                    value={comicTitle}
                    onChange={(e) => setComicTitle(e.target.value)}
                    placeholder="Ví dụ: Đêm Hội Đom Đóm Ở Thung Lũng"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tác giả</label>
                  <input
                    type="text"
                    value={comicAuthor}
                    onChange={(e) => setComicAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mở khóa từ Level</label>
                  <select
                    value={comicMinLevel}
                    onChange={(e) => setComicMinLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  >
                    {[0, 1, 2, 3, 4, 5].map((lv) => (
                      <option key={lv} value={lv}>
                        LV.{lv}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Lời nhắn cuối tập</label>
                  <input
                    type="text"
                    value={comicMoral}
                    onChange={(e) => setComicMoral(e.target.value)}
                    placeholder="Một câu chữa lành hiển thị ở trang cuối..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinAsToday}
                  onChange={(e) => setPinAsToday(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span>Ghim làm <strong className="text-amber-300">“Truyện Trong Ngày”</strong> nổi bật</span>
              </label>

              <div className="p-6 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 text-center space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer transition">
                  <span>{isCompressing ? '⏳ Đang nén WebP...' : '📁 Thêm Ảnh Các Trang Truyện'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isCompressing}
                    onChange={handleSelectComicImages}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-500">
                  Chọn nhiều ảnh cùng lúc (<code>01.png, 02.png...</code>) — tự động nén sang WebP &amp; sắp thứ tự.
                </p>
              </div>

              {draftPages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {draftPages.map((pg, idx) => (
                    <div
                      key={pg.id}
                      className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 flex items-center gap-3"
                    >
                      <img
                        src={pg.imageUrl}
                        alt={`Trang ${idx + 1}`}
                        className="w-16 h-20 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-950"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          Trang {idx + 1} • {pg.fileName} ({pg.sizeKb} KB)
                        </div>
                        <input
                          type="text"
                          value={pg.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraftPages((prev) =>
                              prev.map((item) => (item.id === pg.id ? { ...item, caption: val } : item))
                            );
                          }}
                          placeholder="Chú thích dưới trang (tùy chọn)"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveDraftPage(idx, -1)}
                          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === draftPages.length - 1}
                          onClick={() => moveDraftPage(idx, 1)}
                          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs disabled:opacity-30"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftPages((prev) => prev.filter((item) => item.id !== pg.id))}
                          className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!comicTitle.trim() || draftPages.length === 0 || isSavingComic}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-bold transition"
                >
                  {isSavingComic
                    ? '💾 Đang lưu...'
                    : editingComicId
                    ? `💾 Lưu Thay Đổi (${draftPages.length} trang)`
                    : `💾 Xuất Bản Truyện (${draftPages.length} trang)`}
                </button>
                <button
                  type="button"
                  onClick={() => setComicMode('list')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================== TAB 2: NHIỆM VỤ (3 LOẠI) ======================== */}
        {activeTab === 'quests' && questMode === 'list' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">🎯 Danh Sách Nhiệm Vụ</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Hỗ trợ 3 loại nhiệm vụ chạy trực tiếp trong game: Trắc nghiệm 4 đáp án, Tìm vật phẩm trên map, và Ghé nhà cư dân.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openCreateQuestForm('quiz')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                >
                  ➕ NV Trắc Nghiệm
                </button>
                <button
                  type="button"
                  onClick={() => openCreateQuestForm('collect')}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                >
                  ➕ NV Tìm Vật Phẩm
                </button>
                <button
                  type="button"
                  onClick={() => openCreateQuestForm('visit')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  ➕ NV Ghé Nhà
                </button>
              </div>
            </div>

            {/* HƯỚNG DẪN NHANH 3 LOẠI NHIỆM VỤ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#111827] border border-purple-500/30 space-y-1">
                <div className="text-xs font-bold text-purple-300">❓ 1. Trắc nghiệm 4 đáp án</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Nhập 1 câu hỏi + 4 đáp án A/B/C/D và chọn 1 đáp án đúng. Người chơi bấm <strong>Trả lời ❓</strong> ngay trong Sổ Tay Hành Trình để hoàn thành.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/30 space-y-1">
                <div className="text-xs font-bold text-amber-300">🔍 2. Đi tìm vật phẩm trên map</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Đặt 1–4 vật phẩm lên bất kỳ bản đồ nào kèm gợi ý. Vật phẩm sẽ hiện thật trên bãi cỏ để người chơi chạy tới chạm nhặt.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#111827] border border-indigo-500/30 space-y-1">
                <div className="text-xs font-bold text-indigo-300">🏠 3. Ghé nhà / Trò chuyện cư dân</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Chọn 1 cư dân &amp; ngôi nhà đích (vd: Tiệm Bánh Cô Nắng Mai). Người chơi tới nhà tương tác là tự động hoàn thành nhiệm vụ.
                </p>
              </div>
            </div>

            {/* DANH SÁCH NHIỆM VỤ ĐÃ TẠO */}
            <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                📋 Nhiệm Vụ Tùy Chỉnh Của Bạn ({customQuests.length})
              </h3>
              {customQuests.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-700 rounded-xl text-sm text-slate-400">
                  Chưa có nhiệm vụ tùy chỉnh nào. Hãy chọn 1 trong 3 nút <strong>➕ NV</strong> ở trên để tạo thử nhé!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customQuests.map((q) => {
                    const typeBadge =
                      q.questType === 'quiz'
                        ? { text: '❓ Trắc nghiệm', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
                        : q.questType === 'collect'
                        ? { text: `🔍 Tìm ${q.targets?.length || 0} vật phẩm`, cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
                        : { text: '🏠 Ghé nhà', cls: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${typeBadge.cls}`}>
                              {typeBadge.text}
                            </span>
                            <span className="text-sm font-bold text-white">{q.title}</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {q.npcName} • {q.mapName} • Thưởng <strong className="text-amber-300">+{q.rewardStars} ⭐</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewQuest(q)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                          >
                            👁️ Xem
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditQuestForm(q)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleQuest(q.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                              q.enabled === false
                                ? 'bg-slate-800 text-slate-500'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {q.enabled === false ? 'Đang tắt' : 'Đang bật'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuest(q.id, q.title)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FORM TẠO / SỬA NHIỆM VỤ */}
        {activeTab === 'quests' && questMode === 'form' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingQuestId ? '✏️ Chỉnh Sửa Nhiệm Vụ' : '➕ Tạo Nhiệm Vụ Mới'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Chọn 1 trong 3 mẫu nhiệm vụ hoặc bấm “Điền mẫu ví dụ” để xem cấu trúc chuẩn.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fillQuestExample}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold"
                >
                  ✨ Điền mẫu ví dụ
                </button>
                <button
                  type="button"
                  onClick={() => setQuestMode('list')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  ⬅️ Về Danh Sách
                </button>
              </div>
            </div>

            {/* CHỌN LOẠI NHIỆM VỤ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'quiz', label: '❓ Trắc nghiệm 4 đáp án', desc: 'Chọn 1 đáp án đúng để nhận sao' },
                { id: 'collect', label: '🔍 Tìm vật phẩm trên map', desc: 'Rải vật phẩm trên 4 map kèm gợi ý' },
                { id: 'visit', label: '🏠 Ghé nhà cư dân', desc: 'Tới nhà trò chuyện / dùng kỹ năng' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQuestType(t.id)}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    questType === t.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-[#111827] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold">{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSaveQuest}
              className="bg-[#111827] rounded-2xl border border-slate-800 p-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tên nhiệm vụ hiển thị trong Sổ Tay *</label>
                  <input
                    type="text"
                    required
                    value={questTitle}
                    onChange={(e) => setQuestTitle(e.target.value)}
                    placeholder="Nhập tên nhiệm vụ ngắn gọn..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Thưởng Sao ⭐</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={questRewardStars}
                    onChange={(e) => setQuestRewardStars(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              {/* CHI TIẾT LOẠI 1: QUIZ */}
              {questType === 'quiz' && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-purple-300 mb-1">Câu hỏi trắc nghiệm *</label>
                    <input
                      type="text"
                      required
                      value={quizQuestion}
                      onChange={(e) => setQuizQuestion(e.target.value)}
                      placeholder="Ví dụ: Ai là chủ tiệm bánh trên Đỉnh Đồi Hy Vọng?"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quizOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          quizCorrectIdx === idx
                            ? 'bg-emerald-500/10 border-emerald-500/50'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correct_option"
                          checked={quizCorrectIdx === idx}
                          onChange={() => setQuizCorrectIdx(idx)}
                          title="Chọn làm đáp án đúng"
                          className="w-4 h-4 accent-emerald-500 shrink-0"
                        />
                        <span className="text-xs font-bold text-slate-400 shrink-0">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuizOptions((prev) => prev.map((x, i) => (i === idx ? val : x)));
                          }}
                          placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 bg-transparent text-sm text-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-emerald-400">
                    * Tick chấm tròn bên trái đáp án để đánh dấu 1 đáp án đúng duy nhất.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Lời khen / giải thích khi chọn đúng</label>
                    <input
                      type="text"
                      value={quizExplanation}
                      onChange={(e) => setQuizExplanation(e.target.value)}
                      placeholder="Ví dụ: Chính xác! Cô Nắng Mai nướng bánh lúc 6 giờ sáng mỗi ngày!"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                    />
                  </div>
                </div>
              )}

              {/* CHI TIẾT LOẠI 2: TÌM VẬT PHẨM TRÊN BẢN ĐỒ */}
              {questType === 'collect' && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amber-300">
                      Danh sách vật phẩm cần tìm ({collectItems.length}/4)
                    </div>
                    {collectItems.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setCollectItems((prev) => [...prev, createEmptyCollectItem(prev.length)])}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold"
                      >
                        ➕ Thêm vật phẩm
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {collectItems.map((it, idx) => (
                      <div key={it.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">Vật phẩm #{idx + 1}</span>
                          {collectItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setCollectItems((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-xs text-rose-400 font-bold"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <input
                            type="text"
                            value={it.icon}
                            onChange={(e) =>
                              setCollectItems((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, icon: e.target.value } : x))
                              )
                            }
                            placeholder="Icon (⭐)"
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-center text-white"
                          />
                          <input
                            type="text"
                            required
                            value={it.label}
                            onChange={(e) =>
                              setCollectItems((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x))
                              )
                            }
                            placeholder="Tên vật phẩm"
                            className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                          />
                          <select
                            value={it.mapId}
                            onChange={(e) => {
                              const m = TOWN_MAP_OPTIONS.find((o) => o.id === e.target.value) || TOWN_MAP_OPTIONS[0];
                              setCollectItems((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, mapId: m.id, mapName: m.name } : x))
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            {TOWN_MAP_OPTIONS.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
                          <input
                            type="text"
                            value={it.hint}
                            onChange={(e) =>
                              setCollectItems((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, hint: e.target.value } : x))
                              )
                            }
                            placeholder="Gợi ý vị trí cho người chơi..."
                            className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                          />
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span>X:</span>
                            <input
                              type="number"
                              min={12}
                              max={88}
                              value={it.x}
                              onChange={(e) =>
                                setCollectItems((prev) =>
                                  prev.map((x, i) => (i === idx ? { ...x, x: Number(e.target.value) } : x))
                                )
                              }
                              className="w-14 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                            />
                            <span>Y:</span>
                            <input
                              type="number"
                              min={42}
                              max={86}
                              value={it.y}
                              onChange={(e) =>
                                setCollectItems((prev) =>
                                  prev.map((x, i) => (i === idx ? { ...x, y: Number(e.target.value) } : x))
                                )
                              }
                              className="w-14 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const rand = RANDOM_SAFE_COORDS[Math.floor(Math.random() * RANDOM_SAFE_COORDS.length)];
                              setCollectItems((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, x: rand.x, y: rand.y } : x))
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold"
                          >
                            🎲 Ngẫu nhiên X/Y
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHI TIẾT LOẠI 3: GHÉ NHÀ / TƯƠNG TÁC CƯ DÂN */}
              {questType === 'visit' && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-indigo-300 mb-1">
                    Chọn Cư Dân &amp; Ngôi Nhà cần ghé thăm
                  </label>
                  <select
                    value={questPresetIdx}
                    onChange={(e) => setQuestPresetIdx(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  >
                    {QUEST_NPC_PRESETS.map((p, idx) => (
                      <option key={p.npcId} value={idx}>
                        {p.icon} {p.npcName} — {p.mapName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition"
                >
                  {editingQuestId ? '💾 Lưu Thay Đổi' : '💾 Lưu & Đưa Vào Sổ Tay Game'}
                </button>
                <button
                  type="button"
                  onClick={() => setQuestMode('list')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================== TAB 3: LỜI CHÚC & BACKUP ======================== */}
        {activeTab === 'wishes' && wishMode === 'list' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">💌 Danh Sách Lời Chúc &amp; Sao Lưu</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Duyệt, chỉnh sửa, ẩn/hiện lời chúc trong Lọ Sao và xuất file Backup JSON.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openCreateWishForm}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  ➕ Thêm Lời Chúc
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold"
                >
                  ⬇️ Tải Backup JSON
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { id: 'all', label: `Tất cả (${sheetWishes.length})` },
                { id: 'approved', label: `Đã duyệt (${sheetWishes.filter((w) => w.approved).length})` },
                { id: 'hidden', label: `Đang ẩn (${sheetWishes.filter((w) => !w.approved).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setWishFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    wishFilter === f.id
                      ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                      : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 space-y-2.5">
              {filteredWishes.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Không có lời chúc nào trong mục này.</p>
              ) : (
                filteredWishes.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-indigo-300">{w.nickname || 'Người lạ'}</div>
                      <p className="text-sm text-slate-200 mt-0.5 break-words">“{w.message}”</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditWishForm(w)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleWishApproved(w.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          w.approved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {w.approved ? 'Đã duyệt' : 'Đang ẩn'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWish(w.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 text-xs font-bold"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'wishes' && wishMode === 'form' && (
          <div className="space-y-5 max-w-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingWishId ? '✏️ Chỉnh Sửa Lời Chúc' : '➕ Thêm Lời Chúc Mới'}
              </h2>
              <button
                type="button"
                onClick={() => setWishMode('list')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                ⬅️ Về Danh Sách
              </button>
            </div>
            <form onSubmit={handleSaveWish} className="bg-[#111827] rounded-2xl border border-slate-800 p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tên người gửi</label>
                <input
                  type="text"
                  value={wishName}
                  onChange={(e) => setWishName(e.target.value)}
                  placeholder="Ban Biên Tập"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nội dung lời chúc *</label>
                <textarea
                  rows={3}
                  required
                  value={wishMsg}
                  onChange={(e) => setWishMsg(e.target.value)}
                  placeholder="Viết một lời chúc dịu dàng..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold"
              >
                💾 Lưu Lời Chúc
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL XEM TRƯỚC TRUYỆN DẠNG SÁCH TRUYỆN MỞ ĐÔI ================= */}
      {previewComic && (
        <div
          onClick={() => {
            setPreviewComic(null);
            setIsPreviewExpanded(false);
          }}
          className="fixed inset-0 z-50 bg-black/82 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#111827] border border-slate-700 rounded-2xl flex flex-col overflow-hidden my-auto ${
              isPreviewExpanded
                ? 'w-[95vw] h-[95dvh] max-w-none max-h-[95dvh]'
                : 'w-full max-w-5xl h-[88dvh] max-h-[88dvh]'
            }`}
          >
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  📖 {previewComic.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {previewComic.pages?.length || 0} trang • LV.{previewComic.minLevel || 0}+ • ✍️ {previewComic.author}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPreviewExpanded((prev) => !prev)}
                  title={isPreviewExpanded ? 'Thu nhỏ về kích thước thường' : 'Phóng to 95% màn hình'}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center"
                >
                  {isPreviewExpanded ? '🗗' : '⛶'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewComic(null);
                    setIsPreviewExpanded(false);
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
              <ComicBookViewer comic={previewComic} theme="dark" isExpanded={isPreviewExpanded} />
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM CHI TIẾT NHIỆM VỤ ================= */}
      {previewQuest && (
        <div
          onClick={() => setPreviewQuest(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#111827] border border-slate-700 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">{previewQuest.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thưởng: +{previewQuest.rewardStars} ⭐ • {previewQuest.mapName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuest(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {previewQuest.questType === 'quiz' && previewQuest.quiz && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-purple-300">❓ {previewQuest.quiz.question}</div>
                <div className="space-y-1.5">
                  {previewQuest.quiz.options.map((o, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg text-xs border ${
                        idx === Number(previewQuest.quiz.correctIndex)
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {o}{' '}
                      {idx === Number(previewQuest.quiz.correctIndex) ? '✅ (Đúng)' : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewQuest.questType === 'collect' && Array.isArray(previewQuest.targets) && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-300 uppercase">Vật phẩm trên bản đồ:</div>
                {previewQuest.targets.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="font-bold text-white">
                      {t.icon} {t.label} — <span className="text-amber-300">{t.mapName}</span> ({t.x}%, {t.y}%)
                    </div>
                    <div className="text-slate-400 mt-0.5">💡 {t.hint}</div>
                  </div>
                ))}
              </div>
            )}

            {(!previewQuest.questType || previewQuest.questType === 'visit') && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                🏠 Người chơi ghé thăm <strong>{previewQuest.npcName}</strong> tại{' '}
                <strong>{previewQuest.mapName}</strong> và thực hiện tương tác để hoàn thành.
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
