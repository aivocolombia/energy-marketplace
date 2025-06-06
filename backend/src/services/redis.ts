import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Error en la conexión Redis:', err);
});

export const cacheOffer = async (offerId: string, offerData: any) => {
  await redis.set(`offer:${offerId}`, JSON.stringify(offerData), 'EX', 3600);
};

export const getCachedOffer = async (offerId: string) => {
  const cachedOffer = await redis.get(`offer:${offerId}`);
  return cachedOffer ? JSON.parse(cachedOffer) : null;
};

export const publishPriceUpdate = async (offerId: string, newPrice: number) => {
  await redis.publish('price-updates', JSON.stringify({ offerId, newPrice }));
};

export const updateCachedPrice = async (offerId: string, newPrice: number) => {
  const cachedOffer = await getCachedOffer(offerId);
  if (cachedOffer) {
    cachedOffer.pricePerUnit = newPrice;
    await cacheOffer(offerId, cachedOffer);
  }
};

export const getActiveOffers = async () => {
  const keys = await redis.keys('offer:*');
  const offers = await Promise.all(
    keys.map(async (key) => {
      const offer = await redis.get(key);
      return offer ? JSON.parse(offer) : null;
    })
  );
  return offers.filter(Boolean);
};

export default redis; 