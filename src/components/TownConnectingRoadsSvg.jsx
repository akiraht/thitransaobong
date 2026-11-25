import React from 'react';

/**
 * COMPONENT VẼ CÁC CON ĐƯỜNG NỐI ĐẾN CỬA 20 NGÔI NHÀ TRÊN BẢN ĐỒ THẾ GIỚI
 * Khớp 100% với các nét vẽ chỉ định màu đỏ của người dùng.
 * 
 * Phong cách:
 * - Đường đất vàng nâu pastel ấm cúng (#D6B889) hòa quyện hoàn hảo với các nhánh đường có sẵn.
 * - Viền nét vẽ mực nâu trầm (#593A47) với viền nét mượt mà bo tròn.
 * - Các phiến đá lót bước chân (stepping stones) rải đều tự nhiên.
 */
export default function TownConnectingRoadsSvg() {
  return (
    <svg
      viewBox="0 0 2560 1440"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-[5] overflow-visible select-none"
    >
      <defs>
        {/* Màu chuyển sắc đường đất vàng ấm */}
        <linearGradient id="earthPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFBF90" />
          <stop offset="50%" stopColor="#D5B685" />
          <stop offset="100%" stopColor="#CBA873" />
        </linearGradient>

        {/* Bóng đổ nhẹ dưới lòng đường */}
        <filter id="pathShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#593A47" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#pathShadow)">
        {/* ================= 1. NHÁNH BÉ SAO BÔNG (ĐÀI SAO HY VỌNG) ================= */}
        {/* Nối từ đường gạch vàng sang thềm cửa Bé Sao Bông */}
        <path
          d="M 1235 400 Q 1150 405 1045 408"
          fill="none"
          stroke="#593A47"
          strokeWidth="48"
          strokeLinecap="round"
        />
        <path
          d="M 1235 400 Q 1150 405 1045 408"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="40"
          strokeLinecap="round"
        />

        {/* Nối từ chân Bé Sao Bông uốn cong xuống nhánh đường đất phía dưới */}
        <path
          d="M 1045 408 Q 1000 455 950 515"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 1045 408 Q 1000 455 950 515"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* ================= 2. NHÁNH NHÓC MÂY GIÔNG (TRẠM MƯA GIÔNG) ================= */}
        {/* Nối từ ngọn đường đất bên trái sang cửa Nhóc Mây Giông */}
        <path
          d="M 320 500 Q 240 520 170 525"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 320 500 Q 240 520 170 525"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* ================= 3. NHÁNH THÁP TRĂNG KHUYẾT ================= */}
        {/* Nối từ đường đất uốn cong chữ S dẫn lên cửa Tháp Trăng Khuyết */}
        <path
          d="M 590 740 Q 560 690 645 655"
          fill="none"
          stroke="#593A47"
          strokeWidth="42"
          strokeLinecap="round"
        />
        <path
          d="M 590 740 Q 560 690 645 655"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="34"
          strokeLinecap="round"
        />

        {/* ================= 4. NHÁNH LỀU CỰC QUANG & BÉ HỐ ĐEN ================= */}
        {/* Rẽ từ ngã ba đường đất sang cửa Lều Cực Quang */}
        <path
          d="M 535 835 Q 610 920 705 1025"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 535 835 Q 610 920 705 1025"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* Kéo dài uốn cong từ ngã ba xuống tận cửa Bé Hố Đen góc dưới trái */}
        <path
          d="M 535 835 Q 350 990 280 1110 T 180 1260"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 535 835 Q 350 990 280 1110 T 180 1260"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* ================= 5. NHÁNH BƯU ĐIỆN SAO BĂNG & BÉ ĐOM ĐÓM ================= */}
        {/* Rẽ từ dải đá xuống Bưu Điện Sao Băng */}
        <path
          d="M 565 1235 Q 520 1265 460 1285"
          fill="none"
          stroke="#593A47"
          strokeWidth="42"
          strokeLinecap="round"
        />
        <path
          d="M 565 1235 Q 520 1265 460 1285"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="34"
          strokeLinecap="round"
        />

        {/* Uốn cong từ Bưu Điện sang cửa Bé Đom Đóm */}
        <path
          d="M 515 1290 Q 590 1315 670 1345"
          fill="none"
          stroke="#593A47"
          strokeWidth="40"
          strokeLinecap="round"
        />
        <path
          d="M 515 1290 Q 590 1315 670 1345"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="32"
          strokeLinecap="round"
        />

        {/* ================= 6. NHÁNH TIỆM TRÀ TÂM HỒN & CÀ PHÊ HOÀNG HÔN ================= */}
        {/* Từ đường gạch vàng rẽ sang cửa Tiệm Trà Tâm Hồn (Chị Ngân Hà) */}
        <path
          d="M 1228 920 Q 1120 922 980 928"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 1228 920 Q 1120 922 980 928"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* Từ đường gạch vàng rẽ sang cửa Cà Phê Hoàng Hôn (Chị Hoàng Hôn) */}
        <path
          d="M 1230 1265 Q 1110 1270 965 1275"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 1230 1265 Q 1110 1270 965 1275"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* ================= 7. NHÁNH CHỊ CẦU VỒNG (ĐÀI KHÍ TƯỢNG) ================= */}
        {/* Từ đường sau cầu gỗ uốn cong lên cửa Chị Cầu Vồng */}
        <path
          d="M 1920 800 Q 1890 730 1885 680"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 1920 800 Q 1890 730 1885 680"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* ================= 8. NHÁNH CHÚ GIÓ MÁT & TÍ LỐC XOÁY ================= */}
        {/* Nối từ đường đất phải lên cửa Cối Xay Gió */}
        <path
          d="M 2045 520 Q 2120 445 2185 415"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 2045 520 Q 2120 445 2185 415"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* Kéo dài từ Cối Xay Gió sang cửa Tí Lốc Xoáy */}
        <path
          d="M 2210 425 Q 2300 450 2390 500"
          fill="none"
          stroke="#593A47"
          strokeWidth="42"
          strokeLinecap="round"
        />
        <path
          d="M 2210 425 Q 2300 450 2390 500"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="34"
          strokeLinecap="round"
        />

        {/* ================= 9. NHÁNH CÔ TUYẾT BÔNG (TIỆM KEM TUYẾT) ================= */}
        {/* Nối thẳng từ đường gạch vàng sang thềm cửa Tiệm Kem Tuyết */}
        <path
          d="M 1330 1265 Q 1460 1265 1585 1265"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 1330 1265 Q 1460 1265 1585 1265"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />

        {/* ================= 10. NHÁNH CẬU SƯƠNG MÙ (LỀU ẢO ẢNH) ================= */}
        {/* Kéo dài từ chân ngọn hải đăng sang cửa Lều Ảo Ảnh */}
        <path
          d="M 2185 1240 Q 2300 1245 2410 1240"
          fill="none"
          stroke="#593A47"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M 2185 1240 Q 2300 1245 2410 1240"
          fill="none"
          stroke="url(#earthPathGrad)"
          strokeWidth="36"
          strokeLinecap="round"
        />
      </g>

      {/* ================= CÁC PHIẾN ĐÁ BƯỚC CHÂN (STEPPING STONES) TRANG TRÍ ================= */}
      <g fill="#F3E9D2" stroke="#593A47" strokeWidth="2.5">
        {/* Đá lót nhánh Bé Sao Bông */}
        <ellipse cx="1140" cy="404" rx="14" ry="9" />
        <ellipse cx="1190" cy="402" rx="12" ry="8" />
        <ellipse cx="1005" cy="450" rx="13" ry="9" />
        <ellipse cx="975" cy="485" rx="14" ry="9" />

        {/* Đá lót nhánh Nhóc Mây Giông */}
        <ellipse cx="270" cy="515" rx="13" ry="8" />
        <ellipse cx="215" cy="522" rx="14" ry="9" />

        {/* Đá lót nhánh Tiệm Trà */}
        <ellipse cx="1150" cy="922" rx="14" ry="9" />
        <ellipse cx="1070" cy="925" rx="15" ry="9" />

        {/* Đá lót nhánh Tiệm Cà Phê */}
        <ellipse cx="1150" cy="1268" rx="15" ry="9" />
        <ellipse cx="1060" cy="1272" rx="14" ry="9" />

        {/* Đá lót nhánh Tiệm Kem Tuyết */}
        <ellipse cx="1400" cy="1265" rx="15" ry="9" />
        <ellipse cx="1480" cy="1265" rx="14" ry="9" />
        <ellipse cx="1540" cy="1265" rx="13" ry="8" />

        {/* Đá lót nhánh Lều Ảo Ảnh */}
        <ellipse cx="2260" cy="1242" rx="15" ry="9" />
        <ellipse cx="2330" cy="1243" rx="14" ry="9" />
      </g>
    </svg>
  );
}

