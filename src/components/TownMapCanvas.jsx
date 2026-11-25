import React from 'react';
import { TOWN_MAPS_CONFIG } from '../config/maps_plots_config';
import { HOUSE_SPRITES } from '../data/houseSprites';
import { CHARACTER_SPRITES } from '../data/characterSprites';

/**
 * Component React Mẫu Tự Động Gắn Nhà & Cư Dân Lên Map (TownMapCanvas)
 * Theo đặc tả kỹ thuật 4 Maps 2.5D & House Plots.
 */
export default function TownMapCanvas({
  currentMapId = 'map_hope_hill',
  playerPos = { xPct: 48.0, yPct: 58.0 },
  playerSpriteKey = 'user_character',
  onSelectPlot,
  onTriggerPortal,
}) {
  const mapConfig = TOWN_MAPS_CONFIG[currentMapId] || TOWN_MAPS_CONFIG.map_hope_hill;

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-3xl shadow-xl select-none bg-[#7ED49E]">
      {/* 1. Lớp nền Bản đồ 2.5D */}
      <img
        src={`/assets/maps/${mapConfig.imageFileName}`}
        onError={(e) => {
          // Fallback về nền mặc định nếu chưa có file ảnh riêng
          if (!e.currentTarget.src.includes('town-bg-wide.webp')) {
            e.currentTarget.src = '/images/town-bg-wide.webp';
          }
        }}
        alt={mapConfig.name}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* 2. Tự động gắn các Ngôi nhà & Cư dân vào từng Ô đất tròn */}
      {mapConfig.plots.map((plot) => {
        const dx = (playerPos.xPct - plot.xPct) * (mapConfig.baseWidth / 100);
        const dy = (playerPos.yPct - plot.yPct) * (mapConfig.baseHeight / 100);
        const isNear = Math.hypot(dx, dy) <= plot.doorTriggerRadiusPx;

        return (
          <div
            key={plot.plotId}
            onClick={() => onSelectPlot && onSelectPlot(plot.residentId)}
            style={{
              left: `${plot.xPct}%`,
              top: `${plot.yPct}%`,
              zIndex: Math.round(plot.yPct * 10),
              transform: `translate(-50%, -82%) scale(${plot.scale})`,
              transformOrigin: 'bottom center',
            }}
            className="absolute cursor-pointer transition-transform duration-300 hover:brightness-105"
          >
            <img
              src={HOUSE_SPRITES[plot.residentId] || HOUSE_SPRITES.star}
              alt={plot.houseName}
              className="w-36 sm:w-44 md:w-52 h-auto drop-shadow-md"
            />
            {isNear && plot.residentId !== 'user_house' && (
              <img
                src={CHARACTER_SPRITES[plot.residentId]}
                alt={plot.residentName}
                className="absolute -bottom-3 -right-6 w-16 sm:w-20 h-auto animate-bounce drop-shadow"
              />
            )}
          </div>
        );
      })}

      {/* 3. Cổng chuyển vùng (Portals) */}
      {mapConfig.portals.map((portal) => (
        <button
          key={portal.portalId}
          type="button"
          onClick={() =>
            onTriggerPortal &&
            onTriggerPortal(portal.targetMapId, portal.targetSpawnXPct, portal.targetSpawnYPct)
          }
          style={{
            left: `${portal.xPct}%`,
            top: `${portal.yPct}%`,
            zIndex: 999,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute px-3 py-1.5 rounded-full bg-white/90 text-[#593A47] text-xs font-bold shadow-md hover:scale-105 transition cursor-pointer flex items-center gap-1"
        >
          <span>{portal.icon || '🌀'}</span>
          <span>{portal.label}</span>
        </button>
      ))}

      {/* 4. Nhân vật Người chơi ("Bạn nhỏ đáng yêu") với tỷ lệ phối cảnh tự động theo trục Y */}
      <div
        style={{
          left: `${playerPos.xPct}%`,
          top: `${playerPos.yPct}%`,
          zIndex: Math.round(playerPos.yPct * 10) + 1,
          transform: `translate(-50%, -85%) scale(${0.72 + (playerPos.yPct / 100) * 0.45})`,
          transformOrigin: 'bottom center',
        }}
        className="absolute pointer-events-none transition-all duration-150"
      >
        <img
          src={CHARACTER_SPRITES[playerSpriteKey] || CHARACTER_SPRITES.user_character}
          alt="Bạn nhỏ đáng yêu"
          className="w-16 sm:w-20 h-auto drop-shadow"
        />
      </div>
    </div>
  );
}

