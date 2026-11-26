import React, { useState, useEffect, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';

const BASES = [
  { id: 'vanilla', name: 'Bánh Bông Lan', icon: '🍰' },
  { id: 'choco', name: 'Bánh Socola', icon: '🍫' },
  { id: 'matcha', name: 'Bánh Trà Xanh', icon: '🍵' },
];

const CREAMS = [
  { id: 'strawberry', name: 'Kem Dâu', icon: '🍓' },
  { id: 'butter', name: 'Kem Bơ Vàng', icon: '🧈' },
  { id: 'blueberry', name: 'Kem Việt Quất', icon: '🫐' },
];

const TOPPINGS = [
  { id: 'star', name: 'Kẹo Ngôi Sao', icon: '⭐' },
  { id: 'cherry', name: 'Quả Cherry', icon: '🍒' },
  { id: 'ribbon', name: 'Nơ Đường Ngọt', icon: '🎀' },
];

function createOrder(idx) {
  return {
    id: idx + 1,
    customer: ['Bé Sao Bông', 'Chú Gió Mát', 'Chị Cầu Vồng'][idx % 3],
    base: BASES[Math.floor(Math.random() * BASES.length)],
    cream: CREAMS[Math.floor(Math.random() * CREAMS.length)],
    topping: TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)],
  };
}

