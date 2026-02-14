// js/favoritos.js
const FAV_KEY = "verdemont_favoritos";

// Lee los favoritos desde localStorage
function leerFavoritos() {
  return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
}

// Guarda los favoritos en localStorage y actualiza la UI
function guardarFavoritos(favoritos) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favoritos));
  renderFavoritosOffcanvas();
  actualizarContadorFavoritos();
  actualizarBotonesFavoritos(); // Asegura que los botones de corazón se mantengan sincronizados
}

// Actualiza el contador de favoritos en el header
function actualizarContadorFavoritos() {
    const favBadge = document.getElementById('fav-badge');
    if (favBadge) {
        const count = leerFavoritos().length;
        favBadge.textContent = count;
        favBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Renderiza los productos favoritos en el off-canvas
function renderFavoritosOffcanvas() {
    const favItemsList = document.getElementById('fav-items-list');
    const vaciarBtnContainer = document.querySelector('#offcanvasFavNavbar .d-grid'); // Re-seleccionamos el contenedor del botón

    if (!favItemsList) {
        return;
    }

    const favoritos = leerFavoritos();

    if (favoritos.length === 0) {
        favItemsList.innerHTML = '<p class="text-center">No tienes productos favoritos.</p>';
        if(vaciarBtnContainer) vaciarBtnContainer.style.display = 'none'; // Ocultar botón si no hay favoritos
        return;
    }

    if(vaciarBtnContainer) vaciarBtnContainer.style.display = 'block'; // Mostrar botón si hay favoritos

    favItemsList.innerHTML = ''; // Limpiar contenido anterior
    favoritos.forEach(producto => {
        const productoHTML = `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-4">
                        <a href="detalle.html?id=${producto.id}">
                            <img src="${producto.imagen}" class="img-fluid rounded-start" alt="${producto.nombre}">
                        </a>
                    </div>
                    <div class="col-8">
                        <div class="card-body">
                            <h6 class="card-title">${producto.nombre}</h6>
                            <p class="card-text">$${producto.precio.toFixed(2)}</p>
                            <button class="btn btn-sm btn-danger" onclick="quitarProductoDeFavoritos('${producto.id}')">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        favItemsList.innerHTML += productoHTML;
    });
}


// Alterna (agrega o quita) un producto de favoritos
async function toggleFavorito(productId) {
    try {
        const favoritos = leerFavoritos();
        const idx = favoritos.findIndex(p => String(p.id) === String(productId));

        if (idx > -1) {
            // Producto ya está en favoritos, así que lo quitamos
            quitarProductoDeFavoritos(productId);
        } else {
            // Producto no está en favoritos, así que lo agregamos
            const resp = await fetch('json/productos.json');
            if (!resp.ok) throw new Error('No se pudo cargar productos.json');
            const productos = await resp.json();
            const producto = productos.find(p => String(p.id) === String(productId));
            if (producto) {
                favoritos.push(producto);
                guardarFavoritos(favoritos);
            } else {
                console.error('Producto no encontrado para id', productId);
            }
        }
    } catch (err) {
        console.error('Error en toggleFavorito:', err);
    }
}

// Quita un producto de favoritos
function quitarProductoDeFavoritos(productId) {
  const idStr = String(productId);
  const nuevo = leerFavoritos().filter(p => String(p.id) !== idStr);
  guardarFavoritos(nuevo);
}

// Vacía todos los favoritos
function vaciarFavoritos() {
    guardarFavoritos([]);
}


// Sincroniza el estado (activo/inactivo) de los botones de corazón en toda la página
function actualizarBotonesFavoritos() {
    const favoritos = leerFavoritos();
    const botones = document.querySelectorAll('.btn-add-fav');

    botones.forEach(btn => {
        const match = btn.getAttribute('onclick').match(/toggleFavorito\('(\d+)'\)/);
        if (!match) return;

        const productId = match[1];
        const heart = btn.querySelector('.bi-heart');
        const heartFill = btn.querySelector('.bi-heart-fill');

        if (favoritos.some(p => String(p.id) === productId)) {
            btn.classList.add('active');
            heart.style.display = 'none';
            heartFill.style.display = 'inline-block';
        } else {
            btn.classList.remove('active');
            heart.style.display = 'inline-block';
            heartFill.style.display = 'none';
        }
    });
}


// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  renderFavoritosOffcanvas();
  actualizarContadorFavoritos();
  actualizarBotonesFavoritos();

  // Asignar evento al botón de vaciar favoritos en el off-canvas
  const btnVaciar = document.getElementById('fav-clear-btn');
  if (btnVaciar) {
      btnVaciar.addEventListener('click', vaciarFavoritos);
  }
});

// Exponer funciones globalmente para que puedan ser llamadas desde los atributos onclick en el HTML
window.toggleFavorito = toggleFavorito;
window.quitarProductoDeFavoritos = quitarProductoDeFavoritos;
