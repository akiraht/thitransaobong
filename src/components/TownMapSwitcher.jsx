import React, { useState, useEffect } from 'react';
import { getMapUnlockLevel, isMapUnlockedAtLevel } from '../config/progressionConfig';

export const MAP_NAV_LIST = [
  {
    id: 'map_hope_hill',
    title: 'Đỉnh Đồi Hy Vọng',
    shortTitle: 'Đỉnh Đồi',
    subtitle: 'Lọ Sao & Cầu Vồng',
    houseCount: 7,
    iconSrc: '/assets/maps/icon/icon_map_hope_hill.webp',
    signSrc: '/assets/maps/icon/sign_map_hope_hill.webp',
    accentEmoji: '🌈',
  },
  {
    id: 'map_astronomy_valley',
    title: 'Thung Lũng Thiên Văn',
    shortTitle: 'Thiên Văn',
    subtitle: 'Trăng Sao & Cực Quang',
    houseCount: 6,
    iconSrc: '/assets/maps/icon/icon_map_astronomy_valley.webp',
    signSrc: '/assets/maps/icon/sign_map_astronomy_valley.webp',
    accentEmoji: '🌙',
  },
  {
    id: 'map_weather_lane',
    title: 'Ngõ Thời Tiết',
    shortTitle: 'Thời Tiết',
    subtitle: 'Sương – Gió – Tuyết – Chiều',
    houseCount: 5,
    iconSrc: '/assets/maps/icon/icon_map_weather_lane.webp',
    signSrc: '/assets/maps/icon/sign_map_weather_lane.webp',
    accentEmoji: '🍃',
  },
  {
    id: 'map_mischief_alley',
    title: 'Hẻm Xoáy Tinh Nghịch',
    shortTitle: 'Hẻm Xoáy',
    subtitle: 'Biệt Đội Siêu Quậy',
    houseCount: 4,
    iconSrc: '/assets/maps/icon/icon_map_mischief_alley.webp',
    signSrc: '/assets/maps/icon/sign_map_mischief_alley.webp',
    accentEmoji: '🌀',
  },
];

/**
 * THANH ĐIỀU HƯỚNG 4 BẢN ĐỒ — NGUYÊN MẪU HÌNH ẢNH ĐẢO TIỂU CẢNH
 * - PC màn hình đủ cao (w >= 768px && h > 520px): 4 đảo 96x96px xếp dọc, hover hiện tooltip tên map.
 * - Mobile dọc (< 768px) HOẶC điện thoại xoay ngang (h <= 520px): Icon đảo gọn góc phải, chạm mở Modal chọn 4 map (tránh tràn đáy!).
 */
