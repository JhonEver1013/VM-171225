/* js/animated-testimonials.js */
document.addEventListener('DOMContentLoaded', () => {
    const testimonials = [
        {
            quote: "Nuestra colección de anillos fusiona la tradición artesanal con el brillo eterno de las esmeraldas.",
            name: "Artesanía Tradicional",
            designation: "Esmeraldas Colombianas",
            src: "img/14k Emerald Ring with Halo Diamonds.jpg"
        },
        {
            quote: "Cada pieza es una promesa de elegancia y un tributo a la belleza natural de Colombia.",
            name: "Elegancia Natural",
            designation: "Promesa de Calidad",
            src: "img/Anillodiseñocuadro.jpg"
        },
        {
            quote: "Descubre diseños que capturan la esencia del lujo contemporáneo.",
            name: "Lujo Contemporáneo",
            designation: "Diseño Exclusivo",
            src: "img/anilloToro.jpeg"
        },
        {
            quote: "Creados para ser el centro de todas las miradas en cada ocasión inolvidable.",
            name: "Centro de Atracción",
            designation: "Momentos Inolvidables",
            src: "img/dobleanisom.jpg"
        },
        {
            quote: "La fusión perfecta entre el oro, la plata y el verde más profundo de nuestras tierras.",
            name: "Esencia Verde",
            designation: "Herencia Montañera",
            src: "img/esmeani.jpg"
        }
    ];

    const container = document.querySelector('.animated-testimonials-container');
    if (!container) return;

    let activeIndex = 0;
    let rotating = false;

    const render = () => {
        container.innerHTML = `
            <div class="at-wrapper">
                <div class="at-image-section">
                    <div class="at-image-stack">
                        ${testimonials.map((t, i) => `
                            <div class="at-image-frame ${i === activeIndex ? 'active' : ''}"
                                 style="--index: ${i}; --offset: ${i - activeIndex}; --total: ${testimonials.length};">
                                <img src="${t.src}" alt="${t.name}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="at-content-section">
                    <div class="at-text-content">
                        <p class="at-quote">"${testimonials[activeIndex].quote}"</p>
                        <h3 class="at-name">${testimonials[activeIndex].name}</h3>
                        <p class="at-designation">${testimonials[activeIndex].designation}</p>
                    </div>
                    <div class="at-nav">
                        <button class="at-btn prev"><i class="fas fa-arrow-left"></i></button>
                        <button class="at-btn next"><i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
            </div>
        `;

        container.querySelector('.at-btn.prev').addEventListener('click', prev);
        container.querySelector('.at-btn.next').addEventListener('click', next);
    };

    const next = () => {
        if (rotating) return;
        rotating = true;
        activeIndex = (activeIndex + 1) % testimonials.length;
        updateUI();
        setTimeout(() => rotating = false, 500);
    };

    const prev = () => {
        if (rotating) return;
        rotating = true;
        activeIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
        updateUI();
        setTimeout(() => rotating = false, 500);
    };

    const updateUI = () => {
        const frames = container.querySelectorAll('.at-image-frame');
        frames.forEach((frame, i) => {
            frame.classList.toggle('active', i === activeIndex);
            frame.style.setProperty('--offset', i - activeIndex);
        });

        const textContent = container.querySelector('.at-text-content');
        textContent.style.opacity = '0';
        textContent.style.transform = 'translateY(10px)';

        setTimeout(() => {
            container.querySelector('.at-quote').textContent = `"${testimonials[activeIndex].quote}"`;
            container.querySelector('.at-name').textContent = testimonials[activeIndex].name;
            container.querySelector('.at-designation').textContent = testimonials[activeIndex].designation;
            textContent.style.opacity = '1';
            textContent.style.transform = 'translateY(0)';
        }, 250);
    };

    render();
});
