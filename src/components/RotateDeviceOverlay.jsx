import React, { useState, useEffect } from 'react';
import { CHARACTER_SPRITES } from '../data/characterSprites';

/**
 * MÀN HÌNH NHẮC XOAY NGANG CHO ĐIỆN THOẠI Ở CHẾ ĐỘ ĐỨNG (PORTRAIT GUARD)
 * - Tự động hiện khi thiết bị là màn hình hẹp ở chế độ dọc (width < height && width <= 768).
 * - Tự động ẩn ngay lập tức khi người dùng xoay ngang điện thoại.
 */
function checkIsMobilePortrait() {
  if (typeof window === 'undefined') return false;
  const w = window.innerWidth;
  const h = window.innerHeight;
  return w < h && w <= 768;
}

export default function RotateDeviceOverlay() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(checkIsMobilePortrait);

  useEffect(() => {
    const update = () => setIsPortraitMobile(checkIsMobilePortrait());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  if (!isPortraitMobile) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Yêu cầu xoay ngang điện thoại"
      className="fixed inset-0 z-[99999] bg-gradient-to-b from-[#FFE4EE] via-[#FFFDF9] to-[#E0F2FE] flex flex-col items-center justify-center p-6 text-center text-[#593A47] select-none"
    >
      <style>{`
        @keyframes phoneRotateHint {
          0%, 15% { transform: rotate(0deg); }
          45%, 65% { transform: rotate(-90deg); }
          90%, 100% { transform: rotate(0deg); }
        }
        .phone-rotate-anim {
          animation: phoneRotateHint 2.6s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full max-w-xs p-6 rounded-3xl bg-white/95 border-[3.5px] border-[#593A47] shadow-[0_8px_0_#593A47] space-y-4">
        <div className="flex items-center justify-center gap-4">
          <img
            src={CHARACTER_SPRITES.user_character}
            alt="Bé Sao Bông"
            className="w-16 h-16 object-contain drop-shadow"
          />
          <div className="w-14 h-14 rounded-2xl bg-[#FFF3B0] border-[2.5px] border-[#593A47] flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              className="w-9 h-9 phone-rotate-anim"
              fill="none"
            >
              <rect
                x="13"
                y="6"
                width="22"
                height="36"
                rx="4.5"
                fill="#FFFFFF"
                stroke="#593A47"
                strokeWidth="3.2"
              />
              <rect x="17" y="11" width="14" height="22" rx="1.5" fill="#BAE6FD" />
              <circle cx="24" cy="37.5" r="2" fill="#593A47" />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-[#593A47]">
            🔄 Xoay Ngang Điện Thoại Nhé!
          </h2>
          <p className="text-xs font-bold text-[#7D5867] leading-relaxed">
            <strong>Thị Trấn Sao Bông</strong> và 10 Mini-Game được thiết kế theo khung ngang 16:9. Hãy xoay ngang điện thoại để bắt đầu khám phá mượt mà nhất!
          </p>
        </div>

        <div className="px-3 py-2 rounded-2xl bg-[#DFF8EB] border-2 border-[#593A47] text-[11px] font-black text-[#16805D]">
          ✨ Màn hình sẽ tự động mở lại ngay khi bạn xoay ngang
        </div>
      </div>
    </div>
  );
}
