import express from 'express';
import { BetResult, getBetAmount } from '../controllers/bet.js';

const router = express.Router();
router.get('/:UserName',getBetAmount);
router.post('/', BetResult);

export default router;
