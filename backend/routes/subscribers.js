import express from 'express';
import { body } from 'express-validator';
import {
  subscribeNewsletter,
  getAllSubscribers,
  unsubscribe,
} from '../controllers/subscriberController.js';

const router = express.Router();

// Validation middleware
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// Routes
router.post('/subscribe', validateEmail, subscribeNewsletter);
router.get('/', getAllSubscribers);
router.delete('/unsubscribe/:email', unsubscribe);

export default router;
