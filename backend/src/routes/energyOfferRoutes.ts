import express from 'express';
import { energyOfferController } from '../controllers/energyOfferController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = express.Router();

// Rutas protegidas que requieren autenticación
router.use(authMiddleware);

// Rutas para vendedores
router.post(
  '/create',
  roleMiddleware(['seller']),
  energyOfferController.createOffer
);

router.put(
  '/:offerId/price',
  roleMiddleware(['seller']),
  energyOfferController.updatePrice
);

router.get(
  '/my-offers',
  roleMiddleware(['seller']),
  energyOfferController.getSellerOffers
);

// Rutas accesibles para compradores y vendedores
router.get(
  '/active',
  energyOfferController.getActiveOffers
);

export default router; 