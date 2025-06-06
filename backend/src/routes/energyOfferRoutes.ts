import express, { RequestHandler } from 'express';
import { protect, authorize } from '../middleware/auth';
import * as energyOfferController from '../controllers/energyOfferController';
import { AuthRequest } from '../types/express';

const router = express.Router();

router.use(protect as RequestHandler);

router.get('/active', energyOfferController.getAllOffers as RequestHandler);
router.get('/my-offers', authorize('seller') as RequestHandler, energyOfferController.getSellerOffers as RequestHandler);

router.post('/create', authorize('seller') as RequestHandler, energyOfferController.createOffer as RequestHandler);
router.put('/:offerId/price', authorize('seller') as RequestHandler, energyOfferController.updateOfferPrice as RequestHandler);
router.post('/:offerId/purchase', authorize('buyer') as RequestHandler, energyOfferController.buyOffer as RequestHandler);

export default router; 