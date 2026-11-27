import React, { useState, useEffect } from 'react';
import {
  DECOR_SLOTS,
  HOUSE_DECOR_ITEMS,
  DECOR_ITEM_DICT,
  MAP_DECOR_SHOPS,
} from '../config/houseDecorConfig';
import {
  loadHouseDecorState,
  equipHouseDecorItem,
  buyHouseDecorItem,
  DECOR_UPDATED_EVENT,
} from '../utils/houseDecorService';
import { getStarBalance } from '../utils/miniGameEconomy';
import { UserHouseSvg } from './TownHousesSvg';
import DecorArt from './DecorArt';

export default function HouseDecorTab({ resident }) {
  const [decorState, setDecorState] = useState(loadHouseDecorState);
  const [activeSlotId, setActiveSlotId] = useState(DECOR_SLOTS[0].id);
  const [starBalance, setStarBalance] = useState(getStarBalance);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => {
      setDecorState(loadHouseDecorState());
      setStarBalance(getStarBalance());
    };
    window.addEventListener(DECOR_UPDATED_EVENT, sync);
    return () => window.removeEventListener(DECOR_UPDATED_EVENT, sync);
  }, []);

  const slotItems = HOUSE_DECOR_ITEMS.filter((it) => it.slotId === activeSlotId);
  const activeSlot = DECOR_SLOTS.find((s) => s.id === activeSlotId) || DECOR_SLOTS[0];
  const equippedId = decorState.equipped?.[activeSlotId] || null;
  const userHouseTitle = resident?.nickname ? `Nhà của ${resident.nickname}` : 'Ngôi Nhà Của Bạn';

  const handleEquip = (itemId) => {
    const res = equipHouseDecorItem(activeSlotId, itemId);
    setDecorState(res.state);
    setNotice(itemId ? `✨ Đã gắn "${DECOR_ITEM_DICT[itemId]?.name}" lên ${activeSlot.label}!` : `📦 Đã tháo đồ ở ${activeSlot.label}.`);
  };

  const handleQuickBuy = (item) => {
    const res = buyHouseDecorItem(item.id);
    setStarBalance(res.balance);
    if (res.ok) {
      setDecorState(res.state);
      setNotice(`🎉 Đã mua & gắn "${item.name}" (-${item.price} ⭐)!`);
    } else {
      setNotice(`⚠️ ${res.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh thông tin tổng quan kho đồ & ví Sao */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#FFFDF2] border-2 border-[#593A47]">
        <div className="text-xs sm:text-sm font-black text-[#593A47]">
          🏡 Kho Đồ Trang Trí: <span className="text-[#D9386A]">{decorState.ownedIds.length}/{HOUSE_DECOR_ITEMS.length}</span> món
        </div>
        <span className="px-3 py-1 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-xs font-black text-[#593A47]">
          ⭐ Ví Sao: {starBalance}
        </span>
      </div>

      {/* Khung xem trước trực tiếp Ngôi Nhà + 6 vị trí gắn đồ */}
      <div className="relative p-5 rounded-3xl bg-gradient-to-b from-[#BAE6FD] via-[#E0F2FE] to-[#DFF8EB] border-[2.5px] border-[#593A47] flex flex-col items-center justify-center overflow-hidden">
        <div className="relative inline-flex items-center justify-center">
          <UserHouseSvg houseTitle={userHouseTitle} isRegistered={Boolean(resident?.isLoggedIn)} />
          {DECOR_SLOTS.map((slot) => {
            const eqItem = decorState.equipped?.[slot.id] ? DECOR_ITEM_DICT[decorState.equipped[slot.id]] : null;
            if (!eqItem) return null;
            return (
              <div
                key={slot.id}
                style={{ top: slot.pos.top, left: slot.pos.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              >
                <DecorArt item={eqItem} className={slot.sizeClass} />
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] font-bold text-[#593A47]/80">
          ✨ Mọi đồ gắn ở đây đều hiển thị trực tiếp lên Ngôi Nhà của bạn ngoài Map 1!
        </p>
      </div>

      {notice && (
        <div className="px-3 py-2 rounded-2xl bg-[#FFF3B0] border-2 border-[#593A47] text-xs font-black text-center text-[#593A47]">
          {notice}
        </div>
      )}

      {/* 6 nút chọn vị trí gắn đồ */}
      <div className="flex flex-wrap gap-1.5">
        {DECOR_SLOTS.map((slot) => {
          const isCurrent = slot.id === activeSlotId;
          const hasEq = Boolean(decorState.equipped?.[slot.id]);
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => setActiveSlotId(slot.id)}
              className={`px-2.5 py-1.5 rounded-xl border-2 text-xs font-black cursor-pointer transition flex items-center gap-1 ${
                isCurrent
                  ? 'bg-[#FFE066] border-[#593A47] text-[#593A47] shadow-[0_2px_0_#593A47]'
                  : 'bg-white border-[#D8C7B5] text-[#7D5867] hover:border-[#593A47]'
              }`}
            >
              <span>{slot.icon}</span>
              <span>{slot.label}</span>
              {hasEq && <span className="text-[10px]">✅</span>}
            </button>
          );
        })}
      </div>

      {/* Danh sách vật phẩm của vị trí đang chọn */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#593A47]">
            {activeSlot.icon} Vật phẩm cho vị trí {activeSlot.label}:
          </span>
          {equippedId && (
            <button
              type="button"
              onClick={() => handleEquip(null)}
              className="px-2.5 py-1 rounded-xl bg-[#FFE4EE] border border-[#593A47] text-[10px] font-black text-[#593A47] cursor-pointer"
            >
              🧹 Tháo đồ vị trí này
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {slotItems.map((item) => {
            const isOwned = decorState.ownedIds.includes(item.id);
            const isEq = equippedId === item.id;
            const shop = MAP_DECOR_SHOPS[item.shopMapId];

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 ${
                  isEq
                    ? 'bg-[#DFF8EB] border-[#16805D]'
                    : isOwned
                      ? 'bg-white border-[#593A47]'
                      : 'bg-[#FFF9FC] border-[#E5D3DC]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#593A47] flex items-center justify-center shrink-0">
                  <DecorArt item={item} className="w-10 h-10 text-2xl" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-xs font-black text-[#593A47] truncate">{item.name}</div>
                  <div className="text-[10px] font-bold text-[#7D5867] truncate">
                    {shop ? `${shop.icon} ${shop.name}` : ''}
                  </div>
                  {isOwned ? (
                    <button
                      type="button"
                      onClick={() => handleEquip(isEq ? null : item.id)}
                      className={`px-2.5 py-1 rounded-xl border-2 border-[#593A47] text-[10px] font-black cursor-pointer ${
                        isEq ? 'bg-white text-[#16805D]' : 'bg-[#A8F0CB] text-[#593A47]'
                      }`}
                    >
                      {isEq ? '✅ Đang gắn' : '✨ Gắn lên Nhà'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleQuickBuy(item)}
                      className={`px-2.5 py-1 rounded-xl border-2 border-[#593A47] text-[10px] font-black cursor-pointer ${
                        starBalance >= item.price
                          ? 'bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47]'
                          : 'bg-[#F1F5F9] text-[#94A3B8]'
                      }`}
                    >
                      🛒 Mua • {item.price} ⭐
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
