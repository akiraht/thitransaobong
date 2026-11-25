import React, { useState } from 'react';

/**
 * BỘ SƯU TẬP CÁC BÉ ĐỘNG VẬT COZY (KAWAII ANIMAL SPRITES) THEO TỪNG MAP
 * Thiết kế phong cách chibi bo tròn, đường viền nâu ấm #593A47, đổ bóng 3D.
 */
export function KawaiiAnimalSvg({ type = 'bunny' }) {
  // 1. Bé Gà Con Lông Vàng (Map 03: Ngõ Thời Tiết)
  if (type === 'chick') {
    return (
      <svg viewBox="0 0 70 70" className="w-9 sm:w-11 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.22)]">
        <ellipse cx="35" cy="62" rx="18" ry="4" fill="#588157" opacity="0.35" />
        {/* Chân nhỏ cam */}
        <line x1="28" y1="52" x2="26" y2="61" stroke="#E76F51" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="52" x2="44" y2="61" stroke="#E76F51" strokeWidth="2.5" strokeLinecap="round" />
        {/* Thân tròn vàng ấm */}
        <circle cx="35" cy="38" r="21" fill="#FFE066" stroke="#593A47" strokeWidth="2.8" />
        {/* Cánh gà nhỏ xinh nhấp nháy */}
        <path d="M22 36 Q15 44 24 46" fill="#F4A261" stroke="#593A47" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Chỏm lông tơ trên đầu */}
        <path d="M35 17 Q34 8 38 12 Q42 10 39 17 Z" fill="#FFD166" stroke="#593A47" strokeWidth="2" strokeLinejoin="round" />
        {/* Mắt to tròn long lanh */}
        <circle cx="41" cy="34" r="2.8" fill="#593A47" />
        <circle cx="42" cy="32.8" r="1.1" fill="#FFFFFF" />
        {/* Má hồng phấn */}
        <circle cx="33" cy="40" r="3.5" fill="#FF85A9" opacity="0.8" />
        {/* Mỏ tam giác màu cam đáng yêu */}
        <polygon points="46,36 53,39 46,42" fill="#E76F51" stroke="#593A47" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  // 2. Chú Gà Trống Hoa Mơ (Map 03: Ngõ Thời Tiết - Cối Xay Gió)
  if (type === 'rooster') {
    return (
      <svg viewBox="0 0 85 85" className="w-12 sm:w-14 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.25)]">
        <ellipse cx="40" cy="76" rx="22" ry="5" fill="#588157" opacity="0.35" />
        {/* Chân */}
        <line x1="33" y1="62" x2="31" y2="74" stroke="#D97706" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="45" y1="62" x2="47" y2="74" stroke="#D97706" strokeWidth="2.8" strokeLinecap="round" />
        {/* Đuôi cong 3 tầng màu pastel */}
        <path d="M24 45 Q8 32 12 18 Q20 30 26 38" fill="#74C0FC" stroke="#593A47" strokeWidth="2.5" />
        <path d="M20 48 Q4 42 10 28 Q18 38 23 44" fill="#69DB7C" stroke="#593A47" strokeWidth="2.5" />
        {/* Thân tròn màu kem sữa */}
        <ellipse cx="40" cy="50" rx="19" ry="17" fill="#FFF9DB" stroke="#593A47" strokeWidth="3" />
        {/* Cánh lông vàng mật */}
        <path d="M28 48 Q36 60 46 52 Q38 42 28 48 Z" fill="#FFE066" stroke="#593A47" strokeWidth="2.4" />
        {/* Đầu & Cổ */}
        <circle cx="50" cy="34" r="14" fill="#FFF9DB" stroke="#593A47" strokeWidth="2.8" />
        {/* Mào đỏ oai vệ */}
        <path d="M44 22 Q48 12 52 20 Q56 12 60 21" fill="#FF6B6B" stroke="#593A47" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Yếm đỏ dưới cằm */}
        <ellipse cx="56" cy="42" rx="3.5" ry="5" fill="#FF6B6B" stroke="#593A47" strokeWidth="1.8" />
        {/* Mắt & Mỏ */}
        <circle cx="53" cy="32" r="2.2" fill="#593A47" />
        <polygon points="58,32 67,35 58,38" fill="#F59F00" stroke="#593A47" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  // 3. Bé Đom Đóm Phát Sáng Dạ Quang (Map 02: Thung Lũng Thiên Văn)
  if (type === 'firefly_pet') {
    return (
      <svg viewBox="0 0 60 60" className="w-8 sm:w-10 h-auto overflow-visible select-none">
        {/* Vầng hào quang phát sáng neon */}
        <circle cx="30" cy="34" r="18" fill="#D9F99D" opacity="0.45" className="animate-ping" />
        <circle cx="30" cy="34" r="12" fill="#BEF264" opacity="0.7" />
        {/* Cánh mỏng trong suốt */}
        <ellipse cx="23" cy="22" rx="9" ry="5" transform="rotate(-30 23 22)" fill="#FFFFFF" opacity="0.8" stroke="#593A47" strokeWidth="1.8" />
        <ellipse cx="37" cy="22" rx="9" ry="5" transform="rotate(30 37 22)" fill="#FFFFFF" opacity="0.8" stroke="#593A47" strokeWidth="1.8" />
        {/* Thân bé đom đóm */}
        <circle cx="30" cy="34" r="7" fill="#FACC15" stroke="#593A47" strokeWidth="2.2" />
        {/* Đầu nhỏ & râu sao */}
        <circle cx="30" cy="25" r="5" fill="#593A47" />
        <circle cx="28.5" cy="24" r="1.2" fill="#FFFFFF" />
        <circle cx="31.5" cy="24" r="1.2" fill="#FFFFFF" />
        <line x1="28" y1="21" x2="25" y2="16" stroke="#593A47" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="32" y1="21" x2="35" y2="16" stroke="#593A47" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 4. Bé Ốc Sên Vỏ Xoắn Tinh Nghịch (Map 04: Hẻm Xoáy)
  if (type === 'spiral_snail') {
    return (
      <svg viewBox="0 0 80 65" className="w-10 sm:w-12 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.22)]">
        <ellipse cx="38" cy="56" rx="28" ry="4" fill="#593A47" opacity="0.25" />
        {/* Thân ốc sên dẹt mềm mại */}
        <path
          d="M12 52 C18 48, 30 50, 56 50 C66 50, 72 44, 70 38 C68 34, 62 36, 60 42 C48 44, 25 45, 12 52 Z"
          fill="#FFF3B0"
          stroke="#593A47"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* 2 râu mắt tròn ngơ ngác */}
        <line x1="66" y1="38" x2="70" y2="26" stroke="#593A47" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="70" cy="26" r="3" fill="#FFE066" stroke="#593A47" strokeWidth="2" />
        <circle cx="70" cy="25.5" r="1" fill="#593A47" />
        <line x1="62" y1="40" x2="62" y2="28" stroke="#593A47" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="62" cy="28" r="3" fill="#FFE066" stroke="#593A47" strokeWidth="2" />
        <circle cx="62" cy="27.5" r="1" fill="#593A47" />
        {/* Vỏ ốc tròn xoắn ốc 7 màu pastel */}
        <circle cx="34" cy="34" r="19" fill="#E8D7FF" stroke="#593A47" strokeWidth="2.8" />
        <path
          d="M34 22 A12 12 0 1 1 24 38 A7 7 0 1 1 32 34"
          fill="none"
          stroke="#593A47"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="34" cy="34" r="3" fill="#FF85A9" />
        {/* Má hồng */}
        <circle cx="64" cy="43" r="2.5" fill="#FF85A9" opacity="0.75" />
      </svg>
    );
  }

  // 5. Rùa Con Đá Ngọc Lam (Map 04: Hẻm Xoáy Tinh Nghịch)
  if (type === 'gem_turtle') {
    return (
      <svg viewBox="0 0 80 65" className="w-10 sm:w-13 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.22)]">
        <ellipse cx="40" cy="56" rx="25" ry="4.5" fill="#593A47" opacity="0.25" />
        {/* 4 chân bơi dẹt */}
        <ellipse cx="22" cy="50" rx="6" ry="4" fill="#A8DADC" stroke="#593A47" strokeWidth="2.2" />
        <ellipse cx="54" cy="50" rx="6" ry="4" fill="#A8DADC" stroke="#593A47" strokeWidth="2.2" />
        {/* Mai rùa lục giác ngọc lam */}
        <path
          d="M20 44 C20 28, 30 20, 42 20 C54 20, 62 28, 62 44 Z"
          fill="#4EA8DE"
          stroke="#593A47"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="32" r="6" fill="#90E0EF" stroke="#593A47" strokeWidth="2" />
        {/* Đầu rùa mắt to */}
        <circle cx="64" cy="38" r="8" fill="#A8DADC" stroke="#593A47" strokeWidth="2.4" />
        <circle cx="66" cy="36" r="2" fill="#593A47" />
        <circle cx="67" cy="35" r="0.8" fill="#FFFFFF" />
        <circle cx="63" cy="41" r="2" fill="#FF85A9" opacity="0.8" />
      </svg>
    );
  }

  // 6. Thỏ Cung Trăng / Thỏ Tuyết / Thỏ Bong Bóng / Thỏ Kem (Biến thể thỏ)
  if (type === 'moon_bunny' || type === 'snow_bunny' || type === 'bubble_bunny' || type === 'bunny') {
    const isMoon = type === 'moon_bunny';
    const isSnow = type === 'snow_bunny';
    const isBubble = type === 'bubble_bunny';
    const bodyColor = isMoon ? '#E0E7FF' : isBubble ? '#F3E8FF' : '#FFFDF9';

    return (
      <svg viewBox="0 0 86 82" className="w-10 sm:w-12 lg:w-14 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.18)]">
        <ellipse cx="43" cy="74" rx="22" ry="5" fill="#593A47" opacity="0.22" />
        {/* Đuôi bông xù */}
        <circle cx="64" cy="54" r="7" fill={bodyColor} stroke="#593A47" strokeWidth="2.8" />
        {/* Thân tròn */}
        <ellipse cx="44" cy="52" rx="18" ry="14" fill={bodyColor} stroke="#593A47" strokeWidth="3" />
        {/* Chân */}
        <ellipse cx="34" cy="66" rx="6" ry="4" fill={bodyColor} stroke="#593A47" strokeWidth="2.6" />
        <ellipse cx="52" cy="66" rx="6" ry="4" fill={bodyColor} stroke="#593A47" strokeWidth="2.6" />
        {/* Tai thỏ dựng đứng */}
        <ellipse cx="25" cy="18" rx="5.5" ry="14" transform="rotate(-10 25 18)" fill={bodyColor} stroke="#593A47" strokeWidth="2.8" />
        <ellipse cx="25" cy="19" rx="2.8" ry="9" transform="rotate(-10 25 19)" fill="#FFB8D1" />
        <ellipse cx="36" cy="17" rx="5.5" ry="14" transform="rotate(8 36 17)" fill={bodyColor} stroke="#593A47" strokeWidth="2.8" />
        <ellipse cx="36" cy="18" rx="2.8" ry="9" transform="rotate(8 36 18)" fill="#FFB8D1" />
        {/* Đầu */}
        <circle cx="30" cy="38" r="14" fill={bodyColor} stroke="#593A47" strokeWidth="3" />
        <circle cx="25" cy="36" r="2.1" fill="#593A47" />
        <circle cx="34" cy="36" r="2.1" fill="#593A47" />
        <circle cx="29.5" cy="39" r="2" fill="#FF85A9" />
        <circle cx="21" cy="40" r="2.8" fill="#FF9EBB" opacity="0.75" />
        <circle cx="38" cy="40" r="2.8" fill="#FF9EBB" opacity="0.75" />
        {/* Khăn len đỏ cho thỏ tuyết */}
        {isSnow && (
          <path d="M22 47 Q30 52 38 47 L36 57 Z" fill="#E63946" stroke="#593A47" strokeWidth="2" />
        )}
        {/* Ngôi sao nhỏ cho thỏ mặt trăng */}
        {isMoon && (
          <path d="M18 42 L20 46 L24 47 L21 50 L22 54 L18 52 L14 54 L15 50 L12 47 L16 46 Z" fill="#FFE066" stroke="#593A47" strokeWidth="1.5" />
        )}
        {/* Bong bóng cho thỏ bong bóng */}
        {isBubble && (
          <circle cx="18" cy="28" r="6" fill="#C7D2FE" opacity="0.8" stroke="#FFFFFF" strokeWidth="1.5" />
        )}
      </svg>
    );
  }

  // 7. Cún Corgi / Cún Mùa Thu
  if (type === 'puppy' || type === 'autumn_puppy') {
    const isAutumn = type === 'autumn_puppy';
    return (
      <svg viewBox="0 0 95 82" className="w-11 sm:w-13 lg:w-15 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.2)]">
        <ellipse cx="48" cy="74" rx="26" ry="5" fill="#593A47" opacity="0.25" />
        <path d="M68 44 C80 32, 86 44, 76 52" fill="#F4A261" stroke="#593A47" strokeWidth="3" strokeLinecap="round" />
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
        {/* Khăn len vàng ấm cho cún mùa thu */}
        {isAutumn ? (
          <path d="M18 45 Q28 50 38 46 L35 56 Z" fill="#F59E0B" stroke="#593A47" strokeWidth="2.2" />
        ) : (
          <>
            <path d="M20 46 Q28 50 38 45" stroke="#FF6B9D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="27" cy="49" r="3" fill="#FFE066" stroke="#593A47" strokeWidth="1.8" />
          </>
        )}
      </svg>
    );
  }

  // 8. Cú Mèo Tinh Tú (Map 02: Thung Lũng Thiên Văn)
  if (type === 'starlight_owl') {
    return (
      <svg viewBox="0 0 75 75" className="w-10 sm:w-12 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.25)]">
        <ellipse cx="38" cy="68" rx="18" ry="4" fill="#593A47" opacity="0.25" />
        {/* Thân cú mèo tròn màu tím pastel */}
        <ellipse cx="38" cy="42" rx="18" ry="22" fill="#C7D2FE" stroke="#593A47" strokeWidth="2.8" />
        {/* Bụng lông trắng đốm sao */}
        <ellipse cx="38" cy="48" rx="11" ry="13" fill="#FFFDF9" />
        {/* 2 tai nhọn có túm lông */}
        <polygon points="24,24 20,12 30,20" fill="#A5B4FC" stroke="#593A47" strokeWidth="2.2" />
        <polygon points="52,24 56,12 46,20" fill="#A5B4FC" stroke="#593A47" strokeWidth="2.2" />
        {/* 2 mắt to tròn đặc trưng của loài cú */}
        <circle cx="30" cy="35" r="7" fill="#FFE066" stroke="#593A47" strokeWidth="2.2" />
        <circle cx="30" cy="35" r="3.5" fill="#593A47" />
        <circle cx="31" cy="34" r="1.2" fill="#FFFFFF" />
        <circle cx="46" cy="35" r="7" fill="#FFE066" stroke="#593A47" strokeWidth="2.2" />
        <circle cx="46" cy="35" r="3.5" fill="#593A47" />
        <circle cx="47" cy="34" r="1.2" fill="#FFFFFF" />
        {/* Mỏ tam giác nhỏ */}
        <polygon points="38,38 41,43 35,43" fill="#F59E0B" stroke="#593A47" strokeWidth="1.6" />
      </svg>
    );
  }

  // 9. Cừu Mây (Map 01: Đỉnh Đồi Hy Vọng)
  if (type === 'sheep') {
    return (
      <svg viewBox="0 0 92 78" className="w-11 sm:w-13 lg:w-15 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.2)]">
        <ellipse cx="46" cy="70" rx="26" ry="5" fill="#593A47" opacity="0.25" />
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

  // Mặc định: Mèo Tam Thể / Mèo Sao Băng / Mèo Thạch Anh
  const isStarlight = type === 'starlight_cat';
  const catBody = isStarlight ? '#D8B4FE' : '#FFFDF9';

  return (
    <svg viewBox="0 0 90 78" className="w-11 sm:w-13 lg:w-15 h-auto overflow-visible select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.2)]">
      <ellipse cx="45" cy="70" rx="24" ry="5" fill="#593A47" opacity="0.25" />
      <path d="M64 46 C76 34, 82 22, 72 18" fill="none" stroke="#593A47" strokeWidth="6" strokeLinecap="round" />
      <path d="M64 46 C76 34, 82 22, 72 18" fill="none" stroke={isStarlight ? '#F3E8FF' : '#FFD6E7'} strokeWidth="3.2" strokeLinecap="round" />
      <rect x="25" y="38" width="40" height="22" rx="11" fill={catBody} stroke="#593A47" strokeWidth="3" />
      <circle cx="50" cy="45" r="7" fill={isStarlight ? '#C084FC' : '#FFB8D1'} />
      <rect x="29" y="57" width="6.5" height="10" rx="3" fill={catBody} stroke="#593A47" strokeWidth="2.5" />
      <rect x="39" y="58" width="6.5" height="9" rx="3" fill={catBody} stroke="#593A47" strokeWidth="2.5" />
      <rect x="51" y="57" width="6.5" height="10" rx="3" fill={catBody} stroke="#593A47" strokeWidth="2.5" />
      <circle cx="29" cy="34" r="15" fill={catBody} stroke="#593A47" strokeWidth="3" />
      <path d="M18 24 A14 14 0 0 1 30 19 L25 30 Z" fill={isStarlight ? '#A855F7' : '#F6AD6B'} />
      <path d="M16 25 L14 11 L25 19 Z" fill="#FFB8D1" stroke="#593A47" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M32 19 L42 11 L41 25 Z" fill={isStarlight ? '#A855F7' : '#F6AD6B'} stroke="#593A47" strokeWidth="2.8" strokeLinejoin="round" />
      <circle cx="23" cy="33" r="2.1" fill="#593A47" />
      <circle cx="33" cy="33" r="2.1" fill="#593A47" />
      <path d="M26 36 Q28 38 30 36" stroke="#593A47" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="36" r="2.8" fill="#FF9EBB" opacity="0.7" />
      <circle cx="37" cy="36" r="2.8" fill="#FF9EBB" opacity="0.7" />
      <line x1="10" y1="33" x2="16" y2="34" stroke="#593A47" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="10" y1="37" x2="16" y2="37" stroke="#593A47" strokeWidth="1.8" strokeLinecap="round" />
      {/* Vòng hào quang sao cho mèo sao băng */}
      {isStarlight && (
        <circle cx="29" cy="22" r="3" fill="#FFE066" stroke="#593A47" strokeWidth="1.5" />
      )}
    </svg>
  );
}

/**
 * CẤU HÌNH ĐỘNG VẬT NHỎ CHUYÊN BIỆT THEO TỪNG BẢN ĐỒ
 */
export const MAP_PETS_CONFIG = {
  // Map 01: Đỉnh Đồi Hy Vọng (Thỏ, cún corgi, mèo tam thể, cừu mây)
  map_hope_hill: [
    {
      id: 'bunny_hill_left',
      type: 'bunny',
      name: 'Thỏ Kem Nhỏ',
      sound: '🐰 Nhảy chân sáo quanh sườn đồi cỏ hoa~',
      posStyle: { left: '8%', top: '68%' },
      animClass: 'pet-roam-1'
    },
    {
      id: 'puppy_hill_top',
      type: 'puppy',
      name: 'Cún Corgi',
      sound: '🐶 Gâu gâu! Chào bạn đến Đỉnh Đồi Hy Vọng~',
      posStyle: { left: '16%', top: '48%' },
      animClass: 'pet-roam-2'
    },
    {
      id: 'kitty_hill_right',
      type: 'kitty',
      name: 'Mèo Tam Thể',
      sound: '🐱 Meo meo~ Đang sưởi nắng vàng ấm áp!',
      posStyle: { right: '10%', top: '56%' },
      animClass: 'pet-roam-3'
    },
    {
      id: 'sheep_hill_right',
      type: 'sheep',
      name: 'Cừu Mây Bông',
      sound: '🐑 Bêêê~ Cỏ ở Đỉnh Đồi Hy Vọng êm lắm!',
      posStyle: { right: '16%', top: '76%' },
      animClass: 'pet-roam-1'
    },
    {
      id: 'bunny_hill_center',
      type: 'bunny',
      name: 'Thỏ Bông Nhỏ',
      sound: '🥕 Nhăm nhăm~ Chúc bạn một ngày may mắn!',
      posStyle: { left: '44%', top: '66%' },
      animClass: 'pet-roam-3'
    }
  ],

  // Map 02: Thung Lũng Thiên Văn (Đom đóm hồ sen, thỏ cung trăng, mèo sao, cú mèo tinh tú)
  map_astronomy_valley: [
    {
      id: 'firefly_pond_1',
      type: 'firefly_pet',
      name: 'Đom Đóm Tinh Tú',
      sound: '✨ Lập lòe~ Gom ánh sao đêm tặng bạn nè!',
      posStyle: { left: '60%', top: '56%' },
      animClass: 'pet-roam-2'
    },
    {
      id: 'firefly_pond_2',
      type: 'firefly_pet',
      name: 'Đom Đóm Ngân Hà',
      sound: '✨ Chớp chớp~ Chiếu sáng mặt hồ hoa đăng!',
      posStyle: { left: '76%', top: '44%' },
      animClass: 'pet-roam-1'
    },
    {
      id: 'moon_bunny_left',
      type: 'moon_bunny',
      name: 'Thỏ Cung Trăng',
      sound: '🌙 Ngắm vầng trăng khuyết dịu êm cùng bạn~',
      posStyle: { left: '10%', top: '60%' },
      animClass: 'pet-roam-3'
    },
    {
      id: 'starlight_cat_center',
      type: 'starlight_cat',
      name: 'Mèo Sao Băng',
      sound: '🐾 Meo~ Ước gì đêm nào bầu trời cũng ngập sao băng!',
      posStyle: { left: '42%', top: '44%' },
      animClass: 'pet-roam-1'
    },
    {
      id: 'starlight_owl_right',
      type: 'starlight_owl',
      name: 'Cú Mèo Tinh Vân',
      sound: '🦉 Cúc cu~ Vũ trụ đang lắng nghe điều ước của bạn!',
      posStyle: { right: '12%', top: '64%' },
      animClass: 'pet-roam-2'
    }
  ],

  // Map 03: Ngõ Thời Tiết (Gà con, gà trống cối xay gió, cún mùa thu, thỏ tuyết)
  map_weather_lane: [
    {
      id: 'chick_weather_center',
      type: 'chick',
      name: 'Gà Con Lông Vàng',
      sound: '🐥 Chiếp chiếp! Chong chóng gió quay tít kìa~',
      posStyle: { left: '48%', top: '62%' },
      animClass: 'pet-roam-1'
    },
    {
      id: 'rooster_weather_windmill',
      type: 'rooster',
      name: 'Gà Trống Hoa Mơ',
      sound: '🐓 Ò ó o~ Cối xay gió quay đón ngày mới ấm áp!',
      posStyle: { left: '28%', top: '38%' },
      animClass: 'pet-roam-2'
    },
    {
      id: 'autumn_puppy_left',
      type: 'autumn_puppy',
      name: 'Cún Khăn Len',
      sound: '🍂 Gâu gâu! Lá phong mùa thu rơi xào xạc ấm ghê~',
      posStyle: { left: '22%', top: '76%' },
      animClass: 'pet-roam-3'
    },
    {
      id: 'snow_bunny_right',
      type: 'snow_bunny',
      name: 'Thỏ Tuyết Trắng',
      sound: '❄️ Lăn tròn trên tuyết xốp mát lạnh vui quá!',
      posStyle: { right: '14%', top: '72%' },
      animClass: 'pet-roam-1'
    }
  ],

  // Map 04: Hẻm Xoáy Tinh Nghịch (Ốc sên xoắn ốc, rùa đá ngọc lam, thỏ bong bóng, mèo thạch anh)
  map_mischief_alley: [
    {
      id: 'spiral_snail_center',
      type: 'spiral_snail',
      name: 'Bé Ốc Sên Xoắn',
      sound: '🐌 Chầm chậm thôi nhé, tận hưởng từng bước chân diệu kỳ~',
      posStyle: { left: '48%', top: '46%' },
      animClass: 'pet-roam-2'
    },
    {
      id: 'bubble_bunny_top',
      type: 'bubble_bunny',
      name: 'Thỏ Bong Bóng',
      sound: '🫧 Bốp! Bong bóng xà phòng vỡ tan vui quá đi à!',
      posStyle: { left: '64%', top: '42%' },
      animClass: 'pet-roam-1'
    },
    {
      id: 'gem_turtle_left',
      type: 'gem_turtle',
      name: 'Rùa Đá Ngọc Lam',
      sound: '🐢 Tắm trong vũng nước sao lấp lánh mát rượi~',
      posStyle: { left: '32%', top: '68%' },
      animClass: 'pet-roam-3'
    },
    {
      id: 'cosmic_kitty_right',
      type: 'kitty',
      name: 'Mèo Thạch Anh',
      sound: '🔮 Meo meo~ Hồ Xoáy Ngân Hà đang xoay tròn lung linh!',
      posStyle: { right: '12%', top: '76%' },
      animClass: 'pet-roam-2'
    }
  ]
};

export default function TownSideScenery({ currentMapId = 'map_hope_hill' }) {
  const [activePetBubble, setActivePetBubble] = useState(null);

  const activePets = MAP_PETS_CONFIG[currentMapId] || MAP_PETS_CONFIG.map_hope_hill;

  const handlePetClick = (pet) => {
    setActivePetBubble(pet.id);
    setTimeout(() => {
      setActivePetBubble((prev) => (prev === pet.id ? null : prev));
    }, 2800);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {activePets.map((pet) => (
        <div
          key={pet.id}
          style={pet.posStyle}
          className="absolute pointer-events-auto z-20"
        >
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
            <span className="-mt-1 px-2 py-0.5 rounded-full bg-white/90 border border-[#593A47] text-[9px] font-extrabold text-[#593A47] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
              🐾 {pet.name}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
