const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Subscriber = require('../models/Subscriber');
const Review = require('../models/Review');

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      totalSubscribers,
      recentOrders,
      lowStockProducts
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments({ paymentStatus: 'completed' }),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Product.countDocuments(),
      Subscriber.countDocuments({ isActive: true }),
      Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      Product.find({
        $expr: {
          $lt: [
            { $add: ['$stock.S', '$stock.M', '$stock.L', '$stock.XL', '$stock.XXL'] },
            10
          ]
        }
      }).limit(10)
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalProducts,
          totalSubscribers
        },
        ordersByStatus,
        revenueByMonth,
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// Get cart analytics
exports.getCartAnalytics = async (req, res) => {
  try {
    // Get all carts with items
    const carts = await Cart.find({
      $or: [
        { items: { $exists: true, $ne: [] } },
        { savedForLater: { $exists: true, $ne: [] } }
      ]
    }).populate('userId', 'name email');

    // Product add-to-cart frequency
    const productFrequency = {};
    const savedForLaterFrequency = {};

    carts.forEach(cart => {
      // Count items in cart
      cart.items?.forEach(item => {
        const key = `${item.productId}-${item.productName}`;
        if (!productFrequency[key]) {
          productFrequency[key] = {
            productId: item.productId,
            productName: item.productName,
            timesAdded: 0,
            totalQuantity: 0,
            sizes: {}
          };
        }
        productFrequency[key].timesAdded++;
        productFrequency[key].totalQuantity += item.quantity;
        productFrequency[key].sizes[item.size] = 
          (productFrequency[key].sizes[item.size] || 0) + item.quantity;
      });

      // Count saved for later
      cart.savedForLater?.forEach(item => {
        const key = `${item.productId}-${item.productName}`;
        if (!savedForLaterFrequency[key]) {
          savedForLaterFrequency[key] = {
            productId: item.productId,
            productName: item.productName,
            timesSaved: 0,
            totalQuantity: 0
          };
        }
        savedForLaterFrequency[key].timesSaved++;
        savedForLaterFrequency[key].totalQuantity += item.quantity;
      });
    });

    // Convert to arrays and sort
    const topCartProducts = Object.values(productFrequency)
      .sort((a, b) => b.timesAdded - a.timesAdded)
      .slice(0, 10);

    const topSavedProducts = Object.values(savedForLaterFrequency)
      .sort((a, b) => b.timesSaved - a.timesSaved)
      .slice(0, 10);

    // Cart statistics
    const totalCarts = carts.length;
    const averageCartValue = carts.reduce((sum, cart) => sum + (cart.totalPrice || 0), 0) / (totalCarts || 1);
    const averageItemsPerCart = carts.reduce((sum, cart) => sum + (cart.totalItems || 0), 0) / (totalCarts || 1);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalCarts,
          averageCartValue: Math.round(averageCartValue),
          averageItemsPerCart: parseFloat(averageItemsPerCart.toFixed(2)),
          totalItemsInCarts: carts.reduce((sum, cart) => sum + (cart.totalItems || 0), 0),
          totalSavedForLater: carts.reduce((sum, cart) => sum + (cart.savedForLater?.length || 0), 0)
        },
        topCartProducts,
        topSavedProducts,
        activeCarts: carts.slice(0, 20).map(cart => ({
          userId: cart.userId,
          items: cart.items,
          savedForLater: cart.savedForLater,
          totalPrice: cart.totalPrice,
          totalItems: cart.totalItems
        }))
      }
    });
  } catch (error) {
    console.error('Cart analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart analytics'
    });
  }
};

// Get product analytics
exports.getProductAnalytics = async (req, res) => {
  try {
    // Get purchase frequency from orders
    const purchaseData = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            productId: '$items.productId',
            productName: '$items.productName'
          },
          totalPurchases: { $sum: 1 },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          sizes: { $push: '$items.size' }
        }
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: 20 }
    ]);

    // Get products with lowest stock
    const lowStockProducts = await Product.find({
      $expr: {
        $lt: [
          { $add: ['$stock.S', '$stock.M', '$stock.L', '$stock.XL', '$stock.XXL'] },
          10
        ]
      }
    }).limit(15);

    // Get products with no sales
    const allProducts = await Product.find().select('productId name');
    const soldProductIds = new Set(purchaseData.map(p => p._id.productId));
    const noSalesProducts = allProducts.filter(p => !soldProductIds.has(p.productId));

    // Get average rating per product
    const productRatings = await Review.aggregate([
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      { $sort: { averageRating: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topSellingProducts: purchaseData,
        lowStockProducts,
        noSalesProducts,
        productRatings
      }
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product analytics'
    });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedPhones,
      googleUsers,
      usersWithOrders,
      topCustomers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ phoneVerified: true }),
      User.countDocuments({ googleId: { $exists: true, $ne: null } }),
      Order.distinct('userId', { paymentStatus: 'completed' }),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        {
          $group: {
            _id: '$userId',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$amount' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ])
    ]);

    // New users per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const newUsersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          verifiedPhones,
          googleUsers,
          usersWithOrders: usersWithOrders.length,
          conversionRate: ((usersWithOrders.length / totalUsers) * 100).toFixed(2)
        },
        topCustomers,
        newUsersByMonth
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
};

// Get order analytics
exports.getOrderAnalytics = async (req, res) => {
  try {
    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      failedOrders,
      shippedOrders,
      deliveredOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: 'completed' }),
      Order.countDocuments({ paymentStatus: 'pending' }),
      Order.countDocuments({ paymentStatus: 'failed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' })
    ]);

    // Average order value
    const avgOrderValue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$amount' },
          maxValue: { $max: '$amount' },
          minValue: { $min: '$amount' }
        }
      }
    ]);

    // Orders by day of week
    const ordersByDayOfWeek = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top cities by orders
    const topCities = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: '$shippingAddress.city',
          orderCount: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalOrders,
          completedOrders,
          pendingOrders,
          failedOrders,
          shippedOrders,
          deliveredOrders,
          successRate: ((completedOrders / totalOrders) * 100).toFixed(2)
        },
        avgOrderValue: avgOrderValue[0] || { avgValue: 0, maxValue: 0, minValue: 0 },
        ordersByDayOfWeek,
        topCities
      }
    });
  } catch (error) {
    console.error('Order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order analytics'
    });
  }
};

