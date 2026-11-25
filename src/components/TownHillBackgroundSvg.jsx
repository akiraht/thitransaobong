import React from 'react';
import { TOWN_BG_WIDE_URI } from '../data/houseSprites';

/**
 * Phông nền Bản đồ 2.5D thống nhất 16:9 cho cả PC và Mobile:
 * Nằm trong #town-world-container luôn giữ đúng tỉ lệ 16:9 (trên Mobile được pan ngang),
 * đảm bảo tọa độ % của 20 ngôi nhà, đường chân trời và collider luôn khớp 100% với nền đất.
 */
export default function TownHillBackgroundSvg({ customBgImage = null }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <img
        src={customBgImage || TOWN_BG_WIDE_URI}
        onError={(e) => {
          if (e.currentTarget.src !== TOWN_BG_WIDE_URI) {
            e.currentTarget.src = TOWN_BG_WIDE_URI;
          }
        }}
        alt="Bản đồ Thị Trấn Sao Bông"
        draggable={false}
        className="block w-full h-full object-fill pointer-events-none select-none"
      />
    </div>
  );
}
