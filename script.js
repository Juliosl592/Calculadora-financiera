// Seleccionar el botón "Calcular"
const calculateButton = document.getElementById('calculate');

// Agregar un evento para manejar el clic en el botón "Calcular"
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
        alert('Por favor, ingresa valores válidos para las licencias y el precio unitario.');
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

// Seleccionar el botón "Borrar"
const clearButton = document.getElementById('clear-form');

// Agregar un evento para manejar el clic en el botón "Borrar"
clearButton.addEventListener('click', () => {
    // Restablecer el formulario
    document.getElementById('calc-form').reset();

    // Limpiar el contenido del elemento "result"
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = '';
    resultDiv.style.display = 'none';
    alert('El formulario ha sido borrado.');
});

// Función para cerrar sesión
document.getElementById('logout').addEventListener('click', async () => {
    try {
        await auth.signOut();
        alert('Has cerrado sesión exitosamente.');
        window.location.href = 'login.html'; // Redirigir al inicio de sesión
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Hubo un error al cerrar sesión. Por favor, inténtalo de nuevo.');
    }
});

// Función para guardar cotización en Firestore
async function saveCotizacion(cotizacion) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Debes iniciar sesión para guardar una cotización.');
            return;
        }

        await db.collection('cotizaciones').add({
            ...cotizacion,
            userId: user.uid,
            username: user.email,
            date: new Date().toISOString()
        });

        alert('Cotización guardada exitosamente.');
    } catch (error) {
        console.error('Error al guardar la cotización:', error);
        alert('Hubo un error al guardar la cotización. Por favor, inténtalo de nuevo.');
    }
}

// Función para cambiar la contraseña del usuario
async function changePassword() {
    const newPassword = prompt('Por favor, ingresa tu nueva contraseña:');

    if (!newPassword) {
        alert('La contraseña no puede estar vacía.');
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Debes iniciar sesión para cambiar tu contraseña.');
            return;
        }

        await user.updatePassword(newPassword);
        alert('Contraseña actualizada exitosamente.');
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        alert('Hubo un error al cambiar la contraseña. Por favor, inténtalo de nuevo.');
    }
}

// Agregar evento al botón de cambio de contraseña
document.getElementById('change-password').addEventListener('click', changePassword);