import React, { useEffect, useState } from 'react';
import { fetchEvents, registerForEvent, createEvent } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { CalendarClock, MapPin } from 'lucide-react';

const EventsPage = () => {
  const { user } = useAuth();
  const canCreate = ['FACULTY', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    location: '',
  });
  const [cover, setCover] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchEvents({ upcoming: 'true' });
      setEvents(response.data.events || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (cover) formData.append('cover', cover);
    await createEvent(formData);
    setForm({ title: '', description: '', startAt: '', endAt: '', location: '' });
    setCover(null);
    load();
  };

  const handleRegister = async (id) => {
    await registerForEvent(id);
    load();
  };

  return (
    <div className="p-8 bg-gradient-to-b from-orange-50/40 to-white min-h-screen space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-orange-500 font-semibold uppercase">Events & Clubs</p>
          <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
        </div>
      </div>

      {canCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
              className="border border-gray-200 rounded-xl px-4 py-3"
              required
            />
            <input
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Location"
              className="border border-gray-200 rounded-xl px-4 py-3"
            />
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3"
              required
            />
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3"
              required
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
              onChange={(e) => setCover(e.target.files[0])}
              className="border border-dashed border-orange-300 px-4 py-3 rounded-xl md:col-span-2"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold">
              Create Event
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No upcoming events.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <CalendarClock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location || 'Campus'}</span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {new Date(event.startAt).toLocaleString()} - {new Date(event.endAt).toLocaleString()}
              </p>
              <p className="text-gray-700 mb-4">{event.description}</p>
              <button
                onClick={() => handleRegister(event.id)}
                className="px-4 py-2 rounded-xl bg-orange-100 text-orange-700 font-semibold"
              >
                Register
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsPage;

