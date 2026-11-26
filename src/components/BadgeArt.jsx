import React, { useEffect, useState } from 'react';

/**
 * Hiển thị hình ảnh huy hiệu WebP với fallback tự động về emoji
 * nếu file ảnh chưa có hoặc lỗi tải, kèm hiệu ứng ánh sáng cho bậc Kim Cương / Pha Lê Sao.
 */
export default function BadgeArt({
  image,
  emoji = '🏅',
  alt = 'Huy hiệu',
  tierKey = 'bronze',
  unlocked = true,
  sizeClass = 'w-11 h-11',
  emojiClass = 'text-2xl',
  showAura = true,
  className = '',
}) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [image]);

  const auraClass =
    unlocked && showAura
      ? tierKey === 'crystal'
        ? 'badge-aura-crystal'
        : tierKey === 'diamond'
          ? 'badge-aura-diamond'
          : tierKey === 'gold'
            ? 'badge-aura-gold'
            : ''
      : '';

  if (!image || imgFailed) {
    return (
      <span
        className={`inline-flex items-center justify-center leading-none select-none ${sizeClass} ${emojiClass} ${
          unlocked ? auraClass : 'grayscale opacity-50'
        } ${className}`}
        aria-label={alt}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={image}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setImgFailed(true)}
      className={`${sizeClass} object-contain select-none transition-transform duration-200 ${
        unlocked
          ? `${auraClass}`
          : 'grayscale opacity-45 brightness-90 contrast-75'
      } ${className}`}
    />
  );
}
