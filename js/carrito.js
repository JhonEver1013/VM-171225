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
  if (!window.jspdf) {
    console.error("jsPDF no está cargado");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Función para cargar imagen
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  // -- Marco Decorativo --
  doc.setDrawColor(20, 80, 20);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, doc.internal.pageSize.getHeight() - 10);
  doc.setLineWidth(0.2);
  doc.rect(7, 7, pageWidth - 14, doc.internal.pageSize.getHeight() - 14);

  // -- Encabezado con Logo --
  try {
    const logoImg = await loadImage("img/LogoVerdeMont.png");
    doc.addImage(logoImg, 'PNG', (pageWidth / 2) - 25, 15, 50, 38);
  } catch (e) {
    console.warn("No se pudo cargar el logo para el PDF", e);
  }

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 80, 20);
  doc.text("COTIZACIÓN DE COMPRA", pageWidth / 2, 62, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, pageWidth - 20, 72, { align: "right" });
  doc.text(`Documento No: VM-${Date.now().toString().slice(-6)}`, pageWidth - 20, 77, { align: "right" });

  doc.setLineWidth(0.5);
  doc.setDrawColor(20, 80, 20);
  doc.line(20, 82, pageWidth - 20, 82);

  // -- Tabla de Productos --
  let y = 95;

  // Fondo para el encabezado de la tabla
  doc.setFillColor(240, 245, 240);
  doc.rect(20, y - 5, pageWidth - 40, 8, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 80, 20);

  // Encabezados de tabla
  doc.text("PRODUCTO", 25, y);
  doc.text("CANT.", 120, y, { align: "center" });
  doc.text("P. UNITARIO", 150, y, { align: "right" });
  doc.text("TOTAL", 185, y, { align: "right" });

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);

  carrito.forEach(item => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const itemTotal = (item.precio || 0) * (item.cantidad || 1);

    // Nombre del producto con ajuste de línea
    const splitTitle = doc.splitTextToSize(item.nombre || "Producto", 85);
    doc.text(splitTitle, 25, y);

    // Valores
    doc.text((item.cantidad || 1).toString(), 120, y, { align: "center" });
    doc.text(`$${(item.precio || 0).toLocaleString()}`, 150, y, { align: "right" });
    doc.text(`$${itemTotal.toLocaleString()}`, 185, y, { align: "right" });

    // Calcular siguiente Y basado en el texto dividido
    const nextY = y + (splitTitle.length * 6);

    // Línea divisoria suave
    doc.setDrawColor(230);
    doc.setLineWidth(0.1);
    doc.line(20, nextY - 2, pageWidth - 20, nextY - 2);

    y = nextY + 5;
  });

  // -- Resumen Final --
  if (y > 240) {
    doc.addPage();
    y = 30;
  }

  y += 10;
  doc.setLineWidth(0.5);
  doc.setDrawColor(20, 80, 20);
  doc.line(120, y, 185, y);

  y += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 80, 20);
  doc.text(`TOTAL A PAGAR:`, 120, y);
  doc.text(`$${total.toLocaleString()} COP`, 185, y, { align: "right" });

  // -- Pie de página --
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text("Este documento es un resumen de su intención de compra para ser finalizada vía WhatsApp.", pageWidth / 2, 280, { align: "center" });
  doc.text("VerdeMont - Joyería Artesanal Colombiana | Cra 78b # 39a 57 Sur, Bogotá", pageWidth / 2, 285, { align: "center" });

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
  mensaje += `💰 *TOTAL GENERAL: $${subtotal.toLocaleString()} COP*\n`;
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
        <div>$${(item.precio).toLocaleString()}</div>
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
    subtotalCont.innerHTML = `<h5>Subtotal: $${getSubtotal().toLocaleString()}</h5>`;
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

    const confirmacion = confirm('Serás redirigido a un asesor de VerdeMont para finalizar su compra por WhatsApp. ¿Deseas continuar?');
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
