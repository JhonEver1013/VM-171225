// js/catalogo.js - carga en todos los .catalog-container
const catalogoContainers = document.querySelectorAll('.catalog-container');

async function cargarProductos() {
  try {
    const respuesta = await fetch('json/productos.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar productos');
    const productos = await respuesta.json();

    catalogoContainers.forEach(container => {
      container.innerHTML = '';
      productos.forEach(producto => {
        const favIcon = (typeof esFavorito === 'function' && esFavorito(producto.id)) ? 'fa-solid' : 'fa-regular';

        const productoHTML = `
    <div class="producto">
      <div class="fav-container">
         <button class="btn-fav" data-id="${producto.id}" onclick="toggleFavoritoInterno(this, '${producto.id}', '${producto.nombre.replace(/'/g, "\\'")}', ${producto.precio}, '${producto.imagen}')">
            <i class="${favIcon} fa-heart"></i>
         </button>
      </div>
      <a href="detalle.html?id=${producto.id}">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>Precio: $${producto.precio.toLocaleString()}</p>
      </a>
      <button class="btn-add-cart" onclick="agregarProductoAlCarrito('${producto.id}')">Agregar al Carrito</button>
    </div>
  `;
        container.innerHTML += productoHTML;
      });
    });
  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
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

document.addEventListener('DOMContentLoaded', cargarProductos);
