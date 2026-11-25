import React, { useState, useEffect } from 'react';
import CharacterAvatar from './CharacterAvatar';
import { SafeStorage, getTodayDateString } from '../utils/storage';

const HABIT_STORAGE_KEY = 'TTSB_DEWDROP_HABITS_V1';
const GRATITUDE_STORAGE_KEY = 'TTSB_SUNSET_GRATITUDE_V1';
const CRYSTAL_STORAGE_KEY = 'TTSB_SNOWFLAKE_CRYSTALS_V1';

const DEFAULT_HABITS = [
  { id: 'water', label: '💧 Uống một ly nước ấm' },
  { id: 'stretch', label: '🙆 Vươn vai thả lỏng cổ vai 2 phút' },
  { id: 'breathe', label: '🌬️ Hít thở sâu & rời mắt khỏi màn hình' },
  { id: 'walk', label: '🚶 Đi bộ nhẹ nhàng vài phút' },
  { id: 'kind', label: '💛 Tự khen bản thân vì 1 việc hôm nay' },
];

const COMPASS_CARDS = [
  '🧭 Không cần phải thấy hết cả con đường mới bước đi — chỉ cần làm tốt bước nhỏ ngay trước mắt thôi.',
  '🌟 Điều gì khiến tim bạn nhẹ nhõm hơn sau khi nghĩ tới, thường là hướng đi đúng dành cho bạn.',
  '🍃 Đôi khi việc tốt nhất bạn có thể làm hôm nay là tạm dừng lại một nhịp và uống nước.',
  '✨ Bạn đã vượt qua 100% những ngày khó khăn trước đây — hôm nay cũng sẽ ổn thôi.',
  '🌙 Không sao cả nếu hôm nay chưa hoàn hảo; tiến thêm 1% cũng là tiến bước rồi.',
  '🌈 Đừng so sánh chương 1 của mình với chương 20 của người khác — nhịp độ của bạn là vừa đẹp.',
];

/**
 * Modal kỹ năng mở rộng cho 8 cư dân (Số 09 – Số 16)
 * (4 cư dân Ngõ Gió Xoáy 17–20 đã chuyển sang Nhiệm Vụ Tương Tác Trực Tiếp Trên Bản Đồ)
 */
