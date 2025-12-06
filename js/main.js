// URL del backend (para conectar más adelante)
const API_BASE = "https://autoservicio-api-production.up.railway.app/api";

// DOM
const contenedorProductos = document.getElementById("contenedor-productos");
const barraBusqueda = document.getElementById("barra-busqueda");
const contadorCarrito = document.getElementById("contador-carrito");
const spanCliente = document.getElementById("nombre-cliente");
const paginacionContainer = document.getElementById("paginacion");

// Filtros DOM
const filtroTipoContainer = document.getElementById("filtro-tipo");
const precioMin = document.getElementById("precio-min");
const precioMax = document.getElementById("precio-max");
const ordenarSelect = document.getElementById("ordenar");
const limpiarFiltrosBtn = document.getElementById("limpiar-filtros");

// Estado de filtros
let filtros = {
  tipo: 'todos',
  precioMin: null,
  precioMax: null,
  orden: 'recientes',
  busqueda: ''
};

// Tipos de productos
let tipos = [];

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

// Cargar tipos desde la API
async function cargarTipos() {
  try {
    const res = await fetch(`${API_BASE}/tipos`);
    const data = await res.json();
    tipos = data.data || data;
    
    // Renderizar pills de tipos
    if (filtroTipoContainer) {
      let pillsHTML = `<button class="filtro-pill active" data-tipo="todos">Todos</button>`;
      tipos.forEach(tipo => {
        pillsHTML += `<button class="filtro-pill" data-tipo="${tipo.id}">${tipo.nombre}</button>`;
      });
      filtroTipoContainer.innerHTML = pillsHTML;
    }
  } catch (error) {
    console.error("Error al cargar tipos:", error);
  }
}

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
    if (typeof toastCarritoError === 'function') {
      toastCarritoError("No hay más stock disponible de este producto");
    } else {
      alert("No hay más stock disponible de este producto");
    }
    return;
  }

  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
  
  // Mostrar toast de éxito
  if (typeof toastCarrito === 'function') {
    toastCarrito(producto.titulo || producto.nombre);
  }
  
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
  
  // Animación bounce
  contadorCarrito.classList.add('bounce');
  setTimeout(() => contadorCarrito.classList.remove('bounce'), 500);
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

    // Agregar filtro de tipo si está seleccionado y no es "todos"
    if (filtros.tipo !== 'todos') {
      url += `&tipo=${filtros.tipo}`;
    }

    // Agregar rangos de precio si están especificados
    if (filtros.precioMin !== null && filtros.precioMin !== '') {
      url += `&precio_min=${filtros.precioMin}`;
    }
    if (filtros.precioMax !== null && filtros.precioMax !== '') {
      url += `&precio_max=${filtros.precioMax}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const { data } = await res.json();

    productos = data.productos.filter(p => p.activo || p.stock > 0 || p.stock === undefined);
    paginaActual = data.pagination.currentPage;
    totalPaginas = data.pagination.totalPages;

    localStorage.setItem('productos', JSON.stringify(productos));

    // Aplicar ordenamiento
    aplicarOrdenamiento(productos);
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

// ========================================
// FILTROS Y ORDENAMIENTO
// ========================================

// Aplicar ordenamiento a un array de productos
function aplicarOrdenamiento(array) {
  switch (filtros.orden) {
    case 'precio-asc':
      array.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
      break;
    case 'precio-desc':
      array.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
      break;
    case 'nombre-asc':
      array.sort((a, b) => (a.titulo || a.nombre).localeCompare(b.titulo || b.nombre));
      break;
    case 'nombre-desc':
      array.sort((a, b) => (b.titulo || b.nombre).localeCompare(a.titulo || a.nombre));
      break;
    case 'recientes':
    default:
      array.sort((a, b) => b.id - a.id);
      break;
  }
}

// Recargar productos con filtros aplicados (vuelve a página 1)
function filtrarYOrdenarProductos() {
  const buscar = barraBusqueda ? barraBusqueda.value.trim() : '';
  cargarProductos(1, buscar);
}

// Filtrar productos localmente (para cuando ya están cargados)
function filtrarLocalmente(array) {
  let resultado = [...array];
  
  // Filtrar por tipo
  if (filtros.tipo !== 'todos') {
    resultado = resultado.filter(p => p.id_tipo === parseInt(filtros.tipo));
  }
  
  // Filtrar por precio mínimo
  if (filtros.precioMin !== null && filtros.precioMin !== '') {
    resultado = resultado.filter(p => parseFloat(p.precio) >= parseFloat(filtros.precioMin));
  }
  
  // Filtrar por precio máximo
  if (filtros.precioMax !== null && filtros.precioMax !== '') {
    resultado = resultado.filter(p => parseFloat(p.precio) <= parseFloat(filtros.precioMax));
  }
  
  // Filtrar por búsqueda
  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase();
    resultado = resultado.filter(p => 
      (p.titulo || p.nombre || '').toLowerCase().includes(busqueda)
    );
  }
  
  // Ordenar
  aplicarOrdenamiento(resultado);
  mostrarLista(resultado);
}

// Event listeners para filtros
if (filtroTipoContainer) {
  filtroTipoContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filtro-pill')) {
      // Quitar active de todos
      filtroTipoContainer.querySelectorAll('.filtro-pill').forEach(pill => {
        pill.classList.remove('active');
      });
      // Agregar active al clickeado
      e.target.classList.add('active');
      filtros.tipo = e.target.dataset.tipo;
      filtrarYOrdenarProductos();
    }
  });
}

if (precioMin) {
  precioMin.addEventListener('input', (e) => {
    filtros.precioMin = e.target.value;
    filtrarYOrdenarProductos();
  });
}

if (precioMax) {
  precioMax.addEventListener('input', (e) => {
    filtros.precioMax = e.target.value;
    filtrarYOrdenarProductos();
  });
}

if (ordenarSelect) {
  ordenarSelect.addEventListener('change', (e) => {
    filtros.orden = e.target.value;
    // El ordenamiento se aplica localmente sin recargar desde API
    aplicarOrdenamiento(productos);
    mostrarLista(productos);
  });
}

if (limpiarFiltrosBtn) {
  limpiarFiltrosBtn.addEventListener('click', () => {
    // Resetear estado
    filtros = {
      tipo: 'todos',
      precioMin: null,
      precioMax: null,
      orden: 'recientes',
      busqueda: ''
    };
    
    // Resetear UI
    if (filtroTipoContainer) {
      filtroTipoContainer.querySelectorAll('.filtro-pill').forEach(pill => {
        pill.classList.remove('active');
      });
      filtroTipoContainer.querySelector('[data-tipo="todos"]')?.classList.add('active');
    }
    if (precioMin) precioMin.value = '';
    if (precioMax) precioMax.value = '';
    if (ordenarSelect) ordenarSelect.value = 'recientes';
    if (barraBusqueda) barraBusqueda.value = '';
    
    // Recargar productos sin filtros (página 1)
    cargarProductos(1, '');
    
    if (typeof toastInfo === 'function') {
      toastInfo('Se limpiaron todos los filtros', 'Filtros');
    }
  });
}

// Actualizar búsqueda en filtros
if (barraBusqueda) {
  barraBusqueda.addEventListener('input', (e) => {
    filtros.busqueda = e.target.value;
    filtrarYOrdenarProductos();
  });
}

// Inicializar: cargar tipos y productos
cargarTipos();
cargarProductos();
