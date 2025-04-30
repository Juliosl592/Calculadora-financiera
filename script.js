// Importar auth y db desde firebase-config.js
import { auth, db } from './firebase-config.js';
import { collection, getDocs, updateDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Validar que los elementos existan antes de agregar eventos
const calculateButton = document.getElementById('calculate');
if (calculateButton) {
    calculateButton.addEventListener('click', () => {
        // Obtener los valores ingresados por el usuario
        const licenses = parseInt(document.getElementById('licenses').value, 10);
        const precioUnitario = parseFloat(document.getElementById('precio-unitario').value);

        // Extraer el texto de la opción seleccionada para la bolsa de horas
        const hoursPackageText = document.getElementById('hoursPackage').options[document.getElementById('hoursPackage').selectedIndex].text;
        const hoursPackageValue = parseInt(document.getElementById('hoursPackage').value, 10); // Obtener el valor base de la bolsa de horas
        const isFullImplementation = hoursPackageText.toLowerCase().includes("implementación completa"); // Verificar si es "Implementación completa"
        const hoursPackage = isFullImplementation ? "Implementación completa" : `${parseInt(hoursPackageText.match(/\d+/)?.[0] || '0', 10)} horas`; // Mostrar texto dinámico

        const paymentPlanLicenses = parseInt(document.getElementById('paymentPlanLicenses').value, 10);
        const paymentPlanHours = parseInt(document.getElementById('paymentPlanHours').value, 10);

        // Validar los valores ingresados
        if (isNaN(licenses) || isNaN(precioUnitario)) {
            // Función para mostrar mensajes de advertencia en un recuadro moderno
            function showWarning(message) {
                // Crear el contenedor del recuadro si no existe
                let warningBox = document.getElementById('warning-box');
                if (!warningBox) {
                    warningBox = document.createElement('div');
                    warningBox.id = 'warning-box';
                    warningBox.className = 'warning-box';
                    document.body.appendChild(warningBox);
                }

                // Configurar el contenido del recuadro
                warningBox.innerHTML = `
                    <h2>Advertencia</h2>
                    <p>${message}</p>
                    <button id="close-warning">Aceptar</button>
                `;

                // Mostrar el recuadro
                warningBox.style.display = 'block';

                // Manejar el cierre del recuadro
                const closeButton = document.getElementById('close-warning');
                closeButton.addEventListener('click', () => {
                    warningBox.style.display = 'none';
                });
            }

            showWarning('Por favor, ingresa valores válidos para las licencias y el precio unitario.');
            return;
        }

        // Calcular el costo total de las licencias
        let totalLicensesCost = licenses * precioUnitario;
        let financedLicensesCost = 0;
        let licensesPaymentType = "De contado";

        // Aplicar el interés según el plan de pago de licencias
        if (paymentPlanLicenses > 0) {
            const interestLicenses = totalLicensesCost * (paymentPlanLicenses / 100);
            financedLicensesCost = totalLicensesCost + interestLicenses;
            licensesPaymentType = `Financiado a ${paymentPlanLicenses} meses`;
        }

        // Calcular el costo total de la bolsa de horas
        let totalHoursCost = hoursPackageValue;
        let financedHoursCost = 0;
        let hoursPaymentType = "De contado";

        // Aplicar el interés según el plan de pago de bolsas
        if (paymentPlanHours > 0) {
            const interestHours = totalHoursCost * (paymentPlanHours / 100);
            financedHoursCost = totalHoursCost + interestHours;
            hoursPaymentType = `Financiado a ${paymentPlanHours} meses`;
        }

        // Calcular la cuota mensual para licencias y bolsas de horas
        const licensesMonthlyPayment = paymentPlanLicenses > 0 ? financedLicensesCost / paymentPlanLicenses : 0;
        const hoursMonthlyPayment = paymentPlanHours > 0 ? financedHoursCost / paymentPlanHours : 0;

        // Calcular el costo total general
        const totalCost = (paymentPlanLicenses === 0 ? totalLicensesCost : financedLicensesCost) +
                          (paymentPlanHours === 0 ? totalHoursCost : financedHoursCost);

        // Calcular la cuota mensual total si ambos conceptos están financiados
        const totalMonthlyPayment = licensesMonthlyPayment + hoursMonthlyPayment;

        // Formatear los valores con separador de miles y decimales
        const formatCurrency = (value) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Mostrar el resultado en el elemento con ID "result"
        const resultDiv = document.getElementById('result');
        resultDiv.innerText = `
            Licencias a comprar: ${licenses}
            Valor Licencias: $${formatCurrency(paymentPlanLicenses === 0 ? totalLicensesCost : financedLicensesCost)} USD
            Modalidad de Pago: ${licensesPaymentType}
            ${licensesMonthlyPayment > 0 ? `Cuota Mensual Licencias: $${formatCurrency(licensesMonthlyPayment)} USD` : ''}

            Implementación: ${hoursPackage}
            Modalidad de Pago: ${hoursPaymentType}
            Valor Bolsa de Horas: $${formatCurrency(paymentPlanHours === 0 ? totalHoursCost : financedHoursCost)} USD
            ${hoursMonthlyPayment > 0 ? `Cuota Mensual Bolsa de Horas: $${formatCurrency(hoursMonthlyPayment)} USD` : ''}

            Valor Total: $${formatCurrency(totalCost)} USD
            ${totalMonthlyPayment > 0 ? `Cuota Mensual Total: $${formatCurrency(totalMonthlyPayment)} USD` : ''}
            
        `;
        // Mostrar el resultado y desplazar la vista
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });

        // Crear objeto de cotización
        const cotizacion = {
            licenses,
            totalLicensesCost: paymentPlanLicenses === 0 ? totalLicensesCost : financedLicensesCost,
            licensesPaymentType,
            hoursPackage,
            totalHoursCost: paymentPlanHours === 0 ? totalHoursCost : financedHoursCost,
            hoursPaymentType,
            totalCost,
            monthlyPayment: totalMonthlyPayment
        };

        // Guardar la cotización en Firestore
        saveCotizacion(cotizacion);
    });
} else {
    console.warn('El botón con ID "calculate" no existe en el DOM.');
}

