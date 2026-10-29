import React, { useState, useEffect, useRef, useMemo } from 'react';

// ============================================================================
// CẤU HÌNH KẾT NỐI GOOGLE SHEET (Dành cho chủ trang web cấu hình trong code)
// Dán URL Google Apps Script Web App của bạn vào hằng số dưới đây:
// - Khi user gửi lời chúc: web sẽ tự động POST { nickname, mood, message } lên Sheet
// - Khi tải trang: web sẽ tự động GET các câu chúc có Checkbox duyệt = true từ Sheet
// ============================================================================
const GOOGLE_SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby62bVHxD3Ki2xXUxxZy0V_kmmPVaKz1HwxCe3KBlkEq_WvaZFK3Xz3pd7q8ei2A-kPrg/exec';

const TOTAL_INITIAL_STARS = 2000;
const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 giờ
const STORAGE_KEY = 'KAWAII_STAR_HOPE_JAR_STATE_V1';

// Safe LocalStorage Helper
const SafeStorage = {
  mem: {},
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return Object.prototype.hasOwnProperty.call(this.mem, key) ? this.mem[key] : null;
    }
  },
  setItem(key, val) {
    try {
      window.localStorage.setItem(key, val);
    } catch (e) {
      this.mem[key] = String(val);
    }
  }
};

