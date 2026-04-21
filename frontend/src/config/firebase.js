import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC5sxNWeJi8aubBfuv5YEzERm2FJGQJPyw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'digitalmilkbook.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'digitalmilkbook',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'digitalmilkbook.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '582863202324',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:582863202324:web:1cbcb8b33156883f081f01',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-85RS3XT07P',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let analytics = null;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => {
    analytics = null;
  });

export { app, auth, googleProvider, analytics };
