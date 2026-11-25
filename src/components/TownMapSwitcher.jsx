import React from 'react';

export const MAP_NAV_LIST = [
  {
    id: 'map_hope_hill',
    title: 'Đỉnh Đồi Hy Vọng',
    subtitle: 'Lọ Sao & Cầu Vồng',
    houseCount: 7,
    iconSrc: '/assets/maps/icon/icon_map_hope_hill.png',
    signSrc: '/assets/maps/icon/sign_map_hope_hill.png',
    accentEmoji: '🌈',
  },
  {
    id: 'map_astronomy_valley',
    title: 'Thung Lũng Thiên Văn',
    subtitle: 'Trăng Sao & Cực Quang',
    houseCount: 6,
    iconSrc: '/assets/maps/icon/icon_map_astronomy_valley.png',
    signSrc: '/assets/maps/icon/sign_map_astronomy_valley.png',
    accentEmoji: '🌙',
  },
  {
    id: 'map_weather_lane',
    title: 'Ngõ Thời Tiết',
    subtitle: 'Sương – Gió – Tuyết – Chiều',
    houseCount: 5,
    iconSrc: '/assets/maps/icon/icon_map_weather_lane.png',
    signSrc: '/assets/maps/icon/sign_map_weather_lane.png',
    accentEmoji: '🍃',
  },
  {
    id: 'map_mischief_alley',
    title: 'Hẻm Xoáy Tinh Nghịch',
    subtitle: 'Biệt Đội Siêu Quậy',
    houseCount: 4,
    iconSrc: '/assets/maps/icon/icon_map_mischief_alley.png',
    signSrc: '/assets/maps/icon/sign_map_mischief_alley.png',
    accentEmoji: '🌀',
  },
];

/**
 * THANH ĐIỀU HƯỚNG 4 BẢN ĐỒ — THIẾT KẾ ĐẢO TIỂU CẢNH LƠ LỬNG & BẢNG TÊN GỖ ĐUNG ĐƯA
 */
