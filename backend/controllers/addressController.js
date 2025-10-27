const User = require('../models/User');

// Get all user addresses
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('addresses');

    res.status(200).json({
      success: true,
      addresses: user.addresses || []
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, pincode, city, state, address, isDefault } = req.body;

    // Validation
    if (!fullName || !phone || !pincode || !city || !state || !address) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    const user = await User.findById(userId);

    // If this is the first address or set as default, make it default
    if (user.addresses.length === 0 || isDefault) {
      // Remove default from other addresses
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      fullName,
      phone,
      pincode,
      city,
      state,
      address,
      isDefault: user.addresses.length === 0 || isDefault
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;
    const { fullName, phone, pincode, city, state, address, isDefault } = req.body;

    const user = await User.findById(userId);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, remove default from others
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      fullName,
      phone,
      pincode,
      city,
      state,
      address,
      isDefault: isDefault || user.addresses[addressIndex].isDefault
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, make first address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    
    // Remove default from all addresses
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    user.addresses[addressIndex].isDefault = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      addresses: user.addresses
    });

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
};
