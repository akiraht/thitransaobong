import React from 'react';
import { TOWN_BG_WIDE_URI, TOWN_BG_MOBILE_URI } from '../data/houseSprites';

/**
 * Phông nền Thị Trấn Sao Bông chuẩn theo bản thiết kế mẫu + 4 khung cảnh theo thời gian thực:
 * - 'morning'   (05:00 - 10:59): Trời sáng trong trẻo, cầu vồng tươi tắn, nắng sớm dịu nhẹ.
 * - 'afternoon' (11:00 - 16:59): Trời buổi trưa chiều vàng ấm áp, mặt trời rực rỡ chiếu tia nắng vàng.
 * - 'evening'   (17:00 - 20:59): Trời tối hoàng hôn tím hồng lãng mạn, sao hôm & trăng non bắt đầu lên.
 * - 'night'     (21:00 - 04:59): Trời khuya đầy sao lấp lánh, sao băng bay qua và đom đóm bay trên đồng cỏ.
 */
export default function TownHillBackgroundSvg({ timePeriod = 'morning', isNightMode = false }) {
  const effectivePeriod = isNightMode ? 'night' : timePeriod || 'morning';

  // Hiệu ứng filter màu lên ảnh nền gốc để giữ nguyên 100% nét vẽ cầu vồng, đường gạch, hoa nấm nhưng đổi sắc độ theo khung giờ
  const filterByPeriod = {
    morning: 'brightness(1.02) saturate(1.05)',
    afternoon: 'sepia(0.18) saturate(1.22) brightness(1.01) contrast(1.02)',
    evening: 'hue-rotate(-14deg) saturate(1.12) brightness(0.84) contrast(1.05)',
    night: 'hue-rotate(-25deg) saturate(0.88) brightness(0.62) contrast(1.12)'
  };

  const imgFilter = filterByPeriod[effectivePeriod] || filterByPeriod.morning;

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
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8E7A2" />
            <stop offset="100%" stopColor="#F5DC84" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="768" height="1376" fill="url(#skyGrad)" />
        <image
          href={TOWN_BG_MOBILE_URI}
          x="0"
          y="0"
          width="768"
          height="1376"
          preserveAspectRatio="xMidYMid slice"
          style={{ filter: imgFilter, transition: 'filter 0.8s ease' }}
        />
      </svg>

      {/* Bản PC/Desktop (>= 768px): Khung Widescreen 16:9 (1920x1080) lấp đầy toàn màn hình không bị trống 2 bên và không méo hình */}
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="hidden md:block w-full h-full"
      >
        <rect x="0" y="0" width="1920" height="1080" fill="url(#skyGrad)" />
        <image
          href={TOWN_BG_WIDE_URI}
          x="0"
          y="0"
          width="1920"
          height="1080"
          preserveAspectRatio="xMidYMid slice"
          style={{ filter: imgFilter, transition: 'filter 0.8s ease' }}
        />
      </svg>

      {/* ================= LỚP KHÍ QUYỂN & BẦU TRỜI THEO 4 KHUNG GIỜ THỰC ================= */}

      {/* 1. BUỔI SÁNG (TRỜI SÁNG): Nắng sớm trong veo & chim/bướm bay */}
      {effectivePeriod === 'morning' && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(circle at 18% 12%, rgba(255, 250, 210, 0.38) 0%, transparent 45%)'
          }}
        >
          {/* Mặt trời buổi sáng dịu nhẹ góc trái trên */}
          <div className="absolute left-[8%] top-[5%] w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFF5B8]/80 blur-md animate-pulse" />
        </div>
      )}

      {/* 2. BUỔI TRƯA CHIỀU (TRỜI BUỔI TRƯA CHIỀU): Nắng vàng cam ấm áp rực rỡ */}
      {effectivePeriod === 'afternoon' && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 185, 92, 0.34) 0%, rgba(255, 214, 138, 0.22) 32%, rgba(255, 200, 120, 0.12) 100%)'
          }}
        >
          {/* Mặt trời trưa chiều toả nắng vàng ấm */}
          <div className="absolute right-[14%] top-[2vh] md:top-[4%] flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#FFB703]/30 blur-xl animate-pulse" />
            <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-22 sm:h-22 absolute spin-slow">
              <circle cx="50" cy="50" r="24" fill="#FFD166" stroke="#593A47" strokeWidth="3" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={deg}
                  x1="50"
                  y1="10"
                  x2="50"
                  y2="19"
                  stroke="#FF9F1C"
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* 3. BUỔI TỐI (TRỜI TỐI / HOÀNG HÔN CHẠNG VẠNG): Bầu trời tím hồng hoàng hôn & sao hôm */}
      {effectivePeriod === 'evening' && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(180deg, rgba(64, 40, 108, 0.56) 0%, rgba(178, 80, 132, 0.42) 26%, rgba(246, 148, 108, 0.26) 46%, rgba(36, 48, 82, 0.28) 100%)'
          }}
        >
          {/* Trăng non & sao buổi tối sớm */}
          <svg viewBox="0 0 120 120" className="w-14 h-14 sm:w-18 sm:h-18 absolute right-[12%] top-[5%] drop-shadow-[0_0_12px_rgba(255,235,153,0.8)]">
            <path
              d="M72 20 A36 36 0 1 0 96 84 A28 28 0 1 1 72 20 Z"
              fill="#FFF3B0"
              stroke="#593A47"
              strokeWidth="2.8"
            />
          </svg>
          <div className="absolute left-[18%] top-[8%] w-2.5 h-2.5 rounded-full bg-[#FFF3B0] shadow-[0_0_10px_#FFF3B0] animate-ping" />
          <div className="absolute left-[32%] top-[5%] w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#FFFFFF] animate-pulse" />
          <div className="absolute right-[28%] top-[9%] w-2.5 h-2.5 rounded-full bg-[#FFE066] shadow-[0_0_10px_#FFE066] animate-pulse" />
        </div>
      )}

      {/* 4. BAN ĐÊM (TRỜI KHUYA): Bầu trời đêm sâu thẳm, ngàn sao lấp lánh, sao băng & đom đóm trên đồng cỏ */}
      {effectivePeriod === 'night' && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(180deg, rgba(12, 17, 50, 0.78) 0%, rgba(24, 34, 82, 0.64) 30%, rgba(18, 36, 62, 0.44) 100%)'
          }}
        >
          {/* Mặt trăng khuya rực sáng */}
          <svg viewBox="0 0 120 120" className="w-16 h-16 sm:w-20 sm:h-20 absolute right-[12%] top-[4%] drop-shadow-[0_0_18px_rgba(255,243,176,0.95)]">
            <path
              d="M72 18 A38 38 0 1 0 98 86 A30 30 0 1 1 72 18 Z"
              fill="#FFE885"
              stroke="#593A47"
              strokeWidth="2.8"
            />
            <circle cx="52" cy="54" r="4" fill="#F4D35E" opacity="0.6" />
            <circle cx="62" cy="72" r="3" fill="#F4D35E" opacity="0.6" />
          </svg>

          {/* Bầu trời sao đêm khuya & sao băng */}
          {[
            { left: '8%', top: '6%', size: 'w-2 h-2', delay: '0s' },
            { left: '16%', top: '12%', size: 'w-2.5 h-2.5', delay: '0.6s' },
            { left: '25%', top: '5%', size: 'w-1.5 h-1.5', delay: '1.2s' },
            { left: '36%', top: '9%', size: 'w-2.5 h-2.5', delay: '0.3s' },
            { left: '46%', top: '4%', size: 'w-2 h-2', delay: '0.9s' },
            { left: '58%', top: '8%', size: 'w-2 h-2', delay: '1.5s' },
            { left: '68%', top: '5%', size: 'w-2.5 h-2.5', delay: '0.4s' },
            { left: '78%', top: '11%', size: 'w-2 h-2', delay: '1.1s' },
            { left: '90%', top: '7%', size: 'w-2 h-2', delay: '0.7s' }
          ].map((st, i) => (
            <div
              key={i}
              style={{ left: st.left, top: st.top, animationDelay: st.delay }}
              className={`absolute ${st.size} rounded-full bg-[#FFFDF2] shadow-[0_0_10px_#FFF3B0] animate-pulse`}
            />
          ))}

          {/* Đom đóm bay lập loè trên đồng cỏ đêm khuya */}
          {[
            { left: '14%', top: '48%', delay: '0s' },
            { left: '28%', top: '66%', delay: '0.8s' },
            { left: '44%', top: '52%', delay: '1.4s' },
            { left: '56%', top: '74%', delay: '0.5s' },
            { left: '72%', top: '62%', delay: '1.1s' },
            { left: '86%', top: '50%', delay: '0.3s' },
            { left: '38%', top: '85%', delay: '1.7s' },
            { left: '64%', top: '42%', delay: '0.9s' }
          ].map((ff, i) => (
            <div
              key={i}
              style={{ left: ff.left, top: ff.top, animationDelay: ff.delay }}
              className="absolute w-2.5 h-2.5 rounded-full bg-[#D9F99D] shadow-[0_0_12px_#BEF264] animate-bounce"
            />
          ))}
        </div>
      )}
    </div>
  );
}
