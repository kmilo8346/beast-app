import * as firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import Constants from 'expo-constants';

// Initialize Firebase
const firebaseConfig = {
  apiKey: Constants.manifest.extra.API_KEY,
  authDomain: Constants.manifest.extra.AUTH_DOMAIN,
  databaseURL: Constants.manifest.extra.DATABASE_URL,
  projectId: Constants.manifest.extra.PROJECT_ID,
  storageBucket: Constants.manifest.extra.STORAGE_BUCKET,
  messagingSenderId: Constants.manifest.extra.MESSAGING_SENDER_ID,
  appId: Constants.manifest.extra.APP_ID,
  measurementId: Constants.manifest.extra.MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);

// const db = firebase.firestore();
// db.settings({
//   host: 'localhost:8080',
//   ssl: false,
// });

export default firebase;
