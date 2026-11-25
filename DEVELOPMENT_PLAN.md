# 📋 KẾ HOẠCH PHÁT TRIỂN THỰC CHIẾN — THỊ TRẤN SAO BÔNG (MOBILE-FIRST ROADMAP)

> **Mục tiêu cốt lõi:** Đưa **Thị Trấn Sao Bông** từ bản prototype web desktop thành một ứng dụng chạy mượt mà, nhẹ, ổn định trên **điện thoại** (PWA → Mobile App), sửa triệt để các điểm yếu kỹ thuật & tính năng rỗng trước khi mở rộng vòng lặp giữ chân người chơi.
>
> *Tài liệu này thay thế toàn bộ các kế hoạch cũ (`plan.md`, `plan_mb.md`).*

---

## TỔNG QUAN THỨ TỰ ƯU TIÊN

1. **Giai đoạn 1:** Dọn dẹp code thừa & Tối ưu tài nguyên cho mạng di động *(Blocker hiệu năng)*
2. **Giai đoạn 2:** Sửa kiến trúc Layout, Camera & Điều khiển trên màn hình dọc Mobile *(Blocker UX)*
3. **Giai đoạn 3:** Đóng gói PWA (Cài đặt lên màn hình chính iOS/Android) & Chuẩn bị Mobile Wrapper
4. **Giai đoạn 4:** Vá dứt điểm các tính năng "rỗng" (12 nhân vật 09–20, Âm thanh thật, Chế độ Đêm)
5. **Giai đoạn 5:** Nâng cấp Backend & Triển khai Core Loop giữ chân (Daily Quests → Daily Comics AI)

---

## GIAI ĐOẠN 1: TỐI ƯU TÀI NGUYÊN & DỌN DẸP MÃ NGUỒN

**Vấn đề thực tế cần giải quyết:**
- Lần tải đầu hiện ngốn **~18 MB ảnh PNG** (4 map nền 4–5.3 MB/ảnh; 4 icon + 4 bảng tên gỗ 1.4–2.2 MB/ảnh).
- `characterSprites.js` (348 KB) và `houseSprites.js` (569 KB) nhúng ~915 KB base64 trực tiếp vào JS bundle.
- Công cụ debug `TownDebugGizmo.jsx` đang hiển thị công khai trên giao diện người dùng.
- Tồn tại code chết và listener click-to-move bị đăng ký trùng 2 nơi.

**Checklist thực hiện:**
- [x] **Nén & đổi định dạng ảnh sang WebP:**
  - 4 ảnh map nền (`public/assets/maps/map_01..04.webp`): resize tối đa `1920px` ngang, WebP quality ~82 → đạt **126–234 KB/ảnh** (giảm từ 4–5.3 MB).
  - 4 icon đảo & 4 bảng tên gỗ (`public/assets/maps/icon/*.webp`): resize `320px`, WebP → đạt **7–28 KB/ảnh** (giảm từ 1.3–2.1 MB).
  - Xóa các file ảnh backup thừa (`*_bk.png`, `*_bk.webp`, `*_original_bk.webp`, `user_house.png` trùng).
- [x] **Gỡ bỏ Base64 khỏi JS bundle:**
  - Chuyển `CHARACTER_SPRITES` và `HOUSE_SPRITES` sang dùng URL ảnh WebP tĩnh trong `public/images/` (giảm tổng 2 file từ ~916 KB xuống ~20 KB).
  - Trình duyệt chỉ tải ảnh nhà/nhân vật thuộc map đang mở.
- [x] **Ẩn công cụ phát triển trên Production:**
  - Bọc `TownDebugGizmo` bằng điều kiện `import.meta.env.DEV` trong `src/components/TownStreetScene.jsx`.
- [x] **Dọn dẹp mã nguồn thừa:**
  - Xóa component không dùng (`src/components/TownMapCanvas.jsx`), mảng `TOWN_DISTRICTS` và logic `WORLD_WIDTH_PC` cũ trong `TownStreetScene.jsx`.
  - Hợp nhất 2 sự kiện click-to-move bị trùng giữa `TownStreetScene.jsx` và `CozyWalkAvatar.jsx` về một nguồn xử lý duy nhất.

**Tiêu chí hoàn thành (DoD):**
- Tổng dung lượng tải lần đầu (JS + CSS + Ảnh map đầu tiên + HUD) **< 2 MB**.
- Không còn nút debug nào hiển thị khi chạy `npm run build && npm run preview`.

---

