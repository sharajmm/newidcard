// Firebase configuration - will be populated by build script
const firebaseConfig = {
  apiKey: window.ENV?.VITE_FIREBASE_API_KEY || "{{VITE_FIREBASE_API_KEY}}",
  authDomain:
    window.ENV?.VITE_FIREBASE_AUTH_DOMAIN || "{{VITE_FIREBASE_AUTH_DOMAIN}}",
  projectId:
    window.ENV?.VITE_FIREBASE_PROJECT_ID || "{{VITE_FIREBASE_PROJECT_ID}}",
  storageBucket:
    window.ENV?.VITE_FIREBASE_STORAGE_BUCKET ||
    "{{VITE_FIREBASE_STORAGE_BUCKET}}",
  messagingSenderId:
    window.ENV?.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "{{VITE_FIREBASE_MESSAGING_SENDER_ID}}",
  appId: window.ENV?.VITE_FIREBASE_APP_ID || "{{VITE_FIREBASE_APP_ID}}",
  measurementId:
    window.ENV?.VITE_FIREBASE_MEASUREMENT_ID ||
    "{{VITE_FIREBASE_MEASUREMENT_ID}}",
};

window.firebaseConfig = firebaseConfig;
