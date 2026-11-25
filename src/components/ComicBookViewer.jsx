import React, { useState, useEffect, useRef } from 'react';
import { PageFlip } from 'page-flip';
import MangaScenePanel from './MangaScenePanel';

/**
 * TRÌNH ĐỌC SÁCH TRUYỆN DÙNG THƯ VIỆN StPageFlip (page-flip) — TỐI ƯU 60 FPS
 * - Bọc React.memo với custom comparator để miễn nhiễm 100% với nhịp setNowMs (1s) từ App.jsx.
 * - Debounce ResizeObserver (180ms) tránh khởi tạo lại PageFlip liên tục khi phóng to/thu nhỏ.
 * - Không dùng overflow-y-auto hay animate-pulse bên trong trang sách để GPU cache trọn trang thành 1 texture.
 * - Thông số StPageFlip nhẹ nhàng (flippingTime: 500ms, maxShadowOpacity: 0.28).
 */
function ComicBookViewerInner({
  comic,
  theme = 'light', // 'light' (trong game) | 'dark' (trong trang Admin)
  isExpanded = false,
  actionLabel = '',
  onActionClick,
  onReachLastSpread,
}) {
  const stageRef = useRef(null);
  const hostRef = useRef(null);
  const sourceRef = useRef(null);
  const pageFlipRef = useRef(null);
  const currentIdxRef = useRef(0);
  const onActionClickRef = useRef(onActionClick);
  const onReachLastSpreadRef = useRef(onReachLastSpread);

  onActionClickRef.current = onActionClick;
  onReachLastSpreadRef.current = onReachLastSpread;

  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [currentFlipIdx, setCurrentFlipIdx] = useState(0);
  const [totalFlipPages, setTotalFlipPages] = useState(0);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);

  const rawPages = Array.isArray(comic?.pages) ? comic.pages : [];
  const totalContentPages = rawPages.length;
  const needsMoralFillerPage = totalContentPages % 2 === 1;

  // Reset trang về 0 khi đổi sang tập truyện khác
  useEffect(() => {
    currentIdxRef.current = 0;
    setCurrentFlipIdx(0);
    setZoomedImageUrl(null);
  }, [comic?.id]);

  // Đo kích thước stage với debounce 180ms (tránh destroy/recreate liên tục khi resize/expand)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let debounceTimer = null;
    const measureNow = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w > 120 && h > 180) {
        setStageSize((prev) =>
          Math.abs(prev.w - w) > 6 || Math.abs(prev.h - h) > 6 ? { w, h } : prev
        );
      }
    };

    // Lần đầu đo ngay để không có độ trễ mở sách
    measureNow();

    const ro = new ResizeObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measureNow, 180);
    });
    ro.observe(el);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      ro.disconnect();
    };
  }, [isExpanded]);

  // Khởi tạo StPageFlip với kích thước chính xác & thông số nhẹ mượt 60 FPS
  useEffect(() => {
    const hostEl = hostRef.current;
    const srcEl = sourceRef.current;
    if (!hostEl || !srcEl || stageSize.w <= 0 || stageSize.h <= 0) return;

    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch {}
      pageFlipRef.current = null;
    }
    hostEl.innerHTML = '';

    const bookEl = document.createElement('div');
    bookEl.className = 'stf-book-root';

    const srcPages = srcEl.querySelectorAll('.stf-page-item');
    srcPages.forEach((node) => {
      bookEl.appendChild(node.cloneNode(true));
    });
    hostEl.appendChild(bookEl);

    const isPortraitMode = stageSize.w < 680;
    const padX = isPortraitMode ? 16 : 24;
    const padY = 24;
    const availW = Math.max(240, stageSize.w - padX);
    const availH = Math.max(320, stageSize.h - padY);

    const pageWidth = isPortraitMode ? availW : Math.floor(availW / 2);
    const pageHeight = availH;
    const startPage = Math.max(0, Math.min(currentIdxRef.current, Math.max(0, srcPages.length - 1)));

    const flip = new PageFlip(bookEl, {
      width: pageWidth,
      height: pageHeight,
      size: 'fixed',
      showCover: true,
      drawShadow: true,
      maxShadowOpacity: 0.28,
      flippingTime: 500,
      usePortrait: isPortraitMode,
      startPage,
      startZIndex: 10,
      autoSize: false,
      mobileScrollSupport: true,
      swipeDistance: 30,
      clickEventForward: false,
      showPageCorners: true,
      disableFlipByClick: false,
    });

    const clonedPages = bookEl.querySelectorAll('.stf-page-item');
    flip.loadFromHTML(clonedPages);

    setTotalFlipPages(clonedPages.length);
    setCurrentFlipIdx(startPage);

    flip.on('flip', (e) => {
      currentIdxRef.current = e.data;
      setCurrentFlipIdx(e.data);
    });

    pageFlipRef.current = flip;

    return () => {
      try {
        flip.destroy();
      } catch {}
      pageFlipRef.current = null;
      if (hostEl) hostEl.innerHTML = '';
    };
  }, [comic?.id, totalContentPages, stageSize.w, stageSize.h]);

  const handleHostClick = (e) => {
    const zoomBtn = e.target?.closest?.('[data-zoom-url]');
    if (zoomBtn) {
      e.stopPropagation();
      const url = zoomBtn.getAttribute('data-zoom-url');
      if (url) setZoomedImageUrl(url);
    }
  };

  const isAtStart = currentFlipIdx <= 0;
  const isAtEnd = totalFlipPages > 0 && currentFlipIdx >= totalFlipPages - 2;

  useEffect(() => {
    if (isAtEnd && typeof onReachLastSpreadRef.current === 'function') {
      onReachLastSpreadRef.current();
    }
  }, [isAtEnd, comic?.id]);

  const handleFlipPrev = () => {
    pageFlipRef.current?.flipPrev('top');
  };

  const handleFlipNext = () => {
    pageFlipRef.current?.flipNext('top');
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (zoomedImageUrl) {
        if (e.key === 'Escape') setZoomedImageUrl(null);
        return;
      }
      if (e.key === 'ArrowRight') handleFlipNext();
      else if (e.key === 'ArrowLeft') handleFlipPrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedImageUrl]);

  const isDark = theme === 'dark';

  const getPageLabel = () => {
    if (currentFlipIdx === 0) return 'Bìa trước';
    if (currentFlipIdx >= totalFlipPages - 1) return 'Bìa sau';
    return `Trang ${Math.min(currentFlipIdx, totalContentPages)} / ${totalContentPages}`;
  };

  const renderContentPage = (page, pageNum) => {
    const isImagePage = Boolean(page?.imageUrl);
    const panels = Array.isArray(page?.panels)
      ? page.panels
      : page && !isImagePage
      ? [
          {
            narration: page.emotion || '',
            bgTint: page.bgTint || '#FFF9E6',
            characters: [
              {
                id: page.characterId || 'star',
                name: page.speaker || 'Bé Sao Bông',
                speech: page.speech || '',
              },
            ],
          },
        ]
      : [];

    return (
      <div
        key={`content_${pageNum}`}
        className="stf-page-item bg-[#FFFDF7] border border-[#593A47]/25 overflow-hidden"
      >
        <div className="h-full w-full flex flex-col justify-between p-2 sm:p-3 text-left">
          {/* Header trang */}
          <div className="flex items-center justify-between text-[10px] font-extrabold text-[#9A7484] pb-1 mb-1 border-b border-dashed border-[#E6D5DC] shrink-0">
            <span className="truncate max-w-[78%]">{comic?.title}</span>
            <span className="shrink-0">Tr. {pageNum}</span>
          </div>

          {/* Nội dung trang — bỏ nested scroll để GPU cache 1 layer mượt 60 FPS */}
          <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden">
            {isImagePage ? (
              <div className="h-full flex flex-col items-center justify-center gap-1">
                <div className="relative w-full flex-1 min-h-0 rounded-xl overflow-hidden bg-[#FFF9F0] border border-[#593A47]/20 flex items-center justify-center">
                  <img
                    src={page.imageUrl}
                    alt={`${comic?.title || 'Truyện'} - Trang ${pageNum}`}
                    decoding="async"
                    loading="eager"
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                  <button
                    type="button"
                    data-zoom-url={page.imageUrl}
                    className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-[#593A47]/85 hover:bg-[#593A47] text-white text-[10px] font-black shadow cursor-pointer"
                  >
                    🔍 Phóng to
                  </button>
                </div>
                {page.caption && (
                  <p className="text-[11px] font-extrabold text-[#593A47] text-center px-1 shrink-0">
                    {page.caption}
                  </p>
                )}
              </div>
            ) : (
              <div className="book-manga-grid grid grid-cols-2 gap-1.5 my-auto">
                {panels.map((panel, pIdx) => {
                  const isWide =
                    panels.length === 1 ||
                    pIdx === 0 ||
                    (panels.length === 4 && pIdx === 3);
                  return <MangaScenePanel key={pIdx} panel={panel} isWide={isWide} />;
                })}
              </div>
            )}
          </div>

          {/* Số trang ở chân trang */}
          <div className="pt-1 mt-1 text-center text-[10px] font-black text-[#8C6575] shrink-0">
            — {pageNum} / {totalContentPages} —
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2.5 select-none">
      {/* NGUỒN TRANG ẨN */}
      <div ref={sourceRef} className="hidden" aria-hidden="true">
        {/* 1. BÌA CỨNG TRƯỚC */}
        <div
          data-density="hard"
          className="stf-page-item bg-gradient-to-br from-[#FFE4EE] via-[#FFF4BD] to-[#E0F7F4] border-[3px] border-[#593A47] overflow-hidden"
        >
          <div className="h-full w-full p-5 sm:p-6 flex flex-col items-center justify-between text-center relative">
            <div className="w-full flex items-center justify-between text-[10px] font-black text-[#7D5867] uppercase tracking-wider">
              <span>🌟 Thị Trấn Sao Bông</span>
              <span>LV.{comic?.minLevel || 0}+</span>
            </div>

            <div className="space-y-3 my-auto">
              {rawPages[0]?.imageUrl ? (
                <div className="w-40 h-44 mx-auto rounded-2xl overflow-hidden border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] bg-white">
                  <img
                    src={rawPages[0].imageUrl}
                    alt={comic?.title}
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto rounded-3xl bg-white/90 border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] flex items-center justify-center text-5xl">
                  📖
                </div>
              )}

              <div className="px-3 py-1 inline-block rounded-full bg-[#FF85A9] border-2 border-[#593A47] text-[10px] font-black text-white uppercase">
                Truyện Tranh Chữa Lành • {totalContentPages} Trang
              </div>

              <h3 className="text-lg sm:text-xl font-black text-[#593A47] leading-snug px-2">
                {comic?.title}
              </h3>

              <p className="text-xs font-extrabold text-[#7D5867]">
                ✍️ {comic?.author || 'Ban Biên Tập Thị Trấn'}
              </p>
            </div>

            <div className="w-full pt-2 border-t-2 border-dashed border-[#593A47]/25 text-[11px] font-black text-[#D9386A]">
              ✋ Kéo góc trang hoặc bấm “Lật tiếp” để mở sách ➡️
            </div>
          </div>
        </div>

        {/* 2. CÁC TRANG NỘI DUNG */}
        {rawPages.map((pg, idx) => renderContentPage(pg, idx + 1))}

        {/* 3. TRANG LỜI NHẮN ĐỆM (NẾU SỐ TRANG NỘI DUNG LẺ) */}
        {needsMoralFillerPage && (
          <div className="stf-page-item bg-gradient-to-br from-[#FFFDF5] via-[#FFF6FA] to-[#F3E8FF] border border-[#593A47]/25 overflow-hidden">
            <div className="h-full w-full p-5 flex flex-col items-center justify-center text-center space-y-3">
              <div className="text-4xl">✨📖✨</div>
              <span className="px-3 py-1 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-[11px] font-black text-[#593A47] uppercase">
                Hết Tập
              </span>
              <h4 className="text-base font-black text-[#593A47]">{comic?.title}</h4>
              {comic?.moral && (
                <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-[#593A47] shadow-[0_3px_0_#593A47] text-xs sm:text-sm font-extrabold text-[#16805D] leading-relaxed">
                  💡 “{comic.moral}”
                </div>
              )}
              <div className="text-[11px] font-bold text-[#8C6575]">
                ✍️ {comic?.author || 'Ban Biên Tập Thị Trấn'}
              </div>
            </div>
          </div>
        )}

        {/* 4. BÌA CỨNG SAU */}
        <div
          data-density="hard"
          className="stf-page-item bg-gradient-to-br from-[#F3E8FF] via-[#FFE4EE] to-[#FFF4BD] border-[3px] border-[#593A47] overflow-hidden"
        >
          <div className="h-full w-full p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-5xl">🌟</div>
            <div className="px-3.5 py-1 rounded-full bg-white border-2 border-[#593A47] text-xs font-black text-[#593A47]">
              THE END 💖
            </div>
            {comic?.moral && (
              <p className="text-xs sm:text-sm font-extrabold text-[#593A47] max-w-xs leading-relaxed">
                “{comic.moral}”
              </p>
            )}
            <div className="text-[11px] font-bold text-[#7D5867]">
              Thị Trấn Sao Bông • Tủ Truyện Kỷ Niệm
            </div>
          </div>
        </div>
      </div>

      {/* VÙNG STAGE BUNG FULL KHUNG — CON TRỎ BÀN TAY TRÊN PC */}
      <div
        ref={stageRef}
        onClick={handleHostClick}
        className={`stf-book-stage flex-1 min-h-[420px] w-full rounded-2xl p-2 flex items-center justify-center overflow-hidden ${
          isDark
            ? 'bg-slate-950/75 border border-slate-800'
            : 'bg-[#F8EEF3] border-2 border-[#593A47]/20'
        }`}
      >
        <div ref={hostRef} className="flex items-center justify-center" />
      </div>

      {/* THANH ĐIỀU KHIỂN LẬT TRANG */}
      <div className="flex items-center justify-between gap-2 pt-0.5 shrink-0">
        <button
          type="button"
          disabled={isAtStart}
          onClick={handleFlipPrev}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black disabled:opacity-40 transition ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              : 'kawaii-btn bg-white text-[#593A47]'
          }`}
        >
          ⬅️ Lật lại
        </button>

        <div
          className={`px-3 py-1 rounded-full text-xs font-black ${
            isDark
              ? 'bg-slate-800 text-slate-200 border border-slate-700'
              : 'bg-[#FFF3B0] text-[#593A47] border-2 border-[#593A47]'
          }`}
        >
          {getPageLabel()}
        </div>

        {isAtEnd && actionLabel ? (
          <button
            type="button"
            onClick={() => onActionClickRef.current?.()}
            className="kawaii-btn px-4 py-2 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] text-xs sm:text-sm font-black"
          >
            {actionLabel}
          </button>
        ) : (
          <button
            type="button"
            disabled={currentFlipIdx >= totalFlipPages - 1}
            onClick={handleFlipNext}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black disabled:opacity-40 transition ${
              isDark
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'kawaii-btn bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47]'
            }`}
          >
            Lật tiếp ➡️
          </button>
        )}
      </div>

      {/* LIGHTBOX PHÓNG TO ẢNH */}
      {zoomedImageUrl && (
        <div
          onClick={() => setZoomedImageUrl(null)}
          className="fixed inset-0 z-[995] bg-black/85 flex items-center justify-center p-3 cursor-zoom-out"
        >
          <img
            src={zoomedImageUrl}
            alt="Xem phóng to trang truyện"
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
  );
}

const ComicBookViewer = React.memo(
  ComicBookViewerInner,
  (prev, next) =>
    prev.comic?.id === next.comic?.id &&
    (prev.comic?.pages?.length || 0) === (next.comic?.pages?.length || 0) &&
    prev.theme === next.theme &&
    prev.isExpanded === next.isExpanded &&
    prev.actionLabel === next.actionLabel
);

export default ComicBookViewer;
