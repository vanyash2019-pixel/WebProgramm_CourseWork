document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalImg = document.getElementById('modal-img');
    const modalPrice = document.getElementById('modal-price');
    const modalSpecs = document.getElementById('modal-specs');
    const modalToCartBtn = document.getElementById('modal-to-cart-btn');

    let currentItem = null;

    document.addEventListener('click', async (e) => {
        const detailsBtn = e.target.closest('.btn-details');
        if (detailsBtn) {
            const card = detailsBtn.closest('.b-services-card-horizontal');
            const id = card.getAttribute('data-id');

            try {
                const response = await fetch(`http://localhost:3000/products/${id}`);
                const product = await response.json();

                currentItem = product;

                modalTitle.textContent = product.name;
                modalImg.src = product.img;
                modalPrice.textContent = parseInt(product.price).toLocaleString() + ' руб.';
                
                modalSpecs.innerHTML = '';
                product.features.forEach(feat => {
                    const li = document.createElement('li');
                    li.textContent = feat;
                    modalSpecs.appendChild(li);
                });

                modal.style.display = 'flex';
            } catch (error) {
                console.error('Ошибка получения данных товара с сервера:', error);
            }
            return;
        }

        const addToCartBtn = e.target.closest('.buy-btn-catalog');
        if (addToCartBtn) {
            const card = addToCartBtn.closest('.b-services-card-horizontal');
            const product = {
                id: card.getAttribute('data-id'),
                name: card.getAttribute('data-name'),
                price: card.getAttribute('data-price'),
                img: card.getAttribute('data-img')
            };
            addToCart(product);
        }
    });

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.id === product.id);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Товар успешно добавлен в корзину!');
        window.location.href = 'card.html'; // Перенаправит пользователя на страницу корзины
    }

    modalToCartBtn.addEventListener('click', () => {
        if (currentItem) {
            addToCart(currentItem);
            modal.style.display = 'none';
        }
    });
});