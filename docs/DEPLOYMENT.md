# Deployment Guide (Web Phase 1)

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Cloudinary credentials for media uploads
- Firebase service account (existing push notifications)

## Environment Variables

Create `.env` files in both root and `backend/` (if not already) with:

```
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?schema=public"
SECRET_KEY="super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

Optional: Firebase service account paths and AI keys remain unchanged from earlier setup.

## Backend

```bash
cd backend
npm install
npx prisma migrate deploy
npm run build   # if build script configured, else skip
npm start       # or node index.js
```

### Production Hosting

1. Provision PostgreSQL (Render, Supabase, Neon, etc.).
2. Set environment variables in hosting platform.
3. Run `npx prisma migrate deploy` on release.
4. Use `pm2`/systemd for long‑running Node process or deploy via Render/Heroku.

## Frontend

```bash
cd frontend
npm install
VITE_API_URL="https://<backend-domain>/api/v1" npm run build
```

Deploy `dist/` folder to Vercel/Netlify/Render static site. Ensure CORS origins configured on backend to include frontend host.

## Post-Deployment Checklist

- Seed base data (departments/classes) via `/api/v1/admin/seed` route.
- Approve at least one ADMIN/SUPER_ADMIN user.
- Verify Cloudinary uploads for materials/achievements.
- Configure SSL and update `.env` `VITE_API_URL` accordingly.
- Export Postman collection (`docs/POSTMAN_COLLECTION.json`) and share with QA.***

