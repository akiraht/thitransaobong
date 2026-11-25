import React, { useState, useEffect, useRef, useCallback } from 'react';
import CharacterAvatar from './CharacterAvatar';
import TownHillBackgroundSvg from './TownHillBackgroundSvg';
import TownSideScenery from './TownSideScenery';
import CozyWalkAvatar, {
  TOWN_OBSTACLES,
  HILL_LANDMARKS,
  SKY_HORIZON_POINTS,
  calcHorizonY
} from './CozyWalkAvatar';
import TownDebugGizmo from './TownDebugGizmo';
import {
  UserHouseSvg,
  ScenicHouseSvg,
  HouseRoofSignSvg,
  HouseWoodenSignpostSvg,
  TownArchedHeaderSvg
} from './TownHousesSvg';
import TownSceneryTrees from './TownSceneryTrees';
import { TOWN_HOUSES_DATA } from '../data/townHousesConfig';
import {
  TOWN_MAPS,
  MAP_DICT,
  getMapObstacles,
  getMapLandmarks,
  getMapSkyHorizonPoints,
  getMapWalkBounds
} from '../data/townMapsConfig';
import TownMapSwitcher, { CloudTransitionOverlay } from './TownMapSwitcher';
import { TOWN_CHARACTERS } from '../data/characterSprites';

const TIME_PERIOD_META = {
  morning: { icon: '🌅', label: 'Buổi sáng • Trời sáng' },
  afternoon: { icon: '☀️', label: 'Trưa chiều • Nắng ấm' },
  evening: { icon: '🌆', label: 'Buổi tối • Hoàng hôn' },
  night: { icon: '🌌', label: 'Ban đêm • Trời khuya' }
};

// Chiều rộng thế giới trên PC (World Map Width)
const WORLD_WIDTH_PC = 1800;

// Danh sách các Phân Khu Thị Trấn & Tâm điểm Camera (Ratio 0 -> 1)
const TOWN_DISTRICTS = [
  {
    id: 'hope_hill',
    name: 'Đỉnh Đồi Hy Vọng',
    icon: '⭐',
    desc: 'Nhà Của Bạn, Bé Sao Bông & Tòa Thị Chính',
    xRatio: 0.5,
    tagBg: '#FFF4BD',
    tagColor: '#593A47'
  },
  {
    id: 'cosmic',
    name: 'Khu Thiên Văn',
    icon: '🌙',
    desc: 'Tháp Trăng Khuyết, Đài Quan Sát & Bầu Trời Đêm',
    xRatio: 0.18,
    tagBg: '#EDE7F6',
    tagColor: '#593A47'
  },
  {
    id: 'food',
    name: 'Phố Ẩm Thực',
    icon: '🥐',
    desc: 'Tiệm Bánh Bình Minh, Tiệm Trà & Cà Phê Hoàng Hôn',
    xRatio: 0.46,
    tagBg: '#FFE5D4',
    tagColor: '#593A47'
  },
  {
    id: 'weather',
    name: 'Khu Thời Tiết',
    icon: '🌈',
    desc: 'Đài Khí Tượng, Cối Xay Gió & Trạm Nhạc Lofi',
    xRatio: 0.78,
    tagBg: '#DFF8EB',
    tagColor: '#593A47'
  },
  {
    id: 'mischief',
    name: 'Ngõ Gió Xoáy',
    icon: '🌪️',
    desc: 'Trạm Mưa Giông, Tí Lốc Xoáy & Hầm Xoáy Nhỏ',
    xRatio: 0.06,
    tagBg: '#F3E8FF',
    tagColor: '#593A47'
  }
];

