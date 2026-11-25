import React from 'react';
import { CHARACTER_SPRITES } from '../data/characterSprites';

/**
 * Nền minh họa tĩnh kiểu truyện tranh Doraemon (SVG vẽ nét nâu đậm #593A47 + tông màu pastel)
 */
function MangaBackgroundSvg({ scene = 'hill_road' }) {
  if (scene === 'wind_fly') {
    // Speed lines chéo năng động + lá bay vèo vèo
    return (
      <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="20" y1="30" x2="180" y2="10" stroke="#593A47" strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
        <line x1="80" y1="75" x2="340" y2="45" stroke="#593A47" strokeWidth="2" strokeOpacity="0.22" strokeLinecap="round" />
        <line x1="10" y1="130" x2="290" y2="95" stroke="#593A47" strokeWidth="1.8" strokeOpacity="0.18" strokeLinecap="round" />
        <line x1="140" y1="175" x2="390" y2="140" stroke="#593A47" strokeWidth="2.2" strokeOpacity="0.22" strokeLinecap="round" />
        <path d="M 35 160 Q 110 120 190 145 Q 250 160 365 110" fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="8 6" strokeOpacity="0.45" />
        {/* Cánh lá bay */}
        <ellipse cx="95" cy="52" rx="7" ry="3.5" transform="rotate(-24 95 52)" fill="#86EFAC" stroke="#593A47" strokeWidth="1.5" />
        <ellipse cx="315" cy="115" rx="6" ry="3" transform="rotate(18 315 115)" fill="#86EFAC" stroke="#593A47" strokeWidth="1.5" />
      </svg>
    );
  }

  if (scene === 'bakery') {
    // Mái hiên tiệm bánh sọc hồng trắng + bàn gỗ ấm
    return (
      <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <g opacity="0.55">
          {[0, 50, 100, 150, 200, 250, 300, 350].map((x, i) => (
            <path
              key={x}
              d={`M ${x} 0 H ${x + 50} V 22 Q ${x + 25} 34 ${x} 22 Z`}
              fill={i % 2 === 0 ? '#FFB3C6' : '#FFFFFF'}
              stroke="#593A47"
              strokeWidth="1.5"
            />
          ))}
        </g>
        {/* Mặt đất / Sàn gỗ tiệm bánh */}
        <path d="M 0 178 Q 200 168 400 178 L 400 220 L 0 220 Z" fill="#FDE68A" stroke="#593A47" strokeWidth="2" />
      </svg>
    );
  }

  if (scene === 'night_sky') {
    // Trời đêm cực quang + trăng + sao
    return (
      <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <path d="M 0 65 Q 110 25 220 55 T 400 40 L 400 88 Q 280 110 170 80 T 0 100 Z" fill="#C4B5FD" opacity="0.4" />
        <circle cx="52" cy="40" r="2.5" fill="#FDE047" />
        <circle cx="150" cy="28" r="2" fill="#FDE047" />
        <circle cx="290" cy="36" r="2.8" fill="#FDE047" />
        <circle cx="355" cy="60" r="2" fill="#FDE047" />
        <path d="M 0 182 Q 200 168 400 182 L 400 220 L 0 220 Z" fill="#DDD6FE" stroke="#593A47" strokeWidth="2" />
      </svg>
    );
  }

  if (scene === 'celebration') {
    // Tia sáng hội tụ kiểu Manga burst khi ăn mừng
    return (
      <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <g stroke="#F59E0B" strokeWidth="1.8" strokeOpacity="0.32">
          <line x1="200" y1="110" x2="10" y2="10" />
          <line x1="200" y1="110" x2="100" y2="0" />
          <line x1="200" y1="110" x2="300" y2="0" />
          <line x1="200" y1="110" x2="395" y2="15" />
          <line x1="200" y1="110" x2="395" y2="185" />
          <line x1="200" y1="110" x2="10" y2="185" />
        </g>
        <path d="M 0 182 Q 200 172 400 182 L 400 220 L 0 220 Z" fill="#FBCFE8" stroke="#593A47" strokeWidth="2" />
      </svg>
    );
  }

  if (scene === 'cafe_sunset') {
    // Hoàng hôn cam hồng + mặt trời lặn
    return (
      <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <circle cx="200" cy="145" r="46" fill="#FDBA74" opacity="0.55" />
        <path d="M 0 176 Q 200 162 400 176 L 400 220 L 0 220 Z" fill="#FED7AA" stroke="#593A47" strokeWidth="2" />
      </svg>
    );
  }

  // Mặc định: Sườn đồi cỏ xanh, mây trời & lối đá cuội kiểu Doraemon ngoài trời
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Đám mây vẽ nét */}
      <path d="M 38 42 Q 46 28 62 32 Q 74 22 88 34 Q 100 34 98 46 Q 98 54 84 54 L 46 54 Q 34 54 38 42 Z" fill="#FFFFFF" fillOpacity="0.8" stroke="#593A47" strokeWidth="1.4" />
      <path d="M 305 34 Q 312 24 326 27 Q 338 20 348 30 Q 358 30 356 40 Q 356 46 344 46 L 312 46 Q 302 46 305 34 Z" fill="#FFFFFF" fillOpacity="0.8" stroke="#593A47" strokeWidth="1.4" />
      {/* Sườn đồi cỏ xanh */}
      <path d="M 0 176 Q 120 158 230 172 T 400 170 L 400 220 L 0 220 Z" fill="#BBF7D0" stroke="#593A47" strokeWidth="2" />
      {/* Đá cuội nhỏ trên cỏ */}
      <ellipse cx="170" cy="196" rx="18" ry="6" fill="#FEF3C7" stroke="#593A47" strokeWidth="1.4" />
      <ellipse cx="222" cy="202" rx="14" ry="5" fill="#FEF3C7" stroke="#593A47" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * Đạo cụ tương tác vẽ tĩnh nằm giữa khung tranh
 */
