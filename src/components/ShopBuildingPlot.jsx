import React, { useState } from 'react';
import { CHARACTER_SPRITES } from '../data/characterSprites';

/**
 * NGÔI NHÀ CỬA TIỆM + NHÂN VẬT CHỦ TIỆM ĐẶT TRỰC TIẾP TRÊN Ô ĐẤT TRỐNG CỦA MỖI BẢN ĐỒ
 * - Tự động nhận ảnh thiết kế riêng nếu thả vào `public/images/shops/`:
 *   + Nhà tiệm: `house-shop_hope.webp`, `house-shop_astro.webp`, `house-shop_weather.webp`, `house-shop_mischief.webp`
 *   + NPC chủ tiệm: `npc-shop_hope.webp`, `npc-shop_astro.webp`, `npc-shop_weather.webp`, `npc-shop_mischief.webp`
 * - Khi chưa có ảnh riêng sẽ hiển thị Ngôi Nhà Cửa Tiệm Kawaii SVG + NPC dự phòng đồng bộ tỷ lệ với nhà cư dân.
 */
export default function ShopBuildingPlot({ shop, onOpenShop }) {
  const [houseImgErr, setHouseImgErr] = useState(false);
  const [npcImgErr, setNpcImgErr] = useState(false);

  if (!shop) return null;

  const npcSrc = !npcImgErr && shop.npcImage ? shop.npcImage : CHARACTER_SPRITES[shop.keeperNpcId];

  return (
    <div
      style={{
        left: `${shop.x}%`,
        top: `${shop.y}%`,
        zIndex: Math.round(shop.y * 10),
        transform: `translate(-50%, -82%) scale(${shop.scale || 0.94})`,
        transformOrigin: 'bottom center',
      }}
      className="absolute pointer-events-auto select-none"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenShop?.(shop);
        }}
        title={`Ghé ${shop.name} — Mua đồ trang trí Ngôi Nhà`}
        className="town-shop-scale group relative flex flex-col items-center focus:outline-none cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-1"
      >
        {/* Ngôi nhà Cửa Tiệm (ảnh thiết kế riêng hoặc SVG nhà tiệm Kawaii chuẩn tỷ lệ) */}
        <div className="relative flex items-end justify-center">
          {!houseImgErr && shop.houseImage ? (
            <img
              src={shop.houseImage}
              alt={shop.name}
              onError={() => setHouseImgErr(true)}
              className="w-[125px] sm:w-[155px] md:w-[175px] h-auto object-contain drop-shadow-[0_6px_6px_rgba(89,58,71,0.28)]"
            />
          ) : (
            <svg
              viewBox="0 0 180 155"
              className="w-[125px] sm:w-[155px] md:w-[175px] h-auto drop-shadow-[0_6px_6px_rgba(89,58,71,0.28)]"
            >
              {/* Bóng nền cỏ */}
              <ellipse cx="90" cy="144" rx="72" ry="10" fill="rgba(89,58,71,0.18)" />
              {/* Thân nhà cửa tiệm */}
              <rect
                x="26"
                y="64"
                width="128"
                height="78"
                rx="14"
                fill="#FFFDF9"
                stroke="#593A47"
                strokeWidth="4"
              />
              {/* Mái nhà nhọn + viền pastel */}
              <path
                d="M14 70 L90 16 L166 70 Z"
                fill={shop.roofColor || '#FF85A9'}
                stroke="#593A47"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              {/* Bảng biểu tượng tròn trên mái */}
              <circle cx="90" cy="46" r="16" fill="#FFE066" stroke="#593A47" strokeWidth="3.5" />
              <text x="90" y="52" textAnchor="middle" fontSize="18">
                {shop.icon}
              </text>
              {/* Mái hiên sọc cửa tiệm */}
              <rect
                x="20"
                y="64"
                width="140"
                height="18"
                rx="7"
                fill={shop.themeColor || '#FFF4BD'}
                stroke="#593A47"
                strokeWidth="3.5"
              />
              <line x1="48" y1="64" x2="48" y2="82" stroke="#593A47" strokeWidth="2.5" />
              <line x1="76" y1="64" x2="76" y2="82" stroke="#593A47" strokeWidth="2.5" />
              <line x1="104" y1="64" x2="104" y2="82" stroke="#593A47" strokeWidth="2.5" />
              <line x1="132" y1="64" x2="132" y2="82" stroke="#593A47" strokeWidth="2.5" />
              {/* Cửa kính trưng bày đồ bên trái */}
              <rect
                x="38"
                y="92"
                width="44"
                height="32"
                rx="8"
                fill="#BAE6FD"
                stroke="#593A47"
                strokeWidth="3"
              />
              <text x="60" y="114" textAnchor="middle" fontSize="18">
                🛍️
              </text>
              {/* Cửa ra vào bằng gỗ bên phải */}
              <path
                d="M98 142 L98 98 A18 18 0 0 1 134 98 L134 142 Z"
                fill="#FDBA74"
                stroke="#593A47"
                strokeWidth="3.5"
              />
              <circle cx="125" cy="119" r="3.5" fill="#593A47" />
            </svg>
          )}

          {/* Nhân vật NPC Chủ Tiệm đứng đón khách ngay trước cửa */}
          <div className="absolute -right-2 sm:-right-3 bottom-1 flex flex-col items-center pointer-events-none">
            <span className="px-1.5 py-0.5 rounded-full bg-[#FFE066] border border-[#593A47] text-[9px] font-black text-[#593A47] shadow-sm animate-bounce -mb-1 z-10">
              🛍️ SHOP
            </span>
            <img
              src={npcSrc}
              alt={shop.keeperName || shop.name}
              onError={() => setNpcImgErr(true)}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_3px_3px_rgba(89,58,71,0.3)]"
            />
          </div>
        </div>

        {/* Biển gỗ tên Cửa Tiệm đồng bộ phong cách thị trấn */}
        <div
          style={{ backgroundColor: shop.themeColor }}
          className="-mt-1.5 px-3 py-0.5 rounded-full border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] text-[10px] sm:text-xs font-black text-[#593A47] flex items-center gap-1 whitespace-nowrap"
        >
          <span>{shop.icon}</span>
          <span>{shop.name}</span>
        </div>
      </button>
    </div>
  );
}
