/* js/carrito.js - Carrito unificado usando clave verdemont_carrito */
const CART_KEY = "verdemont_carrito";

/* ---------- utilidades de almacenamiento ---------- */
function leerCarrito() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}
function guardarCarrito(carrito) {
  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
  actualizarBadge();
  renderCarritoOffcanvas();
}

/* ---------- agregar / eliminar / cambiar cantidad ---------- */
function agregarProductoAlCarritoInternal(productoObj) {
  productoObj.id = String(productoObj.id);
  const carrito = leerCarrito();
  const idx = carrito.findIndex(p => String(p.id) === String(productoObj.id));
  if (idx >= 0) {
    carrito[idx].cantidad = (carrito[idx].cantidad || 1) + 1;
  } else {
    carrito.push({...productoObj, cantidad: 1});
  }
  guardarCarrito(carrito);
}

async function agregarProductoAlCarrito(idOrProducto) {
  try {
    // si nos pasan un objeto, usamos directamente; si nos pasan id (string/number), buscamos en JSON
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

    agregarProductoAlCarritoInternal(producto);

    // feedback visual en botón (si existe)
    const selector = `.btn-add-cart[onclick*="${producto.id}"]`;
    const btn = document.querySelector(selector);
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = 'Agregado ✓';
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 900);
    }
  } catch (err) {
    console.error('Error al agregar producto:', err);
  }
}

/* ---------- quitar y cambiar cantidad ---------- */
function quitarProductoDelCarrito(productId) {
  const idStr = String(productId);
  const nuevo = leerCarrito().filter(p => String(p.id) !== idStr);
  guardarCarrito(nuevo);
}
function cambiarCantidad(productId, nuevaCantidad) {
  const idStr = String(productId);
  const carrito = leerCarrito();
  const idx = carrito.findIndex(p => String(p.id) === idStr);
  if (idx === -1) return;
  if (nuevaCantidad <= 0) {
    carrito.splice(idx, 1);
  } else {
    carrito[idx].cantidad = nuevaCantidad;
  }
  guardarCarrito(carrito);
}
function vaciarCarrito() {
  guardarCarrito([]);
}

/**
 * Lógica principal para finalizar el pedido: redirige a WhatsApp con el resumen.
 */
async function finalizarPedido() {
  const carrito = leerCarrito();
  if (carrito.length === 0) return;

  const subtotal = getSubtotal();

  try {
    // Redirigir a WhatsApp con la "Factura Digital" en texto
    enviarWhatsApp(carrito, subtotal);
  } catch (error) {
    console.error('Error al finalizar el pedido:', error);
    alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
  }
}

/**
 * Redirige al usuario a WhatsApp con una Factura Digital profesional en texto.
 */
