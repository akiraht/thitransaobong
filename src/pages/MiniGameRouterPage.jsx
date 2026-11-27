import React, { Suspense, lazy, useState } from 'react';
import { MINIGAMES_LIST, getMiniGameById } from '../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../data/characterSprites';
import {
  getDailyPlayInfo,
  getStarBalance,
  getStoredBadgeCount,
  isMiniGameUnlocked,
  unlockMiniGameWithStars,
} from '../utils/miniGameEconomy';

// Code-splitting từng Mini-Game độc lập: chỉ tải đúng game đang mở!
const CaroMiniGame = lazy(() => import('./minigames/CaroMiniGame'));
const BakingMiniGame = lazy(() => import('./minigames/BakingMiniGame'));
const PuzzleMiniGame = lazy(() => import('./minigames/PuzzleMiniGame'));
const RacingMiniGame = lazy(() => import('./minigames/RacingMiniGame'));
const DuelMiniGame = lazy(() => import('./minigames/DuelMiniGame'));
const FlappyMiniGame = lazy(() => import('./minigames/FlappyMiniGame'));
const MemoryMiniGame = lazy(() => import('./minigames/MemoryMiniGame'));
const Star2048MiniGame = lazy(() => import('./minigames/Star2048MiniGame'));
const SnowconeMiniGame = lazy(() => import('./minigames/SnowconeMiniGame'));
const FireflyMiniGame = lazy(() => import('./minigames/FireflyMiniGame'));

const GAME_COMPONENTS = {
  caro: CaroMiniGame,
  baking: BakingMiniGame,
  puzzle: PuzzleMiniGame,
  racing: RacingMiniGame,
  duel: DuelMiniGame,
  flappy: FlappyMiniGame,
  memory: MemoryMiniGame,
  star2048: Star2048MiniGame,
  snowcone: SnowconeMiniGame,
  firefly: FireflyMiniGame,
};

function LoadingFallback() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#FFE4EE] via-[#FFFDF9] to-[#E8F8FF] flex flex-col items-center justify-center p-6 text-[#593A47] gap-3">
      <div className="w-16 h-16 rounded-3xl bg-[#FFF3B0] border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] flex items-center justify-center text-3xl animate-bounce">
        🎮
      </div>
      <div className="font-black text-base">Đang mở phòng Mini-Game Kawaii...</div>
    </div>
  );
}

export default function MiniGameRouterPage() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const match = path.match(/^\/minigame\/([a-z0-9_-]+)/i);
  const gameId = match ? match[1].toLowerCase() : '';
  const GameComponent = GAME_COMPONENTS[gameId] || null;
  const gameMeta = getMiniGameById(gameId);

  const [starBalance, setStarBalance] = useState(getStarBalance);
  const [badgeCount] = useState(getStoredBadgeCount);
  const [unlockTick, setUnlockTick] = useState(0);
  const [notice, setNotice] = useState('');

  if (GameComponent && gameMeta) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GameComponent />
      </Suspense>
    );
  }

  const handleQuickUnlock = (e, game) => {
    e.preventDefault();
    e.stopPropagation();
    const res = unlockMiniGameWithStars(game);
    setStarBalance(getStarBalance());
    if (res.ok) {
      setUnlockTick((t) => t + 1);
      setNotice(`🎉 Đã mở khóa "${game.title}" thành công! Bấm vào để chơi ngay nhé!`);
    } else {
      setNotice(res.message || 'Chưa đủ Sao để mở khóa!');
    }
    setTimeout(() => setNotice(''), 3200);
  };

  // Sảnh tổng hợp Mini-Game khi truy cập /minigame
  return (
    <div
      key={unlockTick}
      className="min-h-[100dvh] bg-gradient-to-b from-[#FFE4EE] via-[#FFFDF9] to-[#E8F8FF] text-[#593A47] p-4 sm:p-6 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/"
            className="kawaii-btn px-4 py-2 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-black text-sm inline-flex items-center gap-1.5"
          >
            <span>⬅️</span>
            <span>Về Thị Trấn</span>
          </a>
          <h1 className="font-black text-lg sm:text-xl text-[#593A47]">
            🎮 Sảnh Mini-Game Thị Trấn Sao Bông ({MINIGAMES_LIST.length} Game)
          </h1>
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="px-3 py-1 rounded-full bg-[#FFF3B0] border-2 border-[#593A47]">
              ⭐ {starBalance} Sao
            </span>
            <span className="px-3 py-1 rounded-full bg-[#EFE5FF] border-2 border-[#593A47]">
              🏆 {badgeCount} Huy hiệu
            </span>
          </div>
        </div>

        {notice && (
          <div className="px-4 py-2.5 rounded-2xl bg-[#FFF3B0] border-2 border-[#593A47] text-xs sm:text-sm font-black text-center">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {MINIGAMES_LIST.map((g) => {
            const isUnlocked = isMiniGameUnlocked(g, badgeCount);
            const playInfo = getDailyPlayInfo(g.id);

            return (
              <a
                key={g.id}
                href={`/minigame/${g.id}`}
                style={{ backgroundColor: g.accentBg }}
                className={`kawaii-card p-4 border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] hover:scale-[1.02] transition flex items-start gap-3 ${
                  !isUnlocked ? 'opacity-90' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={CHARACTER_SPRITES[g.npcId]}
                    alt={g.npcName}
                    className={`w-14 h-14 object-contain drop-shadow ${!isUnlocked ? 'grayscale-[55%]' : ''}`}
                  />
                  {!isUnlocked && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#593A47] text-[#FFE066] text-xs flex items-center justify-center border border-[#FFE066]">
                      🔒
                    </span>
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-black text-base text-[#593A47] truncate">
                      {g.icon} {g.title}
                    </div>
                    {isUnlocked ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/90 border border-[#593A47] text-[10px] font-black text-[#0369A1]">
                        🎟️ {playInfo.remainingPlays} lượt
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#593A47] text-[#FFE066] text-[10px] font-black">
                        🔒 Khóa
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-extrabold text-[#D9386A]">
                    {g.genre} • {g.npcName}
                  </div>
                  <p className="text-xs font-bold text-[#7D5867] leading-snug">{g.desc}</p>

                  {isUnlocked ? (
                    <div className="pt-1 flex items-center gap-2 text-[11px] font-black text-[#16805D]">
                      <span>💖 +{g.rewardHearts} Tim</span>
                      <span>⭐ +{g.rewardStars} Sao</span>
                    </div>
                  ) : (
                    <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-[#593A47]">
                        🏆 {g.unlockBadges} Huy hiệu hoặc ⭐ {g.unlockStars} Sao
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleQuickUnlock(e, g)}
                        className="px-2.5 py-1 rounded-xl bg-[#FFE066] hover:bg-[#FFD166] border-2 border-[#593A47] text-[11px] font-black text-[#593A47] cursor-pointer"
                      >
                        ⭐ Mở (-{g.unlockStars})
                      </button>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
