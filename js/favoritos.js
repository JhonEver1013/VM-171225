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
        itemEl.className = 'fav-item d-flex align-items-center mb-3 p-2 rounded';
        itemEl.style.backgroundColor = 'rgba(255,255,255,0.05)';
        itemEl.style.border = '1px solid rgba(255,255,255,0.1)';
        itemEl.style.transition = 'background 0.3s ease';
        itemEl.style.color = 'white';

        itemEl.innerHTML = `
            <div class="position-relative">
                <img src="${item.imagen || ''}" alt="${item.nombre}" style="width:70px;height:70px;object-fit:cover;border-radius:8px; border: 1px solid rgba(255,255,255,0.2);">
            </div>
            <div class="ms-3" style="flex:1;">
                <div style="font-size: 0.95rem; font-weight: 600; color: #fff;">${item.nombre}</div>
                <div style="font-size: 0.9rem; color: #00d1b2; font-weight: 500;">$${(item.precio).toLocaleString()} COP</div>
                <div class="mt-2 d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-light btn-add-cart-from-fav" data-id="${item.id}" style="border-radius: 20px; font-size: 0.75rem; padding: 2px 10px;">
                        <i class="fas fa-shopping-cart me-1"></i> Añadir
                    </button>
                    <button type="button" class="btn btn-sm btn-link text-light btn-remove-fav p-0" data-id="${item.id}" style="font-size: 0.75rem; text-decoration: none; opacity: 0.7;">
                        <i class="fas fa-trash-alt"></i> Quitar
                    </button>
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
