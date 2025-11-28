# College Social Network — File Structure

```
Sociogram/
├── backend/
│   ├── controllers/
│   │   ├── achievement.controller.js
│   │   ├── admin.controller.js
│   │   ├── announcement.controller.js
│   │   ├── chatGroup.controller.js
│   │   ├── directory.controller.js
│   │   ├── event.controller.js
│   │   ├── material.controller.js
│   │   ├── post.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── documentUpload.js
│   │   ├── isAuthenticated.js
│   │   ├── profileStatusGuard.js
│   │   └── roleGuard.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/20251121155228_college_phase1/
│   ├── routes/
│   │   ├── achievement.route.js
│   │   ├── admin.route.js
│   │   ├── announcement.route.js
│   │   ├── chatGroup.route.js
│   │   ├── dashboard.route.js
│   │   ├── directory.route.js
│   │   ├── event.route.js
│   │   ├── material.route.js
│   │   ├── post.route.js
│   │   └── user.route.js
│   ├── utils/
│   │   ├── prisma.js
│   │   └── cloudinary.js
│   └── index.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── achievements.js
│   │   │   ├── admin.js
│   │   │   ├── announcements.js
│   │   │   ├── chatGroups.js
│   │   │   ├── dashboard.js
│   │   │   ├── directory.js
│   │   │   ├── events.js
│   │   │   └── materials.js
│   │   ├── components/
│   │   │   ├── auth/AuthSidebar.jsx
│   │   │   ├── layout/Layout.jsx
│   │   │   └── layout/Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── admin/AdminConsole.jsx
│   │   │   ├── announcements/AnnouncementsPage.jsx
│   │   │   ├── dashboard/FacultyDashboard.jsx
│   │   │   ├── dashboard/StudentDashboard.jsx
│   │   │   ├── directory/DirectoryPage.jsx
│   │   │   ├── events/EventsPage.jsx
│   │   │   ├── materials/NotesPage.jsx
│   │   │   └── talent/TalentHub.jsx
│   │   ├── App.jsx
│   │   └── utils/api.js
│   └── package.json
│
└── docs/
    ├── API_REFERENCE.md
    ├── DEPLOYMENT.md
    ├── FILE_STRUCTURE.md
    ├── FRONTEND_ROUTES.md
    ├── POSTMAN_COLLECTION.json
    └── VIVA_NOTES.md
```

The tree only lists files that changed or were added in this phase; existing components remain untouched unless noted.***

