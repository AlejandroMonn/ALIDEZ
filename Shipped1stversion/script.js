document.addEventListener('DOMContentLoaded', () => {
    // --- DATOS FALSOS ---
    const fakeStores = [
        { id: 1, name: "Tienda La Esquina Fresca", hours: "8am - 7pm", freeDelivery: true, theme: 'red-theme' },
        { id: 2, name: "Minimarket Doña Julia", hours: "9am - 8pm", freeDelivery: false, theme: 'green-theme' },
        { id: 3, name: "Abarrotes El Buen Sabor", hours: "7am - 6pm", freeDelivery: true, theme: 'red-theme' },
        { id: 4, name: "Super Vecino", hours: "8am - 9pm", freeDelivery: false, theme: 'green-theme' },
    ];

    const fakeProducts = {
        1: [ // Productos para Tienda La Esquina Fresca (id: 1)
            { id: 101, name: "Leche Entera Alquería 1lt", price: 4500, image: "https://via.placeholder.com/100?text=Leche", rating: 5, category: "Lácteos" },
            { id: 102, name: "Huevos AA x12", price: 7000, image: "https://via.placeholder.com/100?text=Huevos", rating: 4, category: "Huevos" },
            { id: 103, name: "Pan Tajado Bimbo", price: 5200, image: "https://via.placeholder.com/100?text=Pan", rating: 5, category: "Panadería" },
            { id: 104, name: "Arroz Diana 1kg", price: 3800, image: "https://via.placeholder.com/100?text=Arroz", rating: 4, category: "Granos" },
        ],
        2: [ // Productos para Minimarket Doña Julia (id: 2)
            { id: 201, name: "Gaseosa Postobón 1.5L", price: 3500, image: "https://via.placeholder.com/100?text=Gaseosa", rating: 4, category: "Bebidas" },
            { id: 202, name: "Papas Margarita Pollo", price: 2000, image: "https://via.placeholder.com/100?text=Papas", rating: 5, category: "Snacks" },
            { id: 203, name: "Jugo Hit Naranja 1L", price: 3200, image: "https://via.placeholder.com/100?text=Jugo", rating: 3, category: "Bebidas" },
        ],
        3: [ // Productos para Abarrotes El Buen Sabor (id: 3)
            { id: 301, name: "Café Sello Rojo 250g", price: 6000, image: "https://via.placeholder.com/100?text=Cafe", rating: 5, category: "Despensa" },
            { id: 302, name: "Aceite Premier 1L", price: 12000, image: "https://via.placeholder.com/100?text=Aceite", rating: 4, category: "Despensa" },
        ],
        4: [ // Productos para Super Vecino (id: 4)
             { id: 401, name: "Manzanas Rojas x3", price: 5000, image: "https://via.placeholder.com/100?text=Manzanas", rating: 4, category: "Frutas" },
             { id: 402, name: "Banano Criollo Libra", price: 1800, image: "https://via.placeholder.com/100?text=Banano", rating: 5, category: "Frutas" },
             { id: 403, name: "Tomate Chonto Libra", price: 2200, image: "https://via.placeholder.com/100?text=Tomate", rating: 4, category: "Verduras" },
        ]
    };

    // --- ESTADO DE LA APLICACIÓN ---
    let currentUser = {
        email: '',
        name: '',
        address: ''
    };
    let cart = [];
    let currentStoreId = null;

    // --- SELECTORES DE ELEMENTOS DEL DOM ---
    const screens = document.querySelectorAll('.screen');
    const emailForm = document.getElementById('email-form');
    const addressForm = document.getElementById('address-form');
    const storesGrid = document.getElementById('stores-grid');
    const productsGrid = document.getElementById('products-grid');
    const storeNameProducts = document.getElementById('store-name-products');
    const backToStoresBtn = document.getElementById('back-to-stores');
    
    const cartInfo = document.getElementById('cart-info');
    const cartInfoProducts = document.getElementById('cart-info-products');
    const cartIcon = document.getElementById('cart-icon');
    const cartIconProducts = document.getElementById('cart-icon-products');
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    const userNameDisplay = document.getElementById('user-name-display');
    const userNameDisplayProducts = document.getElementById('user-name-display-products');

    const sidebarSteps = document.querySelectorAll('.registration-sidebar .step');


    // --- FUNCIONES DE NAVEGACIÓN Y RENDERIZADO ---
    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        window.scrollTo(0, 0); // Scroll al inicio de la nueva pantalla
    }
    
    function updateSidebarStep(stepIndex) {
        sidebarSteps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else if (index < stepIndex) {
                 step.classList.add('completed'); // Opcional: marcar como completado
                 step.classList.remove('active');
            }
            else {
                step.classList.remove('active');
                step.classList.remove('completed');
            }
        });
    }


    function renderStores() {
        storesGrid.innerHTML = ''; // Limpiar tiendas anteriores
        fakeStores.forEach(store => {
            const storeCard = document.createElement('div');
            storeCard.classList.add('store-card', store.theme);
            storeCard.innerHTML = `
                ${store.freeDelivery ? '<span class="free-delivery">Free Delivery</span>' : ''}
                <h3>${store.name}</h3>
                <p><i class="fas fa-clock"></i> ${store.hours}</p>
                <button class="btn-store" data-store-id="${store.id}">Shop Now <i class="fas fa-arrow-right"></i></button>
            `;
            storeCard.querySelector('.btn-store').addEventListener('click', () => {
                currentStoreId = store.id;
                renderProducts(store.id);
                showScreen('product-list-screen');
            });
            storesGrid.appendChild(storeCard);
        });
    }

    function renderProducts(storeId) {
        const store = fakeStores.find(s => s.id === storeId);
        const products = fakeProducts[storeId] || [];
        storeNameProducts.textContent = `Productos de ${store.name}`;
        productsGrid.innerHTML = ''; // Limpiar productos anteriores

        if (products.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos disponibles en esta tienda por el momento.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            let starsHtml = '';
            for(let i=0; i < 5; i++) {
                starsHtml += `<i class="fas fa-star${i < product.rating ? '' : '-half-alt'}"></i>`; // Simplificado, podrías usar fa-star-o para vacías
            }

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <div class="rating">${starsHtml}</div>
                <p class="price">$${product.price.toLocaleString('es-CO')}</p>
                <button class="btn-add-to-cart" data-product-id="${product.id}">Añadir al carrito</button>
            `;
            productCard.querySelector('.btn-add-to-cart').addEventListener('click', () => {
                addToCart(product.id, storeId);
            });
            productsGrid.appendChild(productCard);
        });
    }

    function updateCartDisplay() {
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartInfo.textContent = `Carrito (${itemCount})`;
        cartInfoProducts.textContent = `Carrito (${itemCount})`;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <div class="cart-item-details">
                        <strong>${item.name}</strong> (x${item.quantity})
                    </div>
                    <div class="cart-item-price">
                        $${(item.price * item.quantity).toLocaleString('es-CO')}
                    </div>
                    <div class="cart-item-controls">
                        <button data-product-id="${item.productId}" class="remove-one-from-cart">-</button>
                        <button data-product-id="${item.productId}" class="add-one-to-cart">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                total += item.price * item.quantity;
            });
        }
        cartTotalEl.textContent = `$${total.toLocaleString('es-CO')}`;
        
        // Add event listeners for + and - buttons in cart
        document.querySelectorAll('.add-one-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                changeCartItemQuantity(productId, 1);
            });
        });
        document.querySelectorAll('.remove-one-from-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                changeCartItemQuantity(productId, -1);
            });
        });
    }

    function changeCartItemQuantity(productId, change) {
        const itemInCart = cart.find(item => item.productId === productId);
        if (itemInCart) {
            itemInCart.quantity += change;
            if (itemInCart.quantity <= 0) {
                cart = cart.filter(item => item.productId !== productId);
            }
        }
        updateCartDisplay();
    }

    function addToCart(productId, storeId) {
        const product = fakeProducts[storeId].find(p => p.id === productId);
        if (!product) return;

        const itemInCart = cart.find(item => item.productId === productId);
        if (itemInCart) {
            itemInCart.quantity++;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                storeId: storeId
            });
        }
        updateCartDisplay();
        // Pequeña animación o feedback visual sería bueno aquí
        alert(`${product.name} añadido al carrito!`);
    }

    // --- MANEJADORES DE EVENTOS ---
    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.email = document.getElementById('email').value;
        if (currentUser.email) {
            updateSidebarStep(1); // Actualiza al paso de dirección
            showScreen('address-screen');
        } else {
            alert("Por favor ingresa un correo válido.");
        }
    });

    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.name = document.getElementById('name').value;
        currentUser.address = document.getElementById('address').value;
        if (currentUser.name && currentUser.address) {
            userNameDisplay.textContent = currentUser.name.split(' ')[0]; // Mostrar primer nombre
            userNameDisplayProducts.textContent = currentUser.name.split(' ')[0];
            updateSidebarStep(2); // Actualiza al paso de disfrutar (implica ir a tiendas)
            renderStores();
            showScreen('store-list-screen');
        } else {
            alert("Por favor completa tu nombre y dirección.");
        }
    });

    backToStoresBtn.addEventListener('click', () => {
        currentStoreId = null;
        showScreen('store-list-screen');
    });

    // Eventos del modal del carrito
    cartIcon.addEventListener('click', () => cartModal.style.display = 'block');
    cartIconProducts.addEventListener('click', () => cartModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => cartModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert(`¡Gracias por tu compra, ${currentUser.name}!\nTu pedido de $${cartTotalEl.textContent} será enviado a ${currentUser.address}.\nTotal items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}`);
            cart = []; // Vaciar carrito
            updateCartDisplay();
            cartModal.style.display = 'none';
        } else {
            alert("Tu carrito está vacío.");
        }
    });

    // --- INICIALIZACIÓN ---
    updateSidebarStep(0); // Inicia en el primer paso
    showScreen('registration-screen'); // Mostrar la pantalla de registro al cargar
    updateCartDisplay(); // Asegurar que el carrito se muestre correctamente al inicio
});document.addEventListener('DOMContentLoaded', () => {
    // --- DATOS FALSOS ---
    const fakeStores = [
        { id: 1, name: "Tienda La Esquina Fresca", hours: "8am - 7pm", freeDelivery: true, theme: 'red-theme' },
        { id: 2, name: "Minimarket Doña Julia", hours: "9am - 8pm", freeDelivery: false, theme: 'green-theme' },
        { id: 3, name: "Abarrotes El Buen Sabor", hours: "7am - 6pm", freeDelivery: true, theme: 'red-theme' },
        { id: 4, name: "Super Vecino", hours: "8am - 9pm", freeDelivery: false, theme: 'green-theme' },
    ];

    const fakeProducts = {
        1: [ // Productos para Tienda La Esquina Fresca (id: 1)
            { id: 101, name: "Leche Entera Alquería 1lt", price: 4500, image: "https://via.placeholder.com/100?text=Leche", rating: 5, category: "Lácteos" },
            { id: 102, name: "Huevos AA x12", price: 7000, image: "https://via.placeholder.com/100?text=Huevos", rating: 4, category: "Huevos" },
            { id: 103, name: "Pan Tajado Bimbo", price: 5200, image: "https://via.placeholder.com/100?text=Pan", rating: 5, category: "Panadería" },
            { id: 104, name: "Arroz Diana 1kg", price: 3800, image: "https://via.placeholder.com/100?text=Arroz", rating: 4, category: "Granos" },
        ],
        2: [ // Productos para Minimarket Doña Julia (id: 2)
            { id: 201, name: "Gaseosa Postobón 1.5L", price: 3500, image: "https://via.placeholder.com/100?text=Gaseosa", rating: 4, category: "Bebidas" },
            { id: 202, name: "Papas Margarita Pollo", price: 2000, image: "https://via.placeholder.com/100?text=Papas", rating: 5, category: "Snacks" },
            { id: 203, name: "Jugo Hit Naranja 1L", price: 3200, image: "https://via.placeholder.com/100?text=Jugo", rating: 3, category: "Bebidas" },
        ],
        3: [ // Productos para Abarrotes El Buen Sabor (id: 3)
            { id: 301, name: "Café Sello Rojo 250g", price: 6000, image: "https://via.placeholder.com/100?text=Cafe", rating: 5, category: "Despensa" },
            { id: 302, name: "Aceite Premier 1L", price: 12000, image: "https://via.placeholder.com/100?text=Aceite", rating: 4, category: "Despensa" },
        ],
        4: [ // Productos para Super Vecino (id: 4)
             { id: 401, name: "Manzanas Rojas x3", price: 5000, image: "https://via.placeholder.com/100?text=Manzanas", rating: 4, category: "Frutas" },
             { id: 402, name: "Banano Criollo Libra", price: 1800, image: "https://via.placeholder.com/100?text=Banano", rating: 5, category: "Frutas" },
             { id: 403, name: "Tomate Chonto Libra", price: 2200, image: "https://via.placeholder.com/100?text=Tomate", rating: 4, category: "Verduras" },
        ]
    };

    // --- ESTADO DE LA APLICACIÓN ---
    let currentUser = {
        email: '',
        name: '',
        address: ''
    };
    let cart = [];
    let currentStoreId = null;

    // --- SELECTORES DE ELEMENTOS DEL DOM ---
    const screens = document.querySelectorAll('.screen');
    const emailForm = document.getElementById('email-form');
    const addressForm = document.getElementById('address-form');
    const storesGrid = document.getElementById('stores-grid');
    const productsGrid = document.getElementById('products-grid');
    const storeNameProducts = document.getElementById('store-name-products');
    const backToStoresBtn = document.getElementById('back-to-stores');
    
    const cartInfo = document.getElementById('cart-info');
    const cartInfoProducts = document.getElementById('cart-info-products');
    const cartIcon = document.getElementById('cart-icon');
    const cartIconProducts = document.getElementById('cart-icon-products');
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    const userNameDisplay = document.getElementById('user-name-display');
    const userNameDisplayProducts = document.getElementById('user-name-display-products');

    const sidebarSteps = document.querySelectorAll('.registration-sidebar .step');


    // --- FUNCIONES DE NAVEGACIÓN Y RENDERIZADO ---
    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        window.scrollTo(0, 0); // Scroll al inicio de la nueva pantalla
    }
    
    function updateSidebarStep(stepIndex) {
        sidebarSteps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else if (index < stepIndex) {
                 step.classList.add('completed'); // Opcional: marcar como completado
                 step.classList.remove('active');
            }
            else {
                step.classList.remove('active');
                step.classList.remove('completed');
            }
        });
    }


    function renderStores() {
        storesGrid.innerHTML = ''; // Limpiar tiendas anteriores
        fakeStores.forEach(store => {
            const storeCard = document.createElement('div');
            storeCard.classList.add('store-card', store.theme);
            storeCard.innerHTML = `
                ${store.freeDelivery ? '<span class="free-delivery">Free Delivery</span>' : ''}
                <h3>${store.name}</h3>
                <p><i class="fas fa-clock"></i> ${store.hours}</p>
                <button class="btn-store" data-store-id="${store.id}">Shop Now <i class="fas fa-arrow-right"></i></button>
            `;
            storeCard.querySelector('.btn-store').addEventListener('click', () => {
                currentStoreId = store.id;
                renderProducts(store.id);
                showScreen('product-list-screen');
            });
            storesGrid.appendChild(storeCard);
        });
    }

    function renderProducts(storeId) {
        const store = fakeStores.find(s => s.id === storeId);
        const products = fakeProducts[storeId] || [];
        storeNameProducts.textContent = `Productos de ${store.name}`;
        productsGrid.innerHTML = ''; // Limpiar productos anteriores

        if (products.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos disponibles en esta tienda por el momento.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            let starsHtml = '';
            for(let i=0; i < 5; i++) {
                starsHtml += `<i class="fas fa-star${i < product.rating ? '' : '-half-alt'}"></i>`; // Simplificado, podrías usar fa-star-o para vacías
            }

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <div class="rating">${starsHtml}</div>
                <p class="price">$${product.price.toLocaleString('es-CO')}</p>
                <button class="btn-add-to-cart" data-product-id="${product.id}">Añadir al carrito</button>
            `;
            productCard.querySelector('.btn-add-to-cart').addEventListener('click', () => {
                addToCart(product.id, storeId);
            });
            productsGrid.appendChild(productCard);
        });
    }

    function updateCartDisplay() {
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartInfo.textContent = `Carrito (${itemCount})`;
        cartInfoProducts.textContent = `Carrito (${itemCount})`;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <div class="cart-item-details">
                        <strong>${item.name}</strong> (x${item.quantity})
                    </div>
                    <div class="cart-item-price">
                        $${(item.price * item.quantity).toLocaleString('es-CO')}
                    </div>
                    <div class="cart-item-controls">
                        <button data-product-id="${item.productId}" class="remove-one-from-cart">-</button>
                        <button data-product-id="${item.productId}" class="add-one-to-cart">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                total += item.price * item.quantity;
            });
        }
        cartTotalEl.textContent = `$${total.toLocaleString('es-CO')}`;
        
        // Add event listeners for + and - buttons in cart
        document.querySelectorAll('.add-one-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                changeCartItemQuantity(productId, 1);
            });
        });
        document.querySelectorAll('.remove-one-from-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                changeCartItemQuantity(productId, -1);
            });
        });
    }

    function changeCartItemQuantity(productId, change) {
        const itemInCart = cart.find(item => item.productId === productId);
        if (itemInCart) {
            itemInCart.quantity += change;
            if (itemInCart.quantity <= 0) {
                cart = cart.filter(item => item.productId !== productId);
            }
        }
        updateCartDisplay();
    }

    function addToCart(productId, storeId) {
        const product = fakeProducts[storeId].find(p => p.id === productId);
        if (!product) return;

        const itemInCart = cart.find(item => item.productId === productId);
        if (itemInCart) {
            itemInCart.quantity++;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                storeId: storeId
            });
        }
        updateCartDisplay();
        // Pequeña animación o feedback visual sería bueno aquí
        alert(`${product.name} añadido al carrito!`);
    }

    // --- MANEJADORES DE EVENTOS ---
    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.email = document.getElementById('email').value;
        if (currentUser.email) {
            updateSidebarStep(1); // Actualiza al paso de dirección
            showScreen('address-screen');
        } else {
            alert("Por favor ingresa un correo válido.");
        }
    });

    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.name = document.getElementById('name').value;
        currentUser.address = document.getElementById('address').value;
        if (currentUser.name && currentUser.address) {
            userNameDisplay.textContent = currentUser.name.split(' ')[0]; // Mostrar primer nombre
            userNameDisplayProducts.textContent = currentUser.name.split(' ')[0];
            updateSidebarStep(2); // Actualiza al paso de disfrutar (implica ir a tiendas)
            renderStores();
            showScreen('store-list-screen');
        } else {
            alert("Por favor completa tu nombre y dirección.");
        }
    });

    backToStoresBtn.addEventListener('click', () => {
        currentStoreId = null;
        showScreen('store-list-screen');
    });

    // Eventos del modal del carrito
    cartIcon.addEventListener('click', () => cartModal.style.display = 'block');
    cartIconProducts.addEventListener('click', () => cartModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => cartModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert(`¡Gracias por tu compra, ${currentUser.name}!\nTu pedido de $${cartTotalEl.textContent} será enviado a ${currentUser.address}.\nTotal items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}`);
            cart = []; // Vaciar carrito
            updateCartDisplay();
            cartModal.style.display = 'none';
        } else {
            alert("Tu carrito está vacío.");
        }
    });

    // --- INICIALIZACIÓN ---
    updateSidebarStep(0); // Inicia en el primer paso
    showScreen('registration-screen'); // Mostrar la pantalla de registro al cargar
    updateCartDisplay(); // Asegurar que el carrito se muestre correctamente al inicio
});