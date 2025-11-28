# College Social Network — Backend API Reference (Phase 1)

Base URL: `https://<backend-host>/api/v1`

## Authentication & Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/register` | Register account with college metadata (`collegeId`, `departmentId`, `classId`, `year`, `departmentName`, `className`). Accounts start in `PENDING` status. |
| POST | `/user/login` | Email/password login, returns JWT cookie + token payload. |
| GET | `/user/profile` | Current user profile (includes department/class objects). |
| POST | `/user/profile/edit` | Update profile picture, bio, college metadata (updating department/class resets `profileStatus` to `PENDING`). |

## Admin Console (`/admin`, role: ADMIN/SUPER_ADMIN)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/admin/pending-users` | – | List users awaiting approval. |
| POST | `/admin/users/:id/approve` | `{ role?, departmentId?, classId?, year? }` | Approve user and optionally set metadata. |
| POST | `/admin/users/:id/reject` | – | Reject/suspend user. |
| POST | `/admin/users/:id/role` | `{ role }` | Promote/demote role. |
| GET | `/admin/dashboard/metrics` | – | Aggregated stats (user counts, total events, pending approvals). |
| POST | `/admin/departments` | `{ name, code, description?, headId? }` | Create department. |
| PUT | `/admin/departments/:id` | Partial body | Update department. |
| DELETE | `/admin/departments/:id` | – | Remove department. |
| POST | `/admin/classes` | `{ name, code, departmentId, year?, section?, semester?, advisorId? }` | Create class section. |
| PUT | `/admin/classes/:id` | Partial body | Update class section. |
| DELETE | `/admin/classes/:id` | – | Remove class section. |

## Directory (`/directory`, requires approved profile)

| Method | Endpoint | Query | Description |
|--------|----------|-------|-------------|
| GET | `/directory/departments` | – | Departments with head + counts. |
| GET | `/directory/classes` | `departmentId?` | Class sections with advisor + student counts. |
| GET | `/directory/students` | `departmentId?`, `classId?`, `year?`, `search?` | Filtered student directory. |
| GET | `/directory/faculty` | `departmentId?`, `search?` | Faculty directory. |

## Announcements (`/announcements`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/` | Any approved user | List announcements (`scope`, `department`, `class`). Supports `scope`, `departmentId`, `classId`, `limit`. |
| GET | `/:id` | Approved | Announcement detail. |
| POST | `/` | FACULTY/ADMIN/SUPER_ADMIN | Create announcement (`title`, `content`, `scope`, optional `departmentId/classId`, `attachments[]`). |
| PUT | `/:id` | Author or ADMIN/SUPER_ADMIN | Update announcement. |
| DELETE | `/:id` | Author or ADMIN/SUPER_ADMIN | Remove announcement. |

## Materials & Notes (`/materials`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/` | Approved | List materials (`departmentId`, `classId`, `subject`, `semester`, `type`, `creatorId`, `search`, `limit`). |
| GET | `/:id` | Approved | Material detail with comments. |
| POST | `/` | FACULTY/ADMIN/SUPER_ADMIN | Upload PDF/doc/image via multipart (`file`, `title`, `subject`, `semester`, `type`, `departmentId/classId`). |
| DELETE | `/:id` | Author or ADMIN/SUPER_ADMIN | Delete material. |
| POST | `/:id/comments` | Approved | Comment `{ text }`. |

## Achievements & Talent (`/achievements`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/` | Approved | List achievements (filters: `userId`, `departmentId`, `status`, `verified`). |
| POST | `/` | STUDENT | Submit achievement with optional `media`/`certificate` uploads and `tags`. |
| POST | `/:id/verify` | FACULTY/ADMIN/SUPER_ADMIN | Approve/reject achievement `{ status }`. |
| DELETE | `/:id` | Author or ADMIN/SUPER_ADMIN | Delete achievement. |

## Events & Clubs (`/events`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/` | Approved | Upcoming events (`departmentId`, `classId`, `clubId`, `upcoming`). |
| GET | `/:id` | Approved | Event detail with registrations. |
| POST | `/` | FACULTY/ADMIN/SUPER_ADMIN | Create event (multipart, `cover` optional). |
| PUT | `/:id` | Creator or ADMIN/SUPER_ADMIN | Update event metadata/cover. |
| DELETE | `/:id` | Creator or ADMIN/SUPER_ADMIN | Delete event. |
| POST | `/:id/register` | Approved | Register current user for event. |

## Posts / Newsfeed (`/post`)

Enhancements:
* `addpost` accepts `category` (`GENERAL`, `ACADEMIC`, `TALENT`, `EVENT`) and `audience` (`PUBLIC`, `COLLEGE`, `DEPARTMENT`, `CLASS`).
* Department/class visibility auto-resolves from user metadata if not provided.
* `GET /post/all` honours viewer department/class and exposes filters `category`, `audience`, `departmentId`, `classId`, `limit`.

## Chat Groups (`/chat-groups`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List auto-managed chats user belongs to (department/class). |
| POST | `/department/join` | Ensure a department-wide group exists and add user. |
| POST | `/class/join` | Ensure class-wide group exists and add user. |

## Dashboards (`/dashboard`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/student` | STUDENT | Aggregated announcements/events/materials/posts filtered for student department/class. |
| GET | `/faculty` | FACULTY/ADMIN/SUPER_ADMIN | Faculty dashboard data (own announcements/materials/events + pending approvals). |

All routes require JWT authentication + `profileStatus === APPROVED` except login/register endpoints. Use the new middleware stack (`isAuthenticated`, `requireRole`, `requireApprovedProfile`) accordingly.***