function HillHouseItem({
  char,
  houseData,
  isTownUnlocked,
  onSelectCharacter,
  delay = '0ms'
}) {
  if (!char || !houseData) return null;

  const signSide = houseData.signSide || 'left';
  const signPosClass =
    signSide === 'left'
      ? 'right-[86%] sm:right-[88%] bottom-0.5'
      : 'left-[86%] sm:left-[88%] bottom-0.5';

  return (
    <div
      style={{
        left: `${houseData.x}%`,
        top: `${houseData.y}%`,
        zIndex: Math.round(houseData.y * 10),
        transform: `translate(-50%, -82%) scale(${houseData.scale || 1.0})`,
        transformOrigin: 'bottom center'
      }}
      className="absolute transition-all duration-500 pointer-events-auto"
    >
      <button
        type="button"
        onClick={() => {
          if (isTownUnlocked) {
            onSelectCharacter(char);
          }
        }}
        title={
          isTownUnlocked
            ? `${char.name} — Click để trò chuyện`
            : `${char.houseName} (Đang đóng cửa)`
        }
        className={`group relative flex flex-col items-center focus:outline-none transition-transform duration-300 ${
          isTownUnlocked ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : 'cursor-default'
        }`}
      >
        {/* Hình ảnh Ngôi Nhà */}
        <ScenicHouseSvg id={char.id} isDoorOpen={isTownUnlocked} />

        {/* BẢNG TÊN GỖ CỦA NGÔI NHÀ CẮM XUỐNG BÃI CỎ (Theo phiên bản trước) */}
        <div
          className={`absolute ${signPosClass} z-30 pointer-events-auto transition-transform duration-300 group-hover:scale-105`}
        >
          <HouseWoodenSignpostSvg name={houseData.signName || char.signName || char.houseName || char.name} />
        </div>

        {/* Nhân vật hiện tại bước ra trước cửa nhà khi mở cửa */}
        <div
          style={{ transitionDelay: delay }}
          className={`absolute -bottom-1.5 z-30 transition-all duration-700 ease-out flex flex-col items-center ${
            isTownUnlocked
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-0 translate-y-6 pointer-events-none'
          }`}
        >
          <CharacterAvatar
            id={char.id}
            className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 drop-shadow-[0_4px_6px_rgba(89,58,71,0.28)]"
          />
        </div>
      </button>
    </div>
  );
}