// 1. Cấu hình 5 tâm trạng & 5 câu thoại đại diện
const MOOD_CONFIG = {
  happy: {
    id: 'happy',
    label: 'Hạnh phúc (Happy)',
    shortLabel: 'Hạnh phúc',
    subLabel: 'Happy ✨',
    emoji: '✨',
    cardBg: '#FFF4BD',
    badgeBg: '#FFF4BD',
    dialogue:
      'Tuyệt vời quá đi! Nụ cười rạng rỡ của bạn làm cả bầu trời hôm nay bừng sáng đấy. Hãy chạm vào lọ sao để nhận thêm một ngôi sao may mắn nhân đôi niềm vui trong ngày hôm nay nhé!'
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

// 2. Bộ tạo 2,000 câu nói truyền động lực, câu chúc ngắn gọn theo 5 tâm trạng (400 câu / tâm trạng)
const MOOD_PARTS = {
  happy: {
    starts: [
      'Nụ cười hôm nay của bạn chính là tia nắng ấm áp nhất,',
      'Hạnh phúc đang nở hoa trong từng khoảnh khắc bạn bước qua,',
      'Trái tim rạng rỡ của bạn xứng đáng với mọi điều ngọt ngào,',
      'Niềm vui nhỏ bé hôm nay sẽ dệt nên những tháng ngày rực rỡ,',
      'Ánh mắt lấp lánh của bạn làm thế giới này dịu dàng hơn biết bao,',
      'Giữ mãi nguồn năng lượng trong trẻo như bầu trời ban mai này nhé,',
      'Mỗi bước chân vui vẻ của bạn đều gieo xuống những hạt mầm may mắn,',
      'Hôm nay vũ trụ đang gửi tặng bạn một chiếc kẹo bông gòn hạnh phúc,',
      'Chẳng có gì đẹp hơn khoảnh khắc bạn mỉm cười thật tươi như lúc này,',
      'Bầu trời hôm nay xanh trong giống hệt như tâm hồn đáng yêu của bạn,',
      'Hãy lưu giữ cảm giác ấm áp này vào ngăn kéo đẹp nhất của ký ức,',
      'Khi bạn vui vẻ, hàng ngàn ngôi sao nhỏ cũng đang nhảy múa cùng bạn,',
      'Sự lạc quan của bạn chính là phép màu kỳ diệu nhất trong ngày hôm nay,',
      'Cảm ơn bạn vì đã tỏa sáng theo cách dịu dàng và rực rỡ nhất,',
      'Một ngày ngập tràn tiếng cười là món quà tuyệt vời bạn dành cho chính mình,',
      'Gió nhẹ hôm nay mang theo biết bao lời chúc tốt lành đến bên bạn,',
      'Niềm hạnh phúc giản dị đang ôm lấy bạn thật chặt trong từng giây phút,',
      'Hãy cứ tận hưởng trọn vẹn từng điều ngọt ngào đang gõ cửa trái tim,',
      'Tâm trạng tươi sáng của bạn sẽ thu hút thêm thật nhiều phép màu mới,',
      'Ngôi sao nhỏ này xin được nhân đôi niềm vui mà bạn đang có hôm nay,'
    ],
    ends: [
      'chúc bạn cả ngày dài luôn ngập tràn tiếng cười và yêu thương nhé!',
      'mong mọi dự định của bạn hôm nay đều thuận buồm xuôi gió.',
      'hãy chia sẻ chút nắng ấm này cho những người bạn yêu quý nha.',
      'vì bạn xứng đáng nhận được trọn vẹn những điều tốt đẹp nhất trên đời.',
      'chúc cho từng giờ trôi qua đều mang đến thêm một tin vui bất ngờ.',
      'mong nụ cười xinh đẹp ấy sẽ luôn ở lại trên môi bạn thật lâu.',
      'vũ trụ đang mỉm cười và vỗ tay chúc mừng cho niềm vui của bạn đó!',
      'chúc buổi tối hôm nay của bạn cũng ngọt ngào như một giấc mơ hồng.',
      'hãy tự thưởng cho bản thân một món quà nhỏ thật dễ thương hôm nay nhé.',
      'mong những ngày sắp tới của bạn cũng rực rỡ như ánh sao lúc này.',
      'chúc trái tim bạn luôn giữ được sự hồn nhiên và ấm áp như hiện tại.',
      'mọi điều may mắn nhất trong ngày đang xếp hàng chờ đón bạn phía trước.',
      'cầu chúc bình an và niềm vui sẽ theo bước chân bạn trên mọi nẻo đường.',
      'hãy cứ tự hào về những điều tuyệt vời mà bạn đã tạo nên hôm nay nhé.',
      'ngôi sao hy vọng sẽ luôn đồng hành để giữ trọn niềm vui này cho bạn.',
      'chúc bạn có thêm thật nhiều kỷ niệm đáng nhớ trong ngày tuyệt đẹp này.',
      'mong mỗi trang nhật ký của bạn đều lấp lánh sắc màu hạnh phúc.',
      'hãy dang rộng vòng tay đón nhận thêm những điều kỳ diệu mới nhé!',
      'chúc cho tâm hồn bạn mãi luôn tươi mới như đóa hoa hướng dương.',
      'bầu trời hôm nay gửi tặng bạn ngàn cái ôm lấp lánh ánh sao!'
    ]
  },
  excited: {
    starts: [
      'Ngọn lửa nhiệt huyết trong bạn đang tỏa sáng rực rỡ hơn bao giờ hết,',
      'Hôm nay là thời điểm tuyệt vời nhất để bạn bắt đầu điều mình hằng ấp ủ,',
      'Sự tự tin và hào hứng của bạn có thể biến mọi ước mơ thành hiện thực,',
      'Đừng ngại bước tới phía trước vì cả bầu trời sao đang ủng hộ bạn,',
      'Năng lượng tươi mới trong tim bạn hôm nay thật đáng ngưỡng mộ,',
      'Mỗi ý tưởng táo bạo của bạn đều là một hạt giống của sự thành công,',
      'Thế giới rộng lớn đang chờ đón những bước chân đầy cảm hứng từ bạn,',
      'Khi bạn đặt cả trái tim vào điều mình yêu thích, phép màu sẽ xuất hiện,',
      'Sự háo hức hôm nay chính là tín hiệu của những khởi đầu đầy may mắn,',
      'Hãy cứ bay cao cùng những ước mơ ngọt ngào mà bạn đang theo đuổi,',
      'Chẳng có giới hạn nào ngăn được một trái tim đang tràn đầy đam mê,',
      'Ánh sao hôm nay tiếp thêm cho bạn thật nhiều dũng khí và niềm tin,',
      'Mọi cơ hội tuyệt vời nhất đang mở rộng cánh cửa chào đón bạn bước vào,',
      'Hãy tin vào trực giác và sự nhiệt thành đang chảy trong tim mình nhé,',
      'Nhịp đập rộn ràng hôm nay báo hiệu một hành trình vô cùng thú vị,',
      'Bạn đang làm rất tốt và đang tiến gần hơn tới mục tiêu của mình rồi,',
      'Hãy biến niềm cảm hứng hôm nay thành một kỷ niệm thật đáng tự hào,',
      'Sự chăm chỉ và nhiệt huyết của bạn chắc chắn sẽ nở hoa kết trái,',
      'Vũ trụ rất yêu thích những tâm hồn dám ước mơ và dám bắt đầu như bạn,',
      'Ngôi sao may mắn này mang đến nguồn gió thuận lợi nhất cho hành trình của bạn,'
    ],
    ends: [
      'hãy tự tin tỏa sáng theo đúng bản sắc riêng tuyệt vời của bạn nhé!',
      'chúc mọi kế hoạch bạn chạm tay vào hôm nay đều thành công rực rỡ.',
      'bước tiếp thật vững vàng vì điều tuyệt vời nhất đang ở ngay phía trước!',
      'mong bạn gặt hái được những thành quả ngọt ngào vượt ngoài mong đợi.',
      'cứ mạnh dạn thử sức nhé, bầu trời luôn dành chỗ cho đôi cánh của bạn.',
      'chúc nguồn cảm hứng bất tận sẽ luôn đồng hành cùng bạn suốt cả ngày.',
      'hãy tận hưởng trọn vẹn niềm vui của sự khám phá và sáng tạo hôm nay!',
      'mọi nỗ lực hết mình của bạn đều sẽ được đền đáp xứng đáng.',
      'chúc bạn gặp được những người đồng hành tuyệt vời trên chặng đường mới.',
      'hãy giữ vững ngọn lửa ấm áp này để chinh phục mọi thử thách nhé!',
      'tin vui lớn đang trên đường tìm đến gõ cửa nhà bạn ngay hôm nay đó.',
      'chúc từng bước đi của bạn đều tràn ngập may mắn và thuận lợi.',
      'hãy mỉm cười thật tươi và đón nhận những cơ hội vàng đang tới nhé!',
      'bạn mạnh mẽ, tài năng và xứng đáng với những đỉnh cao rực rỡ nhất.',
      'ngôi sao hy vọng xin tiếp thêm 100% phép màu cho dự định của bạn!',
      'chúc ngày hôm nay của bạn bùng nổ những niềm vui và dấu ấn đáng nhớ.',
      'hãy cứ hết mình với đam mê, thành quả ngọt ngào sẽ sớm mỉm cười thôi.',
      'mong bạn luôn giữ được đôi mắt lấp lánh niềm tin yêu như lúc này.',
      'chúc hành trình hôm nay của bạn suôn sẻ và ngập tràn bất ngờ thú vị!',
      'cả thị trấn sao bông đang cổ vũ hết mình cho ước mơ của bạn đó!'
    ]
  },
  normal: {
    starts: [
      'Giữa thế giới vội vã, một ngày bình yên chính là món quà dịu dàng nhất,',
      'Không cần phải quá ồn ào, sự tĩnh lặng hôm nay cũng đủ làm ấm lòng,',
      'Hãy hít một hơi thật sâu để cảm nhận hương vị nhẹ nhàng của ngày mới,',
      'Những điều giản dị quanh bạn đang âm thầm tạo nên hạnh phúc bền lâu,',
      'Một tách trà ấm và một tâm hồn thảnh thơi đã là trọn vẹn cho hôm nay,',
      'Bình yên không ở đâu xa, nó nằm ngay trong nhịp thở dịu dàng của bạn,',
      'Hãy cho phép bản thân sống chậm lại để ngắm nhìn những đám mây trôi,',
      'Một ngày không sóng gió chính là lúc tâm hồn được tưới mát ngọt ngào,',
      'Như cơn gió mát lành chiều thu, mong hôm nay vỗ về bạn thật êm ái,',
      'Hạnh phúc đôi khi chỉ là cảm giác an nhiên khi nhìn nắng qua khung cửa,',
      'Chẳng cần chạy đua với ai, nhịp bước thong dong của bạn lúc này rất đẹp,',
      'Sự dịu dàng bạn dành cho cuộc sống sẽ quay trở lại ôm lấy chính bạn,',
      'Mỗi ngày bình thường trôi qua êm đềm đều là một mảnh ghép đáng trân quý,',
      'Hãy lắng nghe giai điệu nhẹ nhàng của cuộc sống đang ngân vang quanh mình,',
      'Tâm hồn thư thái của bạn hôm nay đẹp tựa mặt hồ phẳng lặng soi bóng sao,',
      'Những khoảnh khắc giản đơn hôm nay sẽ trở thành kỷ niệm thật êm đềm,',
      'Hãy mỉm cười nhẹ nhàng với chính mình vì bạn đã đi qua ngày thật an nhiên,',
      'Đôi khi điều tuyệt vời nhất chỉ là một buổi chiều không vướng bận âu lo,',
      'Ngôi sao nhỏ này mang đến cho bạn một làn gió mát lành và trong trẻo,',
      'Giữ cho lòng mình phẳng lặng, bạn sẽ thấy mọi thứ quanh mình đều dễ thương,'
    ],
    ends: [
      'chúc bạn có những giờ phút thư giãn thật trọn vẹn và êm dịu nhé.',
      'mong sự an nhiên này sẽ ôm ấp trái tim bạn suốt cả ngày hôm nay.',
      'hãy tận hưởng vẻ đẹp của những điều nhỏ bé đang hiện diện quanh bạn.',
      'chúc tâm hồn bạn luôn nhẹ tênh như đám mây bông trên bầu trời xanh.',
      'mong mọi chuyện đến với bạn hôm nay đều nhẹ nhàng và suôn sẻ.',
      'hãy dành chút thời gian chiều chuộng bản thân bằng điều bạn thích nhé.',
      'chúc bạn một ngày êm ả, tối về có một giấc ngủ thật ngon và sâu.',
      'bình yên trong tim chính là chiếc chìa khóa mở ra mọi niềm vui lâu dài.',
      'mong những điều ngọt ngào nhỏ xinh sẽ khẽ chạm vào ngày của bạn.',
      'chúc mỗi khoảnh khắc hôm nay đều trôi qua thật dịu dàng và ấm áp.',
      'hãy cứ mỉm cười thật khẽ, vũ trụ vẫn đang dịu dàng che chở cho bạn.',
      'mong bạn tìm thấy niềm vui trong từng việc nhỏ nhặt nhất ngày hôm nay.',
      'chúc không gian quanh bạn luôn ngập tràn ánh sáng ấm áp và bình an.',
      'ngôi sao hy vọng chúc bạn một ngày thảnh thơi không chút muộn phiền.',
      'hãy cứ bước đi chậm rãi và tận hưởng từng ngọn gió mát lành nhé.',
      'chúc trái tim bạn luôn là một khu vườn yên tĩnh nở đầy hoa thơm.',
      'mong những âu lo đều tan biến để nhường chỗ cho sự thư thái tuyệt đối.',
      'cầu chúc cho ngày hôm nay của bạn nhẹ nhàng như một bản nhạc không lời.',
      'hãy trân trọng sự bình yên quý giá mà bạn đang nắm giữ lúc này nhé!',
      'bầu trời sao xin gửi tặng bạn một khoảng lặng thật ngọt ngào hôm nay.'
    ]
  },
  tired: {
    starts: [
      'Hôm nay bạn đã cố gắng rất nhiều rồi, hãy cho phép mình nghỉ ngơi một chút,',
      'Đôi vai nhỏ của bạn đã gánh vác đủ rồi, giờ là lúc thả lỏng thật êm nhé,',
      'Không sao đâu nếu hôm nay bạn muốn đi chậm lại để nạp thêm năng lượng,',
      'Ngay cả những ngôi sao sáng nhất cũng cần màn đêm yên tĩnh để nghỉ ngơi,',
      'Cảm ơn bạn vì đã kiên trì đi qua một ngày dài nhiều việc đến vậy,',
      'Hãy gác lại những bộn bề ngoài kia và dành cho mình một cái ôm thật ấm,',
      'Mệt mỏi chỉ là lời nhắc nhở dịu dàng rằng cơ thể bạn cần được yêu chiều hơn,',
      'Bạn không cần phải hoàn hảo mọi lúc, chỉ cần bạn luôn bình an là đủ rồi,',
      'Hãy tựa đầu vào đám mây mềm mại này và thở ra hết những căng thẳng nhé,',
      'Mọi sự nỗ lực âm thầm của bạn hôm nay đều được bầu trời ghi nhận cả đấy,',
      'Đừng tự trách mình nếu hôm nay bạn chưa làm xuể hết mọi việc nhé,',
      'Sau một chặng đường dài, dừng chân uống ngụm nước ấm là điều rất xứng đáng,',
      'Hãy đối xử thật dịu dàng với bản thân giống như cách bạn yêu thương người khác,',
      'Những áp lực hôm nay rồi sẽ tan nhanh như bọt xà phòng dưới nắng mai thôi,',
      'Ngôi sao nhỏ này muốn gửi đến bạn một chiếc chăn ấm áp cho tâm hồn,',
      'Hãy nhắm mắt lại vài giây và cảm nhận sự bình yên đang lan tỏa trong tim,',
      'Sức khỏe và sự thư thái của bạn quan trọng hơn bất kỳ deadline nào ngoài kia,',
      'Bạn đã làm tốt nhất trong khả năng của mình ngày hôm nay rồi đó,',
      'Đêm nay hãy ngủ một giấc thật sâu để ngày mai thức dậy tràn đầy sức sống,',
      'Bầu trời sao đang dịu dàng xoa dịu từng chút mệt nhọc trong lòng bạn,'
    ],
    ends: [
      'chúc bạn sớm phục hồi năng lượng và tìm lại nụ cười tươi tắn nhé!',
      'hãy nghỉ ngơi thật sớm tối nay, ngày mai mọi thứ sẽ nhẹ nhàng hơn nhiều.',
      'ngôi sao hy vọng xin gửi tặng bạn nguồn năng lượng chữa lành ấm áp nhất.',
      'mong một giấc ngủ ngon sẽ cuốn trôi hết mọi mỏi mệt trong ngày của bạn.',
      'hãy tự thưởng cho mình một bữa ăn ngon và một buổi tối thật thảnh thơi nhé.',
      'vũ trụ đang gửi một làn gió êm dịu đến vỗ về đôi mắt đang mỏi của bạn.',
      'ngày mai nắng ấm sẽ lại lên và tiếp thêm sức mạnh mới cho bạn thôi.',
      'hãy buông bỏ hết lo toan trước khi đặt lưng xuống chiếc giường êm ái nhé.',
      'bạn xứng đáng được nghỉ ngơi trọn vẹn sau tất cả những gì đã cố gắng.',
      'chúc tâm trí bạn được thả lỏng hoàn toàn trong những giờ phút sắp tới.',
      'đừng quên uống một cốc nước ấm và vươn vai nhẹ nhàng ngay lúc này nha.',
      'mọi vất vả hôm nay sẽ hóa thành quả ngọt xứng đáng cho bạn vào ngày mai.',
      'cầu chúc sự êm đềm sẽ bao bọc lấy bạn trong suốt phần còn lại của ngày.',
      'hãy để những giai điệu nhẹ nhàng ru êm tâm hồn bạn tối hôm nay nhé.',
      'bạn đã rất giỏi rồi, giờ hãy để bản thân được thư giãn thật sự nha!',
      'mong sớm mai thức dậy, bạn sẽ thấy lòng mình nhẹ nhõm và khỏe khoắn hơn.',
      'thị trấn sao bông luôn ở đây làm điểm tựa êm ái mỗi khi bạn thấy mệt.',
      'chúc bạn có một khoảng thời gian riêng tư thật ấm áp để nạp lại pin nhé.',
      'hãy mỉm cười một chút nào, vì bạn đã vượt qua ngày hôm nay thật kiên cường!',
      'gửi đến bạn ngàn tia sáng dịu êm để xua tan mọi uể oải ngay lúc này.'
    ]
  },
  bad: {
    starts: [
      'Đừng buồn lâu bạn nhé, cơn mưa nào rồi cũng sẽ tạnh để nhường chỗ cho cầu vồng,',
      'Nếu hôm nay có chút chông chênh, hãy nhớ rằng bạn không hề đơn độc một mình,',
      'Những giọt nước mắt hôm nay chỉ là để rửa trôi bụi mờ cho đôi mắt thêm trong,',
      'Một ngày tồi tệ không có nghĩa là cả cuộc đời đều tệ, ngày mai sẽ khác thôi,',
      'Hãy cho phép mình được yếu lòng một chút, rồi nắng ấm sẽ lại sưởi ấm tim bạn,',
      'Mọi chuyện buồn hôm nay rồi sẽ trở thành quá khứ nhẹ tựa làn mây bay,',
      'Bạn quý giá và đáng yêu hơn rất nhiều so với những muộn phiền đang gặp phải,',
      'Đằng sau đám mây xám xịt hôm nay, bầu trời xanh và những vì sao vẫn đang đợi bạn,',
      'Đừng để một khoảnh khắc không vui làm lu mờ đi biết bao điều tốt đẹp ở bạn,',
      'Ngôi sao nhỏ này bay đến đây là để lắng nghe và ôm lấy nỗi buồn của bạn,',
      'Sau đêm tối nhất chính là lúc bình minh rực rỡ nhất chuẩn bị ló rạng,',
      'Những thử thách hôm nay chỉ đang giúp trái tim bạn thêm mạnh mẽ và sâu sắc hơn,',
      'Dù hôm nay mọi thứ chưa như ý, bạn vẫn xứng đáng được yêu thương trọn vẹn,',
      'Hãy thở thật chậm nhé, từng nhịp thở sẽ mang nỗi buồn rời xa khỏi lồng ngực bạn,',
      'Vũ trụ luôn có cách bù đắp thật ngọt ngào cho những trái tim biết kiên nhẫn,',
      'Xung quanh bạn vẫn còn rất nhiều điều dịu dàng và thú vị đang chờ đón phía trước,',
      'Nỗi buồn hôm nay chỉ là một vị khách ghé ngang, đừng giữ họ ở lại lâu nhé,',
      'Hãy tin rằng những điều tốt đẹp nhất vẫn đang trên đường tìm đến với bạn,',
      'Trái tim ấm áp của bạn rồi sẽ sớm tìm lại được giai điệu vui tươi vốn có,',
      'Thị trấn sao bông xin gửi tặng bạn chiếc ôm thật chặt để vỗ về tâm hồn lúc này,'
    ],
    ends: [
      'hãy vững tin lên nhé vì ngày mai tươi sáng đang dang tay chờ đón bạn!',
      'mong ngôi sao may mắn này sẽ thắp lên ngọn lửa ấm áp trong lòng bạn.',
      'mọi giông bão rồi sẽ dừng lại sau cánh cửa, bình yên sẽ sớm quay về thôi.',
      'cầu chúc những điều dịu dàng nhất sẽ đến xoa dịu trái tim bạn ngay lúc này.',
      'hãy mỉm cười thật nhẹ nhé, vì luôn có những người âm thầm yêu thương bạn.',
      'ngày mai là một trang giấy trắng tinh khôi để bạn viết lại niềm vui mới.',
      'chúc cho mọi muộn phiền của bạn tan biến nhanh như sương sớm gặp nắng.',
      'bạn kiên cường hơn bạn nghĩ rất nhiều, hãy tin vào chính mình nhé!',
      'mong một điều bất ngờ ngọt ngào sẽ sớm xuất hiện làm bạn vui trở lại.',
      'hãy dịu dàng với chính mình trong lúc này, mọi chuyện rồi sẽ ổn cả thôi.',
      'bầu trời sao luôn chiếu sáng dẫn lối cho bạn bước qua những ngày nhiều mây.',
      'chúc trái tim bạn sớm tìm lại được sự ấm áp, an nhiên và hy vọng.',
      'đừng quên rằng sau mỗi cơn mưa, cỏ cây đều xanh tươi và tràn đầy sức sống hơn.',
      'ngôi sao hy vọng sẽ ở bên cạnh bầu bạn cùng bạn vượt qua khoảnh khắc này.',
      'mong đêm nay sẽ mang đi hết ưu phiền và trả lại cho bạn nụ cười sáng mai.',
      'hãy mở lòng đón nhận những tia nắng nhỏ đang len lỏi vào ngày của bạn nhé.',
      'chúc bạn luôn giữ được niềm tin vào những phép màu tử tế của cuộc sống.',
      'một khởi đầu mới tốt đẹp hơn rất nhiều đang chờ bạn ở ngay phía trước.',
      'gửi ngàn lời thương mến nhất đến vỗ về tâm hồn nhạy cảm của bạn hôm nay.',
      'hãy ngẩng đầu nhìn lên bầu trời nhé, ngôi sao may mắn đang mỉm cười với bạn đó!'
    ]
  }
};

function buildQuotesDatabase() {
  const db = {};
  let serial = 1;
  Object.keys(MOOD_PARTS).forEach((moodKey) => {
    const { starts, ends } = MOOD_PARTS[moodKey];
    const list = [];
    for (let i = 0; i < starts.length; i++) {
      for (let j = 0; j < ends.length; j++) {
        list.push({
          id: 'STAR-' + String(serial).padStart(4, '0'),
          mood: moodKey,
          text: `${starts[i]} ${ends[j]}`,
          sender: 'Bầu Trời Sao ✨',
          fromSheet: false
        });
        serial++;
      }
    }
    db[moodKey] = list; // 400 câu mỗi tâm trạng x 5 = 2,000 câu
  });
  return db;
}

const DEFAULT_SHEET_WISHES = [
  {
    id: 'WISH-101',
    timestamp: 'Hôm nay, 08:15',
    nickname: 'Mây Hồng Nhỏ',
    mood: 'bad',
    message:
      'Dù hôm nay có chuyện gì làm bạn buồn thì cũng đừng quên bạn là một phiên bản duy nhất và rất đáng yêu trên thế giới này nhé!',
    approved: true
  },
  {
    id: 'WISH-102',
    timestamp: 'Hôm nay, 09:30',
    nickname: 'Người lạ',
    mood: 'tired',
    message:
      'Gửi người vừa mở được ngôi sao này: Chúc bạn tối nay ngủ thật ngon, mọi mệt mỏi đều bay biến hết nha!',
    approved: true
  },
  {
    id: 'WISH-103',
    timestamp: 'Hôm nay, 10:45',
    nickname: 'Thỏ Kem Bơ',
    mood: 'all',
    message:
      'Chúc bạn một ngày ngập tràn những điều dễ thương bất ngờ, đi đến đâu cũng gặp người tử tế và ấm áp!',
    approved: true
  }
];

function getTodayDateString() {
  try {
    // Luôn lấy ngày theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7) để reset đúng 00:00 giờ VN
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch (e) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

function formatDurationHMS(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function loadInitialState() {
  const todayStr = getTodayDateString();
  let saved = null;
  try {
    const raw = SafeStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {
    saved = null;
  }

  if (!saved || saved.dateKey !== todayStr) {
    const fresh = {
      dateKey: todayStr,
      selectedMood: null,
      sharedRemainingStars: TOTAL_INITIAL_STARS,
      drawnStarIds: [],
      lastDrawTimestamp: 0,
      todayHistory: [],
      wishSubmittedToday: false,
      sheetWishes: saved && Array.isArray(saved.sheetWishes) ? saved.sheetWishes : DEFAULT_SHEET_WISHES
    };
    SafeStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  if (typeof saved.sharedRemainingStars !== 'number') {
    saved.sharedRemainingStars = Math.max(
      0,
      TOTAL_INITIAL_STARS - (saved.drawnStarIds ? saved.drawnStarIds.length : 0)
    );
  }
  if (!Array.isArray(saved.sheetWishes)) {
    saved.sheetWishes = DEFAULT_SHEET_WISHES;
  }
  return saved;
}

// ============================================================================
// CUSTOM SVG ICONS CHO 5 TÂM TRẠNG
// ============================================================================
function MoodSmileSvg({ mood }) {
  if (mood === 'happy') {
    return (
      <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" fill="#FFE066" stroke="#593A47" strokeWidth="4" />
        <path
          d="M52 14C56 8 64 12 60 18C66 16 68 24 60 24C54 24 52 18 52 14Z"
          fill="#FF7597"
          stroke="#593A47"
          strokeWidth="2.5"
        />
        <path d="M23 36C25 30 32 30 34 36" stroke="#593A47" strokeWidth="4" strokeLinecap="round" />
        <path d="M46 36C48 30 55 30 57 36" stroke="#593A47" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="22" cy="44" rx="6" ry="3.5" fill="#FF85A9" />
        <ellipse cx="58" cy="44" rx="6" ry="3.5" fill="#FF85A9" />
        <path
          d="M28 45C28 54 52 54 52 45Z"
          fill="#FF6B8B"
          stroke="#593A47"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (mood === 'excited') {
    return (
      <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" fill="#FFB8D0" stroke="#593A47" strokeWidth="4" />
        <circle cx="28" cy="36" r="5" fill="#593A47" />
        <path d="M28 32L29.2 34.8L32 36L29.2 37.2L28 40L26.8 37.2L24 36L26.8 34.8L28 32Z" fill="#FFF" />
        <circle cx="52" cy="36" r="5" fill="#593A47" />
        <path d="M52 32L53.2 34.8L56 36L53.2 37.2L52 40L50.8 37.2L48 36L50.8 34.8L52 32Z" fill="#FFF" />
        <path d="M19 45C17 42 13 44 16 48L19 50L22 48C25 44 21 42 19 45Z" fill="#FF4D79" />
        <path d="M61 45C59 42 55 44 58 48L61 50L64 48C67 44 63 42 61 45Z" fill="#FF4D79" />
        <path
          d="M31 46C34 51 39 50 40 46C41 50 46 51 49 46"
          stroke="#593A47"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (mood === 'normal') {
    return (
      <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" fill="#A8F0CB" stroke="#593A47" strokeWidth="4" />
        <path d="M40 8V14" stroke="#593A47" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M40 10C34 4 28 9 34 13C37 15 40 12 40 10Z" fill="#52B788" stroke="#593A47" strokeWidth="2.5" />
        <path d="M40 10C46 4 52 9 46 13C43 15 40 12 40 10Z" fill="#74C69D" stroke="#593A47" strokeWidth="2.5" />
        <circle cx="28" cy="37" r="4" fill="#593A47" />
        <circle cx="26.8" cy="35.5" r="1.4" fill="#FFFFFF" />
        <circle cx="52" cy="37" r="4" fill="#593A47" />
        <circle cx="50.8" cy="35.5" r="1.4" fill="#FFFFFF" />
        <ellipse cx="22" cy="44" rx="5.5" ry="3" fill="#FF9EBB" />
        <ellipse cx="58" cy="44" rx="5.5" ry="3" fill="#FF9EBB" />
        <path d="M32 47C36 52 44 52 48 47" stroke="#593A47" strokeWidth="3.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (mood === 'tired') {
    return (
      <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" fill="#D8C2FF" stroke="#593A47" strokeWidth="4" />
        <path d="M23 36C26 39 32 39 35 36" stroke="#593A47" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M45 36C48 39 54 39 57 36" stroke="#593A47" strokeWidth="3.8" strokeLinecap="round" />
        <ellipse cx="22" cy="44" rx="5" ry="3" fill="#FF9EBB" />
        <ellipse cx="58" cy="44" rx="5" ry="3" fill="#FF9EBB" />
        <path d="M31 49C34 46 37 51 40 48C43 45 46 50 49 47" stroke="#593A47" strokeWidth="3.5" strokeLinecap="round" />
        <text x="54" y="24" fill="#593A47" fontSize="12" fontWeight="800">
          zZ
        </text>
      </svg>
    );
  }
  return (
    <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" fill="#B8E1FF" stroke="#593A47" strokeWidth="4" />
      <path d="M22 30L32 33" stroke="#593A47" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 30L48 33" stroke="#593A47" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="38" r="4.5" fill="#593A47" />
      <circle cx="26.8" cy="36.5" r="1.6" fill="#FFFFFF" />
      <circle cx="52" cy="38" r="4.5" fill="#593A47" />
      <circle cx="50.8" cy="36.5" r="1.6" fill="#FFFFFF" />
      <path d="M22 43C22 43 19 48 22 50C25 48 22 43 22 43Z" fill="#4EA8DE" stroke="#593A47" strokeWidth="2" />
      <ellipse cx="24" cy="45" rx="4.5" ry="2.5" fill="#FF9EBB" />
      <ellipse cx="56" cy="45" rx="4.5" ry="2.5" fill="#FF9EBB" />
      <path d="M33 51C36 46 44 46 47 51" stroke="#593A47" strokeWidth="3.8" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// MAIN REACT COMPONENT
// ============================================================================
export default function App() {
  const quotesByMood = useMemo(() => buildQuotesDatabase(), []);
  const [appState, setAppState] = useState(() => loadInitialState());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState(null);
  const [isJarShaking, setIsJarShaking] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form states
  const [nickname, setNickname] = useState('');
  const [wishMood, setWishMood] = useState('all');
  const [wishMessage, setWishMessage] = useState('');
  const [wishError, setWishError] = useState(false);

  const moodSelectorRef = useRef(null);
  const starJarRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg('');
    }, 3400);
  };

  // Save state helper
  const updateState = (updater) => {
    setAppState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      SafeStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Đồng bộ số lượng sao dùng chung (2000) & danh sách lời chúc đã duyệt từ Google Sheet
  const syncFromGoogleSheet = () => {
    if (!GOOGLE_SHEET_SCRIPT_URL || !GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) return;
    fetch(GOOGLE_SHEET_SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        updateState((prev) => {
          const next = { ...prev };
          if (typeof data.remainingStars === 'number') {
            next.sharedRemainingStars = Math.max(0, data.remainingStars);
          }
          if (Array.isArray(data.wishes)) {
            next.sheetWishes = data.wishes.map((w, idx) => ({
              id: 'GSHEET-' + idx,
              timestamp: w.timestamp || '',
              nickname: w.nickname || 'Người lạ',
              mood: w.mood || 'all',
              message: w.message || '',
              approved: true
            }));
          }
          return next;
        });
      })
      .catch(() => {});
  };

  // 1-second interval for 4h cooldown & 00:00 Vietnam time daily reset check
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTs = Date.now();
      setNowMs(currentTs);

      const todayStr = getTodayDateString();
      setAppState((prev) => {
        if (prev.dateKey !== todayStr) {
          const resetState = {
            ...prev,
            dateKey: todayStr,
            selectedMood: null,
            sharedRemainingStars: TOTAL_INITIAL_STARS,
            drawnStarIds: [],
            lastDrawTimestamp: 0,
            todayHistory: [],
            wishSubmittedToday: false
          };
          SafeStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
          return resetState;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tải số lượng sao dùng chung & lời chúc từ Google Sheet khi mở trang và định kỳ mỗi 30 giây
  useEffect(() => {
    syncFromGoogleSheet();
    const syncTimer = setInterval(syncFromGoogleSheet, 30000);
    return () => clearInterval(syncTimer);
  }, []);

  const remainingCooldownMs = appState.lastDrawTimestamp
    ? Math.max(0, COOLDOWN_MS - (nowMs - appState.lastDrawTimestamp))
    : 0;

  const remainingStarsCount =
    typeof appState.sharedRemainingStars === 'number'
      ? Math.max(0, appState.sharedRemainingStars)
      : Math.max(0, TOTAL_INITIAL_STARS - (appState.drawnStarIds ? appState.drawnStarIds.length : 0));

  // Select mood handler
  const handleSelectMood = (moodKey) => {
    if (remainingCooldownMs > 0) {
      showToast(
        `⏳ Bạn vừa nhận sao rồi! Vui lòng đợi ${formatDurationHMS(remainingCooldownMs)} nữa để chọn lại tâm trạng nhé.`
      );
      return;
    }

    updateState((prev) => ({
      ...prev,
      selectedMood: moodKey
    }));

    setTimeout(() => {
      if (starJarRef.current) {
        starJarRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  // Scroll up to mood selector when clicking "tâm trạng của tôi"
  const handleScrollToMood = () => {
    if (moodSelectorRef.current) {
      moodSelectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Draw random star from the jar
  const handleDrawStar = () => {
    if (remainingCooldownMs > 0) {
      showToast(`⏳ Mỗi thiết bị chỉ mở sao 4 giờ 1 lần! Còn ${formatDurationHMS(remainingCooldownMs)} nữa nhé.`);
      return;
    }

    if (!appState.selectedMood || !MOOD_CONFIG[appState.selectedMood]) {
      handleScrollToMood();
      return;
    }

    if (remainingStarsCount <= 0) {
      showToast('🌟 Cả 2,000 ngôi sao hôm nay đã được mở hết! Hộp sao sẽ tự động làm mới vào 00:00 ngày mai.');
      return;
    }

    setIsJarShaking(true);
    setTimeout(() => setIsJarShaking(false), 900);

    const moodKey = appState.selectedMood;
    const drawnSet = new Set(appState.drawnStarIds || []);

    const approvedSheetCandidates = (appState.sheetWishes || [])
      .filter((w) => w.approved === true && w.message && (w.mood === moodKey || w.mood === 'all') && !drawnSet.has(w.id))
      .map((w) => ({
        id: w.id,
        mood: moodKey,
        text: w.message,
        sender: w.nickname || 'Người lạ',
        fromSheet: true
      }));

    const builtInCandidates = (quotesByMood[moodKey] || []).filter((q) => !drawnSet.has(q.id));

    let chosenStar = null;
    if (approvedSheetCandidates.length > 0 && Math.random() < 0.35) {
      chosenStar = approvedSheetCandidates[Math.floor(Math.random() * approvedSheetCandidates.length)];
    } else if (builtInCandidates.length > 0) {
      chosenStar = builtInCandidates[Math.floor(Math.random() * builtInCandidates.length)];
    } else if (approvedSheetCandidates.length > 0) {
      chosenStar = approvedSheetCandidates[0];
    } else {
      const anyMoodPool = Object.values(quotesByMood)
        .flat()
        .filter((q) => !drawnSet.has(q.id));
      if (anyMoodPool.length === 0) return;
      chosenStar = anyMoodPool[Math.floor(Math.random() * anyMoodPool.length)];
    }

    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    const currentSharedNumber = remainingStarsCount;

    const historyRecord = {
      id: chosenStar.id,
      mood: moodKey,
      text: chosenStar.text,
      sender: chosenStar.sender || 'Bầu Trời Sao ✨',
      fromSheet: !!chosenStar.fromSheet,
      timeStr,
      starNumber: currentSharedNumber
    };

    updateState((prev) => ({
      ...prev,
      sharedRemainingStars: Math.max(
        0,
        (typeof prev.sharedRemainingStars === 'number' ? prev.sharedRemainingStars : TOTAL_INITIAL_STARS) - 1
      ),
      drawnStarIds: [...(prev.drawnStarIds || []), chosenStar.id],
      lastDrawTimestamp: Date.now(),
      todayHistory: [historyRecord, ...(prev.todayHistory || [])]
    }));

    setActiveLetter(historyRecord);

    // Gửi yêu cầu trừ 1 ngôi sao vào ô dùng chung trên Sheet 'StarCounter'
    if (GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) {
      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'draw_star' })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.remainingStars === 'number') {
            updateState((prev) => ({
              ...prev,
              sharedRemainingStars: Math.max(0, data.remainingStars)
            }));
          }
        })
        .catch(() => {});
    }
  };

  // Copy quote from Letter Modal
  const handleCopyQuote = () => {
    if (!activeLetter) return;
    const textToCopy = `"${activeLetter.text}"`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(
        () => showToast('📋 Đã sao chép lời chúc vào bộ nhớ tạm!'),
        () => fallbackCopy(textToCopy)
      );
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('📋 Đã sao chép thành công!');
    } catch (e) {
      showToast('⚠️ Không thể sao chép tự động.');
    }
    document.body.removeChild(ta);
  };

  // Handle Wish Submission in Footer (1 per device per day)
  const handleWishSubmit = (e) => {
    e.preventDefault();
    if (appState.wishSubmittedToday) return;

    const trimmedMsg = wishMessage.trim();
    if (!trimmedMsg) {
      setWishError(true);
      return;
    }
    setWishError(false);

    const finalNickname = nickname.trim().length > 0 ? nickname.trim() : 'Người lạ';
    const now = new Date();
    const timeStr =
      'Hôm nay, ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    const newWishRow = {
      id: 'WISH-' + Date.now(),
      timestamp: timeStr,
      nickname: finalNickname,
      mood: wishMood || 'all',
      message: trimmedMsg,
      approved: false
    };

    updateState((prev) => ({
      ...prev,
      wishSubmittedToday: true,
      sheetWishes: [newWishRow, ...(prev.sheetWishes || [])]
    }));

    if (GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) {
      fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'submit_wish',
          ...newWishRow
        })
      }).catch(() => {});
    }

    setNickname('');
    setWishMessage('');
  };

  const activeMoodCfg = appState.selectedMood ? MOOD_CONFIG[appState.selectedMood] : null;
  const historyList = appState.todayHistory || [];

  return (
    <div className="min-h-screen flex flex-col justify-between text-[#593A47] bg-[#FFF6FA] selection:bg-pink-200 selection:text-[#593A47] overflow-x-hidden">
      {/* Inline Styles for Kawaii Borders & Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap');
        .kawaii-font {
          font-family: 'Quicksand', sans-serif;
          background-image:
            radial-gradient(#FFD1E1 1.5px, transparent 1.5px),
            radial-gradient(#CBEBFF 1.5px, #FFF6FA 1.5px);
          background-size: 36px 36px;
          background-position: 0 0, 18px 18px;
        }
        .kawaii-card {
          background: #FFFFFF;
          border: 3.5px solid #593A47;
          border-radius: 28px;
          box-shadow: 0 8px 0 #593A47, 0 14px 24px rgba(255, 133, 169, 0.18);
        }
        .kawaii-card-sm {
          background: #FFFFFF;
          border: 3px solid #593A47;
          border-radius: 22px;
          box-shadow: 0 5px 0 #593A47;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        }
        .kawaii-card-sm:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 0 #593A47;
        }
        .kawaii-btn {
          border: 3px solid #593A47;
          border-radius: 9999px;
          box-shadow: 0 5px 0 #593A47;
          transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          user-select: none;
        }
        .kawaii-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 7px 0 #593A47;
        }
        .kawaii-btn:active:not(:disabled) {
          transform: translateY(3px);
          box-shadow: 0 2px 0 #593A47;
        }
        .mood-btn {
          border: 3px solid #593A47;
          border-radius: 24px;
          box-shadow: 0 5px 0 #593A47;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mood-btn:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 9px 0 #593A47;
        }
        .mood-btn.selected {
          transform: translateY(-5px) scale(1.06);
          box-shadow: 0 9px 0 #593A47, 0 0 0 5px rgba(255, 133, 169, 0.45);
        }
        .letter-paper {
          background-color: #FFFDF7;
          background-image: repeating-linear-gradient(
            transparent,
            transparent 31px,
            #F5E1EA 31px,
            #F5E1EA 32px
          );
          border: 3.5px solid #593A47;
          border-radius: 24px;
          box-shadow: 0 10px 0 #593A47, 0 20px 40px rgba(89, 58, 71, 0.3);
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes jarWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-6deg) scale(1.04); }
          40% { transform: rotate(6deg) scale(1.06); }
          60% { transform: rotate(-4deg) scale(1.04); }
          80% { transform: rotate(4deg) scale(1.02); }
        }
        .animate-float {
          animation: floatSlow 4s ease-in-out infinite;
        }
        .jar-interactive:hover {
          animation: jarWiggle 0.75s ease-in-out infinite;
        }
        .jar-shaking {
          animation: jarWiggle 0.45s ease-in-out 2;
        }
      `}</style>

      <div className="kawaii-font min-h-screen flex flex-col justify-between">
        {/* TOP HEADER */}
        <header className="w-full bg-white/90 backdrop-blur-md border-b-[3px] border-[#593A47] sticky top-0 z-30 px-3 sm:px-6 py-2.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE4EE] border-[2.5px] border-[#593A47] flex items-center justify-center shadow-[0_3px_0_#593A47]">
                <svg className="w-6 h-6" viewBox="0 0 36 36" fill="none">
                  <path
                    d="M18 3L22.2 12.2L32.2 13.4L24.8 20.3L26.8 30.2L18 25.3L9.2 30.2L11.2 20.3L3.8 13.4L13.8 12.2L18 3Z"
                    fill="#FFD166"
                    stroke="#593A47"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="14.5" cy="16.5" r="1.5" fill="#593A47" />
                  <circle cx="21.5" cy="16.5" r="1.5" fill="#593A47" />
                  <path d="M16 20C16.8 21 19.2 21 20 20" stroke="#593A47" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#593A47] block leading-none">
                  Thị Trấn Sao Bông
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* FLOATING RIGHT ICON TO SLIDE IN RIGHT SIDEBAR ("Thẻ Sao May Mắn Đã Mở Hôm Nay") */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Mở Thẻ Sao May Mắn Đã Mở Hôm Nay"
          title="Thẻ Sao May Mắn Đã Mở Hôm Nay"
          className="kawaii-btn fixed right-3 sm:right-5 bottom-10 md:bottom-auto md:top-20 z-30 w-12 h-12 bg-[#FFF3B0] hover:bg-[#FFE885] text-[#593A47] flex items-center justify-center"
        >
          <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none">
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
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#FF6B9D] border-2 border-[#593A47] text-white font-extrabold text-[11px] flex items-center justify-center leading-none">
            {historyList.length}
          </span>
        </button>

        {/* MAIN CONTENT */}
        <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12 flex-1 flex flex-col gap-8">
          {/* 1. MOOD SELECTOR SECTION */}
          <section
            ref={moodSelectorRef}
            className="kawaii-card p-5 sm:p-8 relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] to-[#FFF0F6]"
          >
            <div className="flex flex-col items-center text-center relative z-10">
              {/* Original Kawaii Fluffy Star Mascot ("Bé Sao Bông") */}
              <div className="animate-float mb-2">
                <svg className="w-32 h-28 sm:w-36 sm:h-32" viewBox="0 0 160 140" fill="none">
                  {/* Soft Fluffy Cloud Halo Behind Star */}
                  <path
                    d="M34 114H126C139 114 148 105 148 93C148 83 140 74 130 72C125 57 109 47 80 47C51 47 35 57 30 72C20 74 12 83 12 93C12 105 21 114 34 114Z"
                    fill="#FFFDF9"
                    stroke="#593A47"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                  {/* Chubby Rounded Kawaii 5-Point Star Body */}
                  <path
                    d="M80 10C84 10 87 13 90 20L99 40L121 43C128 44 131 49 126 55L110 70L114 92C115 99 110 104 103 100L80 89L57 100C50 104 45 99 46 92L50 70L34 55C29 49 32 44 39 43L61 40L70 20C73 13 76 10 80 10Z"
                    fill="#FFE066"
                    stroke="#593A47"
                    strokeWidth="4.2"
                    strokeLinejoin="round"
                  />
                  {/* Star Glossy Highlight */}
                  <path
                    d="M74 24L67 39"
                    stroke="#FFF9DB"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Cute Pastel Pink Ribbon Bow on Star */}
                  <path
                    d="M92 27C88 20 96 14 102 21L105 26L100 31C93 34 88 31 92 27Z"
                    fill="#FF6B9D"
                    stroke="#593A47"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M118 27C122 20 114 14 108 21L105 26L110 31C117 34 122 31 118 27Z"
                    fill="#FF6B9D"
                    stroke="#593A47"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <circle cx="105" cy="26" r="4.2" fill="#FFF3B0" stroke="#593A47" strokeWidth="2.5" />
                  {/* Kawaii Sparkling Eyes & Rosy Cheeks */}
                  <circle cx="66" cy="58" r="4.8" fill="#593A47" />
                  <circle cx="64.5" cy="56.5" r="1.7" fill="#FFFFFF" />
                  <circle cx="94" cy="58" r="4.8" fill="#593A47" />
                  <circle cx="92.5" cy="56.5" r="1.7" fill="#FFFFFF" />
                  <ellipse cx="55" cy="64" rx="6.5" ry="3.8" fill="#FF85A9" />
                  <ellipse cx="105" cy="64" rx="6.5" ry="3.8" fill="#FF85A9" />
                  {/* Cute Happy Smile */}
                  <path
                    d="M74 63C76 67.5 84 67.5 86 63"
                    stroke="#593A47"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  {/* Little Floating Mini Sparkles */}
                  <path
                    d="M24 30L26.5 35.5L32 38L26.5 40.5L24 46L21.5 40.5L16 38L21.5 35.5L24 30Z"
                    fill="#FFB8D0"
                    stroke="#593A47"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M138 34L140 38.5L144.5 40.5L140 42.5L138 47L136 42.5L131.5 40.5L136 38.5L138 34Z"
                    fill="#A8F0CB"
                    stroke="#593A47"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFE4EE] border-2 border-[#593A47] text-xs font-extrabold text-[#593A47] mb-2">
                🎀 Trạm Chữa Lành Tâm Hồn
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#593A47] tracking-tight mb-6">
                Ngày hôm nay của bạn thế nào?
              </h1>

              {/* 5 SMILE MOOD BUTTONS */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 w-full max-w-3xl">
                {Object.values(MOOD_CONFIG).map((m, idx) => {
                  const isSelected = appState.selectedMood === m.id;
                  const extraSpan = idx === 4 ? 'col-span-2 sm:col-span-1' : '';
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMood(m.id)}
                      style={{ backgroundColor: m.cardBg }}
                      className={`mood-btn p-3.5 flex flex-col items-center gap-2 relative ${extraSpan} ${
                        isSelected ? 'selected' : ''
                      }`}
                    >
                      <MoodSmileSvg mood={m.id} />
                      <div className="text-center">
                        <div className="font-extrabold text-sm sm:text-base text-[#593A47]">{m.shortLabel}</div>
                        <div className="text-[11px] font-bold text-[#8C6575]">{m.subLabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Cooldown Banner */}
              {remainingCooldownMs > 0 && (
                <div className="mt-5 w-full max-w-2xl bg-[#FFF3B0] border-[3px] border-[#593A47] rounded-2xl px-4 py-3 shadow-[0_4px_0_#593A47] flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <div className="font-extrabold text-sm text-[#593A47]">
                        Bạn đã nhận ngôi sao may mắn trong khung giờ này rồi!
                      </div>
                      <div className="text-xs font-semibold text-[#7D5867]">
                        Lượt chọn tâm trạng & mở sao tiếp theo sau:{' '}
                        <span className="font-extrabold text-[#D9386A] text-sm">
                          {formatDurationHMS(remainingCooldownMs)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-xs font-extrabold bg-white hover:bg-pink-50 px-3.5 py-1.5 rounded-full border-2 border-[#593A47] shrink-0 cursor-pointer"
                  >
                    Xem lại thẻ đã mở ➔
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* 2. STAR HOPE JAR SECTION */}
          <section
            ref={starJarRef}
            className="kawaii-card p-5 sm:p-8 bg-gradient-to-b from-[#FFFFFF] via-[#FFF9FC] to-[#FFF2F7] relative"
          >
            {!activeMoodCfg ? (
              /* Prompt shown before mood is selected */
              <div className="py-8 px-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-[#FFF3B0] border-[3px] border-[#593A47] shadow-[0_4px_0_#593A47] flex items-center justify-center text-3xl mb-3 animate-float">
                  🌟
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#593A47] mb-3">
                  Hộp Ngôi Sao Hy Vọng đang chờ bạn đánh thức!
                </h2>
                <button
                  type="button"
                  onClick={handleScrollToMood}
                  className="kawaii-btn bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-extrabold text-sm sm:text-base px-6 py-2.5 inline-flex items-center gap-2"
                >
                  <span>tâm trạng của tôi</span>
                </button>
              </div>
            ) : (
              /* Star Jar & Mood Dialogue shown after selecting a mood */
              <div className="flex flex-col items-center text-center">
                {remainingCooldownMs <= 0 && (
                  <div className="w-full max-w-2xl bg-[#FFFDF7] border-[3px] border-[#593A47] rounded-3xl p-4 sm:p-5 shadow-[0_6px_0_#593A47] relative mb-7">
                    <div className="flex items-start sm:items-center gap-3 text-left">
                      <div
                        style={{ backgroundColor: activeMoodCfg.badgeBg }}
                        className="w-12 h-12 rounded-2xl border-[2.5px] border-[#593A47] flex items-center justify-center text-2xl shrink-0 shadow-[0_3px_0_#593A47]"
                      >
                        {activeMoodCfg.emoji}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-extrabold text-sm sm:text-base text-[#D9386A]">
                            Tâm trạng bạn chọn: {activeMoodCfg.label}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFE4EE] border border-[#593A47]">
                            Thông điệp từ Bé Sao Bông
                          </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-[#593A47] leading-relaxed">
                          {activeMoodCfg.dialogue}
                        </p>
                      </div>
                    </div>
                    <div className="w-5 h-5 bg-[#FFFDF7] border-r-[3px] border-b-[3px] border-[#593A47] rotate-45 absolute -bottom-3 left-1/2 -translate-x-1/2" />
                  </div>
                )}

                {/* Remaining Star Counter */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 bg-[#FFF3B0] border-[3px] border-[#593A47] rounded-full px-4 py-1.5 shadow-[0_4px_0_#593A47]">
                    <span className="text-lg">🌟</span>
                    <span className="font-extrabold text-sm sm:text-base text-[#593A47]">
                      Ngôi sao trong lọ:{' '}
                      <span className="text-[#D9386A] text-lg">{remainingStarsCount.toLocaleString('vi-VN')}</span>
                    </span>
                  </div>
                </div>

                {/* Interactive Star Hope Jar */}
                <div className="relative my-2 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={handleDrawStar}
                    aria-label="Chạm vào Hộp Ngôi Sao Hy Vọng để nhận lời chúc ngẫu nhiên"
                    className="group relative focus:outline-none jar-interactive transition-transform duration-300 cursor-pointer"
                  >
                    <svg
                      className={`w-60 h-72 sm:w-68 sm:h-80 drop-shadow-md ${isJarShaking ? 'jar-shaking' : ''}`}
                      viewBox="0 0 240 280"
                      fill="none"
                    >
                      <rect x="74" y="16" width="92" height="26" rx="10" fill="#E6A168" stroke="#593A47" strokeWidth="4.5" />
                      <path d="M82 24H158" stroke="#C97E43" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
                      <rect x="64" y="36" width="112" height="18" rx="9" fill="#E8F7FF" stroke="#593A47" strokeWidth="4.5" />
                      <path
                        d="M68 54H172C194 54 206 74 206 100V216C206 244 184 262 156 262H84C56 262 34 244 34 216V100C34 74 46 54 68 54Z"
                        fill="#F2FBFF"
                        fillOpacity="0.88"
                        stroke="#593A47"
                        strokeWidth="5"
                      />
                      <path d="M50 86V196" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
                      <path d="M50 214V222" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" opacity="0.85" />

                      <g transform="translate(56, 195) rotate(-12)">
                        <path
                          d="M22 2L28 14L41 16L31 25L34 38L22 32L10 38L13 25L3 16L16 14L22 2Z"
                          fill="#FF85A9"
                          stroke="#593A47"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        <circle cx="18" cy="20" r="1.8" fill="#593A47" />
                        <circle cx="26" cy="20" r="1.8" fill="#593A47" />
                        <path d="M20 24C21 25.5 23 25.5 24 24" stroke="#593A47" strokeWidth="2" strokeLinecap="round" />
                      </g>
                      <g transform="translate(105, 202) rotate(8)">
                        <path
                          d="M24 2L30 15L44 17L34 27L36 41L24 34L12 41L14 27L4 17L18 15L24 2Z"
                          fill="#FFD166"
                          stroke="#593A47"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        <circle cx="20" cy="21" r="1.8" fill="#593A47" />
                        <circle cx="28" cy="21" r="1.8" fill="#593A47" />
                        <path d="M22 25C23 26.5 25 26.5 26 25" stroke="#593A47" strokeWidth="2" strokeLinecap="round" />
                      </g>
                      <g transform="translate(144, 184) rotate(-18)">
                        <path
                          d="M20 2L26 13L38 15L29 24L31 36L20 30L9 36L11 24L2 15L14 13L20 2Z"
                          fill="#80ED99"
                          stroke="#593A47"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        <circle cx="16.5" cy="19" r="1.6" fill="#593A47" />
                        <circle cx="23.5" cy="19" r="1.6" fill="#593A47" />
                      </g>
                      <g transform="translate(72, 152) rotate(15)">
                        <path
                          d="M22 2L28 14L41 16L31 25L34 38L22 32L10 38L13 25L3 16L16 14L22 2Z"
                          fill="#C792FF"
                          stroke="#593A47"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        <circle cx="18" cy="20" r="1.8" fill="#593A47" />
                        <circle cx="26" cy="20" r="1.8" fill="#593A47" />
                        <path d="M20 24C21 25.5 23 25.5 24 24" stroke="#593A47" strokeWidth="2" strokeLinecap="round" />
                      </g>
                      <g transform="translate(122, 148) rotate(-8)">
                        <path
                          d="M22 2L28 14L41 16L31 25L34 38L22 32L10 38L13 25L3 16L16 14L22 2Z"
                          fill="#7BDFF2"
                          stroke="#593A47"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        <circle cx="18" cy="20" r="1.8" fill="#593A47" />
                        <circle cx="26" cy="20" r="1.8" fill="#593A47" />
                        <path d="M20 24C21 25.5 23 25.5 24 24" stroke="#593A47" strokeWidth="2" strokeLinecap="round" />
                      </g>
                      <g transform="translate(96, 102) rotate(4)">
                        <path
                          d="M24 2L30 15L44 17L34 27L36 41L24 34L12 41L14 27L4 17L18 15L24 2Z"
                          fill="#FFE066"
                          stroke="#593A47"
                          strokeWidth="3.4"
                          strokeLinejoin="round"
                        />
                        <circle cx="20" cy="21" r="2" fill="#593A47" />
                        <circle cx="28" cy="21" r="2" fill="#593A47" />
                        <ellipse cx="16" cy="24" rx="2.5" ry="1.5" fill="#FF85A9" />
                        <ellipse cx="32" cy="24" rx="2.5" ry="1.5" fill="#FF85A9" />
                        <path d="M22 25C23 26.5 25 26.5 26 25" stroke="#593A47" strokeWidth="2.2" strokeLinecap="round" />
                      </g>

                      <path d="M64 52H176" stroke="#FF6B9D" strokeWidth="8" strokeLinecap="round" />
                      <path
                        d="M120 52C102 34 80 42 88 58C94 68 112 60 120 52Z"
                        fill="#FF85A9"
                        stroke="#593A47"
                        strokeWidth="3.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M120 52C138 34 160 42 152 58C146 68 128 60 120 52Z"
                        fill="#FF85A9"
                        stroke="#593A47"
                        strokeWidth="3.8"
                        strokeLinejoin="round"
                      />
                      <path d="M114 56L102 80" stroke="#FF85A9" strokeWidth="6" strokeLinecap="round" />
                      <path d="M126 56L138 80" stroke="#FF85A9" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="120" cy="52" r="7" fill="#FFD166" stroke="#593A47" strokeWidth="3.5" />

                      <rect x="68" y="80" width="104" height="30" rx="12" fill="#FFFDF7" stroke="#593A47" strokeWidth="3.2" />
                      <text x="120" y="100" textAnchor="middle" fill="#593A47" fontSize="13" fontWeight="800">
                        HOPE STARS ✨
                      </text>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleDrawStar}
                    className="kawaii-btn mt-2 bg-gradient-to-r from-[#FF85A9] to-[#FFA6C1] hover:from-[#FF709A] hover:to-[#FF94B4] text-[#593A47] font-extrabold text-base sm:text-lg px-7 py-3.5 flex items-center gap-2.5"
                  >
                    <span>🧘</span>
                    <span>
                      {remainingCooldownMs > 0
                        ? `Đang nghỉ 4h (${formatDurationHMS(remainingCooldownMs)})`
                        : 'Chạm vào đây hoặc Lọ Sao để mở bức thư may mắn!'}
                    </span>
                  </button>

                </div>
              </div>
            )}
          </section>
        </main>

        {/* 3. RIGHT SLIDE-IN SIDEBAR: TODAY'S OPENED STAR CARDS */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-[#593A47]/45 backdrop-blur-xs transition-opacity"
          />
        )}
        <aside
          aria-label="Thẻ Sao May Mắn Đã Mở Hôm Nay"
          className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-[#FFFDF9] border-l-[3.5px] border-[#593A47] shadow-[-10px_0_30px_rgba(89,58,71,0.2)] transform transition-transform duration-300 ease-in-out flex flex-col ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 sm:p-5 bg-[#FFF3B0] border-b-[3px] border-[#593A47] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-white border-[2.5px] border-[#593A47] flex items-center justify-center text-lg shadow-[0_3px_0_#593A47]">
                🗂️
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#593A47] leading-tight">
                  Thẻ Sao May Mắn Đã Mở Hôm Nay
                </h2>
                <span className="text-xs font-bold text-[#7D5867]">
                  Đã mở: {historyList.length} ngôi sao hôm nay
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Đóng thanh bên"
              className="kawaii-btn w-9 h-9 bg-white hover:bg-[#FFE4EE] text-[#593A47] font-extrabold text-base flex items-center justify-center shrink-0"
            >
              ✕
            </button>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto flex-1">
            {historyList.length === 0 ? (
              <div className="py-10 px-4 text-center bg-[#FFF6FA] border-[2.5px] border-dashed border-[#E5B8C8] rounded-2xl">
                <div className="text-3xl mb-2">🌠</div>
                <p className="font-extrabold text-sm sm:text-base text-[#593A47]">
                  Hôm nay bạn chưa mở ngôi sao nào cả!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {historyList.map((item, idx) => {
                  const cfg = MOOD_CONFIG[item.mood] || MOOD_CONFIG.happy;
                  return (
                    <button
                      key={item.id + '-' + idx}
                      type="button"
                      onClick={() => setActiveLetter(item)}
                      className="kawaii-card-sm p-4 text-left flex flex-col justify-between gap-3 bg-gradient-to-br from-white to-[#FFF6FA] cursor-pointer focus:outline-none w-full"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            style={{ backgroundColor: cfg.badgeBg }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border-2 border-[#593A47] text-xs font-extrabold"
                          >
                            <span>{cfg.emoji}</span>
                            <span>{cfg.shortLabel}</span>
                          </span>
                          <span className="text-[11px] font-extrabold text-[#8C6575]">🕒 {item.timeStr}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#593A47] line-clamp-3 leading-relaxed">
                          &ldquo;{item.text}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-[#F0DCE5] text-[11px] font-extrabold text-[#D9386A]">
                        <span>{item.fromSheet ? `💌 Từ: ${item.sender}` : '🌟 Sao Bầu Trời'}</span>
                        <span className="underline">Mở lại thư ➔</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* 4. FOOTER: SEND A WISH TO THE SKY */}
        <footer className="w-full bg-gradient-to-b from-[#FFEBF2] to-[#FFDCE8] border-t-[3.5px] border-[#593A47] pt-8 pb-10 px-4 sm:px-6 mt-auto">
          <div className="max-w-3xl mx-auto">
            <div className="kawaii-card p-5 sm:p-7 bg-[#FFFDF9] relative">
              {!appState.wishSubmittedToday ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#EFE5FF] border-[2.5px] border-[#593A47] flex items-center justify-center text-xl shadow-[0_3px_0_#593A47]">
                      📨
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#593A47]">
                        Gửi Lời Chúc Đến Bầu Trời Sao
                      </h2>
                    </div>
                  </div>

                  <form onSubmit={handleWishSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label
                          htmlFor="wishNicknameInput"
                          className="block text-xs sm:text-sm font-extrabold text-[#593A47] mb-1"
                        >
                          Tên hoặc Nickname của bạn <span className="font-semibold text-[#8C6575]">(Không bắt buộc)</span>
                        </label>
                        <input
                          id="wishNicknameInput"
                          type="text"
                          maxLength={40}
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border-[2.5px] border-[#593A47] text-sm font-bold text-[#593A47] focus:outline-none focus:ring-4 focus:ring-pink-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="wishMoodTagSelect"
                          className="block text-xs sm:text-sm font-extrabold text-[#593A47] mb-1"
                        >
                          Dành tặng cho tâm trạng nào?
                        </label>
                        <select
                          id="wishMoodTagSelect"
                          value={wishMood}
                          onChange={(e) => setWishMood(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border-[2.5px] border-[#593A47] text-sm font-bold text-[#593A47] focus:outline-none focus:ring-4 focus:ring-pink-200"
                        >
                          <option value="all">🌈 Tất cả mọi tâm trạng</option>
                          <option value="bad">🌧️ Đang buồn / Tệ (Cần an ủi)</option>
                          <option value="tired">☁️ Đang mệt mỏi (Cần nạp năng lượng)</option>
                          <option value="normal">🍀 Ngày bình yên (Nhẹ nhàng)</option>
                          <option value="excited">💖 Đang hào hứng (Truyền cảm hứng)</option>
                          <option value="happy">✨ Đang hạnh phúc (Nhân đôi niềm vui)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="wishContentTextarea"
                          className="block text-xs sm:text-sm font-extrabold text-[#593A47]"
                        >
                          Nội dung câu chúc của bạn <span className="text-[#D9386A]">*</span>
                        </label>
                        <span className="text-xs font-bold text-[#8C6575]">{wishMessage.length} / 220 ký tự</span>
                      </div>
                      <textarea
                        id="wishContentTextarea"
                        rows={3}
                        maxLength={220}
                        required
                        value={wishMessage}
                        onChange={(e) => {
                          setWishMessage(e.target.value);
                          if (e.target.value.trim().length > 0) setWishError(false);
                        }}
                        placeholder="Viết một lời chúc ngắn gọn, ấm áp gửi đến những tâm hồn đồng điệu..."
                        className="w-full p-4 rounded-2xl bg-white border-[2.5px] border-[#593A47] text-sm font-bold text-[#593A47] placeholder-[#B08D9B] focus:outline-none focus:ring-4 focus:ring-pink-200 resize-none"
                      />
                      {wishError && (
                        <p className="text-xs font-extrabold text-[#D9386A] mt-1.5">
                          ⚠️ Vui lòng nhập nội dung lời chúc trước khi gửi nhé!
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="submit"
                        className="kawaii-btn bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-extrabold text-sm sm:text-base px-6 py-2.5 flex items-center gap-2"
                      >
                        <span>Gửi lời chúc</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="py-6 px-4 rounded-2xl bg-gradient-to-r from-[#FFF3B0] via-[#FFE4EE] to-[#E2F9F0] border-[3px] border-[#593A47] text-center">
                  <div className="text-4xl mb-2">🌈✨</div>
                  <p className="text-lg sm:text-xl font-extrabold text-[#593A47]">
                    Cám ơn bạn đã gửi lời chúc đến bầu trời sao
                  </p>
                </div>
              )}
            </div>
          </div>
        </footer>

        {/* LETTER MODAL */}
        {activeLetter && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveLetter(null);
            }}
            className="fixed inset-0 z-50 bg-[#593A47]/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="letter-paper w-full max-w-lg p-6 sm:p-8 relative">
              <button
                type="button"
                onClick={() => setActiveLetter(null)}
                aria-label="Đóng bức thư"
                className="kawaii-btn w-10 h-10 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] font-extrabold text-lg flex items-center justify-center absolute -top-4 -right-3"
              >
                ✕
              </button>

              <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b-[2.5px] border-[#593A47]">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF3B0] border-[2.5px] border-[#593A47] flex items-center justify-center text-2xl shadow-[0_3px_0_#593A47]">
                    💌
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-[#D9386A]">
                      Bức Thư Ngôi Sao Hy Vọng
                    </div>
                    <div className="text-xs font-bold text-[#8C6575]">
                      Ngôi sao #{activeLetter.starNumber || 2000} • Tâm trạng:{' '}
                      {(MOOD_CONFIG[activeLetter.mood] || MOOD_CONFIG.happy).shortLabel}{' '}
                      {(MOOD_CONFIG[activeLetter.mood] || MOOD_CONFIG.happy).emoji}
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-[#FFE4EE] border-2 border-dashed border-[#593A47] text-[11px] font-extrabold text-[#593A47]">
                  {activeLetter.fromSheet ? '✨ Lời chúc từ Bầu Trời' : '✨ Ngôi Sao Hy Vọng'}
                </div>
              </div>

              <div className="text-sm font-extrabold text-[#593A47] mb-3">
                Gửi bạn nhỏ đáng yêu của ngày hôm nay,
              </div>

              <div className="my-4 py-4 px-5 rounded-2xl bg-white/90 border-[2.5px] border-[#593A47] shadow-inner">
                <blockquote className="text-base sm:text-lg font-extrabold text-[#593A47] leading-relaxed text-center">
                  &ldquo;{activeLetter.text}&rdquo;
                </blockquote>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#7D5867] mt-5 pt-3 border-t-2 border-dashed border-[#E5C5D2]">
                <span>🕒 Mở lúc {activeLetter.timeStr} hôm nay</span>
                <span className="text-[#593A47]">Người gửi: {activeLetter.sender || 'Người lạ'}</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyQuote}
                  className="kawaii-btn bg-[#E2F9F0] hover:bg-[#C7F2E0] text-[#593A47] font-extrabold text-xs sm:text-sm px-4 py-2"
                >
                  📋 Sao chép lời chúc
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLetter(null)}
                  className="kawaii-btn bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-extrabold text-xs sm:text-sm px-5 py-2"
                >
                  Cất vào tim 💖
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST BANNER */}
        {toastMsg && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#FFF3B0] border-[3px] border-[#593A47] rounded-2xl px-4 py-3 shadow-[0_6px_0_#593A47] font-extrabold text-xs sm:text-sm text-[#593A47] max-w-sm">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}