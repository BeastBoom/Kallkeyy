const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');

// All routes require authentication
router.get('/', auth, getAddresses);
router.post('/', auth, addAddress);
router.put('/:addressId', auth, updateAddress);
router.delete('/:addressId', auth, deleteAddress);
router.patch('/:addressId/default', auth, setDefaultAddress);

module.exports = router;
