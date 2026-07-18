1. Cấu trúc page đầy đủ cho web
   A. Nhóm page người dùng cơ bản
1. Landing Page

Dùng nếu sau này public sản phẩm.

Nội dung:

- Hero: Quản lý toàn bộ phim bạn đang xem
- Tính năng chính
- Demo dashboard
- Lợi ích: không quên phim, theo dõi tập, AI gợi ý
- CTA: Bắt đầu miễn phí

Nếu chỉ bạn dùng cá nhân thì landing có thể rất đơn giản.

2. Login / Register

Chức năng:

- Đăng nhập
- Đăng ký
- Quên mật khẩu
- Đăng nhập Google nếu muốn

UI nên đơn giản, không nhiều form. Với web cá nhân, có thể chỉ cần login email/password hoặc Google OAuth.

3. Onboarding Page

Sau khi đăng nhập lần đầu, hỏi gu phim:

- Bạn thích quốc gia nào?
- Thể loại hay xem?
- Phim lẻ hay phim bộ?
- Có thích anime không?
- Có thích phim Trung Quốc / Hàn / Mỹ / Nhật không?
- Có muốn AI gợi ý phim theo mood không?

Mục tiêu: lấy dữ liệu ban đầu để AI gợi ý tốt hơn.

B. Nhóm page chính 4. Dashboard

Đây là trang quan trọng nhất.

Nên có các block:

- Tiếp tục xem
- Phim đang xem dở
- Phim muốn xem
- Phim bị bỏ quên
- Gợi ý hôm nay
- Thống kê tháng này
- Tập tiếp theo cần xem

Ví dụ UI:

Xin chào, hôm nay bạn có 4 phim đang xem dở.

Nên xem tiếp:

1. Hidden Love - tập 12/25
2. Lighter and Princess - tập 18/36
3. Conan - tập 421

UX quan trọng: mở web lên là biết ngay nên xem tiếp cái gì.

5. My Library / Thư viện phim

Đây là nơi chứa tất cả phim.

Filter cần có:

- Trạng thái
- Quốc gia
- Thể loại
- Điểm cá nhân
- Năm phát hành
- Phim lẻ / phim bộ
- Nền tảng xem
- Đã xem / chưa xem / bỏ dở

View nên có:

- Grid poster
- List compact
- Table quản lý

Grid đẹp để xem poster, table tiện để quản lý nhiều phim.

6. Search / Discover

Trang tìm phim từ TMDb.

Chức năng:

- Search phim
- Search TV show
- Search diễn viên
- Lọc theo quốc gia
- Lọc theo năm
- Lọc theo thể loại
- Xem poster, mô tả, rating ngoài
- Thêm vào thư viện cá nhân

TMDb image API trả về poster/backdrop/logo cho movie, và TMDb cũng hướng dẫn cách build URL ảnh bằng base_url, file_size, file_path, nên phần poster/backdrop nên lấy qua TMDb thay vì tự lưu tay.

7. Movie Detail Page

Trang chi tiết phim lẻ.

Nội dung:

- Poster / backdrop
- Tên phim
- Năm phát hành
- Quốc gia
- Thể loại
- Thời lượng
- Đạo diễn / diễn viên
- Trailer nếu có
- Mô tả
- Trạng thái cá nhân
- Điểm cá nhân
- Ghi chú
- Nguồn xem
- Danh sách chứa phim này

Action chính:

- Thêm vào muốn xem
- Đánh dấu đang xem
- Đánh dấu đã xem
- Đánh giá
- Viết review
- Thêm vào list
- AI gợi ý phim tương tự

8. TV Show Detail Page

Trang chi tiết phim bộ.

Khác với phim lẻ, phải có season/episode.

Nội dung:

- Season list
- Episode list
- Tập đã xem
- Tập tiếp theo
- Tiến độ %
- Ngày xem gần nhất
- Trạng thái: đang xem / tạm dừng / drop / hoàn thành

Action nhanh:

- +1 tập
- Đánh dấu hết season
- Đánh dấu đã xem tới tập X
- Tóm tắt tới tập hiện tại
- Không spoil sau tập hiện tại

Đây là page cực kỳ quan trọng vì vấn đề của bạn là quản lý phim đang coi dở.

9. Continue Watching Page

Trang chuyên để xem tiếp.

Sắp xếp thông minh:

- Phim gần hết
- Phim lâu chưa xem
- Phim điểm cao
- Phim đang hot trong thư viện
- Phim có tập mới

Mỗi card nên có:

