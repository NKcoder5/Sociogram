import { initializeFirebaseAdmin, getFirebaseAuth, getFirebaseFirestore } from './config/firebase-admin.js';

async function testFirebaseAdmin() {
  try {
    console.log('🔥 Testing Firebase Admin SDK...');
    
    // Initialize Firebase Admin
    await initializeFirebaseAdmin();
    console.log('✅ Firebase Admin initialized successfully');
    
    // Test Auth service
    const auth = getFirebaseAuth();
    console.log('✅ Firebase Auth service available');
    
    // Test Firestore service
    const firestore = getFirebaseFirestore();
    console.log('✅ Firebase Firestore service available');
    
    // Test creating a test document
    const testDoc = firestore.collection('test').doc('firebase-admin-test');
    await testDoc.set({
      message: 'Hello from Firebase Admin SDK!',
      timestamp: new Date(),
      source: 'backend-test'
    });
    console.log('✅ Test document created in Firestore');
    
    // Test reading the document
    const docSnapshot = await testDoc.get();
    if (docSnapshot.exists) {
      console.log('✅ Test document read successfully:', docSnapshot.data());
    }
    
    // Clean up - delete test document
    await testDoc.delete();
    console.log('✅ Test document cleaned up');
    
    console.log('🎉 All Firebase Admin tests passed!');
    
  } catch (error) {
    console.error('❌ Firebase Admin test failed:', error);
    
    if (error.code === 'app/invalid-credential') {
      console.log('💡 Tip: Make sure you have valid Firebase credentials configured');
    } else if (error.code === 'app/no-app') {
      console.log('💡 Tip: Firebase app not initialized properly');
    }
  }
}

// Run the test
testFirebaseAdmin().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
