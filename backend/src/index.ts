import dotenv from 'dotenv';
// Cargar variables de entorno antes que todo
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import energyOfferRoutes from './routes/energyOfferRoutes';
import { Server } from 'socket.io';
import { createServer } from 'http';
import redis from './services/redis';

const app = express();
const httpServer = createServer(app);

// Configuración de Socket.IO
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/offers', energyOfferRoutes);

// Suscripción a actualizaciones de precios en Redis
const subscriber = redis.duplicate();
subscriber.subscribe('price-updates', (err) => {
  if (err) {
    console.error('Error al suscribirse a price-updates:', err);
    return;
  }
});

subscriber.on('message', (channel, message) => {
  if (channel === 'price-updates') {
    const update = JSON.parse(message);
    io.emit('price-update', update); // Emitir a todos los clientes conectados
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Verificar que JWT_SECRET esté definido
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido en las variables de entorno');
  process.exit(1);
}

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erco')
  .then(() => {
    console.log('Conectado a MongoDB');
    
    // Iniciar servidor
    const PORT = process.env.PORT || 5001;
    httpServer.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
  });

// Manejar el cierre de la aplicación
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
    process.exit(1);
  }
}); 