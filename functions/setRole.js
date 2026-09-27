// Run on a trusted machine ONLY. Never upload this file to public repos or browsers.
// Install Firebase Admin SDK: npm install firebase-admin
// Set GOOGLE_APPLICATION_CREDENTIALS to your service-account JSON path
// Usage: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node functions/setRole.js +2519XXXXXXXX driver

import admin from 'firebase-admin';

admin.initializeApp();

const [phone, role] = process.argv.slice(2);

if (!phone || !['customer', 'driver', 'supervisor', 'admin'].includes(role)) {
  console.error('Usage: node setRole.js +2519XXXXXXXX customer|driver|supervisor|admin');
  process.exit(1);
}

try {
  const user = await admin.auth().getUserByPhoneNumber(phone);
  await admin.auth().setCustomUserClaims(user.uid, { role });
  console.log(`✓ Set ${role} role for ${phone} (${user.uid})`);
  console.log('→ User must sign out and sign in again to refresh the ID token.');
} catch (error: any) {
  console.error('Error:', error.message);
  process.exit(1);
}
