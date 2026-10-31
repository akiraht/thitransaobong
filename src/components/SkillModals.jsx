import React from 'react';
import CharacterAvatar from './CharacterAvatar';
import { CHARACTER_STAMPS } from '../config/constants';

export default function SkillModals({
  activeSkillPanel, // null | 'weather' | 'breathe' | 'quest' | 'wish'
  remainingStarsCount,
  approvedWishCount,
  breathePhase,
  dailyQuestText,
  onNewQuest,
  // Wish Form Props for Bé Sao Băng's Skill Modal
  wishSubmittedToday,
  nickname,
  setNickname,
  wishMood,
  setWishMood,
  wishStamp,
  setWishStamp,
  wishMessage,
  setWishMessage,
  wishError,
  setWishError,
  onWishSubmit,
  onClose
}) {
  if (!activeSkillPanel) return null;

  const isWishModal = activeSkillPanel === 'wish';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#593A47]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        className={`kawaii-card w-full ${
          isWishModal ? 'max-w-2xl text-left' : 'max-w-md text-center'
        } p-6 sm:p-7 bg-[#FFFDF9] relative pop-in my-auto`}
      >
        <button
          type="button"
          onClick={onClose}
          className="kawaii-btn w-9 h-9 bg-[#FFE4EE] text-[#593A47] font-extrabold text-base flex items-center justify-center absolute -top-3.5 -right-3"
        >
          ✕
        </button>

        {/* 1. KỸ NĂNG "GỬI LỜI CHÚC ĐẾN BẦU TRỜI SAO" CỦA BÉ SAO BĂNG */}
        {activeSkillPanel === 'wish' && (
          <div>
            {!wishSubmittedToday ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-14 rounded-2xl bg-[#FFF4BD] border-[2.5px] border-[#593A47] flex items-center justify-center shadow-[0_3px_0_#593A47] shrink-0 overflow-visible">
                    <CharacterAvatar id="shooting_star" className="w-16 h-14" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFE2EC] border border-[#593A47] text-[10px] font-extrabold text-[#593A47] mb-0.5">
                      📨 Kỹ Năng Bưu Điện Số 04 • Bé Sao Băng
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#593A47]">
                      Gửi Lời Chúc Đến Bầu Trời Sao
                    </h2>
                  </div>
                </div>

                <form onSubmit={onWishSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="wishNicknameInput"
                        className="block text-sm sm:text-base font-extrabold text-[#593A47] mb-1"
                      >
                        Tên hoặc Nickname của bạn <span className="font-semibold text-[#8C6575]">(Không bắt buộc)</span>
                      </label>
                      <input
                        id="wishNicknameInput"
                        type="text"
                        maxLength={40}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border-[2.5px] border-[#593A47] text-sm font-bold text-[#593A47] focus:outline-none focus:ring-4 focus:ring-pink-200"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="wishMoodTagSelect"
                        className="block text-sm sm:text-base font-extrabold text-[#593A47] mb-1"
                      >
                        Dành tặng cho tâm trạng nào?
                      </label>
                      <select
                        id="wishMoodTagSelect"
                        value={wishMood}
                        onChange={(e) => setWishMood(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border-[2.5px] border-[#593A47] text-sm font-bold text-[#593A47] focus:outline-none focus:ring-4 focus:ring-pink-200"
                      >
                        <option value="all">🌈 Tất cả mọi tâm trạng</option>
                        <option value="bad">🌧️ Đang buồn / Tệ (Cần an ủi)</option>
                        <option value="tired">☁️ Đang mệt mỏi (Cần nạp năng lượng)</option>
                        <option value="normal">🍀 Ngày bình yên (Nhẹ nhàng)</option>
                        <option value="excited">💖 Đang hào hứng (Truyền cảm hứng)</option>
                        <option value="happy">✨ Đang hạnh phúc (Nhân đôi niềm vui)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-extrabold text-[#593A47] mb-1.5">
                      Chọn Tem Sáp Nhân Vật đính lên bức thư của bạn:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CHARACTER_STAMPS.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setWishStamp(st.id)}
                          className={`px-3 py-1 rounded-full border-2 border-[#593A47] text-xs sm:text-sm font-extrabold transition ${
                            wishStamp === st.id
                              ? 'bg-[#FFE066] shadow-[0_2px_0_#593A47] -translate-y-0.5'
                              : 'bg-white hover:bg-[#FFF6FA]'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="wishContentTextarea"
                        className="block text-sm sm:text-base font-extrabold text-[#593A47]"
                      >
                        Nội dung câu chúc của bạn <span className="text-[#D9386A]">*</span>
                      </label>
                      <span className="text-xs sm:text-sm font-bold text-[#8C6575]">{wishMessage.length} / 220 ký tự</span>
                    </div>
                    <textarea
                      id="wishContentTextarea"
                      rows={3}
                      maxLength={220}
                      required
                      value={wishMessage}
                      onChange={(e) => {
                        setWishMessage(e.target.value);
                        if (e.target.value.trim().length > 0) setWishError(false);
                      }}
                      placeholder="Viết một lời chúc ngắn gọn, ấm áp gửi đến những tâm hồn đồng điệu..."
                      className="w-full p-4 rounded-2xl bg-white border-[2.5px] border-[#593A47] text-sm font-bold text-[#593A47] placeholder-[#B08D9B] focus:outline-none focus:ring-4 focus:ring-pink-200 resize-none"
                    />
                    {wishError && (
                      <p className="text-xs sm:text-sm font-extrabold text-[#D9386A] mt-1.5">
                        ⚠️ Vui lòng nhập nội dung lời chúc trước khi gửi nhé!
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="submit"
                      className="kawaii-btn bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-extrabold text-sm sm:text-base px-6 py-2.5 flex items-center gap-2"
                    >
                      <span>Gửi lời chúc</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="py-6 px-4 rounded-2xl bg-gradient-to-r from-[#FFF3B0] via-[#FFE4EE] to-[#E2F9F0] border-[3px] border-[#593A47] text-center">
                <div className="text-4xl mb-2">🌈✨</div>
                <p className="text-lg sm:text-xl font-extrabold text-[#593A47]">
                  Cám ơn bạn đã gửi lời chúc đến bầu trời sao
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. KỸ NĂNG DỰ BÁO THỜI TIẾT CỦA BÉ CẦU VỒNG & GIỌT MƯA */}
        {activeSkillPanel === 'weather' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id="rainbow" className="w-28 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#DFF8EB] border-2 border-[#593A47] text-xs sm:text-sm font-extrabold text-[#593A47]">
              🌦️ Đài Khí Tượng Số 06 • Bé Cầu Vồng
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#593A47]">
              Bản Tin Thời Tiết Cảm Xúc Thị Trấn
            </h3>
            <div className="p-4 rounded-2xl bg-[#F4FCF8] border-[2.5px] border-[#593A47] text-sm sm:text-base font-extrabold text-[#593A47] space-y-2 text-left">
              <div>☀️ <strong>Độ nắng ấm áp:</strong> 85% (Bầu trời trong xanh, có cầu vồng đôi)</div>
              <div>🌟 <strong>Ngôi sao còn thức trong đài:</strong> {remainingStarsCount.toLocaleString('vi-VN')} / 2000 sao</div>
              <div>💌 <strong>Lời chúc đang bay trong gió:</strong> {approvedWishCount} bức thư ấm áp</div>
              <p className="text-[#16805D] pt-1 border-t border-dashed border-[#593A47]/30">
                🌈 Lời khuyên khí tượng: Hôm nay là một ngày tuyệt vời để mỉm cười và nhờ Bé Sao Băng gửi một lời chúc tốt lành lên bầu trời!
              </p>
            </div>
          </div>
        )}

        {/* 3. KỸ NĂNG HÍT THỞ CHỮA LÀNH CỦA BÉ NGÂN HÀ */}
        {activeSkillPanel === 'breathe' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id="nebula" className="w-28 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#F3E5FF] border-2 border-[#593A47] text-xs sm:text-sm font-extrabold text-[#593A47]">
              🍵 Tiệm Trà Số 07 • Bé Ngân Hà
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#593A47]">
              Hơi Thở Hương Trà Tinh Vân (4-4-4)
            </h3>
            <div className="py-6 px-4 rounded-3xl bg-gradient-to-b from-[#FCF8FF] to-[#EFE5FF] border-[3px] border-[#593A47] shadow-inner">
              <div className="text-base sm:text-lg font-extrabold text-[#D9386A] animate-pulse">
                {breathePhase}
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#7D5867] mt-2">
                Hãy thả lỏng hai vai và hít thở nhịp nhàng theo hương trà ấm nhé...
              </p>
            </div>
          </div>
        )}

        {/* 4. KỸ NĂNG LÒ BÁNH NẮNG ẤM CỦA BÉ NẮNG MAI */}
        {activeSkillPanel === 'quest' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id="sun" className="w-28 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFE5D4] border-2 border-[#593A47] text-xs sm:text-sm font-extrabold text-[#593A47]">
              🥐 Tiệm Bánh Số 02 • Bé Nắng Mai
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#593A47]">
              Món Quà Nhỏ Từ Lò Bánh Bình Minh
            </h3>
            <div className="p-4 rounded-2xl bg-[#FFF4BD] border-[2.5px] border-[#593A47] text-sm sm:text-base font-extrabold text-[#593A47] leading-relaxed">
              {dailyQuestText}
            </div>
            <button
              type="button"
              onClick={onNewQuest}
              className="kawaii-btn bg-[#FF85A9] text-[#593A47] font-extrabold text-sm sm:text-base px-5 py-2"
            >
              🍪 Bốc thêm 1 chiếc bánh khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
