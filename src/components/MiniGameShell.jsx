import React, { useState, useEffect, useRef } from 'react';
import { CHARACTER_SPRITES } from '../data/characterSprites';
import { createMiniGameBgmController, loadBgmMuted } from '../utils/miniGameAudio';
import {
  getDailyPlayInfo,
  consumeMiniGamePlay,
  purchaseExtraMiniGamePlay,
  getStarBalance,
  getStoredBadgeCount,
  isMiniGameUnlocked,
  unlockMiniGameWithStars,
} from '../utils/miniGameEconomy';

/**
 * KHUNG GIAO DIỆN DÙNG CHUNG CHO MỌI MINI-GAME KAWAII (TÁCH PAGE ĐỘC LẬP)
 * - Tự quản lý nhạc nền riêng từng game (MP3 tùy chỉnh + fallback Web Audio).
 * - Tự quản lý mở khóa (Huy Hiệu hoặc Sao) & lượt chơi mỗi ngày (1 miễn phí + tối đa 3 lần đổi Sao 30->50->70).
 * - Chơi xong (thắng hay thua) đều tự động trừ 1 lượt chơi.
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

  const [starBalance, setStarBalance] = useState(getStarBalance);
  const [badgeCount] = useState(getStoredBadgeCount);
  const [unlocked, setUnlocked] = useState(() => isMiniGameUnlocked(game));
  const [playInfo, setPlayInfo] = useState(() => getDailyPlayInfo(game?.id));
  const [shopMsg, setShopMsg] = useState('');

  // Đánh dấu đã trừ lượt cho ván hiện tại (tránh trừ lặp khi re-render)
  const consumedForResultRef = useRef(false);

  useEffect(() => {
    if (!game?.id) return;
    if (result && !consumedForResultRef.current) {
      consumedForResultRef.current = true;
      const updated = consumeMiniGamePlay(game.id);
      setPlayInfo(updated);
      setStarBalance(getStarBalance());
      setShopMsg('');
    } else if (!result) {
      consumedForResultRef.current = false;
    }
  }, [result, game?.id]);

  useEffect(() => {
    if (!game?.id) return undefined;
    const ctrl = createMiniGameBgmController(game.id);
    bgmRef.current = ctrl;

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

  const handleUnlockByStars = () => {
    const res = unlockMiniGameWithStars(game);
    setStarBalance(getStarBalance());
    if (res.ok) {
      setUnlocked(true);
      setShopMsg('');
    } else {
      setShopMsg(res.message || 'Chưa đủ Sao để mở khóa!');
    }
  };

  const handleBuyExtraPlay = (autoRestart = false) => {
    const res = purchaseExtraMiniGamePlay(game?.id);
    setStarBalance(res.balance);
    setPlayInfo(res.info);
    if (res.ok) {
      setShopMsg('');
      if (autoRestart && typeof onRestart === 'function') {
        onRestart();
      }
    } else {
      setShopMsg(res.message || 'Không thể đổi thêm lượt!');
    }
  };

  const isOutOfPlaysBeforeStart = unlocked && !result && playInfo.remainingPlays <= 0;

  return (
    <div
      className={`w-full bg-gradient-to-b from-[#FFE4EE] via-[#FFFDF9] to-[#E8F8FF] text-[#593A47] flex flex-col select-none ${
        fullViewport ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh] overflow-y-auto'
      }`}
    >
      {/* Header Kawaii */}
      <header className="minigame-header-bar sticky top-0 z-30 shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#FFFDF9]/95 backdrop-blur-sm border-b-[3px] border-[#593A47] shadow-[0_4px_0_rgba(89,58,71,0.12)]">
        <div className={`${maxWidthClass} mx-auto flex items-center justify-between gap-2`}>
          <button
            type="button"
            onClick={handleReturnTown}
            className="kawaii-btn px-3 sm:px-4 py-1.5 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>⬅️</span>
            <span className="hidden xs:inline">Về Thị Trấn</span>
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
            <span
              title="Số lượt chơi còn lại hôm nay"
              className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-[#E8F6FF] border-2 border-[#593A47] text-[11px] font-black"
            >
              🎟️ {playInfo.remainingPlays} lượt
            </span>
            <span
              title="Số Sao Bông hiện có"
              className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-[#FFF3B0] border-2 border-[#593A47] text-[11px] font-black"
            >
              ⭐ {starBalance}
            </span>
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

      {/* Vùng chơi game chính (hoặc cổng mở khóa / cổng hết lượt) */}
      <main
        className={`flex-1 w-full ${maxWidthClass} mx-auto px-3 sm:px-5 flex flex-col items-center ${
          fullViewport && unlocked && !isOutOfPlaysBeforeStart
            ? 'min-h-0 py-2 sm:py-3 justify-stretch overflow-hidden'
            : 'py-4 sm:py-6 justify-center'
        }`}
      >
        {!unlocked ? (
          <div className="kawaii-card w-full max-w-md p-6 bg-white border-[3px] border-[#593A47] shadow-[0_7px_0_#593A47] text-center space-y-4 pop-in">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-[#F3E8FF] border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47] flex items-center justify-center text-4xl">
              🔒
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#593A47]">
                Mở Khóa {game?.icon} {game?.title}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-[#7D5867] leading-relaxed">
                Bạn có thể mở khóa miễn phí khi đạt <strong>{game?.unlockBadges} Huy Hiệu</strong> (hiện có {badgeCount}) hoặc mở khóa sớm bằng Sao Bông!
              </p>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-[#FFF3B0] border-2 border-[#593A47] text-xs font-black">
              ⭐ Số dư hiện tại: {starBalance} Sao Bông
            </div>
            {shopMsg && (
              <div className="px-3 py-2 rounded-xl bg-[#FFE4EE] border-2 border-[#E11D48] text-xs font-extrabold text-[#B91C1C]">
                {shopMsg}
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {game?.unlockStars > 0 && (
                <button
                  type="button"
                  onClick={handleUnlockByStars}
                  className="kawaii-btn w-full py-3 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-black text-sm cursor-pointer"
                >
                  ⭐ Mở Khóa Ngay (-{game.unlockStars} Sao)
                </button>
              )}
              <button
                type="button"
                onClick={handleReturnTown}
                className="kawaii-btn w-full py-2.5 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-black text-sm cursor-pointer"
              >
                🏡 Về Thị Trấn
              </button>
            </div>
          </div>
        ) : isOutOfPlaysBeforeStart ? (
          <div className="kawaii-card w-full max-w-md p-6 bg-white border-[3px] border-[#593A47] shadow-[0_7px_0_#593A47] text-center space-y-4 pop-in">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-[#FFF3B0] border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47] flex items-center justify-center text-4xl">
              🎟️
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#593A47]">Đã Hết Lượt Hôm Nay!</h2>
              <p className="text-xs sm:text-sm font-bold text-[#7D5867] leading-relaxed">
                Mỗi mini-game có <strong>1 lượt miễn phí / ngày</strong> (làm mới lúc 00:00) và tối đa <strong>3 lần đổi thêm lượt bằng Sao</strong> (30 → 50 → 70 ⭐).
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 px-3 py-2 rounded-2xl bg-[#FFFDF2] border-2 border-[#593A47] text-xs font-black">
              <span>⭐ Đang có: {starBalance} Sao</span>
              <span>•</span>
              <span>Đã đổi: {playInfo.purchasesToday}/{playInfo.maxPurchases}</span>
            </div>
            {shopMsg && (
              <div className="px-3 py-2 rounded-xl bg-[#FFE4EE] border-2 border-[#E11D48] text-xs font-extrabold text-[#B91C1C]">
                {shopMsg}
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {playInfo.canBuyMore ? (
                <button
                  type="button"
                  onClick={() => handleBuyExtraPlay(false)}
                  className="kawaii-btn w-full py-3 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-black text-sm cursor-pointer"
                >
                  🎟️ Đổi Thêm 1 Lượt (-{playInfo.nextBuyCost} ⭐ • Lần {playInfo.purchasesToday + 1}/{playInfo.maxPurchases})
                </button>
              ) : (
                <div className="px-3 py-2.5 rounded-2xl bg-[#F1F5F9] border-2 border-[#CBD5E1] text-xs font-black text-[#64748B]">
                  🌙 Bạn đã đổi tối đa 3 lượt hôm nay. Hẹn gặp lại lúc 00:00 ngày mai nhé!
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="/minigame"
                  className="kawaii-btn py-2.5 bg-[#E8F6FF] hover:bg-[#BAE6FD] text-[#593A47] font-black text-sm text-center"
                >
                  🎮 Game Khác
                </a>
                <button
                  type="button"
                  onClick={handleReturnTown}
                  className="kawaii-btn py-2.5 bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-black text-sm cursor-pointer"
                >
                  🏡 Về Thị Trấn
                </button>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Modal tổng kết thắng / thua & trả thưởng + kiểm tra lượt chơi lại */}
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

            <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-[#E5D3DC] text-[11px] font-black text-[#7D5867] flex items-center justify-center gap-3">
              <span>🎟️ Còn {playInfo.remainingPlays} lượt</span>
              <span>•</span>
              <span>⭐ Ví: {starBalance} Sao</span>
            </div>

            {shopMsg && (
              <div className="px-3 py-1.5 rounded-xl bg-[#FFE4EE] border-2 border-[#E11D48] text-[11px] font-extrabold text-[#B91C1C]">
                {shopMsg}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-1">
              {onRestart && playInfo.remainingPlays > 0 && (
                <button
                  type="button"
                  onClick={onRestart}
                  className="kawaii-btn w-full py-2.5 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-black text-sm cursor-pointer"
                >
                  🔄 Chơi lại (Còn {playInfo.remainingPlays} lượt)
                </button>
              )}

              {onRestart && playInfo.remainingPlays <= 0 && playInfo.canBuyMore && (
                <button
                  type="button"
                  onClick={() => handleBuyExtraPlay(true)}
                  className="kawaii-btn w-full py-2.5 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-black text-sm cursor-pointer"
                >
                  🎟️ Đổi Lượt Chơi Tiếp (-{playInfo.nextBuyCost} ⭐ • {playInfo.purchasesToday + 1}/{playInfo.maxPurchases})
                </button>
              )}

              {onRestart && playInfo.remainingPlays <= 0 && !playInfo.canBuyMore && (
                <div className="px-3 py-2 rounded-xl bg-[#F1F5F9] border-2 border-[#CBD5E1] text-[11px] font-black text-[#64748B]">
                  🌙 Đã hết lượt chơi game này hôm nay (làm mới lúc 00:00)
                </div>
              )}

              <button
                type="button"
                onClick={handleReturnTown}
                className="kawaii-btn w-full py-2.5 bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-black text-sm cursor-pointer"
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
