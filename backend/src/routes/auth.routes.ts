import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { RequestHandler } from 'express';

const router = Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Ingresa un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').isIn(['buyer', 'seller']).withMessage('Rol no válido'),
  validateRequest
];

const loginValidation = [
  body('email').isEmail().withMessage('Ingresa un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validateRequest
];

router.post('/register', registerValidation, register as RequestHandler);
router.post('/login', loginValidation, login as RequestHandler);
router.get('/profile', protect as RequestHandler, getProfile as RequestHandler);

export default router; 