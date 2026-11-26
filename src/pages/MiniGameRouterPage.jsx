import React, { Suspense, lazy } from 'react';
import { MINIGAMES_LIST, getMiniGameById } from '../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../data/characterSprites';

// Code-splitting từng Mini-Game độc lập: chỉ tải đúng game đang mở!
const CaroMiniGame = lazy(() => import('./minigames/CaroMiniGame'));
const BakingMiniGame = lazy(() => import('./minigames/BakingMiniGame'));
const PuzzleMiniGame = lazy(() => import('./minigames/PuzzleMiniGame'));
const RacingMiniGame = lazy(() => import('./minigames/RacingMiniGame'));
const DuelMiniGame = lazy(() => import('./minigames/DuelMiniGame'));
const FlappyMiniGame = lazy(() => import('./minigames/FlappyMiniGame'));

const GAME_COMPONENTS = {
  caro: CaroMiniGame,
  baking: BakingMiniGame,
  puzzle: PuzzleMiniGame,
  racing: RacingMiniGame,
  duel: DuelMiniGame,
  flappy: FlappyMiniGame,
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

  if (GameComponent && gameMeta) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GameComponent />
      </Suspense>
    );
  }

  // Sảnh tổng hợp Mini-Game khi truy cập /minigame
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#FFE4EE] via-[#FFFDF9] to-[#E8F8FF] text-[#593A47] p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <a
            href="/"
            className="kawaii-btn px-4 py-2 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-black text-sm inline-flex items-center gap-1.5"
          >
            <span>⬅️</span>
            <span>Về Thị Trấn</span>
          </a>
          <h1 className="font-black text-lg sm:text-xl text-[#593A47]">
            🎮 Sảnh Mini-Game Thị Trấn Sao Bông
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {MINIGAMES_LIST.map((g) => (
            <a
              key={g.id}
              href={`/minigame/${g.id}`}
              style={{ backgroundColor: g.accentBg }}
              className="kawaii-card p-4 border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] hover:scale-[1.02] transition flex items-start gap-3"
            >
              <img
                src={CHARACTER_SPRITES[g.npcId]}
                alt={g.npcName}
                className="w-14 h-14 object-contain shrink-0 drop-shadow"
              />
              <div className="space-y-1 flex-1 min-w-0">
                <div className="font-black text-base text-[#593A47]">
                  {g.icon} {g.title}
                </div>
                <div className="text-[11px] font-extrabold text-[#D9386A]">
                  {g.genre} • {g.npcName}
                </div>
                <p className="text-xs font-bold text-[#7D5867] leading-snug">{g.desc}</p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-black text-[#16805D]">
                  <span>💖 +{g.rewardHearts} Tim</span>
                  <span>⭐ +{g.rewardStars} Sao</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
