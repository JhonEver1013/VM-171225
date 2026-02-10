/**
 * js/card-tilt.js
 * Implementación sutil del efecto CometCard (3D tilt) para las tarjetas de productos.
 */

(function() {
    function handleTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();

        // Coordenadas del ratón relativas a la tarjeta
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Centro de la tarjeta
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Cálculo de rotación (Intenso: máximo ~15 grados)
        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;

        // Aplicar transformación con perspectiva
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    function resetTilt(e) {
        const card = e.currentTarget;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    }

    function applyTiltToCards() {
        const cards = document.querySelectorAll('.producto, .card-tilt');
        cards.forEach(card => {
            // Evitar duplicar listeners
            if (card.dataset.tiltApplied === "true") return;

            card.addEventListener('mousemove', handleTilt);
            card.addEventListener('mouseleave', resetTilt);
            card.dataset.tiltApplied = "true";

            // Estilo inicial para asegurar suavidad (si no está en CSS)
            if (!card.style.transition) {
                card.style.transition = "transform 0.1s ease-out";
            }
            card.style.transformStyle = "preserve-3d";
        });
    }

    // Inicializar y observar cambios dinámicos (para productos cargados vía AJAX/JSON)
    function init() {
        applyTiltToCards();

        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                applyTiltToCards();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
