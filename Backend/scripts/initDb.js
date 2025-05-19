import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Product, Order, Address } from '../models/index.js';

dotenv.config();

const initDatabase = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB para inicialización');

    // Crear índices
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await Product.collection.createIndex({ seller_id: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Order.collection.createIndex({ user_id: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Address.collection.createIndex({ user_id: 1 });

    console.log('Índices creados exitosamente');

    // Crear roles de usuario por defecto si no existen
    const roles = ['buyer', 'seller', 'driver'];
    for (const role of roles) {
      const roleExists = await User.findOne({ role });
      if (!roleExists) {
        await User.create({
          username: `admin_${role}`,
          email: `admin_${role}@alidez.com`,
          password_hash: 'temporary_password', // Debe ser cambiado después
          role,
          phone_number: '0000000000'
        });
        console.log(`Rol ${role} creado`);
      }
    }

    console.log('Inicialización de la base de datos completada');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    process.exit(1);
  }
};

initDatabase(); 