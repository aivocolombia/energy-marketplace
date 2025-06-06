import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Verificando autenticación');
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('No se encontró token de autorización');
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Formato de token inválido');
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    try {
      console.log('Verificando token');
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      console.log('Token decodificado:', { userId: decoded.id, role: decoded.role });

      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('Usuario no encontrado en la base de datos');
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      console.log('Usuario autenticado:', { id: user._id, role: user.role });
      req.user = user;
      next();
    } catch (error) {
      console.error('Error al verificar token:', error);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
}; 