import express from 'express';
import { login, signUp, changePassword } from '../controllers/user.js';

const router = express.Router();

router.get('/:UserName/:Password', login);
router.post('/', signUp);
router.put('/', changePassword);

export default router;
