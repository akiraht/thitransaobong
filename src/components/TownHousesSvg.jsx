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
 * Tách tên địa điểm dài thành 2 dòng cân đối theo ranh giới từ (không cắt giữa từ).
 */
function formatHouseSignLines(rawName) {
  const clean = (rawName || '').trim().replace(/\s+/g, ' ');
  if (!clean) return [''];
  // Nếu ngắn (<= 11 ký tự) hoặc chỉ 1 từ -> giữ 1 dòng
  const words = clean.split(' ');
  if (clean.length <= 11 || words.length <= 1) return [clean];

  // Tìm điểm ngắt khoảng trắng gần giữa nhất để 2 dòng cân đối đẹp mắt
  let bestIdx = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const l1 = words.slice(0, i).join(' ');
    const l2 = words.slice(i).join(' ');
    const diff = Math.abs(l1.length - l2.length);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return [words.slice(0, bestIdx).join(' '), words.slice(bestIdx).join(' ')];
}

/**
 * Bảng tên gỗ của từng ngôi nhà nhân vật:
 * - Font chữ sắc nét: 14px trên Mobile (SP), 16px trên PC.
 * - Tự động xuống dòng đẹp mắt khi tên dài.
 */
export function HouseWoodenSignpostSvg({ name, className = '' }) {
  const lines = formatHouseSignLines(name);

  return (
    <div className={`relative flex flex-col items-center select-none drop-shadow-[0_4px_4px_rgba(89,58,71,0.22)] ${className}`}>
      {/* Mặt bảng gỗ vàng ấm */}
      <div className="relative z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#FCE181] border-[2.5px] border-[#593A47] shadow-[inset_0_2px_0_#FFF3B8,inset_0_-2px_0_#E9C45A] flex flex-col items-center justify-center min-w-[96px] sm:min-w-[116px]">
        {/* Đinh tán gỗ 2 đầu */}
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C98A5B] border border-[#593A47]/60" />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C98A5B] border border-[#593A47]/60" />

        <div className="landscape-house-sign px-2 text-center font-black text-[#593A47] text-[14px] md:text-[16px] leading-[1.2] tracking-tight [text-shadow:0_1px_0_#FFF8DC]">
          {lines.map((line, idx) => (
            <div key={idx} className="whitespace-nowrap">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* 2 Cọc gỗ cắm xuống bãi cỏ */}
      <div className="relative -mt-0.5 flex items-end justify-between w-14 sm:w-16 px-2">
        <div className="w-2.5 h-3.5 bg-[#C98A5B] border-x-2 border-b-2 border-[#593A47] rounded-b-sm" />
        <div className="w-2.5 h-3.5 bg-[#C98A5B] border-x-2 border-b-2 border-[#593A47] rounded-b-sm" />
      </div>

      {/* Bóng cỏ nhỏ dưới chân cọc */}
      <div className="w-16 h-2 -mt-1 rounded-full bg-[#68B67E]/65" />
    </div>
  );
}

/**
 * Ngôi nhà của User ở đỉnh đồi cuối con đường lát đá (Đã tăng kích thước x2 uy nghi & nổi bật):
 */
export function UserHouseSvg({ houseTitle = 'Nhà Của Bạn', isRegistered = false, className = '' }) {
  const safeTitle = 'Nhà Của Bạn';
  const fontSize = safeTitle.length > 15 ? 13.5 : 15.5;

  return (
    <svg
      viewBox="0 0 234 241"
      className={`w-[138px] sm:w-[168px] md:w-[192px] lg:w-[210px] max-h-[19dvh] h-auto overflow-visible select-none drop-shadow-[0_10px_14px_rgba(89,58,71,0.22)] ${className}`}
    >
      <image
        href={HOUSE_SPRITES.user_house}
        x="0"
        y="0"
        width="234"
        height="241"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Tên căn chính giữa bảng gỗ trên nóc Nhà User */}
      <text
        x="117"
        y="38"
        textAnchor="middle"
        dominantBaseline="central"
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
        <g transform="translate(178, 16)">
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
