import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Generar JWT
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: '30d'
  });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generar token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar usuario'
    });
  }
};

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al iniciar sesión'
    });
  }
};

// @desc    Obtener perfil del usuario
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener perfil'
    });
  }
}; 