import React, { useState, useEffect, useRef, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../../data/characterSprites';

// 6 nguyên liệu cho mỗi nhóm (18 loại)
const BASES = [
  { id: 'vanilla', name: 'Bông Lan', icon: '🍰', color: '#FDE68A' },
  { id: 'choco', name: 'Socola', icon: '🍫', color: '#B45309' },
  { id: 'matcha', name: 'Trà Xanh', icon: '🍵', color: '#86EFAC' },
  { id: 'velvet', name: 'Red Velvet', icon: '🧁', color: '#FCA5A5' },
  { id: 'lemon', name: 'Chanh Dây', icon: '🍋', color: '#FEF08A' },
  { id: 'taro', name: 'Khoai Môn', icon: '🍠', color: '#DDD6FE' },
];

const CREAMS = [
  { id: 'strawberry', name: 'Kem Dâu', icon: '🍓', color: '#FDA4AF' },
  { id: 'butter', name: 'Kem Bơ', icon: '🧈', color: '#FEF08A' },
  { id: 'blueberry', name: 'Việt Quất', icon: '🫐', color: '#A5B4FC' },
  { id: 'cheese', name: 'Phô Mai', icon: '🧀', color: '#FCD34D' },
  { id: 'mint', name: 'Bạc Hà', icon: '🌿', color: '#99F6E4' },
  { id: 'caramel', name: 'Caramel', icon: '🍯', color: '#FDBA74' },
];

const TOPPINGS = [
  { id: 'star', name: 'Kẹo Sao', icon: '⭐' },
  { id: 'cherry', name: 'Cherry', icon: '🍒' },
  { id: 'ribbon', name: 'Nơ Đường', icon: '🎀' },
  { id: 'cookie', name: 'Bánh Quy', icon: '🍪' },
  { id: 'almond', name: 'Hạnh Nhân', icon: '🥜' },
  { id: 'heart', name: 'Tim Đường', icon: '💖' },
];

const CUSTOMERS_POOL = [
  { npcId: 'star', name: 'Bé Sao Bông' },
  { npcId: 'breeze', name: 'Chú Gió Mát' },
  { npcId: 'rainbow', name: 'Chị Cầu Vồng' },
  { npcId: 'dewdrop', name: 'Bé Sương Mai' },
  { npcId: 'snowflake', name: 'Cô Tuyết Bông' },
  { npcId: 'firefly', name: 'Bé Đom Đóm' },
  { npcId: 'sunset', name: 'Chị Hoàng Hôn' },
  { npcId: 'shooting_star', name: 'Bé Sao Băng' },
];

const TOTAL_GOAL = 5;
const MAX_ANGRY_FAIL = 3; // 3 khách bỏ về -> kết thúc lượt chơi (thất bại)
const MAX_PATIENCE_SEC = 34; // Thời gian chờ của mỗi khách (giây)
const ANGRY_STAR_PENALTY = 50; // Trừ điểm sao khi khách tức giận bỏ đi

function createCustomerOrder(ticketNumber, poolOffset = 0) {
  const customer = CUSTOMERS_POOL[(ticketNumber + poolOffset) % CUSTOMERS_POOL.length];
  return {
    ticketNumber,
    id: `cust_${ticketNumber}_${Math.random().toString(36).slice(2, 6)}`,
    npcId: customer.npcId,
    customerName: customer.name,
    base: BASES[Math.floor(Math.random() * BASES.length)],
    cream: CREAMS[Math.floor(Math.random() * CREAMS.length)],
    topping: TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)],
    patience: 100, // 100% -> 0%
    status: 'waiting', // 'waiting' | 'served' | 'angry'
  };
}

function createInitialQueue(poolOffset) {
  return [
    createCustomerOrder(1, poolOffset),
    createCustomerOrder(2, poolOffset),
    createCustomerOrder(3, poolOffset),
  ];
}

