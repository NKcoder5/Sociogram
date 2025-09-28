# Deployment Steps to Fix 500 Error

## Problem
Your backend was trying to connect to a local PostgreSQL database (`localhost:5432`) instead of your Render PostgreSQL database.

## Solution Applied
✅ Updated `DATABASE_URL` in `.env` to use your Render PostgreSQL database:
```
postgresql://sociogram_db_user:D3qLzUo9yUrOLNR4xNZOPhmMOxZx45fQ@dpg-d3cnqgfdiees7384u2u0-a/sociogram_db
```

## Next Steps

### 1. Deploy Updated Code to Render
- Push your updated code to your Git repository
- Render will automatically redeploy with the new database connection

### 2. Run Database Migrations (IMPORTANT!)
After deployment, you need to ensure your database schema is up to date:

```bash
# In your Render service console or locally with production DATABASE_URL:
npx prisma migrate deploy
npx prisma generate
```

### 3. Verify Database Connection
You can test the connection by visiting:
- `https://sociogram-n73b.onrender.com/health` - Should return healthy status
- `https://sociogram-n73b.onrender.com/` - Should return API info

### 4. Environment Variables in Render
Make sure these environment variables are set in your Render service:
- `DATABASE_URL`: postgresql://sociogram_db_user:D3qLzUo9yUrOLNR4xNZOPhmMOxZx45fQ@dpg-d3cnqgfdiees7384u2u0-a/sociogram_db
- `SECRET_KEY`: your_super_secret_jwt_key_here_make_it_long_and_secure_sociogram_2025
- `NODE_ENV`: production
- `CLOUDINARY_CLOUD_NAME`: dhnm18vip
- `CLOUDINARY_API_KEY`: 796749771261874
- `CLOUDINARY_API_SECRET`: kberCNHyCLAlX9tvYe_8PS_fc6Q

## What Was Wrong
The login endpoint was failing because:
1. Backend couldn't connect to database (wrong DATABASE_URL)
2. All database operations in the login function were failing
3. This caused the 500 Internal Server Error

## After Fix
- Login should work properly
- Database operations will succeed
- 500 errors should be resolved
