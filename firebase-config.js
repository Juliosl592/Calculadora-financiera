import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyArW5yBMgBS920Q8nNkxk9hk1wnhoqSL6Y",
    authDomain: "calculadora-financiera-d8282.firebaseapp.com",
    projectId: "calculadora-financiera-d8282",
    storageBucket: "calculadora-financiera-d8282.appspot.com",
    messagingSenderId: "177168332596",
    appId: "1:177168332596:web:0d93e2ef62ec63b7d61761",
    measurementId: "G-2QNQX2GY78"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };