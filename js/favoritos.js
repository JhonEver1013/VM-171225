/* js/favoritos.js - Lógica para la sección de favoritos */
const FAV_KEY = "verdemont_favoritos";

/* ---------- Utilidades de almacenamiento ---------- */
function leerFavoritos() {
  return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
}

function guardarFavoritos(favoritos) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favoritos));
  actualizarBadgeFavoritos();
  renderFavoritosOffcanvas();
}

/* ---------- Agregar / Eliminar favoritos ---------- */
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
    const idStr = String(producto.id);
    if (!favoritos.find(p => String(p.id) === idStr)) {
      favoritos.push(producto);
      guardarFavoritos(favoritos);
    }

    // Feedback visual en el botón de favoritos
    const selector = `.btn-add-fav[onclick*="${producto.id}"]`;
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('active'); // Estilo visual para 'favorito'
    }
  } catch (err) {
    console.error('Error al agregar a favoritos:', err);
  }
}

function quitarProductoDeFavoritos(productId) {
  const idStr = String(productId);
  const nuevosFavoritos = leerFavoritos().filter(p => String(p.id) !== idStr);
  guardarFavoritos(nuevosFavoritos);

  // Actualizar feedback visual
  const selector = `.btn-add-fav[onclick*="${productId}"]`;
  const btn = document.querySelector(selector);
  if (btn) {
    btn.classList.remove('active');
  }
}

function vaciarFavoritos() {
  guardarFavoritos([]);
  // Actualizar todos los botones
  document.querySelectorAll('.btn-add-fav.active').forEach(btn => {
    btn.classList.remove('active');
  });
}

/* ---------- Badge / Render ---------- */
function actualizarBadgeFavoritos() {
  const total = leerFavoritos().length;
  const badge = document.getElementById('fav-badge');
  if (!badge) return;
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

function renderFavoritosOffcanvas() {
  const listaCont = document.getElementById('fav-items-list');
  if (!listaCont) return;
  const favoritos = leerFavoritos();
  if (favoritos.length === 0) {
    listaCont.innerHTML = '<p class="text-center">Aún no tienes favoritos.</p>';
    return;
  }
  listaCont.innerHTML = '';
  favoritos.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'fav-item d-flex align-items-center mb-3';
    itemEl.innerHTML = `
      <img src="${item.imagen || ''}" alt="${item.nombre}" style="width:64px;height:64px;object-fit:cover;border-radius:6px;margin-right:10px;">
      <div style="flex:1;">
        <div><strong>${item.nombre}</strong></div>
        <div>$${(item.precio).toFixed(2)}</div>
      </div>
      <button type="button" class="btn btn-sm btn-danger ms-3 btn-remove-fav" data-id="${String(item.id)}">Eliminar</button>
    `;
    listaCont.appendChild(itemEl);
  });
}

/* ---------- Delegación de eventos ---------- */
function favListClickHandler(e) {
  const target = e.target;
  if (target.closest('.btn-remove-fav')) {
    const id = target.closest('.btn-remove-fav').dataset.id;
    if (!id) return;
    quitarProductoDeFavoritos(id);
  }
}

function setupFavListDelegation() {
  const listaCont = document.getElementById('fav-items-list');
  if (listaCont) {
    listaCont.removeEventListener('click', favListClickHandler);
    listaCont.addEventListener('click', favListClickHandler);
  }
}

/* ---------- Controles del offcanvas ---------- */
function setupOffcanvasFavControls() {
  const btnVaciar = document.getElementById('fav-clear-btn');
  if (btnVaciar) {
    btnVaciar.addEventListener('click', () => {
      if (confirm('¿Deseas vaciar tu lista de favoritos?')) vaciarFavoritos();
    });
  }
}

/* ---------- Inicialización ---------- */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    actualizarBadgeFavoritos();
    renderFavoritosOffcanvas();
    setupFavListDelegation();
    setupOffcanvasFavControls();

    // Sincronizar estado visual de los botones de favoritos
    const favoritos = leerFavoritos();
    favoritos.forEach(fav => {
      const selector = `.btn-add-fav[onclick*="'${fav.id}'"]`;
      document.querySelectorAll(selector).forEach(btn => {
        btn.classList.add('active');
      });
    });
  }, 100);
});

/* ---------- Exponer funciones globalmente ---------- */
window.agregarProductoAFavoritos = agregarProductoAFavoritos;
window.quitarProductoDeFavoritos = quitarProductoDeFavoritos;
window.vaciarFavoritos = vaciarFavoritos;
