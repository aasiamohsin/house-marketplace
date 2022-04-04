// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAvRjXf42_M44rqnyZHd6OySkvv14UvnRo',
  authDomain: 'house-marketplace-app-fa632.firebaseapp.com',
  projectId: 'house-marketplace-app-fa632',
  storageBucket: 'house-marketplace-app-fa632.appspot.com',
  messagingSenderId: '806749542363',
  appId: '1:806749542363:web:de35bee8dafa39a870b9fe',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore();
