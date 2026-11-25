import React, { useState, useEffect, useRef, useCallback } from 'react';
import CharacterAvatar from './CharacterAvatar';
import TownHillBackgroundSvg from './TownHillBackgroundSvg';
import TownSideScenery from './TownSideScenery';
import CozyWalkAvatar, { calcHorizonY } from './CozyWalkAvatar';
import {
  UserHouseSvg,
  ScenicHouseSvg,
  HouseWoodenSignpostSvg,
  TownArchedHeaderSvg
} from './TownHousesSvg';
import {
  TOWN_MAPS,
  MAP_DICT,
  getMapObstacles,
  getMapLandmarks,
  getMapSkyHorizonPoints,
  getMapWalkBounds
} from '../data/townMapsConfig';
import TownMapSwitcher, { CloudTransitionOverlay } from './TownMapSwitcher';
import QuestTrackerHud from './QuestTrackerHud';
import { TOWN_CHARACTERS } from '../data/characterSprites';
import { getResidentUnlockLevel } from '../config/progressionConfig';

const MAP_ASPECT_RATIO = 16 / 9;

function HillHouseItem({
  char,
  houseData,
  isTownUnlocked,
  isResidentUnlocked = true,
  unlockLevel = 0,
  questStatus = null,
  onSelectCharacter,
  onLockedClick,
  delay = '0ms'
}) {
  if (!char || !houseData) return null;

  const canInteract = isTownUnlocked && isResidentUnlocked;
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
          if (!isResidentUnlocked) {
            onLockedClick?.(char, unlockLevel);
            return;
          }
          if (isTownUnlocked) {
            onSelectCharacter(char);
          }
        }}
        title={
          !isResidentUnlocked
            ? `${char.houseName} — Mở khóa ở Lv.${unlockLevel}`
            : isTownUnlocked
            ? `${char.name} — Chạm để trò chuyện`
            : `${char.houseName} (Đang đóng cửa)`
        }
        className={`group relative flex flex-col items-center focus:outline-none transition-transform duration-300 ${
          canInteract
            ? 'cursor-pointer hover:scale-105 hover:-translate-y-1'
            : 'cursor-pointer opacity-75 grayscale-[35%]'
        }`}
      >
        <ScenicHouseSvg id={char.id} isDoorOpen={canInteract} />

        {/* Nhãn khóa khi chưa đủ Level mở khóa cư dân */}
        {!isResidentUnlocked && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-2.5 py-1 rounded-full bg-[#593A47]/90 border-2 border-[#FFE066] text-[#FFE066] text-[10px] sm:text-xs font-black shadow-md whitespace-nowrap">
            🔒 Mở ở Lv.{unlockLevel}
          </div>
        )}

        <div
          className={`absolute ${signPosClass} z-30 pointer-events-auto transition-transform duration-300 group-hover:scale-105`}
        >
          <HouseWoodenSignpostSvg name={houseData.signName || char.signName || char.houseName || char.name} />
        </div>

        <div
          style={{ transitionDelay: delay }}
          className={`absolute -bottom-1.5 z-30 transition-all duration-700 ease-out flex flex-col items-center ${
            canInteract
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-0 translate-y-6 pointer-events-none'
          }`}
        >
          {/* Bong bóng trạng thái nhiệm vụ In-World trên đầu cư dân */}
          {questStatus && (
            <span
              className={`-mb-1 z-40 px-1.5 py-0.5 rounded-full border-2 border-[#593A47] shadow-[0_2px_0_#593A47] text-[10px] font-black leading-none ${
                questStatus === 'idle'
                  ? 'bg-[#FFE066] text-[#593A47] animate-bounce'
                  : questStatus === 'ready_to_claim'
                  ? 'bg-[#6EE7B7] text-[#593A47] animate-bounce'
                  : questStatus === 'active'
                  ? 'bg-[#E0F2FE] text-[#0369A1]'
                  : 'bg-[#DFF8EB] text-[#16805D]'
              }`}
            >
              {questStatus === 'idle'
                ? '!'
                : questStatus === 'ready_to_claim'
                ? '🎁'
                : questStatus === 'active'
                ? '⏳'
                : '✓'}
            </span>
          )}
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
  isNightMode = false,
  isMusicPlaying = false,
  activeAmbientSound = null,
  onToggleMusic,
  onStopAmbient,
  hasUnreadDailyComic = false,
  onOpenComicModal,
  levelInfo = null,
  unlockedBadgeCount = 0,
  totalBadgeCount = 30,
  onLockedResidentClick,
  dailyQuestsState = null,
  onClaimDailyBox,
  onCompleteDailyQuiz,
  onCollectDailyQuestItem,
  inWorldQuests = null,
  isQuestHudOpen = false,
  onToggleQuestHud,
  onCollectQuestTarget,
  isTownUnlocked,
  remainingStarsCount,
  remainingCooldownMs,
  formatDurationHMS,
  resident,
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

  // --- QUẢN LÝ VIEWPORT & CAMERA PANNING 2D GIỮ TỈ LỆ 16:9 CHO MOBILE ---
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 720
  }));

  useEffect(() => {
    const updateSize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  // Khi màn hình hẹp hơn tỉ lệ 1.35 (điện thoại dọc, tablet dọc), giữ khung thế giới đúng 16:9 và bật pan ngang
  const isPannable = viewport.w / Math.max(1, viewport.h) < 1.35;
  const worldWidth = isPannable
    ? Math.max(viewport.w, Math.round(viewport.h * MAP_ASPECT_RATIO))
    : viewport.w;
  const maxCameraX = Math.max(0, worldWidth - viewport.w);

  const calcCenteredCamX = useCallback(
    (xPct) => {
      if (!isPannable || maxCameraX <= 0) return 0;
      const avatarPx = (xPct / 100) * worldWidth;
      return Math.max(0, Math.min(maxCameraX, avatarPx - viewport.w / 2));
    },
    [isPannable, maxCameraX, worldWidth, viewport.w]
  );

  // State quản lý Hệ thống 4 Map độc lập
  const [currentMapId, setCurrentMapId] = useState('map_hope_hill');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentMapData = MAP_DICT[currentMapId] || TOWN_MAPS[0];
  const currentObstacles = getMapObstacles(currentMapId);
  const currentLandmarks = getMapLandmarks(currentMapId);
  const currentSkyHorizon = getMapSkyHorizonPoints(currentMapId);
  const currentBounds = getMapWalkBounds(currentMapId);
  const [avatarResetPos, setAvatarResetPos] = useState(currentMapData.startPos);

  // State vị trí Avatar, Camera & Lệnh Tap-to-Move
  const [currentAvatarPos, setCurrentAvatarPos] = useState(currentMapData.startPos);
  const [externalTargetPos, setExternalTargetPos] = useState(null);
  const [cameraX, setCameraX] = useState(() => calcCenteredCamX(currentMapData.startPos.x));
  const [isFollowAvatar, setIsFollowAvatar] = useState(true);
  const [isPanning, setIsPanning] = useState(false);

  // State hội thoại nói chuyện (được CozyWalkAvatar gửi lên để render cố định giữa màn hình)
  const [dialogueData, setDialogueData] = useState(null);

  // Đồng bộ camera khi đổi kích thước màn hình hoặc chế độ auto-follow
  useEffect(() => {
    if (!isPannable) {
      setCameraX(0);
      return;
    }
    if (isFollowAvatar && !isPanning) {
      setCameraX(calcCenteredCamX(currentAvatarPos.x));
    } else {
      setCameraX((prev) => Math.max(0, Math.min(maxCameraX, prev)));
    }
  }, [isPannable, isFollowAvatar, isPanning, currentAvatarPos.x, calcCenteredCamX, maxCameraX]);

  const handleSelectMap = (newMapId) => {
    if (newMapId === currentMapId || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMapId(newMapId);
      const targetMap = MAP_DICT[newMapId] || TOWN_MAPS[0];
      setAvatarResetPos(targetMap.startPos);
      setCurrentAvatarPos(targetMap.startPos);
      setIsFollowAvatar(true);
      setCameraX(calcCenteredCamX(targetMap.startPos.x));
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
        setCurrentAvatarPos(portal.targetPos);
        setIsFollowAvatar(true);
        setCameraX(calcCenteredCamX(portal.targetPos.x));
      }, 350);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700);
    },
    [isTransitioning, calcCenteredCamX]
  );

  const handlePlayerMove = useCallback(
    (pos) => {
      setCurrentAvatarPos(pos);
      if (isPannable && isFollowAvatar && !isPanning) {
        setCameraX(calcCenteredCamX(pos.x));
      }
    },
    [isPannable, isFollowAvatar, isPanning, calcCenteredCamX]
  );

  // --- POINTER EVENTS: PHÂN BIỆT 1-FINGER PAN (> 10px) VÀ TAP-TO-MOVE (< 10px) ---
  const pointerStateRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startCamX: 0,
    hasMoved: false
  });

  const isInteractiveTarget = (target) => {
    if (!target || typeof target.closest !== 'function') return true;
    return Boolean(
      target.closest('button') ||
      target.closest('nav') ||
      target.closest('.dialogue-box') ||
      target.closest('.kawaii-card') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea')
    );
  };

  const handlePointerDown = (e) => {
    if (isMovementLocked) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (isInteractiveTarget(e.target)) return;

    pointerStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startCamX: cameraX,
      hasMoved: false
    };
  };

  const handlePointerMove = (e) => {
    const ps = pointerStateRef.current;
    if (!ps.active || ps.pointerId !== e.pointerId) return;

    const dx = e.clientX - ps.startX;
    const dy = e.clientY - ps.startY;

    if (isPannable && !ps.hasMoved && Math.hypot(dx, dy) > 10) {
      ps.hasMoved = true;
      setIsPanning(true);
      setIsFollowAvatar(false);
    }

    if (ps.hasMoved && isPannable) {
      const nextCamX = Math.max(0, Math.min(maxCameraX, ps.startCamX - dx));
      setCameraX(nextCamX);
    }
  };

  const handlePointerUpOrCancel = (e) => {
    const ps = pointerStateRef.current;
    if (!ps.active || ps.pointerId !== e.pointerId) return;

    const wasPanning = ps.hasMoved;
    ps.active = false;
    ps.pointerId = null;
    ps.hasMoved = false;
    setIsPanning(false);

    // Nếu người dùng chỉ chạm / click (không kéo pan) -> Tap-to-Move
    if (!wasPanning && e.type === 'pointerup' && !isMovementLocked) {
      const container = document.getElementById('town-world-container');
      if (!container) return;
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
        setIsFollowAvatar(true);
      }
    }
  };

  const hasActiveDialogue = Boolean(dialogueData?.activeNearLandmark && !isMovementLocked);

  return (
    <div
      id="town-street-container"
      style={{
        height: '100dvh',
        minHeight: '100vh',
        maxHeight: '100dvh',
        touchAction: isPannable ? 'none' : 'manipulation'
      }}
      className={`relative w-screen overflow-hidden select-none ${
        isPannable ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
    >
      {/* ================= HUD CỐ ĐỊNH TRÊN CÙNG: TIÊU ĐỀ & BỘ ĐẾM SAO ================= */}
      <div
        style={{ top: 'max(0.4rem, env(safe-area-inset-top))' }}
        className="fixed left-1/2 -translate-x-1/2 z-[880] pointer-events-none flex flex-col items-center w-full max-w-[96vw] px-2"
      >
        <div className="landscape-header-wrap scale-[0.82] sm:scale-100 origin-top">
          <TownArchedHeaderSvg />
        </div>

        <button
          type="button"
          onClick={onClickCentralStarFountain}
          className="landscape-star-pill pointer-events-auto -mt-4 sm:-mt-1.5 px-3 py-1 rounded-full bg-[#593A47]/45 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none border border-white/25 sm:border-0 flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-sm font-black text-white cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 drop-shadow-[0_2px_4px_rgba(89,58,71,0.95)] whitespace-nowrap"
        >
          <span className="text-sm sm:text-base animate-pulse">🌟</span>
          <span className="tracking-wide">
            Sao:{' '}
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

      {/* CỤM TOP-RIGHT MENU: NHIỆM VỤ + SÁCH TRUYỆN (CHẤM ĐỎ) + ÂM THANH (SAFE-AREA XOAY NGANG) */}
      <div
        style={{
          top: 'max(0.6rem, env(safe-area-inset-top))',
          right: 'max(0.75rem, env(safe-area-inset-right))',
        }}
        className="fixed z-[895] flex items-center gap-1.5 pointer-events-auto"
      >
        {/* 1. ICON SỔ TAY NHIỆM VỤ (ĐÃ CHUYỂN SANG GÓC PHẢI) */}
        <QuestTrackerHud
          levelInfo={levelInfo}
          unlockedBadgeCount={unlockedBadgeCount}
          totalBadgeCount={totalBadgeCount}
          dailyQuestsState={dailyQuestsState}
          questsState={inWorldQuests}
          isOpen={isQuestHudOpen}
          onToggleOpen={onToggleQuestHud}
          onClaimDailyBox={onClaimDailyBox}
          onCompleteDailyQuiz={onCompleteDailyQuiz}
          currentMapId={currentMapId}
          onJumpToMap={handleSelectMap}
          isTownUnlocked={isTownUnlocked}
        />

        {/* 2. ICON SÁCH TRUYỆN TRANH MỖI NGÀY & TỦ TRUYỆN (CÓ CHẤM ĐỎ KHI CHƯA ĐỌC HÔM NAY) */}
        {isTownUnlocked && (
          <button
            type="button"
            onClick={onOpenComicModal}
            aria-label="Mở Tủ Truyện Tranh Mỗi Ngày"
            title="Truyện Tranh Mỗi Ngày & Tủ Truyện"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF4BD] hover:bg-[#FFE066] border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center justify-center text-sm sm:text-base transition active:translate-y-0.5"
          >
            <span>📖</span>
            {hasUnreadDailyComic && (
              <span
                aria-label="Có truyện mới hôm nay"
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#EF4444] border-2 border-white shadow-sm animate-pulse"
              />
            )}
          </button>
        )}

        {/* 3. NÚT TẮT WHITE NOISE (NẾU ĐANG BẬT) & NÚT BẬT/TẮT NHẠC LOFI */}
        {activeAmbientSound && (
          <button
            type="button"
            onClick={onStopAmbient}
            title="Tắt âm thanh ru ngủ của Bé Đom Đóm"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FEF9C3]/95 border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center justify-center text-sm sm:text-base active:translate-y-0.5"
          >
            {activeAmbientSound === 'rain' ? '🌧️' : activeAmbientSound === 'fireplace' ? '🔥' : '🌙'}
          </button>
        )}
        <button
          type="button"
          onClick={onToggleMusic}
          title={isMusicPlaying ? 'Tắt nhạc Lofi' : 'Bật nhạc Lofi chữa lành'}
          aria-label={isMusicPlaying ? 'Tắt nhạc Lofi' : 'Bật nhạc Lofi chữa lành'}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center justify-center text-sm sm:text-base transition active:translate-y-0.5 ${
            isMusicPlaying ? 'bg-[#FFE066] animate-pulse' : 'bg-white/95 hover:bg-[#FFF4BD]'
          }`}
        >
          {isMusicPlaying ? '🎧' : '🔇'}
        </button>
      </div>

      {/* LỚP PHỦ BẦU TRỜI ĐÊM & ĐOM ĐÓM (KHI BẬT KỸ NĂNG CHÚ TRĂNG KHUYẾT) */}
      {isNightMode && (
        <div className="fixed inset-0 z-[850] pointer-events-none select-none transition-opacity duration-700">
          <div className="absolute inset-0 bg-[#121B42]/45 mix-blend-multiply" />
          {[
            { top: '14%', left: '16%', delay: '0s' },
            { top: '22%', left: '78%', delay: '0.7s' },
            { top: '38%', left: '28%', delay: '1.3s' },
            { top: '52%', left: '84%', delay: '0.4s' },
            { top: '65%', left: '18%', delay: '1.8s' },
            { top: '44%', left: '62%', delay: '1.1s' },
          ].map((dot, idx) => (
            <span
              key={idx}
              style={{ top: dot.top, left: dot.left, animationDelay: dot.delay }}
              className="absolute w-2.5 h-2.5 rounded-full bg-[#FFF3B0] shadow-[0_0_12px_4px_rgba(255,243,176,0.9)] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* NÚT NỔI "VỀ BÉ" KHI NGƯỜI DÙNG VUỐT NGẮM PHỐ TRÊN MOBILE */}
      {isPannable && !isFollowAvatar && !hasActiveDialogue && !isMovementLocked && (
        <button
          type="button"
          onClick={() => {
            setIsFollowAvatar(true);
            setCameraX(calcCenteredCamX(currentAvatarPos.x));
          }}
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          className="fixed right-3 z-[910] px-3 py-2 rounded-full bg-[#FFE066] border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] text-xs font-black text-[#593A47] flex items-center gap-1 active:translate-y-0.5 pop-in"
        >
          <span>📍</span>
          <span>Về Bé</span>
        </button>
      )}

      {/* 4 ICON MAP GÓC TRÊN PHẢI (PC XẾP DỌC 50% / MOBILE DROPDOWN MODAL) */}
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

      {/* ================= KHUNG THẾ GIỚI 16:9 (WORLD CONTAINER) ================= */}
      <div
        id="town-world-container"
        style={{
          width: isPannable ? `${worldWidth}px` : '100%',
          minWidth: '100vw',
          height: '100dvh',
          transform: isPannable ? `translate3d(-${cameraX}px, 0, 0)` : 'none',
          transformOrigin: 'top center',
          transition: isPanning
            ? 'none'
            : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: isPannable ? 'transform' : 'auto'
        }}
        className="relative h-full"
      >
        {/* 1. PHÔNG NỀN BẢN ĐỒ 16:9 */}
        <TownHillBackgroundSvg customBgImage={currentMapData.bgImage} />

        {/* 2. CÂY CỐI & ĐỘNG VẬT COZY */}
        <TownSideScenery currentMapId={currentMapId} />

        {/* ================= NGÔI NHÀ CỦA BẠN (ĐỈNH ĐỒI HY VỌNG) ================= */}
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
                    ✨ Chạm vào nhà để đăng ký tên
                  </span>
                )}
              </button>
            </div>
          );
        })()}

        {/* ================= LỌ SAO TRUNG TÂM GIỮA MAP (XEM THẺ SAO ĐÃ MỞ HÔM NAY) ================= */}
        {currentMapId === 'map_hope_hill' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenHistoryModal?.();
            }}
            aria-label="Mở Lọ Sao để xem Thẻ Sao May Mắn Đã Mở Hôm Nay"
            title="Chạm vào Lọ Sao để xem các Thẻ Sao Đã Mở Hôm Nay"
            style={{
              left: '51.2%',
              top: '48.2%',
              zIndex: 495,
              transform: 'translate(-50%, -50%)'
            }}
            className="group absolute w-[11%] min-w-[78px] max-w-[140px] aspect-[4/5] rounded-3xl pointer-events-auto cursor-pointer focus:outline-none flex flex-col items-center justify-start"
          >
            {/* Badge số thẻ sao đã mở gắn tinh tế trên miệng lọ */}
            <span className="-mt-2 px-2 py-0.5 rounded-full bg-[#FFF3B0] group-hover:bg-[#FFE066] border-2 border-[#593A47] shadow-[0_2px_0_#593A47] text-[10px] sm:text-[11px] font-black text-[#593A47] flex items-center gap-1 whitespace-nowrap transition-transform group-hover:scale-105">
              <span>🗂️</span>
              <span>{historyCount}</span>
              <span className="hidden sm:inline">Thẻ sao</span>
            </span>
          </button>
        )}

        {/* ================= CÁC NGÔI NHÀ TRONG PHÂN KHU MAP HIỆN TẠI ================= */}
        {currentMapData.houses.filter((h) => h.type === 'character').map((house, idx) => {
          const cid = house.charId || house.id;
          const isResUnlocked = !levelInfo || levelInfo.unlockedResidentIds.has(cid);
          const unlockLv = getResidentUnlockLevel(cid);
          return (
            <HillHouseItem
              key={house.id}
              char={charMap[cid]}
              houseData={house}
              isTownUnlocked={isTownUnlocked}
              isResidentUnlocked={isResUnlocked}
              unlockLevel={unlockLv}
              questStatus={isResUnlocked ? inWorldQuests?.quests?.[cid]?.status || null : null}
              onSelectCharacter={onSelectCharacter}
              onLockedClick={onLockedResidentClick}
              delay={`${(idx % 8) * 60 + 60}ms`}
            />
          );
        })}

        {/* ================= VẬT PHẨM NHIỆM VỤ TƯƠNG TÁC TRỰC TIẾP TRÊN BẢN ĐỒ ================= */}
        {[
          ...Object.values(inWorldQuests?.quests || {})
            .filter((q) => q.status === 'active')
            .flatMap((q) =>
              q.targets
                .filter((t) => !t.collected && t.mapId === currentMapId)
                .map((t) => ({ kind: 'inworld', quest: q, target: t }))
            ),
          ...(dailyQuestsState?.quests || [])
            .filter((q) => !q.done && q.questType === 'collect' && Array.isArray(q.targets))
            .flatMap((q) =>
              q.targets
                .filter((t) => !t.collected && t.mapId === currentMapId)
                .map((t) => ({ kind: 'daily_collect', quest: q, target: t }))
            ),
        ].map(({ kind, quest, target }) => (
            <button
              key={`${kind}_${quest.id}_${target.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (kind === 'daily_collect') {
                  onCollectDailyQuestItem?.(quest.id, target.id);
                } else if (typeof onCollectQuestTarget === 'function') {
                  onCollectQuestTarget(quest.id, target.id);
                }
              }}
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                zIndex: Math.round(target.y * 10) + 25,
                transform: 'translate(-50%, -50%)'
              }}
              title={`Chạm để thu thập: ${target.label}`}
              className="absolute pointer-events-auto select-none group flex flex-col items-center focus:outline-none cursor-pointer"
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF4BD]/95 border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47,0_0_18px_rgba(255,224,102,0.95)] flex items-center justify-center text-2xl sm:text-3xl animate-bounce group-hover:scale-110 active:scale-95 transition">
                <span>{target.icon}</span>
                <span className="absolute -top-1 -right-1 text-xs animate-ping">✨</span>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-full bg-[#593A47] text-[#FFE066] border border-[#FFE066] text-[10px] font-black shadow-sm whitespace-nowrap">
                {target.label}
              </span>
            </button>
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
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-4.5 rounded-full bg-[#FFE066]/35 border-2 border-dashed border-[#593A47] animate-pulse" />
                <span className="absolute text-base group-hover:translate-y-[-2px] transition-transform">
                  {portal.icon}
                </span>
              </div>

              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#593A47] text-white border border-[#FFE066] text-[10px] sm:text-xs font-black shadow-md flex items-center gap-1 whitespace-nowrap">
                <span>{portal.arrow}</span>
                <span>{portal.label}</span>
              </div>
            </button>
          </div>
        ))}

        {/* NHÂN VẬT ĐI DẠO COZY WALK 2.5D */}
        <CozyWalkAvatar
          resident={resident}
          customSkyHorizon={currentSkyHorizon}
          customBounds={currentBounds}
          isMovementLocked={isMovementLocked}
          onSelectCharacter={onSelectCharacter}
          onOpenUserHouse={onOpenUserHouse}
          onOpenHistoryModal={onOpenHistoryModal}
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
      </div>

      {/* ================= HỘP THOẠI HỘI THOẠI CỐ ĐỊNH Ở ĐÁY MÀN HÌNH (SAFE-AREA) ================= */}
      {hasActiveDialogue && (
        <div
          style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          className="fixed left-1/2 !-translate-x-1/2 z-[960] w-full max-w-2xl px-3 sm:px-4 pointer-events-auto dialogue-box pop-in select-none"
        >
          <div className="landscape-dialogue-card relative p-3.5 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border-[3.5px] border-[#593A47] shadow-[0_8px_0_#593A47]">
            <div
              style={{ backgroundColor: dialogueData.activeNearLandmark.badgeBg }}
              className="absolute -top-4 left-5 sm:left-6 px-3 sm:px-3.5 py-1 rounded-xl border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] text-[11px] sm:text-xs font-black text-[#593A47] flex items-center gap-1.5 uppercase tracking-wide"
            >
              <span>{dialogueData.activeNearLandmark.icon}</span>
              <span>{dialogueData.activeNearLandmark.speaker}</span>
            </div>

            <div className="pt-2 pb-1">
              <p className="text-xs sm:text-base font-extrabold text-[#593A47] leading-relaxed min-h-[38px] sm:min-h-[44px]">
                &ldquo;{dialogueData.displayedText}&rdquo;
                {!dialogueData.isTypingDone && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-[#D9386A] animate-pulse" />
                )}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t-2 border-dashed border-[#F0DCE5] flex items-center justify-end sm:justify-between gap-2">
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
                className="min-h-[40px] px-4 py-1.5 rounded-xl bg-[#FFE066] hover:bg-[#FFD166] border-2 border-[#593A47] text-xs sm:text-sm font-black text-[#593A47] shadow-[0_2px_0_#593A47] active:translate-y-0.5"
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
