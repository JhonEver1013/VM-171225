// js/detalle.js - Mostrar detalle y agregar al carrito (versión sin módulos)
const params = new URLSearchParams(window.location.search);
const idProducto = params.get('id');
const detalleContainer = document.getElementById('detalle-producto');

async function cargarDetalleProducto() {
  try {
    const respuesta = await fetch('../json/productos.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar el archivo JSON');
    const productos = await respuesta.json();
    const producto = productos.find(p => p.id == idProducto);

    if (producto) {
      detalleContainer.innerHTML = `
        <div class="cardP">
          <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
          <div class="card-body">
            <h1 class="card-title">${producto.nombre}</h1>
            <p class="card-text">${producto.descripcion}</p>
            <p class="card-text"><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>

            <div class="d-flex gap-2 align-items-center">
              <a href="Anillos.html" class="btn btn-secondary">Volver al catálogo</a>
              <button id="btnAgregarCarrito" class="btn btn-success">Agregar al carrito</button>
              <button id="btnFavoritoDetalle" class="btn-fav-detalle">
                <i class="${(typeof esFavorito === 'function' && esFavorito(producto.id)) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Evento Favoritos
      document.getElementById('btnFavoritoDetalle').addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-solid')) {
          quitarProductoDeFavoritos(producto.id);
          icon.classList.replace('fa-solid', 'fa-regular');
        } else {
          agregarProductoAFavoritos({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen
          });
          icon.classList.replace('fa-regular', 'fa-solid');
        }
      });

      document.getElementById('btnAgregarCarrito').addEventListener('click', () => {
        const prodParaCarrito = {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen
        };

        if (typeof window.agregarProductoAlCarrito === 'function') {
          window.agregarProductoAlCarrito(prodParaCarrito);
        } else {
          const carrito = JSON.parse(localStorage.getItem('verdemont_carrito')) || [];
          const idx = carrito.findIndex(p => p.id === prodParaCarrito.id);
          if (idx >= 0) carrito[idx].cantidad = (carrito[idx].cantidad || 1) + 1;
          else carrito.push({...prodParaCarrito, cantidad:1});
          localStorage.setItem('verdemont_carrito', JSON.stringify(carrito));
          if (window.renderCarritoOffcanvas) window.renderCarritoOffcanvas();
        }

        const btn = document.getElementById('btnAgregarCarrito');
        const original = btn.textContent;
        btn.textContent = 'Agregado ✓';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 900);
      });

    } else {
      detalleContainer.innerHTML = "<p class='text-center'>Producto no encontrado</p>";
    }
  } catch (error) {
    console.error('Error al cargar el detalle del producto:', error);
    detalleContainer.innerHTML = "<p class='text-center'>Error al cargar el producto</p>";
  }
}

document.addEventListener('DOMContentLoaded', cargarDetalleProducto);