Tên phim
Poster
Tập hiện tại / tổng tập
Progress bar
Lần xem gần nhất
Nút +1 tập
Nút xem tiếp 10. Watchlist Page

Danh sách phim muốn xem.

Filter nên có:

- Quốc gia
- Thể loại
- Độ dài
- Phim lẻ / phim bộ
- Mood
- Mức ưu tiên

Thêm trường:

Priority:

- Rất muốn xem
- Xem sau
- Khi rảnh
- Có thể bỏ qua

11. Watching Page

Trang chỉ hiển thị phim đang xem.

Nên chia:

- Đang xem tích cực
- Đang xem dở lâu ngày
- Tạm dừng
- Gần hoàn thành

12. Completed Page

Danh sách đã xem xong.

Có thể lọc:

- Theo tháng
- Theo năm
- Theo điểm cá nhân
- Theo quốc gia
- Theo thể loại

13. Dropped / Paused Page

Trang phim bỏ ngang hoặc tạm dừng.

Mỗi phim nên có lý do drop:

- Chán
- Dài dòng
- Không hợp gu
- Bị spoil
- Không có thời gian
- Diễn xuất kém
- Nội dung xuống phong độ

Tính năng hay: AI phân tích lý do bạn thường drop phim để tránh gợi ý sai.

14. Calendar / Watch Diary

Trang lịch xem phim.

Nội dung:

- Ngày nào xem phim gì
- Xem bao nhiêu tập
- Xem bao nhiêu phút
- Ngày bắt đầu phim
- Ngày hoàn thành phim

View:

- Calendar month
- Timeline
- Year recap

Ý tưởng này tương tự kiểu “diary/watch history” mà các nền tảng tracking phim như Letterboxd/Trakt thường có, nhưng web của bạn nên làm cá nhân hóa hơn: mood, ghi chú, lý do xem, lý do drop. Trakt API cũng có các endpoint liên quan watchlist/history/rating, cho thấy mô hình watch history/watchlist là pattern phổ biến của sản phẩm tracking phim.

15. Reviews / Ratings Page

Trang quản lý đánh giá cá nhân.

Rating không nên chỉ có 1 điểm tổng. Nên có:

Điểm tổng
Cốt truyện
Diễn viên
Cảm xúc
Độ cuốn
Nhạc phim
Kết phim
Khả năng xem lại

Tag review nhanh:

- Nam chính hay
- Nữ chính dễ thương
- Chemistry tốt
- Plot twist tốt
- Đoạn giữa lê thê
- Kết hụt
- Càng xem càng hay
- Overrated
- Underrated

16. Lists Page

Danh sách tùy chỉnh.

Ví dụ:

- Top phim Trung Quốc đáng xem
- Phim ngôn tình nhẹ nhàng
- Phim ngược
- Phim thanh xuân học đường
- Anime cần xem
- Phim xem lại
- Phim đã drop nhưng có thể quay lại

Mỗi list có:

- Tên list
- Mô tả
- Public/private nếu sau này làm social
- Sắp xếp thủ công
- Sắp xếp theo điểm
- Sắp xếp theo ngày thêm

17. Mood Page

Trang chọn phim theo tâm trạng.

Mood gợi ý:

- Muốn nhẹ đầu
- Muốn cười
- Muốn phim ngược
- Muốn chữa lành
- Muốn phá án
- Muốn hành động
- Muốn phim ngắn dưới 2 tiếng
- Muốn cày đêm
- Muốn xem cùng bạn bè

Đây là điểm khác biệt hay hơn watchlist bình thường.

18. AI Recommendation Page

Trang AI gợi ý.

Chức năng:

- Gợi ý phim theo gu
- Gợi ý phim theo mood
- Gợi ý phim tương tự phim đã thích
- Gợi ý phim nên xem tiếp
- Gợi ý phim nên drop
- Gợi ý phim nên xem nốt vì gần hết

Ví dụ:

Bạn thường thích phim Trung Quốc hiện đại, nhẹ nhàng, chemistry tốt.
Hôm nay nên xem:

1. When I Fly Towards You
2. Put Your Head on My Shoulder
3. A Love So Beautiful
4. AI No-Spoiler Summary Page

Trang tóm tắt phim đang xem dở.

Quan trọng nhất là có lựa chọn:

Tóm tắt tới tập hiện tại
Không spoil sau tập hiện tại

Input:

- Chọn phim
- Chọn đang xem tới tập mấy
- Chọn độ dài tóm tắt

Output:

