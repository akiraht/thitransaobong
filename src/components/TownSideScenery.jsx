import React, { useState } from 'react';

/**
 * Cây cối, nhà cửa phụ và các bé động vật dễ thương (Thỏ, Chó Cún, Mèo, Cừu)
 * di chuyển xung quanh khu vực đồng cỏ 2 bên màn hình lớn (đã hạ thấp theo đồng cỏ mới).
 */

function KawaiiTreeSvg({ variant = 'apple', className = 'w-24 h-28' }) {
  if (variant === 'sakura') {
    return (
      <svg viewBox="0 0 120 140" className={`${className} overflow-visible select-none drop-shadow-[0_6px_8px_rgba(89,58,71,0.14)]`}>
        <ellipse cx="60" cy="130" rx="34" ry="8" fill="#7FC892" opacity="0.55" />
        <path
          d="M48 128 C50 102, 52 84, 46 68 L74 68 C68 84, 70 102, 72 128 Z"
          fill="#C68B63"
          stroke="#593A47"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <circle cx="34" cy="62" r="24" fill="#FFB8D1" stroke="#593A47" strokeWidth="3.5" />
        <circle cx="86" cy="62" r="24" fill="#FFB8D1" stroke="#593A47" strokeWidth="3.5" />
        <circle cx="60" cy="38" r="28" fill="#FFC8DD" stroke="#593A47" strokeWidth="3.5" />
        <circle cx="60" cy="66" r="26" fill="#FFD6E7" />
        <path
          d="M34 86 C48 92, 72 92, 86 86"
          fill="none"
          stroke="#593A47"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="46" cy="42" r="4" fill="#FFF3B0" stroke="#593A47" strokeWidth="2" />
        <circle cx="76" cy="48" r="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="2" />
        <circle cx="58" cy="64" r="4" fill="#FFF3B0" stroke="#593A47" strokeWidth="2" />
        <circle cx="32" cy="60" r="3.5" fill="#FFFFFF" stroke="#593A47" strokeWidth="2" />
      </svg>
    );
  }

  if (variant === 'pine') {
    return (
      <svg viewBox="0 0 110 145" className={`${className} overflow-visible select-none drop-shadow-[0_6px_8px_rgba(89,58,71,0.14)]`}>
        <ellipse cx="55" cy="135" rx="32" ry="8" fill="#7FC892" opacity="0.55" />
        <rect x="45" y="102" width="20" height="32" rx="4" fill="#B97D56" stroke="#593A47" strokeWidth="3.5" />
        <path
          d="M16 106 L55 56 L94 106 Z"
          fill="#7ED49E"
          stroke="#593A47"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M22 78 L55 32 L88 78 Z"
          fill="#92E0AE"
          stroke="#593A47"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M28 52 L55 12 L82 52 Z"
          fill="#A9ECC1"
          stroke="#593A47"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <circle cx="44" cy="66" r="4" fill="#FFE066" stroke="#593A47" strokeWidth="2" />
        <circle cx="66" cy="88" r="4" fill="#FF85A9" stroke="#593A47" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 140" className={`${className} overflow-visible select-none drop-shadow-[0_6px_8px_rgba(89,58,71,0.14)]`}>
      <ellipse cx="60" cy="130" rx="34" ry="8" fill="#7FC892" opacity="0.55" />
      <path
        d="M48 128 C50 102, 52 84, 46 68 L74 68 C68 84, 70 102, 72 128 Z"
        fill="#C68B63"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="62" r="24" fill="#88D9A0" stroke="#593A47" strokeWidth="3.5" />
      <circle cx="86" cy="62" r="24" fill="#88D9A0" stroke="#593A47" strokeWidth="3.5" />
      <circle cx="60" cy="38" r="28" fill="#9CE5B2" stroke="#593A47" strokeWidth="3.5" />
      <circle cx="60" cy="66" r="25" fill="#9CE5B2" />
      <path
        d="M34 86 C48 92, 72 92, 86 86"
        fill="none"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="44" cy="45" r="5.5" fill="#FF758F" stroke="#593A47" strokeWidth="2.2" />
      <circle cx="75" cy="52" r="5.5" fill="#FF758F" stroke="#593A47" strokeWidth="2.2" />
      <circle cx="56" cy="68" r="5.5" fill="#FF758F" stroke="#593A47" strokeWidth="2.2" />
    </svg>
  );
}

function SideWindmillCottageSvg({ isNight = false }) {
  return (
    <svg viewBox="0 0 160 175" className="w-26 lg:w-32 h-auto overflow-visible select-none drop-shadow-[0_6px_10px_rgba(89,58,71,0.15)]">
      <ellipse cx="80" cy="162" rx="56" ry="10" fill="#7FC892" opacity="0.55" />
      <path
        d="M46 158 L56 66 L104 66 L114 158 Z"
        fill="#FFF5E1"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M48 68 C48 38, 112 38, 112 68 Z"
        fill="#FFA8C5"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle
        cx="80"
        cy="98"
        r="12"
        fill={isNight ? '#FFE066' : '#C8EFEA'}
        stroke="#593A47"
        strokeWidth="3"
      />
      <line x1="68" y1="98" x2="92" y2="98" stroke="#593A47" strokeWidth="2.2" />
      <line x1="80" y1="86" x2="80" y2="110" stroke="#593A47" strokeWidth="2.2" />
      <path
        d="M66 158 L66 132 A14 14 0 0 1 94 132 L94 158 Z"
        fill="#D59B6E"
        stroke="#593A47"
        strokeWidth="3"
      />
      <g transform="translate(80, 58)">
        <g className="spin-slow">
          <rect x="-5" y="-44" width="10" height="38" rx="4" fill="#FFE066" stroke="#593A47" strokeWidth="2.8" />
          <rect x="-5" y="6" width="10" height="38" rx="4" fill="#FFE066" stroke="#593A47" strokeWidth="2.8" />
          <rect x="-44" y="-5" width="38" height="10" rx="4" fill="#B8E8FC" stroke="#593A47" strokeWidth="2.8" />
          <rect x="6" y="-5" width="38" height="10" rx="4" fill="#B8E8FC" stroke="#593A47" strokeWidth="2.8" />
        </g>
        <circle cx="0" cy="0" r="7" fill="#FF85A9" stroke="#593A47" strokeWidth="2.8" />
      </g>
      <path
        d="M28 158 C24 146, 36 138, 46 144 C52 138, 62 146, 58 158 Z"
        fill="#88D9A0"
        stroke="#593A47"
        strokeWidth="3"
      />
      <circle cx="42" cy="149" r="3.2" fill="#FFB8D1" stroke="#593A47" strokeWidth="1.5" />
    </svg>
  );
}

function SideMushroomHouseSvg({ isNight = false }) {
  return (
    <svg viewBox="0 0 150 150" className="w-22 lg:w-28 h-auto overflow-visible select-none drop-shadow-[0_6px_10px_rgba(89,58,71,0.15)]">
      <ellipse cx="75" cy="138" rx="50" ry="9" fill="#7FC892" opacity="0.55" />
      <path
        d="M44 136 C42 104, 46 84, 52 74 L98 74 C104 84, 108 104, 106 136 Z"
        fill="#FFF8EA"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 78 C18 32, 132 32, 130 78 C108 84, 42 84, 20 78 Z"
        fill="#FF8DA1"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="52" cy="54" r="9" fill="#FFF8EA" stroke="#593A47" strokeWidth="2.5" />
      <circle cx="88" cy="48" r="11" fill="#FFF8EA" stroke="#593A47" strokeWidth="2.5" />
      <circle cx="108" cy="66" r="6.5" fill="#FFF8EA" stroke="#593A47" strokeWidth="2.5" />
      <circle
        cx="60"
        cy="96"
        r="9"
        fill={isNight ? '#FFE066' : '#C8EFEA'}
        stroke="#593A47"
        strokeWidth="2.8"
      />
      <path
        d="M74 136 L74 108 A12 12 0 0 1 98 108 L98 136 Z"
        fill="#D59B6E"
        stroke="#593A47"
        strokeWidth="3"
      />
      <circle cx="93" cy="122" r="2.2" fill="#FFE066" stroke="#593A47" strokeWidth="1.5" />
    </svg>
  );
}

function SideMintCottageSvg({ isNight = false }) {
  return (
    <svg viewBox="0 0 155 150" className="w-24 lg:w-30 h-auto overflow-visible select-none drop-shadow-[0_6px_10px_rgba(89,58,71,0.15)]">
      <ellipse cx="78" cy="138" rx="54" ry="9" fill="#7FC892" opacity="0.55" />
      <rect x="98" y="28" width="16" height="28" rx="3" fill="#F4A28C" stroke="#593A47" strokeWidth="3" />
      <circle cx="108" cy="18" r="6" fill="#FFFFFF" opacity="0.8" />
      <circle cx="116" cy="9" r="8" fill="#FFFFFF" opacity="0.65" />
      <rect x="34" y="68" width="88" height="68" rx="8" fill="#FFF6FA" stroke="#593A47" strokeWidth="3.5" />
      <path
        d="M22 72 L78 26 L134 72 Z"
        fill="#9CE5B2"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle
        cx="56"
        cy="98"
        r="11"
        fill={isNight ? '#FFE066' : '#B8E8FC'}
        stroke="#593A47"
        strokeWidth="2.8"
      />
      <line x1="45" y1="98" x2="67" y2="98" stroke="#593A47" strokeWidth="2" />
      <line x1="56" y1="87" x2="56" y2="109" stroke="#593A47" strokeWidth="2" />
      <path
        d="M78 136 L78 102 A14 14 0 0 1 106 102 L106 136 Z"
        fill="#C79CED"
        stroke="#593A47"
        strokeWidth="3"
      />
      <g transform="translate(4, 112)">
        <rect x="0" y="4" width="8" height="22" rx="3" fill="#FFE5B4" stroke="#593A47" strokeWidth="2.4" />
        <rect x="12" y="4" width="8" height="22" rx="3" fill="#FFE5B4" stroke="#593A47" strokeWidth="2.4" />
        <rect x="-2" y="10" width="26" height="5" rx="2" fill="#FFE5B4" stroke="#593A47" strokeWidth="2.2" />
      </g>
    </svg>
  );
}

function KawaiiAnimalSvg({ type = 'bunny' }) {
  if (type === 'puppy') {
    return (
      <svg viewBox="0 0 90 78" className="w-11 sm:w-13 lg:w-15 h-auto overflow-visible select-none">
        <ellipse cx="45" cy="70" rx="26" ry="5.5" fill="#68B67E" opacity="0.45" />
        <path
          d="M66 44 C78 36, 82 48, 70 52"
          fill="#F4A261"
          stroke="#593A47"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="24" y="38" width="44" height="24" rx="12" fill="#F6AD6B" stroke="#593A47" strokeWidth="3" />
        <ellipse cx="42" cy="52" rx="14" ry="8" fill="#FFFDF9" />
        <rect x="28" y="58" width="7" height="10" rx="3.5" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.6" />
        <rect x="38" y="59" width="7" height="9" rx="3.5" fill="#F6AD6B" stroke="#593A47" strokeWidth="2.6" />
        <rect x="50" y="58" width="7" height="10" rx="3.5" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.6" />
        <rect x="59" y="59" width="7" height="9" rx="3.5" fill="#F6AD6B" stroke="#593A47" strokeWidth="2.6" />
        <circle cx="28" cy="34" r="16" fill="#F6AD6B" stroke="#593A47" strokeWidth="3" />
        <path d="M16 24 L12 10 L24 18 Z" fill="#E08A45" stroke="#593A47" strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M34 20 L42 8 L42 24 Z" fill="#E08A45" stroke="#593A47" strokeWidth="2.8" strokeLinejoin="round" />
        <ellipse cx="25" cy="37" rx="9" ry="7" fill="#FFFDF9" />
        <circle cx="21" cy="32" r="2.2" fill="#593A47" />
        <circle cx="31" cy="32" r="2.2" fill="#593A47" />
        <ellipse cx="25" cy="36" rx="2.5" ry="1.8" fill="#593A47" />
        <circle cx="17" cy="36" r="3" fill="#FF9EBB" opacity="0.75" />
        <circle cx="34" cy="36" r="3" fill="#FF9EBB" opacity="0.75" />
        <path d="M20 46 Q28 50 38 45" stroke="#FF6B9D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="27" cy="49" r="3" fill="#FFE066" stroke="#593A47" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === 'kitty') {
    return (
      <svg viewBox="0 0 90 78" className="w-11 sm:w-13 lg:w-15 h-auto overflow-visible select-none">
        <ellipse cx="45" cy="70" rx="24" ry="5" fill="#68B67E" opacity="0.45" />
        <path
          d="M64 46 C76 34, 82 22, 72 18"
          fill="none"
          stroke="#593A47"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M64 46 C76 34, 82 22, 72 18"
          fill="none"
          stroke="#FFD6E7"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <rect x="25" y="38" width="40" height="22" rx="11" fill="#FFFDF9" stroke="#593A47" strokeWidth="3" />
        <circle cx="50" cy="45" r="7" fill="#FFB8D1" />
        <rect x="29" y="57" width="6.5" height="10" rx="3" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.5" />
        <rect x="39" y="58" width="6.5" height="9" rx="3" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.5" />
        <rect x="51" y="57" width="6.5" height="10" rx="3" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.5" />
        <circle cx="29" cy="34" r="15" fill="#FFFDF9" stroke="#593A47" strokeWidth="3" />
        <path d="M18 24 A14 14 0 0 1 30 19 L25 30 Z" fill="#F6AD6B" />
        <path d="M16 25 L14 11 L25 19 Z" fill="#FFB8D1" stroke="#593A47" strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M32 19 L42 11 L41 25 Z" fill="#F6AD6B" stroke="#593A47" strokeWidth="2.8" strokeLinejoin="round" />
        <circle cx="23" cy="33" r="2.1" fill="#593A47" />
        <circle cx="33" cy="33" r="2.1" fill="#593A47" />
        <path d="M26 36 Q28 38 30 36" stroke="#593A47" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="19" cy="36" r="2.8" fill="#FF9EBB" opacity="0.7" />
        <circle cx="37" cy="36" r="2.8" fill="#FF9EBB" opacity="0.7" />
        <line x1="10" y1="33" x2="16" y2="34" stroke="#593A47" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10" y1="37" x2="16" y2="37" stroke="#593A47" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'sheep') {
    return (
      <svg viewBox="0 0 92 78" className="w-11 sm:w-13 lg:w-15 h-auto overflow-visible select-none">
        <ellipse cx="46" cy="70" rx="26" ry="5" fill="#68B67E" opacity="0.45" />
        <rect x="32" y="56" width="6" height="11" rx="3" fill="#593A47" />
        <rect x="42" y="57" width="6" height="10" rx="3" fill="#593A47" />
        <rect x="54" y="56" width="6" height="11" rx="3" fill="#593A47" />
        <circle cx="36" cy="44" r="14" fill="#FFFDF9" stroke="#593A47" strokeWidth="3" />
        <circle cx="56" cy="44" r="14" fill="#FFFDF9" stroke="#593A47" strokeWidth="3" />
        <circle cx="46" cy="34" r="15" fill="#FFFDF9" stroke="#593A47" strokeWidth="3" />
        <circle cx="46" cy="46" r="14" fill="#FFFDF9" />
        <ellipse cx="26" cy="40" rx="11" ry="9.5" fill="#FFE5D4" stroke="#593A47" strokeWidth="2.8" />
        <circle cx="22" cy="39" r="2" fill="#593A47" />
        <circle cx="29" cy="39" r="2" fill="#593A47" />
        <circle cx="19" cy="42" r="2.5" fill="#FF9EBB" opacity="0.7" />
        <circle cx="32" cy="42" r="2.5" fill="#FF9EBB" opacity="0.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 86 82" className="w-10 sm:w-12 lg:w-14 h-auto overflow-visible select-none">
      <ellipse cx="43" cy="74" rx="22" ry="5" fill="#68B67E" opacity="0.45" />
      <circle cx="64" cy="54" r="7" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.8" />
      <ellipse cx="44" cy="52" rx="18" ry="14" fill="#FFFDF9" stroke="#593A47" strokeWidth="3" />
      <ellipse cx="34" cy="66" rx="6" ry="4" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.6" />
      <ellipse cx="52" cy="66" rx="6" ry="4" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.6" />
      <ellipse cx="25" cy="18" rx="5.5" ry="14" transform="rotate(-10 25 18)" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.8" />
      <ellipse cx="25" cy="19" rx="2.8" ry="9" transform="rotate(-10 25 19)" fill="#FFB8D1" />
      <ellipse cx="36" cy="17" rx="5.5" ry="14" transform="rotate(8 36 17)" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.8" />
      <ellipse cx="36" cy="18" rx="2.8" ry="9" transform="rotate(8 36 18)" fill="#FFB8D1" />
      <circle cx="30" cy="38" r="14" fill="#FFFDF9" stroke="#593A47" strokeWidth="3" />
      <circle cx="25" cy="36" r="2.1" fill="#593A47" />
      <circle cx="34" cy="36" r="2.1" fill="#593A47" />
      <circle cx="29.5" cy="39" r="2" fill="#FF85A9" />
      <circle cx="21" cy="40" r="2.8" fill="#FF9EBB" opacity="0.75" />
      <circle cx="38" cy="40" r="2.8" fill="#FF9EBB" opacity="0.75" />
    </svg>
  );
}

const ROAMING_PETS = [
  {
    id: 'bunny_left',
    type: 'bunny',
    name: 'Bé Thỏ Bông',
    sound: '🥕 Nhăm nhăm~ Chúc bạn ngày mới ngọt ngào!',
    posClass: 'hidden md:block left-[12%] top-[38%]',
    animClass: 'pet-roam-1'
  },
  {
    id: 'puppy_left',
    type: 'puppy',
    name: 'Bé Cún Corgi',
    sound: '🐶 Gâu gâu! Vẫy đuôi chào bạn nè~',
    posClass: 'hidden md:block left-[6%] top-[63%]',
    animClass: 'pet-roam-2'
  },
  {
    id: 'kitty_right',
    type: 'kitty',
    name: 'Bé Mèo Tam Thể',
    sound: '🐱 Meo meo~ Hôm nay của bạn thật tuyệt nhé!',
    posClass: 'hidden md:block right-[11%] top-[40%]',
    animClass: 'pet-roam-3'
  },
  {
    id: 'sheep_right',
    type: 'sheep',
    name: 'Bé Cừu Mây',
    sound: '🐑 Bêêê~ Cỏ ở Thị Trấn Sao Bông êm lắm!',
    posClass: 'hidden md:block right-[6%] top-[64%]',
    animClass: 'pet-roam-1'
  },
  {
    id: 'bunny_bottom_left',
    type: 'bunny',
    name: 'Thỏ Kem Nhỏ',
    sound: '🐰 Nhảy chân sáo quanh đồi hoa~',
    posClass: 'left-[3%] sm:left-[5%] bottom-[4%]',
    animClass: 'pet-roam-3'
  },
  {
    id: 'kitty_bottom_right',
    type: 'kitty',
    name: 'Mèo Sữa Nhỏ',
    sound: '🐾 Meo~ Bắt bướm vàng trên đồng cỏ!',
    posClass: 'right-[3%] sm:right-[5%] bottom-[4%]',
    animClass: 'pet-roam-2'
  }
];

export default function TownSideScenery({ timePeriod = 'morning' }) {
  const [activePetBubble, setActivePetBubble] = useState(null);
  const isNight = timePeriod === 'evening' || timePeriod === 'night';

  const handlePetClick = (pet) => {
    setActivePetBubble(pet.id);
    setTimeout(() => {
      setActivePetBubble((prev) => (prev === pet.id ? null : prev));
    }, 2800);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* ================= KHU VỰC ĐỒI CỎ BÊN TRÁI (MÀN HÌNH LỚN - ĐÃ HẠ THẤP THEO ĐỒNG CỎ) ================= */}
      <div className="hidden md:block">
        {/* Cối xay gió pastel di chuyển xuống đúng vị trí khoanh xanh trên đồng cỏ bên trái */}
        <div className="absolute left-[2.5%] top-[31.5%]">
          <SideWindmillCottageSvg isNight={isNight} />
        </div>

        {/* Cây đào Sakura & Cây táo bên trái */}
        <div className="absolute left-[1.5%] top-[48%]">
          <KawaiiTreeSvg variant="sakura" className="w-22 lg:w-26 h-auto" />
        </div>
        <div className="absolute left-[10%] top-[51%]">
          <KawaiiTreeSvg variant="apple" className="w-18 lg:w-22 h-auto" />
        </div>

        {/* Nhà Nấm Đốm góc dưới bên trái (tránh Bưu Điện Sao Băng ở 16.5%) */}
        <div className="absolute left-[1.2%] top-[74%]">
          <SideMushroomHouseSvg isNight={isNight} />
        </div>
      </div>

      {/* ================= KHU VỰC ĐỒI CỎ BÊN PHẢI (MÀN HÌNH LỚN - ĐÃ HẠ THẤP THEO ĐỒNG CỎ) ================= */}
      <div className="hidden md:block">
        {/* Nhà mái xanh bạc hà trên sườn đồi phải (hạ thấp xuống thảm cỏ) */}
        <div className="absolute right-[2.5%] top-[38.5%]">
          <SideMintCottageSvg isNight={isNight} />
        </div>
        <div className="absolute right-[10.5%] top-[30%]">
          <KawaiiTreeSvg variant="pine" className="w-18 lg:w-22 h-auto" />
        </div>

        {/* Cây táo & Cây thông pastel bên phải */}
        <div className="absolute right-[1.5%] top-[48%]">
          <KawaiiTreeSvg variant="apple" className="w-22 lg:w-26 h-auto" />
        </div>
        <div className="absolute right-[10.5%] top-[50%]">
          <KawaiiTreeSvg variant="pine" className="w-18 lg:w-22 h-auto" />
        </div>

        {/* Nhà Nấm & Cây Sakura góc dưới bên phải */}
        <div className="absolute right-[1.5%] top-[74%]">
          <SideMushroomHouseSvg isNight={isNight} />
        </div>
        <div className="absolute right-[10.5%] top-[76%]">
          <KawaiiTreeSvg variant="sakura" className="w-18 lg:w-22 h-auto" />
        </div>
      </div>

      {/* ================= CÁC BÉ ĐỘNG VẬT DI CHUYỂN XUNG QUANH (THỎ, CHÓ, MÈO, CỪU) ================= */}
      {ROAMING_PETS.map((pet) => (
        <div key={pet.id} className={`absolute ${pet.posClass} pointer-events-auto z-20`}>
          <button
            type="button"
            onClick={() => handlePetClick(pet)}
            title={`${pet.name} — Chạm để nựng bé!`}
            className="group relative flex flex-col items-center focus:outline-none cursor-pointer"
          >
            {activePetBubble === pet.id && (
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-2xl bg-white/95 border-2 border-[#593A47] shadow-[0_3px_0_#593A47] text-[10px] sm:text-xs font-extrabold text-[#593A47] whitespace-nowrap pop-in z-30">
                {pet.sound}
              </div>
            )}
            <div className={pet.animClass}>
              <KawaiiAnimalSvg type={pet.type} />
            </div>
            <span className="-mt-1 px-2 py-0.5 rounded-full bg-white/85 border border-[#593A47] text-[9px] font-extrabold text-[#593A47] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              🐾 {pet.name}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
