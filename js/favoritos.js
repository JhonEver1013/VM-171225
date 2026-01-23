
// js/favoritos.js

// Función para obtener los favoritos desde localStorage
function obtenerFavoritos() {
  const favoritos = localStorage.getItem('favoritos');
  return favoritos ? JSON.parse(favoritos) : [];
}

// Función para guardar los favoritos en localStorage
function guardarFavoritos(favoritos) {
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

// Función para verificar si un producto está en favoritos
function esFavorito(productoId) {
  const favoritos = obtenerFavoritos();
  return favoritos.includes(productoId);
}

// Función para agregar o quitar un producto de favoritos
function agregarProductoAFavoritos(productoId) {
  let favoritos = obtenerFavoritos();
  if (esFavorito(productoId)) {
    favoritos = favoritos.filter(id => id !== productoId);
  } else {
    favoritos.push(productoId);
  }
  guardarFavoritos(favoritos);
  actualizarIconosFavoritos();
  cargarFavoritosEnOffcanvas(); // Asegúrate de que el offcanvas se actualice
}

// Función para actualizar los íconos de corazón en toda la página
function actualizarIconosFavoritos() {
  const botonesFavoritos = document.querySelectorAll('.btn-add-fav');
  botonesFavoritos.forEach(boton => {
    const productoId = boton.getAttribute('onclick').match(/'(.*?)'/)[1];
    if (esFavorito(productoId)) {
      boton.classList.add('active');
    } else {
      boton.classList.remove('active');
    }
  });
}

// Función para cargar los productos favoritos en el offcanvas
async function cargarFavoritosEnOffcanvas() {
  const favoritosContainer = document.getElementById('favoritos-items-container');
  if (!favoritosContainer) return;

  const favoritos = obtenerFavoritos();
  const respuesta = await fetch('json/productos.json');
  const productos = await respuesta.json();

  favoritosContainer.innerHTML = '';

  if (favoritos.length === 0) {
    favoritosContainer.innerHTML = '<p>No tienes productos favoritos.</p>';
    return;
  }

  const productosFavoritos = productos.filter(p => favoritos.includes(p.id));

  productosFavoritos.forEach(producto => {
    const favItem = document.createElement('div');
    favItem.className = 'fav-item d-flex justify-content-between align-items-center mb-3';
    favItem.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">
        <div>
          <strong>${producto.nombre}</strong>
          <p class="mb-0">$${producto.precio.toFixed(2)}</p>
        </div>
      </div>
      <button class="btn btn-sm btn-outline-danger btn-remove-fav" onclick="agregarProductoAFavoritos('${producto.id}')">Eliminar</button>
    `;
    favoritosContainer.appendChild(favItem);
  });
}

// Event listener para el evento personalizado 'productosCargados'
document.addEventListener('productosCargados', () => {
  actualizarIconosFavoritos();

  // Es posible que los productos se carguen dinámicamente, así que usamos un MutationObserver
  const observer = new MutationObserver(actualizarIconosFavoritos);
  const catalogoContainers = document.querySelectorAll('.catalog-container');
  catalogoContainers.forEach(container => {
    observer.observe(container, { childList: true, subtree: true });
  });
});

// Cargar favoritos en el offcanvas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarFavoritosEnOffcanvas();
});
