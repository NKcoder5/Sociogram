import React, { useEffect, useState } from 'react';
import {
  fetchPendingUsers,
  approveUser,
  rejectUser,
  createDepartment,
  fetchAdminMetrics,
  createClassSection,
} from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserPlus } from 'lucide-react';

const AdminConsole = () => {
  const { user } = useAuth();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) {
    return <div className="p-10">You do not have access to this page.</div>;
  }

  const [pendingUsers, setPendingUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [classForm, setClassForm] = useState({ name: '', code: '', departmentId: '' });

  const load = async () => {
    const [pendingRes, metricRes] = await Promise.all([fetchPendingUsers(), fetchAdminMetrics()]);
    setPendingUsers(pendingRes.data.users || []);
    setMetrics(metricRes.data.metrics);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    await approveUser(id, {});
    load();
  };

  const handleReject = async (id) => {
    await rejectUser(id);
    load();
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    await createDepartment(deptForm);
    setDeptForm({ name: '', code: '' });
    load();
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    await createClassSection(classForm);
    setClassForm({ name: '', code: '', departmentId: '' });
    load();
  };

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-blue-400 font-semibold">Admin Console</p>
          <h1 className="text-3xl font-bold">Control Center</h1>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-xl text-sm text-blue-200">
          Pending approvals: {pendingUsers.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics?.userCounts?.map((item) => (
          <div key={item.role} className="bg-slate-800 rounded-2xl p-5">
            <p className="text-sm uppercase text-slate-400">{item.role}</p>
            <p className="text-3xl font-bold">{item._count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Pending User Approvals</span>
          </h2>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-gray-500">No pending approvals.</p>
          ) : (
            pendingUsers.map((pending) => (
              <div key={pending.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{pending.username}</p>
                  <p className="text-sm text-gray-500">{pending.email}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleApprove(pending.id)}
                    className="px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(pending.id)}
                    className="px-3 py-2 text-sm rounded-lg bg-red-100 text-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <form onSubmit={handleCreateDepartment} className="bg-white text-gray-900 rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span>Create Department</span>
            </h2>
            <input
              value={deptForm.name}
              onChange={(e) => setDeptForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Name"
              className="border border-gray-200 rounded-xl px-4 py-3 w-full"
              required
            />
            <input
              value={deptForm.code}
              onChange={(e) => setDeptForm((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="Code"
              className="border border-gray-200 rounded-xl px-4 py-3 w-full"
              required
            />
            <button type="submit" className="px-4 py-3 rounded-xl bg-purple-600 text-white font-semibold w-full">
              Save Department
            </button>
          </form>

          <form onSubmit={handleCreateClass} className="bg-white text-gray-900 rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold">Create Class</h2>
            <input
              value={classForm.name}
              onChange={(e) => setClassForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Name"
              className="border border-gray-200 rounded-xl px-4 py-3 w-full"
              required
            />
            <input
              value={classForm.code}
              onChange={(e) => setClassForm((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="Code"
              className="border border-gray-200 rounded-xl px-4 py-3 w-full"
              required
            />
            <input
              value={classForm.departmentId}
              onChange={(e) => setClassForm((prev) => ({ ...prev, departmentId: e.target.value }))}
              placeholder="Department ID"
              className="border border-gray-200 rounded-xl px-4 py-3 w-full"
              required
            />
            <button type="submit" className="px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold w-full">
              Save Class
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;

