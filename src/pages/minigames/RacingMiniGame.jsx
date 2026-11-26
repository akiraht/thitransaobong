import React, { useState, useEffect, useRef, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../../data/characterSprites';

const GOAL_STARS = 15;
const MAX_HP = 3;

export default function RacingMiniGame() {
  const game = getMiniGameById('racing');
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [stars, setStars] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [items, setItems] = useState([]); // { id, lane, y, kind: 'star' | 'storm' }
  const [isPlaying, setIsPlaying] = useState(true);
  const [result, setResult] = useState(null);

  const laneRef = useRef(1);
  laneRef.current = lane;
  const starsRef = useRef(0);
  starsRef.current = stars;
  const hpRef = useRef(MAX_HP);
  hpRef.current = hp;
  const idCounterRef = useRef(1);

  const handleRestart = useCallback(() => {
    setLane(1);
    setStars(0);
    setHp(MAX_HP);
    setItems([]);
    setIsPlaying(true);
    setResult(null);
  }, []);

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
      setItems((prev) => {
        const moved = [];
        let gotStar = 0;
        let hitStorm = 0;

        for (const it of prev) {
          const ny = it.y + 4.4;
          // Vùng va chạm với Bé Sao Bông (y từ 74 đến 90)
          if (ny >= 74 && ny <= 90 && it.lane === laneRef.current) {
            if (it.kind === 'star') gotStar += 1;
            else hitStorm += 1;
            continue;
          }
          if (ny < 104) moved.push({ ...it, y: ny });
        }

        if (tickCount % 11 === 0) {
          const spawnLane = Math.floor(Math.random() * 3);
          const isStar = Math.random() < 0.56;
          moved.push({
            id: idCounterRef.current++,
            lane: spawnLane,
            y: -8,
            kind: isStar ? 'star' : 'storm',
          });
        }

        if (gotStar > 0) {
          const nextStars = starsRef.current + gotStar;
          setStars(nextStars);
          if (nextStars >= GOAL_STARS) {
            setIsPlaying(false);
            queueMiniGameReward({
              gameId: game.id,
              gameTitle: game.title,
              hearts: game.rewardHearts,
              stars: game.rewardStars,
            });
            setResult({
              won: true,
              title: 'Cán Đích Rực Rỡ! 🏁',
              summary: `Bạn đã lướt ván mây thu thập đủ ${GOAL_STARS} ngôi sao tốc độ!`,
              rewardHearts: game.rewardHearts,
              rewardStars: game.rewardStars,
            });
          }
        }

        if (hitStorm > 0) {
          const nextHp = Math.max(0, hpRef.current - hitStorm);
          setHp(nextHp);
          if (nextHp <= 0) {
            setIsPlaying(false);
            setResult({
              won: false,
              title: 'Ối! Đụng Mây Giông Rồi! ⛈️',
              summary: `Bạn đã thu được ${starsRef.current}/${GOAL_STARS} sao. Thử lại một đường đua mới nhé!`,
            });
          }
        }

        return moved;
      });
    }, 55);

    return () => clearInterval(loop);
  }, [isPlaying, result, game]);

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#DFF8EB] border-2 border-[#593A47] text-[11px] font-black">
          ⭐ {stars}/{GOAL_STARS} • {'❤️'.repeat(hp)}
        </span>
      }
    >
      <div className="w-full max-w-sm space-y-3">
        {/* Đường đua 3 làn mây */}
        <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl bg-gradient-to-b from-[#BAE6FD] via-[#E0F2FE] to-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47] overflow-hidden">
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
              className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl drop-shadow"
            >
              {it.kind === 'star' ? '⭐' : '⛈️'}
            </div>
          ))}

          {/* Bé Sao Bông lướt ván */}
          <div
            style={{
              left: `${lane * 33.33 + 16.66}%`,
              top: '82%',
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100 flex flex-col items-center"
          >
            <img
              src={CHARACTER_SPRITES.user_character}
              alt="Bé Sao Bông"
              className="w-14 h-14 object-contain drop-shadow-[0_4px_4px_rgba(89,58,71,0.3)]"
            />
            <div className="w-12 h-2.5 -mt-1 rounded-full bg-[#FFE066] border-2 border-[#593A47]" />
          </div>
        </div>

        {/* Nút điều khiển cảm ứng trái/phải cho mobile & PC */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLane((l) => Math.max(0, l - 1))}
            className="kawaii-btn py-3 bg-[#FFF3B0] hover:bg-[#FFE066] text-[#593A47] font-black text-base cursor-pointer"
          >
            ⬅️ Sang Trái
          </button>
          <button
            type="button"
            onClick={() => setLane((l) => Math.min(2, l + 1))}
            className="kawaii-btn py-3 bg-[#FFF3B0] hover:bg-[#FFE066] text-[#593A47] font-black text-base cursor-pointer"
          >
            Sang Phải ➡️
          </button>
        </div>
        <p className="text-center text-[11px] font-bold text-[#7D5867]">
          Hỗ trợ chạm nút hoặc phím <strong>← / →</strong> (A / D). Ăn ⭐, né ⛈️!
        </p>
      </div>
    </MiniGameShell>
  );
}
