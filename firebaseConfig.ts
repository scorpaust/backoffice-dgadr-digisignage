// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Get a non-default Storage bucket

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBI_6oXpJD6JGUs1uF_3gfEUlRKuhb3zeY",

  authDomain: "dgadr-digisignage-app.firebaseapp.com",

  databaseURL:
    "https://dgadr-digisignage-app-default-rtdb.europe-west1.firebasedatabase.app",

  projectId: "dgadr-digisignage-app",

  storageBucket: "dgadr-digisignage-app.appspot.com",

  messagingSenderId: "722329748271",

  appId: "1:722329748271:web:ec9471a218242e00f917da",
};

// Initialize Firebase

const firebase = initializeApp(firebaseConfig);

const db = getDatabase();

const auth = getAuth(firebase);

export { firebase, db, auth, signInWithEmailAndPassword, firebaseConfig };
