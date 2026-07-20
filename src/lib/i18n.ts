/**
 * i18n đơn giản cho CineOS — hỗ trợ 2 ngôn ngữ vi / en.
 *
 * Cách dùng:
 * - Trong component: `const t = useT(); t("common.save")` → "Lưu" / "Save".
 * - Đổi ngôn ngữ: cập nhật `pref.language` qua usePreferences → useT() sẽ tự render lại.
 *
 * Lưu ý: chuỗi tiếng Việt hiện đang được hardcode trong nhiều component.
 * Hệ thống này cung cấp dictionary cho các chuỗi thường gặp; component nào cần
 * đa ngôn ngữ thì import hook và thay chuỗi cứng bằng `t("key")`.
 */

export type Lang = "vi" | "en";

type Dict = Record<string, string>;

const VI: Dict = {
  // Common
  "common.save": "Lưu",
  "common.cancel": "Huỷ",
  "common.delete": "Xoá",
  "common.edit": "Sửa",
  "common.close": "Đóng",
  "common.loading": "Đang tải...",
  "common.saving": "Đang lưu...",
  "common.saved": "Đã lưu.",
  "common.error": "Có lỗi xảy ra.",
  "common.confirm": "Xác nhận",
  "common.back": "Quay lại",
  "common.next": "Tiếp tục",
  "common.search": "Tìm kiếm",
  "common.filter": "Lọc",
  "common.all": "Tất cả",

  // Nav (header)
  "nav.home": "Trang chủ",
  "nav.library": "Thư viện",
  "nav.discover": "Khám phá",
  "nav.watchlist": "Watchlist",
  "nav.stats": "Thống kê",
  "nav.continue-watching": "Tiếp tục xem",
  "nav.lists": "Danh sách phim",
  "nav.calendar": "Lịch xem phim",
  "nav.ai": "Trợ lý AI",
  "nav.settings": "Cài đặt",
  "nav.notifications": "Thông báo",
  "nav.quick-add": "Thêm nhanh",
  "nav.sign-out": "Đăng xuất",
  "nav.sign-in": "Đăng nhập",
  "nav.activate": "Kích Hoạt",
  "nav.features": "Tính năng",
  "nav.how-it-works": "Cách hoạt động",
  "nav.start": "Bắt đầu",
  "notifications.mark-all-read": "Đánh dấu đã đọc",
  "notifications.empty": "Không có thông báo nào.",

  // Settings
  "settings.title": "Cài đặt hệ thống",
  "settings.subtitle": "Quản lý cấu hình trải nghiệm xem phim, dữ liệu cá nhân và API.",
  "settings.section.account": "Thông tin cá nhân",
  "settings.section.preferences": "Sở thích (AI dùng để gợi ý)",
  "settings.section.display": "Khung đánh giá & hiển thị",
  "settings.theme.label": "Chế độ hiển thị",
  "settings.theme.dark": "Cinematic Dark (mặc định)",
  "settings.theme.light": "Light Mode",
  "settings.language.label": "Ngôn ngữ hiển thị",
  "settings.rating.label": "Thang điểm đánh giá",
  "settings.rating.hint": "Áp dụng cho slider đánh giá trên trang chi tiết phim.",
  "settings.fav.genres": "Thể loại yêu thích",
  "settings.fav.countries": "Quốc gia yêu thích",
  "settings.fav.tv-prefer": "Ưu tiên phim bộ hơn phim lẻ khi AI gợi ý",

  // TMDb card
  "tmdb.title": "TMDb API Key (tùy chọn)",
  "tmdb.desc":
    "Hệ thống đã có khoá TMDb mặc định để tra cứu phim. Bạn có thể dán khoá cá nhân (v3 auth) để dùng hạn mức và quota riêng. Khoá lưu ở cookie trình duyệt.",
  "tmdb.status": "Trạng thái hiện tại",
  "tmdb.user": "Khoá cá nhân — dùng dữ liệu thật",
  "tmdb.server": "Khoá hệ thống — dữ liệu thật",
  "tmdb.mock": "Mock Mode — dữ liệu giả lập",
  "tmdb.server-key": "Khoá server",
  "tmdb.user-key": "Khoá cá nhân",
  "tmdb.server-key.yes": "đã cấu hình",
  "tmdb.server-key.no": "trống",
  "tmdb.user-key.yes": "đã lưu",
  "tmdb.user-key.no": "trống",
  "tmdb.source": "Nguồn",
  "tmdb.input.label": "Khoá cá nhân (TMDb v3 auth)",
  "tmdb.input.placeholder": "Nhập khoá của bạn hoặc để trống...",
  "tmdb.save": "Lưu khoá",
  "tmdb.clear": "Xoá khoá",
  "tmdb.get-key": "Lấy khoá miễn phí tại",

  // Theme toggle
  "theme.toggle.dark": "Dark",
  "theme.toggle.light": "Light",
  "theme.toggle.aria.dark": "Chuyển sang Light Mode",
  "theme.toggle.aria.light": "Chuyển sang Cinematic Dark",

  // AI Chat
  "chat.title": "CineBot AI",
  "chat.placeholder": "Hỏi bất cứ điều gì về phim...",
  "chat.send": "Gửi",
  "chat.new": "Hội thoại mới",
  "chat.history": "Lịch sử trò chuyện",
  "chat.typing": "CineBot đang suy nghĩ...",
  "chat.error": "Có lỗi xảy ra. Thử lại nhé.",
  "chat.welcome": "Xin chào! Mình là CineBot 🤖 Hãy hỏi mình bất kỳ câu hỏi nào về phim nhé!",
  "chat.suggest.today": "Gợi ý phim hôm nay 🎬",
  "chat.suggest.korean": "Phim Hàn hay nhất? 🇰🇷",
  "chat.suggest.chill": "Phim nhẹ nhàng, chữa lành 🌿",
  "chat.suggest.similar": "Phim giống phim đang xem? 🍿",
  "chat.delete-confirm": "Bạn có chắc chắn muốn xoá phiên chat này?",

  // Community
  "nav.community": "Cộng đồng",
  "community.title": "Cộng đồng",
  "community.subtitle": "Chia sẻ cảm nhận, bình luận và kết nối với những người cùng gu phim.",
  "community.composer.placeholder": "Bạn đang nghĩ gì về phim hôm nay?",
  "community.composer.attach-movie": "Gắn phim",
  "community.composer.remove-movie": "Bỏ gắn phim",
  "community.composer.submit": "Đăng",
  "community.composer.submitting": "Đang đăng...",
  "community.composer.attach-image": "Thêm ảnh",
  "community.composer.remove-image": "Bỏ ảnh",
  "community.composer.empty": "Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!",
  "community.post.like": "Thích",
  "community.post.liked": "Đã thích",
  "community.post.comment": "Bình luận",
  "community.post.comments-count": "{count} bình luận",
  "community.post.likes-count": "{count} lượt thích",
  "community.post.delete-confirm": "Xoá bài viết này?",
  "community.post.movie-chip": "Đang nói về",
  "community.comment.placeholder": "Viết bình luận...",
  "community.comment.submit": "Gửi",
  "community.comment.delete": "Xoá",
  "community.comment.delete-confirm": "Xoá bình luận này?",
  "community.comment.empty": "Chưa có bình luận.",
  "community.profile.follow": "Theo dõi",
  "community.profile.following": "Đang theo dõi",
  "community.profile.unfollow-confirm": "Bỏ theo dõi {name}?",
  "community.profile.followers": "Người theo dõi",
  "community.profile.following-count": "Đang theo dõi",
  "community.profile.posts": "Bài viết",
  "community.profile.no-posts": "Chưa đăng bài viết nào.",
  "community.profile.not-found": "Không tìm thấy người dùng này.",
  "community.profile.view-public": "Xem trang cá nhân công khai",
  "community.notif.like": "{actor} đã thích bài viết của bạn",
  "community.notif.comment": "{actor} đã bình luận vào bài viết của bạn",
  "community.notif.follow": "{actor} đã bắt đầu theo dõi bạn",
  "community.search.placeholder": "Tìm bạn bè...",
  "community.search.empty": "Không tìm thấy ai.",
  "community.error.create-post": "Không thể đăng bài.",
  "community.error.like": "Không thể thích bài viết.",
  "community.error.comment": "Không thể gửi bình luận.",
  "community.error.follow": "Không thể theo dõi.",
  "community.error.delete": "Không thể xoá.",
  "community.feed.loading": "Đang tải bài viết...",
};

