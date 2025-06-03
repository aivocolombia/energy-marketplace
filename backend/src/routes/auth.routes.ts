import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Validación para registro
const registerValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Ingresa un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').isIn(['buyer', 'seller']).withMessage('Rol no válido'),
  validateRequest
];

// Validación para login
const loginValidation = [
  body('email').isEmail().withMessage('Ingresa un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validateRequest
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);

export default router; 