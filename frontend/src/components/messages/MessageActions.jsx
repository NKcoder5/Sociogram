import React, { useState, useRef } from 'react';
import { 
  ArrowUturnLeftIcon,
  ArrowRightIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const MessageActions = ({ 
  message, 
  currentUserId, 
  conversations = [],
  onReply, 
  onForward, 
  onEdit, 
  onDelete, 
  onStar, 
  onReport,
  onCopy,
  onSave,
  isOwn = false 
}) => {
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [forwardMessage, setForwardMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const reportReasons = [
    'Spam or unwanted messages',
    'Harassment or bullying',
    'Hate speech',
    'Violence or threats',
    'Inappropriate content',
    'Scam or fraud',
    'Copyright violation',
    'Other'
  ];

  const handleCopyMessage = () => {
    const textToCopy = message.content || message.fileName || 'Media file';
    navigator.clipboard.writeText(textToCopy);
    onCopy && onCopy(message.id);
  };

  const handleForward = async () => {
    if (selectedConversations.length === 0) return;

    try {
      await onForward(message, selectedConversations, forwardMessage);
      setShowForwardModal(false);
      setSelectedConversations([]);
      setForwardMessage('');
    } catch (error) {
      console.error('Error forwarding message:', error);
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;

    try {
      await onReport(message.id, reportReason, reportDetails);
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  const getConversationName = (conversation) => {
    if (conversation.isGroup) {
      return conversation.name || 'Group Chat';
    }
    
    const otherParticipant = conversation.participants?.find(p => p.user.id !== currentUserId);
    return otherParticipant?.user?.username || 'Unknown User';
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Reply */}
        <button
          onClick={() => onReply(message)}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Reply"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
        </button>

        {/* Forward */}
        <button
          onClick={() => setShowForwardModal(true)}
          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
          title="Forward"
        >
          <ArrowRightIcon className="w-4 h-4" />
        </button>

        {/* Copy */}
        {message.content && (
          <button
            onClick={handleCopyMessage}
            className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title="Copy"
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
          </button>
        )}

        {/* Star/Save */}
        <button
          onClick={() => onStar(message.id)}
          className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
          title={message.isStarred ? "Unstar" : "Star"}
        >
          {message.isStarred ? (
            <StarSolid className="w-4 h-4 text-yellow-500" />
          ) : (
            <StarIcon className="w-4 h-4" />
          )}
        </button>

        {/* Save */}
        <button
          onClick={() => onSave(message)}
          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          title="Save"
        >
          <BookmarkIcon className="w-4 h-4" />
        </button>

        {/* Edit (only for own messages) */}
        {isOwn && message.content && (
          <button
            onClick={() => onEdit(message)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}

        {/* Delete (only for own messages) */}
        {isOwn && (
          <button
            onClick={() => onDelete(message.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}

        {/* Report (only for others' messages) */}
        {!isOwn && (
          <button
            onClick={() => setShowReportModal(true)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Report"
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Forward Message</h2>
                <button
                  onClick={() => setShowForwardModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Message Preview */}
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Forwarding:</p>
                <p className="text-gray-900">
                  {message.content || message.fileName || 'Media file'}
                </p>
              </div>

              {/* Add Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a message (optional)
                </label>
                <textarea
                  value={forwardMessage}
                  onChange={(e) => setForwardMessage(e.target.value)}
                  placeholder="Add your message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Select Conversations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forward to:
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {conversations.map(conversation => (
                    <label
                      key={conversation.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedConversations.includes(conversation.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedConversations(prev => [...prev, conversation.id]);
                          } else {
                            setSelectedConversations(prev => prev.filter(id => id !== conversation.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {getConversationName(conversation).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {getConversationName(conversation)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowForwardModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleForward}
                disabled={selectedConversations.length === 0}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Report Message</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you reporting this message?
                </label>
                <div className="space-y-2">
                  {reportReasons.map(reason => (
                    <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide more context about why you're reporting this message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p>Reports are anonymous and help keep our community safe. We'll review this message and take appropriate action.</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Reply Preview Component
export const ReplyPreview = ({ 
  replyingTo, 
  onCancel 
}) => {
  if (!replyingTo) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Replying to {replyingTo.sender?.username}
          </p>
          <p className="text-sm text-blue-800 truncate">
            {replyingTo.content || replyingTo.fileName || 'Media file'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="ml-2 p-1 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Message Edit Component
export const MessageEdit = ({ 
  message, 
  onSave, 
  onCancel 
}) => {
  const [editedContent, setEditedContent] = useState(message.content || '');
  const inputRef = useRef(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = () => {
    if (editedContent.trim() !== message.content) {
      onSave(message.id, editedContent.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <textarea
        ref={inputRef}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={handleKeyPress}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={2}
      />
      <div className="flex items-center justify-end space-x-2 mt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          Save
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Press Enter to save, Escape to cancel
      </p>
    </div>
  );
};

export default MessageActions;
