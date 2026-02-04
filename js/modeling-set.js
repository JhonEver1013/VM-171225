
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.camera-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.cam-btn.next');
    const prevButton = document.querySelector('.cam-btn.prev');
    const shutterBtn = document.querySelector('.shutter-btn');

    let currentIndex = 0;

    const updateSlider = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        // Update active class
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    };

    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    shutterBtn.addEventListener('click', () => {
        // Flash effect
        const viewfinder = document.querySelector('.camera-viewfinder');
        viewfinder.style.transition = 'none';
        viewfinder.style.backgroundColor = '#fff';

        setTimeout(() => {
            viewfinder.style.transition = 'background-color 0.5s';
            viewfinder.style.backgroundColor = '#000';
            nextSlide();
        }, 50);
    });

    // Auto play
    let autoPlay = setInterval(nextSlide, 5000);

    const resetAutoPlay = () => {
        clearInterval(autoPlay);
        autoPlay = setInterval(nextSlide, 5000);
    };

    [nextButton, prevButton, shutterBtn].forEach(btn => {
        btn.addEventListener('click', resetAutoPlay);
    });

    // Handle resize
    window.addEventListener('resize', updateSlider);

    // Initial state
    updateSlider();
});
