import React, { useState, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';

const BOARD_SIZE = 9;
const WIN_LEN = 5;
const DIRS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

function checkWinner(board) {
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const val = board[r][c];
      if (!val) continue;
      for (const [dr, dc] of DIRS) {
        const line = [[r, c]];
        for (let k = 1; k < WIN_LEN; k += 1) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== val) {
            break;
          }
          line.push([nr, nc]);
        }
        if (line.length === WIN_LEN) {
          return { winner: val, line };
        }
      }
    }
  }
  const hasEmpty = board.some((row) => row.some((cell) => !cell));
  return hasEmpty ? null : { winner: 'draw', line: [] };
}

function scoreCell(board, r, c, player) {
  let total = 0;
  for (const [dr, dc] of DIRS) {
    let count = 1;
    let openEnds = 0;
    for (const sign of [1, -1]) {
      let step = 1;
      while (true) {
        const nr = r + dr * step * sign;
        const nc = c + dc * step * sign;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
        if (board[nr][nc] === player) {
          count += 1;
          step += 1;
        } else {
          if (!board[nr][nc]) openEnds += 1;
          break;
        }
      }
    }
    if (count >= WIN_LEN) total += 100000;
    else if (count === 4 && openEnds === 2) total += 12000;
    else if (count === 4 && openEnds === 1) total += 3500;
    else if (count === 3 && openEnds === 2) total += 1500;
    else if (count === 3 && openEnds === 1) total += 300;
    else if (count === 2 && openEnds === 2) total += 120;
    else if (count === 2 && openEnds === 1) total += 30;
    else total += 5;
  }
  return total;
}

function chooseAiMove(board, difficulty) {
  const candidates = [];
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if (board[r][c]) continue;
      // Chỉ ưu tiên các ô gần quân đã đánh để AI nhanh và tự nhiên
      let near = false;
      for (let dr = -2; dr <= 2 && !near; dr += 1) {
        for (let dc = -2; dc <= 2 && !near; dc += 1) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc]) {
            near = true;
          }
        }
      }
      if (near) {
        const attack = scoreCell(board, r, c, 'O');
        const defend = scoreCell(board, r, c, 'X');
        const centerBonus = 10 - (Math.abs(r - 4) + Math.abs(c - 4));
        const noise = difficulty === 'easy' ? Math.random() * 900 : difficulty === 'medium' ? Math.random() * 140 : 0;
        const score = attack * 1.15 + defend * (difficulty === 'easy' ? 0.65 : 1.05) + centerBonus + noise;
        candidates.push({ r, c, score });
      }
    }
  }
  if (candidates.length === 0) return { r: 4, c: 4 };
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

export default function CaroMiniGame() {
  const game = getMiniGameById('caro');
  const [difficulty, setDifficulty] = useState('medium');
  const [board, setBoard] = useState(createEmptyBoard);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [winLine, setWinLine] = useState([]);
  const [result, setResult] = useState(null);

  const handleRestart = useCallback(() => {
    setBoard(createEmptyBoard());
    setIsAiThinking(false);
    setLastMove(null);
    setWinLine([]);
    setResult(null);
  }, []);

  const handleCellClick = (r, c) => {
    if (board[r][c] || isAiThinking || result) return;

    const nextBoard = board.map((row) => [...row]);
    nextBoard[r][c] = 'X';
    setBoard(nextBoard);
    setLastMove([r, c]);

    const playerCheck = checkWinner(nextBoard);
    if (playerCheck) {
      setWinLine(playerCheck.line);
      if (playerCheck.winner === 'X') {
        queueMiniGameReward({
          gameId: game.id,
          gameTitle: game.title,
          hearts: game.rewardHearts,
          stars: game.rewardStars,
        });
        setResult({
          won: true,
          title: 'Chiến Thắng Tuyệt Vời! ⭐',
          summary: `Bạn đã đánh bại ${game.npcName} với chuỗi 5 ngôi sao liên tiếp!`,
          rewardHearts: game.rewardHearts,
          rewardStars: game.rewardStars,
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
    setTimeout(() => {
      const move = chooseAiMove(nextBoard, difficulty);
      const afterAi = nextBoard.map((row) => [...row]);
      afterAi[move.r][move.c] = 'O';
      setBoard(afterAi);
      setLastMove([move.r, move.c]);
      setIsAiThinking(false);

      const aiCheck = checkWinner(afterAi);
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
    }, 320);
  };

  const winKeySet = new Set(winLine.map(([r, c]) => `${r}-${c}`));

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#FFF3B0] border-2 border-[#593A47] text-[11px] font-black">
          {isAiThinking ? '☁️ Bác Mây đang nghĩ...' : '⭐ Lượt của bạn'}
        </span>
      }
    >
      <div className="w-full max-w-md space-y-3.5">
        {/* Thanh chọn độ khó */}
        <div className="p-3 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-extrabold">
            <span>Bạn: ⭐</span>
            <span className="text-[#8C6575]">vs</span>
            <span>Bác Mây: ☁️</span>
          </div>
          <div className="flex gap-1">
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
                  handleRestart();
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

        {/* Bàn cờ Caro 9x9 Kawaii */}
        <div className="p-2.5 sm:p-3 rounded-3xl bg-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47]">
          <div className="grid grid-cols-9 gap-1">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;
                const isWin = winKeySet.has(`${r}-${c}`);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-base sm:text-xl transition-all cursor-pointer ${
                      isWin
                        ? 'bg-[#FFE066] border-[#593A47] scale-105'
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
        </div>

        <p className="text-center text-xs font-bold text-[#7D5867]">
          Mẹo: Xếp đủ <strong>5 ngôi sao ⭐ liên tiếp</strong> (ngang, dọc hoặc chéo) để chiến thắng!
        </p>
      </div>
    </MiniGameShell>
  );
}
