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
    // 1. Generar el PDF
    await generarPDF(carrito, subtotal);

    // 2. Redirigir a WhatsApp
    enviarWhatsApp(carrito, subtotal);

    // 3. Vaciar carrito opcionalmente o dejarlo para que el usuario vea
    // vaciarCarrito();
  } catch (error) {
    console.error('Error al finalizar el pedido:', error);
    alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
  }
}

/**
 * Genera un PDF profesional del pedido.
 */
async function generarPDF(carrito, total) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // -- Encabezado con Logo --
  try {
    const logoImg = "img/LogoVerdeMont.png";
    doc.addImage(logoImg, 'PNG', (pageWidth / 2) - 25, 10, 50, 50);
  } catch (e) {
    console.warn("No se pudo cargar el logo para el PDF", e);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 80, 20); // Un tono verde oscuro elegante
  doc.text("RESUMEN DE PEDIDO", pageWidth / 2, 70, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 20, 80, { align: "right" });

  doc.setLineWidth(0.5);
  doc.setDrawColor(20, 80, 20);
  doc.line(20, 85, pageWidth - 20, 85);

  // -- Tabla de Productos --
  let y = 95;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Producto", 20, y);
  doc.text("Cant.", 120, y);
  doc.text("P. Unit", 145, y);
  doc.text("Total", 175, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setLineWidth(0.1);

  carrito.forEach(item => {
    if (y > 270) { doc.addPage(); y = 20; }

    const itemTotal = item.precio * item.cantidad;

    // Dividir nombre si es muy largo
    const splitTitle = doc.splitTextToSize(item.nombre, 85);
    doc.text(splitTitle, 20, y);
    doc.text(item.cantidad.toString(), 120, y);
    doc.text(`$${item.precio.toLocaleString()}`, 145, y);
    doc.text(`$${itemTotal.toLocaleString()}`, 175, y);

    y += (splitTitle.length * 7) + 2;
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.line(20, y - 5, pageWidth - 20, y - 5);
    y += 5;
  });

  // -- Total --
  y += 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 80, 20);
  doc.text(`TOTAL A PAGAR: $${total.toLocaleString()}`, pageWidth - 20, y, { align: "right" });

  // -- Pie de página --
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Gracias por confiar en VerdeMont. Un asesor te contactará por WhatsApp.", pageWidth / 2, 285, { align: "center" });

  // Guardar PDF
  doc.save(`Pedido_VerdeMont_${Date.now()}.pdf`);
}

/**
 * Redirige al usuario a WhatsApp con una Factura Digital profesional en texto.
 */
function enviarWhatsApp(carrito, subtotal) {
  const numero = "573203168616";
  const fecha = new Date().toLocaleDateString();

  let mensaje = `🌿 *PEDIDO - VERDEMONT* 🌿\n`;
  mensaje += `------------------------------------------\n\n`;
  mensaje += `✅ *Resumen del Pedido:*\n`;

  carrito.forEach(item => {
    const itemTotal = item.precio * item.cantidad;
    mensaje += `▪ *${item.nombre}*\n`;
    mensaje += `   Cant: ${item.cantidad} x $${item.precio.toLocaleString()}\n`;
    mensaje += `   Total: *$${itemTotal.toLocaleString()}*\n\n`;
  });

  mensaje += `------------------------------------------\n`;
  mensaje += `💰 *TOTAL GENERAL: $${subtotal.toLocaleString()}*\n`;
  mensaje += `------------------------------------------\n\n`;
  mensaje += `¡Hola! Acabo de generar mi pedido y el PDF de la compra. Me gustaría finalizar el proceso. Quedo atento(a) para coordinar el pago y el envío. ✨`;

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
          <button type="button" class="btn btn-sm btn-dark ms-3 btn-remove" data-id="${String(item.id)}">Eliminar</button>
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
  const initCart = () => {
    actualizarBadge();
    renderCarritoOffcanvas();
    setupCartListDelegation();
    setupOffcanvasControls();
  };

  if (customElements.get('special-header')) {
    initCart();
  } else {
    customElements.whenDefined('special-header').then(initCart);
  }
});

/* ---------- exponer funciones globalmente ---------- */
window.agregarProductoAlCarrito = agregarProductoAlCarrito;
window.quitarProductoDelCarrito = quitarProductoDelCarrito;
window.cambiarCantidad = cambiarCantidad;
window.vaciarCarrito = vaciarCarrito;
window.leerCarrito = leerCarrito;
