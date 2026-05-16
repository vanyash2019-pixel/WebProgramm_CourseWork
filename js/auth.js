 document.addEventListener('DOMContentLoaded', () => {
        const tabs = document.querySelectorAll('.tab-btn');
        const forms = document.querySelectorAll('.auth-form');

        // Логика переключения табов
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));

                tab.classList.add('active');
                const targetFormId = tab.getAttribute('data-tab');
                document.getElementById(targetFormId).classList.add('active');
            });
        });

        // Заглушки отправки
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Вход...');
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Регистрация...');
        });
    });