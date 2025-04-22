import { create } from 'zustand';

export interface ChatSettings {
  language: string;
  mood: string;
  personality: string;
  culturalVibe: string;
}

interface UserProfile {
  name: string;
  preferences: {
    favoriteFood?: string;
    crushName?: string;
    interests?: string[];
  };
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  liked?: boolean;
  reaction?: string;
}

interface ChatStore {
  messages: Message[];
  settings: ChatSettings;
  userProfile: UserProfile;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  toggleLike: (messageId: string) => void;
  addReaction: (messageId: string, reaction: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  settings: {
    language: 'hinglish',
    mood: 'happy',
    personality: 'chill_friend',
    culturalVibe: 'desi'
  },
  userProfile: {
    name: '',
    preferences: {}
  },
  showSettings: true,
  setShowSettings: (show) => set({ showSettings: show }),
  updateSettings: (newSettings) => 
    set((state) => ({ 
      settings: { ...state.settings, ...newSettings } 
    })),
  updateUserProfile: (profile) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile }
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, {
        ...message,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date()
      }]
    })),
  toggleLike: (messageId) =>
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, liked: !msg.liked } : msg
      )
    })),
  addReaction: (messageId, reaction) =>
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, reaction } : msg
      )
    })),
  clearChat: () => set({ messages: [] })
}));