import React from 'react';
import CharacterAvatar from './CharacterAvatar';
import TownHillBackgroundSvg from './TownHillBackgroundSvg';
import TownSideScenery from './TownSideScenery';
import {
  UserHouseSvg,
  ScenicHouseSvg,
  HouseWoodenSignpostSvg,
  TownArchedHeaderSvg
} from './TownHousesSvg';
import { TOWN_CHARACTERS } from '../data/characterSprites';

const TIME_PERIOD_META = {
  morning: { icon: '🌅', label: 'Buổi sáng • Trời sáng' },
  afternoon: { icon: '☀️', label: 'Trưa chiều • Nắng ấm' },
  evening: { icon: '🌆', label: 'Buổi tối • Hoàng hôn' },
  night: { icon: '🌌', label: 'Ban đêm • Trời khuya' }
};

function HillHouseItem({
  char,
  isTownUnlocked,
  onSelectCharacter,
  delay = '0ms',
  posClass = '',
  signSide = 'left'
}) {
  if (!char) return null;

  const signPosClass =
    signSide === 'left'
      ? 'right-[86%] sm:right-[88%] bottom-0.5'
      : 'left-[86%] sm:left-[88%] bottom-0.5';

  return (
    <div className={`absolute -translate-x-1/2 z-20 transition-all duration-500 ${posClass}`}>
      <button
        type="button"
        onClick={() => {
          if (isTownUnlocked) {
            onSelectCharacter(char);
          }
        }}
        title={
          isTownUnlocked
            ? `${char.name} — Click để trò chuyện`
            : `${char.houseName} (Đang đóng cửa)`
        }
        className={`group relative flex flex-col items-center focus:outline-none transition-transform duration-300 ${
          isTownUnlocked ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : 'cursor-default'
        }`}
      >
        {/* Hình ảnh Ngôi Nhà được trích xuất trực tiếp từ thiết kế mẫu */}
        <ScenicHouseSvg id={char.id} isDoorOpen={isTownUnlocked} />

        {/* BẢNG TÊN GỖ CỦA NGÔI NHÀ (Giống bảng Nhà Của Bạn) đặt kế bên nhà và cắm xuống bãi cỏ */}
        <div className={`absolute ${signPosClass} z-30 pointer-events-auto transition-transform duration-300 group-hover:scale-105`}>
          <HouseWoodenSignpostSvg name={char.name} />
        </div>

        {/* Nhân vật hiện tại của bạn bước ra trước cửa nhà khi mở cửa */}
        <div
          style={{ transitionDelay: delay }}
          className={`absolute -bottom-1.5 z-30 transition-all duration-700 ease-out flex flex-col items-center ${
            isTownUnlocked
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-0 translate-y-6 pointer-events-none'
          }`}
        >
          <CharacterAvatar
            id={char.id}
            className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 drop-shadow-[0_4px_6px_rgba(89,58,71,0.28)]"
          />
        </div>
      </button>
    </div>
  );
}

