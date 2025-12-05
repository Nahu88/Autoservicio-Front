const API_BASE = "http://localhost:4000/api";

const inputNombre = document.getElementById("nombre-cliente");
const boton = document.getElementById("btn-ingresar");

async function crearCliente(nombre) {
  try {
    const response = await fetch(`${API_BASE}/clientes`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ nombre })
    });
    const data = await response.json();
    if (data.status !== 201) {
      throw new Error("HTTP " + res.status);
    } else {
      localStorage.setItem("cliente", JSON.stringify({ id: data.data.id, nombre }));
    }
  } catch (error) {
    console.error("Error al crear cliente:", error.message);
  }
}

boton.addEventListener("click", async () => {
  const nombre = inputNombre.value.trim();
  if (nombre) {
    await crearCliente(nombre);
    window.location.href = "productos.html";
  } else {
    alert("Por favor, ingresá tu nombre antes de continuar");
  }
});
