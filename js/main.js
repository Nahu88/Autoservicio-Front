// URL del backend (para conectar más adelante)
const API_BASE = "http://localhost:4000/api";

// DOM
const contenedorProductos = document.getElementById("contenedor-productos");
const barraBusqueda = document.getElementById("barra-busqueda");
const contadorCarrito = document.getElementById("contador-carrito");
const spanCliente = document.getElementById("nombre-cliente");
const paginacionContainer = document.getElementById("paginacion");

//estado del carrito
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Productos simulados , para ver nomas 
let productos = [
  { id: 1, nombre: "Remera Negra",  tipo: "Remera", precio: 5000,  ruta_img: "img/Remera_Negra.jpg",  cantidad: 0 },
  { id: 2, nombre: "Remera Blanca", tipo: "Remera", precio: 4800,  ruta_img: "img/Remera_Blanca.jpg", cantidad: 0 },
  { id: 3, nombre: "Remera Azul",   tipo: "Remera", precio: 5200,  ruta_img: "img/Remera_Azul.jpg",   cantidad: 0 },
  { id: 4, nombre: "Buzo Negro",    tipo: "Buzo",   precio: 9000,  ruta_img: "img/Buzo_Negro.jpg",    cantidad: 0 },
  { id: 5, nombre: "Buzo Gris",     tipo: "Buzo",   precio: 9500,  ruta_img: "img/Buzo_Gris.jpg",     cantidad: 0 },
  { id: 6, nombre: "Buzo Rojo",     tipo: "Buzo",   precio: 10000, ruta_img: "img/Buzo_Rojo.jpg",     cantidad: 0 }
];

// Mostrar lista de productos
function mostrarLista(array) {
  contenedorProductos.innerHTML = "";
  if (array.length === 0) {
    contenedorProductos.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <p style="font-size: 1.2rem; color: var(--muted);">No se encontraron productos</p>
      </div>`;
    return;
  }
  array.forEach(prod => {
    const sinStock = prod.stock === 0;
    
    let stockBadge = "";
    if (sinStock) {
      stockBadge = `<span class="stock-badge out">Sin stock</span>`;
    }
    
    contenedorProductos.innerHTML += `
      <div class="card-producto ${sinStock ? 'sin-stock' : ''}">
        ${stockBadge}
        <img src="${prod.url_image}" alt="${prod.titulo}">
        <h3>${prod.titulo}</h3>
        <p>$${prod.precio.toLocaleString()}</p>
        <button class="btn-agregar" data-id="${prod.id}" ${sinStock ? 'disabled' : ''}>Agregar</button>
      </div>`;
  });
}

// Mostrar paginacion
function renderPaginacion(paginacion) {
  if (!paginacion) return;

  const { currentPage, totalPages, hasNextPage, hasPrevPage } = paginacion;
  const maxBotones = 5;
  let inicio = Math.max(1, currentPage - Math.floor(maxBotones / 2));
  let fin = Math.min(totalPages, inicio + maxBotones - 1);

  paginacionContainer.innerHTML = '';

  if (hasPrevPage) {
    paginacionContainer.innerHTML += `
      <button class="btn-paginacion" data-page="${currentPage - 1}">
        ←
      </button>`;
  }

  if (fin - inicio < maxBotones - 1) {
    inicio = Math.max(1, fin - maxBotones + 1);
  }
  if (inicio > 1) {
    paginacionContainer.innerHTML += `
      <button class="btn-paginacion" data-page="1">1</button>`;
    if (inicio > 2) {
      paginacionContainer.innerHTML += `<span class="dots">...</span>`;
    }
  }

  for (let i = inicio; i <= fin; i++) {
    paginacionContainer.innerHTML += `
      <button class="btn-paginacion ${i === currentPage ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>`;
  }

  if (fin < totalPages) {
    if (fin < totalPages - 1) {
      paginacionContainer.innerHTML += `<span class="dots">...</span>`;
    }
    paginacionContainer.innerHTML += `
      <button class="btn-paginacion" data-page="${totalPages}">${totalPages}</button>`;
  }

  if (hasNextPage) {
    paginacionContainer.innerHTML += `
      <button class="btn-paginacion" data-page="${currentPage + 1}">
        →
      </button>`;
  }
}