function ScenePropSvg({ prop }) {
  if (!prop) return null;
  const propsMap = {
    croissant: { emoji: '🥐', badge: 'Nóng hổi~', bg: '#FFF3B0' },
    cocoa: { emoji: '☕', badge: 'Thơm phức', bg: '#FFEDD5' },
    rolling_bread: { emoji: '🥐💨', badge: 'Lăn tròn!', bg: '#FEF08A' },
    letter: { emoji: '💌', badge: 'Thư sao', bg: '#FFE4EE' },
    flower_paper: { emoji: '🌼🍃', badge: 'Bay lên~', bg: '#DCFCE7' },
    spoon: { emoji: '🥄✨', badge: 'Xoay tít!', bg: '#E0E7FF' },
    bubble: { emoji: '🫧', badge: 'Khổng lồ!', bg: '#F3E8FF' },
    icecream: { emoji: '🍨', badge: 'Mát lạnh', bg: '#E0F2FE' },
    camera: { emoji: '📸', badge: 'Tách!', bg: '#FFEDD5' },
    tea: { emoji: '🍵', badge: 'Ấm lòng', bg: '#F3E8FF' },
    candy: { emoji: '🍬', badge: 'Ngọt ngào', bg: '#FCE7F3' },
  };
  const meta = propsMap[prop];
  if (!meta) return null;

  return (
    <div className="flex flex-col items-center justify-center shrink-0 px-1 -mb-1 z-10">
      <div
        style={{ backgroundColor: meta.bg }}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#593A47] shadow-[0_2px_0_#593A47] flex items-center justify-center text-lg sm:text-xl"
      >
        {meta.emoji}
      </div>
      <span className="mt-0.5 px-1.5 py-0.2 rounded bg-white/90 border border-[#593A47] text-[8.5px] font-black text-[#593A47] whitespace-nowrap">
        {meta.badge}
      </span>
    </div>
  );
}

