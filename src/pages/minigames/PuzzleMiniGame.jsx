import React, { useState, useCallback, useRef, useEffect } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';

const PUZZLE_IMAGES = [
  { id: 'hope', name: 'Đồi Hy Vọng', src: '/assets/maps/map_01_hope_hill.webp' },
  { id: 'astro', name: 'Thung Lũng Sao', src: '/assets/maps/map_02_astronomy_valley.webp' },
  { id: 'weather', name: 'Ngõ Thời Tiết', src: '/assets/maps/map_03_weather_lane.webp' },
  { id: 'mischief', name: 'Ngõ Gió Xoáy', src: '/assets/maps/map_04_mischief_alley.webp' },
];

const LEVELS = [
  { id: '3x3', size: 3, label: '3×3 Dễ', rewardHearts: 2, rewardStars: 20, badgeBg: '#DFF8EB' },
  { id: '5x5', size: 5, label: '5×5 Vừa', rewardHearts: 4, rewardStars: 45, badgeBg: '#FFF3B0' },
  { id: '7x7', size: 7, label: '7×7 Khó', rewardHearts: 7, rewardStars: 85, badgeBg: '#FFE4EE' },
];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createInitialState(size) {
  const total = size * size;
  return {
    board: Array(total).fill(null), // board[slotIdx] = pieceId | null
    tray: shuffleArray(Array.from({ length: total }, (_, i) => i)),
  };
}

function getPieceBgStyle(src, pieceId, size) {
  const r = Math.floor(pieceId / size);
  const c = pieceId % size;
  const denom = size - 1;
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: `${size * 100}% ${size * 100}%`,
    backgroundPosition: `${denom > 0 ? (c * 100) / denom : 0}% ${denom > 0 ? (r * 100) / denom : 0}%`,
  };
}

