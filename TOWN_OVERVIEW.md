# 🏘️ TỔNG QUAN DỰ ÁN: THỊ TRẤN SAO BÔNG (TOWN OVERVIEW)

> [!NOTE]
> Tài liệu này là **Nguồn Chân Lý Duy Nhất (Single Source of Truth)** lưu trữ toàn bộ bối cảnh, tinh thần, hệ thống nhân vật, cơ chế gameplay và định hướng phát triển của **Thị Trấn Sao Bông**. Mọi tính năng hoặc nhân vật mới khi phát triển đều phải bám sát và cập nhật vào tài liệu này.

---

## 1. TINH THẦN & TRIẾT LÝ CỐT LÕI (CORE PHILOSOPHY)
* **Tên dự án**: Thị Trấn Sao Bông (Sao Bông Town).
* **Thể loại**: Web App Nhập Vai Đi Dạo Cozy 2.5D & Chữa Lành Tâm Hồn (*Cozy Healing / Gamified Mindfulness*).
* **Phong cách thẩm mỹ**: Kawaii Pastel 2.5D, đường nét mềm mại viền nâu hạt dẻ (`#593A47`), tông màu pastel ngọt ngào, ánh sáng ấm cúng.
* **Sứ mệnh**: Tạo nên một thị trấn nhỏ yên bình nơi góc đồi, nơi người dùng trút bỏ áp lực cuộc sống, nhận thông điệp động viên mỗi ngày, tận hưởng âm nhạc Lofi, hít thở nhịp nhàng và nuôi dưỡng tâm hồn qua những câu chuyện ngô nghê, ấm áp.

---

## 2. BẢN ĐỒ BỐI CẢNH & CƠ CHẾ GAMEPLAY SƯỜN ĐỒI 2.5D

### 2.1. Không gian Sườn Đồi & Phối Cảnh 2.5D
* Bối cảnh là một con đường lát đá cuội uốn lượn trải dài từ đỉnh đồi cỏ xanh xuống chân đồi.
* Tỷ lệ phối cảnh 2.5D: Thu nhỏ ở xa trên đỉnh đồi (`scale = 0.70`), phóng to dần khi đi xuống chân đồi (`scale = 1.18`).
* Thảm cỏ hai bên đường có các loài thú nhỏ sinh sống: Bé Corgi, Bé Thỏ Bông, Bé Mèo Tam Thể, Bé Cừu Mây.

### 2.2. Cơ chế Điều Khiển & Nhập Vai (Cozy Walk)
* **Phương thức di chuyển**: Cụm phím `W/A/S/D`, 4 phím mũi tên `↑/↓/←/→`, cụm phím điều hướng ảo (Mini D-Pad) hoặc chạm/click trực tiếp trên mặt cỏ.
* **Game Loop mượt mà 60 FPS**: Nhân vật đứng yên chỉ thở nhẹ (Idle Breath), bước chân nhịp nhàng chỉ khi di chuyển.
* **Ranh giới vật lý (Colliders)**:
  * Ranh giới chân trời uốn lượn theo khung sườn đồi, ngăn không cho nhân vật trôi lên bầu trời.
  * Hộp va chạm tách biệt hình chữ L ôm sát khung từng ngôi nhà và bảng tên gỗ, không bị tường tàng hình cản trở.

### 2.3. Tự Động Mở Cửa & Trò Chuyện (Proximity Detection)
* Khi nhân vật đi dạo đến gần thềm bất kỳ ngôi nhà nào, cánh cửa gỗ tự động mở rộng, nhân vật cư dân bước ra vẫy chào.
* Hộp thoại trò chuyện nổi ở đáy màn hình (`Bottom - Center`) với hiệu ứng chữ chạy gõ phím (*Typewriter*), avatar nói chuyện và phím tắt `Space` để tương tác nhanh.

### 2.4. Bầu Trời Thời Gian Thực 4 Khung Giờ (Dynamic Sky)
* Tự động đồng bộ theo thời gian thực ngoài đời:
  * 🌅 **Buổi sáng (05:00 - 10:59)**: Bình minh dịu nhẹ, nắng sớm trong veo.
  * ☀️ **Trưa chiều (11:00 - 16:59)**: Nắng ấm rạng rỡ, mây bồng bềnh.
  * 🌆 **Hoàng hôn (17:00 - 18:59)**: Ánh chiều tà cam hồng ấm áp.
  * 🌌 **Ban đêm (19:00 - 04:59)**: Trời đêm lung linh ngàn sao, trăng sáng và đom đóm lập lòe.
