import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TOWN_CHARACTERS, CHARACTER_SPRITES } from '../data/characterSprites';
import { getTownObstacles, getHillLandmarks } from '../data/townHousesConfig';

// Danh sách toạ độ tương tác và hộp va chạm vật lý
export const HILL_LANDMARKS = getHillLandmarks();
export const TOWN_OBSTACLES = getTownObstacles();

// BẢNG TOẠ ĐỘ CÁC ĐIỂM CHỐT RANH GIỚI BẦU TRỜI & SƯỜN ĐỒI CỎ MỚI (UỐN CONG TỰ NHIÊN)
export const SKY_HORIZON_POINTS = [
  { x: 0.0, y: 32.0 },
  { x: 8.0, y: 28.0 },
  { x: 20.0, y: 24.0 },
  { x: 35.0, y: 18.0 },
  { x: 45.0, y: 14.0 },
  { x: 50.0, y: 12.8 },
  { x: 55.0, y: 14.0 },
  { x: 65.0, y: 18.0 },
  { x: 80.0, y: 24.0 },
  { x: 92.0, y: 28.0 },
  { x: 100.0, y: 32.0 }
];

export const calcHorizonY = (points, x) => {
  const pts = points && points.length > 0 ? points : SKY_HORIZON_POINTS;
  if (x <= pts[0].x) return pts[0].y;
  const lastIdx = pts.length - 1;
  if (x >= pts[lastIdx].x) return pts[lastIdx].y;

  for (let i = 0; i < lastIdx; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    if (x >= p1.x && x <= p2.x) {
      const dx = p2.x - p1.x;
      const ratio = dx !== 0 ? (x - p1.x) / dx : 0;
      return p1.y + ratio * (p2.y - p1.y);
    }
  }
  return pts[lastIdx].y;
};

export const getSkyHorizonY = (x) => calcHorizonY(SKY_HORIZON_POINTS, x);