export default function PuzzleMiniGame() {
  const game = getMiniGameById('puzzle');
  const [levelIdx, setLevelIdx] = useState(0);
  const [picIdx, setPicIdx] = useState(0);
  const level = LEVELS[levelIdx];
  const size = level.size;
  const total = size * size;
  const currentPic = PUZZLE_IMAGES[picIdx];

  const [board, setBoard] = useState(() => createInitialState(LEVELS[0].size).board);
  const [tray, setTray] = useState(() => createInitialState(LEVELS[0].size).tray);
  const [moves, setMoves] = useState(0);
  const [showGhost, setShowGhost] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null); // { pieceId, from: 'tray' | 'board', fromSlot?: number }
  const [dragging, setDragging] = useState(null); // { pieceId, from, fromSlot, x, y, sizePx }
  const [hoverSlot, setHoverSlot] = useState(null);
  const [justLockedSlot, setJustLockedSlot] = useState(null);
  const [result, setResult] = useState(null);

  const boardRef = useRef(null);
  const draggingRef = useRef(null);
  draggingRef.current = dragging;

  const solvedCount = board.reduce((acc, pieceId, slotIdx) => acc + (pieceId === slotIdx ? 1 : 0), 0);

  const resetGame = useCallback((nextLevelIdx = levelIdx, nextPicIdx = picIdx) => {
    const nextSize = LEVELS[nextLevelIdx].size;
    const init = createInitialState(nextSize);
    setLevelIdx(nextLevelIdx);
    setPicIdx(nextPicIdx);
    setBoard(init.board);
    setTray(init.tray);
    setMoves(0);
    setSelectedPiece(null);
    setDragging(null);
    setHoverSlot(null);
    setJustLockedSlot(null);
    setResult(null);
  }, [levelIdx, picIdx]);

  const checkVictory = useCallback((nextBoard, nextMoves) => {
    const isComplete = nextBoard.length === total && nextBoard.every((pieceId, idx) => pieceId === idx);
    if (!isComplete) return;
    queueMiniGameReward({
      gameId: game.id,
      gameTitle: `${game.title} (${level.label})`,
      hearts: level.rewardHearts,
      stars: level.rewardStars,
    });
    setResult({
      won: true,
      title: `Hoàn Thiện Tranh ${level.size}×${level.size}! 🧩`,
      summary: `Bạn đã ghép chuẩn xác toàn bộ ${total} mảnh tranh "${currentPic.name}" trong ${nextMoves} lượt đặt!`,
      rewardHearts: level.rewardHearts,
      rewardStars: level.rewardStars,
    });
  }, [game, level, total, currentPic.name]);

  const placePieceAtSlot = useCallback((pieceInfo, targetSlot) => {
    if (result || !pieceInfo) return;
    // Không thể ghi đè lên ô đã khớp đúng & khóa cứng
    if (board[targetSlot] === targetSlot) return;
    if (pieceInfo.from === 'board' && pieceInfo.fromSlot === targetSlot) return;

    const nextBoard = [...board];
    let nextTray = [...tray];
    const displaced = nextBoard[targetSlot]; // null hoặc pieceId sai vị trí

    if (pieceInfo.from === 'tray') {
      nextTray = nextTray.filter((id) => id !== pieceInfo.pieceId);
      if (displaced !== null) nextTray.unshift(displaced);
      nextBoard[targetSlot] = pieceInfo.pieceId;
    } else if (pieceInfo.from === 'board') {
      nextBoard[pieceInfo.fromSlot] = displaced;
      nextBoard[targetSlot] = pieceInfo.pieceId;
    }

    const nextMoves = moves + 1;
    setBoard(nextBoard);
    setTray(nextTray);
    setMoves(nextMoves);
    setSelectedPiece(null);

    if (pieceInfo.pieceId === targetSlot) {
      setJustLockedSlot(targetSlot);
      setTimeout(() => setJustLockedSlot((cur) => (cur === targetSlot ? null : cur)), 420);
    }

    checkVictory(nextBoard, nextMoves);
  }, [board, tray, moves, result, checkVictory]);

  const returnBoardPieceToTray = useCallback((fromSlot) => {
    const pieceId = board[fromSlot];
    if (pieceId === null || pieceId === fromSlot) return;
    const nextBoard = [...board];
    nextBoard[fromSlot] = null;
    setBoard(nextBoard);
    setTray((prev) => [pieceId, ...prev]);
    setSelectedPiece(null);
  }, [board]);

  const getSlotAtClientPoint = useCallback((clientX, clientY) => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
    const col = Math.min(size - 1, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * size)));
    const row = Math.min(size - 1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * size)));
    return row * size + col;
  }, [size]);

  const startDrag = (e, pieceInfo) => {
    if (result) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const boardRect = boardRef.current?.getBoundingClientRect();
    const piecePx = boardRect ? Math.max(44, Math.min(92, boardRect.width / size)) : 64;
    setDragging({
      ...pieceInfo,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      moved: false,
      sizePx: piecePx,
    });
  };

  useEffect(() => {
    if (!dragging) return undefined;

    const handleMove = (e) => {
      const cur = draggingRef.current;
      if (!cur) return;
      const dist = Math.hypot(e.clientX - cur.startX, e.clientY - cur.startY);
      const moved = cur.moved || dist > 5;
      setDragging((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY, moved } : null));
      if (moved) {
        setHoverSlot(getSlotAtClientPoint(e.clientX, e.clientY));
      }
    };

    const handleUp = (e) => {
      const cur = draggingRef.current;
      setDragging(null);
      setHoverSlot(null);
      if (!cur) return;

      if (!cur.moved) {
        // Chạm nhẹ -> chọn mảnh để hỗ trợ tap-to-place trên màn hình nhỏ
        setSelectedPiece((prev) =>
          prev && prev.pieceId === cur.pieceId ? null : { pieceId: cur.pieceId, from: cur.from, fromSlot: cur.fromSlot }
        );
        return;
      }

      const targetSlot = getSlotAtClientPoint(e.clientX, e.clientY);
      if (targetSlot !== null) {
        placePieceAtSlot(cur, targetSlot);
      } else if (cur.from === 'board') {
        returnBoardPieceToTray(cur.fromSlot);
      }
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging !== null, getSlotAtClientPoint, placePieceAtSlot, returnBoardPieceToTray]);

  const handleSlotTap = (slotIdx) => {
    if (result || !selectedPiece) return;
    placePieceAtSlot(selectedPiece, slotIdx);
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={() => resetGame(levelIdx, picIdx)}
      maxWidthClass="max-w-5xl"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#EFE5FF] border-2 border-[#593A47] text-[11px] font-black">
          🧩 {solvedCount}/{total} khớp
        </span>
      }
    >
      <div className="w-full space-y-3">
        {/* Thanh chọn cấp độ + chọn tranh + công cụ hỗ trợ */}
        <div className="p-3 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] flex flex-wrap items-center justify-between gap-2.5">
          {/* 3 cấp độ phần thưởng tăng dần */}
          <div className="flex flex-wrap items-center gap-1.5">
            {LEVELS.map((lv, i) => (
              <button
                key={lv.id}
                type="button"
                onClick={() => resetGame(i, picIdx)}
                style={i === levelIdx ? { backgroundColor: lv.badgeBg } : undefined}
                className={`px-2.5 py-1 rounded-xl border-2 text-xs font-black cursor-pointer transition flex items-center gap-1.5 ${
                  i === levelIdx
                    ? 'border-[#593A47] text-[#593A47] shadow-[0_2px_0_#593A47]'
                    : 'bg-[#FFFDF9] border-[#D8C7B5] text-[#7D5867] hover:border-[#593A47]'
                }`}
              >
                <span>{lv.label}</span>
                <span className="text-[10px] font-extrabold text-[#16805D]">
                  💖{lv.rewardHearts} ⭐{lv.rewardStars}
                </span>
              </button>
            ))}
          </div>

          {/* Chọn tranh & nút gợi ý */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PUZZLE_IMAGES.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => resetGame(levelIdx, i)}
                className={`px-2.5 py-1 rounded-full border-2 text-[11px] font-black cursor-pointer ${
                  i === picIdx
                    ? 'bg-[#FFE066] border-[#593A47] text-[#593A47]'
                    : 'bg-[#FFFDF9] border-[#D8C7B5] text-[#7D5867]'
                }`}
              >
                {img.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowGhost((v) => !v)}
              className={`px-2.5 py-1 rounded-full border-2 text-[11px] font-black cursor-pointer ${
                showGhost ? 'bg-[#FFE4EE] border-[#593A47] text-[#593A47]' : 'bg-white border-[#D8C7B5] text-[#7D5867]'
              }`}
            >
              {showGhost ? '👁️ Nền mờ: Bật' : '🙈 Nền mờ: Tắt'}
            </button>
            <button
              type="button"
              onClick={() => setShowNumbers((v) => !v)}
              className={`px-2.5 py-1 rounded-full border-2 text-[11px] font-black cursor-pointer ${
                showNumbers ? 'bg-[#E8F6FF] border-[#593A47] text-[#593A47]' : 'bg-white border-[#D8C7B5] text-[#7D5867]'
              }`}
            >
              🔢 Số ô
            </button>
          </div>
        </div>

        {/* Khu vực chính: Khung ghép tranh (trái) + Khay mảnh ghép (phải) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-4 items-start">
          {/* Khung ghép tranh N x N */}
          <div className="p-3 rounded-3xl bg-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47]">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-black text-[#593A47]">
                🖼️ Khung Tranh: {currentPic.name} ({size}×{size})
              </span>
              <span className="text-[11px] font-extrabold text-[#7D5867]">
                Lượt đặt: {moves}
              </span>
            </div>

            <div
              ref={boardRef}
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              className="relative grid aspect-square w-full max-w-[520px] mx-auto rounded-2xl overflow-hidden border-[2.5px] border-[#593A47] bg-[#FFF5FA]"
            >
              {/* Ảnh mẫu mờ làm nền hỗ trợ canh mảnh */}
              {showGhost && (
                <img
                  src={currentPic.src}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none"
                />
              )}

              {board.map((pieceId, slotIdx) => {
                const isLocked = pieceId === slotIdx;
                const isHovered = hoverSlot === slotIdx && !isLocked;
                const isBeingDragged = dragging?.from === 'board' && dragging?.fromSlot === slotIdx;
                const isSelected = selectedPiece?.from === 'board' && selectedPiece?.fromSlot === slotIdx;
                const isJustLocked = justLockedSlot === slotIdx;

                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleSlotTap(slotIdx)}
                    onPointerDown={(e) => {
                      if (pieceId !== null && !isLocked) {
                        startDrag(e, { pieceId, from: 'board', fromSlot: slotIdx });
                      }
                    }}
                    className={`relative border border-[#593A47]/20 flex items-center justify-center transition-colors ${
                      isHovered
                        ? 'bg-[#FFE066]/65 ring-2 ring-inset ring-[#593A47]'
                        : isJustLocked
                          ? 'ring-2 ring-inset ring-[#10B981]'
                          : ''
                    } ${pieceId !== null && !isLocked ? 'cursor-grab active:cursor-grabbing touch-none' : ''}`}
                  >
                    {pieceId !== null && !isBeingDragged ? (
                      <div
                        style={getPieceBgStyle(currentPic.src, pieceId, size)}
                        className={`w-full h-full relative select-none ${
                          isLocked
                            ? ''
                            : 'ring-2 ring-inset ring-[#FB7185]/80 brightness-95'
                        } ${isSelected ? 'ring-3 ring-inset ring-[#7C3AED]' : ''}`}
                      >
                        {showNumbers && !isLocked && (
                          <span className="absolute top-0.5 left-0.5 px-1 rounded bg-white/85 text-[9px] font-black text-[#593A47]">
                            {pieceId + 1}
                          </span>
                        )}
                        {isJustLocked && (
                          <span className="absolute inset-0 flex items-center justify-center text-lg bg-[#A8F0CB]/45 animate-ping pointer-events-none">
                            ✨
                          </span>
                        )}
                      </div>
                    ) : (
                      showNumbers && (
                        <span className="text-[10px] font-black text-[#593A47]/40 pointer-events-none">
                          {slotIdx + 1}
                        </span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Khay mảnh ghép chưa đặt */}
          <div className="p-3 rounded-3xl bg-white border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47] space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-[#593A47]">
                🧺 Khay Mảnh Ghép ({tray.length} mảnh còn lại)
              </span>
              <span className="text-[10px] font-bold text-[#D9386A]">
                Kéo thả vào khung!
              </span>
            </div>

            {tray.length === 0 ? (
              <div className="py-10 text-center text-xs font-extrabold text-[#7D5867] bg-[#FFF9FC] rounded-2xl border-2 border-dashed border-[#E5D3DC]">
                {solvedCount === total
                  ? '🎉 Tuyệt vời! Toàn bộ mảnh đã khớp hoàn hảo!'
                  : '✨ Đã đặt hết mảnh lên khung — hãy kéo đổi các mảnh có viền hồng về đúng vị trí nhé!'}
              </div>
            ) : (
              <div
                className={`grid gap-2 max-h-[340px] lg:max-h-[480px] overflow-y-auto p-1.5 rounded-2xl bg-[#FFF9FC] border-2 border-[#E5D3DC] ${
                  size === 3 ? 'grid-cols-3' : size === 5 ? 'grid-cols-5' : 'grid-cols-6 sm:grid-cols-7 lg:grid-cols-5'
                }`}
              >
                {tray.map((pieceId) => {
                  const isBeingDragged = dragging?.from === 'tray' && dragging?.pieceId === pieceId;
                  const isSelected = selectedPiece?.from === 'tray' && selectedPiece?.pieceId === pieceId;
                  return (
                    <div
                      key={pieceId}
                      onPointerDown={(e) => startDrag(e, { pieceId, from: 'tray' })}
                      style={getPieceBgStyle(currentPic.src, pieceId, size)}
                      className={`relative aspect-square rounded-xl border-2 cursor-grab active:cursor-grabbing touch-none select-none transition-transform hover:scale-105 ${
                        isSelected
                          ? 'border-[#7C3AED] ring-2 ring-[#C4B5FD] scale-105'
                          : 'border-[#593A47] shadow-[0_2px_0_#593A47]'
                      } ${isBeingDragged ? 'opacity-25' : ''}`}
                    >
                      {showNumbers && (
                        <span className="absolute top-0.5 left-0.5 px-1 rounded bg-white/90 border border-[#593A47]/40 text-[9px] font-black text-[#593A47]">
                          {pieceId + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-[11px] font-bold text-[#7D5867] leading-snug px-1">
              💡 <strong>Mẹo:</strong> Nhấn giữ và kéo mảnh ghép từ khay thả vào đúng ô trên khung (hoặc chạm chọn mảnh rồi chạm vào ô). Mảnh đặt đúng vị trí sẽ tự động khóa cứng!
            </p>
          </div>
        </div>
      </div>

      {/* Mảnh ghép đang bay theo con trỏ / ngón tay */}
      {dragging && dragging.moved && (
        <div
          style={{
            position: 'fixed',
            left: dragging.x,
            top: dragging.y,
            width: dragging.sizePx,
            height: dragging.sizePx,
            transform: 'translate(-50%, -50%) scale(1.08)',
            pointerEvents: 'none',
            zIndex: 80,
            ...getPieceBgStyle(currentPic.src, dragging.pieceId, size),
          }}
          className="rounded-xl border-[2.5px] border-[#593A47] shadow-[0_10px_20px_rgba(89,58,71,0.35)]"
        />
      )}
    </MiniGameShell>
  );
}
