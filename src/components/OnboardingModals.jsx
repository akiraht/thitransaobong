import React, { useState, useEffect } from 'react';
import MoodSmileSvg from './MoodSmileSvg';
import CharacterAvatar from './CharacterAvatar';
import { MOOD_CONFIG } from '../config/constants';

// Hiệu ứng Pháo Hoa Ngôi Sao & Kim Tuyến Pastel bay lấp lánh tạo cảm giác hào hứng
function MagicalCelebrationParticles({ count = 18 }) {
  const particles = Array.from({ length: count }, (_, idx) => {
    const left = (idx * 100) / count + ((idx % 3) * 2 - 2);
    const delay = (idx % 6) * 0.18;
    const duration = 2.2 + (idx % 4) * 0.45;
    const shapes = ['✨', '⭐', '💖', '🌸', '🌟', '🎀'];
    const icon = shapes[idx % shapes.length];
    return { id: idx, left: `${Math.max(4, Math.min(94, left))}%`, delay: `${delay}s`, duration: `${duration}s`, icon };
  });

  return (
    <div className="pointer-events-none select-none fixed inset-0 z-40 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
          className="absolute -top-8 text-lg sm:text-2xl confetti-fall"
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
}

export default function OnboardingModals({
  step, // 'mood' | 'jar' | 'letter' | null
  selectedMood,
  remainingStarsCount,
  isJarShaking,
  activeLetter,
  likedWishIds,
  savedStars,
  onSelectMood,
  onProceedToJarModal,
  onDrawStarFromJarModal,
  onCloseFlowAndUnlockTown,
  onLikeLetter,
  onToggleSaveMemory,
  onCopyQuote
}) {
  const [burstKey, setBurstKey] = useState(0);
  const [isChargingJar, setIsChargingJar] = useState(false);

  useEffect(() => {
    setBurstKey((prev) => prev + 1);
    setIsChargingJar(false);
  }, [step, selectedMood]);

  if (!step) return null;

  const activeMoodCfg = selectedMood ? MOOD_CONFIG[selectedMood] : null;

  const handleJarClickWithExcitement = () => {
    if (isChargingJar) return;
    setIsChargingJar(true);
    setTimeout(() => {
      onDrawStarFromJarModal();
      setIsChargingJar(false);
    }, 650);
  };

  // BƯỚC 1: MODAL "NGÀY HÔM NAY CỦA BẠN THẾ NÀO?" (CÓ HIỆU ỨNG BÙNG NỔ ÁNH SAO THEO TÂM TRẠNG)
  if (step === 'mood') {
    return (
      <div className="fixed inset-0 z-50 bg-[#593A47]/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        {activeMoodCfg && <MagicalCelebrationParticles key={burstKey} count={16} />}

        <div
          style={{
            background: activeMoodCfg
              ? `radial-gradient(circle at 50% 0%, ${activeMoodCfg.cardBg} 0%, #FFFDF9 65%, #FFF0F6 100%)`
              : 'linear-gradient(to bottom, #FFFDF9, #FFF0F6)'
          }}
          className="kawaii-card w-full max-w-3xl p-6 sm:p-8 text-center relative modal-spring-enter my-auto overflow-hidden transition-colors duration-500"
        >


          <div className="flex justify-center mb-1 relative">
            <div className="absolute w-28 h-28 rounded-full bg-yellow-200/50 blur-xl animate-pulse" />
            <CharacterAvatar id="star" className="w-24 h-24 sm:w-28 sm:h-28 relative z-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#593A47] mb-5">
            Ngày hôm nay của bạn thế nào?
          </h2>

          {/* 5 Icon Cảm Xúc có hiệu ứng nảy 3D & Hào quang */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 w-full mb-6">
            {Object.values(MOOD_CONFIG).map((m, idx) => {
              const isSelected = selectedMood === m.id;
              const extraSpan = idx === 4 ? 'col-span-2 sm:col-span-1' : '';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMood(m.id)}
                  style={{ backgroundColor: m.cardBg }}
                  className={`mood-btn p-3.5 flex flex-col items-center gap-2 relative overflow-hidden ${extraSpan} ${
                    isSelected ? 'selected ring-4 ring-pink-300' : ''
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-2 text-xs animate-bounce">✨</span>
                  )}
                  <MoodSmileSvg mood={m.id} />
                  <div className="text-center">
                    <div className="font-extrabold text-sm text-[#593A47]">{m.shortLabel}</div>
                    <div className="text-[11px] font-bold text-[#8C6575]">{m.subLabel}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sau khi chọn cảm xúc => Hiện hộp thoại lấp lánh & Nút "Mở hộp sao" phát sáng */}
          {activeMoodCfg && (
            <div
              key={activeMoodCfg.id}
              className="p-4 sm:p-5 rounded-3xl bg-[#FFFDF7] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47] mb-5 text-left modal-spring-enter"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  style={{ backgroundColor: activeMoodCfg.badgeBg }}
                  className="w-12 h-12 rounded-2xl border-2 border-[#593A47] flex items-center justify-center text-2xl shrink-0 animate-bounce"
                >
                  {activeMoodCfg.emoji}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-[#D9386A] mb-0.5">
                    ✨ Bé Sao Bông đã nhận được tín hiệu ({activeMoodCfg.shortLabel}):
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-[#593A47] leading-relaxed">
                    {activeMoodCfg.dialogue}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeMoodCfg && (
            <div className="flex justify-center modal-spring-enter">
              <button
                type="button"
                onClick={onProceedToJarModal}
                className="kawaii-btn shimmer-btn bg-gradient-to-r from-[#FF85A9] via-[#FFB3C6] to-[#FF85A9] text-[#593A47] font-extrabold text-base sm:text-lg px-9 py-3.5 flex items-center gap-2.5 shadow-[0_6px_0_#593A47]"
              >
                <span>🌟</span>
                <span>Mở hộp sao</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // BƯỚC 2: MODAL "HỘP NGÔI SAO HY VỌNG" (HIỆU ỨNG VÒNG HÀO QUANG PHÉP THUẬT XOAY & RÚT SAO GACHA)
  if (step === 'jar') {
    return (
      <div className="fixed inset-0 z-50 bg-[#593A47]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden">
        <MagicalCelebrationParticles key={'jar-particles'} count={20} />

        <div className="kawaii-card w-full max-w-lg p-6 sm:p-8 bg-gradient-to-b from-[#FFFDF7] via-[#FFF5FA] to-[#E8F8FF] text-center relative modal-spring-enter flex flex-col items-center overflow-hidden">


          <div className="inline-flex items-center gap-2 bg-[#FFF3B0] border-[3px] border-[#593A47] rounded-full px-4 py-1.5 shadow-[0_4px_0_#593A47] mb-2 relative z-10">
            <span className="text-lg">🌟</span>
            <span className="font-extrabold text-sm sm:text-base text-[#593A47]">
              Ngôi sao trong lọ:{' '}
              <span className="text-[#D9386A] text-lg">{remainingStarsCount.toLocaleString('vi-VN')}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-[#593A47] mb-1 relative z-10">
            Chạm Vào Lọ Sao Để Triệu Hồi Phép Màu! ✨
          </h2>

          {/* LỌ SAO VỚI VÒNG HÀO QUANG PHÉP THUẬT XOAY PHÍA SAU */}
          <div className="relative my-3 flex items-center justify-center">
            {/* Vòng tia sáng phép thuật xoay tròn phía sau lọ sao */}
            <div className="pointer-events-none absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#FFE066]/45 via-[#FF85A9]/35 to-[#A8F0CB]/45 blur-xl animate-pulse" />
            <svg
              className="pointer-events-none absolute w-64 h-64 sm:w-72 sm:h-72 spin-slow opacity-65"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle cx="100" cy="100" r="86" stroke="#FFD166" strokeWidth="3" strokeDasharray="10 10" />
              <circle cx="100" cy="100" r="70" stroke="#FF85A9" strokeWidth="2.5" strokeDasharray="6 12" />
            </svg>

            {/* Hiệu ứng Ngôi Sao Bay Vút Ra Khi Bấm Mở */}
            {isChargingJar && (
              <div className="pointer-events-none absolute z-30 text-6xl star-burst-fly">
                🌟
              </div>
            )}

            <button
              type="button"
              onClick={handleJarClickWithExcitement}
              aria-label="Chạm vào Hộp Ngôi Sao Hy Vọng"
              className="group relative z-10 focus:outline-none jar-interactive cursor-pointer"
            >
              <svg
                className={`w-52 h-64 sm:w-60 sm:h-72 drop-shadow-md ${
                  isJarShaking || isChargingJar ? 'jar-gacha-shake' : ''
                }`}
                viewBox="0 0 240 280"
                fill="none"
              >
                <rect x="74" y="16" width="92" height="26" rx="10" fill="#E6A168" stroke="#593A47" strokeWidth="4.5" />
                <path d="M82 24H158" stroke="#C97E43" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
                <rect x="64" y="36" width="112" height="18" rx="9" fill="#E8F7FF" stroke="#593A47" strokeWidth="4.5" />
                <path
                  d="M68 54H172C194 54 206 74 206 100V216C206 244 184 262 156 262H84C56 262 34 244 34 216V100C34 74 46 54 68 54Z"
                  fill="#F2FBFF"
                  fillOpacity="0.9"
                  stroke="#593A47"
                  strokeWidth="5"
                />
                <path d="M50 86V196" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
                <g transform="translate(56, 195) rotate(-12)">
                  <path
                    d="M22 2L28 14L41 16L31 25L34 38L22 32L10 38L13 25L3 16L16 14L22 2Z"
                    fill="#FF85A9"
                    stroke="#593A47"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                </g>
                <g transform="translate(105, 202) rotate(8)">
                  <path
                    d="M24 2L30 15L44 17L34 27L36 41L24 34L12 41L14 27L4 17L18 15L24 2Z"
                    fill="#FFD166"
                    stroke="#593A47"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                </g>
                <g transform="translate(144, 184) rotate(-18)">
                  <path
                    d="M20 2L26 13L38 15L29 24L31 36L20 30L9 36L11 24L2 15L14 13L20 2Z"
                    fill="#80ED99"
                    stroke="#593A47"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                </g>
                <g transform="translate(72, 152) rotate(15)">
                  <path
                    d="M22 2L28 14L41 16L31 25L34 38L22 32L10 38L13 25L3 16L16 14L22 2Z"
                    fill="#C792FF"
                    stroke="#593A47"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                </g>
                <g transform="translate(96, 102) rotate(4)">
                  <path
                    d="M24 2L30 15L44 17L34 27L36 41L24 34L12 41L14 27L4 17L18 15L24 2Z"
                    fill="#FFE066"
                    stroke="#593A47"
                    strokeWidth="3.4"
                    strokeLinejoin="round"
                  />
                </g>
                <path d="M64 52H176" stroke="#FF6B9D" strokeWidth="8" strokeLinecap="round" />
                <circle cx="120" cy="52" r="7" fill="#FFD166" stroke="#593A47" strokeWidth="3.5" />
                <rect x="68" y="80" width="104" height="30" rx="12" fill="#FFFDF7" stroke="#593A47" strokeWidth="3.2" />
                <text x="120" y="100" textAnchor="middle" fill="#593A47" fontSize="13" fontWeight="800">
                  HOPE STARS ✨
                </text>
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={handleJarClickWithExcitement}
            className="kawaii-btn shimmer-btn relative z-10 mt-1 bg-gradient-to-r from-[#FFE066] via-[#FF85A9] to-[#FFE066] text-[#593A47] font-extrabold text-sm sm:text-base px-8 py-3.5 flex items-center gap-2"
          >
            <span>✨</span>
            <span>Chạm để rút Ngôi Sao May Mắn</span>
          </button>
        </div>
      </div>
    );
  }

  // BƯỚC 3: MODAL "BỨC THƯ NGÔI SAO HY VỌNG" (HIỆU ỨNG MỞ PHONG THƯ & MƯA KIM TUYẾN CHÚC MỪNG)
  if (step === 'letter' && activeLetter) {
    return (
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onCloseFlowAndUnlockTown();
        }}
        className="fixed inset-0 z-50 bg-[#593A47]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      >
        <MagicalCelebrationParticles key={'letter-particles'} count={26} />

        <div className="letter-paper w-full max-w-lg p-6 sm:p-8 relative letter-unfold-enter my-auto">
          {/* Tem Sáp Ngôi Sao Phát Sáng Trên Đỉnh Bức Thư */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FFE066] border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47] font-extrabold text-xs sm:text-sm text-[#593A47] flex items-center gap-1.5 whitespace-nowrap">
            <span>🌟</span>
            <span>Ngôi Sao May Mắn Đã Mở!</span>
          </div>

          <button
            type="button"
            onClick={onCloseFlowAndUnlockTown}
            aria-label="Đóng bức thư"
            className="kawaii-btn w-10 h-10 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-extrabold text-lg flex items-center justify-center absolute -top-4 -right-3"
          >
            ✕
          </button>

          <div className="flex items-center justify-between gap-2 pb-4 mb-5 mt-2 border-b-[2.5px] border-[#593A47]">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF3B0] border-[2.5px] border-[#593A47] flex items-center justify-center text-2xl shadow-[0_3px_0_#593A47] animate-bounce">
                💌
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#D9386A]">
                  Bức Thư Ngôi Sao Hy Vọng
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#8C6575]">
                  Ngôi sao #{activeLetter.starNumber || 2000} • Tâm trạng:{' '}
                  {(MOOD_CONFIG[activeLetter.mood] || MOOD_CONFIG.happy).shortLabel}{' '}
                  {(MOOD_CONFIG[activeLetter.mood] || MOOD_CONFIG.happy).emoji}
                </div>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-[#FFE4EE] border-2 border-dashed border-[#593A47] text-[11px] font-extrabold text-[#593A47]">
              {activeLetter.fromSheet ? '✨ Lời chúc từ Bầu Trời' : '✨ Ngôi Sao Hy Vọng'}
            </div>
          </div>

          <div className="text-sm sm:text-base font-extrabold text-[#593A47] mb-3">
            Gửi bạn nhỏ đáng yêu của ngày hôm nay,
          </div>

          <div className="my-4 py-5 px-5 rounded-2xl bg-white/95 border-[2.5px] border-[#593A47] shadow-inner relative overflow-hidden">
            <blockquote className="text-base sm:text-lg font-extrabold text-[#593A47] leading-relaxed text-center relative z-10">
              &ldquo;{activeLetter.text}&rdquo;
            </blockquote>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base font-extrabold text-[#7D5867] mt-5 pt-3 border-t-2 border-dashed border-[#E5C5D2]">
            <span>🕒 Mở lúc {activeLetter.timeStr} hôm nay</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#593A47]">Người gửi: {activeLetter.sender || 'Người lạ'}</span>
              {activeLetter.authorTitle && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFF3B0] border border-[#593A47] text-[11px] text-[#593A47]">
                  {activeLetter.authorTitle}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onLikeLetter(activeLetter)}
                className={`kawaii-btn font-extrabold text-sm sm:text-base px-3.5 py-2 flex items-center gap-1.5 ${
                  (likedWishIds || []).includes(activeLetter.id)
                    ? 'bg-[#FFE2EC] text-[#D9386A]'
                    : 'bg-white hover:bg-[#FFE4EE] text-[#593A47]'
                }`}
              >
                <span>💖</span>
                <span>Thả tim ({Number(activeLetter.likes) || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSaveMemory(activeLetter)}
                className="kawaii-btn bg-[#FFF4BD] hover:bg-[#FFE885] text-[#593A47] font-extrabold text-sm sm:text-base px-3.5 py-2"
              >
                {(savedStars || []).some((st) => st.id === activeLetter.id)
                  ? '🏺 Đã lưu Ký Ức'
                  : '🏺 Lưu vào Ký Ức'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCopyQuote}
                className="kawaii-btn bg-[#E2F9F0] hover:bg-[#C7F2E0] text-[#593A47] font-extrabold text-sm sm:text-base px-3.5 py-2"
              >
                📋 Sao chép lời chúc
              </button>
              <button
                type="button"
                onClick={onCloseFlowAndUnlockTown}
                className="kawaii-btn shimmer-btn bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-extrabold text-sm sm:text-base px-5 py-2"
              >
                Cất vào tim 💖
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
