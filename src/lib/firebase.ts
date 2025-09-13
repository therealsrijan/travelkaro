// Complete mock Firebase implementation for development
// This avoids all Firebase compatibility issues

let currentUser: any = null;
let authStateCallbacks: any[] = [];

export const auth = {
  get currentUser() {
    return currentUser;
  },
  onAuthStateChanged: (callback: any) => {
    authStateCallbacks.push(callback);
    // Immediately call with current user
    callback(currentUser);
    return () => {
      const index = authStateCallbacks.indexOf(callback);
      if (index > -1) {
        authStateCallbacks.splice(index, 1);
      }
    };
  }
};

// Mock functions to simulate login/signup
export const mockSignIn = (email: string) => {
  currentUser = {
    uid: 'mock-uid-' + Date.now(),
    email: email,
    displayName: email.split('@')[0],
    photoURL: null
  };
  // Notify all callbacks
  authStateCallbacks.forEach(callback => callback(currentUser));
};

export const mockSignOut = () => {
  currentUser = null;
  // Notify all callbacks
  authStateCallbacks.forEach(callback => callback(null));
};

export const storage = {
  ref: (path: string) => ({
    put: (file: File) => Promise.resolve(),
    getDownloadURL: () => Promise.resolve('mock-url')
  })
};

// Mock Firebase types
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export type Auth = typeof auth;
export type FirebaseStorage = typeof storage;