- Nhân vật chính hiện tại
- Mâu thuẫn chính
- Những sự kiện đã xảy ra
- Điều cần nhớ trước khi xem tiếp

20. Taste Profile Page

Trang phân tích gu phim.

Hiển thị:

- Quốc gia xem nhiều nhất
- Thể loại thích nhất
- Thể loại hay drop nhất
- Độ dài phim phù hợp nhất
- Điểm trung bình theo quốc gia
- Điểm trung bình theo thể loại
- Diễn viên/đạo diễn hay xem

AI kết luận:

Gu của bạn:

- Thích phim Trung Quốc hiện đại
- Thích romance nhẹ nhưng có cảm xúc
- Không thích phim quá lê thê
- Dễ drop phim dài trên 40 tập

21. Stats / Analytics Page

Trang thống kê.

Nên có:

- Tổng phim đã xem
- Tổng tập đã xem
- Tổng giờ xem
- Phim hoàn thành tháng này
- Phim drop tháng này
- Quốc gia xem nhiều nhất
- Thể loại xem nhiều nhất
- Top phim điểm cao nhất
- Top phim xem lâu nhất

Biểu đồ:

- Bar chart theo quốc gia
- Pie chart theo thể loại
- Line chart số tập xem theo ngày
- Heatmap lịch xem

22. Platforms / Sources Page

Quản lý nơi xem phim.

Nguồn xem:

- Netflix
- iQIYI
- WeTV
- YouTube
- Bilibili
- Disney+
- FPT Play
- VieON
- File local
- Khác

Mỗi phim có thể lưu:

- Đang xem ở đâu
- Link xem
- Có phụ đề Việt không
- Chất lượng phụ đề
- Có quảng cáo không

23. Import / Export Page

Tính năng nâng cao.

Import từ:

- File CSV
- JSON backup
- Trakt nếu sau này tích hợp
- Letterboxd CSV nếu có format phù hợp

Export:

- CSV
- JSON
- Backup toàn bộ dữ liệu

24. Notification / Reminder Page

Quản lý nhắc nhở.

Ví dụ:

- Nhắc xem tiếp phim bị bỏ quên 7 ngày
- Nhắc phim đang xem sắp hết
- Nhắc phim mới thêm nhưng chưa xem
- Nhắc tổng kết tuần

25. Settings Page

Cài đặt chung.

- Theme sáng/tối
- Ngôn ngữ
- Quốc gia ưu tiên
- Thể loại ưu tiên
- Chuẩn điểm: 5 sao / 10 điểm / 100 điểm
- Dữ liệu AI được dùng như thế nào
- Export dữ liệu
- Xóa tài khoản

26. Profile Page

Thông tin cá nhân.

- Avatar
- Tên hiển thị
- Bio
- Gu phim nổi bật
- Tổng phim đã xem
- Top thể loại

Nếu sau này có social thì profile có thể public.

27. Admin / Data Management Page

Vì ban đầu bạn làm cá nhân, admin đơn giản là quản lý dữ liệu.

- Kiểm tra phim bị trùng
- Merge phim trùng
- Sửa metadata
- Re-sync TMDb
- Xóa dữ liệu lỗi
- Quản lý API key

28. Error Pages

Cần có:

- 404 Not Found
- 500 Server Error
- Empty State
- Offline Page
- Maintenance Page

Empty state rất quan trọng. Ví dụ chưa có phim nào thì không nên để trang trắng, mà hiện:

Bạn chưa thêm phim nào.
Hãy tìm phim đầu tiên để bắt đầu quản lý watchlist. 2. Sitemap tổng thể
/
├── /login
├── /register
├── /onboarding
├── /dashboard
├── /library
│ ├── /library/all
│ ├── /library/watching
│ ├── /library/watchlist
│ ├── /library/completed
│ ├── /library/paused
│ └── /library/dropped
├── /discover
├── /movie/[id]
├── /show/[id]
├── /continue-watching
├── /calendar
├── /diary
├── /reviews
├── /lists
│ └── /lists/[id]
├── /mood
├── /ai
│ ├── /ai/recommend
│ ├── /ai/summary
│ ├── /ai/taste-profile
│ └── /ai/compare
├── /stats
├── /platforms
├── /reminders
├── /import-export
├── /profile
├── /settings
├── /admin
└── /help 3. Bộ skill/chức năng áp dụng toàn web

Ở đây mình gọi “skill” là các năng lực dùng xuyên suốt toàn bộ website.

Skill 1: Global Search

Tìm tất cả:

