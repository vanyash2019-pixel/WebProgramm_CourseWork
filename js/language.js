// js/language.js
(function() {
    function init() {
        const saved = localStorage.getItem('site-lang') || 'ru';
        setLanguage(saved);
        
        document.getElementById('lang-ru')?.addEventListener('click', e => { e.preventDefault(); setLanguage('ru'); });
        document.getElementById('lang-en')?.addEventListener('click', e => { e.preventDefault(); setLanguage('en'); });
    }

    window.setLanguage = function(lang) {
        document.body.classList.remove('lang-ru', 'lang-en');
        document.body.classList.add('lang-' + lang);
        localStorage.setItem('site-lang', lang);
        document.documentElement.lang = lang;
        
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const active = document.getElementById('lang-' + lang);
        if (active) active.classList.add('active');
        
        // Переключаем placeholder у полей ввода
        document.querySelectorAll('[data-placeholder-ru][data-placeholder-en]').forEach(input => {
            input.placeholder = lang === 'ru' ? input.getAttribute('data-placeholder-ru') : input.getAttribute('data-placeholder-en');
        });
        
        // === ОБНОВЛЕНИЕ SELECT ЭЛЕМЕНТОВ ===
        document.querySelectorAll('select option[data-ru][data-en]').forEach(option => {
            option.textContent = lang === 'ru' ? option.getAttribute('data-ru') : option.getAttribute('data-en');
        });
        
        // === ГЕНЕРАЦИЯ СОБЫТИЯ СМЕНЫ ЯЗЫКА ===
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();