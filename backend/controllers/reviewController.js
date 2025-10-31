const Review = require('../models/Review');
const { setCorsHeaders } = require('../utils/responseHelper');

// Get all reviews for a product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, description } = req.body;
    const userId = req.user._id;
    const name = req.user.name;
    const email = req.user.email;
    
    // Validate required fields
    if (!productId || !rating) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required',
        field: 'rating'
      });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
        field: 'rating'
      });
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
        field: 'duplicate'
      });
    }
    
    // Create review
    const review = await Review.create({
      productId,
      userId,
      name,
      email,
      rating,
      description: description?.trim() || ''
    });
    
    setCorsHeaders(req, res);
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

// Update user's own review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, description } = req.body;
    const userId = req.user._id;
    
    // Find review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns this review
    if (review.userId.toString() !== userId.toString()) {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }
    
    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
        field: 'rating'
      });
    }
    
    // Update review
    if (rating) review.rating = rating;
    if (description !== undefined) review.description = description.trim();
    
    await review.save();
    
    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete user's own review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    // Find review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns this review
    if (review.userId.toString() !== userId.toString()) {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }
    
    await Review.deleteOne({ _id: reviewId });
    
    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};
