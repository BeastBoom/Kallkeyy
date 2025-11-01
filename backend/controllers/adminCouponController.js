const Coupon = require('../models/Coupon');
const { setCorsHeaders } = require('../utils/responseHelper');
const connectDB = require('../config/db');

// Get all coupons with pagination
exports.getAllCoupons = async (req, res) => {
  try {
    await connectDB();

    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate('createdBy', 'username email')
        .populate('lastModifiedBy', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Coupon.countDocuments(query)
    ]);

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      data: {
        coupons,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
};

// Get single coupon details
exports.getCouponDetails = async (req, res) => {
  try {
    await connectDB();

    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId)
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email')
      .populate('usedBy.userId', 'name email');

    if (!coupon) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      coupon
    });
  } catch (error) {
    console.error('Get coupon details error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon details'
    });
  }
};

// Create new coupon
exports.createCoupon = async (req, res) => {
  try {
    await connectDB();

    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      isActive,
      validFrom,
      validUntil,
      rules
    } = req.body;

    // Validate required fields
    if (!code || !name || !discountType || discountValue === undefined) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Code, name, discountType, and discountValue are required'
      });
    }

    // Validate discount value
    if (discountValue <= 0) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Discount value must be greater than 0'
      });
    }

    // Validate percentage discount
    if (discountType === 'percentage' && discountValue > 100) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim() 
    });

    if (existingCoupon) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      name,
      description: description || '',
      discountType,
      discountValue,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      rules: {
        firstTimePurchaseOnly: rules?.firstTimePurchaseOnly || false,
        oncePerAccount: rules?.oncePerAccount || false,
        applyToShipping: rules?.applyToShipping || false
      },
      createdBy: req.admin._id,
      lastModifiedBy: req.admin._id
    });

    setCorsHeaders(req, res);
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? 'Coupon code already exists' : 'Failed to create coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    await connectDB();

    const { couponId } = req.params;
    const updateData = req.body;

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // If code is being updated, check for duplicates
    if (updateData.code && updateData.code.toUpperCase().trim() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: updateData.code.toUpperCase().trim(),
        _id: { $ne: couponId }
      });

      if (existingCoupon) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }

      updateData.code = updateData.code.toUpperCase().trim();
    }

    // Validate discount value if provided
    if (updateData.discountValue !== undefined && updateData.discountValue <= 0) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Discount value must be greater than 0'
      });
    }

    // Validate percentage discount
    if (updateData.discountType === 'percentage' && updateData.discountValue > 100) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Update lastModifiedBy
    updateData.lastModifiedBy = req.admin._id;

    // Handle date conversions
    if (updateData.validFrom) {
      updateData.validFrom = new Date(updateData.validFrom);
    }
    if (updateData.validUntil !== undefined) {
      updateData.validUntil = updateData.validUntil ? new Date(updateData.validUntil) : null;
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email');

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon: updatedCoupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? 'Coupon code already exists' : 'Failed to update coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    await connectDB();

    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete coupon that has been used. Deactivate it instead.'
      });
    }

    await Coupon.findByIdAndDelete(couponId);

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
};

// Toggle coupon active status
exports.toggleCouponStatus = async (req, res) => {
  try {
    await connectDB();

    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon.isActive = !coupon.isActive;
    coupon.lastModifiedBy = req.admin._id;
    await coupon.save();

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon
    });
  } catch (error) {
    console.error('Toggle coupon status error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status'
    });
  }
};

