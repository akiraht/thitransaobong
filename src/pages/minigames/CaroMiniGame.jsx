import React, { useState, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';

const MODES = {
  ttt3: {
    id: 'ttt3',
    label: '3×3 Tic-Tac-Toe',
    size: 3,
    winLen: 3,
    rewardHearts: 2,
    rewardStars: 15,
    tip: 'Xếp đủ 3 ngôi sao ⭐ liên tiếp (ngang, dọc hoặc chéo) để thắng!',
  },
  caro16: {
    id: 'caro16',
    label: '16×16 Cờ Caro',
    size: 16,
    winLen: 5,
    rewardHearts: 4,
    rewardStars: 35,
    tip: 'Xếp đủ 5 ngôi sao ⭐ liên tiếp (ngang, dọc hoặc chéo) trên bàn 16×16 để thắng!',
  },
};

const DIRS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

function createEmptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function checkWinner(board, size, winLen) {
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const val = board[r][c];
      if (!val) continue;
      for (const [dr, dc] of DIRS) {
        const line = [[r, c]];
        for (let k = 1; k < winLen; k += 1) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size || board[nr][nc] !== val) {
            break;
          }
          line.push([nr, nc]);
        }
        if (line.length === winLen) {
          return { winner: val, line };
        }
      }
    }
  }
  const hasEmpty = board.some((row) => row.some((cell) => !cell));
  return hasEmpty ? null : { winner: 'draw', line: [] };
}

// --- AI cho Tic-Tac-Toe 3x3 (Minimax) ---
function minimax3(board, isAiTurn, depth) {
  const res = checkWinner(board, 3, 3);
  if (res) {
    if (res.winner === 'O') return 10 - depth;
    if (res.winner === 'X') return depth - 10;
    return 0;
  }
  if (isAiTurn) {
    let best = -Infinity;
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (!board[r][c]) {
          board[r][c] = 'O';
          best = Math.max(best, minimax3(board, false, depth + 1));
          board[r][c] = null;
        }
      }
    }
    return best;
  }
  let best = Infinity;
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (!board[r][c]) {
        board[r][c] = 'X';
        best = Math.min(best, minimax3(board, true, depth + 1));
        board[r][c] = null;
      }
    }
  }
  return best;
}

function chooseAiMove3x3(board, difficulty) {
  const empties = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (!board[r][c]) empties.push({ r, c });
    }
  }
  if (empties.length === 0) return null;

  // Dễ: 70% đi ngẫu nhiên; Vừa: 30% đi ngẫu nhiên; Khó: tối ưu Minimax
  if (
    (difficulty === 'easy' && Math.random() < 0.7) ||
    (difficulty === 'medium' && Math.random() < 0.3)
  ) {
    return empties[Math.floor(Math.random() * empties.length)];
  }

  const copy = board.map((row) => [...row]);
  let bestScore = -Infinity;
  let bestMoves = [];
  for (const { r, c } of empties) {
    copy[r][c] = 'O';
    const sc = minimax3(copy, false, 0);
    copy[r][c] = null;
    if (sc > bestScore) {
      bestScore = sc;
      bestMoves = [{ r, c }];
    } else if (sc === bestScore) {
      bestMoves.push({ r, c });
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

// --- AI cho Cờ Caro 16x16 ---
function scoreCellCaro(board, size, r, c, player) {
  let total = 0;
  for (const [dr, dc] of DIRS) {
    let count = 1;
    let openEnds = 0;
    for (const sign of [1, -1]) {
      let step = 1;
      while (true) {
        const nr = r + dr * step * sign;
        const nc = c + dc * step * sign;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
        if (board[nr][nc] === player) {
          count += 1;
          step += 1;
        } else {
          if (!board[nr][nc]) openEnds += 1;
          break;
        }
      }
    }
    if (count >= 5) total += 200000;
    else if (count === 4 && openEnds === 2) total += 25000;
    else if (count === 4 && openEnds === 1) total += 6000;
    else if (count === 3 && openEnds === 2) total += 2500;
    else if (count === 3 && openEnds === 1) total += 400;
    else if (count === 2 && openEnds === 2) total += 180;
    else if (count === 2 && openEnds === 1) total += 40;
    else total += 5;
  }
  return total;
}

function chooseAiMove16x16(board, difficulty) {
  const size = 16;
  const center = 7.5;
  const candidates = [];

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (board[r][c]) continue;
      let near = false;
      for (let dr = -2; dr <= 2 && !near; dr += 1) {
        for (let dc = -2; dc <= 2 && !near; dc += 1) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc]) {
            near = true;
          }
        }
      }
      if (near) {
        const attack = scoreCellCaro(board, size, r, c, 'O');
        const defend = scoreCellCaro(board, size, r, c, 'X');
        const centerBonus = 16 - (Math.abs(r - center) + Math.abs(c - center));
        const noise =
          difficulty === 'easy' ? Math.random() * 1200 : difficulty === 'medium' ? Math.random() * 180 : 0;
        const score =
          attack * 1.15 + defend * (difficulty === 'easy' ? 0.65 : 1.08) + centerBonus + noise;
        candidates.push({ r, c, score });
      }
    }
  }

  if (candidates.length === 0) return { r: 7, c: 7 };
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

