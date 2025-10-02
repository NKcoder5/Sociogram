# 🔥 Firebase Setup Guide for Sociogram

This guide will help you set up Firebase for your Sociogram project with Authentication, Firestore, and Storage.

## 📋 Prerequisites

1. Google account
2. Node.js and npm installed
3. Sociogram project cloned and dependencies installed

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `sociogram-[your-name]` (e.g., `sociogram-john`)
4. Enable Google Analytics (optional but recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

## 🔧 Step 2: Configure Firebase Services

### Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add your project email
3. Click "Save"

### Set up Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Done"

### Enable Storage
1. Go to **Storage**
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as Firestore
5. Click "Done"

## 🔑 Step 3: Get Configuration Keys

### Frontend Configuration
1. In Firebase Console, click the gear icon ⚙️ > **Project settings**
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Enter app nickname: `Sociogram Frontend`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the configuration object

### Backend Service Account
1. Go to **Project settings** > **Service accounts**
2. Click "Generate new private key"
3. Save the JSON file securely (don't commit to git!)
4. Note the file path for environment variables

## 📝 Step 4: Configure Environment Variables

### Frontend (.env)
Create or update `frontend/.env`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Backend (.env)
Create or update `backend/.env`:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# Method 1: Service Account File (Development)
FIREBASE_SERVICE_ACCOUNT_PATH=../path/to/serviceAccountKey.json

# Method 2: Environment Variables (Production)
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
```

## 🔐 Step 5: Security Rules

### Firestore Rules
Go to **Firestore Database** > **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts are readable by authenticated users
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Stories are readable by authenticated users
    match /stories/{storyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

### Storage Rules
Go to **Storage** > **Rules** and update:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folders
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /posts/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /stories/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Step 6: Test Firebase Integration

### Test Frontend
1. Start your frontend: `npm run dev`
2. Open browser console
3. Look for Firebase initialization logs
4. Try authentication features

### Test Backend
1. Start your backend: `npm run dev`
2. Check console for Firebase Admin initialization
3. Test API endpoints that use Firebase

## 📚 Usage Examples

### Frontend Authentication
```javascript
import { signInWithEmail, signUpWithEmail } from './services/firebase/auth';

// Sign up
const result = await signUpWithEmail(email, password, displayName);
if (result.success) {
  console.log('User created:', result.user);
}

// Sign in
const result = await signInWithEmail(email, password);
if (result.success) {
  console.log('User signed in:', result.user);
}
```

### Frontend Storage
```javascript
import { uploadProfilePicture } from './services/firebase/storage';

const result = await uploadProfilePicture(file, userId, (progress) => {
  console.log('Upload progress:', progress + '%');
});

if (result.success) {
  console.log('File uploaded:', result.url);
}
```

### Backend Admin SDK
```javascript
import { initializeFirebaseAdmin, getFirebaseAuth } from './config/firebase-admin';

// Initialize Firebase Admin
await initializeFirebaseAdmin();

// Verify ID token
const auth = getFirebaseAuth();
const decodedToken = await auth.verifyIdToken(idToken);
console.log('User ID:', decodedToken.uid);
```

## 🚨 Security Best Practices

1. **Never commit service account keys** to version control
2. **Use environment variables** for all sensitive data
3. **Set up proper Firestore and Storage rules**
4. **Enable App Check** for production (optional but recommended)
5. **Monitor usage** in Firebase Console
6. **Set up billing alerts** to avoid unexpected charges

## 🔧 Troubleshooting

### Common Issues

1. **"Firebase not initialized"**
   - Check environment variables are loaded
   - Verify Firebase config is correct

2. **"Permission denied"**
   - Check Firestore/Storage rules
   - Verify user is authenticated

3. **"Service account error"**
   - Check service account key file path
   - Verify environment variables format

4. **"CORS errors"**
   - Add your domain to Firebase authorized domains
   - Check Firebase project settings

### Debug Mode
Enable debug logging:

```javascript
// Frontend
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

if (import.meta.env.DEV) {
  // Connect to emulators in development
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 📞 Support

If you encounter issues:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [Firebase Console](https://console.firebase.google.com/) for errors
3. Check browser/server console logs
4. Verify all environment variables are set correctly

## 🎉 Next Steps

After Firebase is set up:
1. Integrate Firebase Auth with your existing auth system
2. Migrate file uploads to Firebase Storage
3. Use Firestore for real-time features
4. Set up Firebase Analytics for user insights
5. Consider Firebase Cloud Functions for advanced features
