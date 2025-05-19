import express from 'express';
import { SellerProfile } from '../models/sellerProfile.js';
import { User } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Crear perfil de vendedor
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const existingProfile = await SellerProfile.findOne({ user_id: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: 'El perfil ya existe' });
    }

    const sellerProfile = new SellerProfile({
      user_id: req.user.id,
      ...req.body
    });

    await sellerProfile.save();
    res.status(201).json(sellerProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener perfil de vendedor
router.get('/', auth, async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({ user_id: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar perfil de vendedor
router.put('/', auth, async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({ user_id: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    Object.assign(profile, req.body);
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marcar configuración como completada
router.patch('/complete-setup', auth, async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({ user_id: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    profile.setup_completed = true;
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 