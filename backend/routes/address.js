const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { setCorsHeaders } = require('../utils/corsHelper');

// GET all addresses for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
});

// POST - Add new address
router.post('/', auth, async (req, res) => {
  try {
    const { fullName, phone, pincode, city, state, address, isDefault } = req.body;

    // ✅ Validate all required fields
    if (!fullName || !phone || !pincode || !city || !state || !address) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        field: 'all'
      });
    }

    // ✅ Validate fullName - only alphabets, spaces, and full stops
    if (!/^[A-Za-z\s.]+$/.test(fullName)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Name can only contain letters, spaces, and full stops (e.g., S.K. Das)',
        field: 'fullName'
      });
    }

    // ✅ Validate fullName length
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters',
        field: 'fullName'
      });
    }

    // ✅ Validate address - allow letters, numbers, spaces, dots, commas, hyphens, and slashes
    if (!/^[A-Za-z0-9\s.,-\/]+$/.test(address)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Address can only contain letters, numbers, spaces, dots, commas, hyphens, and slashes',
        field: 'address'
      });
    }

    // ✅ Validate address length
    if (address.trim().length < 5 || address.trim().length > 500) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Address must be between 5 and 500 characters',
        field: 'address'
      });
    }

    // ✅ Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits',
        field: 'phone'
      });
    }

    // ✅ Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Pincode must be exactly 6 digits',
        field: 'pincode'
      });
    }

    // Find user and add address
    const user = await User.findById(req.user._id);
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If this is the first address or marked as default, set it as default
    if (user.addresses.length === 0 || isDefault) {
      // Remove default from all existing addresses
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      fullName: fullName.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      isDefault: user.addresses.length === 0 || isDefault || false
    });

    await user.save();

    setCorsHeaders(req, res);
    res.status(201).json({
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
});

// PUT - Update address
router.put('/:addressId', auth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { fullName, phone, pincode, city, state, address, isDefault } = req.body;

    // ✅ Validate all required fields
    if (!fullName || !phone || !pincode || !city || !state || !address) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        field: 'all'
      });
    }

    // ✅ Validate fullName
    if (!/^[A-Za-z\s.]+$/.test(fullName)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Name can only contain letters, spaces, and full stops (e.g., S.K. Das)',
        field: 'fullName'
      });
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters',
        field: 'fullName'
      });
    }

    // ✅ Validate address - allow letters, numbers, spaces, dots, commas, hyphens, and slashes
    if (!/^[A-Za-z0-9\s.,-\/]+$/.test(address)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Address can only contain letters, numbers, spaces, dots, commas, hyphens, and slashes',
        field: 'address'
      });
    }

    if (address.trim().length < 5 || address.trim().length > 500) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Address must be between 5 and 500 characters',
        field: 'address'
      });
    }

    // ✅ Validate phone
    if (!/^\d{10}$/.test(phone)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits',
        field: 'phone'
      });
    }

    // ✅ Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Pincode must be exactly 6 digits',
        field: 'pincode'
      });
    }

    // Find user and update address
    const user = await User.findById(req.user._id);
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

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

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      fullName: fullName.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      isDefault: isDefault || user.addresses[addressIndex].isDefault
    };

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
});

// DELETE - Remove address
router.delete('/:addressId', auth, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove address
    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, set first address as default
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
});

// PATCH - Set default address
router.patch('/:addressId/default', auth, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove default from all addresses
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
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
});

module.exports = router;