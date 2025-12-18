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

    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('${producto.id}')">
      Añadir al carrito
    </button>
  </div>
`;
    catalogoContainer.innerHTML += productoHTML;
  });
}

document.addEventListener('DOMContentLoaded', cargarProductos1);
