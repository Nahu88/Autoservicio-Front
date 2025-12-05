const cambiarTemaBtn = document.getElementById("cambiar-tema");

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
updateButtonIcon(savedTheme);

cambiarTemaBtn?.addEventListener("click", () => {
  const actual = document.documentElement.getAttribute("data-theme") || "light";
  const siguiente = actual === "light" ? "dark" : "light";
  
  // Activar transición suave
  document.documentElement.classList.add('theme-transition');
  
  document.documentElement.setAttribute("data-theme", siguiente);
  localStorage.setItem("theme", siguiente);
  updateButtonIcon(siguiente);
  
  // Desactivar transición después de completarse
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 400);
});

function updateButtonIcon(theme) {
  if (cambiarTemaBtn) {
    cambiarTemaBtn.textContent = theme === "dark" ? "☀️" : "🌙";
    cambiarTemaBtn.title = theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  }
}
