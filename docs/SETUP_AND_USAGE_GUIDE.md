# 🚀 Sociogram College Social Network - Complete Setup & Usage Guide

## ⚠️ CRITICAL: Fix the Prisma Client Error First

Before anything else, you need to regenerate the Prisma client:

```bash
cd backend
npx prisma generate
```

This will fix the "Unknown field `department`" error you're seeing.

---

## 📋 Step-by-Step Setup

### Step 1: Database Setup

1. **Ensure PostgreSQL is running** and you have a database created
2. **Run migrations** to create all tables:

```bash
cd backend
npx prisma migrate deploy
# OR for development:
npx prisma migrate dev
```

3. **Generate Prisma Client** (CRITICAL - this fixes your error):

```bash
npx prisma generate
```

### Step 2: Environment Variables

Create `backend/.env` file with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sociogram"
SECRET_KEY="your-secret-key-here"
PORT=8000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Firebase (if using)
FIREBASE_PROJECT_ID=your-project-id
```

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### Step 4: Create Initial Admin User

**Option A: Manual Creation (Recommended for First Time)**

1. **Start the backend server:**

```bash
cd backend
npm start
# OR
node index.js
```

2. **Register a new user via API or frontend** (it will be in PENDING status)

3. **Create an admin user directly in database** (temporary, just for initial setup):

```bash
cd backend
npx prisma studio
```

In Prisma Studio:
- Open `User` table
- Find your registered user
- Edit the user:
  - Set `role` = `SUPER_ADMIN` or `ADMIN`
  - Set `profileStatus` = `APPROVED`

**Option B: Use Seed Script (Creates test users)**

```bash
cd backend
node utils/runImprovedSeed.js
```

⚠️ **Note**: Seed script creates regular users. You'll still need to manually promote one to ADMIN via Prisma Studio.

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

You should see:
```
✅ Cloudinary configured successfully
Server listening at port 8000
Socket.io server ready for connections
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

---

## 👤 Complete User Flow Guide

### Flow 1: First-Time Admin Setup

1. **Open** `http://localhost:5173` in your browser
2. **Click "Get Started"** or "Sign In"
3. **Register** a new account:
   - Fill in: Username, Email, Password
   - Optional: College ID, Department ID, Class ID, Year
   - Click "Create Account"
4. **Account will be PENDING** - you'll see a "Profile Pending" screen
5. **Promote to Admin:**
   - Open Prisma Studio: `cd backend && npx prisma studio`
   - Find your user
   - Set `role` = `SUPER_ADMIN`
   - Set `profileStatus` = `APPROVED`
   - Save
6. **Refresh browser** - you should now see the dashboard

### Flow 2: Admin Approves New Users

1. **Login** as admin (you should now see full access)
2. **Navigate to "Admin Console"** (in sidebar)
3. **Go to "User Approvals"** tab
4. **See list of pending users**
5. **Click "Approve"** on a user:
   - Optionally set their role, department, class
   - Click "Approve User"
6. **User is now approved** and can access the platform

### Flow 3: Admin Creates Departments & Classes

1. **As admin**, go to **Admin Console**
2. **Click "Departments"** tab
3. **Click "Create Department"**:
   - Name: "Computer Science"
   - Code: "CS"
   - Description: "Department of Computer Science"
   - Optional: Select Head of Department
   - Click "Create"
4. **Click "Classes"** tab
5. **Click "Create Class"**:
   - Name: "CS 2024 A"
   - Code: "CS2024A"
   - Department: Select "Computer Science"
   - Year: "2024"
   - Section: "A"
   - Semester: 1
   - Optional: Select Advisor
   - Click "Create"

### Flow 4: Student Registration & Approval

1. **New student registers** via landing page
2. **Enters college details** (optional during registration)
3. **Account status: PENDING**
4. **Admin receives notification** (or checks Admin Console)
5. **Admin approves student**:
   - Assigns to Department: "Computer Science"
   - Assigns to Class: "CS 2024 A"
   - Sets Year: "2024"
   - Sets Role: "STUDENT"
   - Clicks "Approve"
6. **Student can now login** and see:
   - Student Dashboard
   - Department announcements
   - Class materials
   - Events calendar

### Flow 5: Faculty Registration

1. **Faculty member registers** via landing page
2. **Admin approves** and sets:
   - Role: `FACULTY` or `ADMIN`
   - Department: Their department
   - Profile Status: `APPROVED`
3. **Faculty can now**:
   - Post announcements (department/class/college-wide)
   - Upload materials/notes
   - Create events
   - Verify student achievements

### Flow 6: Using the Platform (Student)

1. **Login** as approved student
2. **Student Dashboard** shows:
   - Recent announcements (for your department/class)
   - Upcoming events
   - New materials/notes
   - Recent posts from your network

3. **Feed** (`/feed`):
   - See posts filtered by:
     - Category: General, Academic, Talent, Event
     - Audience: Public, College, Department, Class
   - Create posts with category/audience selection

4. **Announcements** (`/announcements`):
   - View all announcements visible to you
   - Filter by scope: College, Department, Class

5. **Notes** (`/notes`):
   - Browse materials shared by faculty
   - Filter by subject, semester, department
   - Download/view materials
   - Comment on materials

