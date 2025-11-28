import React, { useEffect, useState } from 'react';
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement } from '../../api/announcements';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Filter } from 'lucide-react';

const scopes = [
  { label: 'College', value: 'COLLEGE' },
  { label: 'Department', value: 'DEPARTMENT' },
  { label: 'Class', value: 'CLASS' },
];

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    scope: 'COLLEGE',
    departmentId: '',
    classId: '',
  });

  const canPost = ['FACULTY', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchAnnouncements(scopeFilter ? { scope: scopeFilter } : undefined);
      setAnnouncements(response.data.announcements || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [scopeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAnnouncement(form);
    setForm({ title: '', content: '', scope: 'COLLEGE', departmentId: '', classId: '' });
    load();
  };

  const handleDelete = async (id) => {
    await deleteAnnouncement(id);
    load();
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">Announcements</p>
          <h1 className="text-3xl font-bold text-gray-900">College Bulletin</h1>
        </div>

        <div className="flex space-x-3">
          {scopes.map((scope) => (
            <button
              key={scope.value}
              onClick={() => setScopeFilter(scopeFilter === scope.value ? '' : scope.value)}
              className={`px-4 py-2 rounded-full border flex items-center space-x-2 ${
                scopeFilter === scope.value
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{scope.label}</span>
            </button>
          ))}
        </div>
      </div>

      {canPost && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            <span>Post Announcement</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              className="border border-gray-200 rounded-xl px-4 py-3"
              required
            />
            <select
              value={form.scope}
              onChange={(e) => setForm((prev) => ({ ...prev, scope: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3"
            >
              {scopes.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {form.scope === 'DEPARTMENT' && (
              <input
                value={form.departmentId}
                onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                placeholder="Department ID"
                className="border border-gray-200 rounded-xl px-4 py-3 md:col-span-2"
                required
              />
            )}
            {form.scope === 'CLASS' && (
              <input
                value={form.classId}
                onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}
                placeholder="Class ID"
                className="border border-gray-200 rounded-xl px-4 py-3 md:col-span-2"
                required
              />
            )}
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Announcement content"
              rows={4}
              className="border border-gray-200 rounded-xl px-4 py-3 md:col-span-2"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700"
            >
              Publish
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-gray-500">No announcements yet.</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm uppercase text-gray-500">{announcement.scope}</p>
                  <h3 className="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                </div>
                {canPost && (
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-gray-700">{announcement.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;

