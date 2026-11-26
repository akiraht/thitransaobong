import React, { useState, useEffect, useRef } from 'react';
import { CHARACTER_SPRITES } from '../data/characterSprites';
import { createMiniGameBgmController, loadBgmMuted } from '../utils/miniGameAudio';

/**
 * KHUNG GIAO DIỆN DÙNG CHUNG CHO MỌI MINI-GAME KAWAII (TÁCH PAGE ĐỘC LẬP)
 * - Tuân thủ ui-design-guidelines.md: nền kem ấm #FFFDF9, viền #593A47, đổ bóng cứng kawaii.
 * - Tối ưu cả màn hình dọc điện thoại lẫn desktop.
 * - Tích hợp sẵn nhạc nền riêng từng mini-game (ưu tiên MP3 trong public/audio/minigames/ + fallback synth).
 */
export default function MiniGameShell({
  game,
  statusBadge = null,
  headerRight = null,
  result = null, // { won: boolean, title: string, summary: string, rewardHearts?: number, rewardStars?: number }
  onRestart = null,
  maxWidthClass = 'max-w-3xl',
  fullViewport = false,
  children,
}) {
  const npcSprite = game?.npcId ? CHARACTER_SPRITES[game.npcId] : null;
  const [bgmMuted, setBgmMuted] = useState(loadBgmMuted);
  const bgmRef = useRef(null);

  useEffect(() => {
    if (!game?.id) return undefined;
    const ctrl = createMiniGameBgmController(game.id);
    bgmRef.current = ctrl;

    // Tự động kích hoạt nhạc khi có tương tác đầu tiên (tuân thủ chính sách autoplay trình duyệt)
    const unlockAndPlay = () => {
      if (!ctrl.isMuted()) ctrl.tryPlay();
    };
    if (!ctrl.isMuted()) {
      ctrl.tryPlay();
    }
    window.addEventListener('pointerdown', unlockAndPlay, { once: true });
    window.addEventListener('keydown', unlockAndPlay, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAndPlay);
      window.removeEventListener('keydown', unlockAndPlay);
      ctrl.destroy();
      bgmRef.current = null;
    };
  }, [game?.id]);

  const handleToggleBgm = () => {
    const next = !bgmMuted;
    setBgmMuted(next);
    if (bgmRef.current) {
      bgmRef.current.setMuted(next);
    }
  };

  const handleReturnTown = () => {
    window.location.href = '/';
  };

  return (
    <div
      className={`w-full bg-gradient-to-b from-[#FFE4EE] via-[#FFFDF9] to-[#E8F8FF] text-[#593A47] flex flex-col select-none ${
        fullViewport ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh] overflow-y-auto'
      }`}
    >
      {/* Header Kawaii */}
      <header className="sticky top-0 z-30 shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#FFFDF9]/95 backdrop-blur-sm border-b-[3px] border-[#593A47] shadow-[0_4px_0_rgba(89,58,71,0.12)]">
        <div className={`${maxWidthClass} mx-auto flex items-center justify-between gap-2`}>
          <button
            type="button"
            onClick={handleReturnTown}
            className="kawaii-btn px-3 sm:px-4 py-1.5 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>⬅️</span>
            <span>Về Thị Trấn</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {npcSprite && (
              <img
                src={npcSprite}
                alt={game?.npcName}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-[0_2px_2px_rgba(89,58,71,0.2)]"
              />
            )}
            <div className="min-w-0 text-center sm:text-left">
              <h1 className="font-black text-sm sm:text-base text-[#593A47] truncate leading-tight">
                {game?.icon} {game?.title}
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-[#8C6575] truncate">
                {game?.houseName} • {game?.npcName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {statusBadge}
            {headerRight}
            <button
              type="button"
              onClick={handleToggleBgm}
              title={bgmMuted ? 'Bật nhạc nền mini-game' : 'Tắt nhạc nền mini-game'}
              className={`px-2.5 py-1 rounded-full border-2 border-[#593A47] text-[11px] font-black cursor-pointer transition ${
                bgmMuted ? 'bg-[#F1F5F9] text-[#64748B]' : 'bg-[#FFF3B0] text-[#593A47]'
              }`}
            >
              {bgmMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </header>

      {/* Vùng chơi game chính */}
      <main
        className={`flex-1 w-full ${maxWidthClass} mx-auto px-3 sm:px-5 flex flex-col items-center ${
          fullViewport ? 'min-h-0 py-2 sm:py-3 justify-stretch overflow-hidden' : 'py-4 sm:py-6 justify-center'
        }`}
      >
        {children}
      </main>

      {/* Modal tổng kết thắng / thua & trả thưởng */}
      {result && (
        <div className="fixed inset-0 z-50 bg-[#593A47]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="kawaii-card w-full max-w-sm p-6 bg-gradient-to-b from-[#FFFDF9] to-[#FFF4F8] border-[3px] border-[#593A47] shadow-[0_8px_0_#593A47] text-center space-y-4 pop-in">
            <div
              className={`mx-auto w-20 h-20 rounded-3xl border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] flex items-center justify-center text-4xl ${
                result.won ? 'bg-[#FFF3B0] animate-bounce' : 'bg-[#F1F5F9]'
              }`}
            >
              {result.won ? '🏆' : '🌟'}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#593A47]">{result.title}</h2>
              <p className="text-xs sm:text-sm font-bold text-[#7D5867] leading-relaxed">
                {result.summary}
              </p>
            </div>

            {result.won && (result.rewardHearts || result.rewardStars) && (
              <div className="p-3 rounded-2xl bg-[#DFF8EB] border-2 border-[#593A47] flex items-center justify-center gap-4 text-sm font-black text-[#16805D]">
                {result.rewardHearts > 0 && <span>💖 +{result.rewardHearts} Tim</span>}
                {result.rewardStars > 0 && <span>⭐ +{result.rewardStars} Sao</span>}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              {onRestart && (
                <button
                  type="button"
                  onClick={onRestart}
                  className="kawaii-btn flex-1 py-2.5 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-black text-sm cursor-pointer"
                >
                  🔄 Chơi lại
                </button>
              )}
              <button
                type="button"
                onClick={handleReturnTown}
                className="kawaii-btn flex-1 py-2.5 bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-black text-sm cursor-pointer"
              >
                🏡 Về Thị Trấn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
