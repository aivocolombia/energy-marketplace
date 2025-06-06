import express, { RequestHandler } from 'express';
import { protect } from '../middleware/auth';
import { transactionController } from '../controllers/transactionController';

const router = express.Router();

router.use(protect as RequestHandler);

router.get('/', transactionController.getTransactions as RequestHandler);

router.get('/:transactionId', transactionController.getTransactionDetails as RequestHandler);

export default router; 