export const initSlider = () => {
    const sliderLine = document.querySelector('#js-line');
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');

    if (!sliderLine || slides.length === 0) return;

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;

    // Функция для перемещения ленты
    const setPosition = () => {
        sliderLine.style.transform = `translateX(${currentTranslate}px)`;
    };

    const changeSlide = (index) => {
        currentIndex = index;
        // Ограничения
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > slides.length - 1) currentIndex = slides.length - 1;

        // Плавный доводчик до точных координат
        sliderLine.style.transition = 'transform 0.4s ease-out';
        currentTranslate = currentIndex * -sliderWrapper.offsetWidth;
        prevTranslate = currentTranslate;
        setPosition();

        // Точки
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };

    // --- События ---

    const dragStart = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        
        // Убираем анимацию, чтобы лента мгновенно шла за рукой
        sliderLine.style.transition = 'none';
    };

    const dragMove = (e) => {
        if (!isDragging) return;
        
        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = currentX - startX;
        
        // Двигаем в реальном времени
        currentTranslate = prevTranslate + diff;
        setPosition();
    };

    const dragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const movedBy = currentTranslate - prevTranslate;

        // ЛОГИКА МАГНИТА:
        // Если протащили больше чем на 1/4 ширины окна — листаем
        const threshold = sliderWrapper.offsetWidth / 4;

        if (movedBy < -threshold && currentIndex < slides.length - 1) {
            currentIndex += 1;
        } else if (movedBy > threshold && currentIndex > 0) {
            currentIndex -= 1;
        }

        // Возвращаем плавность и фиксируем слайд
        changeSlide(currentIndex);
    };

    // Слушатели для мыши и тача
    sliderWrapper.addEventListener('mousedown', dragStart);
    sliderWrapper.addEventListener('touchstart', dragStart, {passive: true});

    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, {passive: false});

    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);

    // Точки
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => changeSlide(i));
    });

    // При изменении размера окна пересчитываем позицию (чтобы не ломалось)
    window.addEventListener('resize', () => changeSlide(currentIndex));
};