export default function BakingMiniGame() {
  const game = getMiniGameById('baking');
  const TOTAL_ORDERS = 3;
  const [orderIdx, setOrderIdx] = useState(0);
  const [order, setOrder] = useState(() => createOrder(0));
  const [pickedBase, setPickedBase] = useState(null);
  const [pickedCream, setPickedCream] = useState(null);
  const [pickedTopping, setPickedTopping] = useState(null);
  const [stage, setStage] = useState('mix'); // 'mix' | 'bake'
  const [heatPos, setHeatPos] = useState(10);
  const [heatDir, setHeatDir] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (stage !== 'bake' || result) return undefined;
    const timer = setInterval(() => {
      setHeatPos((prev) => {
        const next = prev + heatDir * 4.5;
        if (next >= 96) {
          setHeatDir(-1);
          return 96;
        }
        if (next <= 4) {
          setHeatDir(1);
          return 4;
        }
        return next;
      });
    }, 35);
    return () => clearInterval(timer);
  }, [stage, heatDir, result]);

  const handleRestart = useCallback(() => {
    setOrderIdx(0);
    setOrder(createOrder(0));
    setPickedBase(null);
    setPickedCream(null);
    setPickedTopping(null);
    setStage('mix');
    setHeatPos(10);
    setHeatDir(1);
    setFeedback('');
    setScore(0);
    setResult(null);
  }, []);

  const handleConfirmIngredients = () => {
    if (!pickedBase || !pickedCream || !pickedTopping) {
      setFeedback('⚠️ Bạn hãy chọn đủ Cốt bánh, Kem phủ và Topping trước nhé!');
      return;
    }
    if (
      pickedBase.id !== order.base.id ||
      pickedCream.id !== order.cream.id ||
      pickedTopping.id !== order.topping.id
    ) {
      setFeedback('😅 Nguyên liệu chưa khớp đơn hàng của khách! Kiểm tra lại đơn phía trên nha.');
      return;
    }
    setFeedback('🔥 Đúng nguyên liệu rồi! Bấm "Lấy Bánh Ra Lò" khi kim vào vùng Vàng Ươm nhé!');
    setStage('bake');
  };

  const handleStopOven = () => {
    const isPerfect = heatPos >= 36 && heatPos <= 64;
    if (!isPerfect) {
      setFeedback(
        heatPos < 36
          ? '🥶 Bánh hơi chưa chín tới, thử canh lại vào vùng Vàng Ươm ở giữa nhé!'
          : '🔥 Hơi quá lửa một chút rồi! Thử canh lại vào vùng giữa nha!'
      );
      return;
    }

    const nextScore = score + 100;
    setScore(nextScore);

    if (orderIdx + 1 >= TOTAL_ORDERS) {
      queueMiniGameReward({
        gameId: game.id,
        gameTitle: game.title,
        hearts: game.rewardHearts,
        stars: game.rewardStars,
      });
      setResult({
        won: true,
        title: 'Thợ Làm Bánh Siêu Hạng! 🧁',
        summary: `Bạn đã nướng hoàn hảo đủ ${TOTAL_ORDERS}/${TOTAL_ORDERS} đơn bánh thơm lừng cho cư dân thị trấn!`,
        rewardHearts: game.rewardHearts,
        rewardStars: game.rewardStars,
      });
    } else {
      const nextIdx = orderIdx + 1;
      setOrderIdx(nextIdx);
      setOrder(createOrder(nextIdx));
      setPickedBase(null);
      setPickedCream(null);
      setPickedTopping(null);
      setStage('mix');
      setFeedback(`✨ Tuyệt vời! Bánh của ${order.customer} thơm phức! Tiếp tục đơn #${nextIdx + 1} nhé!`);
    }
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#FFF3B0] border-2 border-[#593A47] text-[11px] font-black">
          🧁 Đơn {orderIdx + 1}/{TOTAL_ORDERS}
        </span>
      }
    >
      <div className="w-full max-w-md space-y-4">
        {/* Phiếu đơn đặt hàng */}
        <div className="p-4 rounded-3xl bg-[#FFFDF2] border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-[#D9386A]">
            <span>📋 ĐƠN HÀNG #{order.id} — {order.customer}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFE066] border border-[#593A47] text-[#593A47]">
              Điểm: {score}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-2xl bg-white border-2 border-[#593A47]">
              <div className="text-2xl">{order.base.icon}</div>
              <div className="text-[10px] font-black mt-0.5">{order.base.name}</div>
            </div>
            <div className="p-2 rounded-2xl bg-white border-2 border-[#593A47]">
              <div className="text-2xl">{order.cream.icon}</div>
              <div className="text-[10px] font-black mt-0.5">{order.cream.name}</div>
            </div>
            <div className="p-2 rounded-2xl bg-white border-2 border-[#593A47]">
              <div className="text-2xl">{order.topping.icon}</div>
              <div className="text-[10px] font-black mt-0.5">{order.topping.name}</div>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="px-3.5 py-2 rounded-2xl bg-white border-2 border-[#593A47] text-xs font-extrabold text-center text-[#593A47]">
            {feedback}
          </div>
        )}

        {stage === 'mix' ? (
          <div className="p-4 rounded-3xl bg-white border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] space-y-3.5">
            {[
              { label: '1. Chọn Cốt Bánh:', items: BASES, picked: pickedBase, onPick: setPickedBase },
              { label: '2. Chọn Kem Phủ:', items: CREAMS, picked: pickedCream, onPick: setPickedCream },
              { label: '3. Chọn Topping:', items: TOPPINGS, picked: pickedTopping, onPick: setPickedTopping },
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="text-xs font-black text-[#7D5867]">{row.label}</div>
                <div className="grid grid-cols-3 gap-2">
                  {row.items.map((item) => {
                    const active = row.picked?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => row.onPick(item)}
                        className={`p-2 rounded-2xl border-2 text-center transition cursor-pointer ${
                          active
                            ? 'bg-[#FFE4EE] border-[#593A47] shadow-[0_3px_0_#593A47] scale-[1.03]'
                            : 'bg-[#FFFDF9] border-[#E5D3DC] hover:border-[#593A47]'
                        }`}
                      >
                        <div className="text-2xl">{item.icon}</div>
                        <div className="text-[10px] font-black mt-0.5 leading-tight">{item.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleConfirmIngredients}
              className="kawaii-btn w-full py-2.5 bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-black text-sm cursor-pointer"
            >
              🔥 Cho Bánh Vào Lò Nướng!
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-[#FFF6FA] border-[3px] border-[#593A47] shadow-[0_5px_0_#593A47] space-y-4 text-center">
            <div className="text-5xl animate-bounce">🧁</div>
            <div className="space-y-1">
              <div className="font-black text-sm text-[#593A47]">Canh Nhiệt Lò Nướng Bình Minh!</div>
              <p className="text-xs font-bold text-[#7D5867]">
                Bấm nút ngay khi kim trượt vào <strong>vùng xanh lá Vàng Ươm</strong> ở giữa!
              </p>
            </div>

            <div className="relative w-full h-8 rounded-full bg-white border-[2.5px] border-[#593A47] overflow-hidden">
              {/* Vùng chuẩn 36% -> 64% */}
              <div
                style={{ left: '36%', width: '28%' }}
                className="absolute inset-y-0 bg-[#A8F0CB] border-x-2 border-[#16805D]"
              />
              {/* Kim chỉ thị */}
              <div
                style={{ left: `calc(${heatPos}% - 6px)` }}
                className="absolute top-0 bottom-0 w-3 rounded-full bg-[#FF6B9D] border-2 border-[#593A47] shadow"
              />
            </div>

            <button
              type="button"
              onClick={handleStopOven}
              className="kawaii-btn w-full py-3 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-black text-base cursor-pointer"
            >
              ✨ Lấy Bánh Ra Lò Ngay!
            </button>
          </div>
        )}
      </div>
    </MiniGameShell>
  );
}
