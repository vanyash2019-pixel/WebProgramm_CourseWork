document.addEventListener('DOMContentLoaded', () => {
    const userRaw = localStorage.getItem('currentUser');
    const mainBlock = document.getElementById('lk-main-block');
    
    // 1. Проверяем, авторизован ли пользователь
    if (!userRaw) {
        if (mainBlock) {
            mainBlock.innerHTML = `
                <div class="access-denied">
                    <h2 style="font-size: 26px; color: #cc0000; margin-bottom: 15px; font-weight:700;">ДОСТУП ОГРАНИЧЕН</h2>
                    <p style="margin-bottom: 25px; color: #666; font-size: 15px;">Для просмотра личного кабинета необходимо авторизоваться на сайте.</p>
                    <a href="auth.html" style="color: #ffffff; background: #cc0000; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 13px; display: inline-block; letter-spacing:0.5px;">Войти в аккаунт</a>
                </div>
            `;
        }
        return;
    }

    const sessionUser = JSON.parse(userRaw);
    const API_URL = `http://localhost:3000/users/${sessionUser.id}`;

    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const phoneInput = document.getElementById('user-phone');
    const roleDiv = document.getElementById('user-role');
    const profileForm = document.getElementById('profile-form');

    // Переменная для хранения текущего пароля (чтобы не затереть его при обновлении)
    let userPasswordBackup = "";

    // 2. Подгружаем актуальные данные с json-server в инпуты формы
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Ошибка сети');
            return res.json();
        })
        .then(userData => {
            nameInput.value = userData.name || '';
            emailInput.value = userData.email || '';
            phoneInput.value = userData.phone || '';
            roleDiv.textContent = userData.role === 'admin' ? 'Администратор' : 'Клиент ЕГДС';
            
            // Сохраняем пароль, так как мы его не меняем этой формой
            userPasswordBackup = userData.password;
        })
        .catch(err => {
            console.error('Не удалось загрузить профиль с сервера:', err);
            alert('Ошибка загрузки данных с сервера. Возможно, json-server не запущен.');
        });

    // 3. Обработка отправки формы (Сохранение изменений)
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedName = nameInput.value.trim();
            const updatedEmail = emailInput.value.trim().toLowerCase();
            const updatedPhone = phoneInput.value.trim();

            try {
                // Дополнительная проверка на уникальность Email, если пользователь решил его изменить
                const checkResponse = await fetch('http://localhost:3000/users');
                const allUsers = await checkResponse.json();

                // Ищем, занят ли email кем-то другим (кроме текущего пользователя)
                const emailConflict = allUsers.some(u => u.email === updatedEmail && u.id !== sessionUser.id);
                if (emailConflict) {
                    alert('Этот E-mail уже используется другим пользователем!');
                    return;
                }

                // Формируем измененный объект пользователя (сохраняя старый пароль и роль)
                const updatedData = {
                    id: sessionUser.id,
                    name: updatedName,
                    email: updatedEmail,
                    phone: updatedPhone,
                    password: userPasswordBackup,
                    role: sessionUser.role
                };

                // Отправляем изменения методом PUT
                const response = await fetch(API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    // Перезаписываем сессию в localStorage, чтобы имя и почта обновились в системе
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: updatedData.id,
                        name: updatedData.name,
                        email: updatedData.email,
                        role: updatedData.role
                    }));

                    // Если на странице подключен auth.js и функция доступна — перерисовываем шапку сайта
                    if (typeof updateAuthHeader === 'function') {
                        updateAuthHeader();
                    }

                    alert('Данные профиля успешно обновлены!');
                } else {
                    alert('Не удалось сохранить данные на сервере.');
                }

            } catch (error) {
                console.error('Ошибка при обновлении профиля:', error);
                alert('Произошла ошибка при связях с сервером.');
            }
        });
    }

    // 4. Обработчик кнопки выхода внутри ЛК
    const internalLogoutBtn = document.getElementById('lk-internal-logout');
    if (internalLogoutBtn) {
        internalLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            alert('Вы вышли из профиля.');
            window.location.href = 'index.html';
        });
    }
});