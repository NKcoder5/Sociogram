import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FollowProvider } from './context/FollowContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';
import LandingPage from './components/landing/LandingPage';
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
import Settings from './components/settings/Settings';
import FloatingAIAssistant from './components/ai/FloatingAIAssistant';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import FacultyDashboard from './pages/dashboard/FacultyDashboard';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import NotesPage from './pages/materials/NotesPage';
import EventsPage from './pages/events/EventsPage';
import DirectoryPage from './pages/directory/DirectoryPage';
import TalentHub from './pages/talent/TalentHub';
import AdminConsole from './pages/admin/AdminConsole';

const PendingApproval = ({ status }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 text-center px-6">
    <img src="/logo.png" alt="College Network" className="w-20 h-16 mb-6 rounded-2xl shadow" />
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile {status?.toLowerCase()}</h1>
    <p className="text-gray-600 max-w-md">
      Your profile is awaiting administrator approval. You will receive an announcement once it is approved.
    </p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <img 
          src="/logo.png" 
          alt="Sociogram Logo" 
          className="w-20 h-16 rounded-2xl shadow-lg mb-4 object-contain border-2 border-violet-200"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="text-gray-600 mt-4 font-medium">Loading Sociogram...</p>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/" />;

  if (user.profileStatus !== 'APPROVED') {
    return <PendingApproval status={user.profileStatus} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/feed" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <img 
          src="/logo.png" 
          alt="Sociogram Logo" 
          className="w-20 h-16 rounded-2xl shadow-lg mb-4 object-contain border-2 border-violet-200"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="text-gray-600 mt-4 font-medium">Loading Sociogram...</p>
      </div>
    );
  }
  
  if (!user) return children;

  const defaultRoute = user.role === 'FACULTY' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    ? '/dashboard/faculty'
    : '/dashboard/student';

  return <Navigate to={defaultRoute} />;
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
                  path="/dashboard/student"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <ConditionalLayout>
                        <StudentDashboard />
                      </ConditionalLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/dashboard/faculty"
                  element={
                    <ProtectedRoute allowedRoles={['FACULTY','ADMIN','SUPER_ADMIN']}>
                      <ConditionalLayout>
                        <FacultyDashboard />
                      </ConditionalLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/announcements"
                  element={
                    <ProtectedRoute>
                      <ConditionalLayout>
                        <AnnouncementsPage />
                      </ConditionalLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/notes"
                  element={
                    <ProtectedRoute>
                      <ConditionalLayout>
                        <NotesPage />
                      </ConditionalLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <ConditionalLayout>
                        <EventsPage />
                      </ConditionalLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/directory"
                  element={
                    <ProtectedRoute>
                      <ConditionalLayout>
                        <DirectoryPage />
                      </ConditionalLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/talent"
                  element={
                    <ProtectedRoute>
                      <ConditionalLayout>
                        <TalentHub />
                      </ConditionalLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/admin/console"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>
                      <ConditionalLayout>
                        <AdminConsole />
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
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <ConditionalLayout showLayout={false}>
                        <Settings />
                      </ConditionalLayout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Redirect old route patterns to correct paths */}
                <Route 
                  path="/student/dashboard" 
                  element={<Navigate to="/dashboard/student" replace />} 
                />
                <Route 
                  path="/faculty/dashboard" 
                  element={<Navigate to="/dashboard/faculty" replace />} 
                />
              </Routes>
              
              {/* Floating AI Assistant - Available on all pages */}
              <FloatingAIAssistant />
            </FollowProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
