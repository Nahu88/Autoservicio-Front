// ========================================
// SISTEMA DE TOAST NOTIFICATIONS
// ========================================

// Crear contenedor de toasts si no existe
function getToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

// Iconos para cada tipo
const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
};

// Función principal para mostrar toast
function showToast(options = {}) {
  const {
    type = 'info',
    title = '',
    message = '',
    duration = 3000,
    closable = true
  } = options;

  const container = getToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  toast.innerHTML = `
    <span class="toast-icon">${toastIcons[type]}</span>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    ${closable ? '<button class="toast-close">×</button>' : ''}
    <div class="toast-progress"></div>
  `;
  
  container.appendChild(toast);
  
  // Cerrar al hacer click
  if (closable) {
    toast.querySelector('.toast-close').addEventListener('click', () => {
      closeToast(toast);
    });
  }
  
  // Auto cerrar después de duration
  if (duration > 0) {
    setTimeout(() => {
      closeToast(toast);
    }, duration);
  }
  
  return toast;
}

function closeToast(toast) {
  if (!toast || toast.classList.contains('toast-out')) return;
  
  toast.classList.add('toast-out');
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// Funciones de conveniencia
function toastSuccess(message, title = '¡Éxito!') {
  return showToast({ type: 'success', title, message });
}

function toastError(message, title = 'Error') {
  return showToast({ type: 'error', title, message });
}

function toastWarning(message, title = 'Atención') {
  return showToast({ type: 'warning', title, message });
}

function toastInfo(message, title = 'Info') {
  return showToast({ type: 'info', title, message });
}

// Toast específico para carrito
function toastCarrito(producto) {
  return showToast({
    type: 'success',
    title: '¡Agregado al carrito!',
    message: `${producto} se agregó correctamente`,
    duration: 2500
  });
}

function toastCarritoError(mensaje) {
  return showToast({
    type: 'error',
    title: 'No se pudo agregar',
    message: mensaje,
    duration: 3000
  });
}
