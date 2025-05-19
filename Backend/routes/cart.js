import express from 'express';
import { CartItem, Product } from '../models/index.js';

const router = express.Router();

// Obtener el carrito de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user_id: req.params.userId })
      .populate('product_id', 'name price image_url stock');
    
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar o actualizar item en el carrito
router.post('/', async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({ error: 'Faltan datos requeridos (user_id, product_id, quantity)' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    // Verificar que el producto existe y tiene stock
    const product = await Product.findOne({
      _id: product_id,
      is_available: true,
      stock: { $gte: quantity }
    });

    if (!product) {
      return res.status(400).json({ error: 'Producto no disponible o sin stock suficiente' });
    }

    // Actualizar o crear el item del carrito
    const cartItem = await CartItem.findOneAndUpdate(
      { user_id, product_id },
      { quantity },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Item de carrito actualizado exitosamente',
      cartItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un item del carrito
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const result = await CartItem.findOneAndDelete({
      user_id: userId,
      product_id: productId
    });

    if (!result) {
      return res.status(404).json({ message: 'Item no encontrado en el carrito' });
    }

    res.status(200).json({ message: 'Item eliminado del carrito exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vaciar el carrito
router.delete('/:userId', async (req, res) => {
  try {
    const result = await CartItem.deleteMany({ user_id: req.params.userId });
    
    res.status(200).json({ 
      message: 'Carrito vaciado exitosamente',
      itemsDeleted: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 