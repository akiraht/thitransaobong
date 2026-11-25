import React from 'react';
import { HOUSE_SPRITES } from '../data/houseSprites';
import { CHARACTER_SPRITES } from '../data/characterSprites';

const HOUSE_META = {
  star: {
    w: 261,
    h: 233,
    doorX: 112,
    doorY: 122,
    doorW: 56,
    doorH: 82,
    doorFill: '#D59B6E',
    className: 'w-[122px] sm:w-[150px] md:w-[172px] lg:w-[190px] max-h-[17dvh] h-auto'
  },
  cloud: {
    w: 275,
    h: 243,
    doorX: 102,
    doorY: 128,
    doorW: 60,
    doorH: 85,
    doorFill: '#B6DCF6',
    className: 'w-[126px] sm:w-[156px] md:w-[178px] lg:w-[196px] max-h-[17.5dvh] h-auto'
  },
  moon: {
    w: 246,
    h: 286,
    doorX: 108,
    doorY: 174,
    doorW: 58,
    doorH: 86,
    doorFill: '#D49A70',
    className: 'w-[116px] sm:w-[144px] md:w-[164px] lg:w-[180px] max-h-[18dvh] h-auto'
  },
  rainbow: {
    w: 283,
    h: 213,
    doorX: 114,
    doorY: 106,
    doorW: 60,
    doorH: 84,
    doorFill: '#C79CED',
    className: 'w-[128px] sm:w-[160px] md:w-[180px] lg:w-[200px] max-h-[16.5dvh] h-auto'
  },
  nebula: {
    w: 283,
    h: 217,
    doorX: 112,
    doorY: 108,
    doorW: 54,
    doorH: 78,
    doorFill: '#D49A70',
    className: 'w-[126px] sm:w-[156px] md:w-[178px] lg:w-[196px] max-h-[16.5dvh] h-auto'
  },
  sun: {
    w: 282,
    h: 239,
    doorX: 105,
    doorY: 138,
    doorW: 58,
    doorH: 82,
    doorFill: '#D49A70',
    className: 'w-[126px] sm:w-[156px] md:w-[178px] lg:w-[196px] max-h-[17dvh] h-auto'
  },
  shooting_star: {
    w: 267,
    h: 254,
    doorX: 124,
    doorY: 138,
    doorW: 56,
    doorH: 82,
    doorFill: '#D49A70',
    className: 'w-[120px] sm:w-[150px] md:w-[170px] lg:w-[188px] max-h-[17dvh] h-auto'
  },
  spark: {
    w: 268,
    h: 254,
    doorX: 92,
    doorY: 124,
    doorW: 58,
    doorH: 84,
    doorFill: '#A7D2F4',
    className: 'w-[122px] sm:w-[152px] md:w-[174px] lg:w-[192px] max-h-[17dvh] h-auto'
  },
  // 8 Ngôi nhà Cư dân mới (Số 09 – Số 16)
  dewdrop: {
    w: 280,
    h: 260,
    doorX: 110,
    doorY: 130,
    doorW: 56,
    doorH: 82,
    doorFill: '#A0E7E5',
    className: 'w-[122px] sm:w-[150px] md:w-[172px] lg:w-[190px] max-h-[17dvh] h-auto'
  },
  breeze: {
    w: 280,
    h: 280,
    doorX: 108,
    doorY: 140,
    doorW: 58,
    doorH: 84,
    doorFill: '#B4E197',
    className: 'w-[124px] sm:w-[154px] md:w-[176px] lg:w-[194px] max-h-[18dvh] h-auto'
  },
  snowflake: {
    w: 280,
    h: 270,
    doorX: 112,
    doorY: 135,
    doorW: 56,
    doorH: 82,
    doorFill: '#BEE3F8',
    className: 'w-[122px] sm:w-[152px] md:w-[174px] lg:w-[192px] max-h-[17.5dvh] h-auto'
  },
  aurora: {
    w: 290,
    h: 260,
    doorX: 116,
    doorY: 128,
    doorW: 60,
    doorH: 84,
    doorFill: '#C4B5FD',
    className: 'w-[126px] sm:w-[156px] md:w-[178px] lg:w-[196px] max-h-[17dvh] h-auto'
  },
  saturn: {
    w: 285,
    h: 265,
    doorX: 110,
    doorY: 132,
    doorW: 58,
    doorH: 84,
    doorFill: '#FDE68A',
    className: 'w-[124px] sm:w-[154px] md:w-[176px] lg:w-[194px] max-h-[17.5dvh] h-auto'
  },
  firefly: {
    w: 275,
    h: 260,
    doorX: 106,
    doorY: 130,
    doorW: 56,
    doorH: 82,
    doorFill: '#FEF08A',
    className: 'w-[122px] sm:w-[150px] md:w-[172px] lg:w-[190px] max-h-[17dvh] h-auto'
  },
  sunset: {
    w: 285,
    h: 260,
    doorX: 112,
    doorY: 128,
    doorW: 58,
    doorH: 84,
    doorFill: '#FDBA74',
    className: 'w-[124px] sm:w-[154px] md:w-[176px] lg:w-[194px] max-h-[17dvh] h-auto'
  },
  north_star: {
    w: 270,
    h: 290,
    doorX: 104,
    doorY: 150,
    doorW: 58,
    doorH: 86,
    doorFill: '#93C5FD',
    className: 'w-[120px] sm:w-[150px] md:w-[170px] lg:w-[188px] max-h-[18.5dvh] h-auto'
  },
  // 4 Ngôi nhà Nhóm Tinh Nghịch (Số 17 – Số 20)
  storm_cloud: {
    w: 306,
    h: 312,
    doorX: 120,
    doorY: 156,
    doorW: 60,
    doorH: 86,
    doorFill: '#A3A3A3',
    className: 'w-[126px] sm:w-[156px] md:w-[178px] lg:w-[196px] max-h-[18dvh] h-auto'
  },
  whirlwind: {
    w: 307,
    h: 331,
    doorX: 118,
    doorY: 165,
    doorW: 60,
    doorH: 88,
    doorFill: '#6EE7B7',
    className: 'w-[126px] sm:w-[156px] md:w-[178px] lg:w-[196px] max-h-[19dvh] h-auto'
  },
  black_hole: {
    w: 321,
    h: 274,
    doorX: 128,
    doorY: 136,
    doorW: 62,
    doorH: 84,
    doorFill: '#818CF8',
    className: 'w-[128px] sm:w-[160px] md:w-[180px] lg:w-[200px] max-h-[17dvh] h-auto'
  },
  mirage_fog: {
    w: 314,
    h: 300,
    doorX: 124,
    doorY: 150,
    doorW: 60,
    doorH: 86,
    doorFill: '#C084FC',
    className: 'w-[126px] sm:w-[158px] md:w-[180px] lg:w-[198px] max-h-[18dvh] h-auto'
  }
};

