import React, { useState, useEffect, useRef, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';

const GOAL_POINTS = 20;
const TIME_LIMIT = 30;
const MAX_HP = 3;

export default function FireflyMiniGame() {
  const game = getMiniGameById('firefly');
  const [slots, setSlots] = useState(() => Array(9).fill(null)); // null | { kind: 'firefly' | 'golden' | 'bat', id }
  const [points, setPoints] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [result, setResult] = useState(null);

  const pointsRef = useRef(0);
  pointsRef.current = points;
  const hpRef = useRef(MAX_HP);
  hpRef.current = hp;
  const idRef = useRef(1);

  const handleRestart = useCallback(() => {
    setSlots(Array(9).fill(null));
    setPoints(0);
    setHp(MAX_HP);
    setTimeLeft(TIME_LIMIT);
    setResult(null);
  }, []);

  // Đếm ngược 30 giây
  useEffect(() => {
    if (result) return undefined;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setResult({
            won: false,
            title: 'Hết Giờ Săn Đom Đóm! 🌙',
            summary: `Bạn ghi được ${pointsRef.current}/${GOAL_POINTS} điểm đom đóm. Thử lại nhanh tay hơn nhé!`,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [result]);

  // Sinh đom đóm ngẫu nhiên ở 9 bụi cỏ đèn lồng
  useEffect(() => {
    if (result) return undefined;
    const spawner = setInterval(() => {
      const next = Array(9).fill(null);
      const count = 2 + (Math.random() < 0.45 ? 1 : 0);
      const picked = new Set();
      while (picked.size < count) {
        picked.add(Math.floor(Math.random() * 9));
      }
      picked.forEach((idx) => {
        const r = Math.random();
        const kind = r < 0.22 ? 'bat' : r < 0.42 ? 'golden' : 'firefly';
        next[idx] = { kind, id: idRef.current++ };
      });
      setSlots(next);
    }, 820);
    return () => clearInterval(spawner);
  }, [result]);

  const handleSlotTap = (idx) => {
    if (result) return;
    const item = slots[idx];
    if (!item) return;

    setSlots((prev) => prev.map((s, i) => (i === idx ? null : s)));

    if (item.kind === 'bat') {
      const nextHp = Math.max(0, hpRef.current - 1);
      hpRef.current = nextHp;
      setHp(nextHp);
      if (nextHp <= 0) {
        setResult({
          won: false,
          title: 'Đánh Thức Dơi Ngủ Gật Rồi! 🦇',
          summary: `Bạn ghi được ${pointsRef.current}/${GOAL_POINTS} điểm. Tránh chạm vào dơi 🦇 và thử lại nhé!`,
        });
      }
      return;
    }

    const add = item.kind === 'golden' ? 3 : 1;
    const nextPoints = pointsRef.current + add;
    pointsRef.current = nextPoints;
    setPoints(nextPoints);

    if (nextPoints >= GOAL_POINTS) {
      queueMiniGameReward({
        gameId: game.id,
        gameTitle: game.title,
        hearts: game.rewardHearts,
        stars: game.rewardStars,
      });
      setResult({
        won: true,
        title: 'Lọ Đom Đóm Rực Sáng! 🏮✨',
        summary: `Bạn đã bắt đủ ${nextPoints} điểm đom đóm thắp sáng khu vườn đêm cùng Bé Đom Đóm!`,
        rewardHearts: game.rewardHearts,
        rewardStars: game.rewardStars,
      });
    }
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      maxWidthClass="max-w-md"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#FEF9C3] border-2 border-[#593A47] text-[11px] font-black">
          ✨ {points}/{GOAL_POINTS} • ⏱️ {timeLeft}s • {'❤️'.repeat(hp)}
        </span>
      }
    >
      <div className="w-full space-y-3.5">
        <div className="px-3 py-2 rounded-2xl bg-[#1E1B4B] text-[#FEF08A] border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] text-xs font-black flex items-center justify-between">
          <span>✨ +1đ • 🌟 +3đ</span>
          <span className="text-[#FDA4AF]">Tránh 🦇 (-1❤️)</span>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-b from-[#1E1B4B] via-[#312E81] to-[#1E3A5F] border-[3px] border-[#593A47] shadow-[0_7px_0_#593A47]">
          <div className="grid grid-cols-3 gap-3 aspect-square">
            {slots.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onPointerDown={() => handleSlotTap(idx)}
                className={`rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-90 ${
                  item
                    ? item.kind === 'bat'
                      ? 'bg-[#4C1D95] border-[#FB7185] shadow-[0_0_16px_rgba(251,113,133,0.5)]'
                      : item.kind === 'golden'
                        ? 'bg-[#FEF08A]/25 border-[#FACC15] shadow-[0_0_18px_rgba(250,204,21,0.75)] scale-105'
                        : 'bg-[#FEF9C3]/20 border-[#FDE047] shadow-[0_0_14px_rgba(253,224,71,0.5)]'
                    : 'bg-white/5 border-white/15'
                }`}
              >
                {item ? (
                  <span className="text-4xl sm:text-5xl animate-bounce select-none">
                    {item.kind === 'bat' ? '🦇' : item.kind === 'golden' ? '🌟' : '✨'}
                  </span>
                ) : (
                  <span className="text-lg opacity-25 select-none">🌿</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MiniGameShell>
  );
}
