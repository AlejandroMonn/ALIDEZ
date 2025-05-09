# Convenciones de Nombres del Proyecto

Este documento describe las convenciones de nombres utilizadas a lo largo del proyecto frontend y backend para asegurar consistencia y legibilidad.

## 1. Archivos y Carpetas

Utilizamos `kebab-case` (minúsculas, palabras separadas por guiones).

* `frontend/css/buyer-styles.css`
* `backend/routes/product-routes.js`
* `frontend/pages/product-detail.html`

## 2. HTML y CSS

Utilizamos `kebab-case` para clases e IDs.

* `<div class="product-card">`
* `#shopping-cart-button`
* `.order-summary-item`

## 3. JavaScript (Frontend y Backend)

### Variables y Funciones

Utilizamos `camelCase`.

* `let userProfileData;`
* `function handleAddToCartClick() { ... }`
* `async function fetchProductDetails(productId) { ... }`

### Constantes

Utilizamos `UPPER_SNAKE_CASE`.

* `const API_BASE_URL = '/api';`
* `const DEFAULT_ITEMS_PER_PAGE = 20;`

## 4. Base de Datos (SQLite)

### Nombres de Tablas

Utilizamos `snake_case` (minúsculas, guiones bajos) y son generalmente plurales.

* `users`
* `products`
* `order_items`

### Nombres de Columnas

Utilizamos `snake_case`.

* `user_name`
* `product_price`
* `created_at`
* `seller_id`

## 5. API Endpoints (URLs)

Utilizamos `kebab-case` y sustantivos plurales.

* `GET /api/products`
* `POST /api/cart-items`
* `GET /api/users/{userId}/orders`
* `PUT /api/sellers/{sellerId}/products/{productId}`
