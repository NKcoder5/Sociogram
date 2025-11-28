# 🚀 START HERE - How to Use Sociogram College Network

## ✅ STEP 1: Fix Prisma Client (ALREADY DONE!)

The Prisma client has been regenerated. Your backend should work now!

---

## 📋 STEP 2: Complete Setup Flow

### 2.1 Start the Backend

Open a terminal and run:

```powershell
cd E:\Sociogram\backend
npm start
```

**Expected output:**
```
✅ Cloudinary configured successfully
Server listening at port 8000
Socket.io server ready for connections
```

**Keep this terminal open!**

---

### 2.2 Start the Frontend

Open a **NEW terminal** window and run:

```powershell
cd E:\Sociogram\frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5000/
```

**Keep this terminal open too!**

---

### 2.3 Open the App in Browser

1. Open your browser
2. Go to: `http://localhost:5000`
3. You should see the landing page

---

## 👤 STEP 3: Create Your First Admin Account

### 3.1 Register a New User

1. On the landing page, click **"Get Started"** or **"Sign In"**
2. Click **"Register"** or **"Sign Up"**
3. Fill in the form:
   - **Username**: `admin` (or any username)
   - **Email**: `admin@college.edu` (or any email)
   - **Password**: `password123` (or any password)
4. Click **"Create Account"** or **"Sign Up"**

5. **You'll see a "Profile Pending" screen** - This is NORMAL! ✅

---

### 3.2 Promote Yourself to Admin

1. **Open a NEW terminal** window (keep the other two running!)

2. **Open Prisma Studio:**
   ```powershell
   cd E:\Sociogram\backend
   npx prisma studio
   ```
   
   This will:
   - Open a browser window at `http://localhost:5555`
   - Show your database tables

3. **Find your user:**
   - In the left sidebar, click on **`User`** table
   - You'll see a list of users
   - Find the user you just created (check by email or username)

4. **Edit your user:**
   - Click on the user row to select it
   - Click the **"Edit"** button (or double-click the row)
   - Find the **`role`** field
   - Change it from `STUDENT` to **`SUPER_ADMIN`**
   - Find the **`profileStatus`** field
   - Change it from `PENDING` to **`APPROVED`**
   - Scroll down and click **"Save 1 change"**

5. **Close Prisma Studio** (keep the terminal open or close it, doesn't matter)

---

### 3.3 Refresh Your Browser

1. Go back to `http://localhost:5000`
2. **Press F5** or **Ctrl+R** to refresh
3. **You should now be logged in as Admin!** 🎉

---

## 🎯 STEP 4: Now You Can Use the App!

### For Admin (You):

1. **You should see the sidebar** with menu items:
   - Feed
   - Messages
   - Create
   - **Admin Console** ← This is your admin panel!
   - And more...

2. **Go to Admin Console:**
   - Click **"Admin Console"** in the sidebar
   - Or navigate to: `http://localhost:5000/admin/console`

3. **Create a Department:**
   - Click **"Departments"** tab
   - Click **"Create Department"** button
   - Fill in:
     - Name: `Computer Science`
     - Code: `CS`
     - Description: `Department of Computer Science`
   - Click **"Create"**

4. **Create a Class:**
   - Click **"Classes"** tab
   - Click **"Create Class"** button
   - Fill in:
     - Name: `CS 2024 A`
     - Code: `CS2024A`
     - Department: Select "Computer Science"
     - Year: `2024`
     - Section: `A`
     - Semester: `1`
   - Click **"Create"**

5. **Approve Other Users:**
   - When someone registers, they'll appear in **"User Approvals"** tab
   - Click on a user
   - Set their role (STUDENT, FACULTY, etc.)
   - Assign them to a department and class
   - Click **"Approve User"**

---

## 📚 STEP 5: Understanding the User Flow

### Student Flow:

1. **Student registers** → Status: PENDING
2. **Admin approves** → Assigns department, class, role
3. **Student can now:**
   - Login
   - See Student Dashboard
   - View announcements for their department/class
   - Access materials/notes shared by faculty
   - Register for events
   - Submit achievements
   - Post in feed

### Faculty Flow:

1. **Faculty registers** → Status: PENDING
2. **Admin approves** → Sets role: FACULTY
3. **Faculty can now:**
   - Login
   - See Faculty Dashboard
   - Post announcements (college/department/class-wide)
   - Upload materials/notes
   - Create events
   - Verify student achievements
   - Manage their classes

### Admin Flow:

1. **Admin can:**
   - Approve/reject users
   - Create/edit departments
   - Create/edit classes
   - View all users
   - Manage events
   - View system metrics

---

## 🔍 Quick Troubleshooting

### "Can't Login" or "Profile Pending"

**Solution:** Your account needs approval. Follow Step 3.2 to promote yourself to admin.

### "Backend Not Running"

**Solution:**
1. Go to backend terminal
2. Check if it says "Server listening at port 8000"
3. If not, restart: `npm start`

### "Frontend Not Loading"

**Solution:**
1. Go to frontend terminal
2. Check if it shows "Local: http://localhost:5000/"
3. If not, restart: `npm run dev`

### "Unknown field `department`" Error

**Solution:** (Already fixed! But if you see this again:)
```powershell
cd E:\Sociogram\backend
npx prisma generate
```

### "Database Connection Error"

**Solution:**
1. Make sure PostgreSQL is running
2. Check `backend/.env` has correct `DATABASE_URL`
3. Test connection: `npx prisma db pull`

---

## 📖 More Information

- **Detailed Setup Guide**: See `docs/SETUP_AND_USAGE_GUIDE.md`
- **Quick Start**: See `QUICK_START_GUIDE.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **API Reference**: See `docs/API_REFERENCE.md`

---

## ✅ Verification Checklist

Before you start using the app, make sure:

- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 5000
- [ ] Can access `http://localhost:5000` in browser
- [ ] Can register a new user
- [ ] Can promote user to admin via Prisma Studio
- [ ] Can login as admin
- [ ] Can access Admin Console

---

## 🎉 You're All Set!

Once you've completed these steps, you can:

1. ✅ Create departments and classes
2. ✅ Approve test users
3. ✅ Post announcements
4. ✅ Upload materials
5. ✅ Create events
6. ✅ Manage the college network

**Happy coding! 🚀**

---

## 💡 Pro Tips

1. **Keep Prisma Studio open** - It's super useful for checking database data
2. **Check browser console** (F12) - Errors usually appear there
3. **Check backend terminal** - Server errors show up there
4. **Use Admin Console** - It's your main management tool

---

**Questions?** Check `TROUBLESHOOTING.md` or the error messages in your terminals!

