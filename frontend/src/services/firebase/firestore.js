import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Create a document
export const createDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      id: docId,
      message: 'Document created successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to create document'
    };
  }
};

// Add a document (auto-generated ID)
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      id: docRef.id,
      message: 'Document added successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to add document'
    };
  }
};

// Get a document
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() }
      };
    } else {
      return {
        success: false,
        message: 'Document not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to get document'
    };
  }
};

// Update a document
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Document updated successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to update document'
    };
  }
};

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    return {
      success: true,
      message: 'Document deleted successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to delete document'
    };
  }
};

// Get all documents in a collection
export const getCollection = async (collectionName, queryOptions = {}) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply query options
    if (queryOptions.where) {
      queryOptions.where.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    
    if (queryOptions.orderBy) {
      q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
    }
    
    if (queryOptions.limit) {
      q = query(q, limit(queryOptions.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: documents
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to get collection'
    };
  }
};

// Listen to real-time updates
export const subscribeToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({
        success: true,
        data: { id: doc.id, ...doc.data() }
      });
    } else {
      callback({
        success: false,
        message: 'Document not found'
      });
    }
  }, (error) => {
    callback({
      success: false,
      error: error.code,
      message: 'Failed to listen to document'
    });
  });
};

// Listen to collection updates
export const subscribeToCollection = (collectionName, callback, queryOptions = {}) => {
  let q = collection(db, collectionName);
  
  // Apply query options
  if (queryOptions.where) {
    queryOptions.where.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
  }
  
  if (queryOptions.orderBy) {
    q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
  }
  
  if (queryOptions.limit) {
    q = query(q, limit(queryOptions.limit));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    callback({
      success: true,
      data: documents
    });
  }, (error) => {
    callback({
      success: false,
      error: error.code,
      message: 'Failed to listen to collection'
    });
  });
};
