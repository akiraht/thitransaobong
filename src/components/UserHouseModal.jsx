import React, { useEffect, useState } from 'react';
import { CHARACTER_SPRITES } from '../data/characterSprites';
import BadgeArt from './BadgeArt';
import ResidentAuthPanel from './ResidentAuthPanel';
import {
  changeUserPassword,
  evaluatePasswordStrength,
} from '../utils/userAuthService';
import {
  BADGE_CATEGORIES,
  BADGE_TIERS,
  ALL_BADGES,
  LEVEL_DEFINITIONS,
  PLAYER_SKINS,
  getBadgeImagePath,
  getPlayerSkinById,
  isSkinUnlocked,
} from '../config/progressionConfig';

export default function UserHouseModal({
  isOpen,
  resident,
  residentStats,
  residentTab,
  setResidentTab,
  onAuthSuccess,
  onUpdateProfileInfo,
  onLogout,
  onToggleSaveMemory,
  onSelectAvatar,
  onToggleNightSleepy,
  onShowToast,
  onPinBadge,
  onClose
}) {
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState(null);
  const [skinFilter, setSkinFilter] = useState('all');

  // Form Tab Thông Tin (Email, SĐT, Ngày sinh - không bắt buộc)
  const [emailInput, setEmailInput] = useState(resident?.email || '');
  const [phoneInput, setPhoneInput] = useState(resident?.phone || '');
  const [birthdayInput, setBirthdayInput] = useState(resident?.birthday || '');
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [curPwdInput, setCurPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmNewPwdInput, setConfirmNewPwdInput] = useState('');
  const [pwdChangeMsg, setPwdChangeMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmailInput(resident?.email || '');
      setPhoneInput(resident?.phone || '');
      setBirthdayInput(resident?.birthday || '');
      setPwdChangeMsg('');
    }
  }, [isOpen, resident?.email, resident?.phone, resident?.birthday]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedBadgeDetail(null);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (selectedBadgeDetail) {
          setSelectedBadgeDetail(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedBadgeDetail]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[999] bg-[#593A47]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div className="kawaii-card w-full max-w-3xl max-h-[90dvh] flex flex-col bg-[#FFFDF9] overflow-hidden relative pop-in">
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

        {/* Tabs — CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP */}
        {resident.isLoggedIn && (
          <div className="px-3 sm:px-5 pt-2.5 bg-[#FFF6FA] border-b-[2.5px] border-[#593A47] flex flex-wrap gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setResidentTab('card')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-t-2xl font-extrabold text-xs sm:text-sm border-t-[2.5px] border-x-[2.5px] -mb-[2.5px] whitespace-nowrap cursor-pointer ${
                residentTab === 'card'
                  ? 'bg-white border-[#593A47] text-[#593A47]'
                  : 'border-transparent text-[#8C6575] hover:text-[#593A47]'
              }`}
            >
              🏅 Huy Hiệu ({residentStats.unlockedBadges.length}/{ALL_BADGES.length})
            </button>
            <button
              type="button"
              onClick={() => setResidentTab('skins')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-t-2xl font-extrabold text-xs sm:text-sm border-t-[2.5px] border-x-[2.5px] -mb-[2.5px] whitespace-nowrap cursor-pointer ${
                residentTab === 'skins'
                  ? 'bg-white border-[#593A47] text-[#593A47]'
                  : 'border-transparent text-[#8C6575] hover:text-[#593A47]'
              }`}
            >
              🎭 Tủ Đồ Skin ({(residentStats.unlockedSkins || []).length}/{PLAYER_SKINS.length})
            </button>
            <button
              type="button"
              onClick={() => setResidentTab('profile')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-t-2xl font-extrabold text-xs sm:text-sm border-t-[2.5px] border-x-[2.5px] -mb-[2.5px] whitespace-nowrap cursor-pointer ${
                residentTab === 'profile'
                  ? 'bg-white border-[#593A47] text-[#593A47]'
                  : 'border-transparent text-[#8C6575] hover:text-[#593A47]'
              }`}
            >
              👤 Thông Tin
            </button>
            <button
              type="button"
              onClick={() => setResidentTab('wishes')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-t-2xl font-extrabold text-xs sm:text-sm border-t-[2.5px] border-x-[2.5px] -mb-[2.5px] whitespace-nowrap cursor-pointer ${
                residentTab === 'wishes'
                  ? 'bg-white border-[#593A47] text-[#593A47]'
                  : 'border-transparent text-[#8C6575] hover:text-[#593A47]'
              }`}
            >
              💌 Lời Chúc ({residentStats.wishesSent})
            </button>
            <button
              type="button"
              onClick={() => setResidentTab('memories')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-t-2xl font-extrabold text-xs sm:text-sm border-t-[2.5px] border-x-[2.5px] -mb-[2.5px] whitespace-nowrap cursor-pointer ${
                residentTab === 'memories'
                  ? 'bg-white border-[#593A47] text-[#593A47]'
                  : 'border-transparent text-[#8C6575] hover:text-[#593A47]'
              }`}
            >
              🏺 Ký Ức ({(resident.savedStars || []).length})
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {!resident.isLoggedIn ? (
            <ResidentAuthPanel
              initialMode="login"
              showBenefits
              onAuthSuccess={(user, mode) => {
                onAuthSuccess?.(user, mode);
              }}
            />
          ) : (
            (() => {
              const equippedSkin = getPlayerSkinById(resident?.avatarChoice || 'user_character');
              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFFDF2] via-[#FFF0F6] to-[#F0FBF6] border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar Skin đang mặc — bấm vào để sang tab Tủ Đồ Skin */}
                    <button
                      type="button"
                      onClick={() => setResidentTab('skins')}
                      title={`Đổi skin (Đang mặc: ${equippedSkin.name})`}
                      className="group flex flex-col items-center gap-1 shrink-0 cursor-pointer focus:outline-none"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-[#FFFDF5] border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center justify-center p-1 group-hover:scale-105 group-hover:bg-[#FFF3B0] transition-all">
                        <img
                          src={equippedSkin.image || CHARACTER_SPRITES[equippedSkin.id] || CHARACTER_SPRITES.user_character}
                          alt={equippedSkin.name}
                          className="w-14 h-14 object-contain drop-shadow-[0_2px_4px_rgba(89,58,71,0.25)]"
                        />
                      </div>
                      <span className="text-[10px] font-black text-[#D9386A] group-hover:underline leading-none">
                        Đổi skin
                      </span>
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {/* Icon huy hiệu được ghim thay cho icon ngôi nhà */}
                        <span
                          title={residentStats.currentBadge?.name || 'Huy hiệu đang ghim'}
                          className="inline-flex items-center justify-center shrink-0"
                        >
                          <BadgeArt
                            image={residentStats.currentBadge?.image}
                            emoji={residentStats.currentBadge?.icon || '🌱'}
                            alt={residentStats.currentBadge?.name || 'Huy hiệu'}
                            tierKey={residentStats.currentBadge?.tierKey || 'bronze'}
                            unlocked
                            sizeClass="w-7 h-7"
                            emojiClass="text-lg"
                          />
                        </span>
                        <span className="font-extrabold text-base text-[#593A47]">
                          {resident.nickname}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-xs font-extrabold text-[#593A47]">
                          {residentStats.currentBadge?.titleName
                            ? `${residentStats.currentBadge.tierEmoji} ${residentStats.currentBadge.titleName}`
                            : residentStats.currentTitle}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#7D5867] mt-1.5 flex flex-wrap gap-3">
                        <span>📨 Đã gửi: {residentStats.wishesSent} lời chúc</span>
                        <span>💖 Được tặng: {residentStats.likesReceived} tim</span>
                        <span>🏺 Ký ức: {(resident.savedStars || []).length} sao</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="text-xs font-extrabold text-[#8C6575] underline hover:text-[#593A47] cursor-pointer"
                    >
                      Đổi tên / Tài khoản
                    </button>
                  </div>
                </div>
              );
            })()
          )}

          {resident.isLoggedIn && residentTab === 'card' && (
            <div className="space-y-4">
              {/* THẺ CẤP ĐỘ & TIẾN ĐỘ MỞ KHÓA CƯ DÂN (LV.0 → LV.5) */}
              {residentStats.levelInfo && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF4BD] via-[#FFF0F6] to-[#E0F2FE] border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] space-y-2.5 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-xs font-black text-[#593A47]">
                        LV.{residentStats.levelInfo.level} • {residentStats.levelInfo.title}
                      </span>
                      <p className="text-[11px] font-bold text-[#7D5867] mt-1">
                        Đã mở khóa <strong>{residentStats.levelInfo.unlockedResidentIds.size}/20</strong> cư dân thị trấn
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[#593A47]">
                        🏅 {residentStats.unlockedBadges.length}/{ALL_BADGES.length}
                      </div>
                      <div className="text-[10px] font-bold text-[#8C6575]">Huy hiệu</div>
                    </div>
                  </div>

                  {residentStats.levelInfo.nextDef ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-[#593A47]">
                        <span>Tiến độ lên LV.{residentStats.levelInfo.nextDef.level}:</span>
                        <span>
                          Còn thiếu <strong>{residentStats.levelInfo.badgesToNextLevel}</strong> huy hiệu
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-white border-2 border-[#593A47] overflow-hidden">
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              ((residentStats.unlockedBadges.length - residentStats.levelInfo.currentDef.minBadges) /
                                Math.max(
                                  1,
                                  residentStats.levelInfo.nextDef.minBadges -
                                    residentStats.levelInfo.currentDef.minBadges
                                )) *
                                100
                            )}%`,
                          }}
                          className="h-full bg-gradient-to-r from-[#FF85A9] to-[#FFE066] transition-all duration-500"
                        />
                      </div>
                      <p className="text-[10.5px] font-bold text-[#16805D]">
                        🔓 Mốc tiếp theo: {residentStats.levelInfo.nextDef.unlockNote}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs font-black text-[#16805D]">
                      👑 Bạn đã đạt cấp tối đa và mở khóa toàn bộ 20/20 cư dân Thị Trấn Sao Bông!
                    </div>
                  )}

                  {/* Bảng tóm tắt 6 mốc Level */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                    {LEVEL_DEFINITIONS.map((lv) => {
                      const reached = residentStats.levelInfo.level >= lv.level;
                      return (
                        <span
                          key={lv.level}
                          className={`shrink-0 px-2 py-0.5 rounded-lg border text-[10px] font-black ${
                            reached
                              ? 'bg-[#DFF8EB] border-[#593A47] text-[#16805D]'
                              : 'bg-white/70 border-[#593A47]/30 text-[#8C6575]'
                          }`}
                        >
                          Lv.{lv.level} ({lv.minBadges}🏅)
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6 BỘ HUY HIỆU × 5 CẤP BẬC (ĐỒNG → BẠC → VÀNG → KIM CƯƠNG → PHA LÊ SAO) */}
              <div className="space-y-3 text-left">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h4 className="font-black text-sm text-[#593A47]">
                    🏆 6 Bộ Huy Hiệu × 5 Bậc (Tổng {ALL_BADGES.length} Huy Hiệu):
                  </h4>
                  <span className="text-[10px] font-bold text-[#8C6575]">
                    Chạm vào từng huy hiệu để xem danh hiệu &amp; ghim lên Thẻ Cư Dân
                  </span>
                </div>

                {BADGE_CATEGORIES.map((cat) => {
                  const currentVal = Number(residentStats?.[cat.statKey]) || 0;
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-xs sm:text-sm font-black text-[#593A47]">{cat.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#FFF3B0] border border-[#593A47] text-[10px] font-black text-[#593A47]">
                          Hiện có: {currentVal} {cat.unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {BADGE_TIERS.map((tierObj, idx) => {
                          const req = cat.thresholds[idx];
                          const titleName = cat.titles[idx];
                          const badgeId = `${cat.id}_${tierObj.key}`;
                          const badgeImage = getBadgeImagePath(cat.id, tierObj.key);
                          const isUnlocked = currentVal >= req;
                          const isPinned = resident?.pinnedBadgeId === badgeId;
                          return (
                            <button
                              key={tierObj.key}
                              type="button"
                              onClick={() =>
                                setSelectedBadgeDetail({
                                  id: badgeId,
                                  categoryId: cat.id,
                                  categoryName: cat.name,
                                  categoryIcon: cat.icon,
                                  unit: cat.unit,
                                  currentVal,
                                  requirement: req,
                                  titleName,
                                  tierObj,
                                  image: badgeImage,
                                  isUnlocked,
                                })
                              }
                              style={{
                                backgroundColor: isUnlocked ? tierObj.bg : '#F8FAFC',
                                borderColor: isUnlocked ? tierObj.border : '#CBD5E1',
                              }}
                              title={`${titleName} • ${cat.name} (${tierObj.name}) — Mốc ${req} ${cat.unit}`}
                              className={`relative p-1.5 sm:p-2 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer active:translate-y-0.5 ${
                                isUnlocked
                                  ? 'shadow-[0_2.5px_0_#593A47] hover:scale-[1.04]'
                                  : 'opacity-70 hover:opacity-95'
                              } ${isPinned ? 'ring-2 ring-[#FF6B9D] ring-offset-1' : ''}`}
                            >
                              {isPinned && (
                                <span
                                  title="Đang ghim lên Thẻ Cư Dân"
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF6B9D] border border-[#593A47] text-[9px] flex items-center justify-center shadow-[0_1px_0_#593A47]"
                                >
                                  📌
                                </span>
                              )}
                              {!isUnlocked && (
                                <span
                                  aria-hidden="true"
                                  className="absolute top-1 right-1 text-[9px] opacity-65"
                                >
                                  🔒
                                </span>
                              )}
                              <BadgeArt
                                image={badgeImage}
                                emoji={tierObj.emoji}
                                alt={`${cat.name} ${tierObj.name}`}
                                tierKey={tierObj.key}
                                unlocked={isUnlocked}
                                sizeClass="w-10 h-10 sm:w-12 sm:h-12"
                                emojiClass="text-xl sm:text-2xl"
                              />
                              <span
                                style={{ color: isUnlocked ? tierObj.text : '#64748B' }}
                                className="text-[9px] sm:text-[10px] font-black mt-1 leading-tight line-clamp-1"
                              >
                                {tierObj.name}
                              </span>
                              <span className="text-[8.5px] sm:text-[9px] font-bold text-[#7D5867] mt-0.5 leading-none">
                                {isUnlocked ? titleName : `${currentVal}/${req}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* POPOVER CHI TIẾT HUY HIỆU & NÚT GHIM LÊN THẺ CƯ DÂN */}
              {selectedBadgeDetail && (
                <div
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedBadgeDetail(null);
                  }}
                  className="fixed inset-0 z-[1010] bg-[#593A47]/55 backdrop-blur-[2px] flex items-center justify-center p-4"
                >
                  {(() => {
                    const b = selectedBadgeDetail;
                    const pct = Math.min(100, Math.round((b.currentVal / Math.max(1, b.requirement)) * 100));
                    const remaining = Math.max(0, b.requirement - b.currentVal);
                    const isPinned = resident?.pinnedBadgeId === b.id;
                    return (
                      <div className="kawaii-card w-full max-w-sm p-5 bg-gradient-to-b from-[#FFFDF9] to-[#FFF5F9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47] relative pop-in text-center space-y-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBadgeDetail(null)}
                          aria-label="Đóng chi tiết huy hiệu"
                          className="kawaii-btn w-8 h-8 bg-[#FFE4EE] text-[#593A47] font-black text-xs flex items-center justify-center absolute -top-3 -right-3"
                        >
                          ✕
                        </button>

                        <div className="flex flex-col items-center gap-2">
                          <div
                            style={{
                              backgroundColor: b.isUnlocked ? b.tierObj.bg : '#F1F5F9',
                              borderColor: b.isUnlocked ? b.tierObj.border : '#94A3B8',
                            }}
                            className="w-24 h-24 rounded-3xl border-[3px] shadow-[0_5px_0_#593A47] flex items-center justify-center p-2"
                          >
                            <BadgeArt
                              image={b.image}
                              emoji={b.tierObj.emoji}
                              alt={b.titleName}
                              tierKey={b.tierObj.key}
                              unlocked={b.isUnlocked}
                              sizeClass="w-20 h-20"
                              emojiClass="text-5xl"
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <span
                              style={{
                                backgroundColor: b.tierObj.bg,
                                borderColor: b.tierObj.border,
                                color: b.tierObj.text,
                              }}
                              className="px-2.5 py-0.5 rounded-full border-2 text-[11px] font-black"
                            >
                              {b.tierObj.emoji} Bậc {b.tierObj.name}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#593A47]/40 text-[11px] font-extrabold text-[#7D5867]">
                              {b.categoryIcon} {b.categoryName}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C6575]">
                            Danh hiệu mở khóa
                          </div>
                          <h4 className="text-lg font-black text-[#593A47] leading-tight">
                            ✨ {b.titleName}
                          </h4>
                          <p className="text-xs font-bold text-[#7D5867]">
                            Điều kiện: Đạt mốc <strong>{b.requirement}</strong> {b.unit}
                          </p>
                        </div>

                        {/* Thanh tiến độ */}
                        <div className="p-3 rounded-2xl bg-white border-2 border-[#593A47] space-y-1.5 text-left">
                          <div className="flex items-center justify-between text-xs font-extrabold text-[#593A47]">
                            <span>Tiến độ hiện tại</span>
                            <span>
                              {Math.min(b.currentVal, b.requirement)} / {b.requirement} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-[#FFF0F6] border-2 border-[#593A47] overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full transition-all duration-500 ${
                                b.isUnlocked
                                  ? 'bg-gradient-to-r from-[#34D399] to-[#10B981]'
                                  : 'bg-gradient-to-r from-[#FF85A9] to-[#FFE066]'
                              }`}
                            />
                          </div>
                          <div className="text-[11px] font-bold text-center pt-0.5">
                            {b.isUnlocked ? (
                              <span className="text-[#16805D]">🎉 Bạn đã mở khóa huy hiệu này!</span>
                            ) : (
                              <span className="text-[#8C6575]">
                                🔒 Còn thiếu <strong>{remaining}</strong> {b.unit} nữa để mở khóa
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nút ghim huy hiệu */}
                        {b.isUnlocked && onPinBadge ? (
                          <button
                            type="button"
                            onClick={() => {
                              onPinBadge(isPinned ? null : b.id, b);
                              setSelectedBadgeDetail(null);
                            }}
                            className={`kawaii-btn w-full py-2.5 text-xs sm:text-sm font-black ${
                              isPinned
                                ? 'bg-[#F1F5F9] text-[#593A47]'
                                : 'bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47]'
                            }`}
                          >
                            {isPinned ? '📌 Bỏ ghim khỏi Thẻ Cư Dân' : '📌 Ghim lên Thẻ Cư Dân'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedBadgeDetail(null)}
                            className="kawaii-btn w-full py-2 bg-[#FFE4EE] text-[#593A47] text-xs font-black"
                          >
                            Đóng
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {resident.isLoggedIn && residentTab === 'skins' && (() => {
            const currentLevel = residentStats.levelInfo?.level || 0;
            const unlockedBadgeIdSet = new Set(
              (residentStats.unlockedBadges || []).map((b) => b.id)
            );
            const currentChoice = resident?.avatarChoice || 'user_character';
            const filteredSkins =
              skinFilter === 'all'
                ? PLAYER_SKINS
                : PLAYER_SKINS.filter((s) => s.group === skinFilter);

            const filterButtons = [
              { id: 'all', label: `Tất cả (${PLAYER_SKINS.length})` },
              { id: 'default', label: 'Mặc định (3)' },
              { id: 'level', label: '⭐ Cấp độ LV.3–5 (3)' },
              { id: 'badge', label: '💎🔮 Huy hiệu (12)' },
            ];

            return (
              <div className="space-y-4 text-left">
                {/* Bộ lọc nhóm Skin */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {filterButtons.map((fb) => (
                      <button
                        key={fb.id}
                        type="button"
                        onClick={() => setSkinFilter(fb.id)}
                        className={`px-3 py-1.5 rounded-full border-2 text-xs font-black transition cursor-pointer ${
                          skinFilter === fb.id
                            ? 'bg-[#FFE066] border-[#593A47] text-[#593A47] shadow-[0_2px_0_#593A47]'
                            : 'bg-white border-[#D8C7B5] text-[#7D5867] hover:border-[#593A47]'
                        }`}
                      >
                        {fb.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lưới Skin */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {filteredSkins.map((skin) => {
                    const unlocked = isSkinUnlocked(skin, currentLevel, unlockedBadgeIdSet);
                    const isCurrent = currentChoice === skin.id;
                    const tierBg =
                      skin.tierKey === 'crystal'
                        ? 'bg-gradient-to-b from-[#FAF5FF] to-[#FFF0F6]'
                        : skin.tierKey === 'diamond'
                          ? 'bg-gradient-to-b from-[#F0F9FF] to-[#FFFFFF]'
                          : skin.tierKey === 'gold'
                            ? 'bg-gradient-to-b from-[#FEFCE8] to-[#FFFFFF]'
                            : 'bg-white';

                    return (
                      <button
                        key={skin.id}
                        type="button"
                        onClick={() => {
                          if (unlocked) {
                            onSelectAvatar && onSelectAvatar(skin.id, skin.name);
                          } else {
                            onShowToast &&
                              onShowToast(`🔒 Skin "${skin.name}" cần: ${skin.unlockLabel}`);
                          }
                        }}
                        className={`relative p-3 rounded-2xl border-[2.5px] transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer active:translate-y-0.5 ${
                          isCurrent
                            ? 'bg-[#FFF3B0] border-[#593A47] shadow-[0_4px_0_#593A47] ring-2 ring-[#FF6B9D] ring-offset-1'
                            : unlocked
                              ? `${tierBg} border-[#593A47] shadow-[0_3px_0_#593A47] hover:scale-[1.02]`
                              : 'bg-[#F8FAFC] border-[#CBD5E1] opacity-75 hover:opacity-95'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2 -right-1.5 px-2 py-0.5 bg-[#FF6B9D] border-[1.5px] border-[#593A47] rounded-full text-[9px] font-black text-white shadow-[0_1.5px_0_#593A47]">
                            Đang mặc ✓
                          </span>
                        )}
                        {!unlocked && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-white/90 border border-[#94A3B8] text-[9px] font-black text-[#475569]">
                            🔒 {skin.unlockShort}
                          </span>
                        )}
                        {unlocked && skin.unlockType !== 'free' && !isCurrent && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-white/90 border border-[#593A47]/40 text-[9px] font-black text-[#593A47]">
                            {skin.unlockShort}
                          </span>
                        )}

                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mt-1">
                          <img
                            src={skin.image || CHARACTER_SPRITES[skin.id]}
                            alt={skin.name}
                            loading="lazy"
                            decoding="async"
                            className={`max-w-full max-h-full object-contain transition-transform ${
                              unlocked
                                ? skin.tierKey === 'crystal'
                                  ? 'badge-aura-crystal'
                                  : skin.tierKey === 'diamond'
                                    ? 'badge-aura-diamond'
                                    : 'drop-shadow-[0_3px_4px_rgba(89,58,71,0.25)]'
                                : 'grayscale opacity-45 brightness-90'
                            }`}
                          />
                        </div>

                        <span className="font-black text-xs text-[#593A47] leading-tight">
                          {skin.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#7D5867] leading-snug line-clamp-2">
                          {unlocked ? skin.desc : skin.unlockLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Khung giờ ngủ 22h - 4h sáng kèm nút bật/tắt */}
                <div className="px-3.5 py-2.5 rounded-2xl bg-[#EDE7F6] border-2 border-[#593A47] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#593A47] flex items-center justify-center shrink-0">
                      {CHARACTER_SPRITES.user_sleepy ? (
                        <img
                          src={CHARACTER_SPRITES.user_sleepy}
                          alt="Bé Ngái Ngủ"
                          className="w-7 h-7 object-contain"
                        />
                      ) : (
                        <span>😴</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-[#593A47] leading-snug">
                      <span className="text-[#845EC2] font-black">🌙 Bé Ngái Ngủ (22h–04h):</span> Tự động mặc đồ ngủ ngáp ngủ khi dạo phố ban đêm.
                    </p>
                  </div>
                  {onToggleNightSleepy && (
                    <button
                      type="button"
                      onClick={onToggleNightSleepy}
                      className={`shrink-0 px-3 py-1 rounded-full border-2 border-[#593A47] text-[10px] font-black transition cursor-pointer ${
                        resident?.disableNightSleepy
                          ? 'bg-white text-[#7D5867]'
                          : 'bg-[#DFF8EB] text-[#16805D]'
                      }`}
                    >
                      {resident?.disableNightSleepy ? 'Đang tắt' : 'Đang bật ✓'}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {resident.isLoggedIn && residentTab === 'profile' && (() => {
            const hasContact = Boolean(resident?.email || resident?.phone || resident?.birthday);
            const newPwdStrength = evaluatePasswordStrength(newPwdInput);
            const handleSaveProfile = (e) => {
              e.preventDefault();
              onUpdateProfileInfo?.({
                email: emailInput.trim(),
                phone: phoneInput.trim(),
                birthday: birthdayInput.trim(),
              });
            };
            const handleChangePwdSubmit = async (e) => {
              e.preventDefault();
              setPwdChangeMsg('');
              if (newPwdInput !== confirmNewPwdInput) {
                setPwdChangeMsg('⚠️ Mật khẩu mới xác nhận chưa khớp.');
                return;
              }
              const res = await changeUserPassword(
                resident.username || resident.nickname,
                curPwdInput,
                newPwdInput
              );
              if (!res.ok) {
                setPwdChangeMsg(`⚠️ ${res.error}`);
                return;
              }
              setCurPwdInput('');
              setNewPwdInput('');
              setConfirmNewPwdInput('');
              setShowChangePwd(false);
              onShowToast?.('🔐 Đã đổi mật khẩu thành công!');
            };

            return (
              <div className="space-y-4 text-left">
                {/* Note khuyến khích bổ sung thông tin */}
                <div className="p-3.5 rounded-2xl bg-[#FFF9E6] border-[2.5px] border-[#CA8A04] shadow-[0_3px_0_#CA8A04] flex items-start gap-2.5">
                  <span className="text-xl shrink-0">💡</span>
                  <div className="text-xs font-bold text-[#713F12] leading-relaxed">
                    <strong>Lưu ý nhẹ nhàng:</strong> Các thông tin bên dưới <strong>không bắt buộc</strong>, nhưng bạn nên bổ sung để đồng bộ tài khoản an toàn và <strong>dễ dàng lấy lại mật khẩu</strong> nếu chẳng may quên nhé!
                    {!hasContact && (
                      <span className="block mt-1 text-[#B45309]">
                        ✨ Hồ sơ của bạn hiện chưa có Email/SĐT khôi phục.
                      </span>
                    )}
                  </div>
                </div>

                {/* Form cập nhật thông tin cá nhân */}
                <form
                  onSubmit={handleSaveProfile}
                  className="p-4 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-black text-sm text-[#593A47]">
                      👤 Thông Tin Đồng Bộ &amp; Khôi Phục Tài Khoản
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F3E8FF] border border-[#593A47] text-[10px] font-black text-[#581C87]">
                      @{resident.username || resident.nickname}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-xs font-extrabold text-[#7D5867]">
                        📧 Email đồng bộ (tùy chọn)
                      </label>
                      <input
                        type="email"
                        placeholder="vidu@email.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF9] border-2 border-[#593A47] text-sm font-bold text-[#593A47]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-extrabold text-[#7D5867]">
                        📱 Số điện thoại (tùy chọn)
                      </label>
                      <input
                        type="tel"
                        placeholder="09xx xxx xxx"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF9] border-2 border-[#593A47] text-sm font-bold text-[#593A47]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-extrabold text-[#7D5867]">
                        🎂 Ngày sinh (tùy chọn)
                      </label>
                      <input
                        type="date"
                        value={birthdayInput}
                        onChange={(e) => setBirthdayInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF9] border-2 border-[#593A47] text-sm font-bold text-[#593A47]"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="submit"
                      className="kawaii-btn bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-black text-xs sm:text-sm px-5 py-2 cursor-pointer"
                    >
                      💾 Lưu Thông Tin
                    </button>
                  </div>
                </form>

                {/* Mục Đổi mật khẩu */}
                <div className="p-4 rounded-2xl bg-[#FFF6FA] border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-black text-sm text-[#593A47]">🔐 Bảo Mật &amp; Mật Khẩu</div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePwd((v) => !v);
                        setPwdChangeMsg('');
                      }}
                      className="text-xs font-extrabold text-[#D9386A] underline cursor-pointer"
                    >
                      {showChangePwd ? 'Thu gọn' : 'Đổi mật khẩu'}
                    </button>
                  </div>

                  {showChangePwd && (
                    <form onSubmit={handleChangePwdSubmit} className="space-y-2.5 pt-1">
                      <input
                        type="password"
                        placeholder="Mật khẩu hiện tại..."
                        value={curPwdInput}
                        onChange={(e) => setCurPwdInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-[#593A47] text-sm font-bold text-[#593A47]"
                      />
                      <input
                        type="password"
                        placeholder="Mật khẩu mới (≥8 ký tự, hoa, thường, số)..."
                        value={newPwdInput}
                        onChange={(e) => setNewPwdInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-[#593A47] text-sm font-bold text-[#593A47]"
                      />
                      {newPwdInput.length > 0 && (
                        <div className="text-[11px] font-extrabold" style={{ color: newPwdStrength.color }}>
                          Độ mạnh: {newPwdStrength.label}{' '}
                          {!newPwdStrength.valid && `(cần ${newPwdStrength.missing.join(', ')})`}
                        </div>
                      )}
                      <input
                        type="password"
                        placeholder="Xác nhận mật khẩu mới..."
                        value={confirmNewPwdInput}
                        onChange={(e) => setConfirmNewPwdInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-[#593A47] text-sm font-bold text-[#593A47]"
                      />
                      {pwdChangeMsg && (
                        <div className="text-xs font-extrabold text-[#E11D48]">{pwdChangeMsg}</div>
                      )}
                      <button
                        type="submit"
                        className="kawaii-btn bg-[#FF85A9] text-[#593A47] font-black text-xs px-4 py-2 cursor-pointer"
                      >
                        🔐 Cập Nhật Mật Khẩu Mới
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })()}

          {resident.isLoggedIn && residentTab === 'wishes' && (
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

          {resident.isLoggedIn && residentTab === 'memories' && (
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
