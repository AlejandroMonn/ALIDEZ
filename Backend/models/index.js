import mongoose from 'mongoose';

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  password_hash: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['buyer', 'seller', 'driver'] 
  },
  phone_number: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Esquema de Dirección
const addressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address_line1: { type: String, required: true },
  address_line2: String,
  city: { type: String, required: true },
  state_province: { type: String, required: true },
  postal_code: String,
  is_default: { type: Boolean, default: false },
  latitude: Number,
  longitude: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Esquema de Producto
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: String,
  is_available: { type: Boolean, default: true },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image_url: String,
  created_at: { type: Date, default: Date.now }
});

// Esquema de Orden
const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  delivery_address_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  order_date: { type: Date, default: Date.now },
  payment_status: { 
    type: String, 
    default: 'sin pagar',
    enum: ['sin pagar', 'pagado', 'cancelado']
  },
  notes: String,
  status: { 
    type: String, 
    default: 'pendiente',
    enum: ['pendiente', 'en camino', 'entregado', 'cancelado']
  },
  total_amount: { type: Number, required: true },
  updated_at: { type: Date, default: Date.now }
});

// Esquema de Items de Orden
const orderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price_at_purchase: { type: Number, required: true }
});

// Esquema de Items del Carrito
const cartItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 }
});

// Esquema de Entrega
const deliverySchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed']
  },
  pickup_time: Date,
  delivery_time: Date,
  delivery_notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Crear y exportar modelos
export const User = mongoose.model('User', userSchema);
export const Address = mongoose.model('Address', addressSchema);
export const Product = mongoose.model('Product', productSchema);
export const Order = mongoose.model('Order', orderSchema);
export const OrderItem = mongoose.model('OrderItem', orderItemSchema);
export const CartItem = mongoose.model('CartItem', cartItemSchema);
export const Delivery = mongoose.model('Delivery', deliverySchema); 