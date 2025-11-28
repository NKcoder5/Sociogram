# Frontend Routing Map (Phase 1 Web)

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | `LandingPage` | Public | Marketing page + Auth sidebar. |
| `/feed` | `Feed` | Approved users | Legacy social feed with new filters. |
| `/dashboard/student` | `StudentDashboard` | `role=STUDENT` | Announcements, events, notes, posts scoped to student. |
| `/dashboard/faculty` | `FacultyDashboard` | `role ∈ {FACULTY, ADMIN, SUPER_ADMIN}` | Faculty control center. |
| `/announcements` | `AnnouncementsPage` | Approved | Read announcements; faculty/admin can post. |
| `/notes` | `NotesPage` | Approved | Materials listing; faculty/admin upload. |
| `/events` | `EventsPage` | Approved | Event calendar, registration, creation (faculty/admin). |
| `/directory` | `DirectoryPage` | Approved | Departments, classes, student & faculty directories. |
| `/talent` | `TalentHub` | Approved | Achievement submissions + verification. |
| `/admin/console` | `AdminConsole` | `role ∈ {ADMIN, SUPER_ADMIN}` | User approvals, department/class creation, metrics. |
| `/messages` | `UltimateMessagingHub` | Approved | Existing messaging center (chat groups integrate via API). |
| `/create` | `CreatePost` | Approved | Post creation now with category/audience fields. |
| `/explore`, `/reels`, `/activity`, `/profile/:username`, etc. | Existing components | Approved | Legacy features remain functional with new guards. |

Route protection is handled in `App.jsx`:
* `ProtectedRoute` now enforces authentication, approved profile status, and optional role whitelists.
* `PublicRoute` redirects authenticated users to role-specific dashboards.
* `Layout` integrates updated sidebar + college branding.***

