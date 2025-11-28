# 🔧 TROUBLESHOOTING GUIDE - Sociogram College Network

## ❌ Problem: Can't Login / Page Not Working

### Common Causes & Solutions

---

## 🔴 Issue 1: "Unknown field `department`" Error

**Symptoms:**
- Backend crashes or returns errors
- Console shows: `Unknown field 'department' on model 'User'`
- Can't login or register

**Root Cause:**
- Prisma client is outdated and doesn't match the updated schema

**Solution:**

1. **Stop all running servers:**
   - Close all terminal windows
   - Or kill Node processes: `taskkill /F /IM node.exe`

2. **Regenerate Prisma Client:**
   ```powershell
   cd E:\Sociogram\backend
   npx prisma generate
   ```

3. **Wait for completion** - You should see:
   ```
   ✔ Generated Prisma Client (x.x.x) in xxx ms
   ```

4. **Restart backend:**
   ```powershell
   npm start
   ```

---

## 🔴 Issue 2: "Profile Pending" Screen After Registration

**Symptoms:**
- Registered successfully
- But see "Profile Pending" or "Waiting for approval" screen
- Can't access any features

**Root Cause:**
- New users default to `PENDING` status
- Need admin approval to access platform

**Solution - Create First Admin:**

**Method A: Using Prisma Studio (Recommended)**

1. **Register a user** via the frontend (any username/email)

2. **Open Prisma Studio:**
   ```powershell
   cd E:\Sociogram\backend
   npx prisma studio
   ```
   - This opens `http://localhost:5555` in your browser

3. **Navigate to User table:**
   - Click `User` in left sidebar
   - Find your registered user

4. **Edit the user:**
   - Click on the user row
   - Change fields:
     - `role`: Change to `SUPER_ADMIN`
     - `profileStatus`: Change to `APPROVED`
   - Click "Save 1 change" at bottom

5. **Refresh your browser** (the Sociogram app)
   - You should now be logged in as admin!

**Method B: Direct Database Query**

If Prisma Studio doesn't work, you can use SQL:

```sql
-- Find your user
SELECT id, username, email, role, "profileStatus" FROM "User";

-- Update to admin (replace 'your-email@example.com' with your email)
UPDATE "User" 
SET role = 'SUPER_ADMIN', "profileStatus" = 'APPROVED' 
WHERE email = 'your-email@example.com';
```

---

## 🔴 Issue 3: "Cannot connect to backend" / Network Error

**Symptoms:**
- Frontend shows blank page or errors
- Browser console shows: `Network Error` or `CORS Error`
- API calls fail

**Root Cause:**
- Backend not running
- Wrong API URL configuration
- CORS issues

**Solution:**

1. **Verify backend is running:**
   ```powershell
   cd E:\Sociogram\backend
   npm start
   ```
   - Should see: `Server listening at port 8000`

2. **Check backend URL:**
   - Frontend is configured to use: `http://localhost:8000/api/v1`
   - Verify this matches your backend port

3. **Check CORS settings:**
   - Look in `backend/index.js` for CORS configuration
   - Should allow `http://localhost:5000` (or your frontend port)

4. **Verify ports:**
   - Backend: `8000`
   - Frontend: `5000` (check `frontend/vite.config.js`)
   - Make sure nothing else is using these ports

5. **Check browser console:**
   - Press F12 → Console tab
   - Look for API errors
   - Check Network tab for failed requests

---

## 🔴 Issue 4: "Database connection failed"

**Symptoms:**
- Backend won't start
- Error: `Can't reach database server`
- Prisma errors about connection

**Root Cause:**
- PostgreSQL not running
- Wrong `DATABASE_URL` in `.env`

**Solution:**

1. **Verify PostgreSQL is running:**
   - Check Windows Services (search "Services" in Start menu)
   - Find "postgresql" service
   - Make sure it's "Running"

2. **Check database exists:**
   ```sql
   -- Connect to PostgreSQL (using pgAdmin or psql)
   -- List databases
   \l
   
   -- Create database if doesn't exist
   CREATE DATABASE sociogram;
   ```

3. **Verify `DATABASE_URL` in `backend/.env`:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/sociogram"
   ```
   - Replace `username`, `password`, and `sociogram` with your actual values

4. **Test connection:**
   ```powershell
   cd E:\Sociogram\backend
   npx prisma db pull
   ```
   - Should connect successfully

5. **Apply migrations:**
   ```powershell
   npx prisma migrate deploy
   ```

---

## 🔴 Issue 5: "Migration failed" or Schema errors

**Symptoms:**
- Error when running migrations
- Tables don't exist
- Schema mismatch errors

**Solution:**

1. **Check migration status:**
   ```powershell
   cd E:\Sociogram\backend
   npx prisma migrate status
   ```

2. **Apply pending migrations:**
   ```powershell
   npx prisma migrate deploy
   ```

3. **If migrations are stuck, reset (⚠️ DELETES ALL DATA):**
   ```powershell
   npx prisma migrate reset
   # Then apply migrations again
   npx prisma migrate deploy
   ```

4. **Push schema directly (for development only):**
   ```powershell
   npx prisma db push
   ```

---

## 🔴 Issue 6: Frontend shows blank page

**Symptoms:**
- Browser shows blank white page
- No errors visible
- React app not loading

**Solution:**

1. **Check browser console:**
   - Press F12
   - Look for JavaScript errors
   - Check if React is loading

2. **Check if frontend is running:**
   ```powershell
   cd E:\Sociogram\frontend
   npm run dev
   ```
   - Should see: `Local: http://localhost:5000/`

3. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cache and cookies
   - Hard refresh: `Ctrl + Shift + R`

4. **Check for build errors:**
   - Look at terminal where `npm run dev` is running
   - Fix any compilation errors

5. **Check Node version:**
   ```powershell
   node --version
   ```
   - Should be Node 18+ (preferably Node 20)

---

## 🔴 Issue 7: "401 Unauthorized" when trying to access routes

**Symptoms:**
- Can't access protected routes
- Getting redirected to login
- Token errors

**Root Cause:**
- User not authenticated
- Token expired or invalid
- User profile not approved

**Solution:**

1. **Check if logged in:**
   - Open browser DevTools (F12)
   - Go to Application tab → Local Storage
   - Check if `token` and `user` exist

2. **Clear localStorage and re-login:**
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   // Then refresh and login again
   ```

3. **Verify user is approved:**
   - Use Prisma Studio to check user's `profileStatus`
   - Should be `APPROVED` (not `PENDING`)

4. **Check token expiration:**
   - Tokens expire after 24 hours
   - Just login again if expired

---

## 🔴 Issue 8: File uploads not working

**Symptoms:**
- Can't upload images/files
- Error: "Upload failed"
- Cloudinary errors

**Solution:**

1. **Check Cloudinary credentials in `backend/.env`:**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

2. **Verify Cloudinary account:**
   - Login to Cloudinary dashboard
   - Check if account is active
   - Verify credentials are correct

3. **Test upload:**
   - Try uploading a small image first
   - Check backend logs for errors

4. **Check file size limits:**
   - Images: 10MB limit (check `backend/middlewares/upload.js`)
   - Documents: 20MB limit (check `backend/middlewares/documentUpload.js`)

---

## 🔴 Issue 9: Prisma Client generation fails with "EPERM" error

**Symptoms:**
- Error: `EPERM: operation not permitted, rename...`
- Can't regenerate Prisma client

**Root Cause:**
- File is locked by running process
- Backend server is running and using the Prisma client

**Solution:**

1. **Stop all Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Wait a few seconds**

3. **Regenerate Prisma client:**
   ```powershell
   cd E:\Sociogram\backend
   npx prisma generate
   ```

4. **If still fails, restart computer** (rarely needed)

---

## 🟢 Quick Diagnostic Commands

Run these to check your setup:

```powershell
# 1. Check Node version
node --version

# 2. Check if backend dependencies installed
cd E:\Sociogram\backend
npm list --depth=0

# 3. Check if frontend dependencies installed
cd E:\Sociogram\frontend
npm list --depth=0

# 4. Check database connection
cd E:\Sociogram\backend
npx prisma db pull

# 5. Check Prisma client is generated
cd E:\Sociogram\backend
npx prisma generate

# 6. Check migration status
cd E:\Sociogram\backend
npx prisma migrate status
```

---

## 📝 Complete Setup Checklist

Use this checklist to verify everything is set up correctly:

### Backend Setup
- [ ] PostgreSQL is running
- [ ] Database created (`sociogram` or your DB name)
- [ ] `backend/.env` file exists with `DATABASE_URL`
- [ ] `backend/.env` has `SECRET_KEY` set
- [ ] Backend dependencies installed: `cd backend && npm install`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Backend starts without errors: `npm start`
- [ ] Backend accessible at `http://localhost:8000`

### Frontend Setup
- [ ] Frontend dependencies installed: `cd frontend && npm install`
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Frontend accessible at `http://localhost:5000`
- [ ] Can see landing page in browser

### User Setup
- [ ] Registered a test user
- [ ] User exists in database (check Prisma Studio)
- [ ] User promoted to `SUPER_ADMIN` with `profileStatus = APPROVED`
- [ ] Can login as admin
- [ ] Can access Admin Console

---

## 🆘 Still Having Issues?

1. **Check all terminal outputs** - Look for error messages
2. **Check browser console** (F12) - Look for JavaScript errors
3. **Check Network tab** (F12) - Look for failed API calls
4. **Check backend logs** - Terminal where backend is running
5. **Verify all environment variables** - Check `.env` files
6. **Try restarting everything:**
   - Stop all servers
   - Regenerate Prisma client
   - Restart PostgreSQL
   - Start servers again

---

## 💡 Pro Tips

1. **Always regenerate Prisma client** after schema changes:
   ```powershell
   npx prisma generate
   ```

2. **Use Prisma Studio** for database management:
   ```powershell
   npx prisma studio
   ```

3. **Check logs frequently:**
   - Backend terminal for server errors
   - Browser console for frontend errors

4. **Keep environment variables updated:**
   - Never commit `.env` files
   - Keep local `.env` files in sync with required variables

5. **Test incrementally:**
   - Start with backend first
   - Then test frontend
   - Finally test full user flow

---

**Need more help?** Check the error messages - they usually tell you exactly what's wrong!