## GIAI ĐOẠN 2: LAYOUT, CAMERA & ĐIỀU KHIỂN CHUẨN MOBILE

**Vấn đề thực tế cần giải quyết:**
- Map vẽ tỉ lệ ngang `16:9` bị cắt xén khi hiển thị trên màn hình dọc `9:19.5`, khiến nhà (`left/top %`) bị lệch khỏi nền đất và đè nhau.
- Thanh chuyển map `TownMapSwitcher` và hộp thoại NPC (`dialogue-box`) cùng `fixed bottom` nên đè lên nhau.
- Modal hướng dẫn vẫn nhắc phím `W-A-S-D / Space` trên điện thoại; thiếu xử lý safe-area và cảm ứng.

**Giải pháp kiến trúc: Camera Panning 2D giữ nguyên tỉ lệ gốc `16:9`**
- Không vẽ lại map dọc. Giữ khung thế giới (`world-container`) luôn đúng tỉ lệ `16:9` (chiều cao `100dvh`, chiều rộng tương ứng `~177dvh`), đảm bảo tọa độ `%` của 20 ngôi nhà, collider và portal khớp 100% giữa PC và Mobile.
- Camera mặc định **tự động bám theo (auto-follow)** vị trí Avatar.
- Cho phép người dùng **vuốt 1 ngón tay (1-Finger Pan)** để lia ngang ngắm thị trấn; chạm vào cỏ để nhân vật đi tới (Tap-to-Move).

**Checklist thực hiện:**
- [x] **Xây dựng Viewport Camera Pan cho Mobile trong `TownStreetScene.jsx`:**
  - Tính toán `worldWidth = Math.max(vw, Math.round(vh * (16 / 9)))` trên màn hình dọc/hẹp (`vw / vh < 1.35`), giới hạn `cameraX` trong `[0, worldWidth - viewportWidth]`, và thống nhất nền 16:9 trong `TownHillBackgroundSvg.jsx` để nhà không bao giờ lệch khỏi nền đất.
  - Xử lý phân biệt rõ thao tác **Vuốt lia camera (Touch Pan > 10px)** và **Chạm để đi bộ (Tap < 10px)** bằng Pointer Events + nút nổi `📍 Về Bé`.
  - Bật tự động trượt camera bám theo Avatar khi di chuyển hoặc chuyển map.
- [x] **Thiết kế lại HUD cho vùng ngón cái (Thumb Zone) & Safe-Area:**
  - Cập nhật `index.html` & `src/index.css`: thêm `viewport-fit=cover`, `overscroll-behavior: none`, `touch-action: manipulation`.
  - Thu gọn `TownMapSwitcher` trên mobile (`< 768px`) thành thanh dock gọn ở đáy màn hình có safe-area, **tự động trượt ẩn khi hộp thoại NPC mở ra**.
  - Đưa Header tiêu đề & bộ đếm sao ra làm HUD cố định trên cùng; đẩy `toastMsg` lên trên cùng trên mobile để tuyệt đối không đè dock hay hộp thoại NPC.
- [x] **Tối ưu Modal & Hướng dẫn trên Mobile:**
  - Ẩn hướng dẫn phím `W-A-S-D / Space` trên thiết bị cảm ứng (`pointer: coarse`) trong `CozyWalkAvatar.jsx`; thay bằng hướng dẫn chạm & vuốt 1 ngón.
  - Chuyển `UserHouseModal` sang `max-h-[90dvh]` để an toàn với bàn phím ảo trên iOS/Android.

**Tiêu chí hoàn thành (DoD):**
- Test trên giả lập & máy thật (iOS Safari + Android Chrome ở độ phân giải `375x667` và `390x844`): không lệch nhà, không đè UI, lia camera và đi bộ đạt 60 FPS.

---

## GIAI ĐOẠN 3: ĐÓNG GÓI PWA & HƯỚNG ĐI MOBILE APP

**Mục tiêu:** Chơi toàn màn hình như ứng dụng thật trên điện thoại, không bị thanh địa chỉ trình duyệt chiếm chỗ hay giật khung hình.

**Checklist thực hiện:**
- [x] **Cài đặt và cấu hình `vite-plugin-pwa`:**
  - Tạo `manifest.webmanifest` (`display: "standalone"`, `theme_color: "#C8EFEA"`, bộ icon `192x192`, `512x512`, `maskable 512x512`, `apple-touch-icon 180x180`).
  - Cấu hình Service Worker (Workbox) precache toàn bộ tài nguyên tĩnh (ảnh map WebP, sprite nhân vật/nhà, JS/CSS) và cache runtime Google Fonts để mở app tức thì từ lần thứ 2.
  - Thêm component `PwaInstallPrompt.jsx` gợi ý cài đặt lên Màn hình chính (hỗ trợ nút cài 1 chạm `beforeinstallprompt` cho Android và hướng dẫn ngắn cho iOS Safari, tự ẩn trong 7 ngày khi đóng).
