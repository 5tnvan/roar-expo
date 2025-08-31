// types.ts

export type LanguageOption = {
  label: string;       // Human-readable language name
  lang_code: string; // Language.AR style
  gemini_code: string;   // ar-XA style
};

export type PushToken = {
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web' | string; // platform info
  device_id: string; // optional device identifier
};

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  bot_language?: string;
  app_language?: string;
  handle: string;
  intro: string;
  expo_push_tokens?: PushToken[];
  subCount?: number;
  isSub?: boolean;
  capsuleCount?: number;
};

export type CapsuleStats = {
  capsule_id: string;
  views: number;
  likes: number;
  calls: number;
  duration: number; // in seconds
  share: number;
};

export type CapsuleCall = {
  id: string;
  capsule_id: string;
  duration: number; // in seconds
  transcript: string;
  created_at: string;
  caller: Profile;
};

export type CapsuleLike = {
  capsule_id: string;
  created_at: string;
  liker: Profile;
};

export type Capsule = {
  id: string;
  created_at: any;
  title: string;
  content: string;
  image_url: string;
  pdf_url?: string | null;
  pdf_content?: string | null;
  owner: Profile;
  stats: CapsuleStats;
  call_stats?: CapsuleCall[];
  like_stats?: CapsuleLike[];
  isLiked: boolean;
};

export type TranscriptionEntry = {
    type: "user" | "bot";
    text: string;
    timestamp: string;
}