# Viva Preparation Notes (Phase 1)

## Architecture Overview
- **Backend**: Node.js + Express + Prisma ORM over PostgreSQL. New domain models for Department, ClassSection, Announcement, Material (+ comments), Achievement, Event (+ registrations), Club (+ members), and conversation metadata for department/class chat groups.
- **Auth & Roles**: Users carry `role` (`STUDENT`, `FACULTY`, `ADMIN`, `SUPER_ADMIN`), `profileStatus`, and `collegeId/departmentId/classId/year`. Role guard + profile-status guard protect every feature.
- **Frontend**: React 18 w/ Vite, Tailwind, React Router. Added `pages/` directory with role-specific dashboards, admin console, directory, events, materials, talent hub, and announcements page. Sidebar now surfaces role-specific navigation with badges.

## Key Design Decisions
1. **Prisma enums** for roles, announcement scopes, post categories/audience, material types, event metadata. Keeps validation at schema level.
2. **Auto-managed chat groups** built on existing conversation tables to avoid duplicating messaging logic. Department/class chat creation leverages scoped conversations + participant upserts.
3. **Visibility-aware posts**: new `category` + `audience` fields allow filtering feed between general/academic/talent/event posts, and restrict visibility automatically using viewer metadata.
4. **Role guard middleware** centralizes DB lookups and attaches `req.currentUser`, reducing duplicate queries and simplifying future RBAC extensions.
5. **Frontend gating**: `ProtectedRoute` now enforces profile approvals and optional role white-lists, ensuring UX mirrors backend authorization.

## Data Flow Highlights
- Registration accepts college metadata; incomplete assignments are stored in `profileMeta` for admin review.
- Admin console exposes user approval flows, department/class CRUD, and high-level metrics in one surface.
- Dashboards aggregate announcements/events/materials/posts via dedicated endpoints for student/faculty personas.
- Materials/achievements/events leverage Cloudinary multi-part uploads for PDFs/images/certificates.

## Future Extensions / Phase 2 Hooks
- Mobile clients can reuse the same REST APIs; conversation scope metadata already supports dept/class grouping for real-time sockets.
- Post categories + audiences allow for advanced analytics and targeted notifications later.
- `profileMeta` JSON can store onboarding questionnaires or multi-step approvals without additional schema migrations.

## Demo Flow Outline
1. Register new student ➜ admin approves via console ➜ student dashboard auto-populates scoped announcements/events/notes.
2. Faculty posts a department-only announcement ➜ student feed filtered by department shows it.
3. Faculty uploads notes + schedules event ➜ students register; event registration counts visible in admin metrics.
4. Student submits achievement ➜ faculty verifies from talent hub; status badge updates instantly.
5. Department/class chat join endpoints produce auto-managed group conversation IDs consumed by messaging UI.

## Troubleshooting Tips
- If uploads fail, verify Cloudinary credentials and accepted MIME types in `documentUpload.js`.
- Pending users hitting protected routes will see `PendingApproval` screen; confirm admin approval to unblock.
- Remember to seed baseline departments/classes or set `departmentName` / `className` on registration for later mapping.

