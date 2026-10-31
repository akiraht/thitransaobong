import React from 'react';
import CharacterAvatar from './CharacterAvatar';

export default function ComicSpeechModal({
  character,
  isNightMode,
  isMusicPlaying,
  onClose,
  onTriggerSkill
}) {
  if (!character) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#593A47]/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      {/* COMIC BOOK STYLE DIALOG BOX */}
      <div className="comic-speech-box w-full max-w-2xl p-6 sm:p-7 relative pop-in">
        {/* Nhãn Comic vát nghiêng trên góc trái */}
        <div
          style={{ backgroundColor: character.roofColor }}
          className="absolute -top-4 left-6 -rotate-2 px-4 py-1 rounded-xl border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47] font-extrabold text-sm sm:text-base text-[#593A47] uppercase tracking-wider"
        >
          💬 Hộp Thoại Cư Dân • {character.houseNumber}
        </div>

        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
          className="kawaii-btn w-10 h-10 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-extrabold text-lg flex items-center justify-center absolute -top-4 -right-3"
        >
          ✕
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-5 mt-2">
          {/* Khung Avatar Nhân Vật kiểu Truyện Tranh */}
          <div className="relative shrink-0">
            <div
              style={{ backgroundColor: character.badgeBg }}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-[3.5px] border-[#593A47] shadow-[0_6px_0_#593A47] flex items-center justify-center p-2 relative overflow-visible"
            >
              <CharacterAvatar id={character.id} className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
            <span className="absolute -bottom-2.5 inset-x-2 text-center px-2 py-0.5 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-[10px] font-extrabold text-[#593A47]">
              {character.houseName}
            </span>
          </div>

          {/* Nội dung Hội Thoại Truyện Tranh */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#593A47]">{character.name}</h3>
              <span
                style={{ backgroundColor: character.badgeBg }}
                className="px-3 py-0.5 rounded-full border-2 border-[#593A47] text-xs sm:text-sm font-extrabold text-[#593A47]"
              >
                {character.role}
              </span>
            </div>

            {/* Bong bóng lời thoại có đuôi nhọn kiểu Comic */}
            <div className="relative p-3.5 rounded-2xl bg-white border-[3px] border-[#593A47] shadow-[4px_4px_0_#593A47] mb-4">
              <p className="text-sm sm:text-base font-extrabold text-[#593A47] leading-relaxed">
                &ldquo;{character.greeting}&rdquo;
              </p>
            </div>

            {/* Khung giới thiệu Kỹ Năng Đặc Biệt của Nhân vật */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF2] border-[2.5px] border-dashed border-[#593A47] space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-extrabold text-[#D9386A]">
                <span>⚡ KỸ NĂNG ĐẶC BIỆT:</span>
                <span className="underline">{character.skillName}</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#7D5867] leading-relaxed">{character.skillDesc}</p>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => onTriggerSkill(character.id)}
                  className="kawaii-btn bg-gradient-to-r from-[#FF85A9] to-[#FFA6C1] hover:from-[#FF6E99] hover:to-[#FF94B4] text-[#593A47] font-extrabold text-sm sm:text-base px-5 py-2 flex items-center gap-1.5"
                >
                  <span>
                    {character.id === 'moon'
                      ? isNightMode
                        ? '☀️ Chuyển sang Ban Ngày'
                        : '🌙 Thắp Đèn Bầu Trời Đêm'
                      : character.id === 'spark'
                      ? isMusicPlaying
                        ? '🔇 Tắt Đài Nhạc Lofi'
                        : '🎧 Bật Đài Nhạc Lofi'
                      : character.skillActionLabel}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
