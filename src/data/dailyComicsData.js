import { SafeStorage, getTodayDateString } from '../utils/storage';

export const COLLECTED_COMICS_STORAGE_KEY = 'TTSB_COLLECTED_COMICS_V1';

/**
 * Kho Truyện Tranh phong cách Manga / Doraemon:
 * - Mỗi tập gồm 5–6 trang (hỗ trợ 5–10 trang).
 * - Mỗi trang có 3 khung tranh (panels) xếp lưới manga (khung 1 rộng, khung 2-3 song song),
 *   có lời dẫn chuyện (narration), từ tượng thanh (sfx), nhiều nhân vật & bong bóng thoại.
 * - Gắn minLevel để mở khóa dần các câu chuyện mới theo cấp độ người chơi.
 */
export const BUILTIN_DAILY_COMICS = [
  // ===================== LV.0 — 8 CƯ DÂN KHỞI ĐẦU =====================
  {
    id: 'comic_lv0_bakery_morning',
    minLevel: 0,
    title: 'Mẻ Bánh Sừng Bò Bí Mật Của Cô Nắng Mai',
    author: 'Ban Biên Tập Thị Trấn',
    moral: 'Một khởi đầu nhẹ nhàng và ấm bụng luôn giúp cả ngày trở nên dễ thở hơn rất nhiều.',
    pages: [
      {
        panels: [
          {
            narration: '6 giờ sáng tại Đỉnh Đồi Hy Vọng...',
            sfx: 'TÍT TÍT!',
            bgTint: '#FFF4BD',
            characters: [
              { id: 'sun', name: 'Cô Nắng Mai', speech: 'Mẻ bánh sừng bò mật ong hôm nay thơm nức cả đồi rồi!' },
              { id: 'star', name: 'Bé Sao Bông', speech: 'Oa! Mùi thơm bay tận sang Đài Sao luôn cô ơi!' },
            ],
          },
          {
            sfx: 'KHÒ KHÒ~',
            bgTint: '#E0F2FE',
            characters: [
              { id: 'cloud', name: 'Bác Mây Xốp', speech: 'Chào buổi sáng... sao hôm nay bụng bác kêu to thế nhỉ?' },
            ],
          },
          {
            sfx: 'TÁCH!',
            bgTint: '#FFE5D4',
            characters: [
              { id: 'sun', name: 'Cô Nắng Mai', speech: 'Bác Mây Xốp tới đúng lúc lắm, mời bác chiếc nóng nhất lò!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Trong khi đó tại Ngõ Thời Tiết...',
            sfx: 'XÀO XẠC~',
            bgTint: '#E0F7F4',
            characters: [
              { id: 'dewdrop', name: 'Bé Sương Mai', speech: 'Tưới nước xong cho vườn hoa rồi, giờ đi đâu chơi nhỉ?' },
              { id: 'breeze', name: 'Chú Gió Mát', speech: 'Chú vừa đánh hơi thấy mùi bánh nướng từ trên Đỉnh Đồi đấy!' },
            ],
          },
          {
            sfx: 'VÙ!',
            bgTint: '#E8F5E1',
            characters: [
              { id: 'breeze', name: 'Chú Gió Mát', speech: 'Bám chắc nhé Bé Sương Mai, chú thổi một cơn gió đưa lên đồi!' },
            ],
          },
          {
            sfx: 'HIHI!',
            bgTint: '#FFF9E6',
            characters: [
              { id: 'dewdrop', name: 'Bé Sương Mai', speech: 'Khoan đã chú ơi, bay nhanh quá rơi mất chiếc mũ lá sen của bé!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Trước cửa Tiệm Bánh Bình Minh đã đông vui hẳn lên.',
            sfx: 'RỘP RỘP!',
            bgTint: '#FFEDD5',
            characters: [
              { id: 'sunset', name: 'Chị Hoàng Hôn', speech: 'Chị mang theo bình cacao nóng để chấm bánh cùng mọi người nè!' },
              { id: 'sun', name: 'Cô Nắng Mai', speech: 'Tuyệt vời quá! Bánh nướng mà có thêm cacao thì hết sẩy!' },
            ],
          },
          {
            sfx: 'OÁP~',
            bgTint: '#EDE9FE',
            characters: [
              { id: 'moon', name: 'Chú Trăng Khuyết', speech: 'Mới gác đêm xong định đi ngủ mà mùi bánh gọi chú dậy luôn...' },
            ],
          },
          {
            sfx: 'LẤP LÁNH✨',
            bgTint: '#F3E8FF',
            characters: [
              { id: 'aurora', name: 'Bà Cực Quang', speech: 'Bà vừa vẽ xong bìa tập truyện hôm nay, đổi lấy 1 cái bánh nhé?' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Bỗng nhiên chiếc bánh cuối cùng trong khay bị gió thổi lăn tròn...',
            sfx: 'LĂN LỐC CỐC!',
            bgTint: '#FFF4BD',
            characters: [
              { id: 'star', name: 'Bé Sao Bông', speech: 'Á! Chiếc bánh cuối cùng đang lăn xuống dốc kìa!' },
              { id: 'breeze', name: 'Chú Gió Mát', speech: 'Ấy chết, gió của chú hơi quá tay! Để chú đỡ lại!' },
            ],
          },
          {
            sfx: 'VỤT!',
            bgTint: '#E8F5E1',
            characters: [
              { id: 'breeze', name: 'Chú Gió Mát', speech: 'Hô biến! Một vòng xoáy nhỏ nâng bánh bay ngược lên đĩa!' },
            ],
          },
          {
            sfx: 'BỘP!',
            bgTint: '#E0F2FE',
            characters: [
              { id: 'cloud', name: 'Bác Mây Xốp', speech: 'Hoan hô! Đáp trúng ngay đĩa của... Bạn Nhỏ Đáng Yêu kìa!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Cả 8 cư dân cùng nâng ly cacao chúc một ngày mới thật bình yên.',
            sfx: 'CẠN LY!🥂',
            bgTint: '#FFE4EE',
            characters: [
              { id: 'sun', name: 'Cô Nắng Mai', speech: 'Chiếc bánh may mắn nhất hôm nay dành tặng riêng cho bạn đọc đấy!' },
              { id: 'star', name: 'Bé Sao Bông', speech: 'Chúc bạn một ngày tràn đầy năng lượng và thật nhiều nụ cười nha!' },
            ],
          },
          {
            bgTint: '#FFFDF5',
            characters: [
              { id: 'sunset', name: 'Chị Hoàng Hôn', speech: 'Nhớ ăn sáng đầy đủ rồi hãy bắt đầu công việc hôm nay nhé!' },
            ],
          },
          {
            sfx: 'HẾT TẬP ✨',
            bgTint: '#DFF8EB',
            characters: [
              { id: 'aurora', name: 'Bà Cực Quang', speech: 'Đừng quên bấm Sưu tầm để cất tập truyện này vào Tủ Sách nha!' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'comic_lv0_wind_worry',
    minLevel: 0,
    title: 'Chiếc Lá Lo Âu Bay Lên Bầu Trời',
    author: 'Ban Biên Tập Thị Trấn',
    moral: 'Nỗi lo trong đầu sẽ nhỏ đi một nửa ngay khi bạn dám viết ra và thả nó bay theo gió.',
    pages: [
      {
        panels: [
          {
            narration: 'Buổi chiều gió mát tại Ngõ Thời Tiết...',
            sfx: 'THỞ DÀI...',
            bgTint: '#E0F7F4',
            characters: [
              { id: 'dewdrop', name: 'Bé Sương Mai', speech: 'Chú Gió ơi, hôm nay tự dưng bé thấy hơi lo lắng mà chẳng rõ vì sao...' },
              { id: 'breeze', name: 'Chú Gió Mát', speech: 'À, đó là vì đầu bé đang giữ quá nhiều "đám mây nghĩ ngợi" đấy!' },
            ],
          },
          {
            bgTint: '#FFF9E6',
            characters: [
              { id: 'star', name: 'Bé Sao Bông', speech: 'Em cũng hay bị thế! Cứ nghĩ tới ngày mai là tim đập thình thịch.' },
            ],
          },
          {
            sfx: 'SỘT SOẠT',
            bgTint: '#E8F5E1',
            characters: [
              { id: 'breeze', name: 'Chú Gió Mát', speech: 'Lại đây! Chú có cối xay gió chuyên thổi bay muộn phiền nè!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Chú Gió Mát đưa cho mỗi bạn một tờ giấy hình cánh hoa bồ công anh.',
            sfx: 'XOẸT XOẸT',
            bgTint: '#FFFDF5',
            characters: [
              { id: 'dewdrop', name: 'Bé Sương Mai', speech: 'Bé viết: "Sợ ngày mai tưới cây quên giờ"...' },
              { id: 'star', name: 'Bé Sao Bông', speech: 'Còn em viết: "Sợ hôm nay làm việc chưa đủ giỏi"...' },
            ],
          },
          {
            sfx: 'PHÙ~',
            bgTint: '#E8F5E1',
            characters: [
              { id: 'breeze', name: 'Chú Gió Mát', speech: 'Nào, 1... 2... 3... Thả lên cánh quạt cối xay gió thôi!' },
            ],
          },
          {
            sfx: 'VÙ VÙ✨',
            bgTint: '#E0F2FE',
            characters: [
              { id: 'cloud', name: 'Bác Mây Xốp', speech: 'Ồ! Mấy cánh hoa bay cao tít lên tận tầng mây luôn kìa!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Hoàng hôn bắt đầu nhuộm cam cả con đường lát đá.',
            sfx: 'TÁCH!📸',
            bgTint: '#FFEDD5',
            characters: [
              { id: 'sunset', name: 'Chị Hoàng Hôn', speech: 'Khoảnh khắc mọi người thả muộn phiền bay đi đẹp quá, chị chụp lại rồi nè!' },
              { id: 'dewdrop', name: 'Bé Sương Mai', speech: 'Kỳ lạ thật, viết ra xong thấy lòng nhẹ tênh luôn ý!' },
            ],
          },
          {
            bgTint: '#EDE9FE',
            characters: [
              { id: 'moon', name: 'Chú Trăng Khuyết', speech: 'Bầu trời rộng lắm, cứ gửi bớt âu lo lên đây cho chú giữ hộ nhé.' },
            ],
          },
          {
            sfx: 'LUNG LINH',
            bgTint: '#F3E8FF',
            characters: [
              { id: 'aurora', name: 'Bà Cực Quang', speech: 'Đêm nay bà sẽ biến mấy nỗi lo đó thành dải cực quang xanh tím thật đẹp!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Cả nhóm ngồi bên tách cacao ấm ngắm dải cực quang vừa hiện ra.',
            bgTint: '#FFF4BD',
            characters: [
              { id: 'star', name: 'Bé Sao Bông', speech: 'Hóa ra hôm nay mình đã cố gắng rất tốt rồi, đâu cần tự trách mình nữa!' },
              { id: 'sun', name: 'Cô Nắng Mai', speech: 'Đúng rồi! Cứ làm hết sức mình trong ngày hôm nay là quá giỏi rồi cháu ạ.' },
            ],
          },
          {
            sfx: 'CƯỜI TÍT',
            bgTint: '#DFF8EB',
            characters: [
              { id: 'dewdrop', name: 'Bé Sương Mai', speech: 'Cảm ơn chú Gió Mát! Mai bé lại tưới cây thật vui vẻ!' },
            ],
          },
          {
            bgTint: '#E8F5E1',
            characters: [
              { id: 'breeze', name: 'Chú Gió Mát', speech: 'Bất cứ khi nào thấy nặng lòng, cứ ghé Cối Xay Gió số 10 nhé!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Một đêm bình yên lại về trên Thị Trấn Sao Bông.',
            sfx: 'CHÚC NGỦ NGON 🌙',
            bgTint: '#EDE9FE',
            characters: [
              { id: 'moon', name: 'Chú Trăng Khuyết', speech: 'Còn bạn hôm nay có điều gì muốn thả bay theo gió không?' },
              { id: 'aurora', name: 'Bà Cực Quang', speech: 'Hít một hơi thật sâu, mỉm cười và lưu lại tập truyện này nhé!' },
            ],
          },
          {
            bgTint: '#FFFDF5',
            characters: [
              { id: 'cloud', name: 'Bác Mây Xốp', speech: 'Mọi chuyện rồi sẽ ổn theo cách dịu dàng nhất thôi.' },
            ],
          },
          {
            sfx: 'HẾT TẬP ✨',
            bgTint: '#FFE4EE',
            characters: [
              { id: 'star', name: 'Bé Sao Bông', speech: 'Hẹn gặp lại bạn ở tập truyện ngày mai nha!' },
            ],
          },
        ],
      },
    ],
  },

  // ===================== LV.1+ — MỞ KHÓA THÊM CƯ DÂN MỚI =====================
  {
    id: 'comic_lv1_rainbow_post',
    minLevel: 1,
    title: 'Lá Thư Bầu Trời Lạc Đường Của Bé Sao Băng',
    author: 'Ban Biên Tập Thị Trấn',
    moral: 'Một lời chúc nhỏ gửi đi tưởng chừng vô tình lại có thể sưởi ấm cả một ngày của ai đó.',
    pages: [
      {
        panels: [
          {
            narration: 'Tại Bưu Điện Sao Băng, lá thư thứ 999 đang chuẩn bị cất cánh...',
            sfx: 'VÈO! 💌',
            bgTint: '#FFE2EC',
            characters: [
              { id: 'shooting_star', name: 'Bé Sao Băng', speech: 'Đóng dấu tem sáp xong rồi! Phóng lên bầu trời sao nào!' },
              { id: 'rainbow', name: 'Chị Cầu Vồng', speech: 'Cẩn thận gió ngang kìa em ơi, hôm nay mây bay hơi nhanh đấy!' },
            ],
          },
          {
            sfx: 'VỤT!',
            bgTint: '#DFF8EB',
            characters: [
              { id: 'shooting_star', name: 'Bé Sao Băng', speech: 'Á! Lá thư lượn vòng vòng rơi thẳng xuống Tiệm Trà Tinh Vân rồi!' },
            ],
          },
          {
            sfx: 'PHỊCH!',
            bgTint: '#F3E5FF',
            characters: [
              { id: 'nebula', name: 'Chị Ngân Hà', speech: 'Ồ? Một lá thư rơi ngay cạnh ấm trà hoa cúc của chị nè!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Bé Sao Băng hớt hải chạy tới Tiệm Trà Tinh Vân.',
            sfx: 'HỔN HỂN...',
            bgTint: '#F3E5FF',
            characters: [
              { id: 'shooting_star', name: 'Bé Sao Băng', speech: 'Chị Ngân Hà ơi, em xin lỗi, lá thư đó bay lạc mất rồi!' },
              { id: 'nebula', name: 'Chị Ngân Hà', speech: 'Hít vào 4 giây... thở ra 4 giây nào em. Không sao đâu!' },
            ],
          },
          {
            bgTint: '#FFF4BD',
            characters: [
              { id: 'nebula', name: 'Chị Ngân Hà', speech: 'Chị thấy trên phong bì ghi: "Gửi người hôm nay đang hơi mệt".' },
            ],
          },
          {
            sfx: 'LUNG LINH✨',
            bgTint: '#FFE4EE',
            characters: [
              { id: 'rainbow', name: 'Chị Cầu Vồng', speech: 'Khoan đã! Hôm nay chính Bé Sao Băng đã chạy giao 999 lá thư đấy!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Mọi người chợt nhận ra người cần đọc lá thư ấy nhất là ai...',
            sfx: 'Ồ!!',
            bgTint: '#FFF9E6',
            characters: [
              { id: 'star', name: 'Bé Sao Bông', speech: 'Hóa ra lá thư không hề bay lạc, nó tự tìm đúng chủ nhân rồi!' },
              { id: 'shooting_star', name: 'Bé Sao Băng', speech: 'Ơ... tặng em thật sao ạ? Để em mở ra đọc thử nha!' },
            ],
          },
          {
            sfx: 'SỘT SOẠT',
            bgTint: '#FFFDF5',
            characters: [
              { id: 'shooting_star', name: 'Bé Sao Băng', speech: '"Cảm ơn bạn vì hôm nay đã chăm chỉ hết mình. Nghỉ tay uống trà nhé!"' },
            ],
          },
          {
            sfx: 'CẢM ĐỘNG 💖',
            bgTint: '#FFE2EC',
            characters: [
              { id: 'shooting_star', name: 'Bé Sao Băng', speech: 'Huhu ấm áp quá đi mất! Đúng lúc em đang mỏi chân luôn!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Cả nhóm cùng ngồi nhâm nhi trà hoa cúc dưới vòm cầu vồng.',
            bgTint: '#DFF8EB',
            characters: [
              { id: 'rainbow', name: 'Chị Cầu Vồng', speech: 'Dự báo thời tiết cảm xúc hôm nay: 100% nắng ấm và trái tim đầy ắp!' },
              { id: 'nebula', name: 'Chị Ngân Hà', speech: 'Mời cả nhà thêm một tuần trà ấm nhé.' },
            ],
          },
          {
            bgTint: '#FFF4BD',
            characters: [
              { id: 'cloud', name: 'Bác Mây Xốp', speech: 'Lá thư số 1000 để Bạn Nhỏ Đáng Yêu gửi lên bầu trời nhé!' },
            ],
          },
          {
            sfx: 'HẾT TẬP ✨',
            bgTint: '#F3E8FF',
            characters: [
              { id: 'aurora', name: 'Bà Cực Quang', speech: 'Chúc bạn nhận được thật nhiều lời chúc dịu dàng hôm nay!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Góc hậu trường siêu nhỏ của Bưu Điện Sao Băng:',
            sfx: 'HIHI!',
            bgTint: '#FFE4EE',
            characters: [
              { id: 'shooting_star', name: 'Bé Sao Băng', speech: 'Bí mật nhé: ghé nhà Số 04 gửi 1 lời chúc là sẽ nhận thêm điểm Huy Hiệu Sứ Giả đó!' },
              { id: 'star', name: 'Bé Sao Bông', speech: 'Lên cấp càng cao càng mở khóa thêm nhiều hàng xóm vui tính nữa nha!' },
            ],
          },
          {
            bgTint: '#FFF9E6',
            characters: [
              { id: 'sun', name: 'Cô Nắng Mai', speech: 'Nhớ bấm Sưu tầm tập truyện này để lên bậc Huy Hiệu Mọt Sách nhé!' },
            ],
          },
          {
            sfx: 'THE END 🌈',
            bgTint: '#DFF8EB',
            characters: [
              { id: 'rainbow', name: 'Chị Cầu Vồng', speech: 'Hẹn gặp lại ở kỳ truyện sau!' },
            ],
          },
        ],
      },
    ],
  },

  // ===================== LV.2+ & LV.3+ — HẺM XOÁY TINH NGHỊCH =====================
  {
    id: 'comic_lv3_mischief_spoon',
    minLevel: 3,
    title: 'Biệt Đội Hẻm Xoáy & Chiếc Thìa Kem Bí Ẩn',
    author: 'Ban Biên Tập Thị Trấn',
    moral: 'Những rắc rối nhỏ từ tính hay quên hay vội vàng đều có thể hóa thành tiếng cười nếu ta bao dung.',
    pages: [
      {
        panels: [
          {
            narration: 'Một buổi trưa náo nhiệt tại Tiệm Kem Tuyết số 11...',
            sfx: 'Á Á!!',
            bgTint: '#EBF8FF',
            characters: [
              { id: 'snowflake', name: 'Cô Tuyết Bông', speech: 'Chiếc thìa múc kem dâu may mắn của cô biến đâu mất tiêu rồi?!' },
              { id: 'star', name: 'Bé Sao Bông', speech: 'Để thám tử Sao Bông lần theo dấu vết cho cô nha!' },
            ],
          },
          {
            sfx: 'VÙ VÙ!',
            bgTint: '#D1FAE5',
            characters: [
              { id: 'whirlwind', name: 'Tí Lốc Xoáy', speech: 'Không phải tớ đâu nhé! Tớ chỉ lỡ thổi bay 3 chiếc lá thôi!' },
            ],
          },
          {
            sfx: 'HỨ!',
            bgTint: '#E5E7EB',
            characters: [
              { id: 'storm_cloud', name: 'Nhóc Mây Giông', speech: 'Đừng nhìn ta! Ta đang bận ăn kẹo dâu của Bạn Nhỏ tặng rồi!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Cả nhóm lần theo dấu vết tới Hầm Xoáy Nhỏ số 19...',
            sfx: 'OÁP~',
            bgTint: '#EEF2FF',
            characters: [
              { id: 'black_hole', name: 'Bé Hố Đen', speech: 'Hồi nãy bé đi ngang tiệm kem ngáp một cái, gió hơi mạnh ý mà...' },
              { id: 'saturn', name: 'Bác Sao Thổ', speech: 'Ơ kìa! Chiếc kính đọc sách của bác cũng đang bay quanh bụng cháu kìa!' },
            ],
          },
          {
            sfx: 'XOAY TÍT!',
            bgTint: '#FFF4BD',
            characters: [
              { id: 'star', name: 'Bé Sao Bông', speech: 'Aha! Cả thìa kem lẫn kính đọc sách đều đang làm vệ tinh quanh Bé Hố Đen!' },
            ],
          },
          {
            sfx: 'HIHI😳',
            bgTint: '#E0E7FF',
            characters: [
              { id: 'black_hole', name: 'Bé Hố Đen', speech: 'Ối! Bé quên mất tiêu luôn! Trả lại cho cô Tuyết Bông và bác Sao Thổ ạ!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Đúng lúc ấy, một quả bong bóng hình cây kem khổng lồ trôi ngang qua...',
            sfx: 'Ú ÒA!🫧',
            bgTint: '#F3E8FF',
            characters: [
              { id: 'mirage_fog', name: 'Cậu Sương Mù', speech: 'Hehe, đố mọi người cây kem khổng lồ kia là thật hay ảo ảnh của ta?' },
              { id: 'snowflake', name: 'Cô Tuyết Bông', speech: 'Bong bóng thì không ăn được, nhưng kem thật trong tiệm cô thì có nhé!' },
            ],
          },
          {
            sfx: 'BỤP!',
            bgTint: '#FFF9E6',
            characters: [
              { id: 'whirlwind', name: 'Tí Lốc Xoáy', speech: 'Chạm vỡ bong bóng rồi! Đi ăn kem thật thôi mọi người ơi!' },
            ],
          },
          {
            sfx: 'YAY!🍨',
            bgTint: '#FFE4EE',
            characters: [
              { id: 'storm_cloud', name: 'Nhóc Mây Giông', speech: 'Cho ta một ly vị dâu không mưa bóng mây nhé!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Tiệc kem tuyết vui nhất năm diễn ra ngay giữa quảng trường!',
            bgTint: '#EBF8FF',
            characters: [
              { id: 'snowflake', name: 'Cô Tuyết Bông', speech: 'Cảm ơn biệt đội Hẻm Xoáy đã mang lại tiếng cười cho cả thị trấn!' },
              { id: 'firefly', name: 'Bé Đom Đóm', speech: 'Ăn kem mát quá, tối nay bé ngủ ngon phải biết...' },
            ],
          },
          {
            bgTint: '#DBEAFE',
            characters: [
              { id: 'north_star', name: 'Ông Sao Bắc Đẩu', speech: 'Thấy chưa, la bàn của ta chỉ đường tới tiệm kem chưa bao giờ sai!' },
            ],
          },
          {
            sfx: 'CHILL 🎧',
            bgTint: '#FEF9C3',
            characters: [
              { id: 'spark', name: 'Anh Tia Chớp', speech: 'Lên nhạc Lofi ăn mừng phá án thành công nào!' },
            ],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Và thế là một ngày nữa lại khép lại thật rộn ràng.',
            sfx: 'HẾT TẬP ✨',
            bgTint: '#FFF4BD',
            characters: [
              { id: 'aurora', name: 'Bà Cực Quang', speech: 'Bạn đã mở khóa tới tận Hẻm Xoáy rồi — thật là một cư dân tuyệt vời!' },
              { id: 'saturn', name: 'Bác Sao Thổ', speech: 'Nhớ bấm Sưu tầm để lưu vào Tủ Sách Kỷ Niệm của bác nhé!' },
            ],
          },
          {
            bgTint: '#DFF8EB',
            characters: [
              { id: 'black_hole', name: 'Bé Hố Đen', speech: 'Hứa lần sau ngáp bé sẽ che miệng lại hihi!' },
            ],
          },
          {
            sfx: 'THE END 💖',
            bgTint: '#FFE4EE',
            characters: [
              { id: 'star', name: 'Bé Sao Bông', speech: 'Chia sẻ tập truyện này nếu bạn thấy vui nhé!' },
            ],
          },
        ],
      },
    ],
  },
];

export function getUnlockedComicsForLevel(playerLevel = 0, customComics = []) {
  const combined = [...(Array.isArray(customComics) ? customComics : []), ...BUILTIN_DAILY_COMICS];
  const list = combined.filter((c) => (c.minLevel || 0) <= playerLevel);
  return list.length > 0 ? list : [BUILTIN_DAILY_COMICS[0]];
}

export function getTodayComic(dateKey = getTodayDateString(), playerLevel = 0, customComics = []) {
  // Nếu Admin vừa thêm truyện ảnh mới phù hợp level hôm nay, ưu tiên hiển thị ngay ở "Truyện Trong Ngày"
  const unlockedCustom = (Array.isArray(customComics) ? customComics : []).filter(
    (c) => (c.minLevel || 0) <= playerLevel && c.pinAsToday
  );
  if (unlockedCustom.length > 0) return unlockedCustom[0];

  const pool = getUnlockedComicsForLevel(playerLevel, customComics);
  const parts = dateKey.split('-').map(Number);
  const daySeed = (parts[0] || 2026) * 372 + (parts[1] || 1) * 31 + (parts[2] || 1);
  return pool[daySeed % pool.length];
}

export function loadCollectedComics() {
  try {
    const raw = SafeStorage.getItem(COLLECTED_COMICS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCollectedComics(list) {
  // Tránh nhồi Data URL ảnh nặng vào localStorage (5MB limit): với truyện ảnh Admin, chỉ lưu metadata nhẹ & hydrate lại từ IndexedDB
  const slimList = (Array.isArray(list) ? list : []).map((c) => {
    const hasDataUrlImage = Array.isArray(c?.pages) && c.pages.some((p) => typeof p?.imageUrl === 'string' && p.imageUrl.startsWith('data:'));
    if (c?.isAdminImageComic || hasDataUrlImage) {
      return {
        id: c.id,
        title: c.title,
        author: c.author,
        moral: c.moral,
        minLevel: c.minLevel || 0,
        pageCount: c.pages?.length || c.pageCount || 0,
        isAdminImageComic: true,
        createdAt: c.createdAt || Date.now(),
      };
    }
    return c;
  });
  SafeStorage.setItem(COLLECTED_COMICS_STORAGE_KEY, JSON.stringify(slimList));
}

/**
 * Gọi Gemini 2.0 Flash (Free Tier) nếu có VITE_GEMINI_API_KEY để biên kịch truyện tranh Manga (5 trang x 3 khung/trang).
 * Fallback offline sinh đúng 5 trang x 3 khung/trang để trải nghiệm ngay.
 */
export async function generateComicFromIdea({ ideaText, authorName = 'Cư dân Sao Bông' }) {
  const cleanIdea = (ideaText || '').trim();
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  if (apiKey) {
    try {
      const prompt = `Bạn là biên kịch truyện tranh phong cách Doraemon/Manga chữa lành dài 5 trang cho game "Thị Trấn Sao Bông".
Ý tưởng từ cư dân "${authorName}": "${cleanIdea}".
Chỉ chọn character id trong: star, cloud, sun, moon, rainbow, nebula, spark, shooting_star, dewdrop, breeze, snowflake, aurora, saturn, firefly, sunset, north_star, storm_cloud, whirlwind, black_hole, mirage_fog.
Trả về ĐÚNG JSON hợp lệ (không markdown):
{"title":"tựa đề ngắn","moral":"1 câu chốt chữa lành","pages":[{"panels":[{"narration":"dẫn chuyện ngắn (tùy chọn)","sfx":"từ tượng thanh (tùy chọn)","bgTint":"#FFF4BD","characters":[{"id":"star","name":"Bé Sao Bông","speech":"lời thoại ngắn dưới 22 từ"}]}]}]}
Yêu cầu: Đúng 5 trang, mỗi trang đúng 3 khung (panels), khung đầu có 2 nhân vật đối thoại.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = JSON.parse(rawText);
        if (parsed && parsed.title && Array.isArray(parsed.pages) && parsed.pages.length >= 3) {
          return {
            id: `comic_ai_${Date.now()}`,
            minLevel: 0,
            title: parsed.title,
            author: `${authorName} ✨ AI Biên Kịch`,
            moral: parsed.moral || 'Mỗi câu chuyện nhỏ đều mang lại một chút nắng ấm cho tâm hồn.',
            pages: parsed.pages.slice(0, 10),
          };
        }
      }
    } catch {}
  }

  // Fallback offline 5 trang x 3 khung/trang chuẩn phong cách Manga
  const shortTitle = cleanIdea.length > 36 ? `${cleanIdea.slice(0, 36)}...` : cleanIdea;
  return {
    id: `comic_custom_${Date.now()}`,
    minLevel: 0,
    title: shortTitle,
    author: authorName,
    moral: 'Câu chuyện của chính bạn luôn là tập truyện đáng yêu nhất tại Thị Trấn Sao Bông!',
    pages: [
      {
        panels: [
          {
            narration: `Một ngày đẹp trời, ${authorName} gửi tới một ý tưởng siêu thú vị...`,
            sfx: 'TING! ✨',
            bgTint: '#F3E8FF',
            characters: [
              { id: 'aurora', name: 'Bà Cực Quang', speech: `Cả thị trấn ơi! Có kịch bản mới: "${cleanIdea}"!` },
              { id: 'star', name: 'Bé Sao Bông', speech: 'Oa! Nghe hấp dẫn quá, bắt đầu diễn ngay thôi!' },
            ],
          },
          {
            sfx: 'VÙ!',
            bgTint: '#FFF4BD',
            characters: [{ id: 'breeze', name: 'Chú Gió Mát', speech: 'Để chú gọi Cô Nắng Mai và Bác Mây Xốp tới xem nhé!' }],
          },
          {
            bgTint: '#FFE5D4',
            characters: [{ id: 'sun', name: 'Cô Nắng Mai', speech: 'Cô mang theo bánh sừng bò nóng làm đạo cụ nè!' }],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Cả nhóm tụ tập tại quảng trường Lọ Sao bàn kế hoạch...',
            sfx: 'XÌ XÀO~',
            bgTint: '#E0F2FE',
            characters: [
              { id: 'cloud', name: 'Bác Mây Xốp', speech: 'Theo bác thì tình huống này cần thêm một chút bất ngờ vui nhộn!' },
              { id: 'dewdrop', name: 'Bé Sương Mai', speech: 'Bé sẽ rắc thêm sương sớm lấp lánh làm hiệu ứng sân khấu!' },
            ],
          },
          {
            sfx: 'TÁCH!📸',
            bgTint: '#FFEDD5',
            characters: [{ id: 'sunset', name: 'Chị Hoàng Hôn', speech: 'Chị bấm máy ghi lại từng khung hình đẹp nhất nhé!' }],
          },
          {
            bgTint: '#EDE9FE',
            characters: [{ id: 'moon', name: 'Chú Trăng Khuyết', speech: 'Ánh sáng dịu nhẹ đã sẵn sàng!' }],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Cao trào bất ngờ xảy ra giữa con dốc đá cuội...',
            sfx: 'BẤT NGỜ!!',
            bgTint: '#FFF9E6',
            characters: [
              { id: 'star', name: 'Bé Sao Bông', speech: 'Hóa ra mọi rắc rối nhỏ đều hóa giải dễ dàng khi chúng ta đi cùng nhau!' },
              { id: 'sun', name: 'Cô Nắng Mai', speech: 'Đúng rồi! Thưởng cho cả đội một mẻ bánh quy may mắn!' },
            ],
          },
          {
            sfx: 'LẤP LÁNH',
            bgTint: '#E0F7F4',
            characters: [{ id: 'dewdrop', name: 'Bé Sương Mai', speech: 'Mầm hoa trên đồi cũng nở rộ theo luôn kìa!' }],
          },
          {
            bgTint: '#E8F5E1',
            characters: [{ id: 'breeze', name: 'Chú Gió Mát', speech: 'Gió thổi mát rượi cả thị trấn!' }],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Buổi chiều khép lại trong tiếng cười giòn tan.',
            bgTint: '#FFEDD5',
            characters: [
              { id: 'sunset', name: 'Chị Hoàng Hôn', speech: 'Đúng là một kỷ niệm khó quên trong tuần này!' },
              { id: 'cloud', name: 'Bác Mây Xốp', speech: `Thị trấn xin gửi lời cảm ơn nồng nhiệt tới tác giả ${authorName}!` },
            ],
          },
          {
            bgTint: '#EDE9FE',
            characters: [{ id: 'moon', name: 'Chú Trăng Khuyết', speech: 'Chúc bạn một buổi tối thật bình yên nhé.' }],
          },
          {
            sfx: 'VỖ TAY 👏',
            bgTint: '#FFE4EE',
            characters: [{ id: 'star', name: 'Bé Sao Bông', speech: 'Tuyệt đỉnh luôn!' }],
          },
        ],
      },
      {
        panels: [
          {
            narration: 'Trang cuối dành riêng cho bạn:',
            sfx: 'HẾT TẬP ✨',
            bgTint: '#F3E8FF',
            characters: [
              { id: 'aurora', name: 'Bà Cực Quang', speech: 'Bấm Sưu tầm để lưu tác phẩm của chính bạn vào Tủ Sách Kỷ Niệm nhé!' },
              { id: 'star', name: 'Bé Sao Bông', speech: 'Và đừng quên chia sẻ niềm vui này cùng bạn bè nha!' },
            ],
          },
          {
            bgTint: '#FFF4BD',
            characters: [{ id: 'sun', name: 'Cô Nắng Mai', speech: 'Hẹn gặp bạn ở tập truyện tiếp theo!' }],
          },
          {
            sfx: 'THE END 💖',
            bgTint: '#DFF8EB',
            characters: [{ id: 'breeze', name: 'Chú Gió Mát', speech: 'Bye bye~!' }],
          },
        ],
      },
    ],
  };
}
