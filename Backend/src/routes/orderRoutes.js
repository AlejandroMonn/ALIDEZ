const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Rutas para compradores
router.post('/', auth, orderController.createOrder);
router.get('/my-orders', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrderById);

// Rutas para vendedores
router.get('/seller/orders', auth, orderController.getSellerOrders);
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router; 