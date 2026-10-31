// ============================================================================
// CẤU HÌNH HỆ THỐNG & HẰNG SỐ DÙNG CHUNG ("THỊ TRẤN SAO BÔNG")
// ============================================================================

// Dán URL Google Apps Script Web App của bạn vào đây:
export const GOOGLE_SHEET_SCRIPT_URL = '';

export const TOTAL_INITIAL_STARS = 2000;
export const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 giờ
export const STORAGE_KEY = 'KAWAII_STAR_HOPE_JAR_STATE_V1';
export const RESIDENT_STORAGE_KEY = 'KAWAII_STAR_TOWN_RESIDENT_V1';

export const MOOD_CONFIG = {
  happy: {
    id: 'happy',
    label: 'Hạnh phúc (Happy)',
    shortLabel: 'Hạnh phúc',
    subLabel: 'Happy ✨',
    emoji: '✨',
    cardBg: '#FFF4BD',
    badgeBg: '#FFF4BD',
    dialogue:
      'Tuyệt vời quá đi! Nụ cười rạng rỡ của bạn làm cả bầu trời hôm nay bừng sáng đấy. Hãy bấm mở hộp sao để nhận thêm một ngôi sao may mắn nhân đôi niềm vui trong ngày hôm nay nhé!'
  },
  excited: {
    id: 'excited',
    label: 'Hào hứng (Excited)',
    shortLabel: 'Hào hứng',
    subLabel: 'Excited 💖',
    emoji: '💖',
    cardBg: '#FFE2EC',
    badgeBg: '#FFE2EC',
    dialogue:
      'Nguồn năng lượng tích cực của bạn thật đáng yêu! Vũ trụ đang mỉm cười cùng bạn đó, hãy chọn ngay cho mình 1 ngôi sao may mắn để tiếp thêm phép màu cho ngày hôm nay nhé!'
  },
  normal: {
    id: 'normal',
    label: 'Bình yên (Peaceful)',
    shortLabel: 'Bình yên',
    subLabel: 'Peaceful 🍀',
    emoji: '🍀',
    cardBg: '#DFF8EB',
    badgeBg: '#DFF8EB',
    dialogue:
      'Một ngày dịu dàng và bình yên cũng là một món quà thật quý giá. Hãy chọn cho mình 1 ngôi sao may mắn xem bầu trời muốn nhắn gửi điều ngọt ngào gì đến bạn hôm nay nhé!'
  },
  tired: {
    id: 'tired',
    label: 'Mệt mỏi (Tired)',
    shortLabel: 'Mệt mỏi',
    subLabel: 'Tired ☁️',
    emoji: '☁️',
    cardBg: '#EFE5FF',
    badgeBg: '#EFE5FF',
    dialogue:
      'Hôm nay bạn đã cố gắng rất nhiều rồi, lại đây nghỉ ngơi một chút nào. Hãy chọn cho mình 1 ngôi sao may mắn trong ngày hôm nay để nạp lại năng lượng ấm áp và dịu dàng nhé!'
  },
  bad: {
    id: 'bad',
    label: 'Buồn / Tệ (Bad)',
    shortLabel: 'Buồn / Tệ',
    subLabel: 'Bad 🌧️',
    emoji: '🌧️',
    cardBg: '#DFF2FF',
    badgeBg: '#DFF2FF',
    dialogue:
      'Đừng buồn bạn nhé, xung quanh vẫn còn nhiều điều thú vị đang chờ bạn, hãy chọn cho mình 1 ngôi sao may mắn trong ngày hôm nay nhé!'
  }
};

