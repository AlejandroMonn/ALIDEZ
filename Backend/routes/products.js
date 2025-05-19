import express from 'express';
import { Product } from '../models/index.js';

const router = express.Router();

// Obtener todos los productos disponibles
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ is_available: true, stock: { $gt: 0 } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      is_available: true,
      stock: { $gt: 0 }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener productos de un vendedor específico
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const products = await Product.find({ 
      seller_id: req.params.sellerId 
    }).sort({ created_at: -1 });
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo producto (solo vendedores)
router.post('/seller/:sellerId', async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url, is_available } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos (name, price, stock)' });
    }

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      seller_id: req.params.sellerId,
      image_url,
      is_available: is_available !== undefined ? is_available : true
    });

    await product.save();
    res.status(201).json({ message: 'Producto creado', productId: product._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un producto (solo vendedores)
router.put('/seller/:sellerId/:productId', async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url, is_available } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = price;
    if (stock !== undefined) updateFields.stock = stock;
    if (category !== undefined) updateFields.category = category;
    if (image_url !== undefined) updateFields.image_url = image_url;
    if (is_available !== undefined) updateFields.is_available = is_available;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.productId, seller_id: req.params.sellerId },
      { $set: updateFields },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado o no pertenece a este vendedor' });
    }

    res.status(200).json({ message: 'Producto actualizado exitosamente', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un producto (solo vendedores)
router.delete('/seller/:sellerId/:productId', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.productId,
      seller_id: req.params.sellerId
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado o no pertenece a este vendedor' });
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 