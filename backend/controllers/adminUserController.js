const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      phoneVerified,
      hasOrders,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (phoneVerified !== undefined) {
      query.phoneVerified = phoneVerified === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // If filtering by hasOrders, get users with orders
    if (hasOrders === 'true') {
      const userIds = await Order.distinct('userId', { paymentStatus: 'completed' });
      users = users.filter(user => userIds.includes(user._id.toString()));
    }

    const total = await User.countDocuments(query);

    // Get order count for each user
    const usersWithOrderCount = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({
          userId: user._id,
          paymentStatus: 'completed'
        });
        
        const totalSpent = await Order.aggregate([
          { $match: { userId: user._id, paymentStatus: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
          ...user.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersWithOrderCount,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get single user details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's orders
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's cart
    const cart = await Cart.findOne({ userId });

    // Get user statistics
    const [orderCount, totalSpent, totalReviews] = await Promise.all([
      Order.countDocuments({ userId, paymentStatus: 'completed' }),
      Order.aggregate([
        { $match: { userId: user._id, paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      require('../models/Review').countDocuments({ userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        orders,
        cart,
        statistics: {
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
          totalReviews,
          cartItems: cart?.totalItems || 0,
          savedItems: cart?.savedForLater?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;
    delete updates.googleId;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has completed orders
    const completedOrders = await Order.countDocuments({
      userId,
      paymentStatus: 'completed'
    });

    if (completedOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with completed orders. Consider deactivating instead.'
      });
    }

    // Delete user's cart
    await Cart.findOneAndDelete({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Export users to CSV data
exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    const userData = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({
          userId: user._id,
          paymentStatus: 'completed'
        });

        const totalSpent = await Order.aggregate([
          { $match: { userId: user._id, paymentStatus: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
          name: user.name,
          email: user.email,
          phone: user.phone || 'N/A',
          phoneVerified: user.phoneVerified,
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
          createdAt: user.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users'
    });
  }
};