/**
 * Dòng chữ tiêu đề "Thị Trấn [hình bé sao bông] Sao Bông" luôn luôn hiện:
 * - Thiết kế uốn vòng cung, chữ trắng (fill="#FFFFFF"), viền chữ nâu đậm (stroke="#593A47").
 * - Không có khung nền và không có viền hộp xung quanh.
 */
export function TownArchedHeaderSvg() {
  return (
    <svg
      viewBox="0 0 680 135"
      className="w-[330px] sm:w-[480px] md:w-[580px] lg:w-[640px] h-auto overflow-visible select-none drop-shadow-[0_4px_0_rgba(89,58,71,0.95)]"
    >
      <defs>
        {/* Đường cong vòng cung cho chữ "Thị Trấn" (bên trái) và "Sao Bông" (bên phải) */}
        <path id="townArcPath" d="M 30,112 Q 340,14 650,112" fill="none" />
      </defs>

      {/* Chữ "Thị Trấn" uốn vòng cung bên trái */}
      <text
        fill="#FFFFFF"
        stroke="#593A47"
        strokeWidth="10"
         paintOrder="stroke fill"
        strokeLinejoin="round"
        strokeLinecap="round"
        fontSize="44"
        fontWeight="900"
        letterSpacing="1"
        style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
      >
        <textPath href="#townArcPath" startOffset="41%" textAnchor="end">
          Thị Trấn
        </textPath>
      </text>

      {/* Hình Bé Sao Bông nằm ngay đỉnh vòng cung giữa "Thị Trấn" và "Sao Bông" */}
      <g className="char-star-float">
        <image
          href={CHARACTER_SPRITES.star}
          x="298"
          y="4"
          width="84"
          height="74"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>

      {/* Chữ "Sao Bông" uốn vòng cung bên phải */}
      <text
        fill="#FFFFFF"
        stroke="#593A47"
        strokeWidth="10"
        paintOrder="stroke fill"
        strokeLinejoin="round"
        strokeLinecap="round"
        fontSize="44"
        fontWeight="900"
        letterSpacing="1"
        style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
      >
        <textPath href="#townArcPath" startOffset="59%" textAnchor="start">
          Sao Bông
        </textPath>
      </text>
    </svg>
  );
}