- [ ] *(Tùy chọn khi muốn phát hành lên Store)* **Bọc Native bằng Capacitor:**
  - Tích hợp `@capacitor/core`, `@capacitor/android`, `@capacitor/ios` bọc trực tiếp thư mục `dist/` mà không phải viết lại giao diện.

**Tiêu chí hoàn thành (DoD):**
- Cài được lên màn hình chính iPhone & Android, mở ở chế độ standalone không có thanh URL, hoạt động ổn định ngay cả khi mạng chập chờn.

---

## GIAI ĐOẠN 4: VÁ DỨT ĐIỂM CÁC TÍNH NĂNG "RỖNG" HIỆN TẠI

**Vấn đề thực tế cần giải quyết:**
- 12/20 cư dân (số 09–20) có nút kỹ năng nhưng bấm vào không chạy gì trong `handleTriggerCharacterSkill` (`src/App.jsx`).
- Nhạc Lofi của Anh Tia Chớp hiện là tiếng bíp sóng `sine` đơn âm.
- Nút chuyển Ngày/Đêm của Chú Trăng Khuyết chưa tạo hiệu ứng thị giác rõ trên map mới.

**Checklist thực hiện:**
- [x] **Hoàn thiện tương tác thật cho 4 nhân vật Ngõ Gió Xoáy (17–20):**
  - `storm_cloud` (Nhóc Mây Giông): Mini-event tặng kẹo dâu / xoa đầu dỗ nín khóc (`+2 Tim`).
  - `whirlwind` (Tí Lốc Xoáy): Mini-event nhấn giữ nút hít thở chậm lại 3 giây (`+2 Tim`).
  - `black_hole` (Bé Hố Đen): Mini-event chạm nhặt 3 món đồ thất lạc trả chủ nhân (`+2 Tim`).
  - `mirage_fog` (Cậu Sương Mù): Mini-event chạm vỡ 3 bong bóng ảo ảnh nhận thông điệp tích cực (`+2 Tim`).
- [x] **Hoàn thiện kỹ năng cốt lõi cho nhóm cư dân 09–16 (`ExtendedSkillModals.jsx`):**
  - `dewdrop` (Bé Sương Mai): **Tưới Mầm Thói Quen** — tick tối đa 3 thói quen nhỏ/ngày (`+1 Tim`).
  - `breeze` (Chú Gió Mát): **Thổi Bay Muộn Phiền** — nhập 1 nỗi lo, bấm thổi bay kèm hiệu ứng tan biến (`+1 Tim`).
  - `snowflake` (Cô Tuyết Bông): **Viên Pha Lê Ký Ức** — lưu khoảnh khắc vui trong ngày vào `localStorage`.
  - `firefly` (Bé Đom Đóm): **Âm Thanh Ru Ngủ (White Noise)** — Mưa êm / Đêm hè / Lửa trại kèm hẹn giờ tắt 15/30/60p.
  - `sunset` (Chị Hoàng Hôn): **3 Điều Biết Ơn** — ghi & lưu nhanh 3 điều tích cực trong ngày.
  - `north_star` (Ông Sao Bắc Đẩu): **La Bàn Định Hướng** — xoay kim la bàn nhận thông điệp chiêm nghiệm.
  - `aurora` (Số 12) & `saturn` (Số 13): Hiển thị thông báo chuẩn bị mở cửa ở Giai đoạn 5 (Daily Comics & Tủ Sách), tuyệt đối không có nút bấm chết.
- [x] **Nâng cấp Âm thanh & Chế độ Đêm (`src/utils/audioEngine.js`):**
  - Thay vòng lặp sóng `sine` đơn âm bằng hợp âm Lofi Ambient ấm (Lowpass Filter) + bộ White Noise chạy 100% offline trên PWA, kèm nút bật/tắt âm thanh nhanh ở góc trên bên phải HUD.
  - Bổ sung lớp phủ ánh sáng đêm (`mix-blend-multiply`) + đom đóm lấp lánh khi bật Chế độ Đêm của Chú Trăng Khuyết.

