const User = require('../models/User');
const { setCorsHeaders } = require('../utils/responseHelper');
const connectDB = require('../config/db');

// Helper function to format phone number (same as in paymentController.js)
function formatPhoneNumber(phone) {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // If starts with country code (91), remove it
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.substring(2);
  }
  // Return last 10 digits
  return cleaned.slice(-10);
}

// Get all user addresses
exports.getAddresses = async (req, res) => {
  try {
    await connectDB();

    const userId = req.user._id;
    const user = await User.findById(userId).select('addresses');

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      addresses: user.addresses || []
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    setCorsHeaders(req, res);
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
    await connectDB();

    const userId = req.user._id;
    const { fullName, phone, pincode, city, state, address, isDefault } = req.body;

    // Validation
    if (!fullName || !phone || !pincode || !city || !state || !address) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    // Validate and format phone number (must be 10 digits for Shiprocket)
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone || formattedPhone.length !== 10 || !/^\d{10}$/.test(formattedPhone)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Phone must be exactly 10 digits.'
      });
    }

    // Validate pincode (must be 6 digits for India)
    const formattedPincode = pincode.trim().replace(/\D/g, '');
    if (formattedPincode.length !== 6) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode. Pincode must be exactly 6 digits.'
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

    // Add new address (use formatted phone and pincode)
    user.addresses.push({
      fullName,
      phone: formattedPhone, // Use formatted phone
      pincode: formattedPincode, // Use formatted pincode
      city,
      state,
      address,
      isDefault: user.addresses.length === 0 || isDefault
    });

    await user.save();

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });

  } catch (error) {
    console.error('Add address error:', error);
    setCorsHeaders(req, res);
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
    await connectDB();

    const userId = req.user._id;
    const { addressId } = req.params;
    const { fullName, phone, pincode, city, state, address, isDefault } = req.body;

    // Validate and format phone number (must be 10 digits for Shiprocket)
    if (phone) {
      const formattedPhone = formatPhoneNumber(phone);
      if (!formattedPhone || formattedPhone.length !== 10 || !/^\d{10}$/.test(formattedPhone)) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number. Phone must be exactly 10 digits.'
        });
      }
    }

    // Validate pincode (must be 6 digits for India)
    if (pincode) {
      const formattedPincode = pincode.trim().replace(/\D/g, '');
      if (formattedPincode.length !== 6) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'Invalid pincode. Pincode must be exactly 6 digits.'
        });
      }
    }

    const user = await User.findById(userId);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

    if (addressIndex === -1) {
      setCorsHeaders(req, res);
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

    // Update address fields (use formatted phone and pincode if provided)
    if (fullName) user.addresses[addressIndex].fullName = fullName;
    if (phone) user.addresses[addressIndex].phone = formatPhoneNumber(phone);
    if (pincode) user.addresses[addressIndex].pincode = pincode.trim().replace(/\D/g, '');
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (address) user.addresses[addressIndex].address = address;
    if (isDefault !== undefined) {
      user.addresses[addressIndex].isDefault = isDefault;
    }

    await user.save();

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });

  } catch (error) {
    console.error('Update address error:', error);
    setCorsHeaders(req, res);
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
    await connectDB();

    const userId = req.user._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

    if (addressIndex === -1) {
      setCorsHeaders(req, res);
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

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });

  } catch (error) {
    console.error('Delete address error:', error);
    setCorsHeaders(req, res);
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
    await connectDB();

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
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    user.addresses[addressIndex].isDefault = true;
    await user.save();

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Default address updated',
      addresses: user.addresses
    });

  } catch (error) {
    console.error('Set default address error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
};
