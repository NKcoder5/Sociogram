import React, { useEffect, useState } from 'react';
import { fetchDepartments, fetchClasses, fetchStudents, fetchFaculty } from '../../api/directory';
import { Building2, GraduationCap, Users } from 'lucide-react';

const DirectoryPage = () => {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [activeTab, setActiveTab] = useState('departments');

  useEffect(() => {
    const load = async () => {
      const [deptRes, classRes, studentRes, facultyRes] = await Promise.all([
        fetchDepartments(),
        fetchClasses(),
        fetchStudents(),
        fetchFaculty(),
      ]);
      setDepartments(deptRes.data.departments || []);
      setClasses(classRes.data.classes || []);
      setStudents(studentRes.data.students || []);
      setFaculty(facultyRes.data.faculty || []);
    };
    load();
  }, []);

  const tabs = [
    { key: 'departments', label: 'Departments', icon: Building2 },
    { key: 'classes', label: 'Classes', icon: GraduationCap },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'faculty', label: 'Faculty', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'departments':
        return departments.map((dept) => (
          <div key={dept.id} className="border border-gray-100 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
            <p className="text-sm text-gray-500">{dept.code}</p>
            <p className="text-sm text-gray-600 mt-2">{dept.description}</p>
            <div className="text-xs text-gray-500 mt-3">
              Members: {dept._count?.members || 0} • Classes: {dept._count?.classes || 0}
            </div>
          </div>
        ));
      case 'classes':
        return classes.map((cls) => (
          <div key={cls.id} className="border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900">{cls.name}</h3>
            <p className="text-sm text-gray-500">{cls.code}</p>
            <p className="text-sm text-gray-600 mt-2">
              Department: {cls.department?.name || 'N/A'} • Advisor: {cls.advisor?.username || 'Not assigned'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Students: {cls._count?.students || 0}</p>
          </div>
        ));
      case 'students':
        return students.map((student) => (
          <div key={student.id} className="border border-gray-100 rounded-2xl p-4">
            <p className="font-semibold text-gray-900">{student.username}</p>
            <p className="text-sm text-gray-600">{student.email}</p>
            <p className="text-xs text-gray-500">
              {student.department?.name} • {student.classSection?.name} • Year {student.year || 'N/A'}
            </p>
          </div>
        ));
      case 'faculty':
        return faculty.map((member) => (
          <div key={member.id} className="border border-gray-100 rounded-2xl p-4">
            <p className="font-semibold text-gray-900">{member.username}</p>
            <p className="text-sm text-gray-600">{member.email}</p>
            <p className="text-xs text-gray-500">{member.department?.name}</p>
          </div>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <div>
        <p className="text-sm text-gray-500 font-semibold uppercase">Directory</p>
        <h1 className="text-3xl font-bold text-gray-900">College Directory</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full border flex items-center space-x-2 ${
                active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{renderTabContent()}</div>
    </div>
  );
};

export default DirectoryPage;

