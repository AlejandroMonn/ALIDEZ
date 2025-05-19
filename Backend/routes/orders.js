import express from 'express';
import { Order, OrderItem, CartItem, Product, Address } from '../models/index.js';

const router = express.Router();

// Crear una nueva orden
router.post('/', async (req, res) => {
  try {
    const { user_id, delivery_address_id } = req.body;

    if (!user_id || !delivery_address_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos (user_id, delivery_address_id)' });
    }

    // Verificar que la dirección existe y pertenece al usuario
    const address = await Address.findOne({
      _id: delivery_address_id,
      user_id: user_id
    });

    if (!address) {
      return res.status(404).json({ error: 'Dirección no encontrada o no pertenece al usuario' });
    }

    // Obtener items del carrito
    const cartItems = await CartItem.find({ user_id })
      .populate('product_id');

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Calcular el total y verificar stock
    let totalAmount = 0;
    for (const item of cartItems) {
      const product = item.product_id;
      if (!product.is_available || product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Producto ${product.name} no disponible o sin stock suficiente` 
        });
      }
      totalAmount += product.price * item.quantity;
    }

    // Crear la orden
    const order = new Order({
      user_id,
      delivery_address_id,
      total_amount: totalAmount
    });

    await order.save();

    // Crear los items de la orden y actualizar stock
    for (const item of cartItems) {
      const product = item.product_id;
      
      // Crear item de orden
      await OrderItem.create({
        order_id: order._id,
        product_id: product._id,
        quantity: item.quantity,
        price_at_purchase: product.price
      });

      // Actualizar stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Vaciar el carrito
    await CartItem.deleteMany({ user_id });

    res.status(201).json({
      message: 'Orden creada exitosamente',
      orderId: order._id,
      totalAmount: order.total_amount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener órdenes de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.params.userId })
      .populate('delivery_address_id')
      .sort({ order_date: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener detalles de una orden específica
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user_id', 'username email phone_number')
      .populate('delivery_address_id');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'name description image_url');

    res.status(200).json({
      order,
      items: orderItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de una orden
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pendiente', 'en camino', 'entregado', 'cancelado'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.status(200).json({
      message: 'Estado de orden actualizado exitosamente',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 