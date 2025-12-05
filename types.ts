
export interface ShelfItem {
  id: string;
  category: 'BOOK' | 'SHOW' | 'MUSIC'; // Changed MOVIE to SHOW to cover Series
  title: string;
  author: string; // Author, Director, or Artist
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  pulseScore: number; // 0-150
  isArbiter: boolean;
  isVerified?: boolean; // NEW: Relevancy Badge
  isFounder?: boolean; // NEW: Creator Badge (Gustavolanconi)
  dailyPingsRemaining: number;
  following: string[]; // IDs of users following (Renamed concept to "Sintonizados")
  bookmarks: string[]; // IDs of saved posts ("Ecos")
  shelf: ShelfItem[]; // NEW: Cultural Shelf
  reactionStats?: { // "Legacy" System
    I: number;
    P: number;
    A: number;
    T: number;
  };
  hasVoiceBio?: boolean; // "Voice of the Soul"
}

export interface ReactionCounts {
  I: number; // Insight
  P: number; // Prático
  A: number; // Ampliador
  T: number; // Thank You
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userIsVerified?: boolean; // NEW
  userIsFounder?: boolean; // NEW
  content: string; // If voice, this acts as transcript or alt text
  isVoice?: boolean; // NEW: Voice Reply
  voiceDuration?: string; // NEW: e.g. "0:42"
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or 'other'
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userIsVerified?: boolean; // NEW
  userIsFounder?: boolean; // NEW
  userDominantReaction?: 'I' | 'P' | 'A' | 'T'; // For Avatar Ring Color
  coAuthorName?: string; // NEW: Duets
  content: string;
  timestamp: string;
  depthBadge?: boolean;
  isSlowMode?: boolean; // Slow Motion Debate
  isTimeCapsule?: boolean; // NEW: Future Post
  scheduledFor?: string; // NEW: Date string for capsule
  reactions: ReactionCounts;
  currentUserReaction?: 'I' | 'P' | 'A' | 'T' | null; // Tracks user's active vote
  pocketId?: string; // Optional: if null, it's a global post
  pocketName?: string;
  imageUrl?: string; // URL or Base64 of the attached image
  comments: Comment[]; // Comments/Replies
}

export interface Pocket {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  tags: string[];
  isMember: boolean;
  applicationQuestions: string[];
  isCampfire?: boolean; // "Campfire Mode"
  campfireTime?: string;
  created_by?: string;
}

export interface PingMsg {
  id: string;
  fromUser: string;
  fromAvatar: string;
  context: string;
  timestamp: string;
  isRead: boolean;
  messages: ChatMessage[]; // NEW: Conversation History
}

export type ViewState = 'AUTH' | 'HOME' | 'POCKETS' | 'PROFILE' | 'ARBITER' | 'INBOX';

export interface ApplicationForm {
  pocketId: string;
  answers: [string, string, string];
}