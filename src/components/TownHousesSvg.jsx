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
 * Bảng tên gỗ của từng ngôi nhà nhân vật (thiết kế đồng bộ với bảng gỗ của "Nhà Của Bạn"),
 * đặt kế bên ngôi nhà và có cọc gỗ cắm xuống bãi cỏ.
 */
export function HouseWoodenSignpostSvg({ name, className = '' }) {
  const safeName = name || '';
  const fontSize = safeName.length > 13 ? 13 : safeName.length > 10 ? 14.5 : 16;

  return (
    <svg
      viewBox="0 0 156 76"
      className={`w-[92px] sm:w-[112px] md:w-[126px] lg:w-[136px] h-auto overflow-visible select-none drop-shadow-[0_4px_4px_rgba(89,58,71,0.18)] ${className}`}
    >
      {/* Bóng đổ dưới chân cọc trên bãi cỏ */}
      <ellipse cx="78" cy="70" rx="44" ry="5" fill="#68B67E" opacity="0.55" />

      {/* 2 Cọc gỗ cắm xuống bãi cỏ */}
      <rect
        x="42"
        y="42"
        width="11"
        height="27"
        rx="3"
        fill="#C98A5B"
        stroke="#593A47"
        strokeWidth="3"
      />
      <rect
        x="103"
        y="42"
        width="11"
        height="27"
        rx="3"
        fill="#C98A5B"
        stroke="#593A47"
        strokeWidth="3"
      />

      {/* Mặt bảng gỗ vàng ấm giống bảng "Nhà Của Bạn" (có khía gỗ 2 bên) */}
      <path
        d="M 14,8 H 142 A 8,8 0 0 1 150,16 V 24 L 146,27 L 150,30 V 38 A 8,8 0 0 1 142,46 H 14 A 8,8 0 0 1 6,38 V 30 L 10,27 L 6,24 V 16 A 8,8 0 0 1 14,8 Z"
        fill="#FCE181"
        stroke="#593A47"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Vân gỗ sáng & ấm */}
      <line x1="18" y1="14" x2="138" y2="14" stroke="#FFF3B8" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="22" y1="40" x2="134" y2="40" stroke="#E9C45A" strokeWidth="2" strokeLinecap="round" />

      {/* Đinh tán gỗ nhỏ 2 đầu */}
      <circle cx="16" cy="27" r="2.2" fill="#C98A5B" />
      <circle cx="140" cy="27" r="2.2" fill="#C98A5B" />

      {/* Tên nhân vật / ngôi nhà trên bảng gỗ */}
      <text
        x="78"
        y="32"
        textAnchor="middle"
        fill="#593A47"
        stroke="#FFF8DC"
        strokeWidth="3"
        paintOrder="stroke"
        fontSize={fontSize}
        fontWeight="900"
        style={{ fontFamily: "'Nunito', 'Quicksand', sans-serif" }}
      >
        {safeName}
      </text>

      {/* Cụm cỏ xanh mọc ôm dưới chân cọc gỗ nơi cắm xuống bãi cỏ */}
      <path
        d="M 32,70 Q 36,60 40,68 Q 45,58 49,68 Q 54,61 57,70 Z"
        fill="#7ED49E"
        stroke="#593A47"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M 94,70 Q 98,60 102,68 Q 107,58 111,68 Q 116,61 119,70 Z"
        fill="#7ED49E"
        stroke="#593A47"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Ngôi nhà của User ở đỉnh đồi cuối con đường lát đá:
 */
export function UserHouseSvg({ houseTitle = 'Nhà Của Bạn', isRegistered = false }) {
  const safeTitle =
    houseTitle && houseTitle.length > 20 ? `${houseTitle.slice(0, 19)}…` : houseTitle;
  const fontSize = safeTitle.length > 15 ? 13.5 : safeTitle.length > 11 ? 15.5 : 17.5;

  return (
    <svg
      viewBox="0 0 234 241"
      className="w-[128px] sm:w-[156px] md:w-[174px] lg:w-[190px] max-h-[17.5dvh] h-auto overflow-visible select-none drop-shadow-[0_8px_12px_rgba(89,58,71,0.16)]"
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
        y="43"
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
        <g transform="translate(178, 8)">
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