/**
 * Bảng tên / Bảng hiệu gắn trên nóc (Roof Sign) của từng ngôi nhà:
 * Căn giữa trên đỉnh mái nhà, không chiếm diện tích bên hông, không bao giờ bị đè lấn nhau.
 */
export function HouseRoofSignSvg({ name, className = '' }) {
  const safeName = name || '';
  const len = safeName.length;
  const fontSize = len >= 18 ? 10 : len >= 14 ? 11 : len >= 10 ? 12 : 13;

  return (
    <div
      className={`absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 select-none whitespace-nowrap ${className}`}
    >
      <div className="relative px-3 py-1 rounded-xl bg-[#FFF6D4] border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center justify-center">
        {/* Hai sợi dây móc bảng hiệu lên mái nhà */}
        <div className="absolute -bottom-2 left-3 w-[2.5px] h-2 bg-[#593A47]" />
        <div className="absolute -bottom-2 right-3 w-[2.5px] h-2 bg-[#593A47]" />

        {/* Đinh tán gỗ nhỏ trang trí 2 đầu */}
        <div className="w-1.5 h-1.5 rounded-full bg-[#C98A5B] mr-1.5 border border-[#593A47]" />
        <span
          style={{ fontSize: `${fontSize}px` }}
          className="font-black text-[#593A47] tracking-wide uppercase leading-none drop-shadow-[0_1px_0_#FFF8DC]"
        >
          {safeName}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#C98A5B] ml-1.5 border border-[#593A47]" />
      </div>
    </div>
  );
}

/**
 * Bảng tên gỗ của từng ngôi nhà nhân vật (thiết kế đồng bộ với bảng gỗ của "Nhà Của Bạn"),
 * đặt kế bên ngôi nhà và có cọc gỗ cắm xuống bãi cỏ.
 * Đã tối ưu kích thước bảng gỗ rộng rãi, tự động căn chỉnh cỡ chữ để không bao giờ bị tràn lề.
 */
