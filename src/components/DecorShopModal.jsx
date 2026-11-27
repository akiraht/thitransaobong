import React, { useState, useEffect } from 'react';
import { DECOR_SLOTS, getItemsByShopMap } from '../config/houseDecorConfig';
import {
  loadHouseDecorState,
  buyHouseDecorItem,
  equipHouseDecorItem,
  DECOR_UPDATED_EVENT,
} from '../utils/houseDecorService';
import { getStarBalance } from '../utils/miniGameEconomy';
import { CHARACTER_SPRITES } from '../data/characterSprites';
import DecorArt from './DecorArt';

const SLOT_LABEL_DICT = Object.fromEntries(DECOR_SLOTS.map((s) => [s.id, `${s.icon} ${s.label}`]));

export default function DecorShopModal({ shop, onClose }) {
  const [decorState, setDecorState] = useState(loadHouseDecorState);
  const [starBalance, setStarBalance] = useState(getStarBalance);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const sync = () => {
      setDecorState(loadHouseDecorState());
      setStarBalance(getStarBalance());
    };
    window.addEventListener(DECOR_UPDATED_EVENT, sync);
    return () => window.removeEventListener(DECOR_UPDATED_EVENT, sync);
  }, []);

  if (!shop) return null;

  const items = getItemsByShopMap(shop.mapId);

  const handleBuy = (item) => {
    const res = buyHouseDecorItem(item.id);
    setStarBalance(res.balance);
    if (res.ok) {
      setDecorState(res.state);
      setFeedback(`🎉 Đã mua & gắn "${item.name}" lên Ngôi Nhà của bạn! (-${item.price} ⭐)`);
    } else {
      setFeedback(`⚠️ ${res.message}`);
    }
  };

  const handleToggleEquip = (item) => {
    const isEquipped = decorState.equipped?.[item.slotId] === item.id;
    const res = equipHouseDecorItem(item.slotId, isEquipped ? null : item.id);
    setDecorState(res.state);
    setFeedback(
      isEquipped
        ? `📦 Đã cất "${item.name}" vào kho đồ.`
        : `✨ Đã gắn "${item.name}" lên ${SLOT_LABEL_DICT[item.slotId]}!`
    );
  };

  return (
    <div className="fixed inset-0 z-[1220] bg-[#593A47]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="kawaii-card w-full max-w-2xl max-h-[88dvh] flex flex-col overflow-hidden bg-gradient-to-b from-[#FFFDF9] to-[#FFF6FA] border-[3px] border-[#593A47] shadow-[0_8px_0_#593A47] pop-in text-[#593A47]">
        {/* Header Cửa Hàng */}
        <div
          style={{ backgroundColor: shop.themeColor }}
          className="px-4 py-3 border-b-[3px] border-[#593A47] flex items-center justify-between gap-3 shrink-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={shop.npcImage || CHARACTER_SPRITES[shop.keeperNpcId]}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = CHARACTER_SPRITES[shop.keeperNpcId];
              }}
              alt={shop.keeperName || shop.name}
              className="w-12 h-12 object-contain shrink-0 drop-shadow"
            />
            <div className="min-w-0">
              <h2 className="font-black text-base sm:text-lg leading-tight truncate">
                {shop.icon} {shop.name}
              </h2>
              <p className="text-[11px] font-bold text-[#7D5867] truncate">{shop.greeting}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-xs font-black">
              ⭐ {starBalance} Sao
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa hàng"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#FFE4EE] border-2 border-[#593A47] font-black text-sm flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nội dung danh sách 6 vật phẩm của sạp hàng */}
        <div className="p-4 overflow-y-auto space-y-3">
          {feedback && (
            <div className="px-3 py-2 rounded-2xl bg-[#FFF3B0] border-2 border-[#593A47] text-xs font-black text-center">
              {feedback}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => {
              const isOwned = decorState.ownedIds.includes(item.id);
              const isEquipped = decorState.equipped?.[item.slotId] === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border-[2.5px] flex items-center gap-3 transition ${
                    isEquipped
                      ? 'bg-[#DFF8EB] border-[#16805D]'
                      : isOwned
                        ? 'bg-white border-[#593A47]'
                        : 'bg-[#FFFDF9] border-[#E5D3DC]'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#593A47] flex items-center justify-center shrink-0">
                    <DecorArt item={item} className="w-11 h-11 text-3xl" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-xs sm:text-sm truncate">{item.name}</span>
                      <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] text-[9px] font-black text-[#64748B]">
                        {SLOT_LABEL_DICT[item.slotId]}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-[#7D5867] leading-snug line-clamp-2">
                      {item.desc}
                    </p>

                    <div className="pt-1">
                      {isOwned ? (
                        <button
                          type="button"
                          onClick={() => handleToggleEquip(item)}
                          className={`px-3 py-1 rounded-xl border-2 border-[#593A47] text-[11px] font-black cursor-pointer ${
                            isEquipped
                              ? 'bg-white text-[#16805D] hover:bg-[#FFE4EE]'
                              : 'bg-[#A8F0CB] hover:bg-[#6EE7B7] text-[#593A47]'
                          }`}
                        >
                          {isEquipped ? '✅ Đang gắn (Bấm để tháo)' : '✨ Gắn lên Nhà'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuy(item)}
                          className={`px-3 py-1 rounded-xl border-2 border-[#593A47] text-[11px] font-black cursor-pointer ${
                            starBalance >= item.price
                              ? 'bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47]'
                              : 'bg-[#F1F5F9] text-[#94A3B8]'
                          }`}
                        >
                          🛒 Mua ngay • {item.price} ⭐
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[11px] font-bold text-[#7D5867] pt-1">
            💡 Đồ đã mua sẽ gắn trực tiếp lên <strong>Ngôi Nhà Của Bạn</strong> trên Map 1 và có thể thay đổi tự do trong Tab <strong>🏡 Trang Trí</strong>!
          </p>
        </div>
      </div>
    </div>
  );
}
