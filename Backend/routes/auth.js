import express from 'express';
import { User } from '../models/index.js';

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, phone_number } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password || !role || !phone_number) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar rol
    if (!['buyer', 'seller', 'driver'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password_hash: password, // Nota: En producción, deberías hashear la contraseña
      role,
      phone_number
    });

    await user.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: user._id });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'El nombre de usuario o email ya está en uso' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { username_or_email, password } = req.body;

    if (!username_or_email || !password) {
      return res.status(400).json({ error: 'Faltan credenciales (usuario/email y contraseña)' });
    }

    const user = await User.findOne({
      $or: [
        { username: username_or_email },
        { email: username_or_email }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Nota: En producción, deberías verificar el hash de la contraseña
    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.status(200).json({
      message: 'Login exitoso',
      userId: user._id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 