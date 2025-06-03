import Redis from 'ioredis';
import { config } from '../config';

// Crear cliente Redis
const redis = new Redis({
  host: 'localhost',  // Por defecto para desarrollo local
  port: 6379,        // Puerto por defecto de Redis
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Error en la conexión Redis:', err);
});

redis.on('connect', () => {
  console.log('Conectado a Redis exitosamente');
});

// Funciones helper para el manejo de ofertas en tiempo real
export const redisService = {
  // Guardar una oferta en caché
  async cacheOffer(offerId: string, offerData: any) {
    await redis.set(`offer:${offerId}`, JSON.stringify(offerData), 'EX', 3600); // Expira en 1 hora
  },

  // Obtener una oferta de caché
  async getCachedOffer(offerId: string) {
    const data = await redis.get(`offer:${offerId}`);
    return data ? JSON.parse(data) : null;
  },

  // Publicar actualización de precio
  async publishPriceUpdate(offerId: string, newPrice: number) {
    await redis.publish('price-updates', JSON.stringify({ offerId, newPrice }));
  },

  // Actualizar precio en caché
  async updateOfferPrice(offerId: string, newPrice: number) {
    const offer = await this.getCachedOffer(offerId);
    if (offer) {
      offer.pricePerUnit = newPrice;
      await this.cacheOffer(offerId, offer);
    }
  },

  // Obtener todas las ofertas activas
  async getActiveOffers() {
    const keys = await redis.keys('offer:*');
    const offers = await Promise.all(
      keys.map(async (key) => {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
      })
    );
    return offers.filter(offer => offer && offer.status === 'active');
  }
};

export default redis; 