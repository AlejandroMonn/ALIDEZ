import express from 'express';
import { Delivery, Order, User } from '../models/index.js';

const router = express.Router();

// Obtener todas las entregas de un conductor
router.get('/driver/:driverId', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ driver_id: req.params.driverId })
      .populate({
        path: 'order_id',
        populate: [
          { path: 'user_id', select: 'username phone_number' },
          { path: 'delivery_address_id' }
        ]
      })
      .sort({ created_at: -1 });
    
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener detalles de una entrega específica
router.get('/:deliveryId', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId)
      .populate({
        path: 'order_id',
        populate: [
          { path: 'user_id', select: 'username email phone_number' },
          { path: 'delivery_address_id' }
        ]
      })
      .populate('driver_id', 'username phone_number');

    if (!delivery) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Asignar conductor a una entrega
router.post('/:orderId/assign', async (req, res) => {
  try {
    const { driver_id } = req.body;

    if (!driver_id) {
      return res.status(400).json({ error: 'ID del conductor es requerido' });
    }

    // Verificar que el conductor existe y tiene el rol correcto
    const driver = await User.findOne({ _id: driver_id, role: 'driver' });
    if (!driver) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    // Verificar que la orden existe y no tiene una entrega asignada
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const existingDelivery = await Delivery.findOne({ order_id: req.params.orderId });
    if (existingDelivery) {
      return res.status(400).json({ error: 'Esta orden ya tiene una entrega asignada' });
    }

    // Crear la entrega
    const delivery = new Delivery({
      order_id: req.params.orderId,
      driver_id,
      status: 'assigned'
    });

    await delivery.save();

    res.status(201).json({
      message: 'Entrega asignada exitosamente',
      delivery
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de una entrega
router.patch('/:deliveryId/status', async (req, res) => {
  try {
    const { status, delivery_notes } = req.body;

    if (!['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const updateData = { status };
    if (delivery_notes) updateData.delivery_notes = delivery_notes;

    // Actualizar tiempos según el estado
    if (status === 'picked_up') {
      updateData.pickup_time = new Date();
    } else if (status === 'delivered') {
      updateData.delivery_time = new Date();
    }

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.deliveryId,
      updateData,
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    // Si la entrega se marca como entregada, actualizar el estado de la orden
    if (status === 'delivered') {
      await Order.findByIdAndUpdate(delivery.order_id, { status: 'entregado' });
    }

    res.status(200).json({
      message: 'Estado de entrega actualizado exitosamente',
      delivery
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 