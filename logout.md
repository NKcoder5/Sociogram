# How to Logout from Current User - Terminal Methods

## 🔐 Understanding Authentication in This App

Authentication is stored in **browser localStorage**:
- `localStorage.getItem('token')` - JWT token
- `localStorage.getItem('user')` - User data

To logout, you need to clear these items from the browser's localStorage.

---

## Method 1: Browser Console (Easiest)

### Step 1: Open Browser Console
1. Open your browser (Chrome, Edge, Firefox)
2. Press **F12** or **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)
3. Go to **Console** tab

### Step 2: Run Logout Commands
Copy and paste these commands in the console:

```javascript
// Clear authentication data
localStorage.removeItem('token');
localStorage.removeItem('user');

// Verify they're cleared
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Refresh the page
window.location.reload();
```

---

## Method 2: Using Browser Automation (Terminal)

### Chrome/Edge (via PowerShell)

```powershell
# Start Chrome with remote debugging
Start-Process chrome.exe -ArgumentList "--remote-debugging-port=9222"

# Use Chrome DevTools Protocol to clear localStorage
# You'll need Node.js script for this (see below)
```

### Using Node.js Script

Create a file `logout.js`:

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222'
  });
  
  const pages = await browser.pages();
  const page = pages[0]; // Use first open tab
  
  // Navigate to your app if not already there
  await page.goto('http://localhost:5000');
  
  // Clear localStorage
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logged out!');
  });
  
  // Refresh page
  await page.reload();
  
  console.log('✅ Logout successful!');
})();
```

Run it:
```powershell
node logout.js
```

**Note:** Requires installing puppeteer first:
```powershell
npm install puppeteer
```

---

## Method 3: Clear All Browser Data (Terminal)

### Chrome/Edge (Windows)

```powershell
# Close all Chrome/Edge instances first
taskkill /F /IM chrome.exe
taskkill /F /IM msedge.exe

# Clear localStorage data for localhost
# Location: C:\Users\[YourUsername]\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb

# Or use PowerShell to delete localStorage:
Remove-Item "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Local Storage\leveldb\*" -Recurse -Force -ErrorAction SilentlyContinue
```

**Warning:** This clears ALL localStorage for Chrome, not just your app!

---

## Method 4: Using Browser Developer Tools (Automated)

### Create a Bookmarklet

Create a bookmark in your browser with this JavaScript:

```javascript
javascript:(function(){localStorage.removeItem('token');localStorage.removeItem('user');window.location.reload();})();
```

Then just click the bookmark to logout.

---

## Method 5: Direct API Call (Terminal)

You can also call the logout API endpoint directly:

### Using cURL (PowerShell)

```powershell
# Make sure you're logged in first (have a valid token)
# Get your token from browser console:
# localStorage.getItem('token')

$token = "your-token-here"
curl.exe -X GET "http://localhost:8000/api/v1/user/logout" -H "Authorization: Bearer $token" -H "Cookie: token=$token"
```

This will clear server-side cookies, but you still need to clear localStorage on the client.

---

## Method 6: Quick PowerShell Script

Create `logout.ps1`:

```powershell
# Logout script for Sociogram
Write-Host "🔐 Logging out from Sociogram..." -ForegroundColor Cyan

# Open browser and inject logout script
$logoutScript = @"
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.reload();
"@

# Open Chrome DevTools and execute (requires manual step)
Write-Host "📋 Copy this script to browser console (F12):" -ForegroundColor Yellow
Write-Host $logoutScript -ForegroundColor White
Write-Host ""
Write-Host "✅ Or open: http://localhost:5000 and press F12, then paste above script" -ForegroundColor Green
```

Run it:
```powershell
.\logout.ps1
```

---

## 🎯 RECOMMENDED: Easiest Method

**The simplest way is using Browser Console:**

1. **Open your app** in browser: `http://localhost:5000`
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Paste this command:**

```javascript
localStorage.clear(); window.location.reload();
```

**⚠️ Note:** Make sure to type `window` correctly (not `wimdow` or `wimdow`)!

5. **Press Enter**

Done! You're logged out.

---

## 🔍 Verify Logout

After logging out, check:

```javascript
// In browser console (F12)
console.log('Token:', localStorage.getItem('token'));  // Should be null
console.log('User:', localStorage.getItem('user'));    // Should be null
```

If both are `null`, you're successfully logged out!

---

## 📝 Notes

- **localStorage is per-browser**: Each browser (Chrome, Firefox, Edge) has separate localStorage
- **localStorage is per-domain**: `localhost:5000` and `localhost:8000` have separate storage
- **Clearing all browser data**: This will logout but also clear everything else
- **Server-side logout**: The backend logout endpoint clears cookies, but localStorage is client-side only

---

## 🆘 Troubleshooting

**If you still see user data after logout:**
1. Make sure you cleared `token` AND `user` from localStorage
2. Check if you're using multiple browser profiles
3. Try clearing all browser data for localhost
4. Hard refresh: `Ctrl+Shift+R` or `Ctrl+F5`

**If you can't access the app:**
- Clear all cookies and localStorage for `localhost`
- Or use incognito/private browsing mode