// Agregar producto al carrito
async function agregarACarrito(id) {
  let carritoId = parseInt(localStorage.getItem("carrito_id")) || null;
  const cliente = JSON.parse(localStorage.getItem('cliente'));
  const producto = productos.find(p => p.id === id);
  if (!producto || producto.stock === 0) return;
  
  const enCarrito = carrito.find(p => p.id === id);
  const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
  
  // Verificar que no exceda el stock
  if (cantidadEnCarrito >= producto.stock) {
    alert("No hay más stock disponible de este producto");
    return;
  }

  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
  const carritoExiste = await obtenerCarritoActivo(cliente.id);
  if (carritoExiste) {
    // obtener cantidad siempre
    await actualizarCarritoDb(carritoId, producto.id, 1);
  } else {
    await crearCarrito(cliente.id);
    await actualizarCarritoDb(carritoId, producto.id, 1);
  }
}

// Actualizar contador del carrito
function actualizarContador() {
  const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  contadorCarrito.innerText = `Carrito: ${total}`;
}

// Creo el carrito con estado "activo"
async function crearCarrito(id) {
  try {
    const response = await fetch(`${API_BASE}/carritos`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ cliente_id: id })
    });

    const data = await response.json();

    if (data.status === 201) {
      localStorage.setItem("carrito_id", data.data.carritoId);
    }
  } catch (error) {
    console.log(error);
  }
};

// Agrego Items al carrito ya creado
async function actualizarCarritoDb(carritoId, productoId, cantidad) {
  try {
    const response = await fetch(`${API_BASE}/carrito-items`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ carritoId, productoId, cantidad })
    });

    const data = await response.json();

    if (data.status !== 201) {
      throw new Error('Error al crear el carrito:', data.data.errors[0]);
    }
  } catch (error) {
    console.log(error);
  }
};

// Pregunto a la API si el cliente ya tiene un carrito con estado "activo" creado
async function obtenerCarritoActivo(id) {
  try {
    const response = await fetch(`${API_BASE}/carritos/${id}`);
    const data = await response.json();

    if (data.status === 404) return false;
    return true;
  } catch (error) {
    console.log(error);
  }
}

// Filtro de búsqueda
barraBusqueda.addEventListener("input", async () => {
  const valor = barraBusqueda.value.toLowerCase();
  await cargarProductos(1, valor);
});

// Eventos de botones agregar al carrito
contenedorProductos.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-agregar")) {
    const id = parseInt(e.target.dataset.id);
    await agregarACarrito(id);
  }
});

// Mostrar nombre del cliente guardado
spanCliente.innerText = JSON.parse(localStorage.getItem("cliente")).nombre || "Invitado";


mostrarLista(productos);
actualizarContador();


// Carga de productos desde backend

async function cargarProductos(page = 1, buscar = '') {
  try {
    let url = `${API_BASE}/productos?page=${page}&limit=10`; // limite = cantidad de prods a mostrar

    if (buscar) {
      url += `&buscar=${encodeURIComponent(buscar)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const { data } = await res.json();

    productos = data.productos.filter(p => p.activo || p.stock > 0 || p.stock === undefined);
    paginaActual = data.pagination.currentPage;
    totalPaginas = data.pagination.totalPages;

    localStorage.setItem('productos', JSON.stringify(productos));

    mostrarLista(productos);
    renderPaginacion(data.pagination);
  } catch (error) {
    console.error("Error al cargar productos:", error.message);
    mostrarLista([]); // opcional, deja vacio si hay error
  } finally {
    actualizarContador();
  }
}

if (paginacionContainer) {
  paginacionContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-paginacion")) {
      const page = parseInt(e.target.dataset.page);
      const buscar = barraBusqueda.value.trim();
      cargarProductos(page, buscar);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Y en lugar de mostrarLista(productos), llamar a:
cargarProductos();
