/**
 * CẤU HÌNH HỆ THỐNG TRANG TRÍ NGÔI NHÀ CỦA BẠN (24 VẬT PHẨM • 6 VỊ TRÍ • 4 SẠP HÀNG CHỦ ĐỀ)
 * - Hỗ trợ thả ảnh thiết kế riêng tại `public/images/decor/{itemId}.webp` (256x256px nền trong suốt).
 * - Tự động fallback về biểu tượng kawaii nếu chưa có ảnh.
 */

export const DECOR_SLOTS = [
  {
    id: 'roof_deco',
    label: 'Mái Nhà',
    icon: '🏠',
    pos: { top: '8%', left: '50%' },
    sizeClass: 'w-9 h-9 sm:w-11 sm:h-11 text-2xl sm:text-3xl',
  },
  {
    id: 'fence_lights',
    label: 'Dây Đèn / Rào',
    icon: '✨',
    pos: { top: '34%', left: '50%' },
    sizeClass: 'w-9 h-9 sm:w-10 sm:h-10 text-xl sm:text-2xl',
  },
  {
    id: 'door_wreath',
    label: 'Cửa Chính',
    icon: '🚪',
    pos: { top: '56%', left: '50%' },
    sizeClass: 'w-8 h-8 sm:w-9 sm:h-9 text-xl sm:text-2xl',
  },
  {
    id: 'garden_left',
    label: 'Vườn Trái',
    icon: '🌿',
    pos: { top: '76%', left: '12%' },
    sizeClass: 'w-9 h-9 sm:w-11 sm:h-11 text-2xl sm:text-3xl',
  },
  {
    id: 'garden_right',
    label: 'Vườn Phải',
    icon: '🌷',
    pos: { top: '76%', left: '88%' },
    sizeClass: 'w-9 h-9 sm:w-11 sm:h-11 text-2xl sm:text-3xl',
  },
  {
    id: 'pet_companion',
    label: 'Thú Cưng Sân',
    icon: '🐾',
    pos: { top: '88%', left: '34%' },
    sizeClass: 'w-9 h-9 sm:w-11 sm:h-11 text-2xl sm:text-3xl',
  },
];

export const MAP_DECOR_SHOPS = {
  map_hope_hill: {
    id: 'shop_hope',
    mapId: 'map_hope_hill',
    name: 'Sạp Hoa & Đèn Sao',
    shortName: 'Sạp Hoa Đồi',
    icon: '🌸',
    keeperNpcId: 'sun',
    keeperName: 'Cô Chủ Sạp Hoa',
    houseImage: '/images/shops/house-shop_hope.webp',
    npcImage: '/images/shops/npc-shop_hope.webp',
    themeColor: '#FFF4BD',
    roofColor: '#FF85A9',
    borderColor: '#D97706',
    x: 76.0,
    y: 85.5,
    scale: 1.0,
    greeting: 'Chào bạn! Ghé Sạp Hoa & Đèn Sao chọn vài món ấm áp trang trí cho Ngôi Nhà của bạn nhé!',
  },
  map_astronomy_valley: {
    id: 'shop_astro',
    mapId: 'map_astronomy_valley',
    name: 'Tiệm Pha Lê Đêm',
    shortName: 'Tiệm Pha Lê',
    icon: '🔮',
    keeperNpcId: 'nebula',
    keeperName: 'Chú Thợ Pha Lê',
    houseImage: '/images/shops/house-shop_astro.webp',
    npcImage: '/images/shops/npc-shop_astro.webp',
    themeColor: '#EFE5FF',
    roofColor: '#A78BFA',
    borderColor: '#7C3AED',
    x: 69.5,
    y: 91.5,
    scale: 0.96,
    greeting: 'Lung linh quá nè! Tiệm Pha Lê Đêm có những món đồ phát sáng tuyệt đẹp cho sân nhà bạn!',
  },
  map_weather_lane: {
    id: 'shop_weather',
    mapId: 'map_weather_lane',
    name: 'Tiệm Bốn Mùa',
    shortName: 'Tiệm 4 Mùa',
    icon: '🌈',
    keeperNpcId: 'rainbow',
    keeperName: 'Bé Gió Bốn Mùa',
    houseImage: '/images/shops/house-shop_weather.webp',
    npcImage: '/images/shops/npc-shop_weather.webp',
    themeColor: '#DFF8EB',
    roofColor: '#34D399',
    borderColor: '#059669',
    x: 13.8,
    y: 76.2,
    scale: 0.96,
    greeting: 'Nắng gió dịu êm! Chọn đồ trang trí Bốn Mùa mang sắc cầu vồng về nhà thôi nào!',
  },
  map_mischief_alley: {
    id: 'shop_mischief',
    mapId: 'map_mischief_alley',
    name: 'Tiệm Đồ Hiếm Tinh Nghịch',
    shortName: 'Tiệm Đồ Hiếm',
    icon: '👑',
    keeperNpcId: 'mirage_fog',
    keeperName: 'Nhóc Săn Kho Báu',
    houseImage: '/images/shops/house-shop_mischief.webp',
    npcImage: '/images/shops/npc-shop_mischief.webp',
    themeColor: '#FFE4EE',
    roofColor: '#F43F5E',
    borderColor: '#E11D48',
    x: 25.5,
    y: 81.0,
    scale: 0.94,
    greeting: 'Hí hí! Chỉ ở Hẻm Xoáy mới có các món đồ trang trí hiếm & thú cưng phép thuật siêu đỉnh này đó!',
  },
};

