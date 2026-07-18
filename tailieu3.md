1. Định vị & Tên sản phẩm
   Định vị: Một web cá nhân để quản lý toàn bộ hành trình xem phim: muốn xem, đang xem dở, đã xem, bỏ dở, đánh giá, ghi chú, phân loại theo quốc gia/thể loại/nền tảng và gợi ý phim tiếp theo bằng AI.

Gợi ý tên:

CineFlow (dòng chảy phim ảnh)

PhimFlow (gần gũi tiếng Việt)

MovieNest (tổ ấm phim)

WatchVault (kho phim cá nhân)

2. Chức năng cốt lõi (MVP – Làm trước)
   Đây là những thứ giải quyết trực tiếp vấn đề của bạn.

A. Thư viện phim cá nhân – Trái tim của web
Mỗi phim/series cần các trạng thái rõ ràng: Muốn xem / Đang xem / Tạm dừng / Đã xem xong / Bỏ ngang / Yêu thích.

Với phim lẻ Với phim bộ/series
• Tên phim, năm, quốc gia, thể loại
• Poster, trailer, thời lượng
• Điểm cá nhân & ghi chú riêng
• Ngày bắt đầu & ngày xem xong
• Nền tảng đã xem (Netflix, VieON...) • Tên phim, mùa (season)
• Tổng số tập, đang xem tập mấy
• Tập tiếp theo cần xem
• Ngày xem tập gần nhất
• Trạng thái: đang chiếu / đã hoàn thành
B. Theo dõi tiến độ xem – Giải quyết "đang coi dở"
Đây phải là điểm mạnh nhất. Giao diện kiểu:

text
ĐANG XEM DỞ

1. Thám Tử Lừng Danh Conan | Đang xem: Tập 421 | Còn lại: 700+ tập
2. Hidden Love | Đang xem: Tập 12/25 | Lần xem gần nhất: 3 ngày trước
   Tính năng cần có: Nút +1 tập nhanh, tự tính % đã xem, nhắc phim bị bỏ quên >7 ngày, và các bộ lọc mạnh mẽ.

C. Phân loại mạnh mẽ
Ngoài phân loại cơ bản theo Quốc gia (Trung, Hàn, Nhật, Việt, Mỹ...) và Thể loại (Ngôn tình, Trinh thám, Anime...), hãy thêm phân loại theo Cảm xúc. Đây là điểm tạo sự khác biệt:

Xem để thư giãn / Xem khi buồn / Phim chữa lành

Phim ngược / Phim plot twist / Phim cần tập trung

3. Chức năng nâng cao – Tạo sự khác biệt với AI
   Đây là phần sẽ khiến web của bạn "thông minh" hơn hẳn các app ghi chú thông thường.

AI Tóm tắt không spoil: Bạn bỏ dở phim 2 tuần, AI sẽ tóm tắt nội dung tới đúng tập bạn đang xem, không tiết lộ tương lai. Đây là tính năng đáng làm nhất.

AI Gợi ý thông minh: Dựa trên lịch sử và gu cá nhân để gợi ý phim mới, giải thích lý do.

AI Phân tích gu xem: Đưa ra báo cáo kiểu "Bạn thích phim Trung hiện đại, nhịp nhẹ, chemistry tốt, kết đẹp".

AI Tạo playlist theo tâm trạng: "Tối nay muốn xem nhẹ đầu", "Muốn phim phá án như Conan".

4. Chức năng mở rộng (Làm sau khi MVP ổn định)
   Nhật ký xem phim (Diary): Ghi lại phim đã xem theo ngày, thống kê tuần/tháng.

Đánh giá chi tiết: Chấm điểm riêng cho diễn viên, cốt truyện, nhạc phim, độ cuốn, kết phim. Thêm tag cá nhân như "Chemistry tốt", "Đoạn giữa lê thê".

Danh sách tùy chỉnh: Tự tạo các list như "Top phim Trung đáng xem", "Phim cày cuối tuần".

Quản lý nguồn xem: Lưu link phim trên Netflix, VieON, iQIYI... (chỉ lưu link, không lưu file vi phạm bản quyền).

Chống quên phim: Tự nhắc "Bạn còn 3 phim sắp hết, nên xem nốt".

5. Kiến trúc & Công nghệ đề xuất
   Đây là stack tối ưu cho một dự án cá nhân:

Frontend: Next.js + TypeScript + TailwindCSS + shadcn/ui (làm dashboard rất đẹp và nhanh).

Backend: Next.js API Routes (gọn nhẹ, đủ dùng cho MVP) hoặc NestJS nếu muốn tách biệt.

Database: PostgreSQL (mạnh mẽ, miễn phí trên Supabase/Railway) + Prisma ORM.

Dữ liệu phim: TMDb API (miễn phí, cung cấp đầy đủ poster, mô tả, trailer, thể loại, quốc gia, diễn viên).

AI: OpenAI API (GPT-4o mini để tiết kiệm chi phí) cho các tác vụ tóm tắt, gợi ý, phân tích.

Auth: NextAuth.js (đăng nhập bằng Google/GitHub).

6. Lộ trình phát triển (Roadmap)
   Phase 1 – MVP cốt lõi (2-3 tuần):

Đăng nhập.

Tìm phim bằng TMDb API và thêm vào thư viện cá nhân.

Gắn trạng thái: Muốn xem / Đang xem / Đã xem / Bỏ dở.

Theo dõi tiến độ tập với phim bộ (nút +1 tập).

Lọc phim theo quốc gia, thể loại, trạng thái.

Phase 2 – Trải nghiệm thông minh (2 tuần):

Dashboard "Tiếp tục xem" và nhắc phim bị bỏ quên.

AI Gợi ý phim và AI Tóm tắt không spoil.

Đánh giá điểm cá nhân và ghi chú.

Phase 3 – Nâng cấp & Mở rộng:

Nhật ký xem phim, thống kê.

Tạo danh sách tùy chỉnh, quản lý nguồn xem.

(Tùy chọn) Chia sẻ list công khai, import từ Trakt/Letterboxd.
