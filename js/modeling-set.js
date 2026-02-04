/* js/modeling-set.js - Lógica para el slider de fotografías */

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.photo-track');
    const slides = Array.from(document.querySelectorAll('.photo-slide'));
    const nextBtn = document.querySelector('.mod-btn.next');
    const prevBtn = document.querySelector('.mod-btn.prev');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let autoSlideInterval;

    /**
     * Actualiza la posición del track para mostrar el slide actual.
     */
    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
        });
    }

    /**
     * Avanza al siguiente slide.
     */
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }

    /**
     * Retrocede al slide anterior.
     */
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }

    /**
     * Inicia el desplazamiento automático.
     */
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 4500);
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
            startAutoSlide(); // Reiniciar el timer al interactuar
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide(); // Reiniciar el timer al interactuar
        });
    }

    // Pausar auto-slide cuando el usuario interactúa con la imagen
    const photoContainer = document.querySelector('.photo-container');
    if (photoContainer) {
        photoContainer.addEventListener('mouseenter', stopAutoSlide);
        photoContainer.addEventListener('mouseleave', startAutoSlide);
    }

    // Inicializar
    startAutoSlide();
    updateSlider();
});