6. **Events** (`/events`):
   - View upcoming events
   - Register for events
   - See event details

7. **Directory** (`/directory`):
   - Browse departments
   - View classes
   - Search students/faculty
   - Filter by department, class, year

8. **Talent Hub** (`/talent`):
   - Submit achievements with certificates/images
   - View verified achievements
   - Showcase your talent portfolio

9. **Messages** (`/messages`):
   - Chat with other users
   - Join department/class groups (auto-created)
   - Real-time messaging

### Flow 7: Using the Platform (Faculty)

1. **Login** as faculty
2. **Faculty Dashboard** shows:
   - Your posted announcements
   - Your uploaded materials
   - Your created events
   - Pending achievement verifications

3. **Post Announcements**:
   - Go to Announcements page
   - Click "Create Announcement"
   - Select scope: College / Department / Class
   - Write title and content
   - Attach files (optional)
   - Publish

4. **Upload Materials**:
   - Go to Notes page
   - Click "Upload Material"
   - Select file (PDF, images, etc.)
   - Add title, description
   - Set subject, semester
   - Choose department/class visibility
   - Upload

5. **Create Events**:
   - Go to Events page
   - Click "Create Event"
   - Fill event details (title, description, date/time, location)
   - Set capacity, registration deadline
   - Add cover image
   - Publish

6. **Verify Achievements**:
   - Go to Talent Hub
   - See pending student achievements
   - Review certificates/media
   - Approve or reject

### Flow 8: Admin Console Features

1. **User Management**:
   - View all users
   - Approve/reject pending users
   - Change user roles
   - Suspend/ban users

2. **Department Management**:
   - Create/edit/delete departments
   - Assign department heads
   - View department stats

3. **Class Management**:
   - Create/edit/delete class sections
   - Assign class advisors
   - View class rosters

4. **Event Management**:
   - View all events
   - Edit/delete events
   - View registrations

5. **Dashboard Metrics**:
   - Total users (by role)
   - Pending approvals count
   - Total events
   - Active users

---

## 🔧 Troubleshooting

### Issue 1: "Unknown field `department`" Error

**Fix:**
```bash
cd backend
npx prisma generate
npm start  # restart server
```

### Issue 2: Can't Login

**Possible causes:**
1. User doesn't exist → Register first
2. User is PENDING → Admin needs to approve
3. Wrong password → Check credentials
4. Prisma client not generated → Run `npx prisma generate`

**Fix:**
- Check browser console for errors
- Check backend terminal for error logs
- Verify user exists in database: `npx prisma studio`

### Issue 3: "Profile Status PENDING" Screen

**This is normal!** New users are pending approval. Admin needs to:
1. Login to Admin Console
2. Approve the user
3. User refreshes browser

### Issue 4: Database Connection Error

**Fix:**
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `backend/.env`
3. Test connection: `npx prisma db pull`

### Issue 5: File Uploads Not Working

**Fix:**
1. Check Cloudinary credentials in `backend/.env`
2. Verify CLOUDINARY_* variables are set
3. Check backend logs for upload errors

### Issue 6: Frontend Can't Connect to Backend

**Fix:**
1. Verify backend is running on port 8000
2. Check `frontend/.env` or `frontend/vite.config.js` for API URL
3. Check CORS settings in `backend/index.js`
4. Verify frontend is trying to connect to correct backend URL

---

## 📝 Quick Reference Commands

```bash
# Backend Setup
cd backend
npm install
npx prisma migrate deploy      # Apply migrations
npx prisma generate             # Generate Prisma client (CRITICAL!)
npm start

# Frontend Setup
cd frontend
npm install
npm run dev

# Database Management
npx prisma studio               # Open database GUI
npx prisma migrate dev          # Create new migration
npx prisma db push              # Push schema changes

# Seed Database
cd backend
node utils/runImprovedSeed.js   # Create test users
```

---

## 🎯 Typical First-Time Setup Sequence

```bash
# 1. Setup database
cd backend
npx prisma migrate deploy
npx prisma generate

# 2. Create .env file with your database URL
# Edit backend/.env

# 3. Start backend
npm start

# 4. In new terminal - start frontend
cd frontend
npm run dev

# 5. Open browser: http://localhost:5173

# 6. Register your first user

# 7. Promote to admin via Prisma Studio
npx prisma studio
# Edit user: role=SUPER_ADMIN, profileStatus=APPROVED

# 8. Refresh browser - you're now admin!

# 9. Create departments and classes via Admin Console

# 10. Approve other users as needed
```

---

## ✅ Verification Checklist

Before using the app, verify:

- [ ] PostgreSQL database is running
- [ ] `DATABASE_URL` is set correctly
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Can register a new user
- [ ] Admin user exists and is APPROVED
- [ ] Can login as admin
- [ ] Admin Console is accessible

---

## 🆘 Still Having Issues?

1. **Check backend logs** - Look for error messages
2. **Check browser console** - Look for API errors
3. **Verify database** - Use Prisma Studio to check data
4. **Check environment variables** - All required vars set?
5. **Verify ports** - Backend on 8000, Frontend on 5173?

---

**Need help?** Check the error messages in terminal and browser console, they usually point to the exact issue!

