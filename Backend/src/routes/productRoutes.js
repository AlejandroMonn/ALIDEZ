const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Rutas públicas
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Rutas protegidas
router.post('/', auth, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);
router.get('/seller/products', auth, productController.getSellerProducts);
router.post('/:id/rating', auth, productController.updateProductRating);

module.exports = router; 