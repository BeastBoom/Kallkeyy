const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// Public routes
router.get('/:productId', reviewController.getReviewsByProduct);

// Protected routes (require authentication)
router.post('/', auth, reviewController.createReview);
router.put('/:reviewId', auth, reviewController.updateReview);
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router;
