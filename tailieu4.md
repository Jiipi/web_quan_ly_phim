PHASE 0 – Chuẩn bị & Khởi tạo dự án (Foundation)
Mục tiêu: Setup môi trường, công cụ, xác thực ý tưởng và dữ liệu.

0.1 Hạ tầng & Công cụ
Chọn tên miền (ví dụ: phimflow.app, mycinelog.com) và đăng ký.

Tạo repository trên GitHub/GitLab (private).

Khởi tạo dự án Next.js + TypeScript + TailwindCSS + shadcn/ui.

Setup database PostgreSQL (local dev hoặc cloud như Neon/Supabase).

Cấu hình Prisma ORM, tạo schema ban đầu dựa trên blueprint database.

Đăng ký tài khoản TMDb, lấy API key (v3 hoặc v4), lưu vào biến môi trường.

Cài đặt ESLint, Prettier, Husky để chuẩn hóa code.

Chọn dịch vụ deploy: Vercel (recommended) hoặc Railway.

Thiết lập CI/CD cơ bản (push tự deploy lên preview).

0.2 Thiết kế UX/UI ban đầu
Xây dựng Design System cơ bản trong Figma (hoặc dùng shadcn/ui components).

Thiết kế wireframe cho 3 trang MVP chính: Dashboard, Library, Movie Detail.

Quyết định bảng màu dark cinematic, font chữ, spacing scale.

Tạo bộ component atoms: Button, Badge, Input, Card, Skeleton, Modal.

Thiết kế responsive breakpoints (mobile first, desktop 1280+).

0.3 Lên kế hoạch dữ liệu
Viết script seed database: thêm sẵn các thể loại, quốc gia, nền tảng phổ biến.

Nghiên cứu cách gọi TMDb API để lấy chi tiết phim, tìm kiếm, ảnh.

Xác định cấu trúc lưu trữ watch_items và watch_progress hợp lý.

PHASE 1 – MVP CORE: Quản lý xem phim cơ bản
Mục tiêu: Hoàn thiện các chức năng cốt lõi để bạn có thể dùng ngay.

1.1 Xác thực & Người dùng
Trang Login / Register (email/password + Google OAuth) với NextAuth.js.

Trang Onboarding để chọn gu ban đầu (quốc gia, thể loại, thích phim bộ không).

Middleware bảo vệ các route cần đăng nhập.

1.2 Thêm & Quản lý phim
Trang Search / Discover: nhập từ khóa → gọi TMDb API → hiển thị kết quả (poster, tên, năm).

Cho phép chọn phim từ kết quả, mở preview nhanh (modal hoặc slide).

Nút “Thêm vào thư viện” → chọn trạng thái: Muốn xem, Đang xem, Đã xem, Bỏ dở.

Lưu vào database bảng watch_items.

1.3 Trang chi tiết & Tiến độ
Movie Detail Page: hiển thị đầy đủ thông tin từ TMDb + trạng thái cá nhân, nút cập nhật trạng thái, ghi chú.

TV Show Detail Page: hiển thị danh sách mùa (season), danh sách tập (episode). Cho phép chọn tập đã xem, đánh dấu “Xem đến tập X”.

Tự động tính % tiến độ, số tập còn lại.

Nút +1 tập ngay trên card phim bộ (ở dashboard, library) – thao tác 1 click.

1.4 Dashboard & Library
Dashboard chính:

Block “Tiếp tục xem” (các phim đang xem dở, sắp xếp theo lần xem gần nhất).

Block “Phim muốn xem” (mới thêm).

Block “Gợi ý nhanh” (có thể là random từ thư viện hoặc AI đơn giản).

Library với bộ lọc: trạng thái, quốc gia, thể loại, năm, phim lẻ/bộ.

Chế độ xem Grid / List.

Continue Watching page riêng: sắp xếp thông minh theo ưu tiên (gần hết, lâu chưa xem, điểm cao).

1.5 Chức năng xem & ghi chú cơ bản
Ghi chú cá nhân cho mỗi phim (text field).

Gắn nhãn nguồn xem (Netflix, VieON, file local…) – chỉ là text/tag.

Thêm/bớt phim khỏi danh sách yêu thích.

1.6 Kiểm thử & Sửa lỗi
Test thêm ~20 phim, 5 phim bộ để kiểm tra progress.

Đảm bảo UI không bị vỡ trên mobile (responsive).

Thêm Loading Skeleton cho các trang có fetch API.

Empty state: hiển thị hướng dẫn khi chưa có dữ liệu.

Toast thông báo khi thêm phim, cập nhật thành công.

PHASE 2 – AI & Trải nghiệm thông minh
Mục tiêu: Biến web thành “trợ lý xem phim” với AI, tạo sự khác biệt.

