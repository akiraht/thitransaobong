import React, { useState, useEffect, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../../data/characterSprites';

const CARD_CHARACTERS = [
  { id: 'star', name: 'Bé Sao Bông' },
  { id: 'moon', name: 'Chú Trăng' },
  { id: 'sun', name: 'Cô Nắng Mai' },
  { id: 'rainbow', name: 'Chị Cầu Vồng' },
  { id: 'aurora', name: 'Bà Cực Quang' },
  { id: 'snowflake', name: 'Cô Tuyết' },
  { id: 'firefly', name: 'Bé Đom Đóm' },
  { id: 'breeze', name: 'Chú Gió Mát' },
];

const TIME_LIMIT_SEC = 65;

function createShuffledDeck() {
  const doubled = [...CARD_CHARACTERS, ...CARD_CHARACTERS].map((char, idx) => ({
    uid: `${char.id}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    charId: char.id,
    name: char.name,
  }));
  for (let i = doubled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled;
}

export default function MemoryMiniGame() {
  const game = getMiniGameById('memory');
  const [cards, setCards] = useState(createShuffledDeck);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SEC);
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState(null);

  const handleRestart = useCallback(() => {
    setCards(createShuffledDeck());
    setFlippedIndices([]);
    setMatchedIds(new Set());
    setMoves(0);
    setTimeLeft(TIME_LIMIT_SEC);
    setIsBusy(false);
    setResult(null);
  }, []);

  useEffect(() => {
    if (result) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setResult({
            won: false,
            title: 'Hết Thời Gian Rồi! ⏳',
            summary: `Bạn đã ghép được ${matchedIds.size}/8 cặp thẻ cư dân. Thử lại nhanh tay hơn nhé!`,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result, matchedIds.size]);

  const handleCardClick = (idx) => {
    if (result || isBusy) return;
    const card = cards[idx];
    if (matchedIds.has(card.charId) || flippedIndices.includes(idx)) return;

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const [i1, i2] = nextFlipped;

      if (cards[i1].charId === cards[i2].charId) {
        const nextMatched = new Set(matchedIds);
        nextMatched.add(cards[i1].charId);
        setMatchedIds(nextMatched);
        setFlippedIndices([]);

        if (nextMatched.size === CARD_CHARACTERS.length) {
          queueMiniGameReward({
            gameId: game.id,
            gameTitle: game.title,
            hearts: game.rewardHearts,
            stars: game.rewardStars,
          });
          setResult({
            won: true,
            title: 'Trí Nhớ Siêu Phàm! 🃏✨',
            summary: `Bạn đã ghép đủ 8/8 cặp thẻ cư dân chỉ trong ${nextMoves} lượt lật (còn dư ${timeLeft} giây)!`,
            rewardHearts: game.rewardHearts,
            rewardStars: game.rewardStars,
          });
        }
      } else {
        setIsBusy(true);
        setTimeout(() => {
          setFlippedIndices([]);
          setIsBusy(false);
        }, 620);
      }
    }
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      maxWidthClass="max-w-xl"
      statusBadge={
        <span
          className={`px-2.5 py-1 rounded-full border-2 border-[#593A47] text-[11px] font-black ${
            timeLeft <= 15 ? 'bg-[#FECACA] text-[#B91C1C] animate-pulse' : 'bg-[#F3E8FF] text-[#593A47]'
          }`}
        >
          ⏱️ {timeLeft}s • 🃏 {matchedIds.size}/8
        </span>
      }
    >
      <div className="w-full max-w-md space-y-3.5">
        <div className="px-3.5 py-2 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] flex items-center justify-between text-xs font-black">
          <span>🌌 Ghép đủ 8 cặp thẻ cư dân</span>
          <span className="text-[#7C3AED]">Số lượt lật: {moves}</span>
        </div>

        <div className="p-3 rounded-3xl bg-gradient-to-b from-[#FAF5FF] to-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47]">
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {cards.map((card, idx) => {
              const isMatched = matchedIds.has(card.charId);
              const isRevealed = isMatched || flippedIndices.includes(idx);

              return (
                <button
                  key={card.uid}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-square rounded-2xl border-[2.5px] flex flex-col items-center justify-center p-1.5 transition-all duration-200 cursor-pointer ${
                    isMatched
                      ? 'bg-[#DFF8EB] border-[#16805D] scale-[0.97]'
                      : isRevealed
                        ? 'bg-[#FFFDF9] border-[#593A47] shadow-[0_3px_0_#593A47]'
                        : 'bg-gradient-to-br from-[#C4B5FD] to-[#F9A8D4] border-[#593A47] shadow-[0_4px_0_#593A47] hover:scale-[1.03]'
                  }`}
                >
                  {isRevealed ? (
                    <>
                      <img
                        src={CHARACTER_SPRITES[card.charId]}
                        alt={card.name}
                        className="w-11 h-11 sm:w-14 sm:h-14 object-contain drop-shadow"
                      />
                      <span className="text-[9px] font-black text-[#593A47] truncate max-w-full">
                        {card.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl drop-shadow">🌌</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </MiniGameShell>
  );
}
