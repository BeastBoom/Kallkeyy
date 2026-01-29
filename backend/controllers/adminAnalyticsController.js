const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { setCorsHeaders } = require('../utils/responseHelper');

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue analytics
    const currentMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          paymentStatus: 'completed',
          status: { $nin: ['cancelled', 'failed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          paymentStatus: 'completed',
          status: { $nin: ['cancelled', 'failed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Payment method distribution
    const paymentMethodDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    // User registration analytics
    const userRegistrations = await User.aggregate([
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

    const analytics = {
      revenue: {
        currentMonth: currentMonthRevenue[0] || { total: 0, count: 0 },
        lastMonth: lastMonthRevenue[0] || { total: 0, count: 0 },
        growth: calculateGrowth(currentMonthRevenue[0]?.total || 0, lastMonthRevenue[0]?.total || 0)
      },
      orders: {
        statusDistribution: orderStatusDistribution,
        paymentMethods: paymentMethodDistribution,
        recentOrders
      },
      products: {
        topSelling: topProducts
      },
      users: {
        registrations: userRegistrations
      }
    };

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get payment reconciliation report
exports.getPaymentReconciliation = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const matchQuery = {
      createdAt: {
        $gte: startDate ? new Date(startDate) : new Date('2020-01-01'),
        $lte: endDate ? new Date(endDate) : new Date()
      }
    };

    if (status) {
      matchQuery.status = status;
    }

    const reconciliationData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            paymentMethod: '$paymentMethod',
            paymentStatus: '$paymentStatus'
          },
          orders: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          ordersByStatus: {
            $push: {
              status: '$status',
              count: 1,
              amount: '$amount'
            }
          }
        }
      },
      { $sort: { '_id.date': 1, '_id.paymentMethod': 1 } }
    ]);

    // Calculate totals
    const totals = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$amount', 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$amount', 0] }
          },
          failedOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
          },
          failedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, '$amount', 0] }
          }
        }
      }
    ]);

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      reconciliation: {
        data: reconciliationData,
        totals: totals[0] || {}
      }
    });

  } catch (error) {
    console.error('Payment reconciliation error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment reconciliation',
      error: error.message
    });
  }
};

// Get inventory report
exports.getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find({}, {
      productId: 1,
      name: 1,
      stock: 1,
      sizes: 1,
      price: 1,
      category: 1,
      createdAt: 1
    }).sort({ createdAt: -1 });

    // Calculate inventory value and low stock items
    const inventoryReport = products.map(product => {
      const totalStock = typeof product.stock === 'object' 
        ? Object.values(product.stock).reduce((sum, qty) => sum + qty, 0)
        : product.stock || 0;

      const inventoryValue = totalStock * product.price;
      const lowStock = totalStock < 5; // Threshold for low stock

      return {
        ...product.toObject(),
        totalStock,
        inventoryValue,
        lowStock,
        lastRestocked: product.createdAt
      };
    });

    // Summary statistics
    const summary = {
      totalProducts: products.length,
      totalInventoryValue: inventoryReport.reduce((sum, p) => sum + p.inventoryValue, 0),
      lowStockProducts: inventoryReport.filter(p => p.lowStock).length,
      outOfStockProducts: inventoryReport.filter(p => p.totalStock === 0).length
    };

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      inventory: {
        products: inventoryReport,
        summary
      }
    });

  } catch (error) {
    console.error('Inventory report error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory report',
      error: error.message
    });
  }
};

// Get refund analytics
exports.getRefundAnalytics = async (req, res) => {
  try {
    const refunds = await Order.find({
      'refundDetails.refundId': { $exists: true }
    }).populate('userId', 'name email');

    const refundStats = {
      totalRefunds: refunds.length,
      totalRefundAmount: refunds.reduce((sum, order) => sum + (order.refundDetails.refundAmount || 0), 0),
      refundRate: 0,
      refundsByReason: {},
      refundsByStatus: {},
      refundsByMonth: {}
    };

    // Calculate refund rate
    const totalOrders = await Order.countDocuments();
    refundStats.refundRate = totalOrders > 0 ? (refunds.length / totalOrders) * 100 : 0;

    // Group by reason
    refunds.forEach(order => {
      const reason = order.refundDetails.refundReason || 'Unknown';
      refundStats.refundsByReason[reason] = (refundStats.refundsByReason[reason] || 0) + 1;
    });

    // Group by status
    refunds.forEach(order => {
      const status = order.refundDetails.refundStatus || 'Unknown';
      refundStats.refundsByStatus[status] = (refundStats.refundsByStatus[status] || 0) + 1;
    });

    // Group by month
    refunds.forEach(order => {
      const month = new Date(order.refundDetails.refundedAt).toISOString().slice(0, 7);
      refundStats.refundsByMonth[month] = (refundStats.refundsByMonth[month] || 0) + 1;
    });

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      refunds: {
        orders: refunds,
        stats: refundStats
      }
    });

  } catch (error) {
    console.error('Refund analytics error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund analytics',
      error: error.message
    });
  }
};

// Helper function to calculate growth percentage
function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Manual order reconciliation endpoint
exports.reconcileOrders = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if payment was actually captured in Razorpay
    if (order.razorpayPaymentId) {
      try {
        const payment = await require('razorpay').payments.fetch(order.razorpayPaymentId);
        
        if (payment.status === 'captured') {
          // Update order status if payment was captured but order wasn't updated
          if (order.paymentStatus !== 'completed') {
            order.paymentStatus = 'completed';
            order.status = 'confirmed';
            await order.save();
            
            return res.status(200).json({
              success: true,
              message: 'Order reconciled successfully',
              order
            });
          }
        } else if (payment.status === 'failed') {
          order.paymentStatus = 'failed';
          order.status = 'failed';
          await order.save();
          
          return res.status(200).json({
            success: true,
            message: 'Order marked as failed',
            order
          });
        }
      } catch (error) {
        console.error('Razorpay reconciliation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to reconcile with Razorpay',
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order reconciliation completed',
      order
    });

  } catch (error) {
    console.error('Order reconciliation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reconcile order',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getPaymentReconciliation,
  getInventoryReport,
  getRefundAnalytics,
  reconcileOrders
};