export default function TownStreetScene({
  timePeriod = 'morning',
  timeMode = 'auto',
  onChangeTimeMode,
  isNightMode,
  isTownUnlocked,
  remainingStarsCount,
  remainingCooldownMs,
  formatDurationHMS,
  resident,
  residentStats,
  historyCount = 0,
  onOpenHistoryModal,
  onSelectCharacter,
  onOpenUserHouse,
  onClickCentralStarFountain
}) {
  const charMap = {};
  TOWN_CHARACTERS.forEach((c) => {
    charMap[c.id] = c;
  });

  const userHouseTitle =
    resident.isLoggedIn && resident.nickname ? `Nhà của ${resident.nickname}` : 'Nhà Của Bạn';

  const currentPeriodMeta = TIME_PERIOD_META[timePeriod] || TIME_PERIOD_META.morning;

  return (
    <div
      style={{ height: '100dvh', minHeight: '100vh', maxHeight: '100dvh' }}
      className="relative w-screen overflow-hidden select-none"
    >
      {/* 1. PHÔNG NỀN BẦU TRỜI 4 KHUNG GIỜ THỰC, ĐỒI CỎ ĐÃ HẠ THẤP & CON ĐƯỜNG PHỐI CẢNH (TO Ở GẦN, THU HẸP DẦN Ở XA) */}
      <TownHillBackgroundSvg timePeriod={timePeriod} isNightMode={isNightMode} />

      {/* 2. CÂY CỐI, NHÀ CỬA XUNG QUANH & CÁC BÉ ĐỘNG VẬT (THỎ, CHÓ, MÈO, CỪU) DI CHUYỂN 2 BÊN ĐỒI */}
      <TownSideScenery timePeriod={timePeriod} />

      {/* 3. NÚT CHỌN / HIỂN THỊ KHUNG CẢNH THỜI GIAN THỰC NHỎ GỌN Ở GÓC TRÁI TRÊN
      <div className="absolute top-2.5 left-2.5 sm:left-4 z-40 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs border-2 border-[#593A47] rounded-full px-2.5 py-1 shadow-[0_3px_0_#593A47]">
        <span className="text-xs sm:text-sm">{currentPeriodMeta.icon}</span>
        <span className="hidden sm:inline text-[11px] font-extrabold text-[#593A47]">
          {currentPeriodMeta.label}
        </span>
        {onChangeTimeMode && (
          <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-[#593A47]/25">
            {[
              { key: 'auto', label: 'Tự động', title: 'Tự động theo giờ thực' },
              { key: 'morning', label: '🌅', title: 'Buổi sáng: Trời sáng' },
              { key: 'afternoon', label: '☀️', title: 'Trưa chiều: Trời buổi trưa chiều' },
              { key: 'evening', label: '🌆', title: 'Buổi tối: Trời tối' },
              { key: 'night', label: '🌌', title: 'Ban đêm: Trời khuya' }
            ].map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => onChangeTimeMode(btn.key)}
                title={btn.title}
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer ${
                  timeMode === btn.key
                    ? 'bg-[#FFE066] text-[#593A47] border border-[#593A47]'
                    : 'text-[#7D5867] hover:bg-[#FFF3B0]/60'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div> */}

      {/* 4. DÒNG CHỮ VÒNG CUNG "Thị Trấn [Hình Bé Sao Bông] Sao Bông" LUÔN LUÔN HIỆN Ở GIỮA TRÊN CÙNG (Chữ trắng, viền đậm, không khung nền) */}
      <div className="absolute top-[7vh] sm:top-[5vh] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex justify-center">
        <TownArchedHeaderSvg />
      </div>

      {/* 5. NGÔI NHÀ CỦA USER (Đặt tại vị trí khoanh xanh trên đỉnh đồi cỏ đã hạ thấp) + NÚT "THẺ SAO ĐÃ MỞ" KẾ BÊN */}
      <div className="absolute left-[50%] top-[17.5%] md:top-[17.8%] -translate-x-1/2 z-30 flex items-center">
        <button
          type="button"
          onClick={onOpenUserHouse}
          title="Chạm vào Ngôi Nhà Của Bạn để xem thông tin & huy hiệu"
          className="group relative flex flex-col items-center focus:outline-none cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-1"
        >
          <UserHouseSvg houseTitle={userHouseTitle} isRegistered={resident.isLoggedIn} />
          <span className="-mt-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF3B0] border-2 border-[#593A47] text-[9px] sm:text-[10px] font-extrabold text-[#593A47] shadow-[0_2px_0_#593A47] group-hover:bg-[#FFE066] whitespace-nowrap">
            {resident.isLoggedIn
              ? `${residentStats.currentTitle} • Xem thông tin nhà`
              : '✨ Click vào nhà để đăng ký tên'}
          </span>
        </button>

        {/* NÚT THẺ SAO ĐÃ MỞ ĐẶT NGAY KẾ BÊN NHÀ CỦA BẠN (Mở Modal ở giữa màn hình) */}
        <button
          type="button"
          onClick={onOpenHistoryModal}
          aria-label="Mở Thẻ Sao May Mắn Đã Mở Hôm Nay"
          title="Thẻ Sao May Mắn Đã Mở Hôm Nay"
          className="kawaii-btn absolute left-full ml-2 sm:ml-3.5 top-1/2 -translate-y-1/2 z-40 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#FFF3B0] hover:bg-[#FFE066] text-[#593A47] flex items-center gap-1.5 whitespace-nowrap"
        >
          <div className="relative flex items-center justify-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="5" width="16" height="19" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="2.4" />
              <rect x="8" y="3" width="16" height="19" rx="4" fill="#FFE4EE" stroke="#593A47" strokeWidth="2.4" />
              <path
                d="M16 7.5L17.6 10.8L21.2 11.3L18.6 13.8L19.2 17.4L16 15.7L12.8 17.4L13.4 13.8L10.8 11.3L14.4 10.8L16 7.5Z"
                fill="#FFD166"
                stroke="#593A47"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span className="-top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B9D] border-2 border-[#593A47] text-white font-extrabold text-[10px] flex items-center justify-center leading-none">
              {historyCount}
            </span>
          </div>
          <span className="hidden sm:inline text-[11px] font-extrabold text-[#593A47]">
            Thẻ sao đã mở
          </span>
        </button>
      </div>

      {/* 6. 8 NGÔI NHÀ NHÂN VẬT ĐẶT ĐÚNG VỊ TRÍ KHOANH XANH TRONG ẢNH MẪU (Không đè hoặc chồng chéo nhau) */}
      {/* Cặp 1: Trái = Nhà Sao Vàng (star - dịch xuống vào khoanh xanh gần đường) | Phải = Nhà Mây Xốp (cloud - dịch vào khoanh xanh gần đường) */}
      <HillHouseItem
        char={charMap.star}
        isTownUnlocked={isTownUnlocked}
        onSelectCharacter={onSelectCharacter}
        delay="60ms"
        signSide="left"
        posClass="left-[23%] sm:left-[34%] md:left-[39.5%] top-[32.5%] md:top-[33.5%]"
      />
      <HillHouseItem
        char={charMap.cloud}
        isTownUnlocked={isTownUnlocked}
        onSelectCharacter={onSelectCharacter}
        delay="140ms"
        signSide="right"
        posClass="left-[77%] sm:left-[66%] md:left-[61.5%] top-[31.5%] md:top-[31.5%]"
      />

      {/* Cặp 2: Trái = Tháp Trăng Khuyết (moon - khoanh xanh giữa trái) | Phải = Nhà Cầu Vồng (rainbow - dịch vào khoanh xanh gần đường) */}
      <HillHouseItem
        char={charMap.moon}
        isTownUnlocked={isTownUnlocked}
        onSelectCharacter={onSelectCharacter}
        delay="220ms"
        signSide="left"
        posClass="left-[20%] sm:left-[24%] md:left-[25.5%] top-[46.5%] md:top-[46.5%]"
      />
      <HillHouseItem
        char={charMap.rainbow}
        isTownUnlocked={isTownUnlocked}
        onSelectCharacter={onSelectCharacter}
        delay="300ms"
        signSide="right"
        posClass="left-[78%] sm:left-[66%] md:left-[60.5%] top-[49.5%] md:top-[50.5%]"
      />

      {/* Cặp 3: Trái = Tiệm Trà Tinh Vân (nebula - dịch xuống khoanh xanh gần đường) | Phải = Tiệm Bánh Mặt Trời (sun - dịch xuống khoanh xanh bên phải) */}
      <HillHouseItem
        char={charMap.nebula}
        isTownUnlocked={isTownUnlocked}
        onSelectCharacter={onSelectCharacter}
        delay="380ms"
        signSide="left"
        posClass="left-[23%] sm:left-[33%] md:left-[36.5%] top-[63.5%] md:top-[65.5%]"
      />
      <HillHouseItem
        char={charMap.sun}
        isTownUnlocked={isTownUnlocked}
        onSelectCharacter={onSelectCharacter}
        delay="460ms"
        signSide="right"
        posClass="left-[77%] sm:left-[74%] md:left-[75.5%] top-[61.5%] md:top-[62.5%]"
      />

      {/* Cặp 4: Trái = Bưu Điện Sao Băng (shooting_star - dịch sang khoanh xanh bên trái) | Phải = Trạm Nhạc Tai Nghe (spark - dịch sang khoanh xanh gần đường) */}
      <HillHouseItem
        char={charMap.shooting_star}
        isTownUnlocked={isTownUnlocked}
        onSelectCharacter={onSelectCharacter}
        delay="540ms"
        signSide="left"
        posClass="left-[19%] sm:left-[18%] md:left-[16.5%] top-[75.5%] md:top-[73.8%]"
      />
      <HillHouseItem
        char={charMap.spark}
        isTownUnlocked={isTownUnlocked}
        onSelectCharacter={onSelectCharacter}
        delay="620ms"
        signSide="right"
        posClass="left-[78%] sm:left-[68%] md:left-[66.5%] top-[76.5%] md:top-[75.8%]"
      />

      {/* 7. NÚT LỌ SAO HY VỌNG NẰM Ở CUỐI CON ĐƯỜNG ĐÁ CUỘI */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-max max-w-[95%]">
        <button
          type="button"
          onClick={onClickCentralStarFountain}
          className="kawaii-btn bg-[#EFE5FF] hover:bg-[#E2D4FF] px-5 sm:px-7 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-extrabold text-[#593A47] shadow-[0_5px_0_#593A47]"
        >
          <span className="text-base sm:text-lg">🌟</span>
          <span>
            Sao trong lọ:{' '}
            <strong className="text-[#D9386A]">
              {remainingStarsCount.toLocaleString('vi-VN')}
            </strong>
          </span>
          <span className="text-[#8C6575]">|</span>
          <span className="underline text-[#D9386A]">
            {remainingCooldownMs > 0
              ? `Chờ ${formatDurationHMS(remainingCooldownMs)}`
              : 'Mở Hộp Sao ✨'}
          </span>
        </button>
      </div>
    </div>
  );
}
