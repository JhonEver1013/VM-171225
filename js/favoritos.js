// js/favoritos.js
const FAV_KEY = "verdemont_favoritos";

function leerFavoritos() {
  return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
}

function guardarFavoritos(favoritos) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favoritos));
  actualizarBotonesFavoritos();
}

async function agregarProductoAFavoritos(idOrProducto) {
  try {
    let producto;
    if (typeof idOrProducto === 'object') {
      producto = idOrProducto;
    } else {
      const idStr = String(idOrProducto);
      const resp = await fetch('json/productos.json');
      if (!resp.ok) throw new Error('No se pudo cargar productos.json');
      const productos = await resp.json();
      producto = productos.find(p => String(p.id) === idStr);
      if (!producto) {
        console.error('Producto no encontrado para id', idOrProducto);
        return;
      }
    }

    const favoritos = leerFavoritos();
    const idx = favoritos.findIndex(p => String(p.id) === String(producto.id));
    if (idx < 0) {
      favoritos.push(producto);
      guardarFavoritos(favoritos);
    }

    const selector = `.btn-add-fav[onclick*="${producto.id}"]`;
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('active');
    }

  } catch (err) {
    console.error('Error al agregar a favoritos:', err);
  }
}

function quitarProductoDeFavoritos(productId) {
  const idStr = String(productId);
  const nuevo = leerFavoritos().filter(p => String(p.id) !== idStr);
  guardarFavoritos(nuevo);
}

function actualizarBotonesFavoritos() {
  const favoritos = leerFavoritos();
  const botones = document.querySelectorAll('.btn-add-fav');
  botones.forEach(btn => {
    const productId = btn.getAttribute('onclick').match(/'(.*?)'/)[1];
    if (favoritos.some(p => String(p.id) === productId)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function renderFavoritos() {
    const favContainer = document.querySelector('.favoritos-container');
    if (!favContainer) return;

    const favoritos = leerFavoritos();

    if (favoritos.length === 0) {
        favContainer.innerHTML = '<p>No tienes productos favoritos.</p>';
        return;
    }

    favContainer.innerHTML = '';
    favoritos.forEach(producto => {
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
                    <button class="btn-add-fav active" onclick="quitarProductoDeFavoritos('${producto.id}'); renderFavoritos();">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        favContainer.innerHTML += productoHTML;
    });
}


document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('favoritos.html')) {
      renderFavoritos();
  }
});

window.agregarProductoAFavoritos = agregarProductoAFavoritos;
window.quitarProductoDeFavoritos = quitarProductoDeFavoritos;
window.actualizarBotonesFavoritos = actualizarBotonesFavoritos;
