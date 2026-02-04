/* js/favoritos.js - Lógica de productos favoritos */
const FAV_KEY = "verdemont_favoritos";

function leerFavoritos() {
  return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
}

function guardarFavoritos(favoritos) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favoritos));
  actualizarBadgeFavoritos();
}

function agregarProductoAFavoritos(producto) {
  const favoritos = leerFavoritos();
  if (!favoritos.find(p => String(p.id) === String(producto.id))) {
    favoritos.push(producto);
    guardarFavoritos(favoritos);
  }
}

function quitarProductoDeFavoritos(productId) {
  const favoritos = leerFavoritos();
  const nuevo = favoritos.filter(p => String(p.id) !== String(productId));
  guardarFavoritos(nuevo);
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

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    actualizarBadgeFavoritos();
  }, 100);
});

// Exponer funciones
window.leerFavoritos = leerFavoritos;
window.agregarProductoAFavoritos = agregarProductoAFavoritos;
window.quitarProductoDeFavoritos = quitarProductoDeFavoritos;
window.esFavorito = esFavorito;
window.actualizarBadgeFavoritos = actualizarBadgeFavoritos;
