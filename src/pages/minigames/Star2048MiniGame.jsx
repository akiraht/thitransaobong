import React, { useState, useEffect, useRef, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';

const SIZE = 4;
const GOAL_TILE = 256; // Đạt ô 256 để chiến thắng!

const TILE_STYLES = {
  0: { bg: '#FFF5F8', text: '#593A47', icon: '' },
  2: { bg: '#FEF9C3', text: '#713F12', icon: '✨' },
  4: { bg: '#FDE68A', text: '#78350F', icon: '⭐' },
  8: { bg: '#FDBA74', text: '#7C2D12', icon: '🌙' },
  16: { bg: '#FDA4AF', text: '#881337', icon: '🪐' },
  32: { bg: '#F9A8D4', text: '#831843', icon: '☄️' },
  64: { bg: '#DDD6FE', text: '#4C1D95', icon: '🌌' },
  128: { bg: '#BAE6FD', text: '#0C4A6E', icon: '🌈' },
  256: { bg: '#A7F3D0', text: '#064E3B', icon: '💎' },
  512: { bg: '#FFE066', text: '#593A47', icon: '👑' },
};

function spawnRandomTile(grid) {
  const empties = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (grid[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const next = grid.map((row) => [...row]);
  next[r][c] = Math.random() < 0.85 ? 2 : 4;
  return next;
}

function createInitialGrid() {
  let g = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  g = spawnRandomTile(g);
  g = spawnRandomTile(g);
  return g;
}

function slideLineLeft(line) {
  const nonZero = line.filter((v) => v !== 0);
  const merged = [];
  let gained = 0;
  for (let i = 0; i < nonZero.length; i += 1) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const val = nonZero[i] * 2;
      merged.push(val);
      gained += val;
      i += 1;
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  const changed = merged.some((v, idx) => v !== line[idx]);
  return { line: merged, gained, changed };
}

function moveGrid(grid, dir) {
  let changed = false;
  let totalGained = 0;
  const next = grid.map((row) => [...row]);

  if (dir === 'left' || dir === 'right') {
    for (let r = 0; r < SIZE; r += 1) {
      const row = dir === 'left' ? next[r] : [...next[r]].reverse();
      const res = slideLineLeft(row);
      if (res.changed) changed = true;
      totalGained += res.gained;
      next[r] = dir === 'left' ? res.line : res.line.reverse();
    }
  } else {
    for (let c = 0; c < SIZE; c += 1) {
      const col = [];
      for (let r = 0; r < SIZE; r += 1) col.push(next[r][c]);
      const line = dir === 'up' ? col : [...col].reverse();
      const res = slideLineLeft(line);
      if (res.changed) changed = true;
      totalGained += res.gained;
      const finalCol = dir === 'up' ? res.line : res.line.reverse();
      for (let r = 0; r < SIZE; r += 1) next[r][c] = finalCol[r];
    }
  }

  return { grid: next, gained: totalGained, changed };
}

function hasValidMove(grid) {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (grid[r][c] === 0) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
    }
  }
  return false;
}

function getMaxTile(grid) {
  let max = 0;
  grid.forEach((row) => row.forEach((v) => { if (v > max) max = v; }));
  return max;
}

export default function Star2048MiniGame() {
  const game = getMiniGameById('star2048');
  const [grid, setGrid] = useState(createInitialGrid);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const touchStartRef = useRef(null);

  const handleRestart = useCallback(() => {
    setGrid(createInitialGrid());
    setScore(0);
    setResult(null);
  }, []);

  const handleMove = useCallback((dir) => {
    if (result) return;
    setGrid((prev) => {
      const moved = moveGrid(prev, dir);
      if (!moved.changed) return prev;

      const withNew = spawnRandomTile(moved.grid);
      const nextScore = score + moved.gained;
      setScore(nextScore);

      const maxTile = getMaxTile(withNew);
      if (maxTile >= GOAL_TILE) {
        queueMiniGameReward({
          gameId: game.id,
          gameTitle: game.title,
          hearts: game.rewardHearts,
          stars: game.rewardStars,
        });
        setResult({
          won: true,
          title: `Chạm Đỉnh Ô ${GOAL_TILE} 💎!`,
          summary: `Bạn đã gộp thành công Ngôi Sao Kim Cương ${GOAL_TILE} với tổng ${nextScore} điểm!`,
          rewardHearts: game.rewardHearts,
          rewardStars: game.rewardStars,
        });
      } else if (!hasValidMove(withNew)) {
        setResult({
          won: false,
          title: 'Hết Nước Đi Rồi! 🪐',
          summary: `Ô lớn nhất bạn ghép được là ${maxTile} (${nextScore} điểm). Hãy ghép tới ô ${GOAL_TILE} để thắng nhé!`,
        });
      }

      return withNew;
    });
  }, [result, score, game]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); handleMove('left'); }
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); handleMove('right'); }
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); handleMove('up'); }
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); handleMove('down'); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMove]);

  const handlePointerDown = (e) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.hypot(dx, dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left');
    else handleMove(dy > 0 ? 'down' : 'up');
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      maxWidthClass="max-w-md"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] border-2 border-[#593A47] text-[11px] font-black">
          🪐 {score} điểm • Mục tiêu {GOAL_TILE}
        </span>
      }
    >
      <div className="w-full space-y-3.5">
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="p-3 rounded-3xl bg-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47] touch-none"
        >
          <div className="grid grid-cols-4 gap-2 aspect-square">
            {grid.flat().map((val, idx) => {
              const st = TILE_STYLES[val] || TILE_STYLES[512];
              return (
                <div
                  key={idx}
                  style={{ backgroundColor: st.bg, color: st.text }}
                  className="rounded-2xl border-2 border-[#593A47]/25 flex flex-col items-center justify-center font-black transition-all"
                >
                  {val > 0 && (
                    <>
                      <span className="text-lg sm:text-xl leading-none">{st.icon}</span>
                      <span className="text-base sm:text-lg leading-tight">{val}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút bấm 4 hướng tiện lợi cho cả mobile & PC */}
        <div className="grid grid-cols-3 gap-2 max-w-[230px] mx-auto">
          <div />
          <button
            type="button"
            onClick={() => handleMove('up')}
            className="kawaii-btn py-2 bg-[#FFF3B0] hover:bg-[#FFE066] font-black text-base cursor-pointer"
          >
            ⬆️
          </button>
          <div />
          <button
            type="button"
            onClick={() => handleMove('left')}
            className="kawaii-btn py-2 bg-[#FFF3B0] hover:bg-[#FFE066] font-black text-base cursor-pointer"
          >
            ⬅️
          </button>
          <button
            type="button"
            onClick={() => handleMove('down')}
            className="kawaii-btn py-2 bg-[#FFF3B0] hover:bg-[#FFE066] font-black text-base cursor-pointer"
          >
            ⬇️
          </button>
          <button
            type="button"
            onClick={() => handleMove('right')}
            className="kawaii-btn py-2 bg-[#FFF3B0] hover:bg-[#FFE066] font-black text-base cursor-pointer"
          >
            ➡️
          </button>
        </div>

        <p className="text-center text-xs font-bold text-[#7D5867]">
          Vuốt trực tiếp trên bảng, bấm nút hoặc dùng phím mũi tên / W-A-S-D để ghép tới <strong>{GOAL_TILE} 💎</strong>!
        </p>
      </div>
    </MiniGameShell>
  );
}
