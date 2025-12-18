(function() {
  let lastScroll = window.scrollY || 0;
  const wrapper = document.querySelector('.header-wrapper');
  if (!wrapper) return;

  let ticking = false;
  const delta = 5;

  function onScroll() {
    const current = window.scrollY || 0;

    if (Math.abs(current - lastScroll) <= delta) {
      ticking = false;
      return;
    }

    if (current > lastScroll && current > 120) {
      wrapper.classList.add('header--hidden');
    } else {
      wrapper.classList.remove('header--hidden');
    }

    lastScroll = current;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  });

})();