* Có thể chuyển đổi thủ công Ngày / Đêm bằng kỹ năng của Chú Trăng Khuyết.

### 2.5. Các Điểm Đến Trung Tâm
* 🏡 **Ngôi Nhà Của Bạn (Đỉnh đồi)**: Căn nhà riêng của người chơi. Nơi đăng ký tên cư dân, lưu giữ số tim nhận được, xem Thẻ Cư Dân và bộ sưu tập Huy Hiệu Danh Dự.
* 🌟 **Lọ Sao 2.000 Điều Ước (Đài Phun Sao Trung Tâm)**: Lọ thủy tinh khổng lồ chứa 2.000 điều ước may mắn. Mỗi ngày người chơi được mở 1 điều ước chữa lành, tự động đếm ngược làm mới vào lúc 00:00.

---

## 3. HỆ THỐNG CƯ DÂN THỊ TRẤN (TOWN RESIDENTS)

> [!IMPORTANT]
> Toàn bộ danh xưng cư dân đã được phân tầng đa thế hệ ấm cúng: Bác, Chú, Cô, Chị, Anh, Bà, Bé.
> Nhân vật người chơi có hệ thống Sprite Đa Trạng Thái (`user_character`, `user_hardworking`, `user_sleepy`, `user_happy`).

```text
                        [ĐỈNH ĐỒI - SCALE 0.70]
                   🏡 Ngôi Nhà Của Bạn (user_house)
                 ────────────────────────────────────
   ⭐ Bé Sao Bông (01 - star)          │  ☁️ Bác Mây Xốp (03 - cloud)
   🌙 Chú Trăng Khuyết (05 - moon)     │  🌈 Chị Cầu Vồng (06 - rainbow)
   🍵 Chị Ngân Hà (07 - nebula)        │  🥐 Cô Nắng Mai (02 - sun)
   💌 Bé Sao Băng (04 - shooting_star) │  ⚡ Anh Tia Chớp (08 - spark)
                 ────── [KHU PHỐ MỞ RỘNG] ──────────
   💧 Bé Sương Mai (09 - dewdrop)      │  🍃 Anh Gió Nhẹ (10 - breeze)
   ❄️ Cô Tuyết Bông (11 - snowflake)   │  🌌 Chị Cực Quang (12 - aurora)
   🪐 Bác Sao Thổ (13 - saturn)        │  萤 Bé Đom Đóm (14 - firefly)
   🌇 Chú Hoàng Hôn (15 - sunset)      │  🌟 Bà Sao Bắc Đẩu (16 - north_star)
                 ────────────────────────────────────
                        [CHÂN ĐỒI CỎ - SCALE 1.18]
```

### 3.1. Nhân Vật Người Chơi ("Bạn Nhỏ Đáng Yêu")
* **Tên hiển thị mặc định**: `"Bạn nhỏ đáng yêu"` (hoặc tên cư dân đã đăng ký tại Tòa Thị Chính).
* **4 Trạng Thái Sprite (`PLAYER_STATE_SPRITES`)**:
  * `user_character`: Trạng thái đi dạo (`walk`) và đứng thở nhẹ (`idle`) mặc định trên sườn đồi.
  * `user_hardworking`: Trạng thái đeo kính tròn, cầm bút chì & sổ tay khi ghi chép nhật ký, điều biết ơn.
  * `user_sleepy`: Trạng thái đội mũ ngủ hồng pastel, ôm gối sao bông vào khung giờ đêm hoặc nghe âm thanh ru ngủ.
  * `user_happy`: Trạng thái cài hoa hồng phấn, nhảy chân sáo kèm nốt nhạc khi mở lọ sao hy vọng hoặc nhận thưởng.

### 3.2. Chi tiết 8 Cư Dân Hiện Tại (Số 01 – Số 08)

#### 1. ⭐ Bé Sao Bông (Đài Sao Hy Vọng • Số 01 Phố Sao Bông)
* **Tạo hình**: Ngôi sao chibi vàng pastel tròn xoe đội vương miện sao, cầm đũa phép.
* **Vai trò**: Linh vật đại diện chính của thị trấn, người gác Lọ Sao Hy Vọng.
* **Tính cách**: Ngây thơ, tươi vui, mang lại hy vọng và niềm tin mỗi ngày.
* **Kỹ năng chính**: **Phép Thuật Lọ Sao Hy Vọng** — Mở hộp sao may mắn và gửi gắm những lời nhắn chữa lành.