**Tiêu chí hoàn thành (DoD):**
- 100% nút bấm trên tất cả 20 cư dân đều có phản hồi rõ ràng, không có nút chết.
- Âm thanh hoạt động đúng trên cả iOS Safari (unlock sau user gesture) và Android Chrome.

---

## GIAI ĐOẠN 5: NÂNG CẤP BACKEND & CORE LOOP GIỮ CHÂN NGƯỜI CHƠI

**Mục tiêu:** Xây dựng lý do để người dùng quay lại app mỗi ngày và đồng bộ dữ liệu an toàn giữa các thiết bị.

### 5.1. Chuẩn hóa Backend (Supabase Ready + Fallback Offline)
- [x] Khởi tạo schema SQL chuẩn Production ([supabase/schema.sql](file:///d:/Working/thitransaobong/supabase/schema.sql)) cho 4 bảng: `profiles`, `wishes`, `daily_progress`, `comics` kèm RLS policies.
- [x] Tạo lightweight REST client ([src/services/supabaseClient.js](file:///d:/Working/thitransaobong/src/services/supabaseClient.js)) & `.env.example` tự kích hoạt khi điền `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, fallback 100% mượt về `SafeStorage` khi chạy local/offline.

### 5.2. Hệ Thống Nhiệm Vụ Hàng Ngày (Daily Town Quests & In-World Quests)
- [x] Xây dựng `dailyQuestService.js`: sinh 5 nhiệm vụ ngẫu nhiên mỗi ngày theo seed `YYYY-MM-DD` rải đều trên 4 map, tự động hoàn thành khi thực hiện đúng hành động tương ứng.
- [x] Nâng cấp 4 mini-game Hẻm Xoáy (`inWorldQuests.js`) thành nhiệm vụ tương tác trực tiếp trên 4 bản đồ (nhặt đồ, chạm vỡ bong bóng, tìm kẹo, thu lá) kèm bong bóng trạng thái `!`, `⏳`, `🎁`, `✓` trên đầu cư dân.
- [x] Xây dựng Widget **"Sổ Tay Hành Trình"** (`QuestTrackerHud.jsx`) góc trên bên trái gồm 2 tab (*Nhiệm Vụ Ngày 5/5* + *Trên Bản Đồ*) kèm nút **`Đi tới ➡️`** sang đúng map và nút nhận Hộp Quà 5/5 (`+50 Sao` & `+1 Streak`).
- [x] Tích lũy chuỗi chuyên cần (Daily Streak) & mở khóa 5 Huy hiệu mới (`Bé Ngoan 3 ngày`, `Cư Dân Tận Tụy 7 ngày`, `Đại Sứ 30 ngày`, `Cộng Sự Thị Trưởng 100 NV`, `Mọt Sách 7 truyện`) trong `UserHouseModal.jsx`.

### 5.3. Sách Truyện Tranh Mỗi Ngày (Daily Comic Book + Gemini AI)
- [x] Xây dựng `DailyComicModal.jsx` với trình đọc lật trang hỗ trợ **vuốt ngang 1 ngón** tối ưu cho màn hình dọc điện thoại.
- [x] Cài sẵn kho 7 tập truyện chữa lành trong `dailyComicsData.js` (xoay vòng mỗi ngày theo `YYYY-MM-DD`) + hỗ trợ gọi Gemini 2.0 Flash (`VITE_GEMINI_API_KEY`) biên kịch trực tiếp từ ý tưởng người chơi (có fallback offline).
- [x] Mở cửa chính thức nhà **Bà Cực Quang (Số 12)** đọc truyện mỗi ngày và nhà **Bác Sao Thổ (Số 13)** quản lý Tủ Sách Kỷ Niệm & thanh tiến độ mở khóa Huy Hiệu Mọt Sách.

---

## GIAI ĐOẠN 6: KẾT NỐI CLOUD THẬT & VẬN HÀNH SẢN PHẨM (NEXT)

**Mục tiêu:** Đưa ứng dụng lên Internet (HTTPS) để cài đặt PWA thật trên điện thoại và đồng bộ tài khoản / lời chúc / truyện tranh ảnh qua đám mây (Supabase).

- [x] **Local Admin Dashboard & Truyện Tranh Dạng Ảnh (Đã xong ở máy cục bộ):**
  - Hỗ trợ upload nhiều ảnh trang truyện (tự nén WebP client-side, lưu `IndexedDB`), thêm/tắt Nhiệm Vụ Ngày tùy chỉnh, duyệt Lời Chúc & xuất file Backup JSON (`AdminDashboardModal.jsx`, `adminDataStore.js`).
  - Tối ưu giao diện xoay ngang Mobile (`max-height: 520px`).
- [ ] **Deploy Production (Vercel / Cloudflare Pages):**
  - Thiết lập tên miền HTTPS, bật nén Brotli/Gzip, kiểm thử cài PWA trên cả iOS Safari và Android Chrome thật.
- [ ] **Kích hoạt Supabase Cloud & Auth thật:**
  - Chạy `supabase/schema.sql`, tạo Storage Bucket `comics` (Public), điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
  - Nối trang Admin từ `IndexedDB` sang upload ảnh trực tiếp lên Supabase Storage + lưu metadata vào bảng `comics`, `quests`, `wishes`.
  - Bổ sung đồng bộ hai chiều (`profiles`, `daily_progress`, `wishes`, `comics`) kèm đăng nhập Google / Anonymous-to-Email để không mất dữ liệu khi đổi điện thoại.

---

## 🧭 HƯỚNG DẪN TẦNG BACKEND & HOST/SERVER MIỄN PHÍ CHO GIAI ĐOẠN ĐẦU (DÀNH CHO NGƯỜI CHƯA BIẾT BE)

> **Tin vui:** Bạn **KHÔNG cần tự viết server Node.js/PHP/Java** hay thuê VPS cấu hình Linux phức tạp! Ở giai đoạn đầu (dưới 10.000 người dùng/tháng), chỉ cần ghép các dịch vụ **BaaS (Backend-as-a-Service) miễn phí 100%** sau đây — mọi thứ đều thao tác bằng giao diện web bấm nút.

### 1. Bộ 4 dịch vụ miễn phí khuyên dùng cho Giai đoạn đầu (0đ/tháng)

| Tầng hệ thống | Dịch vụ miễn phí khuyên dùng | Hạn mức Free Tier | Vai trò trong Thị Trấn Sao Bông |
| :--- | :--- | :--- | :--- |
| **1. Hosting Web / PWA** | **Vercel** *(khuyên dùng)* hoặc **Cloudflare Pages** | Không giới hạn băng thông (Cloudflare) hoặc 100 GB/tháng (Vercel), tự cấp **HTTPS** miễn phí | Chạy web game + cài PWA lên điện thoại. Chỉ cần nối GitHub, mỗi lần push code là web tự cập nhật sau 1 phút. |
| **2. Database + Auth + Storage** | **Supabase** (Free Tier) | **500 MB** PostgreSQL DB + **50.000** user đăng nhập/tháng + **1 GB** kho lưu ảnh (~4.000–5.000 trang truyện WebP) | Lưu hồ sơ cư dân (`profiles`), lời chúc (`wishes`), tiến độ ngày (`daily_progress`), truyện tranh (`comics`) và ảnh trang truyện. |
| **3. Kho ảnh dự phòng (khi > 1 GB)** | **Cloudflare R2** hoặc **Cloudinary** | **10 GB** lưu trữ miễn phí + **0đ phí băng thông tải ảnh** (R2) | Dùng sau này khi kho truyện tranh ảnh vượt quá 1 GB của Supabase. |
| **4. AI Biên kịch truyện** | **Google AI Studio (Gemini 2.0 Flash)** | ~**1.500 lượt gọi/ngày** miễn phí | Sinh kịch bản truyện tranh từ ý tưởng người chơi. |

> ⚠️ **Lưu ý nhỏ với Supabase Free Tier:** Nếu 7 ngày liên tiếp không có ai truy cập, Supabase sẽ tự tạm ngủ (Pause) dự án (bạn vào bấm nút Resume là chạy lại, không mất dữ liệu). Cách tránh bị ngủ rất đơn giản: đăng ký 1 tài khoản miễn phí trên **cron-job.org** hoặc **UptimeRobot**, tạo lịch tự động gọi ping 1 URL nhẹ của Supabase mỗi 3 ngày/lần.

### 2. Lộ trình từng bước cần làm ở tầng BE (Khoảng 30–45 phút thao tác)

1. **Bước 1 — Đưa code lên GitHub & Deploy lên Vercel (10 phút):**
   - Tạo 1 repo GitHub (để Private cũng được) và push thư mục `thitransaobong` lên.
   - Đăng nhập [vercel.com](https://vercel.com) bằng GitHub → bấm **Add New Project** → chọn repo → bấm **Deploy**.
   - Xong! Bạn có ngay link `https://thitransaobong.vercel.app` có HTTPS chuẩn để mở trên điện thoại và bấm "Thêm vào Màn hình chính".
2. **Bước 2 — Tạo dự án Supabase & Dán bảng dữ liệu có sẵn (10 phút):**
   - Đăng ký miễn phí tại [supabase.com](https://supabase.com) → bấm **New Project** (chọn Region `Singapore` để Việt Nam tải nhanh nhất).
   - Vào mục **SQL Editor** bên cột trái → mở file [supabase/schema.sql](file:///d:/Working/thitransaobong/supabase/schema.sql) trong dự án này, copy toàn bộ dán vào → bấm **Run**.
   - Vào mục **Storage** → bấm **New Bucket** → đặt tên là `comics` → bật **Public bucket** (để người chơi xem được ảnh trang truyện).
3. **Bước 3 — Lấy 2 chìa khóa kết nối dán vào Vercel (5 phút):**
   - Trong Supabase vào **Project Settings → API**, copy 2 dòng:
     - `Project URL` → dán vào biến `VITE_SUPABASE_URL`
     - `anon public key` → dán vào biến `VITE_SUPABASE_ANON_KEY`
   - (Tùy chọn) Thêm `VITE_ADMIN_PIN` (mã PIN mở trang quản trị) và `VITE_GEMINI_API_KEY` (lấy miễn phí tại [aistudio.google.com](https://aistudio.google.com)).
   - Trong Vercel vào **Project Settings → Environment Variables**, thêm các biến trên rồi bấm **Redeploy**.
4. **Bước 4 — Khi sẵn sàng chuyển Admin từ Local lên Cloud:**
   - Mở Admin Local → tab **💌 Lời Chúc & Backup** → bấm **Tải Backup JSON** để giữ toàn bộ truyện & nhiệm vụ đã tạo thử.
   - Khi nối xong Supabase, chỉ cần nâng cấp `adminDataStore.js` từ ghi `IndexedDB` sang gọi API upload ảnh lên bucket `comics` của Supabase là mọi người chơi trên mọi điện thoại đều thấy ngay truyện mới bạn vừa đăng!

---

## GIAI ĐOẠN 7: TƯƠNG TÁC XÃ HỘI & CÁ NHÂN HÓA NGÔI NHÀ (RETENTION)

- [ ] **Trang trí Ngôi Nhà Của Bạn:** Dùng Sao Bông tích lũy từ Daily Quests để mua/mở khóa đồ trang trí sân vườn (đèn lồng, vườn hoa, bảng tên mùa lễ hội Tết / Giáng Sinh / Trung Thu).
- [ ] **Thăm Nhà Hàng Xóm (Async Social):** Chia sẻ link "Nhà của [Tên]" để bạn bè ghé thăm, thả tim và để lại 1 lời nhắn trên bàn trà.
- [ ] **Mở rộng Kho Truyện Manga & Nhiệm Vụ Bản Đồ:** Bổ sung thêm 15–20 tập truyện nhiều khung tranh cho các mốc Lv.1–Lv.5 và thêm nhiệm vụ bản đồ cho cư dân Map 1–3.

---

## GIAI ĐOẠN 8: ĐÓNG GÓI APP NATIVE & THÔNG BÁO NHẮC NHỞ (MOBILE STORE)

- [ ] **Bọc ứng dụng bằng Capacitor (`@capacitor/ios`, `@capacitor/android`):** Đưa trực tiếp bản build Vite lên Google Play & App Store mà không phải viết lại giao diện.
- [ ] **Local Push Notifications (Nhắc nhẹ nhàng, không làm phiền):** Thông báo lúc 08:00 sáng (*"Lọ Sao hôm nay đã đầy & có tập truyện tranh mới rồi!"*) và 21:00 tối (*"Dành 1 phút ghi 3 điều biết ơn cùng Chị Hoàng Hôn nhé"*).
- [ ] **Haptic Feedback (Rung nhẹ trên điện thoại):** Rung phản hồi nhẹ khi mở Lọ Sao, nhặt vật phẩm trên bản đồ, lật trang truyện, mở huy hiệu và lên cấp.

---

## QUY TẮC CẬP NHẬT TÀI LIỆU
- Mỗi khi hoàn thành một hạng mục, đánh dấu `[x]` trực tiếp vào file này.
- Đồng bộ mọi thay đổi về nhân vật, kỹ năng và cơ chế gameplay vào [TOWN_OVERVIEW.md](file:///d:/Working/thitransaobong/TOWN_OVERVIEW.md) theo quy định dự án.
