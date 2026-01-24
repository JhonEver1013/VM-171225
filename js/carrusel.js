document.addEventListener('DOMContentLoaded', () => {
    const topVentas = document.querySelector('.topVentas');
    const inner = document.querySelector('.topVentasInner');
    const images = document.querySelectorAll('.modelosfot');

    if (!topVentas || !inner || images.length === 0) {
        console.error('Elementos del carrusel no encontrados.');
        return;
    }

    let currentIndex = 0;
    let direction = 1; // 1 for right, -1 for left
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    const imageWidth = images[0].clientWidth;
    const totalWidth = inner.scrollWidth;
    const containerWidth = topVentas.clientWidth;

    function setPositionByIndex() {
        currentTranslate = currentIndex * -imageWidth;
        prevTranslate = currentTranslate;
        inner.style.transform = `translateX(${currentTranslate}px)`;
    }

    function moveCarousel() {
        if (currentIndex >= images.length - (containerWidth / imageWidth) && direction === 1) {
            direction = -1; // Change direction to left
        } else if (currentIndex <= 0 && direction === -1) {
            direction = 1; // Change direction to right
        }

        currentIndex += direction;
        setPositionByIndex();
    }

    // Automatic sliding (optional, can be triggered by user)
    // setInterval(moveCarousel, 3000);

    // Touch events
    topVentas.addEventListener('touchstart', touchStart);
    topVentas.addEventListener('touchend', touchEnd);
    topVentas.addEventListener('touchmove', touchMove);

    // Mouse events
    topVentas.addEventListener('mousedown', touchStart);
    topVentas.addEventListener('mouseup', touchEnd);
    topVentas.addEventListener('mouseleave', touchEnd);
    topVentas.addEventListener('mousemove', touchMove);

    function touchStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        inner.style.transition = 'none';
    }

    function touchEnd() {
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;

        if (movedBy < -100 && currentIndex < images.length - 1) {
            currentIndex += 1;
        }

        if (movedBy > 100 && currentIndex > 0) {
            currentIndex -= 1;
        }

        setPositionByIndex();
        inner.style.transition = 'transform 0.3s ease-out';
    }

    function touchMove(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
            inner.style.transform = `translateX(${currentTranslate}px)`;
        }
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
});
