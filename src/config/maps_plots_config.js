import { TOWN_HOUSES_DATA } from '../data/townHousesConfig';

/**
 * CẤU HÌNH ĐẶC TẢ KỸ THUẬT HỆ THỐNG 4 BẢN ĐỒ (MAPS 2.5D) & TỌA ĐỘ GẮN NHÀ TỰ ĐỘNG (HOUSE PLOTS)
 * Hệ tọa độ chuẩn Full HD: 1920 x 1080 px (Tỷ lệ 16:9) / 1376 x 768 px
 * 
 * Quy ước:
 * - Điểm neo: bottom center / translate(-50%, -82%)
 * - zIndex: Math.round(yPct * 10)
 */

export const TOWN_MAPS_CONFIG = {
  // ============================================================================
  // 1. ĐỈNH ĐỒI HY VỌNG (1920 x 1080 px)
  // ============================================================================
  map_hope_hill: {
    mapId: 'map_hope_hill',
    shortName: 'Đỉnh Đồi',
    name: 'Đỉnh Đồi Hy Vọng',
    subtitle: 'Quảng Trường Lọ Sao & Khu Phố Bình Minh',
    icon: '🌟',
    imageFileName: 'map_01_hope_hill.webp',
    baseWidth: 1920,
    baseHeight: 1080,
    defaultSpawn: { xPct: 48.0, yPct: 58.0, x: 922, y: 626 },
    ambientTheme: 'morning_rainbow',
    skyHorizonPoints: [
      { x: 0.0, y: 52.0 },
      { x: 12.0, y: 43.0 },
      { x: 24.0, y: 35.0 },
      { x: 36.0, y: 29.0 },
      { x: 50.0, y: 25.5 },
      { x: 64.0, y: 29.0 },
      { x: 76.0, y: 35.0 },
      { x: 88.0, y: 43.0 },
      { x: 100.0, y: 52.0 }
    ],
    bounds: { minX: 3.0, maxX: 97.0, maxY: 94.0 },
    landmarks: [
      {
        landmarkId: 'wishing_star_jar',
        name: 'Lọ Sao 2.000 Điều Ước',
        description: 'Lọ Sao trung tâm lưu giữ những Thẻ Sao May Mắn bạn đã mở hôm nay.',
        xPct: 51.2,
        yPct: 49.5,
        x: 983,
        y: 535,
        scale: 0.92,
        interactiveAction: 'Xem Thẻ Sao Đã Mở 🗂️',
      },
    ],
    plots: [
      {
        plotId: 'hope_plot_01',
        residentId: 'user_house',
        houseNumber: '00',
        residentName: 'Bạn nhỏ đáng yêu',
        houseName: 'Ngôi Nhà Của Bạn',
        xPct: 34.5,
        yPct: 37.5,
        x: 662,
        y: 405,
        scale: 0.78,
        doorTriggerRadiusPx: 95,
        collisionW: 9.0,
        collisionH: 8.5,
      },
      {
        plotId: 'hope_plot_02',
        residentId: 'cloud',
        houseNumber: '03',
        residentName: 'Bác Mây Xốp',
        houseName: 'Tòa Thị Chính Mây Xốp',
        xPct: 61.5,
        yPct: 36.2,
        x: 1181,
        y: 391,
        scale: 0.78,
        doorTriggerRadiusPx: 105,
        collisionW: 8.5,
        collisionH: 9.5,
      },
      {
        plotId: 'hope_plot_03',
        residentId: 'star',
        houseNumber: '01',
        residentName: 'Bé Sao Bông',
        houseName: 'Đài Sao Hy Vọng',
        xPct: 24.5,
        yPct: 50.0,
        x: 470,
        y: 540,
        scale: 0.86,
        doorTriggerRadiusPx: 112,
        collisionW: 8.0,
        collisionH: 9.5,
      },
      {
        plotId: 'hope_plot_04',
        residentId: 'rainbow',
        houseNumber: '06',
        residentName: 'Chị Cầu Vồng',
        houseName: 'Đài Khí Tượng Cầu Vồng',
        xPct: 72.0,
        yPct: 44.5,
        x: 1382,
        y: 481,
        scale: 0.84,
        doorTriggerRadiusPx: 112,
        collisionW: 8.5,
        collisionH: 9.5,
      },
      {
        plotId: 'hope_plot_05',
        residentId: 'sun',
        houseNumber: '02',
        residentName: 'Cô Nắng Mai',
        houseName: 'Tiệm Bánh Bình Minh',
        xPct: 28.0,
        yPct: 64.5,
        x: 538,
        y: 697,
        scale: 0.98,
        doorTriggerRadiusPx: 118,
        collisionW: 8.5,
        collisionH: 9.5,
      },
      {
        plotId: 'hope_plot_06',
        residentId: 'shooting_star',
        houseNumber: '04',
        residentName: 'Bé Sao Băng',
        houseName: 'Bưu Điện Sao Băng',
        xPct: 42.8,
        yPct: 72.5,
        x: 822,
        y: 783,
        scale: 1.04,
        doorTriggerRadiusPx: 125,
        collisionW: 8.2,
        collisionH: 9.5,
      },
      {
        plotId: 'hope_plot_07',
        residentId: 'spark',
        houseNumber: '08',
        residentName: 'Anh Tia Chớp',
        houseName: 'Trạm Phát Sóng Lofi',
        xPct: 78.5,
        yPct: 69.8,
        x: 1507,
        y: 754,
        scale: 1.02,
        doorTriggerRadiusPx: 125,
        collisionW: 8.5,
        collisionH: 9.5,
      },
    ],
    walkPathWaypoints: [
      { xPct: 46.5, yPct: 28.0, x: 893, y: 302 },
      { xPct: 48.0, yPct: 36.0, x: 922, y: 389 },
      { xPct: 35.5, yPct: 47.0, x: 682, y: 508 },
      { xPct: 42.0, yPct: 58.5, x: 806, y: 632 },
      { xPct: 62.5, yPct: 64.5, x: 1200, y: 697 },
      { xPct: 65.5, yPct: 74.5, x: 1258, y: 805 },
      { xPct: 45.0, yPct: 85.0, x: 864, y: 918 },
      { xPct: 33.5, yPct: 96.0, x: 643, y: 1037 },
    ],
    portals: [
      {
        portalId: 'hope_to_weather',
        label: '🍃 Xuống Ngõ Thời Tiết',
        icon: '🌈',
        arrow: '⬇️',
        targetMapId: 'map_weather_lane',
        targetSpawnXPct: 44.0,
        targetSpawnYPct: 48.0,
        xPct: 33.5,
        yPct: 95.0,
        x: 643,
        y: 1026,
        triggerRadiusPx: 75,
      },
      {
        portalId: 'hope_to_astronomy',
        label: '🌌 Sang Thung Lũng Thiên Văn',
        icon: '🌙',
        arrow: '⬆️',
        targetMapId: 'map_astronomy_valley',
        targetSpawnXPct: 75.0,
        targetSpawnYPct: 62.0,
        xPct: 47.5,
        yPct: 28.0,
        x: 912,
        y: 302,
        triggerRadiusPx: 75,
      },
    ],
  },

  // ============================================================================
  // 2. THUNG LŨNG THIÊN VĂN (1920 x 1080 px)
  // ============================================================================
  map_astronomy_valley: {
    mapId: 'map_astronomy_valley',
    shortName: 'Thiên Văn',
    name: 'Thung Lũng Thiên Văn',
    subtitle: 'Đài Quan Sát Sao Đêm & Hồ Sen Ngân Hà',
    icon: '🌙',
    imageFileName: 'map_02_astronomy_valley.webp',
    baseWidth: 1920,
    baseHeight: 1080,
    defaultSpawn: { xPct: 49.0, yPct: 70.0, x: 941, y: 756 },
    ambientTheme: 'starry_twilight',
    skyHorizonPoints: [
      { x: 0.0, y: 48.0 },
      { x: 14.0, y: 43.0 },
      { x: 26.0, y: 37.0 },
      { x: 40.0, y: 33.0 },
      { x: 50.0, y: 32.0 },
      { x: 65.0, y: 32.0 },
      { x: 80.0, y: 38.0 },
      { x: 90.0, y: 45.0 },
      { x: 100.0, y: 50.0 }
    ],
    bounds: { minX: 3.5, maxX: 96.5, maxY: 93.0 },
    landmarks: [
      {
        landmarkId: 'crystal_telescope',
        name: 'Đài Kính Viễn Vọng Pha Lê',
        description: 'Ngắm nhìn các chòm sao và chuyển đổi bầu trời Ngày / Đêm.',
        xPct: 49.0,
        yPct: 54.0,
        x: 941,
        y: 583,
        scale: 0.95,
        interactiveAction: 'OPEN_STARGAZING_TELESCOPE',
      },
      {
        landmarkId: 'starlight_lotus_pond',
        name: 'Hồ Sen Ngân Hà',
        description: 'Mặt hồ phản chiếu dải ngân hà nơi thả đèn hoa đăng lời chúc.',
        xPct: 66.0,
        yPct: 46.5,
        x: 1267,
        y: 502,
        scale: 0.88,
        interactiveAction: 'FLOAT_WISH_LANTERN',
      },
    ],
    plots: [
      {
        plotId: 'astro_plot_01',
        residentId: 'north_star',
        houseNumber: '16',
        residentName: 'Bà Sao Bắc Đẩu',
        houseName: 'Ngọn Hải Đăng Bắc Đẩu',
        xPct: 36.2,
        yPct: 40.5,
        x: 695,
        y: 437,
        scale: 0.78,
        doorTriggerRadiusPx: 105,
        collisionW: 8.5,
        collisionH: 10.5,
      },
      {
        plotId: 'astro_plot_02',
        residentId: 'moon',
        houseNumber: '05',
        residentName: 'Chú Trăng Khuyết',
        houseName: 'Đài Thiên Văn Trăng Khuyết',
        xPct: 22.2,
        yPct: 46.8,
        x: 426,
        y: 505,
        scale: 0.84,
        doorTriggerRadiusPx: 112,
        collisionW: 8.2,
        collisionH: 10.0,
      },
      {
        plotId: 'astro_plot_03',
        residentId: 'nebula',
        houseNumber: '07',
        residentName: 'Chị Ngân Hà',
        houseName: 'Tiệm Trà Tinh Vân',
        xPct: 14.8,
        yPct: 62.5,
        x: 284,
        y: 675,
        scale: 0.96,
        doorTriggerRadiusPx: 118,
        collisionW: 8.5,
        collisionH: 9.5,
      },
      {
        plotId: 'astro_plot_04',
        residentId: 'saturn',
        houseNumber: '13',
        residentName: 'Bác Sao Thổ',
        houseName: 'Thư Viện Vành Đai',
        xPct: 31.0,
        yPct: 82.5,
        x: 595,
        y: 891,
        scale: 1.12,
        doorTriggerRadiusPx: 130,
        collisionW: 8.5,
        collisionH: 9.5,
      },
      {
        plotId: 'astro_plot_05',
        residentId: 'aurora',
        houseNumber: '12',
        residentName: 'Chị Cực Quang',
        houseName: 'Rạp Chiếu Bóng Cực Quang',
        xPct: 89.2,
        yPct: 60.2,
        x: 1713,
        y: 650,
        scale: 0.96,
        doorTriggerRadiusPx: 118,
        collisionW: 8.5,
        collisionH: 9.5,
      },
      {
        plotId: 'astro_plot_06',
        residentId: 'firefly',
        houseNumber: '14',
        residentName: 'Bé Đom Đóm',
        houseName: 'Vườn Đom Đóm Tĩnh Tâm',
        xPct: 83.5,
        yPct: 81.0,
        x: 1603,
        y: 875,
        scale: 1.10,
        doorTriggerRadiusPx: 125,
        collisionW: 8.0,
        collisionH: 9.5,
      },
    ],
    walkPathWaypoints: [
      { xPct: 30.5, yPct: 47.5, x: 586, y: 513 },
      { xPct: 26.5, yPct: 61.5, x: 509, y: 664 },
      { xPct: 37.5, yPct: 70.5, x: 720, y: 761 },
      { xPct: 50.5, yPct: 77.5, x: 970, y: 837 },
      { xPct: 48.0, yPct: 95.0, x: 922, y: 1026 },
      { xPct: 64.5, yPct: 75.0, x: 1238, y: 810 },
      { xPct: 76.5, yPct: 66.5, x: 1469, y: 718 },
      { xPct: 79.5, yPct: 53.5, x: 1526, y: 578 },
    ],
    portals: [
      {
        portalId: 'astronomy_to_hope',
        label: '🌈 Lên Đỉnh Đồi Hy Vọng',
        icon: '🌟',
        arrow: '➡️',
        targetMapId: 'map_hope_hill',
        targetSpawnXPct: 65.0,
        targetSpawnYPct: 72.0,
        xPct: 80.5,
        yPct: 52.5,
        x: 1546,
        y: 567,
        triggerRadiusPx: 55,
      },
      {
        portalId: 'astronomy_to_mischief',
        label: '🌀 Rẽ vào Hẻm Xoáy Tinh Nghịch',
        icon: '🌀',
        arrow: '⬇️',
        targetMapId: 'map_mischief_alley',
        targetSpawnXPct: 49.5,
        targetSpawnYPct: 50.5,
        xPct: 49.0,
        yPct: 95.0,
        x: 941,
        y: 1026,
        triggerRadiusPx: 55,
      },
    ],
  },

  // ============================================================================
  // 3. NGÕ THỜI TIẾT (1920 x 1080 px)
  // ============================================================================
  map_weather_lane: {
    mapId: 'map_weather_lane',
    shortName: 'Thời Tiết',
    name: 'Ngõ Thời Tiết',
    subtitle: 'Con Đường Bốn Mùa: Sương Mai – Gió Nhẹ – Tuyết Bông – Ráng Chiều',
    icon: '🌦️',
    imageFileName: 'map_03_weather_lane.webp',
    baseWidth: 1920,
    baseHeight: 1080,
    defaultSpawn: { xPct: 46.5, yPct: 56.0, x: 893, y: 605 },
    ambientTheme: 'four_seasons_breeze',
    skyHorizonPoints: [
      { x: 0.0, y: 36.0 },
      { x: 15.0, y: 30.0 },
      { x: 30.0, y: 26.5 },
      { x: 44.0, y: 32.0 },
      { x: 52.0, y: 36.0 },
      { x: 65.0, y: 43.0 },
      { x: 80.0, y: 48.0 },
      { x: 92.0, y: 52.0 },
      { x: 100.0, y: 56.0 }
    ],
    bounds: { minX: 3.0, maxX: 97.0, maxY: 93.0 },
    landmarks: [
      {
        landmarkId: 'weather_vane_bridge',
        name: 'Cầu Gỗ & Chong Chóng Thời Tiết',
        description: 'Nơi giao nhau giữa 4 vùng khí hậu cảm xúc trong thị trấn.',
        xPct: 44.5,
        yPct: 55.5,
        x: 854,
        y: 599,
        scale: 0.92,
      },
    ],
    plots: [
      {
        plotId: 'weather_plot_01',
        residentId: 'dewdrop',
        houseNumber: '09',
        residentName: 'Bé Sương Mai',
        houseName: 'Nhà Kính Sương Sớm',
        xPct: 11.5,
        yPct: 41.8,
        x: 221,
        y: 451,
        scale: 0.82,
        doorTriggerRadiusPx: 112,
        collisionW: 8.0,
        collisionH: 9.5,
      },
      {
        plotId: 'weather_plot_02',
        residentId: 'breeze',
        houseNumber: '10',
        residentName: 'Anh Gió Nhẹ',
        houseName: 'Cối Xay Gió Bồ Công Anh',
        xPct: 39.2,
        yPct: 42.2,
        x: 753,
        y: 456,
        scale: 0.82,
        doorTriggerRadiusPx: 112,
        collisionW: 8.5,
        collisionH: 9.5,
      },
      {
        plotId: 'weather_plot_03',
        residentId: 'spark',
        houseNumber: '08',
        residentName: 'Anh Tia Chớp (Góc Chuông Gió)',
        houseName: 'Trạm Chuông Gió Lofi',
        xPct: 30.6,
        yPct: 56.2,
        x: 588,
        y: 607,
        scale: 0.94,
        doorTriggerRadiusPx: 118,
        collisionW: 8.5,
        collisionH: 9.5,
      },
      {
        plotId: 'weather_plot_04',
        residentId: 'snowflake',
        houseNumber: '11',
        residentName: 'Cô Tuyết Bông',
        houseName: 'Tiệm Kem Tuyết Bông',
        xPct: 84.8,
        yPct: 48.8,
        x: 1628,
        y: 527,
        scale: 0.88,
        doorTriggerRadiusPx: 118,
        collisionW: 8.0,
        collisionH: 9.5,
      },
      {
        plotId: 'weather_plot_05',
        residentId: 'sunset',
        houseNumber: '15',
        residentName: 'Chú Hoàng Hôn',
        houseName: 'Quán Cà Phê Ráng Chiều',
        xPct: 70.0,
        yPct: 72.2,
        x: 1344,
        y: 780,
        scale: 1.05,
        doorTriggerRadiusPx: 125,
        collisionW: 8.5,
        collisionH: 9.5,
      },
    ],
    walkPathWaypoints: [
      { xPct: 47.5, yPct: 38.5, x: 912, y: 416 },
      { xPct: 35.0, yPct: 33.0, x: 672, y: 356 },
      { xPct: 21.0, yPct: 44.0, x: 403, y: 475 },
      { xPct: 19.0, yPct: 60.0, x: 365, y: 648 },
      { xPct: 35.0, yPct: 72.0, x: 672, y: 778 },
      { xPct: 52.0, yPct: 62.0, x: 998, y: 670 },
      { xPct: 68.0, yPct: 54.0, x: 1306, y: 583 },
      { xPct: 79.0, yPct: 72.0, x: 1517, y: 778 },
      { xPct: 74.0, yPct: 90.0, x: 1421, y: 972 },
    ],
    portals: [
      {
        portalId: 'weather_to_hope',
        label: '🌈 Bậc thang lên Đỉnh Đồi Hy Vọng',
        icon: '🌟',
        arrow: '⬆️',
        targetMapId: 'map_hope_hill',
        targetSpawnXPct: 40.0,
        targetSpawnYPct: 80.0,
        xPct: 47.8,
        yPct: 38.0,
        x: 918,
        y: 410,
        triggerRadiusPx: 75,
      },
      {
        portalId: 'weather_to_mischief',
        label: '🌀 Đi xuống Hẻm Xoáy Tinh Nghịch',
        icon: '🌀',
        arrow: '⬇️',
        targetMapId: 'map_mischief_alley',
        targetSpawnXPct: 23.0,
        targetSpawnYPct: 35.0,
        xPct: 74.0,
        yPct: 91.0,
        x: 1421,
        y: 983,
        triggerRadiusPx: 75,
      },
    ],
  },

  // ============================================================================
  // 4. HẺM XOÁY TINH NGHỊCH (1920 x 1080 px)
  // ============================================================================
  map_mischief_alley: {
    mapId: 'map_mischief_alley',
    shortName: 'Hẻm Xoáy',
    name: 'Hẻm Xoáy Tinh Nghịch',
    subtitle: 'Con Đường Đá Xoáy Ốc & Hồ Xoáy Ngân Hà',
    icon: '🌀',
    imageFileName: 'map_04_mischief_alley.webp',
    baseWidth: 1920,
    baseHeight: 1080,
    defaultSpawn: { xPct: 49.5, yPct: 50.5, x: 950, y: 545 },
    ambientTheme: 'whimsical_mist',
    skyHorizonPoints: [
      { x: 0.0, y: 26.0 },
      { x: 8.0, y: 17.5 },
      { x: 14.0, y: 17.5 },
      { x: 22.0, y: 22.0 },
      { x: 32.0, y: 24.0 },
      { x: 50.0, y: 22.0 },
      { x: 72.0, y: 24.5 },
      { x: 88.0, y: 34.0 },
      { x: 100.0, y: 42.0 }
    ],
    bounds: { minX: 4.5, maxX: 95.5, maxY: 92.5 },
    landmarks: [
      {
        landmarkId: 'galaxy_vortex_pond',
        name: 'Hồ Xoáy Ngân Hà',
        description: 'Cổng dịch chuyển tức thời đưa người chơi về lại Đỉnh Đồi Hy Vọng hoặc Thung Lũng Thiên Văn.',
        xPct: 78.2,
        yPct: 75.0,
        x: 1501,
        y: 810,
        scale: 1.08,
        interactiveAction: 'VORTEX_FAST_TRAVEL',
      },
    ],
    plots: [
      {
        plotId: 'mischief_plot_01',
        residentId: 'whirlwind',
        houseNumber: '18',
        residentName: 'Tí Lốc Xoáy',
        houseName: 'Căn Chòi Gió Xoáy',
        xPct: 54.0,
        yPct: 33.5,
        x: 1037,
        y: 362,
        scale: 0.82,
        doorTriggerRadiusPx: 112,
        collisionW: 8.0,
        collisionH: 9.5,
      },
      {
        plotId: 'mischief_plot_02',
        residentId: 'storm_cloud',
        houseNumber: '17',
        residentName: 'Nhóc Mây Giông',
        houseName: 'Trạm Mưa Rào Rầu Rĩ',
        xPct: 17.2,
        yPct: 58.8,
        x: 330,
        y: 635,
        scale: 0.96,
        doorTriggerRadiusPx: 118,
        collisionW: 8.0,
        collisionH: 9.5,
      },
      {
        plotId: 'mischief_plot_03',
        residentId: 'black_hole',
        houseNumber: '19',
        residentName: 'Bé Hố Đen',
        houseName: 'Hầm Xoáy Tí Hon',
        xPct: 48.0,
        yPct: 73.2,
        x: 922,
        y: 791,
        scale: 1.06,
        doorTriggerRadiusPx: 125,
        collisionW: 8.0,
        collisionH: 9.5,
      },
      {
        plotId: 'mischief_plot_04',
        residentId: 'mirage_fog',
        houseNumber: '20',
        residentName: 'Cậu Sương Mù',
        houseName: 'Lều Ảo Ảnh',
        xPct: 80.0,
        yPct: 47.5,
        x: 1536,
        y: 513,
        scale: 0.90,
        doorTriggerRadiusPx: 118,
        collisionW: 8.0,
        collisionH: 9.5,
      },
    ],
    walkPathWaypoints: [
      { xPct: 10.5, yPct: 20.0, x: 202, y: 216 },
      { xPct: 23.0, yPct: 33.0, x: 442, y: 356 },
      { xPct: 45.0, yPct: 21.5, x: 864, y: 232 },
      { xPct: 68.5, yPct: 33.5, x: 1315, y: 362 },
      { xPct: 70.5, yPct: 53.0, x: 1354, y: 572 },
      { xPct: 55.5, yPct: 62.0, x: 1066, y: 670 },
      { xPct: 49.5, yPct: 50.5, x: 950, y: 545 },
      { xPct: 39.5, yPct: 40.0, x: 758, y: 432 },
      { xPct: 29.5, yPct: 56.0, x: 566, y: 605 },
      { xPct: 36.5, yPct: 79.5, x: 701, y: 859 },
      { xPct: 58.0, yPct: 86.5, x: 1114, y: 934 },
    ],
    portals: [
      {
        portalId: 'mischief_to_weather',
        label: '🍃 Lối đá về Ngõ Thời Tiết',
        icon: '🌦️',
        arrow: '⬅️',
        targetMapId: 'map_weather_lane',
        targetSpawnXPct: 68.0,
        targetSpawnYPct: 75.0,
        xPct: 10.5,
        yPct: 20.0,
        x: 202,
        y: 216,
        triggerRadiusPx: 75,
      },
      {
        portalId: 'mischief_vortex_portal',
        label: '🌌 Hồ Xoáy Ngân Hà (Về Đỉnh Đồi Hy Vọng)',
        icon: '🌟',
        arrow: '🌀',
        targetMapId: 'map_hope_hill',
        targetSpawnXPct: 48.0,
        targetSpawnYPct: 58.0,
        xPct: 78.2,
        yPct: 75.0,
        x: 1501,
        y: 810,
        triggerRadiusPx: 75,
      },
    ],
  },
};

