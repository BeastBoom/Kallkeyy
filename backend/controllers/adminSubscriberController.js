const Subscriber = require('../models/Subscriber');

// Get all subscribers with pagination
exports.getAllSubscribers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      isActive,
      search,
      sortBy = 'subscribedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [subscribers, total] = await Promise.all([
      Subscriber.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Subscriber.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        subscribers,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
};

// Get subscriber statistics
exports.getSubscriberStats = async (req, res) => {
  try {
    const [
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers,
      subscribersByMonth
    ] = await Promise.all([
      Subscriber.countDocuments(),
      Subscriber.countDocuments({ isActive: true }),
      Subscriber.countDocuments({ isActive: false }),
      Subscriber.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$subscribedAt' },
              month: { $month: '$subscribedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        activeSubscribers,
        inactiveSubscribers,
        subscribersByMonth
      }
    });
  } catch (error) {
    console.error('Get subscriber stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriber statistics'
    });
  }
};

// Add subscriber manually
exports.addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if already exists
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed'
      });
    }

    const subscriber = new Subscriber({
      email: email.toLowerCase(),
      isActive: true
    });

    await subscriber.save();

    res.status(201).json({
      success: true,
      message: 'Subscriber added successfully',
      subscriber
    });
  } catch (error) {
    console.error('Add subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add subscriber'
    });
  }
};

// Toggle subscriber status
exports.toggleSubscriberStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Subscriber.findById(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    subscriber.isActive = !subscriber.isActive;
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: `Subscriber ${subscriber.isActive ? 'activated' : 'deactivated'} successfully`,
      subscriber
    });
  } catch (error) {
    console.error('Toggle subscriber status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle subscriber status'
    });
  }
};

// Delete subscriber
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Subscriber.findByIdAndDelete(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber'
    });
  }
};

// Bulk delete inactive subscribers
exports.bulkDeleteInactive = async (req, res) => {
  try {
    const result = await Subscriber.deleteMany({ isActive: false });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} inactive subscribers`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inactive subscribers'
    });
  }
};

// Export subscribers to CSV data
exports.exportSubscribers = async (req, res) => {
  try {
    const { isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subscribers = await Subscriber.find(query)
      .sort({ subscribedAt: -1 });

    const subscriberData = subscribers.map(sub => ({
      email: sub.email,
      isActive: sub.isActive,
      subscribedAt: sub.subscribedAt
    }));

    res.status(200).json({
      success: true,
      data: subscriberData
    });
  } catch (error) {
    console.error('Export subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export subscribers'
    });
  }
};

