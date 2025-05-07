import express from 'express';
import { signup, login } from '../../controllers/auth/authController.js';
import { validateSignup, validateLogin } from '../../middleware/authValidation.js';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

export default router;