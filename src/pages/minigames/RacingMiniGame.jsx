import React, { useState, useEffect, useRef, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../../data/characterSprites';

const BEST_SCORE_KEY = 'TTSB_RACING_BEST_V1';
const MAX_HP = 3;
const DAILY_GOAL_STARS = 15;
const DAILY_GOAL_TIER = 2; // x2 & 15 sao

// 10 mốc tốc độ tăng dần đều (x1 -> x10) theo số sao thu thập được
const SPEED_TIERS = [
  { tier: 1, minStars: 0, stepY: 2.35, spawnEvery: 15, label: 'x1' },
  { tier: 2, minStars: 10, stepY: 2.95, spawnEvery: 13, label: 'x2' },
  { tier: 3, minStars: 25, stepY: 3.55, spawnEvery: 12, label: 'x3' },
  { tier: 4, minStars: 45, stepY: 4.15, spawnEvery: 11, label: 'x4' },
  { tier: 5, minStars: 70, stepY: 4.75, spawnEvery: 10, label: 'x5' },
  { tier: 6, minStars: 100, stepY: 5.35, spawnEvery: 9, label: 'x6' },
  { tier: 7, minStars: 135, stepY: 5.95, spawnEvery: 8, label: 'x7' },
  { tier: 8, minStars: 175, stepY: 6.6, spawnEvery: 8, label: 'x8' },
  { tier: 9, minStars: 220, stepY: 7.3, spawnEvery: 7, label: 'x9' },
  { tier: 10, minStars: 270, stepY: 8.1, spawnEvery: 7, label: 'x10' },
];

// Đường dẫn 2 ảnh cảnh vật 2 bên trên PC (bạn chỉ cần thả file vào public/images/minigames/ là tự hiện)
const SIDE_LEFT_IMG = '/images/minigames/racing-side-left.webp';
const SIDE_RIGHT_IMG = '/images/minigames/racing-side-right.webp';

function getTierForStars(stars) {
  let active = SPEED_TIERS[0];
  for (const t of SPEED_TIERS) {
    if (stars >= t.minStars) active = t;
  }
  return active;
}

function getNextTier(tierNum) {
  return SPEED_TIERS.find((t) => t.tier === tierNum + 1) || null;
}

function loadBestScore() {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(val) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(val));
  } catch {
    // ignore
  }
}

