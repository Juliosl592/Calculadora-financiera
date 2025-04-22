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

        alert('Firebase está configurado correctamente. Revisa la consola para más detalles.');
    } catch (error) {
        console.error('Error al probar la configuración de Firebase:', error);
        alert('Hubo un error al probar la configuración de Firebase. Revisa la consola para más detalles.');
    }
}

// Llamar a la función de prueba al cargar la aplicación
window.addEventListener('load', testFirebaseConfiguration);

export { auth, db };