# 🔓 BREAK THE LOOP - First Admin Setup Guide

## ❌ The Problem

You're stuck because:
1. ✅ You registered a new user
2. ❌ Your profile is `PENDING` status
3. ❌ Admin Console requires `ADMIN` or `SUPER_ADMIN` role
4. ❌ You can't approve yourself because you can't access Admin Console

**You need to manually promote yourself to ADMIN using Prisma Studio!**

---

## ✅ Solution: Manual Admin Promotion

### Step 1: Find Your User Email/Username

Before opening Prisma Studio, note your:
- **Email address** you used to register
- **Username** you chose

You'll need this to find yourself in the database.

---

### Step 2: Open Prisma Studio

Open a **NEW terminal window** (keep your backend/frontend servers running) and run:

```powershell
cd E:\Sociogram\backend
npx prisma studio
```

This will:
- Start Prisma Studio on `http://localhost:5555`
- Open it automatically in your browser

**Wait for it to fully load!** You'll see a list of database tables.

---

### Step 3: Find Your User

1. **In Prisma Studio**, look at the left sidebar
2. **Click on `User`** table (you should see it in the list)
3. **You'll see a list of all users** in your database

4. **Find your user** by:
   - Looking for your email address
   - Or looking for your username
   - Or looking at the most recent user (newest registration)

---

### Step 4: Edit Your User

1. **Click on your user row** to select it
2. **Click the "Edit" button** (or double-click the row)

3. **Find these fields and change them:**

   **Field 1: `role`**
   - Current value: `STUDENT`
   - Change to: `SUPER_ADMIN`
   - (or `ADMIN` if `SUPER_ADMIN` doesn't work)

   **Field 2: `profileStatus`**
   - Current value: `PENDING`
   - Change to: `APPROVED`

4. **Scroll down** and click **"Save 1 change"** (or "Save" button at bottom)

5. **Verify the changes saved** - your user should now show:
   - `role`: `SUPER_ADMIN`
   - `profileStatus`: `APPROVED`

---

### Step 5: Close Prisma Studio

You can close Prisma Studio now (close the browser tab or press `Ctrl+C` in the terminal).

---

### Step 6: Refresh Your Browser

1. **Go back to your Sociogram app** (`http://localhost:5000`)
2. **Press F5** or **Ctrl+R** to refresh
3. **Clear browser cache if needed:**
   - Press `Ctrl+Shift+R` (hard refresh)
   - Or clear localStorage:
     - Press F12 → Console tab
     - Type: `localStorage.clear()` and press Enter
     - Then refresh the page

---

### Step 7: Login Again (if needed)

If you got logged out:
1. Go to `http://localhost:5000`
2. Click "Sign In"
3. Enter your email and password
4. Click "Login"

---

### Step 8: Verify You're Admin

After login/refresh, you should now:
- ✅ See the sidebar with admin options
- ✅ See "Admin Console" in the menu
- ✅ Be able to access `/admin/console`
- ✅ See your role as `SUPER_ADMIN` in your profile

---

## 🎯 Visual Guide - Prisma Studio

### Finding Your User:
```
Prisma Studio (http://localhost:5555)
│
├── User ← Click this!
│   ├── id: abc123
│   ├── username: "yourusername" ← Find this
│   ├── email: "your@email.com" ← Or this
│   ├── role: "STUDENT" ← Change this
│   └── profileStatus: "PENDING" ← Change this
```

### Editing Fields:
```
Edit User
│
├── role: [SUPER_ADMIN ▼] ← Change dropdown
│
└── profileStatus: [APPROVED ▼] ← Change dropdown
    [Save 1 change] ← Click this!
```

---

## 🔧 Alternative: Quick SQL Update

If Prisma Studio doesn't work, you can use SQL directly:

```powershell
cd E:\Sociogram\backend
npx prisma db execute --stdin
```

Then paste this SQL (replace `your-email@example.com` with your actual email):

```sql
UPDATE "User" 
SET role = 'SUPER_ADMIN', "profileStatus" = 'APPROVED' 
WHERE email = 'your-email@example.com';
```

Press Enter twice, then Ctrl+C to exit.

---

## ✅ Verification Checklist

After following these steps, verify:

- [ ] User `role` is `SUPER_ADMIN` or `ADMIN` in database
- [ ] User `profileStatus` is `APPROVED` in database
- [ ] Can access `/admin/console` in browser
- [ ] See "Admin Console" in sidebar
- [ ] Can see "User Approvals" tab in Admin Console
- [ ] No more "Profile Pending" screen

---

## 🆘 Troubleshooting

### Problem: "Can't find my user in Prisma Studio"

**Solution:**
1. Make sure you're looking at the `User` table
2. Use the search/filter box to search by email or username
3. Check if there are multiple pages (use pagination at bottom)

### Problem: "Can't change role field"

**Solution:**
1. Click on the field to edit it
2. It should be a dropdown - select `SUPER_ADMIN` or `ADMIN`
3. Make sure you clicked "Save" after changing

### Problem: "Still see Profile Pending screen"

**Solution:**
1. **Clear browser cache:**
   - Press F12 → Application tab → Clear storage → Clear site data
   - Or: `localStorage.clear()` in console
2. **Hard refresh:** `Ctrl+Shift+R`
3. **Logout and login again:**
   - Run: `localStorage.clear(); window.location.reload();` in console
   - Then login again

### Problem: "Prisma Studio won't open"

**Solution:**
1. Make sure backend is running
2. Check if port 5555 is available
3. Try closing and reopening: `npx prisma studio`
4. Check backend terminal for errors

### Problem: "Still can't access Admin Console"

**Solution:**
1. Verify in Prisma Studio that your user has:
   - `role` = `SUPER_ADMIN` or `ADMIN`
   - `profileStatus` = `APPROVED`
2. **Logout completely:**
   - Run in console: `localStorage.clear(); window.location.reload();`
3. **Login again** with your credentials
4. **Check browser console** (F12) for any errors

---

## 📝 Quick Reference Commands

```powershell
# Open Prisma Studio
cd E:\Sociogram\backend
npx prisma studio

# Clear browser cache (in browser console F12)
localStorage.clear(); window.location.reload();

# Hard refresh browser
Ctrl+Shift+R
```

---

## 🎉 Next Steps After Becoming Admin

Once you're admin:

1. ✅ **Create Departments**
   - Go to Admin Console → Departments tab
   - Click "Create Department"

2. ✅ **Create Classes**
   - Go to Admin Console → Classes tab
   - Click "Create Class"

3. ✅ **Approve Other Users**
   - Go to Admin Console → User Approvals tab
   - Click "Approve" on pending users

4. ✅ **Assign Users to Departments/Classes**
   - When approving users, set their department and class

---

## 💡 Why This Happens

This is a **bootstrap problem**:
- The first admin user can't be created through the UI
- Someone needs to have admin access to approve others
- The only way is to manually promote the first user in the database

This is normal and expected! After you become admin, you can manage everything through the Admin Console.

---

**Follow these steps and you'll be admin in 5 minutes! 🚀**