- Phim
- Series
- Diễn viên
- Danh sách
- Ghi chú
- Review
- Thể loại
- Quốc gia

Nên có command palette kiểu:

Ctrl + K

Gõ:

hidden love
ngôn tình trung quốc
đang xem dở
phim drop
Skill 2: Smart Filter

Filter dùng chung toàn web.

- Status
- Country
- Genre
- Year
- Rating
- Runtime
- Platform
- Mood
- Tags

Filter nên lưu lại preset:

- Phim Trung Quốc đang xem
- Phim ngôn tình đã hoàn thành
- Anime đang xem dở
- Phim điểm trên 8
  Skill 3: Watch Progress Engine

Bộ xử lý tiến độ xem.

- +1 tập
- Đánh dấu đã xem tới tập X
- Tính % hoàn thành
- Tính số tập còn lại
- Tính thời gian cần để xem xong
- Phát hiện phim bỏ quên
  Skill 4: Status System

Trạng thái chung:

want_to_watch
watching
paused
completed
dropped
rewatching
favorite
hidden

UI badge:

Muốn xem
Đang xem
Tạm dừng
Đã xong
Bỏ ngang
Xem lại
Yêu thích
Skill 5: AI Recommendation

AI gợi ý dựa trên:

- Phim đã xem
- Điểm cá nhân
- Thể loại thích
- Quốc gia thích
- Lý do drop
- Mood hiện tại
- Phim đang xem dở
  Skill 6: AI No-Spoiler Summary

Luôn có rule:

Không tóm tắt quá tập người dùng đã xem.
Không spoil tập sau.

Nên có nút:

Tóm tắt để xem tiếp
Skill 7: AI Taste Memory

AI ghi nhớ gu phim trong database nội bộ:

- Thích quốc gia nào
- Thích thể loại nào
- Không thích gì
- Hay drop vì lý do gì
- Độ dài phim phù hợp
  Skill 8: Rating & Review Engine

Dùng chung cho movie/show/episode.

- Điểm tổng
- Điểm chi tiết
- Review text
- Tag cảm xúc
- Có xem lại không
  Skill 9: Reminder Engine

Nhắc thông minh:

- Phim đang xem dở quá lâu
- Phim gần hết
- Phim mới thêm nhưng chưa xem
- Tổng kết tuần
  Skill 10: Metadata Sync

Đồng bộ từ TMDb:

- Poster
- Backdrop
- Thể loại
- Quốc gia
- Diễn viên
- Ngày phát hành
- Season/episode

TMDb có endpoint cho movie images và hướng dẫn tạo URL ảnh, nên metadata/poster nên sync từ TMDb thay vì nhập tay.

Skill 11: Duplicate Detection

Phát hiện phim trùng:

- Cùng TMDb ID
- Cùng tên + năm
- Cùng tên tiếng Anh / tên gốc
  Skill 12: Data Export / Backup

Luôn có:

- Export CSV
- Export JSON
- Backup toàn bộ dữ liệu
- Restore dữ liệu
  Skill 13: Privacy & Security

Cần có:

- Không public dữ liệu cá nhân mặc định
- Xác thực người dùng
- Bảo vệ API
- Validate input
- Rate limit
- Không lộ API key TMDb

OWASP Top 10 là tài liệu chuẩn để nhận diện các rủi ro bảo mật web quan trọng, nên phần code backend nên kiểm tra theo nhóm lỗi như access control, injection, insecure design và security misconfiguration.

4. UI/UX system áp dụng toàn web
   A. Nguyên tắc UX chính

Áp dụng Nielsen 10 usability heuristics:

1. Luôn hiển thị trạng thái hệ thống
2. Dùng ngôn ngữ gần với người dùng
3. Cho người dùng undo/sửa sai
4. Thiết kế nhất quán
5. Ngăn lỗi trước khi lỗi xảy ra
6. Hiển thị lựa chọn thay vì bắt nhớ
7. Có shortcut cho người dùng quen
8. Giao diện tối giản
9. Thông báo lỗi dễ hiểu
10. Có hướng dẫn khi cần

Các nguyên tắc này khớp trực tiếp với web phim: khi bấm +1 tập phải có feedback ngay, khi xóa phim phải có confirm/undo, filter/status phải nhất quán toàn bộ app.

B. Design style đề xuất

Phong cách nên là:

Dark cinematic UI
Poster-first layout
Card-based interface
Glass/soft shadow nhẹ
Accent color theo mood hoặc genre

Màu đề xuất:

Background: đen xanh / charcoal
Surface: xám đậm
Primary: đỏ cinema hoặc tím xanh
Success: xanh lá cho completed
Warning: vàng cho paused
Danger: đỏ cho dropped
Info: xanh dương cho watching
C. Component system

Material Design 3 định nghĩa components là các building blocks tương tác để tạo UI và chia chúng theo mục đích sử dụng; vì vậy bạn nên xây component system ngay từ đầu thay vì code mỗi trang mỗi kiểu.

Component cần có:

MovieCard
ShowCard
EpisodeCard
ProgressBar
StatusBadge
RatingStars
RatingScore
PosterImage
FilterDrawer
SearchBar
CommandPalette
EmptyState
SkeletonLoading
Toast
ConfirmDialog
BottomSheet
Tabs
Calendar
Timeline
StatsCard
AIInsightCard
D. Layout chuẩn

Desktop:

Sidebar trái
Top search bar
Main content
Right panel cho AI/gợi ý nhanh

Mobile:

Bottom navigation
Search full screen
Filter bottom sheet
Card grid 2 cột

Material Design 3 có navigation drawer cho màn hình lớn để chuyển giữa các view trong app, nên desktop nên dùng sidebar/drawer; còn mobile nên dùng bottom navigation hoặc tab để thao tác nhanh.

E. Navigation chính

Sidebar nên có:

Dashboard
Tiếp tục xem
Thư viện
Khám phá
Watchlist
Calendar
AI
Stats
Lists
Settings

Không nên nhét quá nhiều item cấp 1. Các mục như completed, dropped, paused nên nằm trong Library.

F. UX cho phim bộ

Phim bộ phải thao tác cực nhanh.

Card phim bộ nên có:

Poster
Tên phim
Tập hiện tại / tổng tập
Progress bar
Lần xem gần nhất
Nút +1 tập
Menu ba chấm

Không nên bắt người dùng vào detail page chỉ để tăng 1 tập.

G. UX cho filter

Filter nên có 2 lớp:

Quick filter:

- Đang xem
- Muốn xem
- Đã xem
- Bỏ dở

Advanced filter:

- Quốc gia
- Thể loại
- Điểm
- Năm
- Nguồn xem
- Mood
  H. UX cho AI

AI không nên hiện như chatbot trống rỗng. Nên có action rõ:

- Gợi ý phim tối nay
- Tóm tắt phim đang xem dở
- Phân tích gu của tôi
- Tạo list phim theo mood
- Nên xem tiếp hay drop phim này?

Mỗi AI output nên có nút:

Lưu gợi ý
Thêm vào watchlist
Không hợp gu
Gợi ý giống thế này nữa
I. Accessibility

WCAG 2.2 chia accessibility thành 4 nguyên tắc: perceivable, operable, understandable, robust; khi làm UI cần đảm bảo text dễ đọc, keyboard dùng được, focus rõ, form/lỗi dễ hiểu, và semantic HTML tốt.

Checklist:

- Contrast đủ rõ
- Font không quá nhỏ
- Có label cho input
- Dùng được bằng bàn phím
- Focus ring rõ
- Alt text cho poster
- Không chỉ dùng màu để truyền đạt trạng thái
- Error message dễ hiểu
- Button đủ lớn trên mobile
  J. Performance UX

Core Web Vitals nên đặt mục tiêu:

LCP <= 2.5s
INP <= 200ms
CLS <= 0.1

web.dev định nghĩa LCP là loading performance, INP là interactivity, CLS là visual stability, và đưa các ngưỡng trên làm mục tiêu trải nghiệm tốt.

Áp dụng cho web phim:

- Lazy load poster
- Dùng image optimization
- Skeleton loading khi tải poster
- Cache search TMDb
- Infinite scroll có kiểm soát
- Không load toàn bộ thư viện một lần
- Debounce search

5. Bộ page theo mức ưu tiên làm
   MVP bắt buộc
1. Login
1. Onboarding
1. Dashboard
1. Search / Discover
1. Library
1. Movie Detail
1. TV Show Detail
1. Continue Watching
1. Watchlist
1. Settings
   Bản V1 nên có
1. Completed
1. Dropped / Paused
1. Reviews / Ratings
1. Lists
1. Stats
1. AI Recommendation
1. AI No-Spoiler Summary
   Bản V2 nâng cấp
1. Calendar / Diary
1. Mood Page
1. Taste Profile
1. Platforms / Sources
1. Import / Export
1. Reminder
1. Admin Data Management
   Bản V3 nếu muốn thành sản phẩm lớn