#### 2. 🥐 Cô Nắng Mai (Tiệm Bánh Bình Minh • Số 02 Phố Sao Bông)
* **Tạo hình**: Vầng mặt trời tròn trĩnh đeo tạp dề bánh mì, nướng bánh sừng bò thơm phức.
* **Vai trò**: Bếp trưởng tiệm bánh nướng ấm áp của thị trấn.
* **Tính cách**: Nồng hậu, cần mẫn, luôn dậy sớm nhất và quan tâm chăm sóc mọi người như người cô thân thương.
* **Kỹ năng chính**: **Mẻ Bánh Bình Minh** — Trao tặng chiếc bánh quy may mắn kèm 1 nhiệm vụ nhỏ tự yêu thương bản thân trong ngày.

#### 3. ☁️ Bác Mây Xốp (Tòa Thị Chính Mây Xốp • Số 03 Phố Sao Bông)
* **Tạo hình**: Cụm mây trắng bồng bềnh đội mũ chóp cao lịch thiệp, đeo kính tròn thông thái.
* **Vai trò**: Thị trưởng thị trấn, quản lý hộ tịch và chào đón cư dân mới.
* **Tính cách**: Điềm đạm, hiền từ, người bác cả đáng kính của cả thị trấn.
* **Kỹ năng chính**: **Thẻ Cư Dân & Bộ Huy Hiệu** — Đăng ký định danh cho Ngôi Nhà Của Bạn, thống kê số tim, quản lý danh hiệu và huy hiệu thành tích.

#### 4. 💌 Bé Sao Băng (Bưu Điện Sao Băng • Số 04 Phố Sao Bông)
* **Tạo hình**: Ngôi sao nhỏ đội mũ ca-nô bưu tá, bay vút ngang bầu trời mang theo túi thư.
* **Vai trò**: Bưu tá chuyển phát nhanh bầu trời sao.
* **Tính cách**: Nhanh nhẹn, nhiệt tình, thích lắng nghe những tâm tư gửi gắm qua thư từ.
* **Kỹ năng chính**: **Chuyển Phát Lời Chúc** — Đóng dấu tem sáp và phóng vút lá thư lời chúc của người chơi bay thẳng lên bầu trời sao.

#### 5. 🌙 Chú Trăng Khuyết (Đài Thiên Văn Trăng Khuyết • Số 05 Phố Sao Bông)
* **Tạo hình**: Vầng trăng lưỡi liềm đội mũ ngủ tím nhạt, tay cầm chiếc đèn bão lung linh.
* **Vai trò**: Nhà thiên văn học, người gác đêm & dệt giấc mơ cho thị trấn.
* **Tính cách**: Trầm tĩnh, sâu sắc, yêu thích sự tĩnh lặng và vẻ đẹp màn đêm.
* **Kỹ năng chính**: **Phép Thuật Giao Thừa Đêm Sao** — Thắp sáng đèn bão chuyển đổi bầu trời thị trấn sang Chế độ Trời Đêm lung linh bất kỳ lúc nào.

#### 6. 🌈 Chị Cầu Vồng (Đài Khí Tượng Cầu Vồng • Số 06 Phố Sao Bông)
* **Tạo hình**: Vòm cầu vồng bảy sắc rực rỡ, tay cầm cọ vẽ màu nước.
* **Vai trò**: MC chuyên gia khí tượng & phân tích cảm xúc thị trấn.
* **Tính cách**: Tươi tắn, yêu đời, nghệ sĩ, luôn nhìn thấy vẻ đẹp sau cơn mưa.
* **Kỹ năng chính**: **Dự Báo Thời Tiết Cảm Xúc** — Đo lường tỷ lệ nắng ấm, mây bình yên và số lời chúc đang bay trong thị trấn hôm nay.

#### 7. 🍵 Chị Ngân Hà (Tiệm Trà Tinh Vân • Số 07 Phố Sao Bông)
* **Tạo hình**: Cụm mây tinh vân tím hồng pastel bồng bềnh cầm tách trà hoa nghi ngút khói.
* **Vai trò**: Chủ tiệm trà tâm hồn, người lắng nghe và xoa dịu âu lo.
* **Tính cách**: Dịu dàng, thấu hiểu, giọng nói êm đềm như một người chị gái tâm sự.
* **Kỹ năng chính**: **Hương Trà Hít Thở 4-4-4 (60s)** — Dẫn dắt bài tập hít thở thiền định 60 giây (Hít vào 4s - Giữ 4s - Thở ra 4s) xua tan căng thẳng.

