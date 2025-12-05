const ticketDiv = document.getElementById("ticket");
const carrito = JSON.parse(localStorage.getItem("ticket")) || [];
const clienteData = JSON.parse(localStorage.getItem("cliente") || "{}");
const nombreCliente = clienteData.nombre || "Cliente";

let total = 0;
let html = `<p>Cliente: <strong>${nombreCliente}</strong></p><ul>`;

carrito.forEach(p => {
  html += `<li>${p.titulo || p.nombre} x${p.cantidad} = $${p.precio * p.cantidad}</li>`;
  total += p.precio * p.cantidad;
});

html += `</ul><h3>Total: $${total}</h3>`;
ticketDiv.innerHTML = html;

// Función para imprimir el ticket en PDF usando jsPDF
function imprimirTicket() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let idProductos = [];
  
  // Definimos el tamaño de la fuente para el título
  doc.setFontSize(18);
  
  // Escribimos el título del ticket
  doc.text("Ticket de compra - Autoservicio", 10, 10);
  
  // Aumentamos el espacio después del título
  let y = 20;
  
  // Reducimos el tamaño de fuente para los productos
  doc.setFontSize(12);
  
  // Iteramos el carrito e imprimimos nombre y precio
  carrito.forEach(prod => {
    idProductos.push(prod.id); // Llenamos el array de ids
    doc.text(`${prod.titulo || prod.nombre} / $${prod.precio}`, 20, y);
    // La posición vertical se incrementa en 7 puntos
    y += 7;
  });
  
  // Calcular el total del ticket usando reduce
  const precioTotal = carrito.reduce((total, prod) => total + parseInt(prod.precio), 0);
  
  // Añadimos espacio vertical de 5px
  y += 5;
  
  // Escribimos el total del ticket en el PDF
  doc.text(`Total $${precioTotal}`, 10, y);
  
  // Guardamos el PDF
  doc.save("ticket.pdf");
}

document.getElementById('btn-pdf')?.addEventListener('click', imprimirTicket);

function volverInicio() {
  // Solo borrar datos de compra, NO el tema
  localStorage.removeItem("ticket");
  localStorage.removeItem("cliente");
  localStorage.removeItem("carrito");
  window.location.href = "index.html";
}
