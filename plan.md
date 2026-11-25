# 📖 & 🎯 KẾ HOẠCH PHÁT TRIỂN: HỆ THỐNG "TRUYỆN TRANH MỖI NGÀY" & "NHIỆM VỤ HÀNG NGÀY" (DAILY COMICS & TOWN QUESTS)
**Dự án**: Thị Trấn Sao Bông  
**Mục tiêu**: Xây dựng vòng lặp trải nghiệm cốt lõi (Core Gameplay Loop) chuẩn phong cách Cozy Game: Mỗi ngày người chơi vào app đọc truyện tranh chữa lành ngắn, nhận 5 nhiệm vụ ngẫu nhiên từ các cư dân thị trấn, tương tác tại các ngôi nhà và tích lũy huy hiệu vinh danh.

---

## I. TỔNG QUAN KIẾN TRÚC HỆ THỐNG SONG SONG

```
[Người Dùng Mở Ứng Dụng Mỗi Ngày]
              │
              ├──► [1. Sách Truyện Tranh Mỗi Ngày (Daily Comic)]
              │      ├─ Trình đọc lật sách 3D (Flipbook)
              │      ├─ Kịch bản AI Gemini 2.0 Flash + Duyệt qua CMS Google Sheets
              │      └─ Cơ chế sưu tầm vào Tủ Sách Kỷ Niệm
              │
              └──► [2. Nhiệm Vụ Hàng Ngày Cư Dân (Daily Town Quests)]
                     ├─ Random 5 nhiệm vụ mỗi ngày (Seed theo ngày YYYY-MM-DD)
                     ├─ Đánh dấu trực quan: Bong bóng "!" và "?" trên đầu cư dân
                     ├─ Widget "Sổ Tay Hành Trình" theo dõi tiến độ + Tìm đường (Find NPC)
                     └─ Tích lũy mốc hoàn thành ➔ Mở khóa Bộ Huy Hiệu Thị Trấn
```

---

## II. CHI TIẾT TÍNH NĂNG 1: SÁCH TRUYỆN TRANH MỖI NGÀY (DAILY COMIC BOOK)

### 1. Cơ sở dữ liệu: Google Sheets + Google Apps Script (Miễn phí 100%)
Tận dụng hạ tầng Google Apps Script Web App hiện tại của dự án:
* **Tab `Comics` (Kho truyện chính thức)**:
  * `id`: Mã định danh truyện (vd: `comic_20261102_01`).
  * `publish_date`: Ngày xuất bản (`YYYY-MM-DD` hoặc để trống nếu chờ lịch).
  * `status`: Trạng thái (`approved` - đã duyệt, `pending` - chờ duyệt, `archived`).
  * `title`: Tựa đề câu chuyện.
  * `author`: Tác giả (Tên cư dân đóng góp hoặc `Ban Biên Tập Thị Trấn`).
  * `moral`: Bài học nhỏ / câu chốt chữa lành / câu nói vô tri cuối truyện.
  * `pages_json`: Chuỗi JSON chứa toàn bộ nội dung từng trang (tối đa 6 - 10 trang).
  * `views_count`, `collect_count`: Số lượt xem và sưu tầm.
* **Tab `Submissions` (Hàng đợi ý tưởng cư dân gửi lên)**:
  * `submit_time`, `user_name`, `selected_chars`, `idea_text`, `status` (`new`, `processed`, `skipped`).

### 2. Trí tuệ nhân tạo: Gemini API (Gói Free Tier từ Google AI Studio)
* **Model**: `gemini-1.5-flash` hoặc `gemini-2.0-flash`.
* **Hạn mức**: 15 requests/phút, 1.500 requests/ngày (App chỉ dùng 1 - 10 requests/ngày $\rightarrow$ Miễn phí trọn đời).
* **Định dạng dữ liệu đầu ra (Structured JSON Output)**: Mỗi trang gồm `characterId`, `speaker`, `speech`, `emotion`, `bgScene`.

### 3. Giao diện Đọc truyện: Hiệu ứng Lật Sách 3D (Comic Flipbook)
* **Thư viện đề xuất**: `react-pageflip` (hoặc `swiper` với hiệu ứng Flip/Cards).
* **Bố cục khung tranh**: Sprite nhân vật biểu cảm + Bong bóng thoại hoạt họa (Speech Balloon).
* Tối đa 6 - 10 trang ngắn gọn, thời gian đọc trung bình: 45 - 60 giây.

