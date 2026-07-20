/**
 * Shared types cho tính năng cộng đồng — dùng trong UI components.
 * Backend trả về Date (ISO string), FE nhận string rồi convert khi cần.
 */

export interface CommunityUser {
  id: string;
  name: string | null;
  handle: string | null;
  image: string | null;
}

export interface PostItem {
  id: string;
  content: string;
  imagePath: string | null;
  movieRefType: string | null;
  movieRefTmdbId: number | null;
  movieRefTitle: string | null;
  movieRefPoster: string | null;
  isSpoiler: boolean;
  communityRating: number | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  likedByMe: boolean;
  author: CommunityUser;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: CommunityUser;
}

export interface NotificationItem {
  id: string;
  kind: "post.like" | "post.comment" | "user.follow";
  postId: string | null;
  commentId: string | null;
  readAt: string | null;
  createdAt: string;
  actor: CommunityUser;
}

export interface FeedResponse {
  posts: PostItem[];
  nextCursor: string | null;
}

export interface CommentListResponse {
  comments: CommentItem[];
  nextCursor: string | null;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface PublicProfile {
  id: string;
  name: string | null;
  handle: string | null;
  image: string | null;
  bio: string | null;
  joinedAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isMe: boolean;
  isFollowing: boolean;
}

export interface TrendingMovie {
  tmdbId: number;
  type: string;
  title: string;
  poster: string | null;
  postCount: number;
  avgRating: number | null;
}

export interface MovieScoreResponse {
  avgScore: number | null;
  totalVotes: number;
  totalPosts: number;
}
