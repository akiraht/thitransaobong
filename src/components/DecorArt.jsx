import React, { useState } from 'react';

/**
 * Hiển thị ảnh vật phẩm trang trí nhà (`public/images/decor/{itemId}.webp`)
 * Tự động fallback mượt về emoji kawaii nếu chưa bổ sung ảnh WebP.
 */
export default function DecorArt({ item, className = 'w-10 h-10 text-2xl' }) {
  const [imgError, setImgError] = useState(false);

  if (!item) return null;

  if (!imgError && item.image) {
    return (
      <img
        src={item.image}
        alt={item.name}
        onError={() => setImgError(true)}
        className={`${className} object-contain drop-shadow-[0_2px_3px_rgba(89,58,71,0.3)] select-none pointer-events-none`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={item.name}
      className={`${className} inline-flex items-center justify-center leading-none drop-shadow-[0_2px_2px_rgba(89,58,71,0.28)] select-none pointer-events-none`}
    >
      {item.icon}
    </span>
  );
}
