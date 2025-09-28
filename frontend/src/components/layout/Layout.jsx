import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return children;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-80 transition-all duration-300 overflow-y-auto h-screen">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;