/**
 * Dấu hiệu biểu cảm manga tĩnh gắn cạnh đầu nhân vật (giống Doraemon)
 */
function MangaMoodStamp({ mood }) {
  const map = {
    shock: { text: '?!', cls: 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626] rotate-6' },
    panic: { text: '💦', cls: 'bg-[#E0F2FE] text-[#0284C7] border-[#0284C7] -rotate-6' },
    happy: { text: '✨', cls: 'bg-[#FEF9C3] text-[#CA8A04] border-[#CA8A04] rotate-6' },
    music: { text: '♪', cls: 'bg-[#FCE7F3] text-[#DB2777] border-[#DB2777] -rotate-12' },
    sleepy: { text: 'Zzz', cls: 'bg-[#EDE9FE] text-[#7C3AED] border-[#7C3AED] rotate-6' },
    angry: { text: '💢', cls: 'bg-[#FEE2E2] text-[#B91C1C] border-[#B91C1C] rotate-12' },
    blush: { text: '💕', cls: 'bg-[#FFE4EE] text-[#E11D48] border-[#E11D48] -rotate-6' },
    think: { text: '?', cls: 'bg-[#FFF3B0] text-[#593A47] border-[#593A47] rotate-6' },
    windy: { text: '💨', cls: 'bg-[#DCFCE7] text-[#15803D] border-[#15803D] -rotate-6' },
  };
  const item = map[mood];
  if (!item) return null;
  return (
    <span
      className={`absolute -top-2 -right-2 z-20 px-1.5 py-0.5 rounded-full border-[1.5px] text-[10px] font-black leading-none shadow-sm ${item.cls}`}
    >
      {item.text}
    </span>
  );
}

/**
 * Bong bóng thoại chuẩn Manga / Doraemon (hỗ trợ thường / hét răng cưa / suy nghĩ đám mây)
 */
function MangaSpeechBubble({ speaker, speech, bubbleType = 'normal', tailSide = 'center' }) {
  const isShout = bubbleType === 'shout';
  const isThought = bubbleType === 'thought';

  const tailPosClass =
    tailSide === 'left'
      ? 'left-6'
      : tailSide === 'right'
      ? 'right-6'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className={`relative w-full px-2.5 py-1.5 text-left ${
        isShout
          ? 'bg-[#FFF9DB] rounded-2xl border-[2.5px] border-[#D9386A] shadow-[2px_2px_0_#D9386A]'
          : isThought
          ? 'bg-white rounded-[22px] border-2 border-dashed border-[#593A47] shadow-[2px_2px_0_rgba(89,58,71,0.35)]'
          : 'bg-white rounded-[18px] border-2 border-[#593A47] shadow-[2px_2px_0_#593A47]'
      }`}
    >
      <div className="text-[9.5px] font-black text-[#D9386A] leading-none mb-0.5 truncate">
        {speaker}
      </div>
      <p
        className={`text-[11px] sm:text-xs leading-snug ${
          isShout ? 'font-black text-[#9F1239]' : 'font-extrabold text-[#593A47]'
        }`}
      >
        {speech}
      </p>

      {/* Đuôi bong bóng */}
      {isThought ? (
        <div className={`absolute -bottom-3 ${tailPosClass} flex flex-col items-center gap-0.5`}>
          <span className="w-2 h-2 rounded-full bg-white border-[1.5px] border-[#593A47]" />
          <span className="w-1.5 h-1.5 rounded-full bg-white border-[1.5px] border-[#593A47]" />
        </div>
      ) : (
        <div
          className={`absolute -bottom-1.5 ${tailPosClass} w-2.5 h-2.5 rotate-45 ${
            isShout
              ? 'bg-[#FFF9DB] border-r-[2.5px] border-b-[2.5px] border-[#D9386A]'
              : 'bg-white border-r-2 border-b-2 border-[#593A47]'
          }`}
        />
      )}
    </div>
  );
}

