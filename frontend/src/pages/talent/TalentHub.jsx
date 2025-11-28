import React, { useEffect, useState } from 'react';
import { fetchAchievements, submitAchievement, verifyAchievement } from '../../api/achievements';
import { useAuth } from '../../context/AuthContext';
import { Trophy, CheckCircle } from 'lucide-react';

const TalentHub = () => {
  const { user } = useAuth();
  const canVerify = ['FACULTY', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);
  const [achievements, setAchievements] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  const [media, setMedia] = useState(null);
  const [certificate, setCertificate] = useState(null);

  const load = async () => {
    const response = await fetchAchievements();
    setAchievements(response.data.achievements || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('tags', form.tags);
    if (media) formData.append('media', media);
    if (certificate) formData.append('certificate', certificate);
    await submitAchievement(formData);
    setForm({ title: '', description: '', tags: '' });
    setMedia(null);
    setCertificate(null);
    load();
  };

  const handleVerify = async (id) => {
    await verifyAchievement(id, { status: 'APPROVED' });
    load();
  };

  return (
    <div className="p-8 bg-gradient-to-b from-pink-50/40 to-white min-h-screen space-y-8">
      <div>
        <p className="text-sm uppercase font-semibold text-pink-500">Talent & Achievements</p>
        <h1 className="text-3xl font-bold text-gray-900">Showcase Wall</h1>
      </div>

      {user?.role === 'STUDENT' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-pink-600" />
            <span>Submit Achievement</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              className="border border-gray-200 rounded-xl px-4 py-3"
              required
            />
            <input
              value={form.tags}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="Tags (comma separated)"
              className="border border-gray-200 rounded-xl px-4 py-3"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="border border-gray-200 rounded-xl px-4 py-3 md:col-span-2"
              rows={3}
            />
            <input
              type="file"
              onChange={(e) => setMedia(e.target.files[0])}
              className="border border-dashed border-pink-300 px-4 py-3 rounded-xl"
            />
            <input
              type="file"
              onChange={(e) => setCertificate(e.target.files[0])}
              className="border border-dashed border-pink-300 px-4 py-3 rounded-xl"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-3 rounded-xl bg-pink-600 text-white font-semibold">
              Submit
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.student?.username}</p>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  item.status === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : item.status === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
            {item.mediaUrl && (
              <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="text-sm text-pink-600">
                View media
              </a>
            )}
            {canVerify && item.status === 'PENDING' && (
              <button
                onClick={() => handleVerify(item.id)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentHub;

