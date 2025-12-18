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

    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('${producto.id}')">
      Añadir al carrito
    </button>
  </div>
`;
      container.innerHTML += productoHTML;
    });
  });
}

document.addEventListener('DOMContentLoaded', cargarProductos);