export default function TownMapSwitcher({
  currentMapId,
  currentLevel = 0,
  onSelectMap,
  isTransitioning = false,
}) {
  const [isMobileMapModalOpen, setIsMobileMapModalOpen] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const isCompactMode = viewport.w < 768 || viewport.h <= 520;
  const isShortLandscape = viewport.h <= 520 && viewport.w > viewport.h;
  const activeItem = MAP_NAV_LIST.find((m) => m.id === currentMapId) || MAP_NAV_LIST[0];

  const handleChooseMap = (mapId) => {
    setIsMobileMapModalOpen(false);
    if (mapId !== currentMapId && !isTransitioning && typeof onSelectMap === 'function') {
      onSelectMap(mapId);
    }
  };

  return (
    <>
      {/* ================= 1. DESKTOP ĐỦ CHIỀU CAO: 4 ĐẢO 96x96px XẾP DỌC + TOOLTIP ================= */}
      {!isCompactMode && (
        <nav
          aria-label="Chuyển đổi 4 phân khu bản đồ"
          style={{
            top: 'calc(max(0.6rem, env(safe-area-inset-top)) + 52px)',
            right: 'max(0.75rem, env(safe-area-inset-right))',
          }}
          className="fixed z-[890] flex flex-col items-end gap-2 pointer-events-none select-none"
        >
          {MAP_NAV_LIST.map((item) => {
            const isActive = currentMapId === item.id;
            const isLocked = !isMapUnlockedAtLevel(item.id, currentLevel);
            const reqLv = getMapUnlockLevel(item.id);
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleChooseMap(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleChooseMap(item.id);
                  }
                }}
                aria-label={`${item.title} (${item.houseCount} ngôi nhà)`}
                className={`group relative flex items-center cursor-pointer pointer-events-auto transition-transform duration-200 ${
                  isActive ? 'scale-105' : 'hover:scale-105'
                } ${isLocked ? 'opacity-75 grayscale-[45%]' : ''}`}
              >
                {/* Tooltip tên map hiện mượt bên trái khi hover */}
                <div className="pointer-events-none absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#FFFDF9] border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-30">
                  <div className="text-xs font-black text-[#593A47] flex items-center gap-1">
                    <span>{isLocked ? '🔒' : item.accentEmoji}</span>
                    <span>{item.title}</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#7D5867]">
                    {isLocked
                      ? `Mở khóa ở LV.${reqLv} (2 Huy Hiệu)`
                      : isActive
                        ? '📍 Đang ở phân khu này'
                        : `${item.subtitle} • ${item.houseCount} nhà`}
                  </div>
                </div>

                {/* Hình ảnh đảo tiểu cảnh nguyên mẫu 96x96px */}
                <div
                  className={`relative z-10 ${
                    isActive
                      ? 'drop-shadow-[0_0_12px_rgba(255,224,102,1)]'
                      : 'drop-shadow-[0_4px_6px_rgba(89,58,71,0.45)]'
                  }`}
                >
                  {isLocked && (
                    <span className="absolute -top-1 -right-1 z-20 px-1.5 py-0.5 rounded-full bg-[#593A47] text-[#FFE066] border border-[#FFE066] text-[9px] font-black shadow">
                      🔒 LV.{reqLv}
                    </span>
                  )}
                  <img
                    src={item.iconSrc}
                    alt={item.title}
                    draggable={false}
                    className="w-24 h-24 object-contain pointer-events-none select-none"
                  />
                  <span className="absolute top-1 right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-[10px] font-black text-[#593A47] flex items-center justify-center leading-none shadow-sm">
                    {item.houseCount}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>
      )}

      {/* ================= 2. MOBILE DỌC & MOBILE XOAY NGANG: ICON ĐẢO MỞ MODAL ================= */}
      {isCompactMode && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsMobileMapModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsMobileMapModalOpen(true);
            }
          }}
          aria-label="Mở bản đồ chọn phân khu"
          title="Chọn phân khu bản đồ"
          style={{
            top: 'calc(max(0.6rem, env(safe-area-inset-top)) + 48px)',
            right: 'max(0.65rem, env(safe-area-inset-right))',
          }}
          className="fixed z-[890] flex flex-col items-center cursor-pointer pointer-events-auto select-none active:scale-95 transition-transform"
        >
          <img
            src={activeItem.iconSrc}
            alt={activeItem.title}
            draggable={false}
            className="w-12 h-12 object-contain drop-shadow-[0_3px_6px_rgba(89,58,71,0.45)]"
          />
          <div className="relative -mt-1.5 w-20 h-6 flex items-center justify-center">
            <img
              src={activeItem.signSrc}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_2px_3px_rgba(89,58,71,0.35)]"
            />
            <span className="relative z-10 text-[9.5px] font-black text-[#593A47] whitespace-nowrap [text-shadow:0_1px_0_rgba(255,255,255,0.9)]">
              {activeItem.shortTitle} ▾
            </span>
          </div>
        </div>
      )}

      {/* MODAL CHỌN NHANH 4 MAP (2x2 TRÊN DỌC, 4x1 TRÊN XOAY NGANG) */}
      {isMobileMapModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileMapModalOpen(false);
          }}
          className="fixed inset-0 z-[975] bg-[#593A47]/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
        >
          <div
            className={`kawaii-card w-full ${
              isShortLandscape ? 'max-w-2xl' : 'max-w-sm'
            } max-h-[92dvh] bg-[#FFFDF9] overflow-hidden pop-in my-auto`}
          >
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#FFF3B0] to-[#E0F2FE] border-b-[2.5px] border-[#593A47] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <h3 className="text-sm font-black text-[#593A47]">Chọn Phân Khu Thị Trấn</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMapModalOpen(false)}
                aria-label="Đóng bản đồ"
                className="w-8 h-8 rounded-full bg-white border-2 border-[#593A47] text-[#593A47] font-black text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className={`p-3.5 grid gap-3 ${isShortLandscape ? 'grid-cols-4' : 'grid-cols-2'}`}>
              {MAP_NAV_LIST.map((item) => {
                const isActive = currentMapId === item.id;
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleChooseMap(item.id)}
                    className={`relative flex flex-col items-center cursor-pointer select-none transition-transform active:scale-95 ${
                      isActive ? 'scale-105' : ''
                    }`}
                  >
                    <div
                      className={`relative z-10 ${
                        isActive
                          ? 'drop-shadow-[0_0_12px_rgba(255,224,102,1)]'
                          : 'drop-shadow-[0_4px_6px_rgba(89,58,71,0.3)]'
                      }`}
                    >
                      <img
                        src={item.iconSrc}
                        alt={item.title}
                        draggable={false}
                        className={`${isShortLandscape ? 'w-14 h-14' : 'w-20 h-20'} object-contain`}
                      />
                      <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-[9px] font-black text-[#593A47] flex items-center justify-center">
                        {item.houseCount}
                      </span>
                    </div>
                    <div className={`relative -mt-1.5 ${isShortLandscape ? 'w-24 h-7' : 'w-32 h-9'} flex items-center justify-center`}>
                      <img
                        src={item.signSrc}
                        alt=""
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(89,58,71,0.25)]"
                      />
                      <span className="relative z-10 text-[10px] font-black text-[#593A47] whitespace-nowrap [text-shadow:0_1px_0_rgba(255,255,255,0.9)]">
                        {item.shortTitle}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#7D5867] mt-0.5 text-center leading-tight">
                      {isActive ? '📍 Đang ở đây' : item.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * HIỆU ỨNG ĐÁM MÂY CHUYỂN CẢNH MƯỢT MÀ KHI CHUYỂN MAP
 */
export function CloudTransitionOverlay({ isTransitioning, activeMap }) {
  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none flex flex-col items-center justify-center overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm animate-fade-in" />

      <div className="relative z-10 flex flex-col items-center gap-3 pop-in px-4 text-center">
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