### 4. Quy trình Duyệt Nội Dung An Toàn 100% (Approval Workflow)
* **Trang Admin Mini (`/admin` hoặc Modal bảo vệ bằng mã PIN)**:
  * Nằm trực tiếp trong ứng dụng web hiện tại, không cần deploy thêm server phụ.
  * AI sinh kịch bản lưu trạng thái `pending` $\rightarrow$ Admin đọc thử, sửa trực tiếp từng câu thoại $\rightarrow$ Bấm `✅ DUYỆT` để lên sóng.

---

## III. CHI TIẾT TÍNH NĂNG 2: NHIỆM VỤ HÀNG NGÀY & THU THẬP HUY HIỆU (DAILY QUESTS)

### 1. Cơ chế Ngẫu Nhiên Hàng Ngày (Daily Quest Pool & RNG)
* Mỗi ngày đúng **00:00** (hoặc khi người chơi truy cập lần đầu trong ngày), hệ thống tạo bộ 5 nhiệm vụ ngẫu nhiên dựa trên mã ngày `YYYY-MM-DD`:
  * Nhiệm vụ 1: **Cư dân Bầu Trời** (Bé Sao Bông, Bác Mây Xốp, Chú Trăng Khuyết, Bé Sao Băng).
  * Nhiệm vụ 2: **Cơ sở Phục Vụ** (Tiệm Trà Tâm Hồn, Tiệm Bánh Bình Minh, Cà Phê Hoàng Hôn, Tiệm Kem Tuyết).
  * Nhiệm vụ 3: **Cư dân Thời Tiết** (Chị Cầu Vồng, Bé Sương Mai, Chú Gió Mát, Bà Cực Quang).
  * Nhiệm vụ 4: **Cư dân Vũ Trụ & Đêm** (Bác Sao Thổ, Bé Đom Đóm, Ông Sao Bắc Đẩu, Trạm Nhạc Lofi).
  * Nhiệm vụ 5: **Ngõ Gió Xoáy Tinh Nghịch** (Nhóc Mây Giông, Tí Lốc Xoáy, Bé Hố Đen, Cậu Sương Mù).

### 2. Các Dạng Nhiệm Vụ Cozy & Thư Giãn (Quest Archetypes)
Không mang tính chất cày cuốc hay áp lực làm bài tập, toàn bộ nhiệm vụ đều mang tính thư giãn (Cozy Vibes):
1. **Nhiệm vụ Lắng Nghe & Đọc Chuyện**:
   * *Ghé Tiệm Cà Phê Hoàng Hôn nghe Chị Hoàng Hôn tâm sự cuối ngày.*
   * *Đọc xong tập truyện tranh mới phát hành hôm nay.*
2. **Nhiệm vụ Thao Tác Chăm Sóc Bản Thân**:
   * *Hít thở 4-4-4 thư giãn trong 60 giây cùng Chị Ngân Hà tại Tiệm Trà Tâm Hồn.*
   * *Bốc 1 chiếc bánh quy may mắn từ Cô Nắng Mai tại Tiệm Bánh Bình Minh.*
   * *Bật 1 bản nhạc Lofi tại Trạm Nhạc Lofi của Anh Tia Chớp.*
3. **Nhiệm vụ Tương Tác & Giúp Đỡ Cư Dân**:
   * *Tặng 1 viên kẹo ngọt dỗ Nhóc Mây Giông nín khóc.*
   * *Giúp Bé Hố Đen tìm lại chiếc thìa kem bị hút mất.*
   * *Gửi 1 lời chúc tốt lành lên bầu trời tại Bưu Điện Sao Băng.*

### 3. Giao diện & Hiệu Ứng Trực Quan (In-Game Visuals & UX)
* **Bong bóng trạng thái tương tác trên đầu nhân vật**:
  * 🟡 **Bong bóng `!` vàng lấp lánh**: Cư dân đang có nhiệm vụ mới hôm nay cần gặp.
  * 🟢 **Bong bóng `?` xanh ngọc**: Đã hoàn thành nhiệm vụ, bấm vào để nhận thưởng.
  * ⚪ **Trạng thái bình thường**: Cư dân hôm nay không có nhiệm vụ sẽ nghỉ ngơi/chớp mắt nhẹ nhàng, giúp màn hình không bị rối.