export const HOUSE_DECOR_ITEMS = [
  // --- MAP 1: SẠP HOA & ĐÈN SAO ---
  { id: 'hope_roof_flags', name: 'Cờ Dây Mùa Xuân', slotId: 'roof_deco', shopMapId: 'map_hope_hill', price: 45, icon: '🎏', desc: 'Dây cờ pastel phấp phới đón nắng mai trên mái nhà.' },
  { id: 'hope_door_wreath', name: 'Vòng Hoa Cúc Trắng', slotId: 'door_wreath', shopMapId: 'map_hope_hill', price: 40, icon: '🌼', desc: 'Vòng hoa nhỏ xinh treo ngay cửa chính chào khách.' },
  { id: 'hope_garden_sunflower', name: 'Chậu Hướng Dương', slotId: 'garden_left', shopMapId: 'map_hope_hill', price: 50, icon: '🌻', desc: 'Chậu hoa hướng dương luôn quay về phía mặt trời.' },
  { id: 'hope_garden_mailbox', name: 'Hòm Thư Sao Bông', slotId: 'garden_right', shopMapId: 'map_hope_hill', price: 55, icon: '📮', desc: 'Chiếc hòm thư nhận lời chúc ấm áp từ hàng xóm.' },
  { id: 'hope_fence_lanterns', name: 'Dây Đèn Lồng Ấm', slotId: 'fence_lights', shopMapId: 'map_hope_hill', price: 65, icon: '🏮', desc: 'Đèn lồng vàng dịu thắp sáng mái hiên mỗi chiều.' },
  { id: 'hope_pet_puppy', name: 'Cún Con Vẫy Đuôi', slotId: 'pet_companion', shopMapId: 'map_hope_hill', price: 90, icon: '🐶', desc: 'Chú cún nhỏ thân thiện luôn mừng rỡ mỗi khi bạn về nhà.' },

  // --- MAP 2: TIỆM PHA LÊ ĐÊM ---
  { id: 'astro_roof_star', name: 'Ngôi Sao Đỉnh Mái', slotId: 'roof_deco', shopMapId: 'map_astronomy_valley', price: 70, icon: '🌟', desc: 'Ngôi sao pha lê tỏa sáng dịu dàng trên đỉnh mái.' },
  { id: 'astro_door_chime', name: 'Chuông Gió Ánh Trăng', slotId: 'door_wreath', shopMapId: 'map_astronomy_valley', price: 60, icon: '🎐', desc: 'Ngân vang leng keng mỗi khi có làn gió đêm đi qua.' },
  { id: 'astro_garden_telescope', name: 'Kính Thiên Văn Mini', slotId: 'garden_left', shopMapId: 'map_astronomy_valley', price: 85, icon: '🔭', desc: 'Đặt góc sân để cùng ngắm dải ngân hà lấp lánh.' },
  { id: 'astro_garden_mushroom', name: 'Nấm Phát Sáng Đêm', slotId: 'garden_right', shopMapId: 'map_astronomy_valley', price: 75, icon: '🍄', desc: 'Khóm nấm cổ tích phát ánh sáng lung linh ban đêm.' },
  { id: 'astro_fence_firefly', name: 'Dây Đèn Đom Đóm', slotId: 'fence_lights', shopMapId: 'map_astronomy_valley', price: 80, icon: '✨', desc: 'Chuỗi ánh sáng li ti như hàng chục chú đom đóm nhỏ.' },
  { id: 'astro_pet_owl', name: 'Cú Mèo Ngắm Sao', slotId: 'pet_companion', shopMapId: 'map_astronomy_valley', price: 110, icon: '🦉', desc: 'Bạn cú tròn xoe mắt luôn canh giữ giấc mơ đẹp.' },

  // --- MAP 3: TIỆM BỐN MÙA ---
  { id: 'weather_roof_rainbow', name: 'Vòm Cầu Vồng Nhỏ', slotId: 'roof_deco', shopMapId: 'map_weather_lane', price: 85, icon: '🌈', desc: 'Cầu vồng 7 sắc rực rỡ uốn cong qua mái nhà.' },
  { id: 'weather_door_cloud', name: 'Bảng Mây Chào Mừng', slotId: 'door_wreath', shopMapId: 'map_weather_lane', price: 65, icon: '☁️', desc: 'Tấm bảng hình đám mây bông mềm mại treo trước cửa.' },
  { id: 'weather_garden_pine', name: 'Cây Thông Tuyết Xinh', slotId: 'garden_left', shopMapId: 'map_weather_lane', price: 80, icon: '🎄', desc: 'Cây thông phủ tuyết nhẹ mát rượi cả góc vườn.' },
  { id: 'weather_garden_teaset', name: 'Bàn Trà Sân Vườn', slotId: 'garden_right', shopMapId: 'map_weather_lane', price: 95, icon: '🫖', desc: 'Bộ ấm trà thơm ngon mời hàng xóm ghé chơi.' },
  { id: 'weather_fence_roses', name: 'Hàng Rào Hoa Hồng', slotId: 'fence_lights', shopMapId: 'map_weather_lane', price: 90, icon: '🌹', desc: 'Dàn hoa hồng pastel nở rộ thơm ngát hiên nhà.' },
  { id: 'weather_pet_bunny', name: 'Thỏ Tuyết Nhảy Nhót', slotId: 'pet_companion', shopMapId: 'map_weather_lane', price: 120, icon: '🐰', desc: 'Chú thỏ trắng muốt thích chạy quanh bãi cỏ sân nhà.' },

  // --- MAP 4: TIỆM ĐỒ HIẾM TINH NGHỊCH ---
  { id: 'mischief_roof_crown', name: 'Vương Miện Pha Lê', slotId: 'roof_deco', shopMapId: 'map_mischief_alley', price: 140, icon: '👑', desc: 'Biểu tượng cư dân danh dự lấp lánh trên mái nhà.' },
  { id: 'mischief_door_ribbon', name: 'Nơ Khổng Lồ Siêu Quậy', slotId: 'door_wreath', shopMapId: 'map_mischief_alley', price: 110, icon: '🎀', desc: 'Chiếc nơ hồng khổng lồ nổi bật nhất cả khu phố.' },
  { id: 'mischief_garden_fountain', name: 'Đài Phun Nước Mini', slotId: 'garden_left', shopMapId: 'map_mischief_alley', price: 150, icon: '⛲', desc: 'Đài phun nước pha lê róc rách cực kỳ thư giãn.' },
  { id: 'mischief_garden_swing', name: 'Xích Đu Mây Thần Tiên', slotId: 'garden_right', shopMapId: 'map_mischief_alley', price: 160, icon: '🎠', desc: 'Góc vui chơi cổ tích được mọi cư dân yêu thích.' },
  { id: 'mischief_fence_aurora', name: 'Dải Lụa Cực Quang', slotId: 'fence_lights', shopMapId: 'map_mischief_alley', price: 155, icon: '🌌', desc: 'Dải ánh sáng cực quang hiếm có bao quanh hiên nhà.' },
  { id: 'mischief_pet_cat', name: 'Mèo Mây Bay Lơ Lửng', slotId: 'pet_companion', shopMapId: 'map_mischief_alley', price: 180, icon: '🐱', desc: 'Chú mèo mây phép thuật cực hiếm của Hẻm Xoáy!' },
].map((item) => ({
  ...item,
  image: `/images/decor/${item.id}.webp`,
}));

export const DECOR_ITEM_DICT = Object.fromEntries(HOUSE_DECOR_ITEMS.map((it) => [it.id, it]));

export function getShopByMapId(mapId) {
  return MAP_DECOR_SHOPS[mapId] || null;
}

export function getItemsByShopMap(mapId) {
  return HOUSE_DECOR_ITEMS.filter((it) => it.shopMapId === mapId);
}