export default function TownStreetScene({
  timePeriod = 'morning',
  timeMode = 'auto',
  onChangeTimeMode,
  isNightMode,
  isTownUnlocked,
  remainingStarsCount,
  remainingCooldownMs,
  formatDurationHMS,
  resident,
  residentStats,
  historyCount = 0,
  isMovementLocked = false,
  onOpenHistoryModal,
  onSelectCharacter,
  onOpenUserHouse,
  onClickCentralStarFountain
}) {
  const charMap = {};
  TOWN_CHARACTERS.forEach((c) => {
    charMap[c.id] = c;
  });

  const userHouseTitle =
    resident.isLoggedIn && resident.nickname ? `Nhà của ${resident.nickname}` : 'Nhà Của Bạn';

  // --- QUẢN LÝ CAMERA PAN & WORLD MAP ---
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const isDesktop = viewportWidth >= 768;

  // Giới hạn cuộn tối đa của camera
  const maxCameraX = Math.max(0, WORLD_WIDTH_PC - viewportWidth);

  // Vị trí camera hiện tại (pixel từ 0 đến maxCameraX)
  const [cameraX, setCameraX] = useState(() => (isDesktop ? maxCameraX * 0.5 : 0));
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isOverviewFit, setIsOverviewFit] = useState(false);
  // State quản lý Hệ thống 3 Map độc lập (6 - 8 nhà mỗi map)
  const [currentMapId, setCurrentMapId] = useState('map_hope_hill');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentMapData = MAP_DICT[currentMapId] || TOWN_MAPS[0];
  const currentObstacles = getMapObstacles(currentMapId);
  const currentLandmarks = getMapLandmarks(currentMapId);
  const currentSkyHorizon = getMapSkyHorizonPoints(currentMapId);
  const currentBounds = getMapWalkBounds(currentMapId);
  const [avatarResetPos, setAvatarResetPos] = useState(currentMapData.startPos);

  const handleSelectMap = (newMapId) => {
    if (newMapId === currentMapId || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMapId(newMapId);
      const targetMap = MAP_DICT[newMapId] || TOWN_MAPS[0];
      setAvatarResetPos(targetMap.startPos);
      setCameraX(0);
    }, 350);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  };

  // Xử lý khi nhân vật bước chân vào Cổng Dịch Chuyển (Warp Portal)
  const handleTriggerPortal = useCallback(
    (portal) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMapId(portal.targetMapId);
        setAvatarResetPos(portal.targetPos);
        setCameraX(0);
      }, 350);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700);
    },
    [isTransitioning]
  );

  const [activeDistrict, setActiveDistrict] = useState('hope_hill');
  const [isFollowAvatar, setIsFollowAvatar] = useState(true);
  const [districtToast, setDistrictToast] = useState(null);

  // State vị trí Avatar & Lệnh Click to Move
  const [currentAvatarPos, setCurrentAvatarPos] = useState({ x: 50, y: 72 });
  const [externalTargetPos, setExternalTargetPos] = useState(null);

  // State hội thoại nói chuyện (được CozyWalkAvatar gửi lên để render cố định giữa màn hình)
  const [dialogueData, setDialogueData] = useState(null);

  // Ref theo dõi kéo thả chuột (Mouse Drag to Pan) vs Click to Move (ngưỡng 8px)
  const isMouseDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartCamXRef = useRef(cameraX);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Lắng nghe thay đổi kích thước cửa sổ
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setViewportWidth(w);
      if (w >= 768) {
        const newMax = Math.max(0, WORLD_WIDTH_PC - w);
        setCameraX((prev) => Math.min(newMax, prev));
      } else {
        setCameraX(0);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Khi người dùng bấm phím di chuyển (WASD / Mũi tên), tự động lia camera bám theo
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(e.key)) {
        setIsFollowAvatar(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Xử lý khi Avatar di chuyển -> Cập nhật toạ độ & Camera tự động lia mượt mà bám theo
  const handlePlayerMove = useCallback(
    (pos) => {
      setCurrentAvatarPos(pos);
      if (!isDesktop || !isFollowAvatar || isDraggingRef.current) return;
      const avatarPixelX = (pos.x / 100) * WORLD_WIDTH_PC;
      const targetCamX = Math.max(0, Math.min(maxCameraX, avatarPixelX - viewportWidth / 2));
      setCameraX(targetCamX);
    },
    [isDesktop, isFollowAvatar, maxCameraX, viewportWidth]
  );

  // Xử lý nhấn chuột: Chưa vội coi là Drag, ghi nhận toạ độ bắt đầu
  const handleMouseDown = (e) => {
    if (!isDesktop) return;
    // Bỏ qua nếu click vào nút, hộp thoại, bảng điều khiển hoặc phần tử tương tác
    if (
      e.target.closest('button') ||
      e.target.closest('.pointer-events-auto') ||
      e.target.closest('.dialogue-box') ||
      e.target.closest('.cozy-controls') ||
      e.target.closest('.kawaii-card')
    ) {
      return;
    }
    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartCamXRef.current = cameraX;
  };

  // Xử lý rê chuột: Chỉ khi di chuyển chuột > 8px mới tính là Drag to Pan
  const handleMouseMove = (e) => {
    if (!isDesktop || !isMouseDownRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;

    // Ngưỡng 8px để phân biệt giữa click chuột và kéo map
    if (!isDraggingRef.current && Math.hypot(deltaX, deltaY) > 8) {
      isDraggingRef.current = true;
      setIsDraggingState(true);
      setIsFollowAvatar(false); // Người dùng chủ động kéo map để ngắm cảnh
    }

    if (isDraggingRef.current) {
      const nextCamX = Math.max(0, Math.min(maxCameraX, dragStartCamXRef.current - deltaX));
      setCameraX(nextCamX);
    }
  };

  // Xử lý nhả chuột: Phân biệt Kéo Pan và Click to Move
  const handleMouseUp = (e) => {
    if (!isDesktop || !isMouseDownRef.current) return;
    const wasDragging = isDraggingRef.current;
    isMouseDownRef.current = false;
    isDraggingRef.current = false;
    setIsDraggingState(false);

    // NẾU NGƯỜI DÙNG CHỈ CLICK CHUỘT (khoảng cách rê chuột < 8px) => CLICK TO MOVE!
    if (!wasDragging) {
      // Tính toạ độ phần trăm trên bản đồ thế giới 2560px
      const clickWorldPixelX = cameraX + e.clientX;
      const targetPercentX = (clickWorldPixelX / WORLD_WIDTH_PC) * 100;
      const targetPercentY = (e.clientY / window.innerHeight) * 100;

      // Giới hạn trong vùng sườn đồi cỏ (từ 24% đến 93%)
      if (targetPercentY >= 24 && targetPercentY <= 93) {
        setExternalTargetPos({ x: targetPercentX, y: targetPercentY, timestamp: Date.now() });
        setIsFollowAvatar(true); // Tự động bật lại camera follow để lia theo bước đi của Bé!
      }
    }
  };

  // Chuyển nhanh Camera đến một Phân Khu
  const handleJumpToDistrict = (district) => {
    if (!isDesktop) return;
    setActiveDistrict(district.id);
    setIsFollowAvatar(false);

    // Tính toán cameraX để tâm phân khu nằm giữa màn hình
    const targetPixel = district.xRatio * WORLD_WIDTH_PC;
    const targetCamX = Math.max(0, Math.min(maxCameraX, targetPixel - viewportWidth / 2));
    setCameraX(targetCamX);

    // Hiển thị toast thông báo phân khu
    setDistrictToast(`${district.icon} ${district.name}: ${district.desc}`);
    setTimeout(() => {
      setDistrictToast((prev) => (prev && prev.includes(district.name) ? null : prev));
    }, 3000);
  };

  // Căn giữa Camera bám theo Avatar
  const handleReFocusAvatar = () => {
    setIsFollowAvatar(true);
    setActiveDistrict(null);
    setDistrictToast('🚶 Đang bám theo bước chân Bé!');
    setTimeout(() => setDistrictToast(null), 2000);
  };

  return (
    <div
      id="town-street-container"
      style={{ height: '100dvh', minHeight: '100vh', maxHeight: '100dvh' }}
      className={`relative w-screen overflow-hidden select-none ${
        isDesktop ? (isDraggingState ? 'cursor-grabbing' : 'cursor-grab') : ''
      }`}
      onClick={(e) => {
        if (isMovementLocked) return;
        if (
          e.target.closest('button') ||
          e.target.closest('.dialogue-box') ||
          e.target.closest('.kawaii-card') ||
          e.target.closest('a') ||
          e.target.closest('input') ||
          e.target.closest('textarea')
        ) {
          return;
        }
        const container = document.getElementById('town-world-container') || e.currentTarget;
        const rect = container.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;
        const skyLimit = calcHorizonY(currentSkyHorizon, clickX);
        const maxY = currentBounds?.maxY || 93.5;
        if (clickY >= skyLimit - 1.5 && clickY <= maxY + 1.0) {
          setExternalTargetPos({
            x: Math.max(currentBounds?.minX || 3.0, Math.min(currentBounds?.maxX || 97.0, clickX)),
            y: Math.max(skyLimit, Math.min(maxY, clickY)),
            timestamp: Date.now()
          });
        }
      }}
    >

      {/* TOAST THÔNG BÁO PHÂN KHU (HIỆN KHI CHUYỂN KHU) */}
      {districtToast && isDesktop && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[940] px-4 py-1.5 rounded-full bg-[#593A47]/90 backdrop-blur-md border border-white/50 text-white text-xs font-extrabold shadow-lg pointer-events-none pop-in">
          {districtToast}
        </div>
      )}

      {/* THANH ĐIỀU HƯỚNG CHUYỂN 4 PHÂN KHU MAP CHỦ ĐỀ */}
      <TownMapSwitcher
        currentMapId={currentMapId}
        onSelectMap={handleSelectMap}
        isTransitioning={isTransitioning}
      />

      {/* HIỆU ỨNG MÂY TRẮNG CHUYỂN CẢNH */}
      <CloudTransitionOverlay
        isTransitioning={isTransitioning}
        activeMap={currentMapData}
      />

      {/* ================= KHUNG THẾ GIỚI TOÀN CẢNH (WORLD CONTAINER) ================= */}
      {/* Trên PC: Rộng 2560px, dịch chuyển mượt mà theo cameraX & zoomLevel, hoặc thu nhỏ toàn cảnh khi bật isOverviewFit */}
      <div
        id="town-world-container"
        style={{
          width: '100%',
          minWidth: '100vw',
          height: '100dvh',
          transform: isOverviewFit
            ? `scale(${Math.min(1, viewportWidth / 1600)})`
            : 'none',
          transformOrigin: 'top center',
          transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.0)'
        }}
        className="relative h-full"
      >
        {/* 1. PHÔNG NỀN BẦU TRỜI & ĐƯỜNG ĐÃ ĐƯỢC VẼ TRỰC TIẾP TRÊN TOWN-BG-WIDE.WEBP */}
        <TownHillBackgroundSvg customBgImage={currentMapData.bgImage} />

        {/* 2. CÂY CỐI & ĐỘNG VẬT COZY */}
        <TownSideScenery currentMapId={currentMapId} />

        {/* 3. DÒNG CHỮ VÒNG CUNG "Thị Trấn Sao Bông" & THỐNG KÊ SAO */}
        <div className="absolute top-[4.5vh] sm:top-[3vh] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center">
          <TownArchedHeaderSvg />

          <button
            type="button"
            onClick={onClickCentralStarFountain}
            className="pointer-events-auto -mt-1 sm:-mt-1.5 px-3 py-1 bg-transparent border-0 shadow-none flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-black text-white cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 drop-shadow-[0_2px_4px_rgba(89,58,71,0.95)]"
          >
            <span className="text-sm sm:text-base animate-pulse">🌟</span>
            <span className="tracking-wide">
              Sao trong lọ:{' '}
              <strong className="text-[#FFE066] drop-shadow-[0_1px_2px_rgba(89,58,71,1)]">
                {remainingStarsCount.toLocaleString('vi-VN')}
              </strong>
            </span>
            <span className="text-white/60">•</span>
            <span className="text-[#FF9BB7] underline decoration-2 underline-offset-4 hover:text-[#FFC4D5] drop-shadow-[0_1px_2px_rgba(89,58,71,1)]">
              {remainingCooldownMs > 0
                ? `Chờ ${formatDurationHMS(remainingCooldownMs)}`
                : 'Mở Hộp Sao ✨'}
            </span>
          </button>
        </div>

        {/* ================= PHÂN KHU 1: ĐỈNH ĐỒI HY VỌNG & QUẢNG TRƯỜNG TRUNG TÂM ================= */}
        {/* Ngôi Nhà Của Bạn (Chỉ xuất hiện ở Đỉnh Đồi Hy Vọng theo tọa độ chuẩn đặc tả) */}
        {currentMapData.houses.some((h) => h.id === 'user_house') && (() => {
          const userPlot = currentMapData.houses.find((h) => h.id === 'user_house');
          return (
            <div
              style={{
                left: `${userPlot.x}%`,
                top: `${userPlot.y}%`,
                zIndex: Math.round(userPlot.y * 10),
                transform: `translate(-50%, -82%) scale(${userPlot.scale || 0.78})`,
                transformOrigin: 'bottom center'
              }}
              className="absolute transition-all duration-500 pointer-events-auto flex items-center"
            >
          <button
            type="button"
            onClick={onOpenUserHouse}
            title="Chạm vào Ngôi Nhà Của Bạn để xem thông tin & huy hiệu"
            className="group relative flex flex-col items-center focus:outline-none cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <UserHouseSvg houseTitle={userHouseTitle} isRegistered={resident.isLoggedIn} />
            {!resident.isLoggedIn && (
              <span className="-mt-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF3B0] border-2 border-[#593A47] text-[9px] sm:text-[10px] font-extrabold text-[#593A47] shadow-[0_2px_0_#593A47] group-hover:bg-[#FFE066] whitespace-nowrap">
                ✨ Click vào nhà để đăng ký tên
              </span>
            )}
          </button>

          {/* Nút Thẻ Sao Đã Mở */}
          <button
            type="button"
            onClick={onOpenHistoryModal}
            aria-label="Mở Thẻ Sao May Mắn Đã Mở Hôm Nay"
            title="Thẻ Sao May Mắn Đã Mở Hôm Nay"
            className="kawaii-btn absolute left-full ml-2 sm:ml-3.5 top-1/2 -translate-y-1/2 z-40 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#FFF3B0] hover:bg-[#FFE066] text-[#593A47] flex items-center gap-1.5 whitespace-nowrap"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="5" width="16" height="19" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="2.4" />
                <rect x="8" y="3" width="16" height="19" rx="4" fill="#FFE4EE" stroke="#593A47" strokeWidth="2.4" />
                <path
                  d="M16 7.5L17.6 10.8L21.2 11.3L18.6 13.8L19.2 17.4L16 15.7L12.8 17.4L13.4 13.8L10.8 11.3L14.4 10.8L16 7.5Z"
                  fill="#FFD166"
                  stroke="#593A47"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="-top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B9D] border-2 border-[#593A47] text-white font-extrabold text-[10px] flex items-center justify-center leading-none">
                {historyCount}
              </span>
            </div>
            <span className="hidden sm:inline text-[11px] font-extrabold text-[#593A47]">
              Thẻ sao đã mở
            </span>
          </button>
        </div>
          );
        })()}

        {/* ================= CÁC NGÔI NHÀ TRONG PHÂN KHU MAP HIỆN TẠI (6 - 8 NHÀ) ================= */}
        {currentMapData.houses.filter((h) => h.type === 'character').map((house, idx) => (
          <HillHouseItem
            key={house.id}
            char={charMap[house.charId || house.id]}
            houseData={house}
            isTownUnlocked={isTownUnlocked}
            onSelectCharacter={onSelectCharacter}
            delay={`${(idx % 8) * 60 + 60}ms`}
          />
        ))}

        {/* CÁC CỔNG DỊCH CHUYỂN (WARP PORTALS) SANG PHÂN KHU KHÁC */}
        {currentMapData.portals && currentMapData.portals.map((portal) => (
          <div
            key={portal.id}
            style={{
              left: `${portal.x}%`,
              top: `${portal.y}%`,
              zIndex: Math.floor(portal.y * 10) + 15
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto select-none"
          >
            <button
              type="button"
              onClick={() => handleTriggerPortal(portal)}
              title={`Đi đến ${portal.label}`}
              className="group flex flex-col items-center focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            >
              {/* Vòng tròn phép thuật lấp lánh trên cỏ */}
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-4.5 rounded-full bg-[#FFE066]/35 border-2 border-dashed border-[#593A47] animate-pulse" />
                <span className="absolute text-base group-hover:translate-y-[-2px] transition-transform">
                  {portal.icon}
                </span>
              </div>

              {/* Bảng chỉ hướng nhỏ xinh xắn */}
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#593A47] text-white border border-[#FFE066] text-[10px] sm:text-xs font-black shadow-md flex items-center gap-1 whitespace-nowrap">
                <span>{portal.arrow}</span>
                <span>{portal.label}</span>
              </div>
            </button>
          </div>
        ))}

        {/* CÂY CỐI & TIỂU CẢNH THIÊN NHIÊN ĐỘC LẬP TRÊN BẢN ĐỒ */}
        {/* TownSceneryTrees da bo theo yeu cau */}

        {/* 7. NHÂN VẬT ĐI DẠO COZY WALK 2.5D DỌC THEO SƯỜN ĐỒI & BỘ ĐIỀU KHIỂN */}
        <CozyWalkAvatar
          resident={resident}
          customSkyHorizon={currentSkyHorizon}
          customBounds={currentBounds}
          isMovementLocked={isMovementLocked}
          onSelectCharacter={onSelectCharacter}
          onOpenUserHouse={onOpenUserHouse}
          onClickCentralStarFountain={onClickCentralStarFountain}
          isTownUnlocked={isTownUnlocked}
          onPlayerMove={handlePlayerMove}
          externalTargetPos={externalTargetPos}
          onDialogueChange={setDialogueData}
          customObstacles={currentObstacles}
          customLandmarks={currentLandmarks}
          resetPosition={avatarResetPos}
          portals={currentMapData.portals}
          onTriggerPortal={handleTriggerPortal}
        />

        {/* 8. CÔNG CỤ DEBUG CẢNH QUAN & RANH GIỚI VẬT LÝ */}
        <TownDebugGizmo
          playerPos={currentAvatarPos}
          obstacles={currentObstacles}
          landmarks={currentLandmarks}
          skyHorizonPoints={currentSkyHorizon}
          isOverviewFit={isOverviewFit}
          onToggleOverviewFit={() => setIsOverviewFit((prev) => !prev)}
        />
      </div>

      {/* ================= HỘP THOẠI HỘI THOẠI CỐ ĐỊNH CHÍNH GIỮA MÀN HÌNH (VIEWPORT CENTER) ================= */}
      {dialogueData?.activeNearLandmark && !isMovementLocked && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 !-translate-x-1/2 z-[960] w-full max-w-xl px-4 pointer-events-auto dialogue-box pop-in select-none">
          <div className="relative p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border-[3.5px] border-[#593A47] shadow-[0_8px_0_#593A47]">
            {/* Nhãn Tên Nhân Vật đang nói chuyện */}
            <div
              style={{ backgroundColor: dialogueData.activeNearLandmark.badgeBg }}
              className="absolute -top-4 left-6 px-3.5 py-1 rounded-xl border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] text-xs font-black text-[#593A47] flex items-center gap-1.5 uppercase tracking-wide"
            >
              <span>{dialogueData.activeNearLandmark.icon}</span>
              <span>{dialogueData.activeNearLandmark.speaker}</span>
            </div>

            {/* Nội dung hội thoại có hiệu ứng Typewriter chạy từng chữ */}
            <div className="pt-2 pb-1">
              <p className="text-sm sm:text-base font-extrabold text-[#593A47] leading-relaxed min-h-[44px]">
                &ldquo;{dialogueData.displayedText}&rdquo;
                {!dialogueData.isTypingDone && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-[#D9386A] animate-pulse" />
                )}
              </p>
            </div>

            {/* Nút Tương Tác / Gõ Cửa nhanh */}
            <div className="mt-2 pt-2 border-t-2 border-dashed border-[#F0DCE5] flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#8C6575] hidden sm:inline">
                * Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-[#593A47] font-mono text-[10px]">Space</kbd> để trò chuyện với {dialogueData.activeNearLandmark.speaker}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof dialogueData.handleTriggerLandmark === 'function') {
                    dialogueData.handleTriggerLandmark();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFE066] hover:bg-[#FFD166] border-2 border-[#593A47] text-xs font-black text-[#593A47] shadow-[0_2px_0_#593A47] active:translate-y-0.5"
              >
                {dialogueData.activeNearLandmark.actionText || 'Trò chuyện ✨'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
