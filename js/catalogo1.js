// js/catalogo1.js - carga en un solo .catalog-container (ej. anillos)
const catalogoContainer = document.querySelector('.catalog-container');

async function cargarProductos1() {
  const respuesta = await fetch('json/productos.json');
  const productos = await respuesta.json();
  mostrarProductos(productos);
}

function mostrarProductos(productos) {
  if (!catalogoContainer) return;
  catalogoContainer.innerHTML = '';
  productos.forEach(producto => {
    const productoHTML = `
  <div class="producto">
    <a href="detalle.html?id=${producto.id}">
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>Precio: $${producto.precio.toFixed(2)}</p>
    </a>

    <div class="botones-producto">
      <button class="btn-add-cart" onclick="agregarProductoAlCarrito('${producto.id}')">
        Añadir al carrito
      </button>
      <button class="btn-add-fav" onclick="toggleFavorito('${producto.id}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
          <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C4.5 12.5 2 10.5 2 7.5 2 4.5 4.5 2 8 2s6 2.5 6 5.5c0 3-2.5 5-6.5 7.5z"/>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
        </svg>
      </button>
    </div>
  </div>
`;
    catalogoContainer.innerHTML += productoHTML;
  });

  if (window.actualizarBotonesFavoritos) {
    window.actualizarBotonesFavoritos();
  }
}

document.addEventListener('DOMContentLoaded', cargarProductos1);
