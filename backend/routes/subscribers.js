const express = require('express');
const { body } = require ('express-validator');
const {
  subscribeNewsletter,
  getAllSubscribers,
  unsubscribe,
} = require('../controllers/subscriberController');

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

module.exports = router;