/**
 * KHUNG TRANH MANGA TĨNH (KHÔNG ANIMATION ĐỘNG, GIỐNG TRUYỆN TRANH DORAEMON)
 * - Tự động suy luận bối cảnh, biểu cảm và tư thế từ nội dung nếu kịch bản AI không truyền đủ trường.
 */
export default function MangaScenePanel({ panel, isWide = false }) {
  const chars = panel?.characters || [];

  // Tự động nhận diện scene / mood / prop thông minh nếu panel thiếu metadata
  const combinedText = `${panel?.narration || ''} ${panel?.sfx || ''} ${chars.map((c) => c.speech).join(' ')}`.toLowerCase();
  const inferredScene =
    panel?.scene ||
    (combinedText.includes('gió') || combinedText.includes('vù') || combinedText.includes('bay')
      ? 'wind_fly'
      : combinedText.includes('bánh') || combinedText.includes('lò')
      ? 'bakery'
      : combinedText.includes('đêm') || combinedText.includes('cực quang') || combinedText.includes('ngủ')
      ? 'night_sky'
      : combinedText.includes('hoàng hôn') || combinedText.includes('cacao') || combinedText.includes('chiều')
      ? 'cafe_sunset'
      : combinedText.includes('hoan hô') || combinedText.includes('cạn ly') || combinedText.includes('hết tập') || combinedText.includes('the end')
      ? 'celebration'
      : 'hill_road');

  const inferredProp =
    panel?.prop ||
    (combinedText.includes('bánh') && combinedText.includes('lăn')
      ? 'rolling_bread'
      : combinedText.includes('bánh')
      ? 'croissant'
      : combinedText.includes('cacao')
      ? 'cocoa'
      : combinedText.includes('trà')
      ? 'tea'
      : combinedText.includes('thư')
      ? 'letter'
      : combinedText.includes('thìa')
      ? 'spoon'
      : combinedText.includes('bong bóng')
      ? 'bubble'
      : combinedText.includes('kem')
      ? 'icecream'
      : combinedText.includes('chụp')
      ? 'camera'
      : combinedText.includes('kẹo')
      ? 'candy'
      : combinedText.includes('hoa') || combinedText.includes('bồ công anh')
      ? 'flower_paper'
      : null);

  const inferCharMood = (ch) => {
    if (ch.mood) return ch.mood;
    const t = (ch.speech || '').toLowerCase();
    if (t.includes('á!') || t.includes('khoan') || t.includes('biến đâu')) return 'shock';
    if (t.includes('hừ') || t.includes('hứ')) return 'angry';
    if (t.includes('khò') || t.includes('ngủ') || t.includes('oáp')) return 'sleepy';
    if (t.includes('đỏ mặt') || t.includes('cảm động') || t.includes('ấm áp')) return 'blush';
    if (t.includes('?') || t.includes('sao nhỉ')) return 'think';
    if (t.includes('vù') || t.includes('gió') || t.includes('bay')) return 'windy';
    if (t.includes('hihi') || t.includes('hoan hô') || t.includes('tuyệt')) return 'happy';
    return 'happy';
  };

  const inferBubbleType = (ch) => {
    if (ch.bubbleType) return ch.bubbleType;
    const t = ch.speech || '';
    if (t.includes('!') && (t.includes('Á') || t.includes('Khoan') || t.includes('Hô biến') || t.includes('Hoan hô'))) {
      return 'shout';
    }
    if (t.includes('...') && t.includes('?')) return 'thought';
    return 'normal';
  };

  const getPoseTransform = (ch, idx, total) => {
    // Nhân vật bên phải quay mặt sang trái nhìn đối diện nhân vật bên trái để tạo tương tác!
    const flipX = total > 1 && idx === 1 ? -1 : 1;
    const mood = inferCharMood(ch);
    const tilt =
      ch.pose === 'lean' || mood === 'windy'
        ? flipX * 10
        : mood === 'shock'
        ? flipX * -8
        : mood === 'happy'
        ? flipX * 4
        : 0;
    return `scaleX(${flipX}) rotate(${tilt}deg)`;
  };

  return (
    <div
      style={{ backgroundColor: panel?.bgTint || '#FFFDF5' }}
      className={`relative rounded-xl border-[2.5px] border-[#593A47] shadow-[3px_3px_0_#593A47] p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden ${
        isWide ? 'col-span-2 min-h-[178px]' : 'col-span-1 min-h-[172px]'
      }`}
    >
      {/* 1. LỚP NỀN VẼ TĨNH MANGA */}
      <MangaBackgroundSvg scene={inferredScene} />

      {/* 2. DẢI TRÊN: HỘP DẪN CHUYỆN & TỪ TƯỢNG THANH MANGA */}
      {(panel?.narration || panel?.sfx) && (
        <div className="relative z-20 flex items-start justify-between gap-1.5 mb-1.5">
          {panel?.narration ? (
            <div className="px-2 py-0.5 rounded bg-[#FFF3B0] border-[1.5px] border-[#593A47] text-[10px] font-black text-[#593A47] leading-tight text-left shadow-[1px_1px_0_#593A47]">
              {panel.narration}
            </div>
          ) : (
            <span />
          )}
          {panel?.sfx && (
            <span className="shrink-0 -rotate-6 px-2 py-0.5 rounded-md bg-white border-2 border-[#D9386A] text-[10px] sm:text-[11px] font-black text-[#D9386A] tracking-wider shadow-[2px_2px_0_#D9386A]">
              {panel.sfx}
            </span>
          )}
        </div>
      )}

      {/* 3. BỐ CỤC TƯƠNG TÁC NHÂN VẬT + BONG BÓNG THOẠI SO LE + ĐẠO CỤ */}
      <div className="relative z-10 flex-1 flex flex-col justify-end gap-2">
        {/* Hàng bong bóng thoại (xếp so le cao-thấp khi có 2 nhân vật đối đáp nhau) */}
        <div className={`grid gap-2 items-start ${chars.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {chars.map((ch, idx) => (
            <div key={`b_${ch.id}_${idx}`} className={chars.length > 1 && idx === 1 ? 'mt-3' : ''}>
              <MangaSpeechBubble
                speaker={ch.name}
                speech={ch.speech}
                bubbleType={inferBubbleType(ch)}
                tailSide={chars.length > 1 ? (idx === 0 ? 'left' : 'right') : 'center'}
              />
            </div>
          ))}
        </div>

        {/* Hàng nhân vật vẽ tĩnh đứng đối diện nhau + đạo cụ ở giữa */}
        <div className="flex items-end justify-around gap-1 pt-1">
          {chars.map((ch, idx) => {
            const spriteSrc = CHARACTER_SPRITES[ch.id] || CHARACTER_SPRITES.star;
            const mood = inferCharMood(ch);
            return (
              <React.Fragment key={`c_${ch.id}_${idx}`}>
                {/* Chèn đạo cụ tương tác vào giữa 2 nhân vật */}
                {chars.length > 1 && idx === 1 && inferredProp && <ScenePropSvg prop={inferredProp} />}

                <div className="relative flex flex-col items-center">
                  <MangaMoodStamp mood={mood} />
                  <img
                    src={spriteSrc}
                    alt={ch.name}
                    draggable={false}
                    style={{ transform: getPoseTransform(ch, idx, chars.length) }}
                    className={`${
                      chars.length > 1 ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-16 h-16 sm:w-[72px] sm:h-[72px]'
                    } object-contain select-none drop-shadow-[0_3px_0_rgba(89,58,71,0.3)]`}
                  />
                  {/* Bóng đứng tĩnh trên mặt đất */}
                  <div className="w-11 h-2 -mt-1 rounded-full bg-[#593A47]/20" />
                </div>

                {/* Nếu chỉ có 1 nhân vật mà có đạo cụ thì đặt kế bên */}
                {chars.length === 1 && inferredProp && <ScenePropSvg prop={inferredProp} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
