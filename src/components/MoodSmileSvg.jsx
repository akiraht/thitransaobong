import React from 'react';

export default function MoodSmileSvg({ mood }) {
  if (mood === 'happy') {
    return (
      <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" fill="#FFE066" stroke="#593A47" strokeWidth="4" />
        <path
          d="M52 14C56 8 64 12 60 18C66 16 68 24 60 24C54 24 52 18 52 14Z"
          fill="#FF7597"
          stroke="#593A47"
          strokeWidth="2.5"
        />
        <path d="M23 36C25 30 32 30 34 36" stroke="#593A47" strokeWidth="4" strokeLinecap="round" />
        <path d="M46 36C48 30 55 30 57 36" stroke="#593A47" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="22" cy="44" rx="6" ry="3.5" fill="#FF85A9" />
        <ellipse cx="58" cy="44" rx="6" ry="3.5" fill="#FF85A9" />
        <path
          d="M28 45C28 54 52 54 52 45Z"
          fill="#FF6B8B"
          stroke="#593A47"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (mood === 'excited') {
    return (
      <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" fill="#FFB8D0" stroke="#593A47" strokeWidth="4" />
        <circle cx="28" cy="36" r="5" fill="#593A47" />
        <path d="M28 32L29.2 34.8L32 36L29.2 37.2L28 40L26.8 37.2L24 36L26.8 34.8L28 32Z" fill="#FFF" />
        <circle cx="52" cy="36" r="5" fill="#593A47" />
        <path d="M52 32L53.2 34.8L56 36L53.2 37.2L52 40L50.8 37.2L48 36L50.8 34.8L52 32Z" fill="#FFF" />
        <path d="M19 45C17 42 13 44 16 48L19 50L22 48C25 44 21 42 19 45Z" fill="#FF4D79" />
        <path d="M61 45C59 42 55 44 58 48L61 50L64 48C67 44 63 42 61 45Z" fill="#FF4D79" />
        <path
          d="M31 46C34 51 39 50 40 46C41 50 46 51 49 46"
          stroke="#593A47"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (mood === 'normal') {
    return (
      <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" fill="#A8F0CB" stroke="#593A47" strokeWidth="4" />
        <path d="M40 8V14" stroke="#593A47" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M40 10C34 4 28 9 34 13C37 15 40 12 40 10Z" fill="#52B788" stroke="#593A47" strokeWidth="2.5" />
        <path d="M40 10C46 4 52 9 46 13C43 15 40 12 40 10Z" fill="#74C69D" stroke="#593A47" strokeWidth="2.5" />
        <circle cx="28" cy="37" r="4" fill="#593A47" />
        <circle cx="26.8" cy="35.5" r="1.4" fill="#FFFFFF" />
        <circle cx="52" cy="37" r="4" fill="#593A47" />
        <circle cx="50.8" cy="35.5" r="1.4" fill="#FFFFFF" />
        <ellipse cx="22" cy="44" rx="5.5" ry="3" fill="#FF9EBB" />
        <ellipse cx="58" cy="44" rx="5.5" ry="3" fill="#FF9EBB" />
        <path d="M32 47C36 52 44 52 48 47" stroke="#593A47" strokeWidth="3.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (mood === 'tired') {
    return (
      <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" fill="#D8C2FF" stroke="#593A47" strokeWidth="4" />
        <path d="M23 36C26 39 32 39 35 36" stroke="#593A47" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M45 36C48 39 54 39 57 36" stroke="#593A47" strokeWidth="3.8" strokeLinecap="round" />
        <ellipse cx="22" cy="44" rx="5" ry="3" fill="#FF9EBB" />
        <ellipse cx="58" cy="44" rx="5" ry="3" fill="#FF9EBB" />
        <path d="M31 49C34 46 37 51 40 48C43 45 46 50 49 47" stroke="#593A47" strokeWidth="3.5" strokeLinecap="round" />
        <text x="54" y="24" fill="#593A47" fontSize="12" fontWeight="800">
          zZ
        </text>
      </svg>
    );
  }
  return (
    <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" fill="#B8E1FF" stroke="#593A47" strokeWidth="4" />
      <path d="M22 30L32 33" stroke="#593A47" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 30L48 33" stroke="#593A47" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="38" r="4.5" fill="#593A47" />
      <circle cx="26.8" cy="36.5" r="1.6" fill="#FFFFFF" />
      <circle cx="52" cy="38" r="4.5" fill="#593A47" />
      <circle cx="50.8" cy="36.5" r="1.6" fill="#FFFFFF" />
      <path d="M22 43C22 43 19 48 22 50C25 48 22 43 22 43Z" fill="#4EA8DE" stroke="#593A47" strokeWidth="2" />
      <ellipse cx="24" cy="45" rx="4.5" ry="2.5" fill="#FF9EBB" />
      <ellipse cx="56" cy="45" rx="4.5" ry="2.5" fill="#FF9EBB" />
      <path d="M33 51C36 46 44 46 47 51" stroke="#593A47" strokeWidth="3.8" strokeLinecap="round" />
    </svg>
  );
}