export const BADGE_DEFINITIONS = [
  {
    id: 'newcomer',
    icon: '🌱',
    name: 'Mầm Non Sao Bông',
    title: 'Cư Dân Mới Đáng Yêu',
    desc: 'Đăng ký ngôi nhà và nhận Thẻ Cư Dân Thị Trấn Sao Bông',
    check: () => true
  },
  {
    id: 'messenger',
    icon: '🕊️',
    name: 'Sứ Giả Bầu Trời',
    title: 'Sứ Giả Bầu Trời',
    desc: 'Gửi ít nhất 1 lời chúc ấm áp lên bầu trời sao',
    check: (stats) => stats.wishesSent >= 1
  },
  {
    id: 'storyteller',
    icon: '💌',
    name: 'Người Gieo Hy Vọng',
    title: 'Người Gieo Hy Vọng',
    desc: 'Gửi từ 3 lời chúc trở lên đến cộng đồng',
    check: (stats) => stats.wishesSent >= 3
  },
  {
    id: 'warm_heart',
    icon: '💖',
    name: 'Trái Tim Ấm Áp',
    title: 'Trái Tim Ấm Áp',
    desc: 'Lời chúc của bạn nhận được từ 3 lượt thả tim cảm ơn trở lên',
    check: (stats) => stats.likesReceived >= 3
  },
  {
    id: 'beloved_star',
    icon: '🌟',
    name: 'Ngôi Sao Được Yêu Thích',
    title: 'Ngôi Sao Được Yêu Thích',
    desc: 'Lời chúc của bạn nhận được từ 10 lượt thả tim cảm ơn trở lên',
    check: (stats) => stats.likesReceived >= 10
  },
  {
    id: 'collector',
    icon: '🏺',
    name: 'Người Giữ Ký Ức',
    title: 'Người Giữ Ký Ức',
    desc: 'Lưu giữ ít nhất 2 bức thư tâm đắc vào Lọ Sao Ký Ức',
    check: (stats) => stats.savedCount >= 2
  }
];

export const CHARACTER_STAMPS = [
  { id: 'star', label: '⭐ Tem Sao Bông' },
  { id: 'cloud', label: '☁️ Tem Mây Xốp' },
  { id: 'moon', label: '🌙 Tem Trăng Khuyết' },
  { id: 'sun', label: '☀️ Tem Nắng Mai' },
  { id: 'shooting_star', label: '🌠 Tem Sao Băng' },
  { id: 'rainbow', label: '🌈 Tem Cầu Vồng' },
  { id: 'nebula', label: '🍵 Tem Ngân Hà' },
  { id: 'spark', label: '⚡ Tem Tia Chớp' }
];

export const DAILY_SUNNY_QUESTS = [
  '🥐 Uống một cốc nước ấm từng ngụm nhỏ và mỉm cười với chính mình trong gương nhé!',
  '🍪 Dành 2 phút vươn vai thật thoải mái và nhìn ra bầu trời ngoài khung cửa sổ.',
  '🧁 Tự viết ra 1 điều nhỏ bé mà hôm nay bạn đã cố gắng hoàn thành để tự thưởng cho mình!',
  '🍯 Nghe 1 bài hát dịu dàng mà bạn yêu thích nhất và nhắm mắt thư giãn đôi mắt.',
  '🍓 Gửi một lời hỏi thăm hoặc một lời chúc ngọt ngào đến một người bạn quý mến.'
];

export const DEFAULT_SHEET_WISHES = [
  {
    id: 'WISH-101',
    timestamp: 'Hôm nay, 08:15',
    nickname: 'Mây Hồng Nhỏ',
    authorTitle: '💖 Trái Tim Ấm Áp',
    stamp: 'rainbow',
    likes: 12,
    mood: 'bad',
    message:
      'Dù hôm nay có chuyện gì làm bạn buồn thì cũng đừng quên bạn là một phiên bản duy nhất và rất đáng yêu trên thế giới này nhé!',
    approved: true
  },
  {
    id: 'WISH-102',
    timestamp: 'Hôm nay, 09:30',
    nickname: 'Người lạ',
    authorTitle: '🕊️ Sứ Giả Bầu Trời',
    stamp: 'moon',
    likes: 7,
    mood: 'tired',
    message:
      'Gửi người vừa mở được ngôi sao này: Chúc bạn tối nay ngủ thật ngon, mọi mệt mỏi đều bay biến hết nha!',
    approved: true
  },
  {
    id: 'WISH-103',
    timestamp: 'Hôm nay, 10:45',
    nickname: 'Sao Kem Bơ',
    authorTitle: '🌟 Ngôi Sao Được Yêu Thích',
    stamp: 'star',
    likes: 19,
    mood: 'all',
    message:
      'Chúc bạn một ngày ngập tràn những điều dễ thương bất ngờ, đi đến đâu cũng gặp người tử tế và ấm áp!',
    approved: true
  }
];