const EN: Dict = {
  // Common
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.close": "Close",
  "common.loading": "Loading...",
  "common.saving": "Saving...",
  "common.saved": "Saved.",
  "common.error": "An error occurred.",
  "common.confirm": "Confirm",
  "common.back": "Back",
  "common.next": "Next",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.all": "All",

  // Nav
  "nav.home": "Home",
  "nav.library": "Library",
  "nav.discover": "Discover",
  "nav.watchlist": "Watchlist",
  "nav.stats": "Stats",
  "nav.continue-watching": "Continue Watching",
  "nav.lists": "Lists",
  "nav.calendar": "Calendar",
  "nav.ai": "AI Assistant",
  "nav.settings": "Settings",
  "nav.notifications": "Notifications",
  "nav.quick-add": "Quick Add",
  "nav.sign-out": "Sign out",
  "nav.sign-in": "Sign in",
  "nav.activate": "Activate",
  "nav.features": "Features",
  "nav.how-it-works": "How it works",
  "nav.start": "Get started",
  "notifications.mark-all-read": "Mark all as read",
  "notifications.empty": "No notifications.",

  // Settings
  "settings.title": "System Settings",
  "settings.subtitle": "Manage your viewing experience, personal data, and API.",
  "settings.section.account": "Personal Info",
  "settings.section.preferences": "Preferences (used by AI recommendations)",
  "settings.section.display": "Rating & Display",
  "settings.theme.label": "Theme",
  "settings.theme.dark": "Cinematic Dark (default)",
  "settings.theme.light": "Light Mode",
  "settings.language.label": "Display language",
  "settings.rating.label": "Rating scale",
  "settings.rating.hint": "Applies to rating sliders on movie detail pages.",
  "settings.fav.genres": "Favorite genres",
  "settings.fav.countries": "Favorite countries",
  "settings.fav.tv-prefer": "Prefer TV shows over movies when AI recommends",

  // TMDb
  "tmdb.title": "TMDb API Key (optional)",
  "tmdb.desc":
    "The system already has a default TMDb key to look up movies. You can paste your personal key (v3 auth) to use your own quota. The key is stored in a browser cookie.",
  "tmdb.status": "Current status",
  "tmdb.user": "Personal key — using real data",
  "tmdb.server": "Server key — using real data",
  "tmdb.mock": "Mock Mode — simulated data",
  "tmdb.server-key": "Server key",
  "tmdb.user-key": "Personal key",
  "tmdb.server-key.yes": "configured",
  "tmdb.server-key.no": "empty",
  "tmdb.user-key.yes": "saved",
  "tmdb.user-key.no": "empty",
  "tmdb.source": "Source",
  "tmdb.input.label": "Personal key (TMDb v3 auth)",
  "tmdb.input.placeholder": "Enter your key or leave empty...",
  "tmdb.save": "Save key",
  "tmdb.clear": "Clear key",
  "tmdb.get-key": "Get a free key at",

  // Theme toggle
  "theme.toggle.dark": "Dark",
  "theme.toggle.light": "Light",
  "theme.toggle.aria.dark": "Switch to Light Mode",
  "theme.toggle.aria.light": "Switch to Cinematic Dark",

  // AI Chat
  "chat.title": "CineBot AI",
  "chat.placeholder": "Ask anything about movies...",
  "chat.send": "Send",
  "chat.new": "New Chat",
  "chat.history": "Chat History",
  "chat.typing": "CineBot is thinking...",
  "chat.error": "An error occurred. Please try again.",
  "chat.welcome": "Hello! I am CineBot 🤖 Ask me anything about movies!",
  "chat.suggest.today": "Movie recommendation today 🎬",
  "chat.suggest.korean": "Best Korean dramas? 🇰🇷",
  "chat.suggest.chill": "Chill & healing movies 🌿",
  "chat.suggest.similar": "Movies similar to what I'm watching? 🍿",
  "chat.delete-confirm": "Are you sure you want to delete this chat session?",

  // Community
  "nav.community": "Community",
  "community.title": "Community",
  "community.subtitle": "Share your thoughts, comment, and connect with people of similar taste.",
  "community.composer.placeholder": "What's on your mind about movies today?",
  "community.composer.attach-movie": "Tag a movie",
  "community.composer.remove-movie": "Remove movie",
  "community.composer.submit": "Post",
  "community.composer.submitting": "Posting...",
  "community.composer.attach-image": "Add image",
  "community.composer.remove-image": "Remove image",
  "community.composer.empty": "No posts yet. Be the first to share!",
  "community.post.like": "Like",
  "community.post.liked": "Liked",
  "community.post.comment": "Comment",
  "community.post.comments-count": "{count} comments",
  "community.post.likes-count": "{count} likes",
  "community.post.delete-confirm": "Delete this post?",
  "community.post.movie-chip": "Talking about",
  "community.comment.placeholder": "Write a comment...",
  "community.comment.submit": "Send",
  "community.comment.delete": "Delete",
  "community.comment.delete-confirm": "Delete this comment?",
  "community.comment.empty": "No comments yet.",
  "community.profile.follow": "Follow",
  "community.profile.following": "Following",
  "community.profile.unfollow-confirm": "Unfollow {name}?",
  "community.profile.followers": "Followers",
  "community.profile.following-count": "Following",
  "community.profile.posts": "Posts",
  "community.profile.no-posts": "No posts yet.",
  "community.profile.not-found": "User not found.",
  "community.profile.view-public": "View public profile",
  "community.notif.like": "{actor} liked your post",
  "community.notif.comment": "{actor} commented on your post",
  "community.notif.follow": "{actor} started following you",
  "community.search.placeholder": "Search users...",
  "community.search.empty": "No users found.",
  "community.error.create-post": "Could not create the post.",
  "community.error.like": "Could not like the post.",
  "community.error.comment": "Could not post the comment.",
  "community.error.follow": "Could not follow.",
  "community.error.delete": "Could not delete.",
  "community.feed.loading": "Loading posts...",
};

