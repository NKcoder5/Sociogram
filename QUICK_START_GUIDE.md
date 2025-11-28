# 🚀 QUICK START GUIDE - Sociogram College Network

## ⚠️ CRITICAL: Fix Before Starting

Your app isn't working because the **Prisma client needs to be regenerated**. Here's how to fix it:

### Step 1: Stop Any Running Servers

1. **Close all terminal windows** running the backend or frontend
2. **Kill any Node processes** if needed:
   ```powershell
   taskkill /F /IM node.exe
   ```

### Step 2: Regenerate Prisma Client

```powershell
cd E:\Sociogram\backend
npx prisma generate
```

Wait for it to complete - you should see:
```
✔ Generated Prisma Client (x.x.x) in xxx ms
```

### Step 3: Apply Database Migrations

```powershell
cd E:\Sociogram\backend
npx prisma migrate deploy
```

Or if you're in development:
```powershell
npx prisma migrate dev
```

---

## 📋 Complete Setup Flow

### Step 1: Backend Setup

1. **Navigate to backend:**
   ```powershell
   cd E:\Sociogram\backend
   ```

2. **Check your .env file** exists and has:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
   SECRET_KEY="your-secret-key-here"
   PORT=8000
   
   # Cloudinary (optional but needed for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Install dependencies** (if not done):
   ```powershell
   npm install
   ```

4. **Generate Prisma Client** (CRITICAL!):
   ```powershell
   npx prisma generate
   ```

5. **Apply migrations:**
   ```powershell
   npx prisma migrate deploy
   ```

6. **Start backend:**
   ```powershell
   npm start
   ```
   
   You should see:
   ```
   ✅ Cloudinary configured successfully
   Server listening at port 8000
   Socket.io server ready for connections
   ```

### Step 2: Frontend Setup

1. **Open a NEW terminal window**

2. **Navigate to frontend:**
   ```powershell
   cd E:\Sociogram\frontend
   ```

3. **Check your .env file** (or create it) with:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_SOCKET_URL=http://localhost:8000
   ```

4. **Install dependencies** (if not done):
   ```powershell
   npm install
   ```

5. **Start frontend:**
   ```powershell
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x ready in xxx ms
   ➜ Local: http://localhost:5000/
   ```

### Step 3: Create Your First Admin User

1. **Open browser** → `http://localhost:5000`

2. **Register a new account:**
   - Click "Get Started" or "Sign In"
   - Click "Register" or "Sign Up"
   - Fill in:
     - Username: `admin`
     - Email: `admin@college.edu`
     - Password: `password123`
   - Click "Create Account" or "Sign Up"

3. **You'll see "Profile Pending" screen** - This is NORMAL!

4. **Promote yourself to Admin:**
   - Open a NEW terminal
   - Run:
     ```powershell
     cd E:\Sociogram\backend
     npx prisma studio
     ```
   - This opens a browser window with database GUI
   - Find `User` table in the left sidebar
   - Click on `User` table
   - Find your user (the one you just created)
   - Click on the user row to edit
   - Change these fields:
     - `role`: Change to `SUPER_ADMIN`
     - `profileStatus`: Change to `APPROVED`
   - Click "Save 1 change" at the bottom
   - Close Prisma Studio

5. **Refresh your browser** (on `http://localhost:5000`)

6. **You should now be logged in as Admin!**

---

## 🎯 How to Use the App

### For Admin (You)

1. **Login** - You're already logged in after refreshing!

2. **Go to Admin Console:**
   - Click "Admin Console" in the sidebar (or navigate to `/admin/console`)
   - You'll see:
     - **User Approvals** tab - Approve pending users
     - **Departments** tab - Create/edit departments
     - **Classes** tab - Create/edit class sections

3. **Create a Department:**
   - Go to Admin Console → Departments tab
   - Click "Create Department"
   - Fill in:
     - Name: `Computer Science`
     - Code: `CS`
     - Description: `Department of Computer Science`
   - Click "Create"

4. **Create a Class:**
   - Go to Admin Console → Classes tab
   - Click "Create Class"
   - Fill in:
     - Name: `CS 2024 A`
     - Code: `CS2024A`
     - Department: Select "Computer Science"
     - Year: `2024`
     - Section: `A`
     - Semester: `1`
   - Click "Create"

5. **Test User Flow:**
   - Logout (click your profile → Logout)
   - Register a NEW user (this will be a student)
   - The new user will be in PENDING status
   - Login as admin again
   - Go to Admin Console → User Approvals
   - Find the new user
   - Click "Approve"
   - Assign them:
     - Role: `STUDENT`
     - Department: `Computer Science`
     - Class: `CS 2024 A`
     - Year: `2024`
   - Click "Approve User"
   - Now the student can login and access the platform!

---

## 🔍 Troubleshooting

### Problem: "Can't Login" or "Profile Pending" screen

**Solution:**
- Your account needs approval by an admin
- Follow Step 3 above to promote yourself to admin
- Or have an existing admin approve you

### Problem: "Unknown field `department`" error

**Solution:**
- Prisma client needs regeneration
- Stop all servers
- Run: `cd backend && npx prisma generate`
- Restart servers

### Problem: Backend won't start

**Check:**
1. Is PostgreSQL running?
2. Is `DATABASE_URL` correct in `backend/.env`?
3. Are migrations applied? Run: `npx prisma migrate deploy`
4. Is Prisma client generated? Run: `npx prisma generate`

### Problem: Frontend can't connect to backend

**Check:**
1. Is backend running on port 8000?
2. Check `frontend/.env` has `VITE_API_URL=http://localhost:8000`
3. Check browser console for CORS errors
4. Verify backend CORS settings in `backend/index.js`

### Problem: "Page not working" or blank page

**Check:**
1. Browser console (F12) for errors
2. Network tab for failed API calls
3. Backend terminal for error messages
4. Make sure both servers are running

---

## 📍 Common File Locations

- **Backend config**: `backend/.env`
- **Frontend config**: `frontend/.env`
- **Database schema**: `backend/prisma/schema.prisma`
- **API routes**: `backend/routes/`
- **Frontend pages**: `frontend/src/pages/`
- **Frontend API calls**: `frontend/src/api/`

---

## ✅ Verification Checklist

Before using the app, verify:

- [ ] PostgreSQL database is running
- [ ] `DATABASE_URL` is set in `backend/.env`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5000
- [ ] Can access `http://localhost:5000` in browser
- [ ] Can register a new user
- [ ] Can promote user to admin via Prisma Studio
- [ ] Can login as admin

---

## 🆘 Still Stuck?

1. **Check terminal outputs** - Look for error messages
2. **Check browser console** (F12) - Look for JavaScript errors
3. **Check Network tab** (F12) - Look for failed API calls (status 500, 404, etc.)
4. **Read the error messages** - They usually tell you exactly what's wrong!

**Most common issues:**
- Prisma client not generated → Run `npx prisma generate`
- User not approved → Promote to admin via Prisma Studio
- Database not connected → Check `DATABASE_URL` in `.env`
- Backend not running → Start with `npm start` in backend folder

---

## 🎓 Next Steps After Setup

1. ✅ Create departments and classes
2. ✅ Approve test users
3. ✅ Test posting announcements
4. ✅ Test uploading materials
5. ✅ Test creating events
6. ✅ Test student/faculty flows

**Happy coding! 🚀**

