import React from 'react';
import { CHARACTER_SPRITES, TOWN_CHARACTERS } from '../data/characterSprites';
import { getMiniGameByNpcId } from '../config/minigamesConfig';

const MAP_STORY_META = {
  map_hope_hill: {
    badge: 'Khu Vực Khởi Đầu',
    accentBg: '#FFF4BD',
    description:
      'Trái tim ấm áp của Thị Trấn Sao Bông với Đài Sao Hy Vọng, Tòa Thị Chính, Tiệm Bánh Bình Minh và Ngôi Nhà Của Bạn.',
  },
  map_astronomy_valley: {
    badge: 'Thung Lũng Huyền Diệu',
    accentBg: '#EFE5FF',
    description:
      'Vùng đất lung linh ánh trăng và dải ngân hà — nơi lý tưởng để nghe kể chuyện đêm, ngắm sao và thư giãn bên tách trà ấm.',
  },
  map_weather_lane: {
    badge: 'Con Phố Năng Lượng',
    accentBg: '#DFF8EB',
    description:
      'Con ngõ rộn ràng giai điệu Lofi, những cơn gió mát lành, kem tuyết mát rượi và tách cà phê chiều hoàng hôn.',
  },
  map_mischief_alley: {
    badge: 'Khu Phố Bí Mật • Map 4',
    accentBg: '#FFE4EE',
    description:
      'Góc phố tinh nghịch của Biệt Đội Siêu Quậy! Nơi diễn ra những màn ném tuyết kịch tính và loạt nhiệm vụ vui nhộn.',
  },
};

export default function MapIntroModal({ mapData, onClose }) {
  if (!mapData) return null;

  const meta = MAP_STORY_META[mapData.id] || {
    badge: 'Khu Vực Thị Trấn',
    accentBg: '#FFF4BD',
    description: mapData.subtitle || 'Khám phá những người bạn dễ thương và các hoạt động thú vị tại đây!',
  };

  const residentIds = (mapData.houses || [])
    .filter((h) => h.type === 'character')
    .map((h) => h.charId || h.id);

  const residents = residentIds
    .map((id) => TOWN_CHARACTERS.find((c) => c.id === id))
    .filter(Boolean);

  const mapMiniGames = residents
    .map((r) => getMiniGameByNpcId(r.id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-[1200] bg-[#593A47]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="kawaii-card w-full max-w-lg max-h-[88dvh] overflow-y-auto bg-gradient-to-b from-[#FFFDF9] to-[#FFF6FA] border-[3px] border-[#593A47] shadow-[0_8px_0_#593A47] p-4 sm:p-5 space-y-4 pop-in text-[#593A47]">
        {/* Header bản đồ */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: meta.accentBg }}
              className="w-13 h-13 rounded-2xl border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center justify-center text-3xl shrink-0"
            >
              {mapData.icon || '🗺️'}
            </div>
            <div>
              <span
                style={{ backgroundColor: meta.accentBg }}
                className="inline-block px-2 py-0.5 rounded-full border border-[#593A47] text-[10px] font-black mb-1"
              >
                ✨ Lần Đầu Đặt Chân • {meta.badge}
              </span>
              <h2 className="text-lg sm:text-xl font-black leading-tight">{mapData.name}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-[#FFE4EE] hover:bg-[#FFC9DC] border-2 border-[#593A47] font-black text-sm flex items-center justify-center shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mô tả khu vực */}
        <p className="text-xs sm:text-sm font-bold text-[#7D5867] leading-relaxed bg-white/90 rounded-2xl border-2 border-[#E5D3DC] p-3">
          {meta.description}
        </p>

        {/* Danh sách cư dân NPC trong map */}
        <div className="space-y-2">
          <div className="text-xs font-black text-[#593A47]">
            🏡 Cư dân sinh sống tại đây ({residents.length} người bạn):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {residents.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 p-2 rounded-2xl bg-white border-2 border-[#593A47]/20"
              >
                <img
                  src={CHARACTER_SPRITES[r.id]}
                  alt={r.name}
                  className="w-9 h-9 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-black truncate">{r.name}</div>
                  <div className="text-[9px] font-bold text-[#8C6575] truncate">{r.signName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danh sách Mini-Game có thể chơi tại map này */}
        <div className="space-y-2">
          <div className="text-xs font-black text-[#593A47]">
            🎮 Mini-Game có thể chơi tại khu vực này ({mapMiniGames.length}):
          </div>
          {mapMiniGames.length > 0 ? (
            <div className="space-y-2">
              {mapMiniGames.map((mg) => (
                <div
                  key={mg.id}
                  style={{ backgroundColor: mg.accentBg }}
                  className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl border-2 border-[#593A47]"
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black truncate">
                      {mg.icon} {mg.title}
                    </div>
                    <div className="text-[10px] font-bold text-[#7D5867] truncate">
                      Tại nhà {mg.npcName} • {mg.genre}
                    </div>
                  </div>
                  <a
                    href={`/minigame/${mg.id}`}
                    className="kawaii-btn shrink-0 px-3 py-1.5 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] font-black text-xs"
                  >
                    Chơi ngay ▶
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-[#FFF9FC] border-2 border-dashed border-[#E5D3DC] text-xs font-bold text-[#7D5867]">
              ✨ Khu vực này có nhiều kỹ năng chữa lành & nhiệm vụ thú vị cùng các cư dân!
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="kawaii-btn w-full py-2.5 bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-black text-sm cursor-pointer"
        >
          ✨ Bắt Đầu Khám Phá {mapData.shortName || mapData.name}!
        </button>
      </div>
    </div>
  );
}
