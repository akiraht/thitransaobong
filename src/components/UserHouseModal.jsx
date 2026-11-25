import React, { useEffect } from 'react';
import { BADGE_DEFINITIONS } from '../config/constants';
import { CHARACTER_SPRITES } from '../data/characterSprites';

export default function UserHouseModal({
  isOpen,
  resident,
  residentStats,
  residentTab,
  setResidentTab,
  authNicknameInput,
  setAuthNicknameInput,
  authPinInput,
  setAuthPinInput,
  onAuthSubmit,
  onLogout,
  onToggleSaveMemory,
  onSelectAvatar,
  onClose
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[999] bg-[#593A47]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div className="kawaii-card w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#FFFDF9] overflow-hidden relative pop-in">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#FFF3B0] via-[#FFE4EE] to-[#E2F9F0] border-b-[3px] border-[#593A47] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-white border-[2.5px] border-[#593A47] flex items-center justify-center text-xl shadow-[0_3px_0_#593A47]">
              🏡
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#593A47] leading-tight">
                {resident.isLoggedIn && resident.nickname
                  ? `Ngôi Nhà Của ${resident.nickname} • Hồ Sơ Cư Dân`
                  : 'Đăng Ký Bảng Tên Ngôi Nhà & Thẻ Cư Dân'}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#7D5867]">
                Quản lý bởi Thị Trưởng Bác Mây Xốp • Đồng bộ qua Google Sheet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="kawaii-btn w-9 h-9 bg-white hover:bg-[#FFE4EE] text-[#593A47] font-extrabold text-base flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 bg-[#FFF6FA] border-b-[2.5px] border-[#593A47] flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setResidentTab('card')}
            className={`px-3.5 py-2 rounded-t-2xl font-extrabold text-sm sm:text-base border-t-[2.5px] border-x-[2.5px] -mb-[2.5px] whitespace-nowrap ${
              residentTab === 'card'
                ? 'bg-white border-[#593A47] text-[#593A47]'
                : 'border-transparent text-[#8C6575]'
            }`}
          >
            🏅 Danh Hiệu &amp; Huy Hiệu ({residentStats.unlockedBadges.length}/{BADGE_DEFINITIONS.length})
          </button>
          <button
            type="button"
            onClick={() => setResidentTab('wishes')}
            className={`px-3.5 py-2 rounded-t-2xl font-extrabold text-sm sm:text-base border-t-[2.5px] border-x-[2.5px] -mb-[2.5px] whitespace-nowrap ${
              residentTab === 'wishes'
                ? 'bg-white border-[#593A47] text-[#593A47]'
                : 'border-transparent text-[#8C6575]'
            }`}
          >
            💌 Lời Chúc Đã Gửi ({residentStats.wishesSent})
          </button>
          <button
            type="button"
            onClick={() => setResidentTab('memories')}
            className={`px-3.5 py-2 rounded-t-2xl font-extrabold text-sm sm:text-base border-t-[2.5px] border-x-[2.5px] -mb-[2.5px] whitespace-nowrap ${
              residentTab === 'memories'
                ? 'bg-white border-[#593A47] text-[#593A47]'
                : 'border-transparent text-[#8C6575]'
            }`}
          >
            🏺 Lọ Sao Ký Ức ({(resident.savedStars || []).length})
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {!resident.isLoggedIn ? (
            <form
              onSubmit={onAuthSubmit}
              className="p-4 rounded-2xl bg-[#FFF6FA] border-[2.5px] border-[#593A47] space-y-3"
            >
              <div className="font-extrabold text-sm sm:text-base text-[#593A47]">
                ✨ Nhập Tên Cư Dân để gắn lên Bảng Tên Ngôi Nhà của bạn trên phố:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  maxLength={32}
                  placeholder="Nhập Tên / Nickname của bạn..."
                  value={authNicknameInput}
                  onChange={(e) => setAuthNicknameInput(e.target.value)}
                  className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#593A47] text-sm sm:text-base font-bold text-[#593A47]"
                />
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Mã PIN (4 số)"
                  value={authPinInput}
                  onChange={(e) => setAuthPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#593A47] text-sm sm:text-base font-bold text-[#593A47]"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#8C6575]">
                  * Sau khi đăng ký, bảng tên trên mái nhà ở giữa phố sẽ đổi thành tên của bạn!
                </span>
                <button
                  type="submit"
                  className="kawaii-btn bg-[#FF85A9] text-[#593A47] font-extrabold text-sm sm:text-base px-4 py-2 shrink-0"
                >
                  🏡 gắn Bảng Tên &amp; Nhận Thẻ
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFFDF2] via-[#FFF0F6] to-[#F0FBF6] border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF3B0] border-2 border-[#593A47] flex items-center justify-center text-3xl">
                    {residentStats.currentBadge.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-base text-[#593A47]">
                        🏡 Nhà của {resident.nickname}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-xs font-extrabold text-[#593A47]">
                        {residentStats.currentTitle}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#7D5867] mt-1 flex flex-wrap gap-3">
                      <span>📨 Đã gửi: {residentStats.wishesSent} lời chúc</span>
                      <span>💖 Được tặng: {residentStats.likesReceived} tim</span>
                      <span>🏺 Ký ức: {(resident.savedStars || []).length} sao</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs font-extrabold text-[#8C6575] underline hover:text-[#593A47]"
                >
                  Đổi tên / Tài khoản
                </button>
              </div>

              {/* Chức năng đổi Avatar cư dân sau khi đăng ký */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF9ED] border-[2.5px] border-[#593A47] space-y-3 shadow-[0_3px_0_#593A47]">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎭</span>
                    <span className="font-extrabold text-xs sm:text-sm text-[#593A47]">
                      Đổi Trang Phục Avatar Bạn Nhỏ:
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#8C6575] bg-white px-2 py-0.5 rounded-full border border-[#593A47]">
                    3 mẫu trang phục ban ngày
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    {
                      id: 'user_character',
                      name: 'Bé Sao Bông',
                      desc: 'Nguyên bản cute',
                      sprite: CHARACTER_SPRITES.user_character
                    },
                    {
                      id: 'user_hardworking',
                      name: 'Bé Chăm Chỉ',
                      desc: 'Học tập & cần mẫn',
                      sprite: CHARACTER_SPRITES.user_hardworking
                    },
                    {
                      id: 'user_happy',
                      name: 'Bé Vui Tươi',
                      desc: 'Cười tít rạng rỡ',
                      sprite: CHARACTER_SPRITES.user_happy
                    }
                  ].map((item) => {
                    const isCurrent = (resident?.avatarChoice || 'user_character') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectAvatar && onSelectAvatar(item.id)}
                        className={`relative p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#FFF3B0] border-[#593A47] shadow-[0_3px_0_#593A47] scale-[1.03]'
                            : 'bg-white border-[#D8C7B5] hover:border-[#593A47] hover:bg-[#FFFDF5]'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2 -right-1.5 px-1.5 py-0.2 bg-[#FF6B9D] border border-[#593A47] rounded-full text-[9px] font-extrabold text-white leading-tight">
                            Đang dùng ✓
                          </span>
                        )}
                        <div className="w-12 h-12 flex items-center justify-center">
                          {item.sprite ? (
                            <img
                              src={item.sprite}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain drop-shadow-[0_2px_4px_rgba(89,58,71,0.25)]"
                            />
                          ) : (
                            <span className="text-2xl">⭐</span>
                          )}
                        </div>
                        <span className="font-extrabold text-xs text-[#593A47] text-center leading-tight">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-semibold text-[#8C6575] text-center leading-tight">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Ghi chú khung giờ ngủ 22h - 4h sáng hôm sau */}
                <div className="px-3 py-2 rounded-xl bg-[#EDE7F6] border border-[#593A47] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#593A47] flex items-center justify-center shrink-0">
                    {CHARACTER_SPRITES.user_sleepy ? (
                      <img
                        src={CHARACTER_SPRITES.user_sleepy}
                        alt="Bé Ngái Ngủ"
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <span>😴</span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-[#593A47] leading-snug">
                    <span className="text-[#845EC2] font-extrabold">🌙 Bé Ngái Ngủ tự động:</span> Trong khung giờ từ <strong>22h00 đêm đến 04h00 sáng</strong>, bạn nhỏ sẽ tự động mặc trang phục Bé Ngái Ngủ ngáp ngủ đi dạo phố!
                  </p>
                </div>
              </div>
            </>
          )}

          {residentTab === 'card' && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-[#593A47]">
                🏆 Bộ Sưu Tập Huy Hiệu &amp; Danh Hiệu Cư Dân:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BADGE_DEFINITIONS.map((b) => {
                  const isUnlocked = residentStats.unlockedBadges.some((u) => u.id === b.id);
                  return (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border-[2.5px] border-[#593A47] flex items-start gap-3 ${
                        isUnlocked ? 'bg-[#FFFDF2] shadow-[0_4px_0_#593A47]' : 'bg-gray-100/70 opacity-60'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#FFF3B0] border-2 border-[#593A47] flex items-center justify-center text-2xl shrink-0">
                        {b.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm sm:text-base text-[#593A47]">{b.name}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#593A47] bg-white">
                            {isUnlocked ? 'Đã mở ✓' : 'Chưa mở 🔒'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-[#7D5867] mt-0.5">{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {residentTab === 'wishes' && (
            <div className="space-y-3">
              {residentStats.myWishesList.length === 0 ? (
                <div className="py-8 px-4 text-center bg-[#FFF6FA] border-2 border-dashed border-[#E5B8C8] rounded-2xl">
                  <p className="font-extrabold text-sm sm:text-base text-[#593A47]">
                    Bạn chưa gửi lời chúc nào lên bầu trời sao!
                  </p>
                </div>
              ) : (
                residentStats.myWishesList.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-extrabold">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFE4EE] border border-[#593A47]">
                        {w.approved ? '🌈 Đã bay lên bầu trời' : '⏳ Đang chờ duyệt'}
                      </span>
                      <span className="text-[#D9386A]">💖 Nhận được: {Number(w.likes) || 0} tim</span>
                    </div>
                    <p className="text-sm sm:text-base font-extrabold text-[#593A47]">&ldquo;{w.message}&rdquo;</p>
                  </div>
                ))
              )}
            </div>
          )}

          {residentTab === 'memories' && (
            <div className="space-y-3">
              {(resident.savedStars || []).length === 0 ? (
                <div className="py-8 px-4 text-center bg-[#FFF6FA] border-2 border-dashed border-[#E5B8C8] rounded-2xl">
                  <p className="font-extrabold text-sm sm:text-base text-[#593A47]">
                    Lọ Sao Ký Ức đang trống! Hãy bấm &ldquo;🏺 Lưu vào Ký Ức&rdquo; khi mở được bức thư bạn yêu thích nhé.
                  </p>
                </div>
              ) : (
                (resident.savedStars || []).map((st) => (
                  <div
                    key={st.id}
                    className="p-4 rounded-2xl bg-[#FFFDF2] border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#8C6575]">
                      <span>Từ: {st.sender || 'Bầu Trời Sao ✨'}</span>
                      <button
                        type="button"
                        onClick={() => onToggleSaveMemory(st)}
                        className="text-[#D9386A] underline"
                      >
                        Bỏ lưu
                      </button>
                    </div>
                    <p className="text-sm sm:text-base font-extrabold text-[#593A47]">&ldquo;{st.text}&rdquo;</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