/**
 * Danh sách 4 Map array để lặp qua
 */
export const TOWN_MAPS_LIST = Object.values(TOWN_MAPS_CONFIG);

/**
 * Helper lấy hộp va chạm theo tọa độ % từ TOWN_MAPS_CONFIG
 */
export function getMapObstaclesFromConfig(mapId = 'map_hope_hill') {
  const mapConfig = TOWN_MAPS_CONFIG[mapId] || TOWN_MAPS_CONFIG.map_hope_hill;
  return mapConfig.plots.map((plot) => {
    const scale = plot.scale || 1.0;
    const widthPct = (plot.collisionW || 8.5) * scale;
    const heightPct = (plot.collisionH || 9.5) * scale;
    const halfW = widthPct * 0.45;
    return {
      id: `${plot.plotId}_obstacle`,
      name: plot.houseName || plot.residentName,
      xMin: Number((plot.xPct - halfW).toFixed(2)),
      xMax: Number((plot.xPct + halfW).toFixed(2)),
      yMin: Number((plot.yPct - heightPct * 0.82).toFixed(2)),
      yMax: Number((plot.yPct + 0.8).toFixed(2)),
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.35)',
    };
  });
}

/**
 * Helper lấy vùng kích hoạt trigger từ TOWN_MAPS_CONFIG
 */
