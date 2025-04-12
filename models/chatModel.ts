// models/chatModel.ts
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "ms", label: "Malay" },
  { code: "ta", label: "Tamil" },
];

export interface Message {
  id: string;
  message: string;
  image?: string;
  timestamp: any;
  sender: string;
  receiver: string;
  isRead: boolean;
}

export interface Translation {
  text: string;
  lang: string;
}