export default function CozyWalkAvatar({
  customSkyHorizon,
  customBounds,
  resident,
  isMovementLocked = false,
  onSelectCharacter,
  onOpenUserHouse,
  onOpenHistoryModal,
  onClickCentralStarFountain,
  isTownUnlocked = true,
  onPlayerMove,
  externalTargetPos,
  onDialogueChange,
  renderDialogueDirectly = false,
  customObstacles,
  customLandmarks,
  resetPosition,
  portals,
  onTriggerPortal
}) {
  const activeObstacles = customObstacles || TOWN_OBSTACLES;
  const activeLandmarks = customLandmarks || HILL_LANDMARKS;

  // Toạ độ thực tế của người chơi (Tỉ lệ % trên sườn đồi)
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 72 });
  const [isWalking, setIsWalking] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [activeNearLandmark, setActiveNearLandmark] = useState(null);

  // Hiệu ứng Typewriter thoại nói chuyện
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Hiệu ứng Click Ripple (Đốm sao lấp lánh khi click chuột trái di chuyển)
  const [clickRipple, setClickRipple] = useState(null);

  // Modal Hướng Dẫn Điều Khiển Lần Đầu (Chỉ hiện 1 lần duy nhất ở giữa sau khi bốc sao)
  const [showWalkGuideModal, setShowWalkGuideModal] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !localStorage.getItem('tts_has_seen_walk_guide');
    } catch {
      return false;
    }
  });

  const handleCloseGuideModal = () => {
    setShowWalkGuideModal(false);
    try {
      localStorage.setItem('tts_has_seen_walk_guide', 'true');
    } catch {}
  };

  // Cooldown bảo vệ cổng dịch chuyển (ngăn chuyển đổi map liên tục)
  const portalCooldownRef = useRef(Date.now() + 2500);
  const stuckFrameCountRef = useRef(0);

  // Đặt lại toạ độ Avatar khi chuyển Map
  useEffect(() => {
    if (resetPosition && typeof resetPosition.x === 'number') {
      setPlayerPos({ x: resetPosition.x, y: resetPosition.y });
      targetClickPosRef.current = null;
      stuckFrameCountRef.current = 0;
      setIsWalking(false);
      portalCooldownRef.current = Date.now() + 2500; // Bảo vệ 2.5s không trigger portal lặp lại
    }
  }, [resetPosition]);

  // Kiểm tra khi nhân vật bước chân vào Cổng Dịch Chuyển (Portal)
  useEffect(() => {
    if (!portals || portals.length === 0 || isMovementLocked) return;
    if (Date.now() < portalCooldownRef.current) return; // Đang trong thời gian cooldown

    for (const p of portals) {
      const dist = Math.hypot(playerPos.x - p.x, (playerPos.y - p.y) * 1.25);
      if (dist <= (p.radius || 4.8)) {
        portalCooldownRef.current = Date.now() + 3500;
        if (typeof onTriggerPortal === 'function') {
          onTriggerPortal(p);
        }
        break;
      }
    }
  }, [playerPos, portals, isMovementLocked, onTriggerPortal]);

  // Nhận lệnh Click to Move từ bên ngoài
  useEffect(() => {
    if (externalTargetPos && !isMovementLocked) {
      targetClickPosRef.current = { x: externalTargetPos.x, y: externalTargetPos.y };
      stuckFrameCountRef.current = 0;
      setIsWalking(true);
      setClickRipple({ x: externalTargetPos.x, y: externalTargetPos.y, id: Date.now() });
      setTimeout(() => setClickRipple(null), 650);
    }
  }, [externalTargetPos, isMovementLocked]);

  // Throttle thông báo toạ độ lên cha (100ms) để không re-render Scene 60 FPS
  const lastReportTimeRef = useRef(0);
  useEffect(() => {
    const now = performance.now();
    if (now - lastReportTimeRef.current > 100) {
      lastReportTimeRef.current = now;
      if (onPlayerMove) {
        onPlayerMove(playerPos);
      }
    }
  }, [playerPos, onPlayerMove]);

  // Ref lưu trạng thái game loop di chuyển liên tục
  const posRef = useRef(playerPos);
  posRef.current = playerPos;

  // Lựa chọn Avatar của người chơi
  const activeUserAvatar = useMemo(() => {
    const currentHour = new Date().getHours();
    const isNightSleepHours = currentHour >= 22 || currentHour < 4;
    if (isNightSleepHours && CHARACTER_SPRITES.user_sleepy) {
      return {
        key: 'user_sleepy',
        src: CHARACTER_SPRITES.user_sleepy,
        name: 'Bé Ngái Ngủ (22h - 4h)',
        isNightAuto: true
      };
    }
    const choiceKey = resident?.avatarChoice || 'user_character';
    return {
      key: choiceKey,
      src: CHARACTER_SPRITES[choiceKey] || CHARACTER_SPRITES.user_character,
      name:
        choiceKey === 'user_hardworking'
          ? 'Bé Chăm Chỉ'
          : choiceKey === 'user_happy'
          ? 'Bé Vui Tươi'
          : 'Bé Sao Bông',
      isNightAuto: false
    };
  }, [resident?.avatarChoice]);

  const keysDownRef = useRef(new Set());
  const targetClickPosRef = useRef(null);
  const animLoopRef = useRef(null);
  const typewriterTimerRef = useRef(null);

  // Phối cảnh 2.5D
  const currentScale = Number((0.72 + (playerPos.y / 100) * 0.45).toFixed(3));

  const clampPos = useCallback((x, y) => {
    const minX = customBounds?.minX || 3.0;
    const maxX = customBounds?.maxX || 97.0;
    const maxY = customBounds?.maxY || 93.0;
    const clampedX = Math.max(minX, Math.min(maxX, x));
    const skyMinY = calcHorizonY(customSkyHorizon, clampedX);
    return {
      x: clampedX,
      y: Math.max(skyMinY, Math.min(maxY, y))
    };
  }, [customSkyHorizon, customBounds]);

  const isPositionBlocked = useCallback((x, y) => {
    if (y - 1.2 < calcHorizonY(customSkyHorizon, x)) {
      return true;
    }
    const padX = 2.2;
    const padY = 1.4;
    for (const obs of activeObstacles) {
      if (
        x + padX >= obs.xMin &&
        x - padX <= obs.xMax &&
        y + padY >= obs.yMin &&
        y - padY <= obs.yMax
      ) {
        return true;
      }
    }
    return false;
  }, [activeObstacles, customSkyHorizon]);

  // Trượt dọc mép tường (Wall Sliding)
  const stepWithCollision = useCallback((curX, curY, nextX, nextY) => {
    let resolvedX = curX;
    if (!isPositionBlocked(nextX, curY)) {
      resolvedX = nextX;
    }
    let resolvedY = curY;
    if (!isPositionBlocked(resolvedX, nextY)) {
      resolvedY = nextY;
    }
    return clampPos(resolvedX, resolvedY);
  }, [clampPos, isPositionBlocked]);

  // Dừng di chuyển khi mở modal
  useEffect(() => {
    if (isMovementLocked) {
      keysDownRef.current.clear();
      targetClickPosRef.current = null;
      stuckFrameCountRef.current = 0;
      setIsWalking(false);
    }
  }, [isMovementLocked]);

  // Vòng lặp Game Loop 60 FPS
  useEffect(() => {
    let lastTime = performance.now();

    const gameLoop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isMovementLocked) {
        setIsWalking(false);
        animLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      let vx = 0;
      let vy = 0;
      const speed = 36.0; // Tốc độ di chuyển nhanh nhẹn, tự nhiên (36% / giây)

      const keys = keysDownRef.current;
      if (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('w')) vy -= 1;
      if (keys.has('ArrowDown') || keys.has('KeyS') || keys.has('s')) vy += 1;
      if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) {
        vx -= 1;
        setFacingRight(false);
      }
      if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) {
        vx += 1;
        setFacingRight(true);
      }

      if (vx !== 0 && vy !== 0) {
        vx *= 0.7071;
        vy *= 0.7071;
      }

      let isMovingNow = false;

      if (vx !== 0 || vy !== 0) {
        targetClickPosRef.current = null;
        stuckFrameCountRef.current = 0;
        isMovingNow = true;

        const nextX = posRef.current.x + vx * speed * dt;
        const nextY = posRef.current.y + vy * speed * dt;
        const resolved = stepWithCollision(posRef.current.x, posRef.current.y, nextX, nextY);
        setPlayerPos(resolved);
      } else if (targetClickPosRef.current) {
        const target = targetClickPosRef.current;
        const dx = target.x - posRef.current.x;
        const dy = target.y - posRef.current.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.6) {
          isMovingNow = true;
          const moveStep = Math.min(speed * dt, dist);
          const nextX = posRef.current.x + (dx / dist) * moveStep;
          const nextY = posRef.current.y + (dy / dist) * moveStep;
          const resolved = stepWithCollision(posRef.current.x, posRef.current.y, nextX, nextY);

          // Kiểm tra xem có bị kẹt hoàn toàn không
          const deltaMove = Math.hypot(resolved.x - posRef.current.x, resolved.y - posRef.current.y);
          if (deltaMove < 0.02) {
            stuckFrameCountRef.current = (stuckFrameCountRef.current || 0) + 1;
            // Chỉ huỷ target khi kẹt liên tiếp hơn 15 frames (~250ms)
            if (stuckFrameCountRef.current > 15) {
              targetClickPosRef.current = null;
              stuckFrameCountRef.current = 0;
              isMovingNow = false;
            }
          } else {
            stuckFrameCountRef.current = 0;
            setPlayerPos(resolved);
            if (dx > 0.15) setFacingRight(true);
            else if (dx < -0.15) setFacingRight(false);
          }
        } else {
          targetClickPosRef.current = null;
          stuckFrameCountRef.current = 0;
          isMovingNow = false;
        }
      }

      setIsWalking(isMovingNow);
      animLoopRef.current = requestAnimationFrame(gameLoop);
    };

    animLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animLoopRef.current) cancelAnimationFrame(animLoopRef.current);
    };
  }, [isMovementLocked, stepWithCollision]);

  // Kiểm tra địa danh gần nhất
  useEffect(() => {
    let closest = null;
    let minDistance = Infinity;

    for (const lm of activeLandmarks) {
      const dx = playerPos.x - lm.x;
      const dy = (playerPos.y - lm.y) * 1.25;
      const dist = Math.hypot(dx, dy);

      if (dist <= lm.radius && dist < minDistance) {
        minDistance = dist;
        closest = lm;
      }
    }

    if (closest?.id !== activeNearLandmark?.id) {
      setActiveNearLandmark(closest);
    }
  }, [playerPos, activeLandmarks, activeNearLandmark]);

  // Typewriter hội thoại (Đảm bảo luôn có nội dung lời thoại không bao giờ rỗng)
  useEffect(() => {
    if (!activeNearLandmark) {
      setDisplayedText('');
      setIsTypingDone(false);
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      return;
    }

    const fullText =
      activeNearLandmark.dialogue ||
      (activeNearLandmark.speaker
        ? `Chào bạn nhỏ! Mình là ${activeNearLandmark.speaker}, rất vui được gặp bạn ở Thị Trấn Sao Bông nhé~`
        : 'Chào bạn nhỏ ghé thăm Thị Trấn Sao Bông~');

    setDisplayedText('');
    setIsTypingDone(false);

    let charIndex = 0;
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);

    typewriterTimerRef.current = setInterval(() => {
      charIndex += 1;
      setDisplayedText(fullText.slice(0, charIndex));

      if (charIndex >= fullText.length) {
        clearInterval(typewriterTimerRef.current);
        setIsTypingDone(true);
      }
    }, 20);

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, [activeNearLandmark?.id]);

  // Kích hoạt tương tác
  const handleTriggerLandmark = useCallback(() => {
    if (!activeNearLandmark) return;

    if (activeNearLandmark.type === 'character') {
      const charMeta = TOWN_CHARACTERS.find(
        (c) => c.id === activeNearLandmark.charId || c.id === activeNearLandmark.id
      );
      if (charMeta && typeof onSelectCharacter === 'function') {
        onSelectCharacter(charMeta);
      }
    } else if (activeNearLandmark.type === 'user') {
      if (typeof onOpenUserHouse === 'function') onOpenUserHouse();
    } else if (activeNearLandmark.type === 'fountain' || activeNearLandmark.id === 'wishing_star_jar') {
      if (typeof onOpenHistoryModal === 'function') onOpenHistoryModal();
      else if (typeof onClickCentralStarFountain === 'function') onClickCentralStarFountain();
    }
  }, [activeNearLandmark, onSelectCharacter, onOpenUserHouse, onOpenHistoryModal, onClickCentralStarFountain]);

  // Báo dữ liệu hội thoại lên cha
  useEffect(() => {
    if (onDialogueChange) {
      onDialogueChange({
        activeNearLandmark,
        displayedText,
        isTypingDone,
        handleTriggerLandmark
      });
    }
  }, [activeNearLandmark, displayedText, isTypingDone, handleTriggerLandmark, onDialogueChange]);

  // Bắt phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isMovementLocked) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        keysDownRef.current.add(e.key);
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (activeNearLandmark) {
          e.preventDefault();
          handleTriggerLandmark();
        }
      }
    };

    const handleKeyUp = (e) => {
      keysDownRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMovementLocked, activeNearLandmark, handleTriggerLandmark]);

  const residentDisplayName = resident?.nickname ? resident.nickname : 'Bạn Nhỏ Đáng Yêu';
  const isTouchDevice =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)')?.matches || navigator.maxTouchPoints > 0);

  return (
    <>
      {/* ================= HIỆU ỨNG CLICK RIPPLE (ĐỐM SAO CHỈ ĐÍCH ĐẾN) ================= */}
      {clickRipple && (
        <div
          style={{
            left: `${clickRipple.x}%`,
            top: `${clickRipple.y}%`,
            zIndex: Math.round(clickRipple.y * 10)
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-8 h-8 rounded-full border-2 border-[#FFE066] bg-[#FFE066]/30 animate-ping" />
            <span className="absolute text-sm">✨</span>
          </div>
        </div>
      )}

      {/* ================= 1. HỘP THOẠI HỘI THOẠI (NẾU ĐƯỢC CHỈ ĐỊNH RENDER TRỰC TIẾP) ================= */}
      {renderDialogueDirectly && activeNearLandmark && !isMovementLocked && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 !-translate-x-1/2 z-[930] w-full max-w-xl px-4 pointer-events-auto dialogue-box pop-in select-none">
          <div className="relative p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border-[3.5px] border-[#593A47] shadow-[0_8px_0_#593A47]">
            <div
              style={{ backgroundColor: activeNearLandmark.badgeBg || '#FFF4BD' }}
              className="absolute -top-4 left-6 px-3.5 py-1 rounded-xl border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] text-xs font-black text-[#593A47] flex items-center gap-1.5 uppercase tracking-wide"
            >
              <span>{activeNearLandmark.icon || '⭐'}</span>
              <span>{activeNearLandmark.speaker}</span>
            </div>

            <div className="pt-2 pb-1">
              <p className="text-sm sm:text-base font-extrabold text-[#593A47] leading-relaxed min-h-[44px]">
                &ldquo;{displayedText}&rdquo;
                {!isTypingDone && <span className="inline-block w-1.5 h-4 ml-1 bg-[#D9386A] animate-pulse" />}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t-2 border-dashed border-[#F0DCE5] flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#8C6575] hidden sm:inline">
                * Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-[#593A47] font-mono text-[10px]">Space</kbd> để trò chuyện với {activeNearLandmark.speaker}
              </span>
              <button
                type="button"
                onClick={handleTriggerLandmark}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFE066] hover:bg-[#FFD166] border-2 border-[#593A47] text-xs font-black text-[#593A47] shadow-[0_2px_0_#593A47] active:translate-y-0.5"
              >
                {activeNearLandmark.actionText || 'Trò chuyện ✨'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. NHÂN VẬT ĐẠI DIỆN 2.5D (PLAYER SPRITE) ================= */}
      <div
        style={{
          left: `${playerPos.x}%`,
          top: `${playerPos.y}%`,
          zIndex: Math.round(playerPos.y * 10) + 1,
          transform: `translate(-50%, -85%) scale(${currentScale})`,
          transformOrigin: 'bottom center'
          // Đã bỏ transition: 'transform 0.08s' để chuyển động 60 FPS phản hồi tức thời, không giật lag
        }}
        className="absolute pointer-events-auto flex flex-col items-center select-none cursor-pointer"
        onClick={handleTriggerLandmark}
        title={`${residentDisplayName} — Chạm hoặc dùng phím để đi dạo khắp đồi!`}
      >
        {/* Bảng Tên Gỗ Cư Dân gắn trên đầu */}
        <div className="mb-1 px-2.5 py-0.5 rounded-full bg-[#FFE57F] border-2 border-[#593A47] shadow-[0_2px_0_#593A47] text-[10px] sm:text-[11px] font-extrabold text-[#593A47] flex items-center gap-1 whitespace-nowrap">
          <span>🌟</span>
          <span>{residentDisplayName}</span>
        </div>

        {/* Sprite Bạn Nhỏ: Nhún nhẹ tự nhiên khi bước đi */}
        <div
          style={{
            transform: `scaleX(${facingRight ? 1 : -1})`,
            transition: 'transform 0.12s ease'
          }}
          className={`relative flex items-center justify-center ${
            isWalking ? 'translate-y-[-2px]' : ''
          }`}
        >
          {activeUserAvatar.src ? (
            <img
              src={activeUserAvatar.src}
              alt={activeUserAvatar.name || residentDisplayName}
              draggable={false}
              className="w-14 h-16 sm:w-16 sm:h-20 object-contain select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.35)]"
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              className="w-14 h-14 sm:w-16 sm:h-16 overflow-visible filter drop-shadow-[0_4px_6px_rgba(89,58,71,0.35)]"
            >
              <ellipse cx="50" cy="56" rx="34" ry="30" fill="#FFF4BD" stroke="#593A47" strokeWidth="3.5" />
              <path
                d="M50 14 L56 28 L70 30 L59 40 L62 54 L50 46 L38 54 L41 40 L30 30 L44 28 Z"
                fill="#FFE066"
                stroke="#593A47"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              <circle cx="50" cy="34" r="4" fill="#FF85A9" stroke="#593A47" strokeWidth="1.8" />
              <ellipse cx="40" cy="52" rx="4" ry="5.5" fill="#593A47" />
              <circle cx="41.5" cy="50" r="1.8" fill="#FFFFFF" />
              <ellipse cx="60" cy="52" rx="4" ry="5.5" fill="#593A47" />
              <circle cx="61.5" cy="50" r="1.8" fill="#FFFFFF" />
              <ellipse cx="33" cy="58" rx="5" ry="3" fill="#FF85A9" opacity="0.65" />
              <ellipse cx="67" cy="58" rx="5" ry="3" fill="#FF85A9" opacity="0.65" />
              <path d="M46 59 Q50 63 54 59" fill="none" stroke="#593A47" strokeWidth="2.4" strokeLinecap="round" />
              <rect x="34" y="80" width="10" height="11" rx="5" fill="#FFD166" stroke="#593A47" strokeWidth="2.8" />
              <rect x="56" y="80" width="10" height="11" rx="5" fill="#FFD166" stroke="#593A47" strokeWidth="2.8" />
              <ellipse cx="20" cy="56" rx="6" ry="6" fill="#FFF4BD" stroke="#593A47" strokeWidth="2.8" />
              <ellipse cx="80" cy="56" rx="6" ry="6" fill="#FFF4BD" stroke="#593A47" strokeWidth="2.8" />
            </svg>
          )}
        </div>

        {/* Đổ bóng mặt cỏ dưới chân avatar */}
        <div className="w-12 h-3.5 -mt-1 rounded-full bg-[#593A47]/20 blur-[1px]" />
      </div>

      {/* ================= 3. MODAL HƯỚNG DẪN ĐI DẠO LẦN ĐẦU Ở GIỮA MÀN HÌNH ================= */}
      {/* Chỉ xuất hiện lần đầu khi vào web (sau khi chọn xong hũ sao) và không hiện lại với thiết bị đã mở */}
      {isTownUnlocked && showWalkGuideModal && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-[#593A47]/45 backdrop-blur-sm select-none pop-in">
          <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white/95 border-[3.5px] border-[#593A47] shadow-[0_10px_0_#593A47] flex flex-col items-center text-center">
            {/* Nút đóng góc phải */}
            <button
              type="button"
              onClick={handleCloseGuideModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-black text-xs flex items-center justify-center border-2 border-[#593A47] shadow-[0_2px_0_#593A47]"
              title="Đóng hướng dẫn"
            >
              ✕
            </button>

            {/* Icon & Tiêu đề */}
            <div className="w-16 h-16 rounded-2xl bg-[#FFF3B0] border-2 border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center justify-center text-3xl mb-3 animate-bounce">
              🚶
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[#593A47] tracking-tight">
              Hướng Dẫn Đi Dạo Thị Trấn
            </h3>
            <p className="text-xs sm:text-sm font-bold text-[#8C6575] mt-1 mb-4">
              Chào bạn nhỏ! Dưới đây là cách khám phá thế giới 2.5D:
            </p>

            {/* Các mẹo điều khiển (Phân tách riêng cho Điện thoại cảm ứng & PC) */}
            <div className="w-full flex flex-col gap-2.5 text-left mb-5">
              <div className="p-3 rounded-2xl bg-[#FFF9E6] border-2 border-[#593A47]/30 flex items-start gap-3">
                <span className="text-xl">{isTouchDevice ? '👆' : '🖱️'}</span>
                <div>
                  <h4 className="text-xs font-black text-[#593A47]">
                    {isTouchDevice ? 'Chạm Lên Bãi Cỏ Để Bước Tới' : 'Click Chuột Trái / Chạm Màn Hình'}
                  </h4>
                  <p className="text-[11px] font-semibold text-[#8C6575]">
                    {isTouchDevice
                      ? 'Chạm vào bất kỳ điểm nào trên bãi cỏ hoặc con đường để bé tự bước tới đó.'
                      : 'Click vào bất kỳ điểm nào trên bãi cỏ hoặc con đường để bé tự bước tới đó.'}
                  </p>
                </div>
              </div>

              {isTouchDevice ? (
                <div className="p-3 rounded-2xl bg-[#FFF0F5] border-2 border-[#593A47]/30 flex items-start gap-3">
                  <span className="text-xl">👈</span>
                  <div>
                    <h4 className="text-xs font-black text-[#593A47]">Vuốt Ngang 1 Ngón Để Ngắm Phố</h4>
                    <p className="text-[11px] font-semibold text-[#8C6575]">
                      Vuốt nhẹ sang trái hoặc phải để ngắm toàn bộ các ngôi nhà trên bản đồ.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#FFF0F5] border-2 border-[#593A47]/30 flex items-start gap-3">
                  <span className="text-xl">⌨️</span>
                  <div>
                    <h4 className="text-xs font-black text-[#593A47]">Phím W - A - S - D hoặc Mũi Tên</h4>
                    <p className="text-[11px] font-semibold text-[#8C6575]">
                      Dùng bàn phím để di chuyển tự do khắp sườn đồi, leo dốc và ngắm cảnh.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-[#EDF7ED] border-2 border-[#593A47]/30 flex items-start gap-3">
                <span className="text-xl">💬</span>
                <div>
                  <h4 className="text-xs font-black text-[#593A47]">Trò Chuyện Cùng Cư Dân</h4>
                  <p className="text-[11px] font-semibold text-[#8C6575]">
                    {isTouchDevice ? (
                      'Chạm trực tiếp vào ngôi nhà hoặc bước lại gần rồi bấm nút trò chuyện.'
                    ) : (
                      <>
                        Bước lại gần các ngôi nhà và nhấn phím{' '}
                        <kbd className="px-1 py-0.5 rounded bg-white border border-[#593A47] text-[10px]">Space</kbd> hoặc nút trò chuyện.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F0F4FF] border-2 border-[#593A47]/30 flex items-start gap-3">
                <span className="text-xl">🌀</span>
                <div>
                  <h4 className="text-xs font-black text-[#593A47]">Cổng Dịch Chuyển &amp; Đổi Bản Đồ</h4>
                  <p className="text-[11px] font-semibold text-[#8C6575]">
                    Bước vào vòng tròn lấp lánh hoặc chọn nhanh 4 khu phố ở thanh điều hướng phía dưới.
                  </p>
                </div>
              </div>
            </div>

            {/* Nút Bắt Đầu Dạo Chơi */}
            <button
              type="button"
              onClick={handleCloseGuideModal}
              className="kawaii-btn w-full py-3 rounded-2xl bg-[#FFE066] hover:bg-[#FFD166] border-3 border-[#593A47] text-sm sm:text-base font-black text-[#593A47] shadow-[0_5px_0_#593A47] active:translate-y-1"
            >
              Bắt Đầu Dạo Chơi Ngay ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
}
