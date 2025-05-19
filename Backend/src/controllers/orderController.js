const Order = require('../models/Order');
const Product = require('../models/Product');

// Crear una nueva orden
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        // Calcular el total
        let totalPrice = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Producto no encontrado: ${item.product}` });
            }
            totalPrice += product.price * item.quantity;
        }

        const shippingPrice = 5000; // Precio fijo de envío

        const order = new Order({
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            totalPrice,
            shippingPrice,
            timeline: [{
                status: 'pending',
                date: new Date()
            }]
        });

        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todas las órdenes del usuario
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una orden específica
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No autorizado' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar el estado de una orden
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        order.status = status;
        order.timeline.push({
            status,
            date: new Date()
        });

        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener órdenes por vendedor
exports.getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            'items.product': { $in: await Product.find({ seller: req.user._id }).select('_id') }
        }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 