export function HouseWoodenSignpostSvg({ name, className = '' }) {
  const safeName = name || '';
  const len = safeName.length;
  // Cỡ chữ linh hoạt theo độ dài tên địa điểm/tiệm
  const fontSize = len >= 17 ? 11.5 : len >= 14 ? 12.5 : len >= 11 ? 13.5 : 14.5;

  return (
    <svg
      viewBox="0 0 180 76"
      className={`w-[100px] sm:w-[122px] md:w-[136px] lg:w-[148px] h-auto overflow-visible select-none drop-shadow-[0_4px_4px_rgba(89,58,71,0.18)] ${className}`}
    >
      {/* Bóng đổ dưới chân cọc trên bãi cỏ */}
      <ellipse cx="90" cy="70" rx="55" ry="5.5" fill="#68B67E" opacity="0.55" />

      {/* 2 Cọc gỗ cắm xuống bãi cỏ */}
      <rect
        x="52"
        y="42"
        width="11"
        height="27"
        rx="3"
        fill="#C98A5B"
        stroke="#593A47"
        strokeWidth="3"
      />
      <rect
        x="117"
        y="42"
        width="11"
        height="27"
        rx="3"
        fill="#C98A5B"
        stroke="#593A47"
        strokeWidth="3"
      />

      {/* Mặt bảng gỗ vàng ấm rộng rãi (160px), có khía gỗ 2 bên */}
      <path
        d="M 16,8 H 164 A 8,8 0 0 1 172,16 V 24 L 168,27 L 172,30 V 38 A 8,8 0 0 1 164,46 H 16 A 8,8 0 0 1 8,38 V 30 L 12,27 L 8,24 V 16 A 8,8 0 0 1 16,8 Z"
        fill="#FCE181"
        stroke="#593A47"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Vân gỗ sáng & ấm */}
      <line x1="20" y1="14" x2="160" y2="14" stroke="#FFF3B8" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="24" y1="40" x2="156" y2="40" stroke="#E9C45A" strokeWidth="2" strokeLinecap="round" />

      {/* Đinh tán gỗ nhỏ 2 đầu */}
      <circle cx="18" cy="27" r="2.2" fill="#C98A5B" />
      <circle cx="162" cy="27" r="2.2" fill="#C98A5B" />

      {/* Tên địa điểm / tiệm / trạm trên bảng gỗ - Căn giữa chuẩn xác */}
      <text
        x="90"
        y="32"
        textAnchor="middle"
        fill="#593A47"
        stroke="#FFF8DC"
        strokeWidth="3"
        paintOrder="stroke"
        fontSize={fontSize}
        fontWeight="900"
        letterSpacing="0.2"
        style={{ fontFamily: "'Nunito', 'Quicksand', sans-serif" }}
      >
        {safeName}
      </text>

      {/* Cụm cỏ xanh mọc ôm dưới chân 2 cọc gỗ */}
      <path
        d="M 42,70 Q 46,60 50,68 Q 55,58 59,68 Q 64,61 67,70 Z"
        fill="#7ED49E"
        stroke="#593A47"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M 108,70 Q 112,60 116,68 Q 121,58 125,68 Q 130,61 133,70 Z"
        fill="#7ED49E"
        stroke="#593A47"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Ngôi nhà của User ở đỉnh đồi cuối con đường lát đá (Đã tăng kích thước x2 uy nghi & nổi bật):
 */
export function UserHouseSvg({ houseTitle = 'Nhà Của Bạn', isRegistered = false, className = '' }) {
  const safeTitle = 'Nhà Của Bạn';
  const fontSize = safeTitle.length > 15 ? 13.5 : safeTitle.length > 11 ? 15.5 : 15.5;

  return (
    <svg
      viewBox="0 0 234 241"
      className={`w-[230px] sm:w-[280px] md:w-[320px] lg:w-[350px] max-h-[32dvh] h-auto overflow-visible select-none drop-shadow-[0_12px_18px_rgba(89,58,71,0.22)] ${className}`}
    >
      <image
        href={HOUSE_SPRITES.user_house}
        x="0"
        y="0"
        width="234"
        height="241"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Tên trên bảng gỗ của Nhà User */}
      <text
        x="117"
        y="68"
        textAnchor="middle"
        fill="#593A47"
        stroke="#FFF8DC"
        strokeWidth="3.5"
        paintOrder="stroke"
        fontSize={fontSize}
        fontWeight="900"
        style={{ fontFamily: "'Nunito', 'Quicksand', sans-serif" }}
      >
        {safeTitle}
      </text>

      {isRegistered && (
        <g transform="translate(168, 38)">
          <circle cx="12" cy="12" r="11" fill="#FFE066" stroke="#593A47" strokeWidth="2.5" />
          <text x="12" y="16" textAnchor="middle" fontSize="12">
            👑
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * 8 Ngôi nhà của 8 nhân vật trích xuất nguyên bản từ hình thiết kế mẫu:
 */
export function ScenicHouseSvg({ id, isDoorOpen = true }) {
  const meta = HOUSE_META[id] || HOUSE_META.star;
  const spriteHref = HOUSE_SPRITES[id] || HOUSE_SPRITES.star;
  const { w, h, doorX, doorY, doorW, doorH, doorFill, className } = meta;
  const archR = Math.round(doorW / 2);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`${className} overflow-visible select-none drop-shadow-[0_8px_12px_rgba(89,58,71,0.15)]`}
    >
      <image
        href={spriteHref}
        x="0"
        y="0"
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Trạng thái đóng cửa khi chưa hoàn thành chọn cảm xúc & mở hộp sao đầu ngày */}
      {!isDoorOpen && (
        <g className="transition-opacity duration-500">
          <path
            d={`M ${doorX} ${doorY + doorH} L ${doorX} ${doorY + archR} A ${archR} ${archR} 0 0 1 ${
              doorX + doorW
            } ${doorY + archR} L ${doorX + doorW} ${doorY + doorH} Z`}
            fill={doorFill}
            stroke="#593A47"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <line
            x1={doorX + doorW * 0.5}
            y1={doorY + 6}
            x2={doorX + doorW * 0.5}
            y2={doorY + doorH - 3}
            stroke="#593A47"
            strokeWidth="1.8"
            opacity="0.35"
          />
          <circle
            cx={doorX + doorW - 11}
            cy={doorY + doorH * 0.56}
            r="3.8"
            fill="#FFE066"
            stroke="#593A47"
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  );
}