#### 8. 🎧 Anh Tia Chớp (Trạm Phát Sóng Lofi • Số 08 Phố Sao Bông)
* **Tạo hình**: Tia sét vàng neon ngộ nghĩnh đeo tai nghe headphone chụp tai lớn.
* **Vai trò**: DJ thị trấn & kỹ sư phát thanh năng lượng.
* **Tính cách**: Trẻ trung, hiện đại, phong cách, đam mê âm nhạc thư giãn.
* **Kỹ năng chính**: **Đài Nhạc Hộp Nhạc (Music Box Lofi)** — Bật/tắt các giai điệu du dương phát khắp con phố giúp làm việc và thư giãn tập trung.

### 3.3. Chi tiết 8 Cư Dân Mở Rộng (Số 09 – Số 16)

#### 9. 💧 Bé Sương Mai (Nhà Kính Sương Sớm • Số 09 Phố Sao Bông)
* **Tạo hình**: Giọt sương xanh mint pastel đội mũ lá sen, đeo bình tưới cây nhỏ xíu (`dewdrop`).
* **Vai trò**: Cô bé làm vườn hồn nhiên, tỉ mỉ, yêu từng mầm cây ngọn cỏ mỗi sớm mai.
* **Kỹ năng chính**: **Tưới Mầm Thói Quen (Mini Habit Tracker)** — Chọn tối đa 3 thói quen nhỏ mỗi ngày; hoàn thành tưới 1 giọt sương giúp hoa nở và cộng `+1 Tim`.

#### 10. 🍃 Anh Gió Nhẹ (Cối Xay Gió Bồ Công Anh • Số 10 Phố Sao Bông)
* **Tạo hình**: Làn gió xoáy xanh ngọc quàng khăn chong chóng sắc màu, tay cầm nhành hoa bồ công anh (`breeze`).
* **Vai trò**: Chàng nghệ sĩ du mục phóng khoáng, tự do, luôn biết cách làm nhẹ lòng người khác.
* **Kỹ năng chính**: **Thổi Bay Muộn Phiền (Worry Release)** — Viết ra 1 điều đang lo lắng; bấm *"Thổi bay"*, dòng chữ vỡ thành hàng chục cánh hoa bồ công anh bay vút lên trời biến mất.

#### 11. ❄️ Cô Tuyết Bông (Tiệm Kem Tuyết Bông • Số 11 Phố Sao Bông)
* **Tạo hình**: Bông tuyết 6 cánh xanh băng pha hồng phấn đeo găng len, cầm cây kem ốc quế (`snowflake`).
* **Vai trò**: Cô chủ tiệm kem ngọt ngào, hóm hỉnh, luôn giữ cho tâm trí mọi người mát lành.
* **Kỹ năng chính**: **Đóng Băng Khoảnh Khắc (Memory Crystal)** — Lưu giữ 1 khoảnh khắc vui vẻ trong ngày vào *"Viên Pha Lê Tuyết"* để xem lại trong tuần.

#### 12. 🌌 Chị Cực Quang (Rạp Chiếu Bóng Cực Quang • Số 12 Phố Sao Bông)
* **Tạo hình**: Dải lụa ánh sáng xanh lục – tím pastel uốn lượn cài nơ pha lê, cầm đèn chiếu sao (`aurora`).
* **Vai trò**: Đạo diễn ánh sáng mộng mơ, giàu trí tưởng tượng, người kể chuyện của thị trấn.
* **Kỹ năng chính**: **Sách Truyện Tranh Mỗi Ngày (Daily Comic Book)** — Mở quyển truyện tranh 3D lật trang mẩu truyện ngắn 4 khung hình, kèm nút gửi ý tưởng cho Gemini AI biên kịch.

#### 13. 🪐 Bác Sao Thổ (Thư Viện Vành Đai • Số 13 Phố Sao Bông)
* **Tạo hình**: Hành tinh tròn màu cam đào ấm áp có vành đai xoay quanh bụng, đeo kính tròn (`saturn`).
* **Vai trò**: Học giả uyên bác, điềm tĩnh, người lưu giữ ký ức và tri thức của cả thị trấn.
* **Kỹ năng chính**: **Tủ Sách Kỷ Niệm (Archive & Bookworm Badge)** — Kệ sách lưu trữ vĩnh viễn các số Truyện Tranh Mỗi Ngày và Thẻ Sao; tự động trao **Huy Hiệu Mọt Sách** khi sưu tầm đủ 7 truyện.

