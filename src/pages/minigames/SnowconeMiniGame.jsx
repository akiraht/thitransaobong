import React, { useState, useEffect, useRef, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../../data/characterSprites';

const GOAL_SCOOPS = 20;
const MAX_HP = 3;
const SCOOP_ICONS = ['🍓', '🫐', '🍦', '🍨', '🍧'];

export default function SnowconeMiniGame() {
  const game = getMiniGameById('snowcone');
  const [catcherX, setCatcherX] = useState(50); // % (10..90)
  const [scoops, setScoops] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [items, setItems] = useState([]); // { id, x, y, speed, icon, isBomb }
  const [hitFlash, setHitFlash] = useState(false);
  const [result, setResult] = useState(null);

  const arenaRef = useRef(null);
  const catcherXRef = useRef(50);
  catcherXRef.current = catcherX;
  const scoopsRef = useRef(0);
  scoopsRef.current = scoops;
  const hpRef = useRef(MAX_HP);
  hpRef.current = hp;
  const idRef = useRef(1);

  const handleRestart = useCallback(() => {
    setCatcherX(50);
    setScoops(0);
    setHp(MAX_HP);
    setItems([]);
    setHitFlash(false);
    setResult(null);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (result) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCatcherX((x) => Math.max(10, x - 9));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCatcherX((x) => Math.min(90, x + 9));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [result]);

  useEffect(() => {
    if (result) return undefined;
    let tick = 0;

    const loop = setInterval(() => {
      tick += 1;
      setItems((prev) => {
        const next = [];
        let gotScoop = 0;
        let hitBomb = 0;

        for (const it of prev) {
          const ny = it.y + it.speed;
          if (ny >= 78 && ny <= 91 && Math.abs(it.x - catcherXRef.current) <= 12) {
            if (it.isBomb) hitBomb += 1;
            else gotScoop += 1;
            continue;
          }
          if (ny < 103) next.push({ ...it, y: ny });
        }

        if (tick % 11 === 0) {
          const isBomb = Math.random() < 0.27;
          next.push({
            id: idRef.current++,
            x: 10 + Math.random() * 80,
            y: -6,
            speed: 2.7 + Math.random() * 1.5,
            isBomb,
            icon: isBomb ? '💣' : SCOOP_ICONS[Math.floor(Math.random() * SCOOP_ICONS.length)],
          });
        }

        if (gotScoop > 0) {
          const nextScoops = scoopsRef.current + gotScoop;
          scoopsRef.current = nextScoops;
          setScoops(nextScoops);
          if (nextScoops >= GOAL_SCOOPS) {
            queueMiniGameReward({
              gameId: game.id,
              gameTitle: game.title,
              hearts: game.rewardHearts,
              stars: game.rewardStars,
            });
            setResult({
              won: true,
              title: 'Tháp Kem Tuyết Khổng Lồ! 🍧🏆',
              summary: `Bạn đã hứng trọn vẹn ${GOAL_SCOOPS} viên kem tuyết mát lạnh cùng Cô Tuyết Bông!`,
              rewardHearts: game.rewardHearts,
              rewardStars: game.rewardStars,
            });
          }
        }

        if (hitBomb > 0) {
          const nextHp = Math.max(0, hpRef.current - hitBomb);
          hpRef.current = nextHp;
          setHp(nextHp);
          setHitFlash(true);
          setTimeout(() => setHitFlash(false), 240);
          if (nextHp <= 0) {
            setResult({
              won: false,
              title: 'Ối! Hứng Trúng Bom Băng! 💣',
              summary: `Bạn đã hứng được ${scoopsRef.current}/${GOAL_SCOOPS} viên kem. Né bom băng và thử lại nhé!`,
            });
          }
        }

        return next;
      });
    }, 45);

    return () => clearInterval(loop);
  }, [result, game]);

  const moveCatcherToPointer = (clientX) => {
    const el = arenaRef.current;
    if (!el || result) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setCatcherX(Math.max(10, Math.min(90, pct)));
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      fullViewport
      maxWidthClass="max-w-xl"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#EBF8FF] border-2 border-[#593A47] text-[11px] font-black">
          🍧 {scoops}/{GOAL_SCOOPS} • {'❤️'.repeat(hp)}
        </span>
      }
    >
      <div className="w-full flex-1 min-h-0 flex flex-col gap-2">
        <div
          ref={arenaRef}
          onPointerDown={(e) => moveCatcherToPointer(e.clientX)}
          onPointerMove={(e) => {
            if (e.buttons > 0 || e.pointerType === 'touch') {
              moveCatcherToPointer(e.clientX);
            }
          }}
          className={`relative flex-1 min-h-[340px] w-full rounded-3xl bg-gradient-to-b from-[#93C5FD] via-[#E0F2FE] to-[#FFFFFF] border-[3px] border-[#593A47] shadow-[0_7px_0_#593A47] overflow-hidden cursor-ew-resize touch-none ${
            hitFlash ? 'ring-4 ring-[#FB7185]' : ''
          }`}
        >
          {/* Thanh tiến độ */}
          <div className="absolute top-3 inset-x-4 z-20 flex items-center gap-2 pointer-events-none">
            <div className="flex-1 h-3 rounded-full bg-white border-2 border-[#593A47] overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (scoops / GOAL_SCOOPS) * 100)}%` }}
                className="h-full bg-gradient-to-r from-[#FF85A9] to-[#FFE066] transition-all"
              />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#593A47] text-[11px] font-black">
              🍧 {scoops}/{GOAL_SCOOPS}
            </span>
          </div>

          {items.map((it) => (
            <div
              key={it.id}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl drop-shadow pointer-events-none"
            >
              {it.icon}
            </div>
          ))}

          {/* Cô Tuyết Bông cầm ly kem hứng quà */}
          <div
            style={{ left: `${catcherX}%`, top: '86%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          >
            <div className="px-3 py-1 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-lg shadow -mb-2 z-10">
              🧇
            </div>
            <img
              src={CHARACTER_SPRITES.snowflake}
              alt="Cô Tuyết Bông"
              className="w-16 h-16 object-contain drop-shadow"
            />
          </div>
        </div>

        <p className="text-center text-[11px] font-bold text-[#7D5867] shrink-0">
          Kéo ngang bằng ngón tay / chuột hoặc phím <strong>← / →</strong> để hứng 🍧 và né 💣!
        </p>
      </div>
    </MiniGameShell>
  );
}