export default function BakingMiniGame() {
  const game = getMiniGameById('baking');
  const poolOffsetRef = useRef(Math.floor(Math.random() * CUSTOMERS_POOL.length));
  const nextTicketRef = useRef(4);
  const handledAngryIdsRef = useRef(new Set());
  const angryCountRef = useRef(0);
  const servedCountRef = useRef(0);

  const [customers, setCustomers] = useState(() => createInitialQueue(poolOffsetRef.current));
  const [activeSlot, setActiveSlot] = useState(0);
  const [servedCount, setServedCount] = useState(0);
  const [angryCount, setAngryCount] = useState(0);

  const [pickedBase, setPickedBase] = useState(null);
  const [pickedCream, setPickedCream] = useState(null);
  const [pickedTopping, setPickedTopping] = useState(null);

  const [stage, setStage] = useState('prep'); // 'prep' | 'bake'
  const [heatPos, setHeatPos] = useState(14);
  const heatDirRef = useRef(1);
  const [feedback, setFeedback] = useState('Chọn nguyên liệu làm bánh cho khách đứng đầu hàng rồi bấm Bắt Đầu Nướng nhé!');
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  const activeCustomer = customers[activeSlot] || customers[0];

  // Đẩy hàng khách tiến lên: bỏ khách đã xong/bỏ đi, dồn các khách sau lên, thêm khách mới vào vị trí số 3
  const advanceQueueAt = useCallback((removedId) => {
    setCustomers((prev) => {
      if (!prev.some((c) => c.id === removedId)) return prev;
      const remaining = prev.filter((c) => c.id !== removedId);
      const nextTicket = nextTicketRef.current++;
      return [...remaining, createCustomerOrder(nextTicket, poolOffsetRef.current)];
    });
    setActiveSlot(0);
  }, []);

  // Thanh nhiệt lò nướng chạy chậm, mượt và dễ canh
  useEffect(() => {
    if (stage !== 'bake' || result) return undefined;
    const timer = setInterval(() => {
      setHeatPos((prev) => {
        let next = prev + heatDirRef.current * 1.45;
        if (next >= 94) {
          next = 94;
          heatDirRef.current = -1;
        } else if (next <= 6) {
          next = 6;
          heatDirRef.current = 1;
        }
        return next;
      });
    }, 35);
    return () => clearInterval(timer);
  }, [stage, result]);

  // Thanh trạng thái chờ (patience) giảm dần theo thời gian
  useEffect(() => {
    if (result) return undefined;
    const tickMs = 200;
    const decayPerTick = (100 / MAX_PATIENCE_SEC) * (tickMs / 1000);

    const timer = setInterval(() => {
      setCustomers((prev) =>
        prev.map((c, idx) => {
          if (c.status !== 'waiting') return c;
          const factor = idx === 0 ? 1 : idx === 1 ? 0.8 : 0.65;
          const nextP = Math.max(0, c.patience - decayPerTick * factor);
          if (nextP <= 0) {
            return { ...c, patience: 0, status: 'angry' };
          }
          return { ...c, patience: nextP };
        })
      );
    }, tickMs);

    return () => clearInterval(timer);
  }, [result]);

  // Xử lý khách hết giờ (tức giận rời hàng ngay, trừ sao, đủ 3 khách bỏ về -> thua!)
  useEffect(() => {
    if (result) return;
    const newlyAngry = customers.filter(
      (c) => c.status === 'angry' && !handledAngryIdsRef.current.has(c.id)
    );
    if (newlyAngry.length === 0) return;

    newlyAngry.forEach((angryCust) => {
      handledAngryIdsRef.current.add(angryCust.id);
      angryCountRef.current += 1;
      const curAngry = angryCountRef.current;

      setAngryCount(curAngry);
      setScore((s) => Math.max(0, s - ANGRY_STAR_PENALTY));
      setFeedback(
        `💢 ${angryCust.customerName} (#${angryCust.ticketNumber}) chờ lâu quá nên tức giận bỏ về! (-${ANGRY_STAR_PENALTY} ⭐ • ${curAngry}/${MAX_ANGRY_FAIL})`
      );

      if (curAngry >= MAX_ANGRY_FAIL) {
        setStage('prep');
        setTimeout(() => {
          setResult({
            won: false,
            title: '3 Vị Khách Đã Tức Giận Bỏ Về! 💢',
            summary: `Quầy bánh phục vụ chưa kịp khiến ${MAX_ANGRY_FAIL} vị khách bỏ đi (bạn đã phục vụ ${servedCountRef.current}/${TOTAL_GOAL} khách). Thử lại nhanh tay hơn nhé!`,
          });
        }, 500);
      } else {
        // Di chuyển ra khỏi hàng ngay sau hiệu ứng trượt 450ms
        setTimeout(() => {
          advanceQueueAt(angryCust.id);
        }, 450);
      }
    });
  }, [customers, result, advanceQueueAt]);

  const handleRestart = useCallback(() => {
    poolOffsetRef.current = Math.floor(Math.random() * CUSTOMERS_POOL.length);
    nextTicketRef.current = 4;
    handledAngryIdsRef.current = new Set();
    angryCountRef.current = 0;
    servedCountRef.current = 0;
    setCustomers(createInitialQueue(poolOffsetRef.current));
    setActiveSlot(0);
    setServedCount(0);
    setAngryCount(0);
    setPickedBase(null);
    setPickedCream(null);
    setPickedTopping(null);
    setStage('prep');
    setHeatPos(14);
    heatDirRef.current = 1;
    setFeedback('Chọn nguyên liệu làm bánh cho khách đứng đầu hàng rồi bấm Bắt Đầu Nướng nhé!');
    setScore(0);
    setResult(null);
  }, []);

  const handleClearPlate = () => {
    if (stage === 'bake') return;
    setPickedBase(null);
    setPickedCream(null);
    setPickedTopping(null);
    setFeedback('🧹 Đã dọn khay bánh! Chọn lại nguyên liệu nhé.');
  };

  // Nút dùng chung 1 vị trí duy nhất: Bắt Đầu Nướng <-> Lấy Bánh & Giao Khách
  const handleOvenMainAction = () => {
    if (result) return;
    if (stage === 'prep') {
      if (!activeCustomer || activeCustomer.status !== 'waiting') return;
      if (!pickedBase || !pickedCream || !pickedTopping) {
        setFeedback('⚠️ Bạn hãy chọn đủ Cốt bánh, Kem phủ và Topping trước khi nướng nhé!');
        return;
      }
      if (
        pickedBase.id !== activeCustomer.base.id ||
        pickedCream.id !== activeCustomer.cream.id ||
        pickedTopping.id !== activeCustomer.topping.id
      ) {
        setFeedback(
          `😅 Bánh chưa khớp với đơn của ${activeCustomer.customerName} (#${activeCustomer.ticketNumber})! Kiểm tra lại bong bóng phía trên nha.`
        );
        return;
      }
      setHeatPos(14);
      heatDirRef.current = 1;
      setStage('bake');
      setFeedback('🔥 Lò đang nướng! Chờ kim trượt vào vùng xanh Vàng Ươm rồi bấm "Lấy Bánh" ngay vị trí đó nhé!');
      return;
    }

    const isPerfect = heatPos >= 33 && heatPos <= 67;
    if (!isPerfect) {
      setFeedback(
        heatPos < 33
          ? '🥶 Bánh hơi chưa chín tới! Canh lại vào vùng xanh Vàng Ươm ở giữa nha.'
          : '🔥 Hơi quá lửa một chút rồi! Thử canh lại vào vùng xanh giữa nhé.'
      );
      return;
    }

    const servedCust = activeCustomer;
    if (!servedCust || servedCust.status !== 'waiting') {
      setStage('prep');
      return;
    }

    const nextScore = score + 100;
    const nextServed = servedCount + 1;
    servedCountRef.current = nextServed;
    setScore(nextScore);
    setServedCount(nextServed);
    setStage('prep');
    setPickedBase(null);
    setPickedCream(null);
    setPickedTopping(null);

    setCustomers((prev) =>
      prev.map((c) => (c.id === servedCust.id ? { ...c, status: 'served' } : c))
    );
    setFeedback(`💖 ${servedCust.customerName} (#${servedCust.ticketNumber}): "Bánh thơm ngon tuyệt vời!" (+100 ⭐)`);

    if (nextServed >= TOTAL_GOAL) {
      const finalStars = Math.max(10, game.rewardStars - angryCountRef.current * 5);
      queueMiniGameReward({
        gameId: game.id,
        gameTitle: game.title,
        hearts: game.rewardHearts,
        stars: finalStars,
      });
      setTimeout(() => {
        setResult({
          won: true,
          title: 'Bếp Trưởng Tiệm Bánh Siêu Hạng! 🧁',
          summary: `Bạn đã phục vụ đủ ${TOTAL_GOAL} vị khách với ${nextScore} điểm${angryCountRef.current > 0 ? ` (${angryCountRef.current} khách bỏ về)` : ' và không để khách nào bỏ về'}!`,
          rewardHearts: game.rewardHearts,
          rewardStars: finalStars,
        });
      }, 450);
    } else {
      setTimeout(() => {
        advanceQueueAt(servedCust.id);
      }, 480);
    }
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      maxWidthClass="max-w-full"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#FFF3B0] border-2 border-[#593A47] text-[11px] font-black">
          🧁 {servedCount}/{TOTAL_GOAL} • 💢 {angryCount}/{MAX_ANGRY_FAIL} • ⭐ {score}
        </span>
      }
    >
      {/* Animation rung nhẹ cảnh báo khi khách còn < 40% thời gian chờ */}
      <style>{`
        @keyframes bakingWarnShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-2.5px) rotate(-0.8deg); }
          75% { transform: translateX(2.5px) rotate(0.8deg); }
        }
        .baking-warn-shake {
          animation: bakingWarnShake 0.42s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full rounded-3xl overflow-hidden border-[3px] border-[#593A47] shadow-[0_7px_0_#593A47] bg-[#FFFDF9]">
        {/* === PHẦN 1: HÀNG CHỜ 3 KHÁCH HÀNG THEO THỨ TỰ XẾP HÀNG (1 -> 2 -> 3) === */}
        <div className="relative bg-gradient-to-b from-[#7DD3FC] via-[#BAE6FD] to-[#FEF3C7] pt-3 pb-2.5 px-3 sm:px-6 overflow-hidden">
          <div
            className="absolute top-0 inset-x-0 h-4 border-b-2 border-[#593A47]/60 opacity-90"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #FF85A9 0px, #FF85A9 22px, #FFFDF9 22px, #FFFDF9 44px)',
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 pb-1.5 text-[11px] font-black text-[#593A47]">
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 border-2 border-[#593A47] shadow-sm">
              🌿 Hàng Chờ Quầy Bánh (Đầu hàng → Cuối hàng)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full border-2 border-[#593A47] shadow-sm ${
                angryCount >= 2 ? 'bg-[#FECACA] text-[#B91C1C]' : 'bg-[#FFE066] text-[#593A47]'
              }`}
            >
              💢 Khách bỏ về: {angryCount}/{MAX_ANGRY_FAIL} (3 khách bỏ về = Thua)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-5 items-end pt-1 max-w-5xl mx-auto">
            {customers.map((cust, idx) => {
              const isSelected = idx === activeSlot;
              const baseOk = isSelected && pickedBase?.id === cust.base.id;
              const creamOk = isSelected && pickedCream?.id === cust.cream.id;
              const topOk = isSelected && pickedTopping?.id === cust.topping.id;
              const isWarning = cust.status === 'waiting' && cust.patience < 40;
              const isLeavingAngry = cust.status === 'angry';
              const isLeavingServed = cust.status === 'served';
              const barColor =
                cust.patience >= 40 ? '#22C55E' : cust.patience >= 20 ? '#F97316' : '#EF4444';

              return (
                <button
                  key={cust.id}
                  type="button"
                  disabled={stage === 'bake' || cust.status !== 'waiting'}
                  onClick={() => {
                    if (stage === 'bake' || cust.status !== 'waiting') return;
                    setActiveSlot(idx);
                    setFeedback(`📋 Đang làm bánh cho ${cust.customerName} (Khách #${cust.ticketNumber})!`);
                  }}
                  className={`relative flex flex-col items-center rounded-2xl p-2 sm:p-2.5 transition-all duration-400 cursor-pointer ${
                    isLeavingAngry
                      ? 'bg-[#FEE2E2] ring-[3px] ring-[#EF4444] -translate-x-10 opacity-0 scale-90 pointer-events-none'
                      : isLeavingServed
                        ? 'bg-[#DFF8EB] ring-[3px] ring-[#10B981] -translate-y-4 opacity-0 scale-95 pointer-events-none'
                        : isWarning
                          ? `bg-[#FFEDD5] ring-[3px] ring-[#F97316] shadow-[0_4px_0_rgba(249,115,22,0.4)] baking-warn-shake ${
                              isSelected ? 'outline outline-2 outline-[#593A47]' : ''
                            }`
                          : isSelected
                            ? 'bg-white/85 ring-[3px] ring-[#FF6B9D] shadow-[0_4px_0_rgba(89,58,71,0.2)]'
                            : 'bg-white/45 hover:bg-white/65 opacity-90'
                  }`}
                >
                  {/* Số thứ tự xếp hàng */}
                  <span
                    className={`absolute -top-2 -left-1.5 px-2 py-0.5 rounded-full text-white text-[10px] font-black shadow ${
                      isWarning ? 'bg-[#EA580C]' : 'bg-[#593A47]'
                    }`}
                  >
                    #{cust.ticketNumber} {idx === 0 ? '• Đầu hàng' : ''}
                  </span>

                  {/* Bong bóng đơn hàng + thanh chờ patience */}
                  <div className="w-full rounded-xl bg-white border-2 border-[#593A47] px-1.5 py-1.5 shadow-sm mb-1.5 mt-1 space-y-1">
                    {cust.status === 'served' ? (
                      <div className="py-1.5 text-center text-xs font-black text-[#16805D]">
                        💖 Cảm ơn bạn!
                      </div>
                    ) : cust.status === 'angry' ? (
                      <div className="py-1.5 text-center text-xs font-black text-[#DC2626]">
                        💢 Bỏ về đây!
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { item: cust.base, ok: baseOk },
                            { item: cust.cream, ok: creamOk },
                            { item: cust.topping, ok: topOk },
                          ].map((part, pIdx) => (
                            <div
                              key={pIdx}
                              className={`relative flex flex-col items-center px-0.5 py-0.5 rounded-lg ${
                                part.ok ? 'bg-[#DFF8EB] ring-1 ring-[#16805D]' : ''
                              }`}
                            >
                              <span className="text-lg sm:text-2xl leading-none">{part.item.icon}</span>
                              <span className="hidden sm:block text-[9px] font-black text-[#593A47] truncate max-w-full mt-0.5">
                                {part.item.name}
                              </span>
                              {part.ok && (
                                <span className="absolute -top-1 -right-1 text-[9px] leading-none">✅</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Thanh trạng thái chờ */}
                        <div className="w-full h-2 rounded-full bg-[#F1F5F9] border border-[#593A47]/60 overflow-hidden">
                          <div
                            style={{ width: `${cust.patience}%`, backgroundColor: barColor }}
                            className={`h-full transition-all duration-200 ${isWarning ? 'animate-pulse' : ''}`}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <img
                      src={CHARACTER_SPRITES[cust.npcId]}
                      alt={cust.customerName}
                      className={`w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_4px_rgba(89,58,71,0.28)] transition-transform ${
                        isSelected ? 'scale-105' : ''
                      }`}
                    />
                    {isWarning && (
                      <span className="absolute -top-1 -right-2 text-base animate-bounce">💦</span>
                    )}
                    {isLeavingAngry && (
                      <span className="absolute -top-1 -right-2 text-lg">💢</span>
                    )}
                  </div>

                  <span
                    className={`mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black border border-[#593A47] truncate max-w-full ${
                      isWarning
                        ? 'bg-[#FDBA74] text-[#593A47]'
                        : isSelected
                          ? 'bg-[#FFE066] text-[#593A47]'
                          : 'bg-white/90 text-[#7D5867]'
                    }`}
                  >
                    {cust.customerName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* === PHẦN 2: KHUNG LÒ NƯỚNG BÌNH MINH GỘP CHUNG BÀN BÀY BÁNH & 1 NÚT HÀNH ĐỘNG DUY NHẤT === */}
        <div className="bg-gradient-to-b from-[#E6B88A] via-[#D9A06B] to-[#C68952] border-t-[3px] border-[#593A47] p-3 sm:p-5 space-y-3.5">
          <div className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border-2 border-[#593A47] text-xs sm:text-sm font-extrabold text-center text-[#593A47] shadow-sm">
            {feedback}
          </div>

          <div className="max-w-3xl mx-auto rounded-3xl bg-[#FFF6EC] border-[3px] border-[#593A47] shadow-[0_5px_0_rgba(89,58,71,0.35)] p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-black text-[#593A47]">
                🔥 Lò Nướng & Bàn Bánh — Khách #{activeCustomer?.ticketNumber} ({activeCustomer?.customerName})
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border border-[#593A47] ${
                    stage === 'bake' ? 'bg-[#FECACA] text-[#B91C1C] animate-pulse' : 'bg-[#BAE6FD] text-[#593A47]'
                  }`}
                >
                  {stage === 'bake' ? '🔥 Đang nướng bánh...' : '🍽️ Đang bày nguyên liệu'}
                </span>
                <button
                  type="button"
                  disabled={stage === 'bake'}
                  onClick={handleClearPlate}
                  className="px-2.5 py-0.5 rounded-lg bg-white border border-[#593A47] text-[11px] font-black text-[#7D5867] hover:bg-[#FFE4EE] cursor-pointer disabled:opacity-40"
                >
                  🧹 Làm lại
                </button>
              </div>
            </div>

            <div
              className={`rounded-2xl border-[2.5px] border-[#593A47] p-3.5 transition-colors space-y-3 ${
                stage === 'bake'
                  ? 'bg-gradient-to-b from-[#FEF08A] via-[#FDE68A] to-[#FDBA74]'
                  : 'bg-gradient-to-b from-[#E0F2FE] to-[#BAE6FD]'
              }`}
            >
              <div className="flex items-center justify-center">
                <div
                  className={`relative w-56 h-24 rounded-full bg-white border-[2.5px] border-[#593A47] shadow-inner flex flex-col items-center justify-center ${
                    stage === 'bake' ? 'animate-bounce' : ''
                  }`}
                >
                  {!pickedBase && !pickedCream && !pickedTopping ? (
                    <span className="text-xs font-extrabold text-[#94A3B8]">
                      Chọn 3 nguyên liệu ở khay dưới...
                    </span>
                  ) : (
                    <div className="flex flex-col items-center -space-y-1.5">
                      <div className="text-2xl z-30 min-h-[26px]">
                        {pickedTopping ? pickedTopping.icon : ''}
                      </div>
                      <div
                        style={pickedCream ? { backgroundColor: pickedCream.color } : undefined}
                        className={`px-3.5 py-0.5 rounded-full border-2 border-[#593A47] text-xs font-black z-20 flex items-center gap-1 ${
                          pickedCream ? '' : 'bg-[#F8FAFC] border-dashed text-[#94A3B8]'
                        }`}
                      >
                        <span>{pickedCream ? pickedCream.icon : '❓'}</span>
                        <span className="text-[10px]">{pickedCream ? pickedCream.name : 'Kem'}</span>
                      </div>
                      <div
                        style={pickedBase ? { backgroundColor: pickedBase.color } : undefined}
                        className={`px-4 py-1 rounded-xl border-2 border-[#593A47] text-xs font-black z-10 flex items-center gap-1 ${
                          pickedBase ? '' : 'bg-[#F8FAFC] border-dashed text-[#94A3B8]'
                        }`}
                      >
                        <span>{pickedBase ? pickedBase.icon : '❓'}</span>
                        <span className="text-[10px]">{pickedBase ? pickedBase.name : 'Cốt bánh'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`space-y-1 transition-opacity ${stage === 'bake' ? 'opacity-100' : 'opacity-45'}`}>
                <div className="relative w-full h-7 rounded-full bg-white border-[2.5px] border-[#593A47] overflow-hidden">
                  <div
                    style={{ left: '33%', width: '34%' }}
                    className="absolute inset-y-0 bg-[#A8F0CB] border-x-2 border-[#16805D] flex items-center justify-center"
                  >
                    <span className="text-[10px] font-black text-[#065F46]">VÀNG ƯƠM</span>
                  </div>
                  <div
                    style={{ left: `calc(${heatPos}% - 6px)` }}
                    className="absolute top-0 bottom-0 w-3 rounded-full bg-[#FF6B9D] border-2 border-[#593A47] shadow"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOvenMainAction}
              className={`kawaii-btn w-full py-3 font-black text-sm sm:text-base cursor-pointer transition ${
                stage === 'bake'
                  ? 'bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47]'
                  : 'bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47]'
              }`}
            >
              {stage === 'bake' ? '✨ Lấy Bánh & Giao Khách Ngay!' : '🔥 Bắt Đầu Nướng Bánh'}
            </button>
          </div>

          {/* === PHẦN 3: 3 KHAY NGUYÊN LIỆU BẾP (6 LOẠI MỖI KHAY = 18 NGUYÊN LIỆU) === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[
              { title: '1. Khay Cốt Bánh (6 loại)', items: BASES, picked: pickedBase, onPick: setPickedBase },
              { title: '2. Khay Kem Phủ (6 loại)', items: CREAMS, picked: pickedCream, onPick: setPickedCream },
              { title: '3. Khay Topping (6 loại)', items: TOPPINGS, picked: pickedTopping, onPick: setPickedTopping },
            ].map((tray) => (
              <div
                key={tray.title}
                className="rounded-2xl bg-[#F8FAFC] border-[2.5px] border-[#593A47] p-2.5 shadow-[inset_0_2px_4px_rgba(89,58,71,0.12)] space-y-2"
              >
                <div className="text-xs font-black text-[#593A47] px-1">{tray.title}</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-1.5">
                  {tray.items.map((item) => {
                    const active = tray.picked?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={stage === 'bake'}
                        onClick={() => tray.onPick(item)}
                        className={`p-2 rounded-xl border-2 text-center transition cursor-pointer disabled:opacity-50 ${
                          active
                            ? 'bg-[#FFE4EE] border-[#593A47] shadow-[0_2px_0_#593A47] scale-[1.04]'
                            : 'bg-white border-[#CBD5E1] hover:border-[#593A47]'
                        }`}
                      >
                        <div className="text-xl sm:text-2xl leading-none">{item.icon}</div>
                        <div className="text-[10px] font-black mt-1 leading-tight text-[#593A47] truncate">
                          {item.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MiniGameShell>
  );
}
