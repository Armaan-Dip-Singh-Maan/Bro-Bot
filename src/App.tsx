import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Settings2, Smile, Globe2, Brain, User, Heart, Trash2, RefreshCw, Volume2, Copy, Share2, Image, Mic, PanelLeftClose, PanelLeftOpen, Sparkles, Menu } from 'lucide-react';
import { useChatStore } from './store/chatStore';

function App() {
  const {
    messages,
    settings,
    showSettings,
    setShowSettings,
    updateSettings,
    addMessage,
    toggleLike,
    addReaction,
    clearChat,
  } = useChatStore();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLanguageExamples, setShowLanguageExamples] = useState(false);
  const [selectedLanguageExamples, setSelectedLanguageExamples] = useState<string[]>([]);

  const languages = [
    { 
      value: 'punjabi', 
      label: '🇮🇳 Punjabi',
      examples: [
        "Kiddan! Ki haal chaal?",
        "Satsriakal paaji/bhaji",
        "Chak de phatte!"
      ]
    },
    { value: 'hinglish', label: '🇮🇳 Hinglish' },
    { value: 'tanglish', label: '🌴 Tanglish' },
    { value: 'gujarati_english', label: '🎭 Gujarati English' },
    { value: 'marathi_english', label: '🌺 Marathi English' },
    { value: 'bengali_english', label: '🎨 Bengali English' },
    { value: 'malayalam_english', label: '🌊 Malayalam English' },
    { value: 'bhojpuri_english', label: '🌾 Bhojpuri English' },
    { value: 'haryanvi_english', label: '🌟 Haryanvi English' },
    { value: 'gen_z', label: '🔥 Gen Z Slang' },
    { value: 'mumbai_tapori', label: '🎬 Mumbai Tapori' },
    { value: 'delhi_style', label: '🏛️ Delhi Style' }
  ];

  const moods = [
    { value: 'happy', label: '😊 Happy' },
    { value: 'sad', label: '😢 Sad' },
    { value: 'excited', label: '🎉 Excited' },
    { value: 'tired', label: '😴 Tired' },
    { value: 'angry', label: '😠 Angry' },
    { value: 'chill', label: '😎 Chill' },
    { value: 'energetic', label: '⚡ Energetic' },
    { value: 'philosophical', label: '🤔 Philosophical' }
  ];

  const personalities = [
    { value: 'chill_friend', label: '😎 Chill Friend' },
    { value: 'motivational_coach', label: '💪 Motivational Coach' },
    { value: 'sassy_sibling', label: '😏 Sassy Sibling' },
    { value: 'romantic_crush', label: '💝 Romantic Crush' },
    { value: 'therapist', label: '🧘‍♂️ Calm Therapist' },
    { value: 'street_smart', label: '🎭 Street Smart Friend' },
    { value: 'college_buddy', label: '🎓 College Buddy' },
    { value: 'tech_geek', label: '🤓 Tech Geek' },
    { value: 'fitness_freak', label: '🏋️‍♂️ Fitness Freak' },
    { value: 'foodie_friend', label: '🍕 Foodie Friend' },
    { value: 'spiritual_guru', label: '🕉️ Spiritual Guru' },
    { value: 'cricket_fan', label: '🏏 Cricket Fan' }
  ];

  const culturalVibes = [
    { value: 'desi', label: '🇮🇳 Desi' },
    { value: 'western', label: '🌎 Western' },
    { value: 'kpop', label: '🎤 K-pop Lover' },
    { value: 'bollywood', label: '🎬 Bollywood' },
    { value: 'indie', label: '🎸 Indie Culture' },
    { value: 'street', label: '🛹 Street Culture' },
    { value: 'retro', label: '📻 Retro Vibes' },
    { value: 'metro', label: '🌆 Metro Life' }
  ];

  const reactions = ['❤️', '😂', '👍', '🎉', '🤔', '👏', '🔥', '💯', '🙏', '✨'];

  // Speech recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
  }

  const toggleSpeechRecognition = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputMessage(transcript);
      };
    }
    setIsListening(!isListening);
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareMessage = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: text,
          title: 'Shared from BroBot',
        });
      } catch (err) {
        console.error('Error sharing: ', err);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    addMessage({ text: inputMessage, sender: 'user' });

    try {
      // Call the Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          settings: settings
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get response: ${response.status} - ${errorData}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response) {
        throw new Error('Invalid response format from server');
      }

      addMessage({ text: data.response, sender: 'bot' });
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage({ 
        text: "Sorry, I'm having trouble responding right now. Please try again later!", 
        sender: 'bot' 
      });
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-0 sm:p-4 flex items-center justify-center">
      <div className="w-full h-screen sm:h-auto sm:max-w-4xl bg-white sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row h-full sm:h-[600px]">
          {/* Mobile Header */}
          <div className="sm:hidden bg-white p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              BroBot
            </h1>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Settings Panel - Mobile Drawer */}
          <div 
            className={`
              fixed inset-0 bg-gray-800 bg-opacity-50 z-50 transition-opacity duration-300
              ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              sm:hidden
            `}
            onClick={() => setShowMobileMenu(false)}
          >
            <div 
              className={`
                fixed inset-y-0 left-0 w-80 bg-white transform transition-transform duration-300 ease-in-out
                ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
              `}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings2 className="w-6 h-6 text-indigo-600" />
                    Settings
                  </h2>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Mobile Settings Content */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-indigo-500" />
                        Language Style
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => updateSettings({ language: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
                      >
                        {languages.map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Smile className="w-4 h-4 text-indigo-500" />
                        Current Mood
                      </label>
                      <select
                        value={settings.mood}
                        onChange={(e) => updateSettings({ mood: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
                      >
                        {moods.map(mood => (
                          <option key={mood.value} value={mood.value}>{mood.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-500" />
                        BroBot Personality
                      </label>
                      <select
                        value={settings.personality}
                        onChange={(e) => updateSettings({ personality: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
                      >
                        {personalities.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-indigo-500" />
                        Cultural Vibe
                      </label>
                      <select
                        value={settings.culturalVibe}
                        onChange={(e) => updateSettings({ culturalVibe: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
                      >
                        {culturalVibes.map(vibe => (
                          <option key={vibe.value} value={vibe.value}>{vibe.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={clearChat}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Chat History
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel - Desktop */}
          <div 
            className={`
              hidden sm:block
              ${showSettings ? 'w-80 opacity-100' : 'w-0 opacity-0'}
              bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden border-r
            `}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-indigo-600" />
                BroBot Vibes
              </h2>
              
              <div className="space-y-6">
                {/* Desktop Settings Content - Same as mobile but with different styling */}
                <div className="transform transition-all duration-200 hover:scale-102">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-indigo-500" />
                    Language Style
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value })}
                    className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                <div className="transform transition-all duration-200 hover:scale-102">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-indigo-500" />
                    Current Mood
                  </label>
                  <select
                    value={settings.mood}
                    onChange={(e) => updateSettings({ mood: e.target.value })}
                    className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    {moods.map(mood => (
                      <option key={mood.value} value={mood.value}>{mood.label}</option>
                    ))}
                  </select>
                </div>

                <div className="transform transition-all duration-200 hover:scale-102">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    BroBot Personality
                  </label>
                  <select
                    value={settings.personality}
                    onChange={(e) => updateSettings({ personality: e.target.value })}
                    className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    {personalities.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="transform transition-all duration-200 hover:scale-102">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-indigo-500" />
                    Cultural Vibe
                  </label>
                  <select
                    value={settings.culturalVibe}
                    onChange={(e) => updateSettings({ culturalVibe: e.target.value })}
                    className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    {culturalVibes.map(vibe => (
                      <option key={vibe.value} value={vibe.value}>{vibe.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={clearChat}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chat History
                </button>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-[calc(100vh-64px)] sm:h-full">
            <div className="hidden sm:flex bg-white p-4 border-b justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
                BroBot
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCompact(!isCompact)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                  title={isCompact ? "Expand view" : "Compact view"}
                >
                  {isCompact ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-105"
                  title="Customize BroBot"
                >
                  <Settings2 className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-105"
                  title="Your Profile"
                >
                  <User className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-indigo-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      } shadow-sm hover:shadow-md transition-all duration-200 relative group`}
                    >
                      {message.text}
                      
                      <div className="absolute top-0 -right-20 hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => copyToClipboard(message.text)}
                          className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareMessage(message.text)}
                          className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
                          title="Share message"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => speakMessage(message.text)}
                          className={`p-1 hover:bg-gray-100 rounded-full ${
                            isSpeaking ? 'text-indigo-500' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          title="Text to speech"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={() => toggleLike(message.id)}
                        className={`p-1 rounded-full transition-all duration-200 ${
                          message.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={message.liked ? "currentColor" : "none"} />
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                          className="p-1 rounded-full text-gray-400 hover:text-indigo-500 transition-all duration-200"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                        
                        {showEmojiPicker === message.id && (
                          <div className="absolute bottom-full mb-2 flex gap-1 bg-white p-2 rounded-lg shadow-lg z-10">
                            {reactions.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  addReaction(message.id, emoji);
                                  setShowEmojiPicker(null);
                                }}
                                className="hover:scale-125 transition-transform duration-200"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {message.reaction && (
                        <span className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-sm">
                          {message.reaction}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gray-100 text-gray-800 rounded-lg p-3 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  } hover:bg-gray-200`}
                  title="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;