function SideSceneryPanel({ src, side, tierLabel }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="hidden lg:flex flex-1 min-w-0 h-full rounded-3xl overflow-hidden border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47] relative bg-gradient-to-b from-[#BAE6FD] via-[#E0F2FE] to-[#DFF8EB]">
      {!imgFailed ? (
        <img
          src={src}
          alt={side === 'left' ? 'Cảnh vật bên trái đường đua' : 'Cảnh vật bên phải đường đua'}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-between p-5 text-center relative overflow-hidden">
          {/* Cảnh vật pastel dự phòng khi chưa thả ảnh tùy chỉnh */}
          <div className="text-4xl opacity-80 select-none">
            {side === 'left' ? '☁️ 🌤️ ☁️' : '☁️ 🌈 ☁️'}
          </div>
          <div className="space-y-2 z-10 bg-white/80 backdrop-blur-xs px-4 py-3 rounded-2xl border-2 border-[#593A47]">
            <div className="text-3xl">{side === 'left' ? '🌲🏡🌬️' : '🌸⛰️✨'}</div>
            <div className="text-xs font-black text-[#593A47]">
              Cảnh vật {side === 'left' ? 'bên trái' : 'bên phải'} ({tierLabel})
            </div>
            <p className="text-[10px] font-bold text-[#7D5867] break-all">
              Thay ảnh tại: <code>public{src}</code>
            </p>
          </div>
          <div className="w-full h-24 rounded-t-[60%] bg-[#A8F0CB] border-t-[3px] border-[#593A47] -mx-5 -mb-5 flex items-center justify-center text-2xl">
            {side === 'left' ? '🌼 🌿 🌷' : '🌷 🌿 🌼'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RacingMiniGame() {
  const game = getMiniGameById('racing');
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [stars, setStars] = useState(0);
  const [bestScore, setBestScore] = useState(loadBestScore);
  const [hp, setHp] = useState(MAX_HP);
  const [items, setItems] = useState([]); // { id, lane, y, kind: 'star' | 'storm' }
  const [isPlaying, setIsPlaying] = useState(true);
  const [hitFlash, setHitFlash] = useState(false);
  const [speedUpBanner, setSpeedUpBanner] = useState('');
  const [result, setResult] = useState(null);

  const laneRef = useRef(1);
  laneRef.current = lane;
  const starsRef = useRef(0);
  starsRef.current = stars;
  const bestRef = useRef(bestScore);
  bestRef.current = bestScore;
  const hpRef = useRef(MAX_HP);
  hpRef.current = hp;
  const tierRef = useRef(1);
  const idCounterRef = useRef(1);

  const currentTier = getTierForStars(stars);
  const nextTier = getNextTier(currentTier.tier);
  const dailyDone = currentTier.tier >= DAILY_GOAL_TIER && stars >= DAILY_GOAL_STARS;

  const handleRestart = useCallback(() => {
    setLane(1);
    setStars(0);
    setHp(MAX_HP);
    setItems([]);
    setHitFlash(false);
    setSpeedUpBanner('');
    tierRef.current = 1;
    setIsPlaying(true);
    setResult(null);
  }, []);

  const moveLeft = useCallback(() => {
    if (!isPlaying) return;
    setLane((l) => Math.max(0, l - 1));
  }, [isPlaying]);

  const moveRight = useCallback(() => {
    if (!isPlaying) return;
    setLane((l) => Math.min(2, l + 1));
  }, [isPlaying]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setLane((l) => Math.max(0, l - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setLane((l) => Math.min(2, l + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || result) return undefined;
    let tickCount = 0;

    const loop = setInterval(() => {
      tickCount += 1;
      const activeTier = getTierForStars(starsRef.current);

      setItems((prev) => {
        const moved = [];
        let gotStar = 0;
        let hitStorm = 0;

        for (const it of prev) {
          const ny = it.y + activeTier.stepY;
          // Vùng va chạm với Bé Sao Bông (y từ 77 đến 91)
          if (ny >= 77 && ny <= 91 && it.lane === laneRef.current) {
            if (it.kind === 'star') gotStar += 1;
            else hitStorm += 1;
            continue;
          }
          if (ny < 104) moved.push({ ...it, y: ny });
        }

        if (tickCount % activeTier.spawnEvery === 0) {
          const spawnLane = Math.floor(Math.random() * 3);
          // Khi tốc độ tăng cao, tỷ lệ mây giông tăng nhẹ để thêm kịch tính
          const starChance = Math.max(0.42, 0.58 - (activeTier.tier - 1) * 0.018);
          const isStar = Math.random() < starChance;
          moved.push({
            id: idCounterRef.current++,
            lane: spawnLane,
            y: -6,
            kind: isStar ? 'star' : 'storm',
          });
        }

        if (gotStar > 0) {
          const nextStars = starsRef.current + gotStar;
          starsRef.current = nextStars;
          setStars(nextStars);

          const nextTierObj = getTierForStars(nextStars);
          if (nextTierObj.tier > tierRef.current) {
            tierRef.current = nextTierObj.tier;
            setSpeedUpBanner(`⚡ TĂNG TỐC ${nextTierObj.label}!`);
            setTimeout(() => setSpeedUpBanner(''), 1400);
          }
        }

        if (hitStorm > 0) {
          const nextHp = Math.max(0, hpRef.current - hitStorm);
          hpRef.current = nextHp;
          setHp(nextHp);
          setHitFlash(true);
          setTimeout(() => setHitFlash(false), 240);

          if (nextHp <= 0) {
            setIsPlaying(false);
            const finalStars = starsRef.current;
            const finalTier = getTierForStars(finalStars);
            let nextBest = bestRef.current;
            if (finalStars > nextBest) {
              nextBest = finalStars;
              setBestScore(nextBest);
              saveBestScore(nextBest);
            }

            const passedDaily = finalTier.tier >= DAILY_GOAL_TIER && finalStars >= DAILY_GOAL_STARS;
            if (passedDaily) {
              const rewardHearts = finalStars >= 100 ? 6 : finalStars >= 45 ? 4 : game.rewardHearts;
              const rewardStars = finalStars >= 100 ? 70 : finalStars >= 45 ? 45 : game.rewardStars;
              queueMiniGameReward({
                gameId: game.id,
                gameTitle: `${game.title} (${finalStars}⭐ • ${finalTier.label})`,
                hearts: rewardHearts,
                stars: rewardStars,
              });
              setResult({
                won: true,
                title: `Hoàn Thành Đường Đua ${finalTier.label}! 🏁`,
                summary: `Bạn đã thu thập ${finalStars} sao (tốc độ tối đa ${finalTier.label}, kỷ lục ${nextBest} sao) và hoàn thành mốc NV Ngày!`,
                rewardHearts,
                rewardStars,
              });
            } else {
              setResult({
                won: false,
                title: 'Hết Tim Rồi! ⛈️',
                summary: `Bạn đạt ${finalStars} sao (${finalTier.label}, kỷ lục ${nextBest} sao). Hãy đạt ít nhất mức x2 & ${DAILY_GOAL_STARS} sao để hoàn thành nhiệm vụ và nhận thưởng nhé!`,
              });
            }
          }
        }

        return moved;
      });
    }, 48);

    return () => clearInterval(loop);
  }, [isPlaying, result, game]);

  const handleTrackPointerDown = (e) => {
    if (!isPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    if (relX < 0.333) setLane(0);
    else if (relX < 0.666) setLane(1);
    else setLane(2);
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      fullViewport
      maxWidthClass="max-w-full"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#DFF8EB] border-2 border-[#593A47] text-[11px] font-black">
          ⭐ {stars} • ⚡{currentTier.label} • {'❤️'.repeat(hp)}
        </span>
      }
    >
      <div className="w-full flex-1 min-h-0 flex items-stretch justify-center gap-4">
        {/* Ảnh cảnh vật bên trái trên PC */}
        <SideSceneryPanel src={SIDE_LEFT_IMG} side="left" tierLabel={currentTier.label} />

        {/* Cột giữa: Đường đua 3 làn + điều khiển */}
        <div className="w-full max-w-md flex-1 min-h-0 flex flex-col gap-2">
          {/* Thanh trạng thái tốc độ & nhiệm vụ ngày */}
          <div className="shrink-0 px-3 py-1.5 rounded-2xl bg-white border-2 border-[#593A47] flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-black">
            <span className={dailyDone ? 'text-[#16805D]' : 'text-[#593A47]'}>
              {dailyDone
                ? '✅ Đạt mốc NV Ngày (x2 & 15⭐)!'
                : `🎯 NV Ngày: x2 & ${Math.min(stars, DAILY_GOAL_STARS)}/${DAILY_GOAL_STARS}⭐`}
            </span>
            <span className="text-[#D9386A]">
              ⚡ {currentTier.label} {nextTier ? `(→ ${nextTier.label} ở ${nextTier.minStars}⭐)` : '(MAX!)'}
            </span>
          </div>

          {/* Đường đua 3 làn mây co giãn toàn bộ chiều cao thiết bị */}
          <div
            onPointerDown={handleTrackPointerDown}
            className={`relative w-full flex-1 min-h-[300px] rounded-3xl bg-gradient-to-b from-[#7DD3FC] via-[#D8F3FF] to-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47] overflow-hidden cursor-pointer touch-none transition-colors ${
              hitFlash ? 'ring-4 ring-[#FB7185]' : ''
            }`}
          >
            {/* Thông tin kỷ lục & tốc độ góc trên */}
            <div className="absolute top-2.5 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 border-2 border-[#593A47] text-[11px] font-black text-[#593A47]">
                ⭐ {stars} sao
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-[11px] font-black text-[#593A47]">
                🏆 Kỷ lục: {bestScore}
              </span>
            </div>

            {/* Banner tăng tốc x2..x10 */}
            {speedUpBanner && (
              <div className="absolute top-14 inset-x-0 z-30 flex justify-center pointer-events-none">
                <span className="px-4 py-1.5 rounded-full bg-[#FF85A9] border-2 border-[#593A47] text-xs font-black text-white shadow animate-bounce">
                  {speedUpBanner}
                </span>
              </div>
            )}

            {/* Vạch kẻ 3 làn */}
            <div className="absolute inset-0 grid grid-cols-3 pointer-events-none">
              <div className="border-r-2 border-dashed border-[#593A47]/20" />
              <div className="border-r-2 border-dashed border-[#593A47]/20" />
              <div />
            </div>

            {/* Vật phẩm rơi xuống */}
            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  left: `${it.lane * 33.33 + 16.66}%`,
                  top: `${it.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl drop-shadow pointer-events-none"
              >
                {it.kind === 'star' ? '⭐' : '⛈️'}
              </div>
            ))}

            {/* Bé Sao Bông lướt trên đám mây bồng bềnh */}
            <div
              style={{
                left: `${lane * 33.33 + 16.66}%`,
                top: '85%',
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100 flex flex-col items-center pointer-events-none"
            >
              <img
                src={CHARACTER_SPRITES.user_character}
                alt="Bé Sao Bông"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_4px_rgba(89,58,71,0.3)] z-10"
              />
              {/* Tấm ván hình dáng đám mây kawaii */}
              <svg
                viewBox="0 0 110 44"
                className="w-20 sm:w-24 h-8 -mt-3 drop-shadow-[0_3px_2px_rgba(89,58,71,0.22)]"
              >
                <path
                  d="M24 36 C12 36 6 29 8 21 C9 14 16 11 23 13 C27 5 39 3 48 9 C55 2 70 3 76 12 C85 9 96 14 98 22 C100 30 93 36 82 36 Z"
                  fill="#FFFFFF"
                  stroke="#593A47"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 30 C35 33 74 33 86 29"
                  fill="none"
                  stroke="#BAE6FD"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Nút điều khiển cảm ứng trái/phải */}
          <div className="racing-controls-bar grid grid-cols-2 gap-3 shrink-0">
            <button
              type="button"
              onClick={moveLeft}
              className="kawaii-btn py-2.5 bg-[#FFF3B0] hover:bg-[#FFE066] text-[#593A47] font-black text-sm sm:text-base cursor-pointer"
            >
              ⬅️ Sang Trái
            </button>
            <button
              type="button"
              onClick={moveRight}
              className="kawaii-btn py-2.5 bg-[#FFF3B0] hover:bg-[#FFE066] text-[#593A47] font-black text-sm sm:text-base cursor-pointer"
            >
              Sang Phải ➡️
            </button>
          </div>
          <p className="racing-helper-tip text-center text-[11px] font-bold text-[#7D5867] shrink-0">
            Chạm làn đường, bấm nút hoặc phím <strong>← / →</strong> (A / D). Chạy vô hạn, ăn ⭐ né ⛈️!
          </p>
        </div>

        {/* Ảnh cảnh vật bên phải trên PC */}
        <SideSceneryPanel src={SIDE_RIGHT_IMG} side="right" tierLabel={currentTier.label} />
      </div>
    </MiniGameShell>
  );
}
