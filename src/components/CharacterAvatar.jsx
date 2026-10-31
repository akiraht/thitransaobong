import React from 'react';
import { CHARACTER_SPRITES, TOWN_CHARACTERS } from '../data/characterSprites';

export default function CharacterAvatar({ id, className = 'w-20 h-20' }) {
  const charMeta = TOWN_CHARACTERS.find((c) => c.id === id) || TOWN_CHARACTERS[0];
  const src = CHARACTER_SPRITES[id] || CHARACTER_SPRITES.star;

  return (
    <img
      src={src}
      alt={charMeta.name}
      draggable={false}
      className={`${className} ${charMeta.animClass} object-contain select-none drop-shadow-[0_4px_6px_rgba(89,58,71,0.18)]`}
    />
  );
}