* **Widget "Sổ Tay Hành Trình" (Daily Quest Tracker)**:
  * Đặt ở góc màn hình (hoặc ngay Bảng Tin Thị Trấn đầu cổng): hiển thị tiến độ `Nhiệm vụ hôm nay: 2/5`.
  * Khi bấm mở sổ tay: Danh sách 5 việc hôm nay + nút **"Tìm đường 🚶"** (Avatar tự động đi bộ hoặc Camera trượt mượt mà đến nhà nhân vật đó).

### 4. Hệ Thống Thưởng & Huy Hiệu Vinh Danh
* **Phần thưởng từng nhiệm vụ**:
  * Nhận từ +10 đến +20 Sao Bông May Mắn.
  * +1 Trái Tim Thiện Cảm với cư dân đó.
* **Phần thưởng mốc hoàn thành cả 5/5 nhiệm vụ**:
  * Tích lũy +1 ngày vào chuỗi chuyên cần (Daily Streak).
  * Hộp quà may mắn: Nhận thêm 50 sao + Mảnh ghép Huy hiệu.
* **Bộ sưu tập Huy Hiệu Nhiệm Vụ Mới**:
  * 🥉 **Bé Ngoan Thị Trấn**: Hoàn thành trọn vẹn 5/5 nhiệm vụ trong 3 ngày.
  * 🥈 **Cư Dân Tận Tụy**: Hoàn thành trọn vẹn 5/5 nhiệm vụ trong 7 ngày liên tục.
  * 🥇 **Đại Sứ Sao Bông**: Hoàn thành trọn vẹn 5/5 nhiệm vụ trong 30 ngày.
  * 👑 **Cộng Sự Của Thị Trưởng**: Đạt mốc hoàn thành tổng cộng 100 nhiệm vụ cư dân.

---

## IV. LỘ TRÌNH TRIỂN KHAI SONG SONG (ROADMAP)

### Giai đoạn 1: Chuẩn Hóa Layout & Dữ Liệu Thị Trấn (Đã & Đang Thực Hiện)
- [x] Đổi toàn bộ biển tên nhân vật thành tên địa điểm/tiệm phù hợp (*Tiệm Trà Tâm Hồn*, *Tiệm Bánh Bình Minh*, *Cà Phê Hoàng Hôn*, *Đài Khí Tượng*,...).
- [x] Chuẩn hóa hình tượng Chị Hoàng Hôn sang Quán Cà Phê (khớp với hình ảnh và biển hiệu coffee).
- [x] Mở rộng kích thước bảng tên gỗ (viewBox 180, font co giãn tự động) giúp chữ không bị tràn lề.
- [x] Tối ưu tọa độ giãn cách các ngôi nhà trên PC để tránh chồng chéo.

### Giai đoạn 2: Trình Đọc Truyện Lật Sách & AI Kịch Bản
- [ ] Cài đặt thư viện `react-pageflip` (hoặc Swiper Flip) cho component `DailyComicModal.jsx`.
- [ ] Tích hợp helper gọi Gemini API (`geminiComicService.js`) để tự động chuyển ý tưởng thành kịch bản JSON.
- [ ] Tạo bảng `Comics` và `Submissions` trên Google Sheets để làm CMS duyệt nội dung an toàn.

### Giai đoạn 3: Hệ Thống Nhiệm Vụ Hàng Ngày (Daily Quests Engine)
- [ ] Xây dựng bộ sinh nhiệm vụ hàng ngày `questService.js` (seed theo ngày `YYYY-MM-DD`).
- [ ] Thêm bong bóng thoại tương tác `!` và `?` trên đầu các nhân vật có nhiệm vụ trong ngày.
- [ ] Xây dựng UI Widget **"Sổ Tay Hành Trình"** hiển thị danh sách 5 nhiệm vụ kèm nút tự tìm đường `Find NPC`.
- [ ] Kết nối sự kiện hoàn thành nhiệm vụ khi tương tác kỹ năng cư dân hoặc đọc truyện.

### Giai đoạn 4: Hệ Thống Huy Hiệu & Đồng Bộ Tài Khoản Cư Dân
- [ ] Tích hợp 4 Huy hiệu Nhiệm vụ mới và 3 Huy hiệu Mọt sách vào `UserHouseModal.jsx`.
- [ ] Đồng bộ tiến độ nhiệm vụ và truyện sưu tầm vào Google Sheet tài khoản Thẻ Cư Dân.
- [ ] Kiểm thử toàn diện hiệu năng (60 FPS) trên cả trình duyệt PC và PWA Mobile.