export default function CaroMiniGame() {
  const game = getMiniGameById('caro');
  const [modeId, setModeId] = useState('ttt3'); // 'ttt3' | 'caro16'
  const [difficulty, setDifficulty] = useState('medium');
  const mode = MODES[modeId];

  const [board, setBoard] = useState(() => createEmptyBoard(MODES.ttt3.size));
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [winLine, setWinLine] = useState([]);
  const [result, setResult] = useState(null);

  const handleRestart = useCallback((nextModeId = modeId) => {
    const nextSize = MODES[nextModeId].size;
    setModeId(nextModeId);
    setBoard(createEmptyBoard(nextSize));
    setIsAiThinking(false);
    setLastMove(null);
    setWinLine([]);
    setResult(null);
  }, [modeId]);

  const handleCellClick = (r, c) => {
    if (board[r][c] || isAiThinking || result) return;

    const nextBoard = board.map((row) => [...row]);
    nextBoard[r][c] = 'X';
    setBoard(nextBoard);
    setLastMove([r, c]);

    const playerCheck = checkWinner(nextBoard, mode.size, mode.winLen);
    if (playerCheck) {
      setWinLine(playerCheck.line);
      if (playerCheck.winner === 'X') {
        queueMiniGameReward({
          gameId: game.id,
          gameTitle: `${game.title} (${mode.label})`,
          hearts: mode.rewardHearts,
          stars: mode.rewardStars,
        });
        setResult({
          won: true,
          title: 'Chiến Thắng Tuyệt Vời! ⭐',
          summary: `Bạn đã thắng ${game.npcName} ở chế độ ${mode.label} với chuỗi ${mode.winLen} ngôi sao liên tiếp!`,
          rewardHearts: mode.rewardHearts,
          rewardStars: mode.rewardStars,
        });
      } else {
        setResult({
          won: false,
          title: 'Hòa Nhau Rồi! 🤝',
          summary: 'Trận đấu ngang tài ngang sức! Thử thêm một ván nữa nhé.',
        });
      }
      return;
    }

    setIsAiThinking(true);
    const activeMode = mode;
    setTimeout(() => {
      const move =
        activeMode.size === 3
          ? chooseAiMove3x3(nextBoard, difficulty)
          : chooseAiMove16x16(nextBoard, difficulty);
      if (!move) {
        setIsAiThinking(false);
        return;
      }
      const afterAi = nextBoard.map((row) => [...row]);
      afterAi[move.r][move.c] = 'O';
      setBoard(afterAi);
      setLastMove([move.r, move.c]);
      setIsAiThinking(false);

      const aiCheck = checkWinner(afterAi, activeMode.size, activeMode.winLen);
      if (aiCheck) {
        setWinLine(aiCheck.line);
        if (aiCheck.winner === 'O') {
          setResult({
            won: false,
            title: `${game.npcName} Thắng Rồi! ☁️`,
            summary: 'Bác Mây Xốp cao tay quá! Bấm Chơi lại để phục thù nha.',
          });
        } else {
          setResult({
            won: false,
            title: 'Hòa Nhau Rồi! 🤝',
            summary: 'Trận đấu rất gay cấn! Thử lại ván mới nhé.',
          });
        }
      }
    }, 280);
  };

  const winKeySet = new Set(winLine.map(([r, c]) => `${r}-${c}`));
  const is3x3 = mode.size === 3;

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={() => handleRestart(modeId)}
      maxWidthClass="max-w-4xl"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#FFF3B0] border-2 border-[#593A47] text-[11px] font-black">
          {isAiThinking ? '☁️ Bác Mây đang nghĩ...' : '⭐ Lượt của bạn'}
        </span>
      }
    >
      <div className={`w-full space-y-3.5 ${is3x3 ? 'max-w-md' : 'max-w-2xl'}`}>
        {/* Thanh chuyển chế độ 3x3 / 16x16 và chọn độ khó */}
        <div className="p-3 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] flex flex-wrap items-center justify-between gap-2.5">
          {/* Chế độ bàn cờ */}
          <div className="flex flex-wrap gap-1.5">
            {Object.values(MODES).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleRestart(m.id)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black cursor-pointer transition flex items-center gap-1.5 ${
                  modeId === m.id
                    ? 'bg-[#E8F6FF] border-[#593A47] text-[#593A47] shadow-[0_2px_0_#593A47]'
                    : 'bg-[#FFFDF9] border-[#D8C7B5] text-[#7D5867] hover:border-[#593A47]'
                }`}
              >
                <span>{m.label}</span>
                <span className="text-[10px] text-[#16805D]">
                  💖{m.rewardHearts} ⭐{m.rewardStars}
                </span>
              </button>
            ))}
          </div>

          {/* Độ khó AI */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-[#7D5867] hidden sm:inline">AI:</span>
            {[
              { id: 'easy', label: 'Dễ' },
              { id: 'medium', label: 'Vừa' },
              { id: 'hard', label: 'Khó' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDifficulty(d.id);
                  handleRestart(modeId);
                }}
                className={`px-2.5 py-1 rounded-full border-2 text-[11px] font-black cursor-pointer ${
                  difficulty === d.id
                    ? 'bg-[#FFE066] border-[#593A47] text-[#593A47]'
                    : 'bg-[#FFFDF9] border-[#D8C7B5] text-[#7D5867]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bàn cờ */}
        <div className="p-2.5 sm:p-3.5 rounded-3xl bg-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47]">
          {is3x3 ? (
            <div className="grid grid-cols-3 gap-2.5 max-w-[320px] mx-auto">
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;
                  const isWin = winKeySet.has(`${r}-${c}`);
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => handleCellClick(r, c)}
                      className={`aspect-square rounded-2xl border-[2.5px] flex items-center justify-center text-4xl sm:text-5xl transition-all cursor-pointer ${
                        isWin
                          ? 'bg-[#FFE066] border-[#593A47] scale-105 shadow-[0_4px_0_#593A47]'
                          : isLast
                            ? 'bg-[#FFE4EE] border-[#D9386A]'
                            : 'bg-[#FFF9F2] border-[#E5D3DC] hover:bg-[#FFF3B0]/60'
                      }`}
                    >
                      {cell === 'X' ? '⭐' : cell === 'O' ? '☁️' : ''}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="overflow-x-auto pb-1">
              <div
                style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
                className="grid gap-[2px] min-w-[448px] sm:min-w-0 w-full max-w-[590px] mx-auto bg-[#E5D3DC] p-[2px] rounded-xl border-2 border-[#593A47]"
              >
                {board.map((row, r) =>
                  row.map((cell, c) => {
                    const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;
                    const isWin = winKeySet.has(`${r}-${c}`);
                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleCellClick(r, c)}
                        className={`aspect-square rounded-[4px] flex items-center justify-center text-xs sm:text-sm leading-none transition-colors cursor-pointer ${
                          isWin
                            ? 'bg-[#FFE066] ring-2 ring-[#593A47] z-10'
                            : isLast
                              ? 'bg-[#FFE4EE] ring-1 ring-[#D9386A]'
                              : 'bg-[#FFFDF9] hover:bg-[#FFF3B0]/70'
                        }`}
                      >
                        {cell === 'X' ? '⭐' : cell === 'O' ? '☁️' : ''}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs font-bold text-[#7D5867]">
          Bạn: <strong>⭐</strong> vs Bác Mây: <strong>☁️</strong> — {mode.tip}
        </p>
      </div>
    </MiniGameShell>
  );
}
