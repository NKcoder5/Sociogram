import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { messageAPI } from '../../utils/api';

const MessageSearch = ({ 
  conversations = [], 
  onMessageSelect, 
  onConversationSelect,
  isOpen,
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all', // 'today', 'week', 'month', 'year', 'custom', 'all'
    messageType: 'all', // 'text', 'image', 'video', 'audio', 'document', 'all'
    sender: 'all', // 'me', 'others', 'all'
    conversation: 'all', // specific conversation ID or 'all'
    hasAttachment: false,
    sortBy: 'date', // 'date', 'relevance'
    sortOrder: 'desc' // 'asc', 'desc'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem('messageSearchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    // Debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
        generateSuggestions();
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, filters]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchParams = {
        query: searchQuery,
        ...filters,
        ...(filters.dateRange === 'custom' && customDateRange)
      };

      const response = await messageAPI.searchMessages(searchParams);
      
      if (response.data.success) {
        setSearchResults(response.data.results || []);
        
        // Add to search history
        const newHistory = [
          searchQuery,
          ...searchHistory.filter(h => h !== searchQuery)
        ].slice(0, 10);
        
        setSearchHistory(newHistory);
        localStorage.setItem('messageSearchHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = () => {
    const recentKeywords = [
      'photos', 'videos', 'documents', 'links', 'today', 'yesterday',
      'last week', 'important', 'meeting', 'project'
    ];
    setSuggestions(recentKeywords.slice(0, 5));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      messageType: 'all',
      sender: 'all',
      conversation: 'all',
      hasAttachment: false,
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setCustomDateRange({ startDate: '', endDate: '' });
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'image': return <PhotoIcon className="w-4 h-4 text-blue-500" />;
      case 'video': return <VideoCameraIcon className="w-4 h-4 text-red-500" />;
      case 'audio': return <SpeakerWaveIcon className="w-4 h-4 text-green-500" />;
      case 'document': return <DocumentIcon className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getConversationName = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return 'Unknown';
    
    if (conversation.isGroup) {
      return conversation.name || 'Group Chat';
    }
    
    // For direct messages, find the other participant
    const otherParticipant = conversation.participants?.find(p => p.user.id !== 'currentUserId');
    return otherParticipant?.user?.username || 'Unknown User';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Search Messages</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages, files, or conversations..."
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showAdvancedFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>

            {/* Quick filter buttons */}
            <button
              onClick={() => handleFilterChange('messageType', 'image')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.messageType === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Photos
            </button>
            
            <button
              onClick={() => handleFilterChange('hasAttachment', !filters.hasAttachment)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.hasAttachment ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              With Files
            </button>

            <button
              onClick={() => handleFilterChange('dateRange', 'today')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.dateRange === 'today' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>

            {Object.values(filters).some(v => v !== 'all' && v !== false && v !== 'date' && v !== 'desc') && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Message Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                <select
                  value={filters.messageType}
                  onChange={(e) => handleFilterChange('messageType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text Only</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="document">Documents</option>
                </select>
              </div>

              {/* Sender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sender</label>
                <select
                  value={filters.sender}
                  onChange={(e) => handleFilterChange('sender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Everyone</option>
                  <option value="me">Only Me</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* Conversation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conversation</label>
                <select
                  value={filters.conversation}
                  onChange={(e) => handleFilterChange('conversation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Conversations</option>
                  {conversations.map(conv => (
                    <option key={conv.id} value={conv.id}>
                      {getConversationName(conv.id)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="relevance">Relevance</option>
                  </select>
                  <button
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {filters.sortOrder === 'asc' ? (
                      <ArrowUpIcon className="w-4 h-4" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!searchQuery.trim() ? (
            /* Search Suggestions and History */
            <div className="space-y-6">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(query)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <ClockIcon className="w-3 h-3 inline mr-1" />
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(suggestion)}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            /* Loading */
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Searching...</span>
            </div>
          ) : searchResults.length === 0 ? (
            /* No Results */
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            /* Search Results */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onMessageSelect(result);
                      onConversationSelect(result.conversationId);
                    }}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Message Type Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getMessageTypeIcon(result.messageType) || (
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Message Content */}
                        <div className="text-sm text-gray-900 mb-1">
                          {highlightText(result.content || result.fileName || 'Media file', searchQuery)}
                        </div>

                        {/* Message Meta */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-3 h-3" />
                            <span>{result.senderName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="w-3 h-3" />
                            <span>{formatDate(result.createdAt)}</span>
                          </div>
                          <span>in {getConversationName(result.conversationId)}</span>
                        </div>

                        {/* File Info */}
                        {result.fileName && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 inline-block">
                            📎 {result.fileName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSearch;
