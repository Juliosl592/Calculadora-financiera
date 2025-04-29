import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Tipos
interface User {
    username: string;
    email: string;
    role: string;
    blocked: boolean;
}

interface Cotizacion {
    username: string;
    date: string;
    detail: string;
    total: number;
}

interface Configuracion {
    consecutivo: number;
    plazos: number[];
    tasas: number[];
    bolsas: number[];
    formasPago: string[];
}

// Función para cargar configuraciones iniciales
async function loadConfigurations(): Promise<void> {
    const configDoc = await getDoc(doc(db, "configurations", "settings"));
    if (configDoc.exists()) {
        const config = configDoc.data() as Configuracion;
        (document.getElementById("consecutivo") as HTMLInputElement).value = config.consecutivo.toString();
        updateList("plazos-list", config.plazos);
        updateList("tasas-list", config.tasas);
        updateList("bolsas-list", config.bolsas);
        updateList("formas-pago-list", config.formasPago);
    }
}

// Función para actualizar listas dinámicas
function updateList(listId: string, items: (number | string)[]): void {
    const list = document.getElementById(listId) as HTMLUListElement;
    list.innerHTML = "";
    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.toString();
        list.appendChild(li);
    });
}

// Función para calcular el costo de contado
function calcularContado(cantidad: number, precioUnitario: number): number {
    return cantidad * precioUnitario;
}

// Función para calcular el costo financiado
function calcularFinanciado(cantidad: number, precioUnitario: number, plazo: number, tasa: number): number {
    const total = cantidad * precioUnitario;
    const interes = total * (tasa / 100);
    return total + interes;
}

// Eventos para agregar configuraciones
async function addItem(listId: string, inputId: string, field: keyof Configuracion): Promise<void> {
    const value = (document.getElementById(inputId) as HTMLInputElement).value;
    if (!value) return;

    const configDoc = await getDoc(doc(db, "configurations", "settings"));
    const config = configDoc.exists() ? (configDoc.data() as Configuracion) : {} as Configuracion;
    let items = config[field] || []; // Asegurarse de que `items` sea un arreglo

    if (!Array.isArray(items)) {
        items = []; // Inicializar como un arreglo vacío si no lo es
    }

    // Chequeo de tipo basado en la clave `field`
    if (field === "formasPago") {
        (items as string[]).push(value); // Agregar como cadena
    } else {
        (items as number[]).push(parseFloat(value)); // Agregar como número
    }

    await setDoc(doc(db, "configurations", "settings"), { [field]: items }, { merge: true });
    updateList(listId, items);
    alert("Elemento agregado exitosamente.");
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    loadConfigurations();

    // Eventos para agregar configuraciones
    ["plazo", "tasa", "bolsa", "forma-pago"].forEach((id, index) => {
        const listId = ["plazos-list", "tasas-list", "bolsas-list", "formas-pago-list"][index];
        const field = ["plazos", "tasas", "bolsas", "formasPago"][index] as keyof Configuracion;
        document.getElementById(`add-${id}`)?.addEventListener("click", () => addItem(listId, id, field));
    });
});