#### 14. 萤 Bé Đom Đóm (Vườn Đom Đóm Tĩnh Tâm • Số 14 Phố Sao Bông)
* **Tạo hình**: Đốm sáng vàng chanh – xanh non có đôi cánh tròn và đuôi phát sáng, tay ôm gối bông (`firefly`).
* **Vai trò**: Em út hay ngái ngủ, dịu hiền, luôn tỏa ánh sáng ấm áp bầu bạn cùng người thức khuya.
* **Kỹ năng chính**: **Đếm Sao Ru Ngủ (White Noise & Sleep Timer)** — Bộ trộn âm thanh trắng thư giãn (dế kêu đêm hè, mưa rơi trên mái hiên, củi tí tách) kèm hẹn giờ tắt (15/30/60 phút).

#### 15. 🌇 Chú Hoàng Hôn (Quán Cà Phê Ráng Chiều • Số 15 Phố Sao Bông)
* **Tạo hình**: Đám mây cam hồng chiều tà ấm áp đeo chiếc máy ảnh cổ điển trước ngực (`sunset`).
* **Vai trò**: Nhiếp ảnh gia hoài niệm, thích lắng nghe câu chuyện cuối ngày bên tách cacao nóng.
* **Kỹ năng chính**: **Lăng Kính Biết Ơn (3 Good Things Journal)** — Ghi nhanh 3 điều nhỏ bé khiến bản thân mỉm cười; in thành ảnh Polaroid kỷ niệm treo lên bảng gỗ.

#### 16. 🌟 Bà Sao Bắc Đẩu (Ngọn Hải Đăng Bắc Đẩu • Số 16 Phố Sao Bông)
* **Tạo hình**: Ngôi sao ánh bạc – tím lavender quàng khăn len đan tay, cầm chiếc la bàn ánh sáng vàng (`north_star`).
* **Vai trò**: Người bà hiền hậu, từng trải, điểm tựa chỉ đường cho những tâm hồn đang phân vân.
* **Kỹ năng chính**: **La Bàn Định Hướng (Gentle Guidance Card)** — Xoay kim la bàn nhận 1 lá bài thông điệp chiêm nghiệm nhẹ nhàng giúp lắng dịu tâm trí khi đang bối rối.

### 3.4. Chi tiết 4 Nhân Vật Phản Diện Đáng Yêu (Ngõ Gió Xoáy: Số 17 – Số 20)

> [!NOTE]
> **Triết lý Thiết kế**: Mỗi nhân vật đại diện cho một trạng thái tâm lý "khó ở" rất đỗi đời thường (*tụt mood mau dỗi, tăng động vội vã, đãng trí hay quên, và suy diễn lo xa*). Cư dân Thị Trấn Sao Bông luôn bao dung, biến những rắc rối nhỏ thành tình huống hài hước ấm áp.

#### 17. ⛈️ Nhóc Mây Giông (Trạm Mưa Rào Rầu Rĩ • Số 17 Ngõ Gió Xoáy)
* **Tạo hình**: Mây xám tím nhíu mày giả vờ ngầu, có sừng tia chớp nhỏ, cầm bình xịt mưa (`storm_cloud`).
* **Tính cách**: Hay dỗi & mau nước mắt, ngoài mặt cau có nhưng cực kỳ mềm lòng; hồi hộp hoặc xị mặt là xịt mưa bóng mây làm ướt thư.
* **Mini Event Gameplay**: **"Dỗ Nhóc Mây Giông"** — Người chơi chạm vào tặng 1 viên kẹo ngọt hoặc xoa đầu, đám mây xám sẽ đỏ mặt vui vẻ, ngừng mưa và tặng lại Cầu Vồng Đôi (`+2 Tim`).

#### 18. 🌪️ Tí Lốc Xoáy (Căn Chòi Gió Xoáy • Số 18 Ngõ Gió Xoáy)
* **Tạo hình**: Cơn lốc xanh bạc hà đeo kính phi công lệch, cười toe toét, cuốn theo lá cây và chiếc tất (`whirlwind`).
* **Tính cách**: Tăng động & phanh không kịp, chạy vèo vèo khắp con dốc làm xoay ngược bảng tên nhà hoặc cuốn nhầm cọ vẽ.
* **Mini Event Gameplay**: **"Chậm Lại Một Nhịp"** — Chạm vào giúp Tí Lốc Xoáy đứng lại hít thở sâu 3 giây để nhận huy hiệu và `+2 Tim`.

