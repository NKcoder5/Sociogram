import React, { useEffect, useState } from 'react';
import { fetchMaterials, uploadMaterial, deleteMaterial } from '../../api/materials';
import { useAuth } from '../../context/AuthContext';
import { CloudUpload, FileText } from 'lucide-react';

const NotesPage = () => {
  const { user } = useAuth();
  const canUpload = ['FACULTY', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    semester: '',
    departmentId: '',
    classId: '',
  });
  const [file, setFile] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchMaterials();
      setMaterials(response.data.materials || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (file) {
      formData.append('file', file);
    }
    await uploadMaterial(formData);
    setForm({ title: '', subject: '', semester: '', departmentId: '', classId: '' });
    setFile(null);
    load();
  };

  const handleDelete = async (id) => {
    await deleteMaterial(id);
    load();
  };

  return (
    <div className="p-8 bg-white min-h-screen space-y-8">
      <div>
        <p className="text-sm text-emerald-500 font-semibold uppercase">Notes & Materials</p>
        <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
      </div>

      {canUpload && (
        <form
          onSubmit={handleUpload}
          className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
            <CloudUpload className="w-5 h-5 text-emerald-600" />
            <span>Upload Material</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
              required
            />
            <input
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Subject"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
            />
            <input
              value={form.semester}
              onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
              placeholder="Semester"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
            />
            <input
              value={form.departmentId}
              onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
              placeholder="Department ID"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
            />
            <input
              value={form.classId}
              onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}
              placeholder="Class ID"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-white md:col-span-2"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="border border-dashed border-emerald-300 px-4 py-3 rounded-xl bg-white md:col-span-2"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
              Upload
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading materials...</p>
        ) : materials.length === 0 ? (
          <p className="text-gray-500">No materials uploaded.</p>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{material.title}</p>
                  <p className="text-xs text-gray-500">{material.subject || 'General'}</p>
                </div>
              </div>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-emerald-600 font-medium"
              >
                View / Download
              </a>
              {canUpload && (
                <button
                  onClick={() => handleDelete(material.id)}
                  className="text-xs text-red-500 mt-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPage;

