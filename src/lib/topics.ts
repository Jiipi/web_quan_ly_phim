// Predefined topics for categorization
export const DEFAULT_TOPICS = [
  // Anime & Animation
  { name: "Anime", color: "#7C3AED", icon: "🎌", description: "Phim hoạt hình Nhật Bản" },
  { name: "Hoạt hình", color: "#2563EB", icon: "🎨", description: "Phim cartoon, 3D animation" },
  
  // Countries
  { name: "Trung Quốc", color: "#DC2626", icon: "🇨🇳", description: "Phim Trung Quốc" },
  { name: "Hàn Quốc", color: "#0D9488", icon: "🇰🇷", description: "K-Drama, phim Hàn" },
  { name: "Việt Nam", color: "#CA8A04", icon: "🇻🇳", description: "Phim Việt Nam" },
  { name: "Nhật Bản", color: "#DB2777", icon: "🇯🇵", description: "Phim Nhật Bản" },
  { name: "Mỹ", color: "#2563EB", icon: "🇺🇸", description: "Hollywood movies" },
  { name: "Thái Lan", color: "#7C3AED", icon: "🇹🇭", description: "Phim Thái Lan" },
  { name: "Ấn Độ", color: "#EA580C", icon: "🇮🇳", description: "Bollywood" },
  
  // Genres
  { name: "Drama", color: "#16A34A", icon: "🎭", description: "Phim tâm lý, chính kịch" },
  { name: "Hành động", color: "#DC2626", icon: "💥", description: "Action movies" },
  { name: "Kinh dị", color: "#7C3AED", icon: "👻", description: "Horror, thriller" },
  { name: "Hài", color: "#CA8A04", icon: "😂", description: "Comedy" },
  { name: "Lãng mạn", color: "#DB2777", icon: "❤️", description: "Romance" },
  { name: "Khoa học viễn tưởng", color: "#2563EB", icon: "🚀", description: "Sci-fi" },
  { name: "Giả tưởng", color: "#7C3AED", icon: "🧙", description: "Fantasy" },
  { name: "Chiến tranh", color: "#6B7280", icon: "⚔️", description: "War movies" },
  { name: "Phiêu lưu", color: "#16A34A", icon: "🗺️", description: "Adventure" },
  { name: "Trinh thám", color: "#0D9488", icon: "🔍", description: "Mystery, detective" },
  { name: "Documentary", color: "#6B7280", icon: "📽️", description: "Phim tài liệu" },
  { name: "Kids", color: "#CA8A04", icon: "👶", description: "Phim trẻ em" },
];

export function getTopicByName(name: string) {
  return DEFAULT_TOPICS.find((t) => t.name === name);
}
