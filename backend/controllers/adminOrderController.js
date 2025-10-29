const Order = require('../models/Order');
const User = require('../models/User');

// Get all orders with pagination and filtering
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
        { awbCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone addresses');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes) {
      if (!order.notes) order.notes = [];
      order.notes.push(`[Admin] ${notes}`);
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// Update shipping details
exports.updateShippingDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      shiprocketOrderId,
      shiprocketShipmentId,
      awbCode,
      courierName,
      trackingUrl
    } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (shiprocketOrderId) order.shiprocketOrderId = shiprocketOrderId;
    if (shiprocketShipmentId) order.shiprocketShipmentId = shiprocketShipmentId;
    if (awbCode) order.awbCode = awbCode;
    if (courierName) order.courierName = courierName;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    // Auto-update status if shipping details are added
    if (awbCode && order.status === 'paid') {
      order.status = 'processing';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Shipping details updated successfully',
      order
    });
  } catch (error) {
    console.error('Update shipping details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipping details'
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered orders'
      });
    }

    order.status = 'cancelled';
    if (reason) {
      if (!order.notes) order.notes = [];
      order.notes.push(`[Admin Cancelled] ${reason}`);
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// Get order statistics
exports.getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalOrders,
      completedOrders,
      revenue,
      averageOrderValue,
      statusBreakdown
    ] = await Promise.all([
      Order.countDocuments(query),
      Order.countDocuments({ ...query, paymentStatus: 'completed' }),
      Order.aggregate([
        { $match: { ...query, paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { $match: { ...query, paymentStatus: 'completed' } },
        {
          $group: {
            _id: null,
            avg: { $avg: '$amount' },
            min: { $min: '$amount' },
            max: { $max: '$amount' }
          }
        }
      ]),
      Order.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        revenue: revenue[0]?.total || 0,
        averageOrderValue: averageOrderValue[0] || { avg: 0, min: 0, max: 0 },
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get order statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};

// Export orders to CSV data
exports.exportOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    const orderData = orders.map(order => ({
      orderId: order.orderId,
      customerName: order.userId?.name || order.shippingAddress.fullName,
      customerEmail: order.userId?.email || order.shippingAddress.email,
      amount: order.amount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join(', '),
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      awbCode: order.awbCode || 'N/A',
      courierName: order.courierName || 'N/A',
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      data: orderData
    });
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export orders'
    });
  }
};

