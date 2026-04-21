const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let initialized = false;

const initFirebaseAdmin = () => {
  if (initialized) {
    return;
  }

  let serviceAccount;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountPath) {
    const resolvedPath = path.resolve(serviceAccountPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Firebase service account file not found: ${resolvedPath}`);
    }

    serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  } else if (serviceAccountJson) {
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (_error) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY must be a valid JSON string.');
    }
  } else {
    throw new Error('Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY.');
  }

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
};

const verifyFirebaseIdToken = async (idToken) => {
  initFirebaseAdmin();
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseIdToken };
