import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FollowProvider } from './context/FollowContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/feed/Feed';
import CreatePost from './components/create/CreatePost';
import Profile from './components/profile/Profile';
import Discovery from './components/discovery/Discovery';
import Messages from './components/messages/Messages';
import UltimateMessagingHub from './components/messages/UltimateMessagingHub';
import ChatWithFollowed from './components/messages/ChatWithFollowed';
import Reels from './components/reels/Reels';
import Activity from './components/activity/Activity';
import Following from './components/follow/Following';
import Followers from './components/follow/Followers';
import FollowDebugger from './components/debug/FollowDebugger';
import FrontendBackendTest from './components/test/FrontendBackendTest';
import SimpleTest from './components/test/SimpleTest';
import BlogAssistant from './components/blog/BlogAssistant';
import Settings from './components/settings/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instagram-blue"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/feed" /> : children;
};

const ConditionalLayout = ({ children, showLayout = true }) => {
  return showLayout ? <Layout>{children}</Layout> : children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <FollowProvider>
            <Routes>
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <ConditionalLayout showLayout={false}>
                      <LandingPage />
                    </ConditionalLayout>
                  </PublicRoute>
                } 
              />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <ConditionalLayout showLayout={false}>
                  <Login />
                </ConditionalLayout>
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <ConditionalLayout showLayout={false}>
                  <Register />
                </ConditionalLayout>
              </PublicRoute>
            } 
          />
          
          {/* Protected routes with layout */}
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <Feed />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <CreatePost />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:username" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <Profile />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <Discovery />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/discovery" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <Discovery />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <UltimateMessagingHub />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <ChatWithFollowed />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reels" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <Reels />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/activity" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <Activity />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:userId/following" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <Following />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:userId/followers" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <Followers />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/debug/follow" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <FollowDebugger />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog-assistant" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <BlogAssistant />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test/connectivity" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <FrontendBackendTest />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test" 
            element={
              <ProtectedRoute>
                <ConditionalLayout>
                  <SimpleTest />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <ConditionalLayout showLayout={false}>
                  <Settings />
                </ConditionalLayout>
              </ProtectedRoute>
            } 
          />
            </Routes>
            </FollowProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
