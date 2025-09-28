import React, { useState, useEffect } from 'react';
import { useFollow } from '../../context/FollowContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import { Bug, RefreshCw, Users, UserCheck, AlertCircle } from 'lucide-react';

const FollowDebugger = () => {
  const { user } = useAuth();
  const { followingUsers, processingUsers, loadFollowState, toggleFollow } = useFollow();
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const refreshDebugInfo = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [followingRes, followersRes, suggestedRes] = await Promise.all([
        authAPI.getFollowing(user.id),
        authAPI.getFollowers(user.id),
        authAPI.getSuggestedUsers()
      ]);

      setDebugInfo({
        following: followingRes.data.following || [],
        followers: followersRes.data.followers || [],
        suggested: suggestedRes.data.users || [],
        contextFollowing: Array.from(followingUsers),
        contextProcessing: Array.from(processingUsers),
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Debug info fetch error:', error);
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDebugInfo();
  }, [user, followingUsers, processingUsers]);

  const testFollow = async (userId) => {
    const testUser = { id: userId, username: `test_user_${userId}` };
    const result = await toggleFollow(testUser);
    console.log('Test follow result:', result);
    await refreshDebugInfo();
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800">Please log in to use the debugger</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 m-4 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Follow System Debugger</h3>
        </div>
        <button
          onClick={refreshDebugInfo}
          disabled={loading}
          className="flex items-center space-x-2 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {debugInfo.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">Error: {debugInfo.error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Data */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>API Data</span>
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Following ({debugInfo.following?.length || 0})</p>
                <div className="text-xs text-gray-600 mt-1">
                  {debugInfo.following?.map(user => user.username).join(', ') || 'None'}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Followers ({debugInfo.followers?.length || 0})</p>
                <div className="text-xs text-gray-600 mt-1">
                  {debugInfo.followers?.map(user => user.username).join(', ') || 'None'}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Suggested ({debugInfo.suggested?.length || 0})</p>
                <div className="text-xs text-gray-600 mt-1">
                  {debugInfo.suggested?.map(user => user.username).join(', ') || 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Context State */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Context State</span>
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Following IDs ({debugInfo.contextFollowing?.length || 0})</p>
                <div className="text-xs text-gray-600 mt-1 font-mono">
                  [{debugInfo.contextFollowing?.join(', ') || 'None'}]
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Processing IDs ({debugInfo.contextProcessing?.length || 0})</p>
                <div className="text-xs text-gray-600 mt-1 font-mono">
                  [{debugInfo.contextProcessing?.join(', ') || 'None'}]
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                <div className="text-xs text-gray-600 mt-1">
                  {debugInfo.timestamp || 'Never'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Test Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadFollowState(user.id)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Reload Follow State
          </button>
          <button
            onClick={() => testFollow('test123')}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            Test Follow
          </button>
          <button
            onClick={() => console.log('Current context state:', { followingUsers, processingUsers })}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Log Context State
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Debug Instructions</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Check if API data matches context state</p>
          <p>• Verify follow actions update both API and context</p>
          <p>• Monitor processing states during actions</p>
          <p>• Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export default FollowDebugger;
