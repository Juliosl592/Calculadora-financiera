// Eliminamos las importaciones de módulos ES6
// Asegúrate de incluir jsPDF y jsPDF-autotable en el archivo HTML como scripts

// pdf-export.js

// Función para obtener el consecutivo almacenado o iniciar en 1
function getConsecutivo(fechaClave) {
    let data = JSON.parse(localStorage.getItem('cotizaciones')) || {};
    if (!data[fechaClave]) {
        data[fechaClave] = 1;
    } else {
        data[fechaClave]++;
    }
    localStorage.setItem('cotizaciones', JSON.stringify(data));
    return data[fechaClave];
}

// Cambiar el ID del botón que escucha el evento al correcto

document.getElementById('export').addEventListener('click', () => {
    // Validar que jsPDF esté correctamente cargado
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        alert('jsPDF no está cargado. Asegúrate de incluir la biblioteca.');
        return;
    }

    const jsPDF = window.jspdf.jsPDF; // Acceso directo a jsPDF
    const doc = new jsPDF();

    // Validar que el logo esté disponible
    const img = new Image();
    img.src = './Logo Cyma IT.png'; // Ruta relativa al archivo HTML

    img.onload = function () {
        console.log('La imagen se cargó correctamente.');
        doc.addImage(img, 'PNG', 10, 5, 30, 30);

        const today = new Date();
        const yearMonth = today.getFullYear().toString() + (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const consecutivo = getConsecutivo(yearMonth + day);
        const cotizacionID = `COT: ${yearMonth}-${day}-${consecutivo}`;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen de Cotización', 105, 20, null, null, 'center');

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(10, 35, 200, 35);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Validar y obtener los valores del DOM
        const licenses = document.getElementById('licenses')?.value || 'N/A';
        const precioUnitario = document.getElementById('precio-unitario')?.value || 'N/A';
        const hoursPackageText = document.getElementById('hoursPackage')?.options[document.getElementById('hoursPackage').selectedIndex]?.text || 'N/A';
        const paymentPlanLicenses = document.getElementById('paymentPlanLicenses')?.options[document.getElementById('paymentPlanLicenses').selectedIndex]?.text || 'N/A';
        const paymentPlanHours = document.getElementById('paymentPlanHours')?.options[document.getElementById('paymentPlanHours').selectedIndex]?.text || 'N/A';
        const result = document.getElementById('result')?.innerText || 'No se ha calculado ningún resultado.';

        // Tabla
        const rows = [
            ['REFERENCIA', cotizacionID],
            ['Licencias a comprar', `${licenses} Unds.`],
            ['Valor unitario licencias', `$${precioUnitario} USD`],
            ['Modalidad de pago (Licencias)', paymentPlanLicenses],
            ['Implementación', hoursPackageText],
            ['Modalidad de pago (Implementación)', paymentPlanHours],
            ['Detalle', result]
        ];

        let y = 45;
        rows.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}:`, 20, y); // Ajustar la posición de la etiqueta
            doc.setFont('helvetica', 'normal');
            doc.text(value, 90, y); // Ajustar la posición del valor para evitar superposición
            y += 10;
        });

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        doc.text('JUNIOR CALVO SAAD', 105, 270, null, null, 'center');
        doc.text('Gerente de Ingeniería | junior.calvo@cyma-it.com | Cel: +57 3176486480', 105, 276, null, null, 'center');

        doc.save('calculadora-financiera.pdf');
    };

    img.onerror = function () {
        alert('No se pudo cargar la imagen. Verifica la ruta.');
    };
});

// Eliminar las declaraciones de importación y usar las bibliotecas globales

function exportResultToPDF() {
    const doc = new jsPDF();

    // Configurar el título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("Detalle de Resultados", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    // Obtener los datos de la tabla
    const tableData = [
        { concepto: "Licencias", modalidad: "Contado", valor: "$6,250,000.00", cuota: "-" },
        { concepto: "Bolsa 80h", modalidad: "12 meses", valor: "$1,529,728.53", cuota: "$127,477.38" },
    ];

    // Configurar la tabla con líneas visibles y diseño profesional
    doc.autoTable({
        head: [["Concepto", "Modalidad", "Valor", "Cuota mensual"]],
        body: tableData.map(row => [row.concepto, row.modalidad, row.valor, row.cuota]),
        startY: 30,
        styles: {
            halign: "center", // Alinear el texto al centro
            valign: "middle", // Centrar verticalmente el texto
            fontSize: 10,
            cellPadding: 5,
            lineWidth: 0.5, // Grosor de las líneas
            lineColor: [0, 0, 0], // Color de las líneas
        },
        headStyles: {
            fillColor: [0, 51, 102], // Color de fondo azul oscuro
            textColor: [255, 255, 255], // Texto blanco
            fontStyle: "bold",
        },
        bodyStyles: {
            fillColor: [255, 255, 255], // Fondo blanco para las filas
            textColor: [0, 0, 0], // Texto negro
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240], // Fondo gris claro para filas alternas
        },
        foot: [["", "", "Total", "$7,779,728.53"]],
        footStyles: {
            fillColor: [200, 200, 200], // Color de fondo gris
            fontStyle: "bold",
        },
        tableLineColor: [0, 0, 0], // Color de las líneas de la tabla
        tableLineWidth: 0.5, // Grosor de las líneas de la tabla
    });

    // Guardar el PDF
    doc.save("resultados.pdf");
}

// Exponer la función globalmente
window.exportResultToPDF = exportResultToPDF;