1. Public Profile
1. Share List
1. Friend Activity
1. Community Reviews
1. Trending Page
1. Mobile App / PWA
1. User flow quan trọng
   Flow 1: Thêm phim mới
   Search phim
   → Chọn phim từ TMDb
   → Xem detail
   → Chọn trạng thái
   → Thêm vào thư viện
   → Gắn tag/mood nếu muốn
   Flow 2: Xem tiếp phim bộ
   Dashboard
   → Continue Watching
   → Bấm +1 tập
   → Progress cập nhật
   → Nếu hết phim, hỏi đánh dấu completed
   Flow 3: Lâu rồi chưa xem
   Dashboard báo phim bị bỏ quên
   → Bấm AI tóm tắt
   → Đọc tóm tắt không spoil
   → Chọn xem tiếp hoặc tạm drop
   Flow 4: Không biết xem gì
   Mood Page
   → Chọn tâm trạng
   → AI gợi ý 5 phim
   → Thêm vào watchlist hoặc xem ngay
   Flow 5: Đánh giá sau khi xem xong
   Completed
   → Rating
   → Review
   → Tag cảm xúc
   → AI cập nhật taste profile
1. Database module tương ứng page
   users
   user_preferences
   media_items
   movies
   tv_shows
   seasons
   episodes
   watch_items
   watch_progress
   watch_sessions
   ratings
   reviews
   tags
   media_tags
   lists
   list_items
   platforms
   media_sources
   ai_recommendations
   ai_summaries
   taste_profiles
   reminders
   audit_logs
1. API/module backend cần có
   AuthModule
   UserModule
   TMDbModule
   MediaModule
   LibraryModule
   WatchProgressModule
   RatingModule
   ReviewModule
   ListModule
   StatsModule
   AIModule
   ReminderModule
   ImportExportModule
   SettingsModule
1. Tech stack đề xuất

Với web này, stack tối ưu, hiện đại và dễ làm:

Frontend + Backend:
Next.js + TypeScript

UI:
TailwindCSS + shadcn/ui

Database:
PostgreSQL

ORM:
Prisma hoặc Drizzle

Auth:
Auth.js / NextAuth

Data phim:
TMDb API

AI:
OpenAI API hoặc model tương đương

Chart:
Recharts hoặc Tremor

Deploy:
Vercel + Neon/Supabase

Cache:
Upstash Redis nếu cần

PWA:
Next PWA sau này

Nếu bạn muốn làm nhanh nhất: Next.js full-stack + PostgreSQL + Prisma + TMDb API + shadcn/ui.

10. Checklist UI/UX toàn web

- Mỗi page có title rõ
- Mỗi action có feedback
- Có loading state
- Có empty state
- Có error state
- Có undo cho thao tác nguy hiểm
- Filter nhất quán
- Status badge nhất quán
- Search nhanh
- Mobile dùng tốt
- Không quá nhiều nút trên card
- +1 tập phải thao tác trong 1 click
- AI output có action tiếp theo
- Không spoil mặc định
- Poster load mượt
- Dark mode đẹp

11. Checklist bảo mật/kỹ thuật

- API key TMDb chỉ nằm ở server
- Validate input
- Auth bảo vệ route cá nhân
- Không để user khác đọc library nếu sau này multi-user
- Rate limit search/API
- Backup database
- Export dữ liệu cá nhân
- Log lỗi
- Không lưu dữ liệu nhạy cảm không cần thiết
- Dùng HTTPS

12. Bản chốt hoàn thiện

Nếu gom lại, web nên có 6 trụ cột:

1. Library
   Quản lý toàn bộ phim.

2. Progress
   Theo dõi phim đang xem dở, đặc biệt phim bộ.

3. Discovery
   Tìm phim bằng TMDb, thêm vào watchlist.

4. AI
   Gợi ý, tóm tắt không spoil, phân tích gu.

5. Stats
   Thống kê thói quen xem phim.

6. UX System
   Giao diện poster-first, thao tác nhanh, mobile tốt, dark cinematic.

Bản MVP nên làm trước:

Dashboard
Library
Search/Discover
Movie Detail
TV Show Detail
Continue Watching
Watchlist
AI Recommendation
AI No-Spoiler Summary
Settings

Điểm khác biệt mạnh nhất của web này nên là:

Không chỉ lưu phim.
Nó giúp bạn biết nên xem tiếp phim nào, đang dở tới đâu, vì sao nên xem tiếp, và gợi ý phim mới đúng gu mà khôn
