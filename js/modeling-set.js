document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.modeling-set');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.photo-track');
        if (!track) return;

        const frames = Array.from(track.children);
        const nextBtn = carousel.querySelector('.mod-btn.next');
        const prevBtn = carousel.querySelector('.mod-btn.prev');

        let currentIndex = 0;
        let isTransitioning = false;

        // Inicializar: solo el primero es active
        frames.forEach((frame, index) => {
            if (index === 0) {
                frame.classList.add('active');
            } else {
                frame.classList.remove('active', 'exit');
            }
        });

        function updateCarousel(newIndex, direction) {
            if (isTransitioning) return;
            isTransitioning = true;

            const currentFrame = frames[currentIndex];
            const nextFrame = frames[newIndex];

            // Animación de salida para el actual
            currentFrame.classList.remove('active');
            currentFrame.classList.add('exit');

            // Preparar el siguiente
            nextFrame.classList.add('active');

            // Limpiar después de la transición
            setTimeout(() => {
                currentFrame.classList.remove('exit');
                isTransitioning = false;
            }, 800); // Coincide con el tiempo de CSS

            currentIndex = newIndex;
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const nextIndex = (currentIndex + 1) % frames.length;
                updateCarousel(nextIndex, 'next');
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const prevIndex = (currentIndex - 1 + frames.length) % frames.length;
                updateCarousel(prevIndex, 'prev');
            });
        }

        // Auto-play opcional
        /*
        setInterval(() => {
            const nextIndex = (currentIndex + 1) % frames.length;
            updateCarousel(nextIndex, 'next');
        }, 5000);
        */
    });
});
