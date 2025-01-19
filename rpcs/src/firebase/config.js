import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCYyCWdIq4RBJpImGBu7pIIKdqhQo6BfwQ",
    authDomain: "rpcsbysudhesh.firebaseapp.com",
    projectId: "rpcsbysudhesh",
    storageBucket: "rpcsbysudhesh.firebasestorage.app",
    messagingSenderId: "87431797804",
    appId: "1:87431797804:web:4bf74b99e17a799bcac589",
    measurementId: "G-FGXJ7NHT9D"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);