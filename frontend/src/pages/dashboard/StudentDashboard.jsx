import React, { useEffect, useState } from 'react';
import { fetchStudentDashboard } from '../../api/dashboard';
import { Megaphone, Calendar, BookOpen, MessageSquare } from 'lucide-react';

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchStudentDashboard();
        setData(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-10">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-b from-purple-50/40 to-white min-h-screen">
      <div>
        <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">Dashboard</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Student Control Center</h1>
        <p className="text-gray-600 mt-2">Track announcements, notes, events and class updates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Announcements" icon={Megaphone}>
          <div className="space-y-3">
            {data?.announcements?.map((item) => (
              <div key={item.id} className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.content}</p>
              </div>
            )) || <p className="text-sm text-gray-500">No announcements yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Events" icon={Calendar}>
          <div className="space-y-3">
            {data?.events?.map((event) => (
              <div key={event.id} className="p-4 rounded-xl border border-gray-100">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.startAt).toLocaleString()} • {event.location || 'Campus'}
                </p>
              </div>
            )) || <p className="text-sm text-gray-500">No upcoming events.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Notes & Materials" icon={BookOpen}>
          <div className="space-y-3">
            {data?.materials?.map((material) => (
              <div key={material.id} className="p-3 rounded-lg border border-gray-100">
                <p className="font-medium">{material.title}</p>
                <p className="text-xs text-gray-500">{material.subject || 'General'}</p>
              </div>
            )) || <p className="text-sm text-gray-500">No materials shared for your class yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Recent Posts" icon={MessageSquare}>
          <div className="space-y-3">
            {data?.posts?.map((post) => (
              <div key={post.id} className="p-3 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-900">{post.author.username}</p>
                <p className="text-sm text-gray-600">{post.caption || 'Shared a new update'}</p>
              </div>
            )) || <p className="text-sm text-gray-500">No new posts in your feed.</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default StudentDashboard;

