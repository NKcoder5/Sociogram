import React, { useState, useRef, useEffect } from 'react';
import { 
  SparklesIcon, 
  LanguageIcon, 
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClipboardDocumentIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { messageAPI } from '../../utils/api';

const AIAssistant = ({ 
  isOpen, 
  onClose, 
  onMessageImprove, 
  onMessageGenerate, 
  selectedConversation,
  currentMessage,
  setCurrentMessage 
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [improveOptions, setImproveOptions] = useState({
    tone: 'friendly',
    style: 'casual',
    length: 'medium'
  });
  const [translateOptions, setTranslateOptions] = useState({
    from: 'auto',
    to: 'es'
  });
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  
  const chatEndRef = useRef(null);

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

  const toneOptions = ['friendly', 'professional', 'casual', 'formal', 'enthusiastic', 'empathetic'];
  const styleOptions = ['casual', 'professional', 'creative', 'concise', 'detailed'];
  const lengthOptions = ['short', 'medium', 'long'];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  const handleAIChat = async () => {
    if (!aiInput.trim()) return;
    
    setIsLoading(true);
    const userMessage = { role: 'user', content: aiInput, timestamp: new Date() };
    setConversationHistory(prev => [...prev, userMessage]);
    setAiInput('');

    try {
      const response = await messageAPI.aiChatAssistant({
        message: aiInput,
        conversationId: selectedConversation?.id
      });

      if (response.data.success) {
        const aiMessage = { 
          role: 'assistant', 
          content: response.data.response, 
          timestamp: new Date() 
        };
        setConversationHistory(prev => [...prev, aiMessage]);
        setAiResponse(response.data.response);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date() 
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveMessage = async () => {
    if (!currentMessage.trim()) {
      console.log('No message to improve');
      return;
    }
    
    console.log('Improving message:', currentMessage);
    setIsLoading(true);
    try {
      const response = await messageAPI.improveMessage({
        message: currentMessage,
        tone: improveOptions.tone,
        style: improveOptions.style,
        length: improveOptions.length
      });

      console.log('Improve response:', response.data);
      
      if (response.data.success !== false) {
        const improvedText = response.data.improvedMessage || response.data.originalMessage;
        onMessageImprove(improvedText);
        setAiResponse(improvedText);
      } else {
        console.error('Improvement failed:', response.data);
      }
    } catch (error) {
      console.error('Message improvement error:', error);
      setAiResponse('Sorry, I couldn\'t improve your message right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslateMessage = async () => {
    if (!currentMessage.trim()) {
      console.log('No message to translate');
      return;
    }
    
    console.log('Translating message:', currentMessage, 'to:', translateOptions.to);
    setIsLoading(true);
    try {
      const response = await messageAPI.translateMessage({
        message: currentMessage,
        targetLanguage: translateOptions.to
      });

      console.log('Translation response:', response.data);
      
      if (response.data.success !== false) {
        const translatedText = response.data.translation || response.data.originalMessage;
        onMessageImprove(translatedText);
        setAiResponse(translatedText);
      } else {
        console.error('Translation failed:', response.data);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setAiResponse('Sorry, I couldn\'t translate your message right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateConversationStarter = async () => {
    setIsLoading(true);
    try {
      const response = await messageAPI.getConversationStarter(selectedConversation?.participants?.[0]?.user?.id);
      
      if (response.data.success) {
        onMessageGenerate(response.data.starter);
        setAiResponse(response.data.starter);
      }
    } catch (error) {
      console.error('Conversation starter error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSmartReplies = async () => {
    if (!currentMessage.trim()) {
      console.log('No message for smart replies');
      return;
    }
    
    console.log('Generating smart replies for:', currentMessage);
    setIsLoading(true);
    try {
      const response = await messageAPI.getSmartReplies({
        message: currentMessage
      });

      console.log('Smart replies response:', response.data);
      
      if (response.data.success !== false) {
        const suggestions = response.data.suggestions || [];
        setSmartSuggestions(suggestions);
      } else {
        console.error('Smart replies failed:', response.data);
      }
    } catch (error) {
      console.error('Smart replies error:', error);
      setSmartSuggestions(['Thanks! 😊', 'Got it 👍', 'Tell me more']);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-600">Powered by NVIDIA NIM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'chat', label: 'AI Chat', icon: ChatBubbleLeftRightIcon },
            { id: 'improve', label: 'Improve', icon: LightBulbIcon },
            { id: 'translate', label: 'Translate', icon: LanguageIcon },
            { id: 'suggestions', label: 'Smart Replies', icon: MagnifyingGlassIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversationHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <SparklesIcon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation with AI</h3>
                    <p className="text-gray-600 mb-6">Ask me anything! I can help with writing, ideas, translations, and more.</p>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      <button
                        onClick={() => setAiInput("Help me write a professional email")}
                        className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                      >
                        📧 Write an email
                      </button>
                      <button
                        onClick={() => setAiInput("Give me conversation starters")}
                        className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        💬 Conversation ideas
                      </button>
                      <button
                        onClick={() => setAiInput("Help me be more creative")}
                        className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                      >
                        🎨 Creative writing
                      </button>
                      <button
                        onClick={() => setAiInput("Explain something complex simply")}
                        className="p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
                      >
                        🧠 Explain concepts
                      </button>
                    </div>
                  </div>
                ) : (
                  conversationHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs ${
                            message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.role === 'assistant' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => copyToClipboard(message.content)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <ClipboardDocumentIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => speakText(message.content)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <SpeakerWaveIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                    placeholder="Ask AI anything..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAIChat}
                    disabled={!aiInput.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'improve' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Improve Your Message</h3>
                
                {/* Current Message Input/Display */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message to Improve:</label>
                  <textarea
                    value={currentMessage || ''}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type or paste your message here to improve it..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Improvement Options */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                    <select
                      value={improveOptions.tone}
                      onChange={(e) => setImproveOptions(prev => ({ ...prev, tone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {toneOptions.map(tone => (
                        <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                    <select
                      value={improveOptions.style}
                      onChange={(e) => setImproveOptions(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {styleOptions.map(style => (
                        <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                    <select
                      value={improveOptions.length}
                      onChange={(e) => setImproveOptions(prev => ({ ...prev, length: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {lengthOptions.map(length => (
                        <option key={length} value={length}>{length.charAt(0).toUpperCase() + length.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleImproveMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Improving...' : 'Improve Message'}
                </button>

                {/* Improved Result */}
                {aiResponse && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Improved Message:</label>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-gray-900">{aiResponse}</p>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => copyToClipboard(aiResponse)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => onMessageImprove(aiResponse)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                        >
                          Use This
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'translate' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Translate Message</h3>
                
                {/* Current Message Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message to Translate:</label>
                  <textarea
                    value={currentMessage || ''}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type or paste your message here to translate it..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Translation Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <select
                      value={translateOptions.from}
                      onChange={(e) => setTranslateOptions(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <select
                      value={translateOptions.to}
                      onChange={(e) => setTranslateOptions(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {languages.filter(lang => lang.code !== 'auto').map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleTranslateMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Translating...' : 'Translate Message'}
                </button>

                {/* Translation Result */}
                {aiResponse && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Translation:</label>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-900">{aiResponse}</p>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => copyToClipboard(aiResponse)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => onMessageImprove(aiResponse)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Use This
                        </button>
                        <button
                          onClick={() => speakText(aiResponse)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          🔊 Listen
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Reply Suggestions</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Generate replies for:</label>
                  <textarea
                    value={currentMessage || ''}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type or paste the message you want to reply to..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={generateSmartReplies}
                  disabled={!currentMessage.trim() || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {isLoading ? 'Generating...' : 'Generate Smart Replies'}
                </button>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={generateConversationStarter}
                    disabled={isLoading}
                    className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <LightBulbIcon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Conversation Starter</span>
                  </button>
                  <button
                    onClick={() => setAiInput("Give me 5 different ways to respond positively")}
                    className="p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Positive Responses</span>
                  </button>
                </div>

                {/* Smart Suggestions */}
                {smartSuggestions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Suggested Replies:</label>
                    <div className="space-y-2">
                      {smartSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between"
                        >
                          <p className="text-gray-900 flex-1">{suggestion}</p>
                          <button
                            onClick={() => onMessageGenerate(suggestion)}
                            className="ml-3 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
