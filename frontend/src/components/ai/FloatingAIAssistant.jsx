import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  HeartIcon,
  FaceSmileIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  ClipboardDocumentIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { messageAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './FloatingAIAssistant.css';

const FloatingAIAssistant = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        content: `Hey there, ${user?.username || 'friend'}! 👋 I'm Sparkle, your friendly Sociogram assistant! 🌟\n\nI'm here to help you navigate the app, answer questions, and make your social experience amazing! What can I help you with today? 😊`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'welcome'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, user?.username]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Force re-render when location changes to ensure proper hiding
  useEffect(() => {
    console.log('📍 Location changed:', location.pathname);
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // System prompt for the AI assistant
  const getSystemPrompt = () => {
    return `You are Sparkle, the friendly AI assistant for Sociogram - a social media platform. Your personality is:

PERSONALITY:
- Friendly, funny, and kind
- Use emojis frequently to be expressive 😊
- Be enthusiastic about helping users
- Keep responses concise but helpful
- Use casual, warm language

YOUR ROLE:
1. Help users navigate Sociogram (feed, messages, stories, reels, profile, etc.)
2. Answer questions about app features and functionality
3. Provide general assistance and support
4. Answer general knowledge questions when appropriate
5. Be a key component for user engagement

RESTRICTIONS:
- Politely decline inappropriate requests
- Don't provide personal information about other users
- Don't help with harmful activities
- Stay focused on being helpful and positive

SOCIOGRAM FEATURES YOU CAN HELP WITH:
- Feed: Viewing and interacting with posts
- Messages: Chatting with friends, AI features
- Stories: Creating and viewing 24-hour stories
- Reels: Short video content
- Profile: User profiles and settings
- Activity: Notifications and interactions
- Explore: Discovering new content and users
- Create: Making new posts using the CREATE button in the LEFT SIDEBAR

IMPORTANT NAVIGATION:
- The CREATE button is in the LEFT SIDEBAR, not at the top of the screen
- All main navigation (Feed, Messages, Create, Reels, Activity, Profile) is in the left sidebar
- To create a post: Click "Create" in the left sidebar navigation

Always be encouraging and make users feel welcome! Remember, you're here to make their Sociogram experience amazing! ✨`;
  };

  // Don't show if user is not authenticated or still loading
  if (loading || !user) {
    return null;
  }

  // Don't show on messages page to avoid interference
  const currentPath = location.pathname;
  console.log('🛣️ Current path:', currentPath); // Debug log
  
  if (currentPath === '/messages' || currentPath.includes('messages')) {
    console.log('🚫 Hiding AI assistant on messages page');
    return null;
  }

  // Also hide when in any chat interface or modal
  if (currentPath.includes('/chat') || currentPath.includes('/conversation')) {
    console.log('🚫 Hiding AI assistant on chat interface');
    return null;
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🤖 Sending AI request:', {
        message: inputMessage.trim(),
        conversationId: 'floating-assistant',
        hasSystemPrompt: !!getSystemPrompt()
      });

      const response = await messageAPI.aiChatAssistant({
        message: inputMessage.trim(),
        systemPrompt: getSystemPrompt(),
        conversationId: 'floating-assistant'
      });

      console.log('🤖 AI Response received:', response.data);

      setIsTyping(false);

      if (response.data && response.data.success && response.data.response) {
        const aiMessage = {
          id: Date.now() + 1,
          content: response.data.response,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('AI response failed or empty');
      }
    } catch (error) {
      console.error('🚨 AI Assistant error:', error);
      setIsTyping(false);
      
      const errorMessage = {
        id: Date.now() + 1,
        content: "Oops! I'm having a little trouble right now 😅 Please try again in a moment, or feel free to explore the app - I'll be here when you need me! 💫",
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "How do I create a post?", emoji: "📝" },
    { text: "How to send messages?", emoji: "💬" },
    { text: "What are Stories?", emoji: "📸" },
    { text: "How to find friends?", emoji: "👥" },
    { text: "App navigation help", emoji: "🧭" },
    { text: "Tell me a fun fact!", emoji: "🎉" }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-pulse hover:animate-none"
        >
          {/* Floating hearts animation */}
          <div className="absolute -top-2 -left-2 text-red-400 animate-bounce">
            <HeartSolidIcon className="w-4 h-4" />
          </div>
          <div className="absolute -top-1 -right-2 text-yellow-400 animate-bounce delay-300">
            ✨
          </div>
          
          {/* Main icon */}
          <div className="relative">
            <FaceSmileIcon className="w-8 h-8" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Hi! I'm Sparkle, your AI friend! 🌟
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80' : 'w-96'
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaceSmileIcon className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg">Sparkle</h3>
              <p className="text-xs text-white text-opacity-80">Your AI Friend 🌟</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              {isMinimized ? (
                <ArrowsPointingOutIcon className="w-5 h-5" />
              ) : (
                <MinusIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-1 px-2 py-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors text-xs font-semibold"
              aria-label="Close assistant"
              title="Close assistant"
            >
              <XMarkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50 to-pink-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                        : message.type === 'welcome'
                        ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white'
                        : message.type === 'error'
                        ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
                        : 'bg-white text-gray-800 shadow-md border border-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${
                        message.sender === 'user' || message.type === 'welcome' || message.type === 'error'
                          ? 'text-white text-opacity-70'
                          : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {message.sender === 'ai' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy message"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => speakText(message.content)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Read aloud"
                          >
                            <SpeakerWaveIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-md border border-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(action.text)}
                      className="text-xs bg-white text-purple-600 px-2 py-1 rounded-full hover:bg-purple-50 transition-colors border border-purple-200"
                    >
                      {action.emoji} {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything! 😊"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingAIAssistant;
