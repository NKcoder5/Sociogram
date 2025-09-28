import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../utils/api';

const SimpleTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runBasicTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Check if user is authenticated
      results.auth = user ? '✅ User authenticated' : '❌ Not authenticated';

      // Test 2: Test conversations API
      try {
        const convResponse = await messageAPI.getConversations();
        results.conversations = `✅ Conversations API: ${convResponse.data.conversations?.length || 0} conversations`;
      } catch (error) {
        results.conversations = `❌ Conversations API failed: ${error.message}`;
      }

      // Test 3: Test AI Chat
      try {
        const aiResponse = await messageAPI.aiChatAssistant({
          message: 'Hello AI test',
          conversationId: null
        });
        results.aiChat = `✅ AI Chat working: ${aiResponse.data.response?.substring(0, 30)}...`;
      } catch (error) {
        results.aiChat = `❌ AI Chat failed: ${error.message}`;
      }

      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Simple System Test</h1>
      
      <div className="mb-6">
        <button
          onClick={runBasicTests}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Basic Tests'}
        </button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2">
            {Object.entries(testResults).map(([key, result]) => (
              <div key={key} className="p-3 bg-gray-50 rounded">
                <strong>{key}:</strong> {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Available Routes:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <a href="/messages" className="underline">/messages</a> - Main messaging interface</li>
          <li>• <a href="/blog-assistant" className="underline">/blog-assistant</a> - AI blog creation</li>
          <li>• <a href="/test/connectivity" className="underline">/test/connectivity</a> - Full connectivity test</li>
          <li>• <a href="/feed" className="underline">/feed</a> - Social media feed</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleTest;
