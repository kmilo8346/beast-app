import * as firebase from 'firebase';
import 'firebase/firestore';

// Optionally import the services that you want to use
// import "firebase/auth";
// import "firebase/database";
// import "firebase/firestore";
// import "firebase/functions";
// import "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDUmU112WbvWZzsN77zIVVZAkhS6VFRPvM',
  authDomain: 'ardent-curve-281516.firebaseapp.com',
  databaseURL: 'https://ardent-curve-281516.firebaseio.com',
  projectId: 'ardent-curve-281516',
  storageBucket: 'ardent-curve-281516.appspot.com',
  messagingSenderId: '7074171791',
  appId: '1:7074171791:web:b7a48df15a312d5e7699fa',
  measurementId: 'G-6MMCQPDTRD',
};

firebase.initializeApp(firebaseConfig);

export default firebase;
