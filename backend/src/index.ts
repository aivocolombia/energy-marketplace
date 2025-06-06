import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import energyOfferRoutes from './routes/energyOfferRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { Server } from 'socket.io';
import { createServer } from 'http';
import redis from './services/redis';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

export const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/energy-offers', energyOfferRoutes);
app.use('/api/transactions', transactionRoutes);

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
    io.emit('price-update', update);
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido en las variables de entorno');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erco')
  .then(() => {
    console.log('Conectado a MongoDB');
    
    const PORT = process.env.PORT || 5001;
    httpServer.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
  });

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

app.use(errorHandler); 