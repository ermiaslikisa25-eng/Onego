import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function createRecaptcha(containerId: string) {
  return new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
}

export async function requestOtp(phone: string, verifier: RecaptchaVerifier) {
  return signInWithPhoneNumber(auth, phone, verifier);
}
