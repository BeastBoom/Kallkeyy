const Product = require('../models/Product');

// Get all products with pagination and filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      inStock, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filters
    if (category) query.category = category;
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      price,
      category,
      description,
      images,
      material,
      stock,
      tag
    } = req.body;

    // Validation
    if (!productId || !name || !price || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({ productId });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this ID already exists'
      });
    }

    const product = new Product({
      productId,
      name,
      price,
      category,
      description,
      images: images || [],
      material: material || [],
      stock: stock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
      tag
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        product[key] = updates[key];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Update product stock
exports.updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;

    if (!stock || typeof stock !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock data'
      });
    }

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.stock = {
      S: stock.S !== undefined ? stock.S : product.stock.S,
      M: stock.M !== undefined ? stock.M : product.stock.M,
      L: stock.L !== undefined ? stock.L : product.stock.L,
      XL: stock.XL !== undefined ? stock.XL : product.stock.XL,
      XXL: stock.XXL !== undefined ? stock.XXL : product.stock.XXL
    };

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({ productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Bulk update stock
exports.bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, stock }

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Updates must be an array'
      });
    }

    const results = [];

    for (const update of updates) {
      try {
        const product = await Product.findOne({ productId: update.productId });
        
        if (product) {
          product.stock = {
            S: update.stock.S !== undefined ? update.stock.S : product.stock.S,
            M: update.stock.M !== undefined ? update.stock.M : product.stock.M,
            L: update.stock.L !== undefined ? update.stock.L : product.stock.L,
            XL: update.stock.XL !== undefined ? update.stock.XL : product.stock.XL,
            XXL: update.stock.XXL !== undefined ? update.stock.XXL : product.stock.XXL
          };
          
          await product.save();
          results.push({ productId: update.productId, success: true });
        } else {
          results.push({ productId: update.productId, success: false, error: 'Not found' });
        }
      } catch (error) {
        results.push({ productId: update.productId, success: false, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk update completed',
      results
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk update'
    });
  }
};

