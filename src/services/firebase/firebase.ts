// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAPo5Cw6ZKB03wbp5ZaydmLl-x-eUMPubA',
	authDomain: 'vthacks11-7339c.firebaseapp.com',
	projectId: 'vthacks11-7339c',
	storageBucket: 'vthacks11-7339c.appspot.com',
	messagingSenderId: '742889599157',
	appId: '1:742889599157:web:bf9d07ab336f119c910efc',
	measurementId: 'G-7CNPTWWFK0'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
