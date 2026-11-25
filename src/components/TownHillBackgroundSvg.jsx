import React from 'react';
import { TOWN_BG_WIDE_URI, TOWN_BG_MOBILE_URI } from '../data/houseSprites';

/**
 * Phông nền Thị Trấn Sao Bông hiển thị nguyên bản theo nét vẽ của bản đồ:
 * Đã bỏ tính năng phủ màu / vẽ mặt trời theo thời gian thực để phù hợp với hệ thống map mới.
 */
export default function TownHillBackgroundSvg({ customBgImage = null }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Bản Mobile (< 768px): Khung dọc chuẩn 768x1376 không méo hình */}
      <svg
        viewBox="0 0 768 1376"
        preserveAspectRatio="xMidYMid slice"
        className="block md:hidden w-full h-full"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8EFEA" />
            <stop offset="100%" stopColor="#FFFDF2" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="768" height="1376" fill="url(#skyGrad)" />
        <image
          href={customBgImage || TOWN_BG_MOBILE_URI}
          x="0"
          y="0"
          width="768"
          height="1376"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>

      {/* Bản PC/Desktop (>= 768px): Khung Widescreen lấp đầy toàn bộ container */}
      <img
        src={customBgImage || TOWN_BG_WIDE_URI}
        onError={(e) => {
          if (e.currentTarget.src !== TOWN_BG_WIDE_URI) {
            e.currentTarget.src = TOWN_BG_WIDE_URI;
          }
        }}
        alt="Bản đồ Thị Trấn Sao Bông"
        className="hidden md:block w-full h-full object-fill pointer-events-none select-none"
      />
    </div>
  );
}