#### 19. 🕳️ Bé Hố Đen (Hầm Xoáy Tí Hon • Số 19 Ngõ Gió Xoáy)
* **Tạo hình**: Quả cầu tím indigo má phính như hamster đang nhai bánh quy, bụng có vành đai ngân hà hút chìa khóa (`black_hole`).
* **Tính cách**: Háu ăn & não cá vàng, hễ ngáp ngủ là vô tình hút mất muỗng kem hay kính đọc sách của cư dân nhưng hỏi tới thì quên sạch.
* **Mini Event Gameplay**: **"Truy Tìm Đồ Thất Lạc"** — Nhặt món đồ bay lơ lửng quanh Hầm Xoáy đem trả lại cho chủ nhân để mở khóa đối thoại hài hước và nhận `+2 Tim`.

#### 20. 🌫️ Cậu Sương Mù (Lều Ảo Ảnh • Số 20 Ngõ Gió Xoáy)
* **Tạo hình**: Cụm sương mù tím khói đeo mặt nạ ảo thuật gia, chu môi thổi bong bóng xà phòng (`mirage_fog`).
* **Tính cách**: Lém lỉnh & thích chơi ú òa, thổi bong bóng biến thành hình bánh sừng bò khổng lồ hoặc thả sương làm Chú Trăng Khuyết đi lạc.
* **Mini Event Gameplay**: **"Chạm Tan Ảo Ảnh"** — Bấm làm vỡ 3 quả bong bóng ảo ảnh đang trôi để tìm thông điệp sự thật tích cực (xua tan *overthinking*) và nhận `+2 Tim`.

---

## 4. CÁC HỆ THỐNG DỮ LIỆU & LƯU TRỮ

* **Client Storage (`SafeStorage`)**:
  * Lưu trữ an toàn trong `localStorage` với cơ chế bọc lỗi (`try/catch`), không bao giờ gây sập app nếu trình duyệt chặn cookie/storage.
  * Quản lý trạng thái mở sao trong ngày, danh hiệu cư dân, nhật ký thẻ sao đã mở.
* **Cloud Storage (Google Sheets + Google Apps Script Web App)**:
  * Đóng vai trò Backend / Database Serverless miễn phí 100%.
  * Lưu trữ danh sách lời chúc cộng đồng đã duyệt, danh sách cư dân đăng ký, bộ đếm số sao còn lại trong lọ.

---

## 5. ĐỊNH HƯỚNG PHÁT TRIỂN TIẾP THEO (ROADMAP)

### 5.1. Sách Truyện Tranh Mỗi Ngày (Daily Comic Book)
* Mô phỏng quyển truyện tranh 3D lật trang mượt mà (`react-pageflip`).
* Mỗi ngày mở ra 1 mẩu truyện tranh ngắn hài hước, vô tri, chữa lành xoay quanh các cư dân thị trấn.
* **Cơ chế Cư dân gửi ý tưởng**: Người chơi gửi gợi ý tình huống $\rightarrow$ Gemini AI biên kịch $\rightarrow$ Ban quản trị duyệt $\rightarrow$ Xuất bản vinh danh người đóng góp.
* **Cơ chế Sưu tầm**: Khách vãng lai lưu tạm mất sau 00:00; Cư dân có tài khoản được lưu vĩnh viễn vào Tủ Sách Kỷ Niệm và mở khóa Huy Hiệu Mọt Sách.
* *(Chi tiết lộ trình triển khai xem tại file `DEVELOPMENT_PLAN.md`)*.

### 5.2. Mở Rộng Hệ Thống Cư Dân
* Bổ sung các cư dân mới gắn liền với các công trình trên sườn cỏ *(người dùng sẽ tự tay định hình và thiết kế lại sau)*.

### 5.3. Tương Tác Xã Hội Giữa Các Cư Dân
* Cho phép cư dân ghé thăm "Nhà Của Bạn" của nhau, thả tim và để lại lời nhắn trên bàn trà.
* Trang trí sân vườn quanh Ngôi Nhà Của Bạn theo các mùa lễ hội (Tết, Giáng Sinh, Trung Thu).