2.1 AI Module Setup
Tạo tài khoản OpenAI (hoặc dùng Gemini) và lấy API key.

Tạo service backend (Next.js API route) để gọi AI một cách an toàn (không lộ key).

Thiết kế prompt template cho từng tác vụ: tóm tắt, gợi ý, phân tích gu.

2.2 AI No-Spoiler Summary (trang /ai/summary)
UI cho phép chọn phim đang xem dở, hiển thị tập hiện tại.

Prompt yêu cầu: “Tóm tắt nội dung đến tập X, không tiết lộ bất kỳ sự kiện nào sau tập X. Nêu các nhân vật chính và mâu thuẫn hiện tại.”

Kết quả hiển thị dạng text, có nút “Xem tiếp” hoặc “Lưu ghi chú”.

2.3 AI Gợi ý phim (trang /ai/recommend)
Xây dựng logic lấy dữ liệu: phim đã xem + rating cá nhân + thể loại/quốc gia ưa thích.

Gửi prompt cho AI: “Dựa trên danh sách phim sau {…}, hãy gợi ý 5 phim tương tự từ TMDb hoặc gợi ý chung.”

Tùy chọn: Gợi ý theo mood (chọn mood → AI lọc trong library hoặc đề xuất mới).

Mỗi gợi ý có nút “Thêm vào Watchlist”.

2.4 AI Taste Profile (trang /ai/taste-profile)
Phân tích dữ liệu: quốc gia xem nhiều, thể loại thích, điểm trung bình, lý do drop phổ biến.

Tạo prompt để AI viết đoạn mô tả “gu của bạn”.

Hiển thị trực quan bằng biểu đồ tròn (quốc gia) + text insight.

2.5 Tích hợp AI vào các luồng khác
Nút “Hỏi AI: Nên xem tiếp hay drop?” trong trang chi tiết phim dở dang.

Tự động tag phim bằng AI (ví dụ: “chemistry tốt”, “đoạn giữa lê thê”) dựa trên review text.

Trong Dashboard, thêm card “Gợi ý hôm nay” chạy AI định kỳ (1 lần/ngày).

PHASE 3 – Hoàn thiện trải nghiệm & Mở rộng
Mục tiêu: Bổ sung các trang còn lại, tối ưu UX, chuẩn bị cho production.

3.1 Các trang mở rộng
Watchlist page riêng (sắp xếp ưu tiên, tag).

Completed page: lọc theo năm, điểm, thể loại.

Dropped / Paused page: thêm lý do drop, xem phân tích.

Calendar / Diary:

Calendar view: đánh dấu ngày xem phim, xem bao nhiêu tập.

Nhật ký xem (timeline), recap tháng.

Lists (danh sách tùy chỉnh):

CRUD list.

Thêm phim vào list, sắp xếp thủ công.

Public/private toggle (dù chưa có social).

Mood Page: giao diện chọn mood, hiển thị phim từ library kèm gợi ý AI.

3.2 Stats & Analytics (trang /stats)
Dashboard thống kê tổng: số phim đã xem, tổng giờ, thể loại yêu thích.

Biểu đồ cột theo quốc gia, biểu đồ tròn theo thể loại.

Biểu đồ đường số tập xem mỗi ngày trong 30 ngày gần đây.

Heatmap lịch xem (dùng thư viện như Nivo, Recharts).

3.3 Nâng cấp UX/UI
Global Command Palette (Ctrl+K): tìm phim, chuyển trang.

Smart Filter Presets: lưu bộ lọc hay dùng.

Cải thiện mobile: bottom navigation (Dashboard, Library, Search, AI, Profile).

Thêm transition animation mượt mà (Framer Motion).

Dark Mode mặc định, không có light mode (phù hợp cinematic).

Accessibility: đảm bảo focus ring, contrast, label, alt text cho poster.

3.4 Import / Export
Export toàn bộ dữ liệu (JSON/CSV).

Import từ file backup (JSON/CSV) với validate.

(Optional) Import từ Letterboxd/Trakt nếu có API hoặc file mẫu.

3.5 Nhắc nhở & Thông báo
Reminder Page: cài đặt nhắc xem tiếp sau N ngày.

Dùng Service Worker hoặc email (nếu có) để gửi nhắc (có thể làm đơn giản bằng toast trong app khi login).

Dashboard tự động highlight phim “bị bỏ quên 7 ngày”.

PHASE 4 – Production, Bảo mật & Vận hành
Mục tiêu: Đưa web lên môi trường thật, đảm bảo an toàn, ổn định.

4.1 Chuẩn bị Production
Mua domain và cấu hình DNS trỏ về Vercel/Railway.

