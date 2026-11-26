import React, { useState, useEffect, useRef } from 'react';
import CharacterAvatar from './CharacterAvatar';
import ComicBookViewer from './ComicBookViewer';
import {
  getTodayComic,
  generateComicFromIdea,
  getUnlockedComicsForLevel,
} from '../data/dailyComicsData';
import { submitComicDraftToCloud } from '../services/supabaseClient';
import { checkCurrentUserBlocked } from '../utils/userAuthService';

/**
 * TỦ TRUYỆN & TRUYỆN TRANH MỖI NGÀY (MỞ TỪ ICON SÁCH TRÊN TOP MENU)
 * - Mở ra thấy Tủ Truyện:
 *   + Nếu truyện hôm nay CHƯA lưu -> hiện nổi bật mục "Truyện Trong Ngày" để đọc & lưu.
 *   + Nếu truyện hôm nay ĐÃ lưu -> ẩn mục "Truyện Trong Ngày", truyện đó nằm trong "Tủ Truyện Đã Sưu Tầm".
 * - Đọc truyện phong cách Manga 5–10 trang, 3 khung/trang, không bị reset về trang 1.
 */
export default function DailyComicModal({
  isOpen = false,
  playerLevel = 0,
  residentName = 'Cư dân Sao Bông',
  collectedComics = [],
  customComics = [],
  hasReadTodayComic = false,
  onCollectComic,
  onFinishedReadingComic,
  onShowToast,
  onClose,
}) {
  const [view, setView] = useState('shelf'); // 'shelf' | 'reader' | 'idea'
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeComic, setActiveComic] = useState(() => getTodayComic(undefined, playerLevel, customComics));
  const [pageIdx, setPageIdx] = useState(0);
  const [hasNotifiedFinishForId, setHasNotifiedFinishForId] = useState(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);

  const [ideaText, setIdeaText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const swipeStartXRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Chỉ reset về màn hình Tủ Truyện khi mở modal (isOpen chuyển từ false -> true)
  useEffect(() => {
    if (!isOpen) return;
    setView('shelf');
    setIsExpanded(false);
    setPageIdx(0);
    setHasNotifiedFinishForId(null);
    setZoomedImageUrl(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (zoomedImageUrl) setZoomedImageUrl(null);
        else onCloseRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, zoomedImageUrl]);

  if (!isOpen) return null;

  const customById = new Map((customComics || []).map((c) => [c.id, c]));
  const hydrateComic = (comic) => {
    if (!comic) return comic;
    if (comic.isAdminImageComic && (!Array.isArray(comic.pages) || comic.pages.length === 0)) {
      return customById.get(comic.id) || comic;
    }
    return comic;
  };

  const todayComic = getTodayComic(undefined, playerLevel, customComics);
  const isTodaySavedInShelf = collectedComics.some((c) => c.id === todayComic?.id);
  const unlockedCatalog = getUnlockedComicsForLevel(playerLevel, customComics);

  const pages = activeComic?.pages || [];
  const totalPages = pages.length;
  const safePageIdx = Math.max(0, Math.min(pageIdx, Math.max(0, totalPages - 1)));
  const currentPage = pages[safePageIdx];
  const isLastPage = safePageIdx >= totalPages - 1;
  const isActiveCollected = collectedComics.some((c) => c.id === activeComic?.id);
  const isImagePage = Boolean(currentPage?.imageUrl);

  const openComicReader = (comic) => {
    const full = hydrateComic(comic);
    if (!full || !Array.isArray(full.pages) || full.pages.length === 0) {
      onShowToast?.('⚠️ Tập truyện ảnh này đã bị xóa khỏi máy cục bộ.');
      return;
    }
    setActiveComic(full);
    setPageIdx(0);
    setHasNotifiedFinishForId(null);
    setZoomedImageUrl(null);
    setView('reader');
  };

  const goToPage = (targetIdx) => {
    setPageIdx(Math.max(0, Math.min(totalPages - 1, targetIdx)));
  };

  const goNextPage = () => {
    if (safePageIdx < totalPages - 1) goToPage(safePageIdx + 1);
  };

  const goPrevPage = () => {
    if (safePageIdx > 0) goToPage(safePageIdx - 1);
  };

  const handleCompleteAndCollect = () => {
    if (typeof onCollectComic === 'function' && !isActiveCollected) {
      onCollectComic(activeComic);
    }
    if (hasNotifiedFinishForId !== activeComic?.id && typeof onFinishedReadingComic === 'function') {
      setHasNotifiedFinishForId(activeComic?.id);
      onFinishedReadingComic(activeComic);
    }
  };

  const handleGenerateIdea = async (e) => {
    e.preventDefault();
    if (!ideaText.trim() || isGenerating) return;
    const blockCheck = checkCurrentUserBlocked(residentName);
    if (blockCheck.isBlocked) {
      onShowToast?.(`🚫 Bạn không thể gửi câu chuyện: ${blockCheck.reason}`);
      return;
    }
    setIsGenerating(true);
    try {
      const newComic = await generateComicFromIdea({
        ideaText,
        authorName: residentName || 'Cư dân Sao Bông',
      });
      submitComicDraftToCloud(newComic).catch(() => {});
      openComicReader(newComic);
      setIdeaText('');
      onShowToast?.('✨ Đã biên kịch xong tập truyện Manga 5 trang! Lật đọc ngay nhé!');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPanels = Array.isArray(currentPage?.panels)
    ? currentPage.panels
    : currentPage
    ? [
        {
          narration: currentPage.emotion || '',
          bgTint: currentPage.bgTint || '#FFF9E6',
          characters: [
            {
              id: currentPage.characterId || 'star',
              name: currentPage.speaker || 'Bé Sao Bông',
              speech: currentPage.speech || '',
            },
          ],
        },
      ]
    : [];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[965] bg-[#3A222D]/78 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
    >
      <div
        className={`kawaii-card flex flex-col bg-[#FFFDF9] overflow-hidden relative pop-in my-auto ${
          view === 'reader'
            ? isExpanded
              ? 'w-[95vw] h-[95dvh] max-w-none max-h-[95dvh]'
              : 'w-full max-w-5xl h-[88dvh] max-h-[88dvh]'
            : 'w-full max-w-xl max-h-[94dvh]'
        }`}
      >
        {/* HEADER */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#F3E8FF] via-[#FFE4EE] to-[#FFF4BD] border-b-[3px] border-[#593A47] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">📖</span>
            <div className="min-w-0 text-left">
              <h3 className="text-sm sm:text-base font-black text-[#593A47] truncate">
                Tủ Truyện Tranh Thị Trấn
              </h3>
              <p className="text-[11px] font-bold text-[#7D5867] truncate">
                Đã sưu tầm {collectedComics.length} tập • Truyện mới mỗi ngày
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {view === 'reader' && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={isExpanded ? 'Thu nhỏ khung truyện' : 'Phóng to toàn màn hình 95%'}
                title={isExpanded ? 'Thu nhỏ về kích thước thường' : 'Phóng to 95% màn hình'}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#FFF4BD] border-2 border-[#593A47] text-[#593A47] font-black text-sm flex items-center justify-center shrink-0 transition"
              >
                {isExpanded ? '🗗' : '⛶'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng tủ truyện"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#FFE4EE] border-2 border-[#593A47] text-[#593A47] font-black text-xs flex items-center justify-center shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* TAB BAR KHI Ở TỦ TRUYỆN HOẶC AI BIÊN KỊCH */}
        {view !== 'reader' && (
          <div className="px-4 pt-2 bg-[#FFF6FA] border-b-2 border-[#593A47] flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setView('shelf')}
              className={`px-3 py-1.5 rounded-t-xl text-xs font-black border-t-2 border-x-2 -mb-[2px] ${
                view === 'shelf'
                  ? 'bg-[#FFFDF9] border-[#593A47] text-[#593A47]'
                  : 'border-transparent text-[#8C6575]'
              }`}
            >
              📚 Tủ Truyện ({collectedComics.length})
            </button>
            <button
              type="button"
              onClick={() => setView('idea')}
              className={`px-3 py-1.5 rounded-t-xl text-xs font-black border-t-2 border-x-2 -mb-[2px] ${
                view === 'idea'
                  ? 'bg-[#FFFDF9] border-[#593A47] text-[#593A47]'
                  : 'border-transparent text-[#8C6575]'
              }`}
            >
              ✨ AI Biên Kịch
            </button>
          </div>
        )}

        {/* 1. MÀN HÌNH TỦ TRUYỆN & TRUYỆN TRONG NGÀY */}
        {view === 'shelf' && (
          <div className="p-4 overflow-y-auto space-y-4 text-left flex-1">
            {/* TRUYỆN TRONG NGÀY — CHỈ HIỆN KHI CHƯA LƯU VÀO TỦ TRUYỆN */}
            {!isTodaySavedInShelf && todayComic && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF4BD] to-[#FFE4EE] border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF6B9D] border border-[#593A47] text-[10px] font-black text-white">
                    {!hasReadTodayComic ? '🔴 MỚI HÔM NAY' : '📖 TRUYỆN TRONG NGÀY'}
                  </span>
                  <span className="text-[10.5px] font-black text-[#593A47]">
                    {todayComic.pages?.length || 5} trang Manga
                  </span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#593A47]">
                    {todayComic.title}
                  </h4>
                  <p className="text-[11px] font-bold text-[#7D5867] mt-0.5">
                    Chưa lưu vào tủ truyện — đọc xong bấm <strong>Lưu vào Tủ Truyện</strong> để giữ vĩnh viễn nhé!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openComicReader(todayComic)}
                    className="kawaii-btn flex-1 py-2 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] text-xs sm:text-sm font-black"
                  >
                    📖 Đọc Truyện Hôm Nay
                  </button>
                </div>
              </div>
            )}

            {/* MỤC TỦ TRUYỆN ĐÃ SƯU TẦM */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#593A47] uppercase tracking-wide">
                  📚 Tủ Truyện Đã Sưu Tầm ({collectedComics.length})
                </h4>
              </div>

              {collectedComics.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-dashed border-[#593A47]/35 text-center text-xs font-bold text-[#7D5867]">
                  Chưa có cuốn nào trong tủ! Đọc tập <strong>Truyện Trong Ngày</strong> ở trên và bấm <strong>Lưu</strong> để sưu tầm nhé.
                </div>
              ) : (
                <div className="space-y-2">
                  {collectedComics.map((comic) => (
                    <button
                      key={comic.id}
                      type="button"
                      onClick={() => openComicReader(comic)}
                      className="w-full p-3 rounded-2xl bg-white hover:bg-[#FFF6FA] border-2 border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center justify-between gap-2 text-left transition"
                    >
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black text-[#593A47] truncate">
                          📖 {comic.title}
                        </div>
                        <div className="text-[10px] font-bold text-[#8C6575] truncate">
                          ✍️ {comic.author} • {comic.pages?.length || 5} trang
                        </div>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-xl bg-[#DFF8EB] border border-[#593A47] text-[10px] font-black text-[#16805D]">
                        Đọc lại
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* KHO TRUYỆN ĐÃ MỞ KHÓA THEO LEVEL */}
            <div className="pt-2 border-t-2 border-dashed border-[#F0DCE5] space-y-1.5">
              <div className="text-[11px] font-black text-[#7D5867] uppercase">
                🌟 Các tập truyện đã mở khóa ở LV.{playerLevel}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {unlockedCatalog.map((c) => {
                  const owned = collectedComics.some((x) => x.id === c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openComicReader(c)}
                      className="px-3 py-2 rounded-xl bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#593A47]/35 flex items-center justify-between text-xs font-extrabold text-[#593A47]"
                    >
                      <span className="truncate">
                        📖 {c.title} ({c.pages.length} trang)
                      </span>
                      <span className="shrink-0 text-[10px] font-black">
                        {owned ? '✅ Đã lưu' : '👀 Đọc'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB AI BIÊN KỊCH */}
        {view === 'idea' && (
          <form onSubmit={handleGenerateIdea} className="p-5 space-y-3.5 text-left">
            <div className="flex items-center gap-2.5">
              <CharacterAvatar id="aurora" className="w-14 h-14 shrink-0" />
              <p className="text-xs font-bold text-[#7D5867] leading-relaxed">
                Gửi một tình huống vui tại Thị Trấn Sao Bông — AI Biên Kịch sẽ sáng tác ngay thành <strong>tập truyện Manga 5 trang (15 khung tranh)</strong> để bạn đọc &amp; lưu vào Tủ Truyện!
              </p>
            </div>
            <textarea
              rows={3}
              maxLength={180}
              required
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Ví dụ: Bé Sao Bông và Chú Gió Mát tổ chức cuộc thi thả diều trên Đỉnh Đồi..."
              className="w-full p-3.5 rounded-2xl bg-white border-2 border-[#593A47] text-sm font-bold text-[#593A47] resize-none"
            />
            <button
              type="submit"
              disabled={!ideaText.trim() || isGenerating}
              className="kawaii-btn w-full py-2.5 bg-[#FFE066] hover:bg-[#FFD166] disabled:opacity-50 text-[#593A47] font-black text-sm"
            >
              {isGenerating ? '✨ Đang vẽ kịch bản 5 trang...' : '🪄 Tạo Tập Truyện Manga Ngay'}
            </button>
          </form>
        )}

        {/* 3. TRÌNH ĐỌC SÁCH TRUYỆN MỞ ĐÔI (StPageFlip) */}
        {view === 'reader' && (
          <div className="p-3 sm:p-4 flex flex-col gap-2.5 flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setView('shelf');
                }}
                className="text-xs font-black text-[#7D5867] hover:text-[#593A47] flex items-center gap-1"
              >
                ⬅️ Về Tủ Truyện
              </button>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF3B0] border-2 border-[#593A47] text-[11px] font-black text-[#593A47]">
                📖 {activeComic?.pages?.length || 0} trang • {activeComic?.author}
              </span>
            </div>

            <ComicBookViewer
              comic={activeComic}
              theme="light"
              isExpanded={isExpanded}
              actionLabel={isActiveCollected ? '🎉 Xong & Chia sẻ' : '📚 Lưu vào Tủ Truyện'}
              onActionClick={handleCompleteAndCollect}
            />
          </div>
        )}
        {/* LIGHTBOX PHÓNG TO ẢNH TRANG TRUYỆN */}
        {zoomedImageUrl && (
          <div
            onClick={() => setZoomedImageUrl(null)}
            className="fixed inset-0 z-[990] bg-black/85 flex items-center justify-center p-3 cursor-zoom-out"
          >
            <img
              src={zoomedImageUrl}
              alt="Xem ảnh trang truyện phóng to"
              className="max-w-full max-h-[94dvh] object-contain rounded-xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setZoomedImageUrl(null)}
              className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white text-[#593A47] border-2 border-[#593A47] font-black text-sm shadow-lg"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