export function getMapLandmarksFromConfig(mapId = 'map_hope_hill') {
  const mapConfig = TOWN_MAPS_CONFIG[mapId] || TOWN_MAPS_CONFIG.map_hope_hill;
  const list = [];

  // Thêm các Ngôi Nhà
  mapConfig.plots.forEach((plot) => {
    const origHouse = TOWN_HOUSES_DATA.find(
      (h) => h.id === plot.residentId || h.charId === plot.residentId
    );
    list.push({
      id: plot.plotId,
      type: plot.residentId === 'user_house' ? 'user' : 'character',
      charId: plot.residentId,
      name: plot.residentName,
      signName: plot.houseName,
      houseTitle: `${plot.houseName} • Số ${plot.houseNumber}`,
      x: plot.xPct,
      y: Number((plot.yPct + 1.2).toFixed(2)),
      radius: (plot.doorTriggerRadiusPx / 1920) * 100 * 1.05, // quy đổi radius sang %
      speaker: plot.residentName,
      dialogue:
        origHouse?.dialogue ||
        `Chào bạn nhỏ! Mình là ${plot.residentName}, chào mừng bạn ghé thăm ${plot.houseName} nhé~`,
      actionText:
        origHouse?.actionText ||
        (plot.residentId === 'user_house' ? 'Vào Nhà Của Bạn 🏡' : `Trò chuyện với ${plot.residentName} ✨`),
      scale: plot.scale,
      icon: origHouse?.icon || (plot.residentId === 'user_house' ? '🏡' : '⭐'),
      badgeBg: origHouse?.badgeBg || '#FFF4BD',
    });
  });

  // Thêm các Địa Điểm Cảnh Quan (Landmarks)
  mapConfig.landmarks.forEach((lm) => {
    const isStarJar = lm.landmarkId === 'wishing_star_jar';
    list.push({
      id: lm.landmarkId,
      type: isStarJar ? 'fountain' : 'landmark',
      name: lm.name,
      signName: lm.name,
      houseTitle: lm.name,
      x: lm.xPct,
      y: Number((lm.yPct + 1.2).toFixed(2)),
      radius: isStarJar ? 7.5 : 6.0,
      speaker: lm.name,
      dialogue: lm.description,
      actionText: lm.interactiveAction || 'Khám phá ✨',
      icon: isStarJar ? '🗂️' : '✨',
      badgeBg: '#FFE066',
    });
  });

  return list;
}



/**
 * Helper lấy các mốc đường chân trời / giới hạn trên theo từng map
 */
export function getMapSkyHorizon(mapId = 'map_hope_hill') {
  const mapConfig = TOWN_MAPS_CONFIG[mapId] || TOWN_MAPS_CONFIG.map_hope_hill;
  return mapConfig.skyHorizonPoints || [
    { x: 0.0, y: 35.0 },
    { x: 50.0, y: 25.0 },
    { x: 100.0, y: 35.0 }
  ];
}

/**
 * Helper lấy giới hạn không gian di chuyển (minX, maxX, maxY) theo từng map
 */
export function getMapBounds(mapId = 'map_hope_hill') {
  const mapConfig = TOWN_MAPS_CONFIG[mapId] || TOWN_MAPS_CONFIG.map_hope_hill;
  return mapConfig.bounds || { minX: 3.0, maxX: 97.0, maxY: 93.0 };
}