Thiết lập HTTPS tự động (Vercel làm sẵn).

Đăng ký database production (Neon/Supabase/AWS RDS), cấu hình backup tự động.

Thiết lập biến môi trường production (.env.production): TMDb key, OpenAI key, database URL, Auth secret.

Tối ưu image: dùng Next.js <Image> với remotePatterns cho ảnh TMDb.

Kích hoạt ISR hoặc caching hợp lý cho các trang ít thay đổi (trang detail phim từ TMDb).

4.2 Bảo mật (OWASP Top 10)
Không lộ API key TMDb hay OpenAI ở client side. Tất cả gọi AI phải qua server.

Xác thực phân quyền: người dùng chỉ xem được dữ liệu của chính mình.

Validate tất cả input (search query, param ID, form nhập).

Rate limiting cho API routes (đặc biệt AI, TMDb).

Sử dụng CSRF token nếu cần (NextAuth đã có).

Escape dữ liệu hiển thị để tránh XSS.

Cấu hình Content Security Policy (CSP) cơ bản.

Kiểm tra các dependency lỗ hổng (dùng Dependabot, Snyk).

4.3 Giám sát & Log
Tích hợp Sentry (hoặc Logtail) để bắt lỗi frontend/backend.

Ghi log các thao tác quan trọng (thêm/xóa phim, gọi AI) vào database bảng audit_logs.

Thiết lập alert nếu tỉ lệ lỗi tăng cao (có thể dùng Vercel Analytics).

4.4 Kiểm thử tổng thể trước khi launch
Test toàn bộ flow: đăng ký → onboarding → thêm phim → xem tiến độ → AI tóm tắt → đánh giá.

Kiểm tra responsive trên các thiết bị thật (điện thoại, tablet).

Test với dữ liệu lớn: import ~200 phim để xem performance của Library load.

Đo Core Web Vitals bằng Lighthouse: LCP < 2.5s, INP < 200ms, CLS < 0.1.

Kiểm tra Accessibility bằng axe DevTools.

Nhờ một người bạn dùng thử và ghi nhận phản hồi.

4.5 Launch
Chuyển trạng thái repository sang public (nếu muốn) hoặc giữ private.

Viết README hướng dẫn cài đặt local nếu là open-source.

Đăng bài giới thiệu lên mạng xã hội cá nhân (nếu muốn chia sẻ).

Theo dõi log lỗi trong 48h đầu.

BẢNG ĐÁNH GIÁ MỨC ĐỘ SẴN SÀNG PRODUCTION (Production Readiness Scorecard)
Chấm điểm từng hạng mục từ 1 (kém) đến 5 (xuất sắc). Web đạt ≥ 4.0 ở tất cả các mục thì có thể tự tin ra mắt.

Tiêu chí Mô tả Điểm mục tiêu
Bảo mật API key được bảo vệ, auth đúng, không rò rỉ dữ liệu cá nhân, validate input, rate limit 4.5
Hiệu năng Thời gian tải trang chính < 2.5s, tương tác mượt, không giật khi filter 4.0
Dữ liệu Đồng bộ TMDb ổn định, metadata đầy đủ, backup tự động, không mất mát dữ liệu 4.5
Trải nghiệm người dùng Flow rõ ràng, ít click để đạt mục tiêu, phản hồi nhanh, empty state hữu ích, mobile tốt 4.5
Tính năng cốt lõi MVP hoạt động trơn tru: thêm phim, theo dõi tiến độ, AI tóm tắt/gợi ý 5.0
Khả năng mở rộng Database được thiết kế linh hoạt, code module dễ thêm tính năng mới 4.0
Giám sát & Vận hành Có logging, alert, backup, dễ khôi phục 4.0
Điều kiện bắt buộc:

Không có lỗ hổng nghiêm trọng (SQL injection, XSS).

Tất cả API keys đều nằm ở server.

Người dùng chỉ truy cập được dữ liệu của chính họ (kể cả nếu sau này có multi-user).

LỘ TRÌNH TRIỂN KHAI KHUYẾN NGHỊ (Thời gian ước tính cho 1 developer)
Tuần 1-2: Phase 0 + Phase 1 cơ bản (Login, Search, Thêm phim, Dashboard đơn giản).

Tuần 3-4: Phase 1 hoàn thiện (TV Show progress, Library filter, Continue Watching).

Tuần 5-6: Phase 2 (AI Summary, AI Recommend) + kiểm thử.

Tuần 7: Phase 3 (Stats, Calendar, Lists, Mood) + cải thiện UX.

Tuần 8: Phase 4 (Production setup, security, monitoring) + Launch.

Sau đó liên tục cập nhật nhỏ theo phản hồi thực tế.
