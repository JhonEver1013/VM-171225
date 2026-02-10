/* js/favoritos.js - Lógica de productos favoritos */
const FAV_KEY = "verdemont_favoritos";

function leerFavoritos() {
  return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
}

function guardarFavoritos(favoritos) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favoritos));
  actualizarBadgeFavoritos();
  renderizarFavoritos();
}

function agregarProductoAFavoritos(producto) {
  const favoritos = leerFavoritos();
  if (!favoritos.find(p => String(p.id) === String(producto.id))) {
    favoritos.push(producto);
    guardarFavoritos(favoritos);

    // Sincronizar iconos
    actualizarIconosCorazon(producto.id, true);
  }
}

function quitarProductoDeFavoritos(productId) {
  const favoritos = leerFavoritos();
  const nuevo = favoritos.filter(p => String(p.id) !== String(productId));
  guardarFavoritos(nuevo);

  // Si estamos en una página de catálogo, actualizar el corazón si existe
  actualizarIconosCorazon(productId, false);
}

function esFavorito(productId) {
  const favoritos = leerFavoritos();
  return favoritos.some(p => String(p.id) === String(productId));
}

function actualizarBadgeFavoritos() {
  const favoritos = leerFavoritos();
  const total = favoritos.length;
  const badge = document.getElementById('fav-badge');
  if (!badge) return;
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

function renderizarFavoritos() {
    const listaCont = document.getElementById('fav-items-list');
    const emptyMsg = document.getElementById('fav-empty-msg');
    if (!listaCont) return;

    const favoritos = leerFavoritos();
    if (favoritos.length === 0) {
        listaCont.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    listaCont.innerHTML = '';
    favoritos.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'fav-item d-flex align-items-center mb-3';
        itemEl.style.color = 'white';
        itemEl.innerHTML = `
            <img src="${item.imagen || ''}" alt="${item.nombre}" style="width:64px;height:64px;object-fit:cover;border-radius:6px;margin-right:10px;">
            <div style="flex:1;">
                <div style="font-size: 0.9rem;"><strong>${item.nombre}</strong></div>
                <div style="font-size: 0.85rem;">$${(item.precio).toFixed(2)}</div>
                <div class="mt-1 d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-success btn-add-cart-from-fav" data-id="${item.id}" title="Agregar al carrito">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5"/>
                            <path d="M3.102 4l1.313 7h8.17l1.313-7z"/>
                            <path d="M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                        </svg>
                    </button>
                    <button type="button" class="btn btn-sm btn-dark btn-remove-fav" data-id="${item.id}">Eliminar</button>
                </div>
            </div>
        `;
        listaCont.appendChild(itemEl);
    });
}

function actualizarIconosCorazon(productId, favorited) {
    const hearts = document.querySelectorAll(`.btn-fav[data-id="${productId}"] i, .btn-fav-detalle[data-id="${productId}"] i`);
    hearts.forEach(h => {
        if (favorited) {
            h.classList.remove('fa-regular');
            h.classList.add('fa-solid');
        } else {
            h.classList.remove('fa-solid');
            h.classList.add('fa-regular');
        }
    });
}

function favListClickHandler(e) {
    const target = e.target;
    const btnRemove = target.closest('.btn-remove-fav');
    const btnAddToCart = target.closest('.btn-add-cart-from-fav');

    if (btnRemove) {
        const id = btnRemove.dataset.id;
        quitarProductoDeFavoritos(id);
    }

    if (btnAddToCart) {
        const id = btnAddToCart.dataset.id;
        const favoritos = leerFavoritos();
        const producto = favoritos.find(p => String(p.id) === String(id));
        if (producto && window.agregarProductoAlCarrito) {
            window.agregarProductoAlCarrito(producto);
        }
    }
}

// Inicialización
function initFavoritos() {
  actualizarBadgeFavoritos();
  renderizarFavoritos();

  const listaCont = document.getElementById('fav-items-list');
  if (listaCont) {
      listaCont.removeEventListener('click', favListClickHandler);
      listaCont.addEventListener('click', favListClickHandler);
  }

  const favOffcanvas = document.getElementById('offcanvasFavorites');
  if (favOffcanvas) {
      favOffcanvas.removeEventListener('show.bs.offcanvas', renderizarFavoritos);
      favOffcanvas.addEventListener('show.bs.offcanvas', renderizarFavoritos);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (customElements.get('special-header')) {
    initFavoritos();
  } else {
    customElements.whenDefined('special-header').then(initFavoritos);
  }
});

// Respaldo para asegurar que se ejecute si hay demoras en la definición del custom element
window.addEventListener('load', () => {
  setTimeout(initFavoritos, 500);
});

// Exponer funciones
window.leerFavoritos = leerFavoritos;
window.agregarProductoAFavoritos = agregarProductoAFavoritos;
window.quitarProductoDeFavoritos = quitarProductoDeFavoritos;
window.esFavorito = esFavorito;
window.actualizarBadgeFavoritos = actualizarBadgeFavoritos;
window.renderizarFavoritos = renderizarFavoritos;
