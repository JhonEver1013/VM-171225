// js/carrusel.js

document.addEventListener("DOMContentLoaded", function() {
  const carrusel = document.querySelector(".topVentasInner");
  const elementos = carrusel.querySelectorAll(".modelosfot");
  const numeroDeElementos = elementos.length;

  if (numeroDeElementos > 0) {
    // Clonar todos los elementos y agregarlos al final para el bucle
    elementos.forEach(el => {
      const clon = el.cloneNode(true);
      carrusel.appendChild(clon);
    });

    // Calcular la duración de la animación en función del número de elementos
    // (2 segundos por elemento, por ejemplo)
    const duracion = numeroDeElementos * 2;
    carrusel.style.setProperty('--scroll-duration', `${duracion}s`);
  }
});
