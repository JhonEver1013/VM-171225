/* header-footer.js (pegar todo este archivo) */

class specialHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="header-wrapper">

      <!-- BARRA SUPERIOR -->
      <header class="navbar">
        <div class="container-fluid">

          <!--Logo VM-->
          <a class="logoVM" href="#"><img src="logoBrillo.gif" alt="logo"></a>

          <!--CUADRO DE BUSQUEDA-->
          <form class="d-flex" role="search">
            <input class="form-control" type="search" placeholder="Buscar" aria-label="Buscar">
          </form>

          <div class="icon">
            <!-- icono favorito (botón que abre offcanvas) -->
            <button id="fav-button" class="navbar-toggler position-relative d-inline-block" type="button"
                    data-bs-toggle="offcanvas" data-bs-target="#offcanvasFavorites"
                    aria-controls="offcanvasFavorites" aria-label="Favoritos">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="iconFav" viewBox="0 0 16 16">
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01z"/>
              </svg>
              <span id="fav-badge"
                    style="display:none; position:absolute; top:-6px; right:-6px; background:#dc3545; color:white; border-radius:50%; padding:2px 6px; font-size:12px;">0</span>
            </button>

            <!-- Ícono de carrito (botón que abre offcanvas) -->
            <button id="cart-button" class="navbar-toggler position-relative" type="button"
                    data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar"
                    aria-controls="offcanvasDarkNavbar" aria-label="Carrito">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="cart" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5"/>
                <path d="M3.102 4l1.313 7h8.17l1.313-7z"/>
                <path d="M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
              </svg>
              <span id="cart-badge"
                    style="display:none; position:absolute; top:-6px; right:-6px; background:#dc3545; color:white; border-radius:50%; padding:2px 6px; font-size:12px;">0</span>
            </button>

          </div>
        </div>
      </header>

      <!-- OFFCANVAS (MENÚ CARRITO) -->
      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
        <div class="offcanvas-header">
          <h3 id="offcanvasDarkNavbarLabel">Mi Carrito</h3>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
        </div>

        <div class="offcanvas-body">
          <div id="cart-items-list" class="mb-3"><!-- carrito.js renderiza aquí --></div>
          <div id="cart-subtotal" class="mt-2"></div>
          <div class="mt-3 d-flex gap-2">
            <button id="cart-clear-btn" class="btn btn-dark">Vaciar carrito</button>
            <button id="cart-checkout-btn" class="btn btn-success">Pagar pedido</button>
          </div>
        </div>
      </div>

      <!-- OFFCANVAS (MENÚ FAVORITOS) -->
      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasFavorites" aria-labelledby="offcanvasFavoritesLabel">
        <div class="offcanvas-header">
          <h3 id="offcanvasFavoritesLabel">Mis Favoritos</h3>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
        </div>

        <div class="offcanvas-body">
          <div id="fav-items-list" class="mb-3"><!-- favoritos.js renderiza aquí --></div>
          <div id="fav-empty-msg" style="display:none; color: white;">No tienes productos favoritos aún.</div>
        </div>
      </div>

      <!-- NAV horizontal -->
      <nav class="header2">
        <section class="nav-blue">
          <a href="index.html">Inicio</a>
          <a href="Anillos.html">Anillos</a>
          <a href="formularioContactanos.html">Contáctanos</a>
          <a href="quiénesSomos.html">Quiénes Somos</a>
        </section>
      </nav>

    </div>
    `;

    /* --- MOVEMOS LOS OFFCANVAS AL <body> PARA EVITAR PROBLEMAS DE STACKING --- */
    // Ejecutar con setTimeout(,0) para asegurarnos de que el DOM interno exista.
    setTimeout(() => {
      ['#offcanvasDarkNavbar', '#offcanvasFavorites'].forEach(id => {
        const off = this.querySelector(id);
        if (off && off.parentElement !== document.body) {
          document.body.appendChild(off);
        }
      });
    }, 0);
  }
}

/* FOOTER */
class specialfooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer">
        <div class="column1">
          <img src="logoBrillo.gif" alt="logoBrillo">
          <p>Siguenos en</p>
          <div class="redes">
            <a href="#" class="facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" class="whatsapp"><i class="fa-brands fa-whatsapp"></i></a>
            <a href="#" class="instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="#" class="twitter"><i class="fa-brands fa-twitter"></i></a>
          </div>
        </div>
        <div class="column2">
          <h3>Tienda en Bogotá</h3>
          <p>Cra 78b # 39a 57 Sur</p>
          <p>PBX: 60(2)8333022</p>
          <p>Info@verdemont.com.co</p>
        </div>
        <div class="column3">
          <h3>Links</h3>
          <li><a href="formularioContactanos.html">Contactanos</a></li>
          <li><a href="quiénesSomos.html">Quienes somos</a></li>
        </div>
        <div class="column4">
          <p>Desarrollado con dedicación por</p>
          <br><br>
          <img src="img/digitalpixellogo.png" alt="digitalpixellogo">
        </div>
      </footer>
    `;
  }
}

customElements.define('special-header', specialHeader);
customElements.define('special-footer', specialfooter);
