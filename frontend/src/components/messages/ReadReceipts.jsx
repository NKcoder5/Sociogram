import React, { useState, useEffect } from 'react';
import { 
  CheckIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckSolid } from '@heroicons/react/24/solid';

const ReadReceipts = ({ 
  messageId, 
  status = 'sending', // 'sending', 'sent', 'delivered', 'read', 'failed'
  readBy = [], 
  deliveredTo = [],
  timestamp,
  showDetails = false,
  onShowDetails
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <ClockIcon className="w-3 h-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <CheckIcon className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return (
          <div className="flex">
            <CheckIcon className="w-3 h-3 text-gray-400" />
            <CheckIcon className="w-3 h-3 text-gray-400 -ml-1" />
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <CheckSolid className="w-3 h-3 text-blue-500" />
            <CheckSolid className="w-3 h-3 text-blue-500 -ml-1" />
          </div>
        );
      case 'failed':
        return <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return `Delivered${deliveredTo.length > 0 ? ` to ${deliveredTo.length}` : ''}`;
      case 'read':
        return `Read${readBy.length > 0 ? ` by ${readBy.length}` : ''}`;
      case 'failed':
        return 'Failed to send';
      default:
        return '';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative inline-flex items-center space-x-1">
      {/* Status Icon */}
      <button
        onClick={() => onShowDetails && onShowDetails(messageId)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center space-x-1 hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
      >
        {getStatusIcon()}
        {timestamp && (
          <span className="text-xs text-gray-500">
            {formatTime(timestamp)}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {getStatusText()}
          {timestamp && ` • ${formatTime(timestamp)}`}
        </div>
      )}

      {/* Detailed View Modal */}
      {showDetails && (
        <ReadReceiptDetails
          messageId={messageId}
          status={status}
          readBy={readBy}
          deliveredTo={deliveredTo}
          timestamp={timestamp}
          onClose={() => onShowDetails(null)}
        />
      )}
    </div>
  );
};

const ReadReceiptDetails = ({ 
  messageId, 
  status, 
  readBy, 
  deliveredTo, 
  timestamp, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Message Info</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Message Status */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckSolid className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Status: {status}</p>
              {timestamp && (
                <p className="text-sm text-gray-500">
                  Sent at {new Date(timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Read By */}
          {readBy.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Read by ({readBy.length})
              </h4>
              <div className="space-y-2">
                {readBy.map((user, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <EyeIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.readAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivered To */}
          {deliveredTo.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Delivered to ({deliveredTo.length})
              </h4>
              <div className="space-y-2">
                {deliveredTo.map((user, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.deliveredAt).toLocaleString()}
                      </p>
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

// Online Status Component
export const OnlineStatus = ({ 
  userId, 
  isOnline = false, 
  lastSeen = null, 
  showText = false,
  size = 'sm' // 'xs', 'sm', 'md', 'lg'
}) => {
  const [showLastSeen, setShowLastSeen] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-2 h-2';
      case 'sm': return 'w-3 h-3';
      case 'md': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
      default: return 'w-3 h-3';
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Last seen unknown';
    
    const now = new Date();
    const lastSeenDate = new Date(timestamp);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Last seen just now';
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;
    if (diffDays < 7) return `Last seen ${diffDays}d ago`;
    
    return `Last seen ${lastSeenDate.toLocaleDateString()}`;
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        className={`${getSizeClasses()} rounded-full ${
          isOnline 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-gray-400'
        } ${lastSeen ? 'cursor-pointer' : ''}`}
        onMouseEnter={() => lastSeen && setShowLastSeen(true)}
        onMouseLeave={() => setShowLastSeen(false)}
      />
      
      {showText && (
        <span className={`ml-2 text-sm ${
          isOnline ? 'text-green-600' : 'text-gray-500'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}

      {/* Last Seen Tooltip */}
      {showLastSeen && lastSeen && (
        <div className="absolute bottom-full left-0 mb-2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {formatLastSeen(lastSeen)}
        </div>
      )}
    </div>
  );
};

// Typing Indicator Component
export const TypingIndicator = ({ 
  users = [], 
  isVisible = false 
}) => {
  if (!isVisible || users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing...`;
    } else {
      return `${users[0].username} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};

// Message Status Hook
export const useMessageStatus = (socket, messageId) => {
  const [status, setStatus] = useState('sending');
  const [readBy, setReadBy] = useState([]);
  const [deliveredTo, setDeliveredTo] = useState([]);

  useEffect(() => {
    if (!socket || !messageId) return;

    const handleMessageSent = (data) => {
      if (data.messageId === messageId) {
        setStatus('sent');
      }
    };

    const handleMessageDelivered = (data) => {
      if (data.messageId === messageId) {
        setStatus('delivered');
        setDeliveredTo(prev => [...prev, data.user]);
      }
    };

    const handleMessageRead = (data) => {
      if (data.messageId === messageId) {
        setStatus('read');
        setReadBy(prev => [...prev, data.user]);
      }
    };

    const handleMessageFailed = (data) => {
      if (data.messageId === messageId) {
        setStatus('failed');
      }
    };

    socket.on('messageSent', handleMessageSent);
    socket.on('messageDelivered', handleMessageDelivered);
    socket.on('messageRead', handleMessageRead);
    socket.on('messageFailed', handleMessageFailed);

    return () => {
      socket.off('messageSent', handleMessageSent);
      socket.off('messageDelivered', handleMessageDelivered);
      socket.off('messageRead', handleMessageRead);
      socket.off('messageFailed', handleMessageFailed);
    };
  }, [socket, messageId]);

  return { status, readBy, deliveredTo };
};

export default ReadReceipts;
