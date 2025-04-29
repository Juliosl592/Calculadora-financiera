import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyArW5yBMgBS920Q8nNkxk9hk1wnhoqSL6Y",
    authDomain: "calculadora-financiera-d8282.firebaseapp.com",
    projectId: "calculadora-financiera-d8282",
    storageBucket: "calculadora-financiera-d8282.appspot.com",
    messagingSenderId: "177168332596",
    appId: "1:177168332596:web:0d93e2ef62ec63b7d61761",
    measurementId: "G-2QNQX2GY78"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Crear documentos en la colección `users`
async function createUserInFirestore(uid, email, role) {
    try {
        await setDoc(doc(db, "users", uid), {
            email,
            role,
            blocked: false
        });
        console.log(`Usuario con UID ${uid} creado exitosamente en Firestore.`);
    } catch (error) {
        console.error("Error al crear el usuario en Firestore:", error);
    }
}

// Agregar usuarios manualmente
(async () => {
    await createUserInFirestore("UID_DEL_ADMIN", "admin@cymait.com", "admin"); // Reemplaza UID_DEL_ADMIN con el UID real
    await createUserInFirestore("UID_DEL_USUARIO", "user@cymait.com", "user"); // Reemplaza UID_DEL_USUARIO con el UID real
})();
