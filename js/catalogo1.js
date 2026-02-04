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
    const favIcon = (typeof esFavorito === 'function' && esFavorito(producto.id)) ? 'fa-solid' : 'fa-regular';

    const productoHTML = `
  <div class="producto">
    <div class="fav-container">
       <button class="btn-fav" onclick="toggleFavoritoInterno(this, '${producto.id}', '${producto.nombre.replace(/'/g, "\\'")}', ${producto.precio}, '${producto.imagen}')">
          <i class="${favIcon} fa-heart"></i>
       </button>
    </div>
    <a href="detalle.html?id=${producto.id}">
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>Precio: $${producto.precio.toFixed(2)}</p>
    </a>

    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('${producto.id}')">
      Añadir al carrito
    </button>
  </div>
`;
    catalogoContainer.innerHTML += productoHTML;
  });
}

/**
 * Alterna un producto en favoritos y actualiza el icono.
 */
function toggleFavoritoInterno(btn, id, nombre, precio, imagen) {
  const icon = btn.querySelector('i');
  if (icon.classList.contains('fa-solid')) {
    quitarProductoDeFavoritos(id);
    icon.classList.replace('fa-solid', 'fa-regular');
  } else {
    agregarProductoAFavoritos({ id, nombre, precio, imagen });
    icon.classList.replace('fa-regular', 'fa-solid');
  }
}

document.addEventListener('DOMContentLoaded', cargarProductos1);
