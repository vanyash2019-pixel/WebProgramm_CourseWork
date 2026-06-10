// ==================== BURGER MENU (финальная чистая версия) ====================
document.addEventListener('DOMContentLoaded', function() {
    const burgerBtn = document.getElementById('burger-btn');
    if (!burgerBtn) return;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    document.body.appendChild(overlay);

    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-full-menu';
    document.body.appendChild(mobileMenu);

    function buildMobileMenu() {
        const isEn = document.body.classList.contains('lang-en');

        mobileMenu.innerHTML = `
            <div class="mobile-menu-header">
                <button class="mobile-menu-close">&times;</button>
            </div>

            <div class="mobile-menu-content">

                <!-- КАТАЛОГ ОБОРУДОВАНИЯ -->
                <div class="mobile-menu-section">
                    <div class="mobile-menu-title has-arrow" data-toggle="catalog">
                        <span>${isEn ? 'EQUIPMENT CATALOG' : 'КАТАЛОГ ОБОРУДОВАНИЯ'}</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="mobile-submenu" id="catalog">
                        <a href="avtomatika.html">${isEn ? 'Access Automation' : 'Автоматика проезда'}</a>
                        <a href="radioupravlenie.html">${isEn ? 'Radio Control' : 'Радиоуправление'}</a>
                        <a href="svobodnyy-vyezd.html">${isEn ? 'Free Exit' : 'Свободный выезд'}</a>
                        <a href="full-catalog.html">${isEn ? 'Full Catalog' : 'Полный каталог'}</a>
                    </div>
                </div>
          <div class="mobile-menu-divider strong"></div>
                <!-- КОРЗИНА -->
                <div class="mobile-menu-section">
                    <a href="card.html" class="mobile-menu-title">${isEn ? 'CART' : 'КОРЗИНА'}</a>
                </div>
          <div class="mobile-menu-divider strong"></div>
                <!-- ИЗБРАННОЕ -->
                <div class="mobile-menu-section">
                    <a href="favorites.html" class="mobile-menu-title">${isEn ? 'FAVORITES' : 'ИЗБРАННОЕ'}</a>
                </div>
          <div class="mobile-menu-divider strong"></div>
                <!-- НАСТРОЙКИ (теперь раскрывающиеся) -->
                <div class="mobile-menu-section">
                    <div class="mobile-menu-title has-arrow" data-toggle="settings">
                        <span>${isEn ? 'SETTINGS' : 'НАСТРОЙКИ'}</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="mobile-submenu" id="settings">
                        <a href="#" id="mobile-theme-dark">${isEn ? 'Dark theme' : 'Тёмная тема'}</a>
                        <a href="#" id="mobile-theme-light">${isEn ? 'Light theme' : 'Светлая тема'}</a>
                        <a href="#" id="mobile-theme-terminal">${isEn ? 'Terminal theme' : 'Терминал тема'}</a>
                        <a href="#" id="mobile-lang-ru">${isEn ? 'Russian' : 'Русский язык'}</a>
                        <a href="#" id="mobile-lang-en">${isEn ? 'English' : 'Английский язык'}</a>
                        <a href="#" id="mobile-font-normal">A ${isEn ? 'Normal font' : 'Обычный шрифт'}</a>
                        <a href="#" id="mobile-font-large">A+ ${isEn ? 'Medium font' : 'Средний шрифт'}</a>
                        <a href="#" id="mobile-font-xlarge">A++ ${isEn ? 'Large font' : 'Большой шрифт'}</a>
                    </div>
                </div>

                <div class="mobile-menu-divider strong"></div>

                <!-- КАБИНЕТ -->
                <div class="mobile-menu-section cabinet-section" id="mobile-cabinet">
                    <!-- Подставляется через JS -->
                </div>

            </div>
        `;

        addToggleHandlers();
        updateMobileCabinet();
        initMobileSettings();
    }

    function addToggleHandlers() {
        mobileMenu.querySelectorAll('.mobile-menu-title.has-arrow').forEach(title => {
            title.addEventListener('click', () => {
                const targetId = title.getAttribute('data-toggle');
                const submenu = document.getElementById(targetId);
                if (submenu) {
                    submenu.classList.toggle('open');
                    title.classList.toggle('open');
                }
            });
        });
    }

    function updateMobileCabinet() {
        const container = mobileMenu.querySelector('#mobile-cabinet');
        if (!container) return;

        const userRaw = localStorage.getItem('currentUser');

        if (userRaw) {
            const user = JSON.parse(userRaw);
            container.innerHTML = `
                <a href="lk.html" class="mobile-cabinet-link">
                    <div class="cabinet-icon"><img src="assets/iconoir_profile-circle.png" alt=""></div>
                    <div>
                        <div class="cabinet-name">${user.name}</div>
                        <div class="cabinet-desc">${document.body.classList.contains('lang-en') ? 'Personal Account' : 'Личный кабинет'}</div>
                    </div>
                </a>
            `;
        } else {
            container.innerHTML = `
                <a href="auth.html" class="mobile-cabinet-link">
                    <div class="cabinet-icon"><img src="assets/iconoir_profile-circle.png" alt=""></div>
                    <div>
                        <div class="cabinet-name">${document.body.classList.contains('lang-en') ? 'ACCOUNT' : 'КАБИНЕТ'}</div>
                        <div class="cabinet-desc">${document.body.classList.contains('lang-en') ? 'Client Login' : 'Вход для клиентов'}</div>
                    </div>
                </a>
            `;
        }
    }

    function initMobileSettings() {
        // Темы
        const dark = mobileMenu.querySelector('#mobile-theme-dark');
        const light = mobileMenu.querySelector('#mobile-theme-light');
        const terminal = mobileMenu.querySelector('#mobile-theme-terminal');

        if (dark) dark.addEventListener('click', e => { e.preventDefault(); setTheme('dark'); });
        if (light) light.addEventListener('click', e => { e.preventDefault(); setTheme('light'); });
        if (terminal) terminal.addEventListener('click', e => { e.preventDefault(); setTheme('terminal'); });

        // Языки
        const langRu = mobileMenu.querySelector('#mobile-lang-ru');
        const langEn = mobileMenu.querySelector('#mobile-lang-en');

        if (langRu) langRu.addEventListener('click', e => { e.preventDefault(); switchLanguage('ru'); });
        if (langEn) langEn.addEventListener('click', e => { e.preventDefault(); switchLanguage('en'); });

        // Шрифты
        const fontNormal = mobileMenu.querySelector('#mobile-font-normal');
        const fontLarge = mobileMenu.querySelector('#mobile-font-large');
        const fontXLarge = mobileMenu.querySelector('#mobile-font-xlarge');

        if (fontNormal) fontNormal.addEventListener('click', e => { e.preventDefault(); setFontSize('normal'); });
        if (fontLarge) fontLarge.addEventListener('click', e => { e.preventDefault(); setFontSize('large'); });
        if (fontXLarge) fontXLarge.addEventListener('click', e => { e.preventDefault(); setFontSize('xlarge'); });
    }

    // Открытие меню
    burgerBtn.addEventListener('click', function() {
        buildMobileMenu();
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        burgerBtn.style.opacity = '0';
        burgerBtn.style.pointerEvents = 'none';
    });

    function closeMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        burgerBtn.style.opacity = '1';
        burgerBtn.style.pointerEvents = 'auto';
    }

    overlay.addEventListener('click', closeMenu);

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('mobile-menu-close')) closeMenu();
        if (e.target.closest('.mobile-full-menu a')) closeMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
});