export default function ExtendedSkillModals({
  activePanel, // null | 'dewdrop' | 'breeze' | 'snowflake' | 'aurora' | 'saturn' | 'firefly' | 'sunset' | 'north_star'
  activeAmbientSound,
  sleepTimerMinutes,
  onStartAmbient,
  onStopAmbient,
  onRewardHearts,
  onShowToast,
  onClose,
}) {
  const todayKey = getTodayDateString();

  // 09. Bé Sương Mai — Tưới Mầm Thói Quen
  const [checkedHabits, setCheckedHabits] = useState(() => {
    try {
      const raw = SafeStorage.getItem(HABIT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.dateKey === todayKey && Array.isArray(parsed.ids)) return parsed.ids;
    } catch {}
    return [];
  });

  // 10. Chú Gió Mát — Thổi Bay Muộn Phiền
  const [worryText, setWorryText] = useState('');
  const [isBlowingAway, setIsBlowingAway] = useState(false);
  const [blownDone, setBlownDone] = useState(false);

  // 11. Cô Tuyết Bông — Viên Pha Lê Ký Ức
  const [crystalInput, setCrystalInput] = useState('');
  const [crystals, setCrystals] = useState(() => {
    try {
      const raw = SafeStorage.getItem(CRYSTAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // 15. Chị Hoàng Hôn — 3 Điều Biết Ơn
  const [goodThings, setGoodThings] = useState(['', '', '']);
  const [savedGratitudes, setSavedGratitudes] = useState(() => {
    try {
      const raw = SafeStorage.getItem(GRATITUDE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // 16. Ông Sao Bắc Đẩu — La Bàn Định Hướng
  const [compassSpinning, setCompassSpinning] = useState(false);
  const [compassMessage, setCompassMessage] = useState(COMPASS_CARDS[0]);

  // Reset trạng thái tạm mỗi khi đổi modal
  useEffect(() => {
    if (!activePanel) return;
    setWorryText('');
    setIsBlowingAway(false);
    setBlownDone(false);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePanel, onClose]);

  if (!activePanel) return null;

  // Handlers
  const toggleHabit = (habitId) => {
    const exists = checkedHabits.includes(habitId);
    let next;
    if (exists) {
      next = checkedHabits.filter((id) => id !== habitId);
    } else {
      if (checkedHabits.length >= 3) {
        onShowToast('🌱 Chọn tối đa 3 thói quen nhỏ mỗi ngày để không bị áp lực nhé!');
        return;
      }
      next = [...checkedHabits, habitId];
      if (next.length === 3) {
        onRewardHearts('dewdrop', 1, '💧 Mầm cây hôm nay đã nở hoa! (+1 Tim)');
      }
    }
    setCheckedHabits(next);
    SafeStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify({ dateKey: todayKey, ids: next }));
  };

  const handleBlowWorry = () => {
    if (!worryText.trim() || isBlowingAway) return;
    setIsBlowingAway(true);
    setTimeout(() => {
      setIsBlowingAway(false);
      setBlownDone(true);
      setWorryText('');
      onRewardHearts('breeze', 1, '🍃 Muộn phiền đã theo gió bay xa rồi!');
    }, 950);
  };

  const handleSaveCrystal = (e) => {
    e.preventDefault();
    const text = crystalInput.trim();
    if (!text) return;
    const entry = { id: Date.now(), date: todayKey, text };
    const next = [entry, ...crystals].slice(0, 14);
    setCrystals(next);
    setCrystalInput('');
    SafeStorage.setItem(CRYSTAL_STORAGE_KEY, JSON.stringify(next));
    onShowToast('❄️ Đã đóng băng khoảnh khắc đẹp vào Pha Lê Tuyết!');
  };

  const handleSaveGratitude = (e) => {
    e.preventDefault();
    const filled = goodThings.map((t) => t.trim()).filter(Boolean);
    if (filled.length === 0) {
      onShowToast('☕ Hãy viết ít nhất 1 điều nhỏ bé khiến bạn mỉm cười nhé!');
      return;
    }
    const entry = { id: Date.now(), date: todayKey, items: filled };
    const next = [entry, ...savedGratitudes.filter((g) => g.date !== todayKey)].slice(0, 7);
    setSavedGratitudes(next);
    SafeStorage.setItem(GRATITUDE_STORAGE_KEY, JSON.stringify(next));
    setGoodThings(['', '', '']);
    onRewardHearts('sunset', 1, '☕ Đã lưu 3 điều biết ơn hôm nay vào cuốn sổ chiều!');
  };

  const handleSpinCompass = () => {
    if (compassSpinning) return;
    setCompassSpinning(true);
    setTimeout(() => {
      const next = COMPASS_CARDS[Math.floor(Math.random() * COMPASS_CARDS.length)];
      setCompassMessage(next);
      setCompassSpinning(false);
    }, 650);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[955] bg-[#593A47]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="kawaii-card w-full max-w-md max-h-[90dvh] overflow-y-auto p-5 sm:p-6 bg-[#FFFDF9] relative pop-in my-auto text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="kawaii-btn w-9 h-9 bg-[#FFE4EE] text-[#593A47] font-extrabold text-base flex items-center justify-center absolute top-3 right-3"
        >
          ✕
        </button>

        {/* 09. BÉ SƯƠNG MAI — TƯỚI MẦM THÓI QUEN */}
        {activePanel === 'dewdrop' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id="dewdrop" className="w-24 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#E0F7F4] border-2 border-[#593A47] text-xs font-extrabold">
              💧 Nhà Kính Số 09 • Bé Sương Mai
            </span>
            <h3 className="text-lg font-black text-[#593A47]">Tưới Mầm Thói Quen Hôm Nay</h3>
            <p className="text-xs font-bold text-[#7D5867]">
              Chọn tối đa 3 việc nhỏ bạn đã làm hôm nay ({checkedHabits.length}/3):
            </p>
            <div className="space-y-2 text-left">
              {DEFAULT_HABITS.map((h) => {
                const done = checkedHabits.includes(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHabit(h.id)}
                    className={`w-full p-3 rounded-2xl border-2 border-[#593A47] text-xs sm:text-sm font-extrabold flex items-center justify-between transition ${
                      done ? 'bg-[#DFF8EB] shadow-[0_2px_0_#593A47]' : 'bg-white hover:bg-[#FFF6FA]'
                    }`}
                  >
                    <span>{h.label}</span>
                    <span>{done ? '🌸' : '⬜'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 10. CHÚ GIÓ MÁT — THỔI BAY MUỘN PHIỀN */}
        {activePanel === 'breeze' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id="breeze" className="w-24 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#E8F5E1] border-2 border-[#593A47] text-xs font-extrabold">
              🍃 Cối Xay Gió Số 10 • Chú Gió Mát
            </span>
            <h3 className="text-lg font-black text-[#593A47]">Thổi Bay Muộn Phiền</h3>
            {blownDone ? (
              <div className="p-4 rounded-2xl bg-[#E8F5E1] border-2 border-[#593A47] space-y-2">
                <div className="text-3xl">🌬️🌼✨</div>
                <p className="text-sm font-extrabold text-[#593A47]">
                  Làn gió mát đã cuốn muộn phiền vỡ thành cánh bồ công anh bay lên trời rồi. Hít một hơi thật sâu nhé!
                </p>
                <button
                  type="button"
                  onClick={() => setBlownDone(false)}
                  className="kawaii-btn bg-[#FFE066] text-[#593A47] text-xs font-black px-4 py-1.5"
                >
                  Thổi thêm 1 điều khác
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  maxLength={180}
                  value={worryText}
                  onChange={(e) => setWorryText(e.target.value)}
                  placeholder="Viết ra 1 điều khiến bạn đang nặng lòng..."
                  className={`w-full p-3.5 rounded-2xl bg-white border-[2.5px] border-[#593A47] text-sm font-bold text-[#593A47] resize-none transition-all duration-700 ${
                    isBlowingAway ? '-translate-y-12 scale-75 opacity-0 rotate-6' : ''
                  }`}
                />
                <button
                  type="button"
                  disabled={!worryText.trim() || isBlowingAway}
                  onClick={handleBlowWorry}
                  className="kawaii-btn w-full py-2.5 bg-[#B4E197] hover:bg-[#9FD77D] disabled:opacity-50 text-[#593A47] font-black text-sm"
                >
                  {isBlowingAway ? '🌬️ Đang thổi bay lên trời...' : '🍃 Thổi bay muộn phiền'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 11. CÔ TUYẾT BÔNG — VIÊN PHA LÊ KÝ ỨC */}
        {activePanel === 'snowflake' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id="snowflake" className="w-24 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#EBF8FF] border-2 border-[#593A47] text-xs font-extrabold">
              ❄️ Tiệm Kem Tuyết Số 11 • Cô Tuyết Bông
            </span>
            <h3 className="text-lg font-black text-[#593A47]">Viên Pha Lê Ký Ức</h3>
            <form onSubmit={handleSaveCrystal} className="space-y-2.5">
              <input
                type="text"
                maxLength={120}
                value={crystalInput}
                onChange={(e) => setCrystalInput(e.target.value)}
                placeholder="Lưu 1 khoảnh khắc vui nhỏ hôm nay..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#593A47] text-sm font-bold text-[#593A47]"
              />
              <button
                type="submit"
                className="kawaii-btn w-full py-2 bg-[#BEE3F8] text-[#593A47] font-black text-sm"
              >
                ❄️ Đóng băng khoảnh khắc
              </button>
            </form>
            {crystals.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 text-left pt-1">
                {crystals.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-[#F0F8FF] border border-[#593A47]/40 text-xs font-bold text-[#593A47]">
                    <span className="text-[10px] text-[#7D5867] block">{c.date}</span>
                    ❄️ {c.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 12. BÀ CỰC QUANG — DẢI LỤA CỰC QUANG & 13. BÁC SAO THỔ — KÍNH THIÊN VĂN CHIÊM NGHIỆM */}
        {(activePanel === 'aurora' || activePanel === 'saturn') && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id={activePanel} className="w-24 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#F3E8FF] border-2 border-[#593A47] text-xs font-extrabold">
              {activePanel === 'aurora'
                ? '🌌 Lều Cực Quang Số 12 • Bà Cực Quang'
                : '🪐 Thư Viện Vành Đai Số 13 • Bác Sao Thổ'}
            </span>
            <h3 className="text-lg font-black text-[#593A47]">
              {activePanel === 'aurora' ? 'Dải Lụa Ánh Sáng Cực Quang' : 'Kính Thiên Văn Chiêm Nghiệm Vũ Trụ'}
            </h3>
            <div
              className={`p-4 rounded-2xl border-2 border-[#593A47] text-xs sm:text-sm font-extrabold text-[#593A47] leading-relaxed ${
                activePanel === 'aurora'
                  ? 'bg-gradient-to-r from-[#E0F2FE] via-[#F3E8FF] to-[#DCFCE7]'
                  : 'bg-[#FFFBEB]'
              }`}
            >
              {activePanel === 'aurora'
                ? '🌌 Hãy nhắm mắt lại 5 giây và tưởng tượng một dải lụa xanh tím mềm mại đang ôm lấy mọi muộn phiền của bạn. Đêm nay hãy ngủ thật ngon nhé!'
                : '🪐 Nhìn qua kính thiên văn của Bác Sao Thổ: Vũ trụ có hàng tỷ ngôi sao, nhưng không có ngôi sao nào giống hệt bạn — hãy luôn tự hào về hành trình của riêng mình!'}
            </div>
          </div>
        )}

        {/* 14. BÉ ĐOM ĐÓM — WHITE NOISE & HẸN GIỜ RU NGỦ */}
        {activePanel === 'firefly' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id="firefly" className="w-24 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#FEF9C3] border-2 border-[#593A47] text-xs font-extrabold">
              🏮 Tổ Đèn Số 14 • Bé Đom Đóm
            </span>
            <h3 className="text-lg font-black text-[#593A47]">Âm Thanh Ru Ngủ (White Noise)</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rain', icon: '🌧️', label: 'Mưa êm' },
                { id: 'night_breeze', icon: '🌙', label: 'Đêm hè' },
                { id: 'fireplace', icon: '🔥', label: 'Lửa trại' },
              ].map((s) => {
                const isOn = activeAmbientSound === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => (isOn ? onStopAmbient() : onStartAmbient(s.id, sleepTimerMinutes || 15))}
                    className={`p-3 rounded-2xl border-2 border-[#593A47] flex flex-col items-center gap-1 font-extrabold text-xs transition ${
                      isOn ? 'bg-[#FFE066] shadow-[0_3px_0_#593A47]' : 'bg-white hover:bg-[#FFF9E6]'
                    }`}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-[#593A47]">
              <span>⏱️ Hẹn tắt:</span>
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onStartAmbient(activeAmbientSound || 'rain', mins)}
                  className={`px-2.5 py-1 rounded-full border-2 border-[#593A47] ${
                    sleepTimerMinutes === mins && activeAmbientSound ? 'bg-[#FFE066]' : 'bg-white'
                  }`}
                >
                  {mins}p
                </button>
              ))}
            </div>
            {activeAmbientSound && (
              <button
                type="button"
                onClick={onStopAmbient}
                className="kawaii-btn w-full py-2 bg-[#FFE4EE] text-[#593A47] font-black text-xs"
              >
                🔇 Tắt âm thanh ru ngủ
              </button>
            )}
          </div>
        )}

        {/* 15. CHỊ HOÀNG HÔN — 3 ĐIỀU BIẾT ƠN */}
        {activePanel === 'sunset' && (
          <div className="space-y-3.5">
            <div className="flex justify-center">
              <CharacterAvatar id="sunset" className="w-24 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFEDD5] border-2 border-[#593A47] text-xs font-extrabold">
              ☕ Cà Phê Hoàng Hôn Số 15 • Chị Hoàng Hôn
            </span>
            <h3 className="text-lg font-black text-[#593A47]">3 Điều Biết Ơn Hôm Nay</h3>
            <form onSubmit={handleSaveGratitude} className="space-y-2">
              {goodThings.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={100}
                  value={val}
                  onChange={(e) => {
                    const next = [...goodThings];
                    next[idx] = e.target.value;
                    setGoodThings(next);
                  }}
                  placeholder={`Điều nhỏ bé thứ ${idx + 1} khiến bạn mỉm cười...`}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-[#593A47] text-xs sm:text-sm font-bold text-[#593A47]"
                />
              ))}
              <button
                type="submit"
                className="kawaii-btn w-full py-2 bg-[#FDBA74] text-[#593A47] font-black text-sm"
              >
                📸 Lưu kỷ niệm chiều nay
              </button>
            </form>
            {savedGratitudes.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-1.5 text-left">
                {savedGratitudes.slice(0, 3).map((g) => (
                  <div key={g.id} className="p-2 rounded-xl bg-[#FFF7ED] border border-[#593A47]/30 text-xs font-bold">
                    <span className="text-[10px] text-[#8C6575]">{g.date}</span>
                    <ul className="list-disc pl-4">
                      {g.items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 16. ÔNG SAO BẮC ĐẨU — LA BÀN ĐỊNH HƯỚNG */}
        {activePanel === 'north_star' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CharacterAvatar id="north_star" className="w-24 h-24" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#DBEAFE] border-2 border-[#593A47] text-xs font-extrabold">
              🧭 Ngọn Hải Đăng Số 16 • Ông Sao Bắc Đẩu
            </span>
            <h3 className="text-lg font-black text-[#593A47]">La Bàn Định Hướng</h3>
            <div className={`text-4xl transition-transform duration-500 ${compassSpinning ? 'rotate-[360deg] scale-110' : ''}`}>
              🧭
            </div>
            <div className="p-4 rounded-2xl bg-[#EFF6FF] border-2 border-[#593A47] text-sm font-extrabold text-[#593A47] leading-relaxed">
              {compassMessage}
            </div>
            <button
              type="button"
              onClick={handleSpinCompass}
              className="kawaii-btn px-5 py-2 bg-[#93C5FD] text-[#593A47] font-black text-sm"
            >
              ✨ Xoay kim la bàn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
