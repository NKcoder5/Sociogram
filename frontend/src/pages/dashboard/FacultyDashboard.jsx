import React, { useEffect, useState } from 'react';
import { fetchFacultyDashboard } from '../../api/dashboard';
import { ClipboardCheck, Megaphone, BookCopy, Users } from 'lucide-react';

const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchFacultyDashboard();
        setData(response.data.data);
      } catch {
        setError('Unable to load faculty dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-10">Loading faculty dashboard...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="p-8 bg-gradient-to-b from-blue-50/40 to-white min-h-screen space-y-8">
      <div>
        <p className="text-sm text-blue-500 font-semibold uppercase tracking-wide">Dashboard</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Faculty Workspace</h1>
        <p className="text-gray-600 mt-2">Monitor announcements, class notes, events and approvals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-4xl font-bold text-gray-900">{data?.pendingApprovals || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Announcements Created</p>
          <p className="text-3xl font-semibold text-gray-900">{data?.announcements?.length || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Materials Shared</p>
          <p className="text-3xl font-semibold text-gray-900">{data?.materials?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Recent Announcements</h2>
          </div>
          <div className="space-y-3">
            {data?.announcements?.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.content}</p>
              </div>
            )) || <p className="text-sm text-gray-500">No announcements yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <BookCopy className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Shared Materials</h2>
          </div>
          <div className="space-y-3">
            {data?.materials?.map((material) => (
              <div key={material.id} className="p-3 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-900">{material.title}</p>
                <p className="text-xs text-gray-500">{material.subject || 'General'}</p>
              </div>
            )) || <p className="text-sm text-gray-500">No materials uploaded yet.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Faculty Events</h2>
        </div>
        <div className="space-y-3">
          {data?.events?.map((event) => (
            <div key={event.id} className="p-4 border border-gray-100 rounded-xl">
              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-gray-600">{new Date(event.startAt).toLocaleString()}</p>
            </div>
          )) || <p className="text-sm text-gray-500">No events created.</p>}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