function enviarWhatsApp(carrito, subtotal) {
  const numero = "573203168616";
  const fecha = new Date().toLocaleDateString();

  let mensaje = `🌿 *FACTURA DIGITAL - VERDEMONT* 🌿\n`;
  mensaje += `------------------------------------------\n`;
  mensaje += `📅 *Fecha:* ${fecha}\n\n`;
  mensaje += `✅ *Resumen del Pedido:*\n`;

  carrito.forEach(item => {
    const itemTotal = item.precio * item.cantidad;
    mensaje += `▪ *${item.nombre}*\n`;
    mensaje += `   Cant: ${item.cantidad} x $${item.precio.toLocaleString()}\n`;
    mensaje += `   Subtotal: *$${itemTotal.toLocaleString()}*\n\n`;
  });

  mensaje += `------------------------------------------\n`;
  mensaje += `💰 *TOTAL GENERAL: $${subtotal.toLocaleString()}*\n`;
  mensaje += `------------------------------------------\n\n`;
  mensaje += `¡Hola! Me gustaría finalizar mi compra con estos productos. Quedo atento(a) para coordinar el pago y el envío. ✨`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

/* ---------- subtotal / badge / render ---------- */
function getSubtotal() {
  const carrito = leerCarrito();
  return carrito.reduce((s, p) => s + (p.precio * (p.cantidad || 1)), 0);
}

function actualizarBadge() {
  const carrito = leerCarrito();
  const total = carrito.reduce((s, p) => s + (p.cantidad || 0), 0);
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

function renderCarritoOffcanvas() {
  const listaCont = document.getElementById('cart-items-list');
  const subtotalCont = document.getElementById('cart-subtotal');
  if (!listaCont) return;
  const carrito = leerCarrito();
  if (carrito.length === 0) {
    listaCont.innerHTML = '<p class="text-center">Tu carrito está vacío.</p>';
    if (subtotalCont) subtotalCont.innerHTML = '';
    return;
  }
  listaCont.innerHTML = '';
  carrito.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item d-flex align-items-center mb-3';
    itemEl.innerHTML = `
      <img src="${item.imagen || ''}" alt="${item.nombre}" style="width:64px;height:64px;object-fit:cover;border-radius:6px;margin-right:10px;">
      <div style="flex:1;">
        <div><strong>${item.nombre}</strong></div>
        <div>$${(item.precio).toFixed(2)}</div>
        <div class="mt-1 d-flex align-items-center">
          <button type="button" class="btn btn-sm btn-outline-secondary btn-decrease" data-id="${String(item.id)}">-</button>
          <span class="mx-2 qty">${item.cantidad}</span>
          <button type="button" class="btn btn-sm btn-outline-secondary btn-increase" data-id="${String(item.id)}">+</button>
          <button type="button" class="btn btn-sm btn-danger ms-3 btn-remove" data-id="${String(item.id)}">Eliminar</button>
        </div>
      </div>
    `;
    listaCont.appendChild(itemEl);
  });
  if (subtotalCont) {
    subtotalCont.innerHTML = `<h5>Subtotal: $${getSubtotal().toFixed(2)}</h5>`;
  }
}

/* ---------- delegación de eventos en la lista del carrito ---------- */
function cartListClickHandler(e) {
  const target = e.target;
  if (target.closest('.btn-increase')) {
    const id = target.closest('.btn-increase').dataset.id;
    const carrito = leerCarrito();
    const item = carrito.find(p => String(p.id) === String(id));
    if (!item) return;
    cambiarCantidad(id, (item.cantidad || 1) + 1);
    return;
  }
  if (target.closest('.btn-decrease')) {
    const id = target.closest('.btn-decrease').dataset.id;
    const carrito = leerCarrito();
    const item = carrito.find(p => String(p.id) === String(id));
    if (!item) return;
    if (item.cantidad <= 1) return; // no bajar de 1
    cambiarCantidad(id, item.cantidad - 1);
    return;
  }
  if (target.closest('.btn-remove')) {
    const id = target.closest('.btn-remove').dataset.id;
    if (!id) return;
    quitarProductoDelCarrito(id);
    return;
  }
}

function setupCartListDelegation() {
  const listaCont = document.getElementById('cart-items-list');
  if (!listaCont) return;
  listaCont.removeEventListener('click', cartListClickHandler);
  listaCont.addEventListener('click', cartListClickHandler);
}

/* ---------- controles del offcanvas ---------- */
function setupOffcanvasControls() {
  const btnVaciar = document.getElementById('cart-clear-btn');
  const btnPagar = document.getElementById('cart-checkout-btn');
  if (btnVaciar) btnVaciar.addEventListener('click', () => {
    if (confirm('¿Deseas vaciar el carrito?')) vaciarCarrito();
  });
  if (btnPagar) btnPagar.addEventListener('click', async () => {
    if (leerCarrito().length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    const confirmacion = confirm('Serás redirigido a un asesor de VerdeMont para finalizar tu compra por WhatsApp. ¿Deseas continuar?');
    if (confirmacion) {
      await finalizarPedido();
    }
  });
}

/* ---------- inicialización al cargar DOM ---------- */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    actualizarBadge();
    renderCarritoOffcanvas();
    setupCartListDelegation();
    setupOffcanvasControls();
  }, 50);
});

/* ---------- exponer funciones globalmente ---------- */
window.agregarProductoAlCarrito = agregarProductoAlCarrito;
window.quitarProductoDelCarrito = quitarProductoDelCarrito;
window.cambiarCantidad = cambiarCantidad;
window.vaciarCarrito = vaciarCarrito;
window.leerCarrito = leerCarrito;
