import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyArW5yBMgBS920Q8nNkxk9hk1wnhoqSL6Y",
  authDomain: "calculadora-financiera-d8282.firebaseapp.com",
  projectId: "calculadora-financiera-d8282",
  storageBucket: "calculadora-financiera-d8282.appspot.com", // Corregido
  messagingSenderId: "177168332596",
  appId: "1:177168332596:web:0d93e2ef62ec63b7d61761",
  measurementId: "G-2QNQX2GY78"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Función para crear un usuario
async function createUser(email, password, role) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar el usuario en Firestore con su rol
        await setDoc(doc(db, "users", user.uid), {
            email,
            role,
            blocked: false
        });

        console.log(`Usuario ${role} creado exitosamente: ${email}`);
    } catch (error) {
        console.error(`Error al crear el usuario ${role}:`, error);
    }
}

// Crear un usuario administrador y un usuario no administrador
(async () => {
    try {
        await createUser("admin@cymait.com", "Admin123!", "admin"); // Usuario administrador
        await createUser("user@cymait.com", "User123!", "user");   // Usuario no administrador
        console.log("Usuarios creados exitosamente.");
    } catch (error) {
        console.error("Error al crear los usuarios:", error);
    }
})();
