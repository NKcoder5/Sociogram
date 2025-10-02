import React, { useState } from 'react';
import { signUpWithEmail, signInWithEmail, signOutUser } from '../../services/firebase/auth';
import { uploadProfilePicture } from '../../services/firebase/storage';
import { createDocument, getDocument } from '../../services/firebase/firestore';

const FirebaseTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, username);
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const result = await signOutUser();
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setResult('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const result = await uploadProfilePicture(file, 'test-user-id', (progress) => {
        setResult(`Upload progress: ${progress.toFixed(1)}%`);
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCreateDocument = async () => {
    setLoading(true);
    try {
      const userData = {
        username: username,
        email: email,
        bio: 'Test user from Firebase integration'
      };
      const result = await createDocument('users', 'test-user-id', userData);
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleGetDocument = async () => {
    setLoading(true);
    try {
      const result = await getDocument('users', 'test-user-id');
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        🔥 Firebase Integration Test
      </h2>

      <div className="space-y-4 mb-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Sign Up
        </button>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Sign In
        </button>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Sign Out
        </button>
        <button
          onClick={handleFileUpload}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Upload File
        </button>
        <button
          onClick={handleCreateDocument}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Create Document
        </button>
        <button
          onClick={handleGetDocument}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Get Document
        </button>
      </div>

      {loading && (
        <div className="text-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Processing...</p>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Result:</h3>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-64">
          {result || 'No result yet...'}
        </pre>
      </div>
    </div>
  );
};

export default FirebaseTest;
