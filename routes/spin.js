import express from 'express';
import { SpinResult } from '../controllers/spin.js';

const router = express.Router();

router.post('/', SpinResult);

export default router;