const clearButton = document.getElementById('clear-form');
if (clearButton) {
    clearButton.addEventListener('click', () => {
        // Restablecer el formulario
        document.getElementById('calc-form').reset();

        // Limpiar el contenido del elemento "result"
        const resultDiv = document.getElementById('result');
        resultDiv.innerText = '';
        resultDiv.style.display = 'none';
    });
} else {
    console.warn('El botón con ID "clear-form" no existe en el DOM.');
}

// Función para mostrar mensajes de notificación en un recuadro moderno
function showNotification(message, type = 'success') {
    // Crear el contenedor del recuadro si no existe
    let notificationBox = document.getElementById('notification-box');
    if (!notificationBox) {
        notificationBox = document.createElement('div');
        notificationBox.id = 'notification-box';
        notificationBox.className = 'warning-box'; // Reutilizar el estilo de warning-box
        document.body.appendChild(notificationBox);
    }

    // Configurar el contenido del recuadro
    notificationBox.innerHTML = `
        <h2>${type === 'success' ? 'Éxito' : 'Notificación'}</h2>
        <p>${message}</p>
        <button id="close-notification">Aceptar</button>
    `;

    // Mostrar el recuadro
    //notificationBox.style.display = 'block';

    // Manejar el cierre del recuadro
    const closeButton = document.getElementById('close-notification');
    closeButton.addEventListener('click', () => {
        notificationBox.style.display = 'none';
    });
}

// Configuración del botón de cierre de sesión
export function configureLogoutButton() {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await auth.signOut();
                showNotification('Has cerrado sesión exitosamente.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html'; // Redirigir al inicio de sesión
                }, 1000); // Esperar 1 segundos antes de redirigir
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                showNotification('Hubo un error al cerrar sesión. Por favor, inténtalo de nuevo.', 'error');
            }
        });
    }
}

// Configuración del botón de atrás
const backButton = document.getElementById('back');
if (backButton) {
    backButton.addEventListener('click', () => {
        window.history.back(); // Regresar a la página anterior
    });
}

onAuthStateChanged(auth, (user) => { 
    if (!user) {
        window.location.href = 'login.html'; // Redirigir al inicio de sesión si no está autenticado
    } else {
        // Verificar si el usuario es administrador
        const isAdmin = user.email === 'admin@cymait.com'; // Cambia esta lógica según tu implementación
        if (!isAdmin && backButton) {
            backButton.style.display = 'none'; // Ocultar el botón de regresar para usuarios no administradores
        }
    }
});

// Función para guardar cotización en Firestore con mejor manejo de errores
async function saveCotizacion(cotizacion) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Debes iniciar sesión para guardar una cotización.');
            return;
        }

        // Intentar guardar la cotización en Firestore
        await addDoc(collection(db, 'cotizaciones'), {
            ...cotizacion,
            userId: user.uid,
            username: user.email,
            date: new Date().toISOString()
        });

        // alert('Cotización guardada exitosamente.');
    } catch (error) {
        if (error.code === 'permission-denied') {
            alert('No tienes permisos para guardar cotizaciones. Verifica las reglas de Firestore.');
        } else {
            console.error('Error al guardar la cotización:', error);
            alert('Hubo un error al guardar la cotización. Por favor, inténtalo de nuevo.');
        }
    }
}

// Asegúrate de que loadConfigurations se ejecuta
async function loadConfigurations() {
    try {
        console.log("Ejecutando loadConfigurations...");
        // Aquí iría la lógica de carga de configuraciones
        // Por ejemplo, cargar datos de Firebase
        const financingTermsSnapshot = await getDocs(collection(db, 'financingterms'));
        console.log("Términos de financiamiento obtenidos:", financingTermsSnapshot.docs.map(doc => doc.data()));

        const hourPackagesSnapshot = await getDocs(collection(db, 'hourpackages'));
        console.log("Bolsas de horas obtenidas:", hourPackagesSnapshot.docs.map(doc => doc.data()));
    } catch (error) {
        console.error("Error al ejecutar loadConfigurations:", error);
    }
}

// Llamar a loadConfigurations al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: Llamando a loadConfigurations...");
    loadConfigurations();
});