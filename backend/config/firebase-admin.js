import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp = null;

export const initializeFirebaseAdmin = async () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Method 1: Using service account key file (recommended for development)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath) {
      const fs = await import('fs');
      const serviceAccount = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, serviceAccountPath), 'utf8')
      );
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "sociogram-6fbe7",
        storageBucket: "sociogram-6fbe7.firebasestorage.app"
      });
    } 
    // Method 2: Using environment variables (recommended for production)
    else if (process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        type: "service_account",
        project_id: "sociogram-6fbe7",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "sociogram-6fbe7",
        storageBucket: "sociogram-6fbe7.firebasestorage.app"
      });
    }
    // Method 3: Default credentials (for Google Cloud environments)
    else {
      firebaseApp = admin.initializeApp({
        projectId: "sociogram-6fbe7",
        storageBucket: "sociogram-6fbe7.firebasestorage.app"
      });
    }

    console.log('✅ Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
};

// Export Firebase Admin services
export const getFirebaseAuth = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
};

export const getFirebaseFirestore = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
};

export const getFirebaseStorage = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.storage();
};

export default firebaseApp;