const DICTS: Record<Lang, Dict> = { vi: VI, en: EN };

/** Internal — chỉ dùng cho tests để kiểm tra parity VI/EN. */
export const DICTS_INTERNAL = DICTS;

/** Lấy bản dịch của key theo ngôn ngữ. Fallback sang tiếng Việt nếu thiếu. */
export function translate(key: string, lang: Lang): string {
  return DICTS[lang][key] ?? DICTS.vi[key] ?? key;
}

/**
 * Đọc ngôn ngữ hiện tại từ DOM/localStorage (đồng bộ client-side).
 * Mặc định 'vi'. Nếu không tìm thấy → đọc <html lang>.
 */
export function readLanguage(): Lang {
  if (typeof window === "undefined") return "vi";
  try {
    const v = window.localStorage.getItem("cineos:language");
    if (v === "en" || v === "vi") return v;
  } catch {
    /* ignore */
  }
  const htmlLang = document.documentElement.lang;
  if (htmlLang === "en" || htmlLang === "vi") return htmlLang;
  return "vi";
}

import { useEffect, useState, useCallback } from "react";

/** Hook React trả về hàm t(key) theo ngôn ngữ hiện tại + lắng nghe thay đổi. */
export function useT() {
  const [lang, setLangState] = useState<Lang>("vi");

  useEffect(() => {
    const nextLang = readLanguage();
    const timer = setTimeout(() => {
      setLangState(nextLang);
    }, 0);
    const onStorage = () => setLangState(readLanguage());
    window.addEventListener("storage", onStorage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  return { t, lang, setLang: setLangState };
}
