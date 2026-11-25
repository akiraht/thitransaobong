/**
 * CẤU HÌNH ĐỒNG BỘ 4 BẢN ĐỒ (MAPS 2.5D) & TỌA ĐỘ GẮN NHÀ TỰ ĐỘNG (HOUSE PLOTS)
 * Ánh xạ trực tiếp từ ĐẶC TẢ KỸ THUẬT TOWN_MAPS_CONFIG
 */

import {
  TOWN_MAPS_CONFIG,
  getMapObstaclesFromConfig,
  getMapLandmarksFromConfig,
  getMapSkyHorizon,
  getMapBounds
} from '../config/maps_plots_config';
import { TOWN_HOUSES_DATA } from './townHousesConfig';

export { TOWN_MAPS_CONFIG };

export const TOWN_MAPS = Object.values(TOWN_MAPS_CONFIG).map((m) => ({
  id: m.mapId,
  name: m.name,
  shortName: m.shortName,
  subtitle: m.subtitle,
  icon: m.icon,
  badgeColor: '#FFF3B0',
  tagColor: '#593A47',
  bgImage: `/assets/maps/${m.imageFileName}`,
  fallbackBg: '/images/town-bg-wide.webp',
  startPos: { x: m.defaultSpawn.xPct, y: m.defaultSpawn.yPct },
  houses: m.plots.map((p) => {
    const origHouse = TOWN_HOUSES_DATA.find((h) => h.id === p.residentId || h.charId === p.residentId);
    return {
      id: p.residentId,
      plotId: p.plotId,
      type: p.residentId === 'user_house' ? 'user' : 'character',
      charId: p.residentId,
      name: p.residentName,
      signName: p.houseName,
      houseTitle: `${p.houseName} • Số ${p.houseNumber}`,
      x: p.xPct,
      y: p.yPct,
      scale: p.scale,
      signSide: p.xPct > 50 ? 'right' : 'left',
      collisionW: (p.collisionW || 8.5) * p.scale,
      collisionH: (p.collisionH || 9.5) * p.scale,
      triggerRadius: (p.doorTriggerRadiusPx / 1920) * 100 * 1.05,
      speaker: p.residentName,
      dialogue:
        origHouse?.dialogue ||
        `Chào bạn nhỏ! Mình là ${p.residentName}, chào mừng ghé thăm ${p.houseName} nhé~`,
      actionText:
        origHouse?.actionText ||
        (p.residentId === 'user_house' ? 'Vào Nhà Của Bạn 🏡' : `Trò chuyện với ${p.residentName} ✨`),
      icon: origHouse?.icon || (p.residentId === 'user_house' ? '🏡' : '⭐'),
      badgeBg: origHouse?.badgeBg || '#FFF4BD',
    };
  }),
  portals: m.portals.map((pr) => ({
    id: pr.portalId,
    targetMapId: pr.targetMapId,
    targetPos: { x: pr.targetSpawnXPct, y: pr.targetSpawnYPct },
    x: pr.xPct,
    y: pr.yPct,
    radius: (pr.triggerRadiusPx / 1920) * 100 * 1.05,
    label: pr.label,
    icon: pr.icon || '🌀',
    arrow: pr.arrow || '➡️',
  })),
}));

export const MAP_DICT = {};
TOWN_MAPS.forEach((m) => {
  MAP_DICT[m.id] = m;
});

// Alias tương thích ngược nếu có code cũ gọi id ngắn
MAP_DICT['hope_hill'] = MAP_DICT['map_hope_hill'];
MAP_DICT['cosmic_valley'] = MAP_DICT['map_astronomy_valley'];
MAP_DICT['food_street'] = MAP_DICT['map_astronomy_valley'];
MAP_DICT['weather_melody'] = MAP_DICT['map_weather_lane'];
MAP_DICT['mischief_alley'] = MAP_DICT['map_mischief_alley'];

/**
 * Lấy danh sách hộp va chạm vật lý cho từng map cụ thể
 */
export function getMapObstacles(mapId = 'map_hope_hill') {
  const normalizedId = MAP_DICT[mapId]?.id || 'map_hope_hill';
  return getMapObstaclesFromConfig(normalizedId);
}

/**
 * Lấy danh sách vùng kích hoạt tương tác cho từng map cụ thể
 */
export function getMapLandmarks(mapId = 'map_hope_hill') {
  const normalizedId = MAP_DICT[mapId]?.id || 'map_hope_hill';
  return getMapLandmarksFromConfig(normalizedId);
}

/**
 * Lấy danh sách điểm mốc đường chân trời giới hạn trên cho từng map
 */
export function getMapSkyHorizonPoints(mapId = 'map_hope_hill') {
  const normalizedId = MAP_DICT[mapId]?.id || 'map_hope_hill';
  return getMapSkyHorizon(normalizedId);
}

/**
 * Lấy giới hạn không gian di chuyển (minX, maxX, maxY) cho từng map
 */
export function getMapWalkBounds(mapId = 'map_hope_hill') {
  const normalizedId = MAP_DICT[mapId]?.id || 'map_hope_hill';
  return getMapBounds(normalizedId);
}
