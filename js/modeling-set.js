/* js/modeling-set.js - Lógica actualizada para el rediseño de fotografías */

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.photo-track');
    const frames = Array.from(document.querySelectorAll('.photo-frame'));
    const nextBtn = document.querySelector('.mod-btn.next');
    const prevBtn = document.querySelector('.mod-btn.prev');

    if (!track || frames.length === 0) return;

    let currentIndex = 0;
    let autoSlideInterval;

    /**
     * Actualiza la posición del track para mostrar el frame actual.
     */
    function updateSlider() {
        // Desplazamos el track
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Opcional: Podríamos añadir una clase 'active' si queremos efectos extra
        frames.forEach((frame, index) => {
            if (index === currentIndex) {
                frame.style.opacity = "1";
            } else {
                frame.style.opacity = "0.8"; // Ligera transparencia a los que no están
            }
        });
    }

    /**
     * Avanza al siguiente frame.
     */
    function nextSlide() {
        currentIndex = (currentIndex + 1) % frames.length;
        updateSlider();
    }

    /**
     * Retrocede al frame anterior.
     */
    function prevSlide() {
        currentIndex = (currentIndex - 1 + frames.length) % frames.length;
        updateSlider();
    }

    /**
     * Inicia el desplazamiento automático.
     */
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    /**
     * Detiene el desplazamiento automático.
     */
    function stopAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
    }

    // Eventos de botones
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });
    }

    // Pausar auto-slide al pasar el mouse por el viewport
    const viewport = document.querySelector('.photo-viewport');
    if (viewport) {
        viewport.addEventListener('mouseenter', stopAutoSlide);
        viewport.addEventListener('mouseleave', startAutoSlide);
    }

    // Inicializar
    updateSlider();
    startAutoSlide();
});
