import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI, authAPI } from '../../utils/api';

const FrontendBackendTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const runTest = async (testName, testFunction) => {
    addLog(`🧪 Testing ${testName}...`);
    try {
      const result = await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: { success: true, result } }));
      addLog(`✅ ${testName} - SUCCESS`, 'success');
      return result;
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
      addLog(`❌ ${testName} - FAILED: ${error.message}`, 'error');
      throw error;
    }
  };

  const testAuthAPI = async () => {
    const profile = await authAPI.getProfile();
    const suggested = await authAPI.getSuggestedUsers();
    return {
      profile: profile.data.user?.username,
      suggestedCount: suggested.data.users?.length || 0
    };
  };

  const testConversationsAPI = async () => {
    const conversations = await messageAPI.getConversations();
    return {
      count: conversations.data.conversations?.length || 0,
      conversations: conversations.data.conversations?.map(c => ({
        id: c.id,
        name: c.name || 'Direct Message',
        participants: c.participants?.length || 0
      }))
    };
  };

  const testAIChatAPI = async () => {
    const response = await messageAPI.aiChatAssistant({
      message: 'Hello AI, this is a frontend-backend connectivity test',
      conversationId: null
    });
    return {
      response: response.data.response?.substring(0, 100) + '...',
      fallback: response.data.fallback
    };
  };

  const testImproveMessageAPI = async () => {
    const response = await messageAPI.improveMessage({
      message: 'hey whats up',
      tone: 'professional'
    });
    return {
      original: 'hey whats up',
      improved: response.data.improvedMessage?.substring(0, 100) + '...'
    };
  };

  const testTranslateMessageAPI = async () => {
    const response = await messageAPI.translateMessage({
      message: 'Hello, how are you?',
      targetLanguage: 'spanish'
    });
    return {
      original: 'Hello, how are you?',
      translated: response.data.translation
    };
  };

  const testSmartRepliesAPI = async () => {
    const response = await messageAPI.getSmartReplies({
      message: 'How are you doing today?'
    });
    return {
      suggestions: response.data.suggestions || []
    };
  };

  const testFileUploadAPI = async () => {
    // Create a small test file
    const testContent = 'Frontend-Backend connectivity test file';
    const blob = new Blob([testContent], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'test-connectivity.txt');

    const response = await messageAPI.uploadFile(formData);
    return {
      fileName: response.data.file?.name,
      fileSize: response.data.file?.size,
      fileUrl: response.data.file?.url
    };
  };

  const runAllTests = async () => {
    setLoading(true);
    setLogs([]);
    setTestResults({});

    addLog('🚀 Starting comprehensive frontend-backend connectivity tests...');

    try {
      // Test authentication and user data
      await runTest('Authentication API', testAuthAPI);
      
      // Test conversations
      await runTest('Conversations API', testConversationsAPI);
      
      // Test AI features
      await runTest('AI Chat API', testAIChatAPI);
      await runTest('Improve Message API', testImproveMessageAPI);
      await runTest('Translate Message API', testTranslateMessageAPI);
      await runTest('Smart Replies API', testSmartRepliesAPI);
      
      // Test file upload
      await runTest('File Upload API', testFileUploadAPI);

      addLog('🎉 All tests completed!', 'success');
    } catch (error) {
      addLog('⚠️ Some tests failed. Check individual results above.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (testName) => {
    const result = testResults[testName];
    if (!result) return '⏳';
    return result.success ? '✅' : '❌';
  };

  const getStatusColor = (testName) => {
    const result = testResults[testName];
    if (!result) return 'text-gray-500';
    return result.success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">🔗 Frontend-Backend Connectivity Test</h2>
      
      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm">
          <strong>Current User:</strong> {user?.username || 'Not logged in'} | 
          <strong> Status:</strong> {user ? '✅ Authenticated' : '❌ Not authenticated'}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6 text-center">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium"
        >
          {loading ? '🔄 Running Tests...' : '🚀 Run All Connectivity Tests'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">📊 Test Results</h3>
          
          {[
            'Authentication API',
            'Conversations API', 
            'AI Chat API',
            'Improve Message API',
            'Translate Message API',
            'Smart Replies API',
            'File Upload API'
          ].map(testName => (
            <div key={testName} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{testName}</span>
                <span className={`text-2xl ${getStatusColor(testName)}`}>
                  {getStatusIcon(testName)}
                </span>
              </div>
              
              {testResults[testName] && (
                <div className="text-sm">
                  {testResults[testName].success ? (
                    <div className="text-green-700 bg-green-50 p-2 rounded">
                      <strong>Success:</strong>
                      <pre className="mt-1 text-xs overflow-auto">
                        {JSON.stringify(testResults[testName].result, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-red-700 bg-red-50 p-2 rounded">
                      <strong>Error:</strong> {testResults[testName].error}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live Logs */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">📝 Live Test Logs</h3>
          
          <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center">No logs yet. Run tests to see live updates.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'success' ? 'text-green-600' :
                  log.type === 'error' ? 'text-red-600' :
                  log.type === 'warning' ? 'text-yellow-600' :
                  'text-gray-700'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">📈 Test Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-white rounded">
              <div className="text-2xl text-green-600">
                {Object.values(testResults).filter(r => r.success).length}
              </div>
              <div className="text-sm">Passed</div>
            </div>
            <div className="p-2 bg-white rounded">
              <div className="text-2xl text-red-600">
                {Object.values(testResults).filter(r => !r.success).length}
              </div>
              <div className="text-sm">Failed</div>
            </div>
            <div className="p-2 bg-white rounded">
              <div className="text-2xl text-blue-600">
                {Object.keys(testResults).length}
              </div>
              <div className="text-sm">Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 How to Use This Test</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Click "Run All Connectivity Tests" to test all frontend-backend connections</li>
          <li>• Watch the live logs for real-time feedback</li>
          <li>• Check individual test results for detailed information</li>
          <li>• Green ✅ means the connection is working properly</li>
          <li>• Red ❌ means there's an issue that needs to be fixed</li>
        </ul>
      </div>
    </div>
  );
};

export default FrontendBackendTest;
