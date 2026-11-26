import React, { useState, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';

const PUZZLE_IMAGES = [
  { id: 'hope', name: 'Đỉnh Đồi Hy Vọng', src: '/assets/maps/map_01_hope_hill.webp' },
  { id: 'astro', name: 'Thung Lũng Thiên Văn', src: '/assets/maps/map_02_astronomy_valley.webp' },
  { id: 'weather', name: 'Ngõ Thời Tiết', src: '/assets/maps/map_03_weather_lane.webp' },
];

const SOLVED = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 8 là ô trống

function createShuffledBoard(steps = 36) {
  const arr = [...SOLVED];
  let emptyIdx = 8;
  let lastEmpty = -1;
  for (let i = 0; i < steps; i += 1) {
    const r = Math.floor(emptyIdx / 3);
    const c = emptyIdx % 3;
    const neighbors = [];
    if (r > 0) neighbors.push(emptyIdx - 3);
    if (r < 2) neighbors.push(emptyIdx + 3);
    if (c > 0) neighbors.push(emptyIdx - 1);
    if (c < 2) neighbors.push(emptyIdx + 1);
    const filtered = neighbors.filter((n) => n !== lastEmpty);
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    [arr[emptyIdx], arr[pick]] = [arr[pick], arr[emptyIdx]];
    lastEmpty = emptyIdx;
    emptyIdx = pick;
  }
  return arr;
}

function isSolved(arr) {
  return arr.every((v, idx) => v === idx);
}

export default function PuzzleMiniGame() {
  const game = getMiniGameById('puzzle');
  const [picIdx, setPicIdx] = useState(0);
  const [tiles, setTiles] = useState(() => createShuffledBoard(30));
  const [moves, setMoves] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState(null);

  const currentPic = PUZZLE_IMAGES[picIdx];

  const handleRestart = useCallback((nextPicIdx = picIdx) => {
    setPicIdx(nextPicIdx);
    setTiles(createShuffledBoard(30));
    setMoves(0);
    setShowHint(false);
    setResult(null);
  }, [picIdx]);

  const handleTileClick = (idx) => {
    if (result) return;
    const emptyIdx = tiles.indexOf(8);
    const r1 = Math.floor(idx / 3);
    const c1 = idx % 3;
    const r2 = Math.floor(emptyIdx / 3);
    const c2 = emptyIdx % 3;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;

    const next = [...tiles];
    [next[idx], next[emptyIdx]] = [next[emptyIdx], next[idx]];
    const nextMoves = moves + 1;
    setTiles(next);
    setMoves(nextMoves);

    if (isSolved(next)) {
      queueMiniGameReward({
        gameId: game.id,
        gameTitle: game.title,
        hearts: game.rewardHearts,
        stars: game.rewardStars,
      });
      setResult({
        won: true,
        title: 'Hoàn Thiện Bức Tranh! 🧩',
        summary: `Bạn đã ghép xong bức tranh "${currentPic.name}" chỉ trong ${nextMoves} bước trượt!`,
        rewardHearts: game.rewardHearts,
        rewardStars: game.rewardStars,
      });
    }
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={() => handleRestart(picIdx)}
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#EFE5FF] border-2 border-[#593A47] text-[11px] font-black">
          🧩 {moves} bước
        </span>
      }
    >
      <div className="w-full max-w-md space-y-3.5">
        {/* Chọn bức tranh */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47]">
          <div className="flex flex-wrap gap-1.5">
            {PUZZLE_IMAGES.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => handleRestart(i)}
                className={`px-2.5 py-1 rounded-full border-2 text-[11px] font-black cursor-pointer ${
                  i === picIdx
                    ? 'bg-[#FFE066] border-[#593A47] text-[#593A47]'
                    : 'bg-[#FFFDF9] border-[#D8C7B5] text-[#7D5867]'
                }`}
              >
                {img.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="px-2.5 py-1 rounded-full bg-[#FFE4EE] border-2 border-[#593A47] text-[11px] font-black cursor-pointer"
          >
            {showHint ? '🙈 Ẩn mẫu' : '👁️ Xem mẫu'}
          </button>
        </div>

        {showHint && (
          <div className="p-2 rounded-2xl bg-white border-2 border-[#593A47] flex items-center gap-3">
            <img
              src={currentPic.src}
              alt={currentPic.name}
              className="w-24 h-24 rounded-xl object-cover border-2 border-[#593A47]"
            />
            <div className="text-xs font-bold text-[#7D5867]">
              Chạm vào mảnh cạnh ô trống để trượt ghép thành bức tranh <strong>{currentPic.name}</strong> hoàn chỉnh!
            </div>
          </div>
        )}

        {/* Bảng ghép tranh 3x3 */}
        <div className="p-3 rounded-3xl bg-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47]">
          <div className="grid grid-cols-3 gap-1.5 aspect-square">
            {tiles.map((pieceId, idx) => {
              if (pieceId === 8) {
                return (
                  <div
                    key="empty"
                    className="rounded-2xl bg-[#FFF0F6] border-2 border-dashed border-[#D8B4C8] flex items-center justify-center text-xl opacity-60"
                  >
                    ✨
                  </div>
                );
              }
              const pr = Math.floor(pieceId / 3);
              const pc = pieceId % 3;
              return (
                <button
                  key={pieceId}
                  type="button"
                  onClick={() => handleTileClick(idx)}
                  style={{
                    backgroundImage: `url(${currentPic.src})`,
                    backgroundSize: '300% 300%',
                    backgroundPosition: `${pc * 50}% ${pr * 50}%`,
                  }}
                  className="relative rounded-2xl border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] overflow-hidden cursor-pointer active:scale-95 transition-transform"
                >
                  <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white/85 border border-[#593A47] text-[10px] font-black text-[#593A47] flex items-center justify-center">
                    {pieceId + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </MiniGameShell>
  );
}
