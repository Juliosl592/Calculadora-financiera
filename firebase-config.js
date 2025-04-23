// Configuración de Firebase para la aplicación
const firebaseConfig = {
    apiKey: "AIzaSyArW5yBMgBS920Q8nNkxk9hk1wnhoqSL6Y",
    authDomain: "calculadora-financiera-d8282.firebaseapp.com",
    projectId: "calculadora-financiera-d8282",
    storageBucket: "calculadora-financiera-d8282.firebasestorage.app",
    messagingSenderId: "177168332596",
    appId: "1:177168332596:web:0d93e2ef62ec63b7d61761",
    measurementId: "G-2QNQX2GY78"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Instrucciones para agregar dominios autorizados en Firebase
//console.warn('Asegúrate de agregar los dominios 127.0.0.1 y localhost en la consola de Firebase: Authentication > Settings > Authorized domains.');

// Actualizar las reglas de Firestore para desarrollo
console.warn('Asegúrate de actualizar las reglas de Firestore en la consola de Firebase:');
console.warn(`
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
`);

// Exportar las funcionalidades necesarias
const auth = firebase.auth();
const db = firebase.firestore();

// Función de prueba para verificar Firestore y Authentication
async function testFirebaseConfiguration() {
    try {
        // Probar autenticación: obtener el usuario actual
        const user = auth.currentUser;
        console.log('Usuario autenticado:', user ? user.email : 'No hay usuario autenticado.');

        // Probar Firestore: escribir y leer un documento de prueba
        const testDocRef = db.collection('test').doc('configTest');
        await testDocRef.set({
            testField: 'Firebase configurado correctamente',
            timestamp: new Date().toISOString()
        });

        const testDoc = await testDocRef.get();
        if (testDoc.exists) {
            console.log('Documento de prueba leído correctamente:', testDoc.data());
        } else {
            console.error('No se encontró el documento de prueba.');
        }

       // alert('Firebase está configurado correctamente. Revisa la consola para más detalles.');
    } catch (error) {
        console.error('Error al probar la configuración de Firebase:', error);
        alert('Hubo un error al probar la configuración de Firebase. Revisa la consola para más detalles.');
    }
}

// Crear un usuario de prueba al cargar la aplicación
async function createTestUser() {
    try {
        const email = "pruebas@example.com";
        const password = "Pruebas123";

        // Verificar si el usuario ya existe
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("Usuario de prueba ya existe:", userCredential.user.email);
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            // Crear el usuario si no existe
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                console.log("Usuario de prueba creado exitosamente:", userCredential.user.email);
            } catch (createError) {
                console.error("Error al crear el usuario de prueba:", createError);
            }
        } else {
            console.error("Error al verificar el usuario de prueba:", error);
        }
    }
}

// Llamar a la función de prueba al cargar la aplicación
window.addEventListener('load', testFirebaseConfiguration);

// Llamar a la función para crear el usuario de prueba
createTestUser();

export { auth, db };