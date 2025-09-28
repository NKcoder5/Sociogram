import React, { useState, useEffect } from 'react';
import { XMarkIcon, HeartIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { postAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CommentsModal = ({ post, isOpen, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
    }
  }, [isOpen, post]);

  const fetchComments = async () => {
    try {
      const response = await postAPI.getCommentsOfPost(post.id);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await postAPI.addComment(post.id, newComment);
      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = (commentId) => {
    // Mock like functionality for comments
    setComments(comments.map(comment => 
      comment._id === commentId 
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? (comment.likes || 1) - 1 : (comment.likes || 0) + 1 }
        : comment
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Comments</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No comments yet.</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {comment.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="font-semibold text-sm">{comment.author?.username || 'Unknown'}</p>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500"
                    >
                      {comment.isLiked ? (
                        <HeartSolidIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4" />
                      )}
                      <span>{comment.likes || 0}</span>
                    </button>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className="border-t p-4">
          <form onSubmit={handleAddComment} className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
