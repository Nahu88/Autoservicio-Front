const contenedorCarrito = document.getElementById("contenedor-carrito");
const resumenCarrito = document.getElementById("resumen");
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const idCarrito = parseInt(localStorage.getItem("carrito_id")) || null;

const textError = document.querySelector(".msg-error");

// Mostrar carrito
function mostrarCarrito() {
  if (carrito.length === 0) {
    contenedorCarrito.innerHTML = `
      <div class="carrito-vacio">
        <div class="carrito-vacio-icon">🛒</div>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos para comenzar</p>
        <a href="productos.html"><button>Ver productos</button></a>
      </div>`;
    resumenCarrito.innerHTML = '';
    return;
  }

  contenedorCarrito.innerHTML = "";
  let total = 0;
  
  carrito.forEach((p, i) => {
    const subtotal = p.precio * p.cantidad;
    total += subtotal;
    
    contenedorCarrito.innerHTML += `
      <div class="bloque-item" data-index="${i}">
        <img src="${p.url_image || 'img/placeholder.jpg'}" alt="${p.titulo || p.nombre}" class="item-imagen">
        <div class="item-info">
          <span class="item-nombre">${p.titulo || p.nombre}</span>
          <span class="item-precio-unit">$${Number(p.precio).toLocaleString()} c/u</span>
        </div>
        <div class="item-cantidad">
          <button onclick="cambiarCantidad(${i}, -1)">−</button>
          <span class="qty">${p.cantidad}</span>
          <button onclick="cambiarCantidad(${i}, 1)">+</button>
        </div>
        <span class="item-subtotal">$${subtotal.toLocaleString()}</span>
        <button class="btn-eliminar" onclick="eliminar(${i})" title="Eliminar">🗑️</button>
      </div>`;
  });

  // Mostrar resumen
  const cantidadItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  resumenCarrito.innerHTML = `
    <div class="resumen-linea">
      <span>Productos (${cantidadItems})</span>
      <span>$${total.toLocaleString()}</span>
    </div>
    <div class="resumen-linea">
      <span>Envío</span>
      <span style="color: #10b981; font-weight: 600;">Gratis</span>
    </div>
    <div class="resumen-total">
      <span>Total</span>
      <span class="total-precio">$${total.toLocaleString()}</span>
    </div>`;
}

function cambiarCantidad(i, delta) {
  const item = carrito[i];
  const nuevaCantidad = item.cantidad + delta;
  
  if (nuevaCantidad <= 0) {
    eliminar(i);
    return;
  }
  
  if (nuevaCantidad > item.stock) {
    alert("No hay más stock disponible");
    return;
  }
  
  item.cantidad = nuevaCantidad;
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
}

function eliminar(i) {
  const item = document.querySelector(`.bloque-item[data-index="${i}"]`);
  if (item) {
    item.classList.add('removing');
    setTimeout(() => {
      carrito.splice(i, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      mostrarCarrito();
    }, 300);
  } else {
    carrito.splice(i, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
  }
}

function vaciarCarrito() {
  if (carrito.length === 0) return;
  
  if (confirm("¿Estás seguro de vaciar el carrito?")) {
    carrito = [];
    localStorage.removeItem("carrito");
    mostrarCarrito();
  }
}


async function confirmarCompra() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  try {
    // Enviar al backend para registrar la venta
    const response = await fetch('http://localhost:4000/api/ventas/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: carrito, metodoPago: 'efectivo' })
    });

    if (response.ok) {
      // Guardar en ticket igual que antes para mostrar
      localStorage.setItem("ticket", JSON.stringify(carrito));
      carrito = [];
      localStorage.removeItem("carrito");
      window.location.href = "ticket.html";
    } else {
      const result = await response.json();
      alert(result.message || 'Error al procesar la compra');
    }
  } catch (error) {
    console.error(error);
    alert('Error de conexión');
  }
}

async function crearVenta(idCarrito) {
  try {
    const response = await fetch(`http://localhost:4000/api/ventas`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ idCarrito, metodoPago: "efectivo" })
    });
    const data = await response.json();

    if (data.status !== 201) {
      textError.textContent = data.data.errors.join(", ");
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", mostrarCarrito);
