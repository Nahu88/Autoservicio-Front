# 🛍️ Autoservicio - Frontend

Sistema de tienda online para la venta de prendas de ropa. Aplicación frontend moderna, responsiva y con tema oscuro integrado.

## ✨ Características principales

- **Catálogo de productos** con búsqueda, filtros y ordenamiento
- **Carrito de compras** con persistencia en localStorage
- **Sistema de autenticación** basado en nombre de cliente
- **Tema oscuro/claro** con transiciones suaves
- **Notificaciones toast** para feedback del usuario
- **PDF de tickets** para descargar compras
- **Interfaz responsiva** adaptada a mobile y desktop
- **Integración con Cloudinary** para imágenes de productos

## 🚀 Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Grid, Flexbox, Custom Properties, Animaciones
- **Vanilla JavaScript (ES6+)** - Sin frameworks
- **LocalStorage** - Persistencia de datos
- **jsPDF** - Generación de PDF de tickets
- **Fetch API** - Comunicación con backend

## 📋 Requisitos

- Conexión a internet (para Cloudinary y API)
- Backend ejecutándose en `http://localhost:4000/api` (Conectar con Autoservicio-Api(https://github.com/Nahu88/Autoservicio-Api))

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Nahu88/Autoservicio-Front.git
cd Autoservicio-Front
```

### 2. Servir localmente

Opción A - Usar Live Server (VS Code):
- Instala la extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

Opción B - Usar Python:
```bash
# Python 3
python -m http.server 8000

# O Python 2
python -m SimpleHTTPServer 8000
```

Opción C - Usar Node.js:
```bash
npx http-server
```

Luego abre: `http://localhost:5500` (Live Server) o `http://localhost:8000` (Python/Node)

## 🔌 Integración API

El frontend se conecta a la API backend en `http://localhost:4000/api`.


## 📝 Variables de entorno

El proyecto usa una URL base hardcodeada. Para cambiarla, edita en `js/main.js`:

```javascript
const API_BASE = "http://localhost:4000/api";
```