export default function TownMapSwitcher({ currentMapId, onSelectMap, isTransitioning = false }) {
  return (
    <>
      <style>{`
        @keyframes islandFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes signSwing {
          0%, 100% { transform: rotate(-1.6deg); }
          50% { transform: rotate(1.6deg); }
        }
        .animate-island-float {
          animation: islandFloat 3.4s ease-in-out infinite;
        }
        .animate-sign-swing {
          transform-origin: top center;
          animation: signSwing 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* Container bao ngoài toàn bộ thanh chuyển map (căn giữa đáy màn hình, không chặn click cỏ) */}
      <nav
        aria-label="Chuyển đổi 4 phân khu bản đồ"
        className="fixed bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-[900] flex items-end justify-center gap-2 sm:gap-4 md:gap-7 px-2 sm:px-4 py-1 pointer-events-none select-none max-w-full overflow-visible"
      >
        {MAP_NAV_LIST.map((item, idx) => {
          const isActive = currentMapId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isActive && !isTransitioning && typeof onSelectMap === 'function') {
                  onSelectMap(item.id);
                }
              }}
              style={{ animationDelay: `${idx * 0.35}s` }}
              className={`group relative flex flex-col items-center cursor-pointer select-none pointer-events-auto transition-all duration-300 ${
                isActive
                  ? '-translate-y-2 scale-105 sm:scale-110'
                  : 'hover:-translate-y-1.5 hover:scale-105 opacity-90 hover:opacity-100'
              }`}
            >
              {/* 1. CỤM ĐẢO TIỂU CẢNH TỰ DO (FLOATING MINI-DIORAMA ICON) */}
              <div
                style={{ animationDelay: `${idx * 0.35}s` }}
                className={`relative z-10 animate-island-float transition-all duration-300 ${
                  isActive
                    ? 'drop-shadow-[0_8px_16px_rgba(255,230,145,0.95)]'
                    : 'drop-shadow-[0_4px_8px_rgba(89,58,71,0.28)]'
                }`}
              >
                <img
                  src={item.iconSrc}
                  alt={item.title}
                  draggable={false}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain pointer-events-none select-none"
                />
              </div>

              {/* 2. DÂY TREO & BẢNG TÊN GỖ TÁCH NỀN ĐUNG ĐƯA */}
              <div
                style={{ animationDelay: `${idx * 0.35 + 0.15}s` }}
                className={`animate-sign-swing -mt-1.5 sm:-mt-2 relative w-24 sm:w-36 md:w-44 h-10 sm:h-12 md:h-14 flex flex-col items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'opacity-100 scale-100'
                    : 'opacity-90 group-hover:opacity-100 group-hover:scale-100'
                }`}
              >
                {/* Ảnh Bảng Tên Chủ Đề Đã Tách Nền (sign_map_*.png) */}
                <img
                  src={item.signSrc}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_3px_5px_rgba(89,58,71,0.22)]"
                />

                {/* Huy hiệu tròn hiển thị số lượng nhà ở góc trên bên phải */}
                <span
                  title={`${item.houseCount} ngôi nhà`}
                  className={`absolute -top-1 sm:-top-1.5 right-0.5 sm:right-1.5 z-20 min-w-[18px] sm:min-w-[22px] h-[18px] sm:h-[22px] px-1 rounded-full border-2 border-[#593A47] font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? 'bg-[#FFE066] text-[#593A47]'
                      : 'bg-[#FFF3B0] text-[#593A47]'
                  }`}
                >
                  {item.houseCount}
                </span>

                {/* Phần Chữ Tên Bản Đồ & Subtitle Nằm Trong Lòng Bảng Gỗ */}
                <div className="relative z-10 px-2 sm:px-3 text-center flex flex-col items-center justify-center">
                  {/* Tên Bản Đồ */}
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[9.5px] sm:text-[11px] md:text-xs font-black text-[#593A47] tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] whitespace-nowrap">
                    <span className="text-[10px] sm:text-xs">{item.accentEmoji}</span>
                    <span className="hidden xs:inline">{item.title}</span>
                    <span className="xs:hidden">{item.title.replace('Thung Lũng ', '').replace('Hẻm Xoáy ', '')}</span>
                  </div>

                  {/* Dòng mô tả phụ (Mở rộng khi Active hoặc Hover) */}
                  <div
                    className={`overflow-hidden transition-all duration-300 text-[8px] sm:text-[9.5px] font-extrabold text-[#7D5265] whitespace-nowrap ${
                      isActive
                        ? 'max-h-4 sm:max-h-5 opacity-100 mt-0.5'
                        : 'max-h-0 opacity-0 group-hover:max-h-4 sm:group-hover:max-h-5 group-hover:mt-0.5 group-hover:opacity-100'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );
}

// Alias tương thích
export const FloatingMapNav = TownMapSwitcher;

/**
 * HIỆU ỨNG ĐÁM MÂY CHUYỂN CẢNH MƯỢT MÀ KHI CHUYỂN MAP
 */
export function CloudTransitionOverlay({ isTransitioning, activeMap }) {
  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none flex flex-col items-center justify-center overflow-hidden transition-all duration-300">
      {/* Lớp nền mây mờ màu pastel */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm animate-fade-in" />

      {/* Đám mây chuyển cảnh bồng bềnh */}
      <div className="relative z-10 flex flex-col items-center gap-3 pop-in">
        <div className="text-4xl sm:text-5xl animate-bounce">
          {activeMap?.icon || '☁️'}
        </div>
        <div className="px-5 py-2 rounded-2xl bg-[#FFE066] border-2 border-[#593A47] shadow-[0_4px_0_#593A47] text-sm sm:text-base font-black text-[#593A47] uppercase tracking-wider">
          Đang đến {activeMap?.name || 'Thị Trấn'}...
        </div>
        <p className="text-xs font-bold text-[#8C6575]">
          {activeMap?.subtitle}
        </p>
      </div>
    </div>
  );
}
