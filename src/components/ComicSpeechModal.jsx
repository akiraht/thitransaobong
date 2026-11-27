import React, { useEffect } from 'react';
import CharacterAvatar from './CharacterAvatar';
import { getMiniGameByNpcId } from '../config/minigamesConfig';
import { getDailyPlayInfo, isMiniGameUnlocked } from '../utils/miniGameEconomy';

export default function ComicSpeechModal({
  character,
  isNightMode,
  isMusicPlaying,
  questInfo = null,
  onClose,
  onTriggerSkill
}) {
  useEffect(() => {
    if (!character) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [character, onClose]);

  if (!character) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[950] bg-[#593A47]/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      {/* COMIC BOOK STYLE DIALOG BOX */}
      <div className="comic-speech-box w-full max-w-2xl p-6 sm:p-7 relative pop-in">
        {/* Nhãn Comic vát nghiêng trên góc trái */}
        <div
          style={{ backgroundColor: character.roofColor }}
          className="comic-badge-tag absolute -top-4 left-6 -rotate-2 px-4 py-1 rounded-xl border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47] font-extrabold text-sm sm:text-base text-[#593A47] uppercase tracking-wider"
        >
          💬 Hộp Thoại Cư Dân • {character.houseNumber}
        </div>

        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
          className="comic-close-btn kawaii-btn w-10 h-10 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-extrabold text-lg flex items-center justify-center absolute -top-4 -right-3 cursor-pointer"
        >
          ✕
        </button>

        <div className="comic-body-row flex flex-col sm:flex-row items-center gap-5 mt-2">
          {/* Khung Avatar Nhân Vật kiểu Truyện Tranh */}
          <div className="relative shrink-0">
            <div
              style={{ backgroundColor: character.badgeBg }}
              className="comic-avatar-box w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-[3.5px] border-[#593A47] shadow-[0_6px_0_#593A47] flex items-center justify-center p-2 relative overflow-visible"
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
                  className={`kawaii-btn text-[#593A47] font-extrabold text-sm sm:text-base px-5 py-2 flex items-center gap-1.5 ${
                    questInfo?.status === 'completed'
                      ? 'bg-[#DFF8EB] hover:bg-[#C6F4DC]'
                      : questInfo?.status === 'ready_to_claim'
                      ? 'bg-[#FFE066] hover:bg-[#FFD166]'
                      : 'bg-gradient-to-r from-[#FF85A9] to-[#FFA6C1] hover:from-[#FF6E99] hover:to-[#FF94B4]'
                  }`}
                >
                  <span>
                    {questInfo
                      ? questInfo.status === 'idle'
                        ? `📜 Nhận Nhiệm Vụ Trên Bản Đồ (+${questInfo.rewardHearts} Tim)`
                        : questInfo.status === 'active'
                        ? `🗺️ Xem Gợi Ý Vị Trí (${questInfo.targets.filter((t) => t.collected).length}/${questInfo.targets.length})`
                        : questInfo.status === 'ready_to_claim'
                        ? `🎁 Hoàn Thành & Nhận +${questInfo.rewardHearts} Tim`
                        : '✅ Đã Hoàn Thành Hôm Nay'
                      : character.id === 'moon'
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

                {(() => {
                  const npcGame = getMiniGameByNpcId(character.id);
                  if (!npcGame) return null;
                  const unlocked = isMiniGameUnlocked(npcGame);
                  const playInfo = getDailyPlayInfo(npcGame.id);
                  return (
                    <a
                      href={`/minigame/${npcGame.id}`}
                      className="kawaii-btn bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-extrabold text-sm sm:text-base px-4 py-2 inline-flex items-center gap-1.5"
                    >
                      <span>{unlocked ? '🎮' : '🔒'}</span>
                      <span>
                        {unlocked
                          ? `${npcGame.shortTitle} (${playInfo.remainingPlays} lượt)`
                          : `Mở khóa ${npcGame.shortTitle}`}
                      </span>
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
