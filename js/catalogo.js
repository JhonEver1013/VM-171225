// js/catalogo.js - carga en todos los .catalog-container
const catalogoContainers = document.querySelectorAll('.catalog-container');

async function cargarProductos() {
  const respuesta = await fetch('json/productos.json');
  const productos = await respuesta.json();

  catalogoContainers.forEach(container => {
    container.innerHTML = '';
    productos.forEach(producto => {
      const productoHTML = ` 
  <div class="producto"> 
    <a href="detalle.html?id=${producto.id}">
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>Precio: $${producto.precio.toFixed(2)}</p>
    </a>

    <div class="product-buttons">
      <button class="btn-add-cart" onclick="agregarProductoAlCarrito('${producto.id}')">
        Añadir al carrito
      </button>
      <button class="btn-add-fav" onclick="agregarProductoAFavoritos('${producto.id}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
          <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01z"/>
        </svg>
      </button>
    </div>
  </div>
`;
      container.innerHTML += productoHTML;
    });
  });
}

document.addEventListener('DOMContentLoaded', cargarProductos);
