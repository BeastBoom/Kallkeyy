import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Edit2, Trash2, Search, Package, X, Filter } from 'lucide-react'

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [stockProduct, setStockProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    productId: '',
    name: '',
    price: '',
    category: 'hoodie',
    description: '',
    images: ['', '', ''],
    material: [''],
    tag: ''
  })
  const [stockForm, setStockForm] = useState({
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const result = await adminAPI.getProducts()
      if (result.success) {
        setProducts(result.products)
      }
    } catch (error: any) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await adminAPI.deleteProduct(productId)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const openStockModal = (product: any) => {
    setStockProduct(product)
    // Only set M, L, XL, XXL - ignore S size
    setStockForm({
      M: product.stock?.M || 0,
      L: product.stock?.L || 0,
      XL: product.stock?.XL || 0,
      XXL: product.stock?.XXL || 0
    })
    setShowStockModal(true)
  }

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Include S from existing product, only update M, L, XL, XXL
      const updatedStock = {
        S: stockProduct.stock?.S || 0, // Keep existing S value
        ...stockForm
      }
      await adminAPI.updateStock(stockProduct.productId, updatedStock)
      toast.success('Stock updated successfully')
      setShowStockModal(false)
      fetchProducts()
    } catch (error: any) {
      toast.error('Failed to update stock')
    }
  }

  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setProductForm({
      productId: product.productId || '',
      name: product.name || '',
      price: product.price?.toString() || '',
      category: product.category || 'hoodie',
      description: product.description || '',
      images: product.images?.length > 0 ? product.images : ['', '', ''],
      material: product.material?.length > 0 ? product.material : [''],
      tag: product.tag || ''
    })
    setShowEditModal(true)
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productForm.name || !productForm.price || !productForm.description) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const productData = {
        name: productForm.name,
        price: productForm.price,
        category: productForm.category,
        description: productForm.description,
        images: productForm.images.filter(img => img.trim() !== ''),
        material: productForm.material.filter(mat => mat.trim() !== ''),
        tag: productForm.tag
      }

      await adminAPI.updateProduct(editingProduct.productId, productData)
      toast.success('Product updated successfully')
      
      setShowEditModal(false)
      fetchProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    }
  }

  const updateImageField = (index: number, value: string) => {
    const newImages = [...productForm.images]
    newImages[index] = value
    setProductForm({ ...productForm, images: newImages })
  }

  const removeImageField = (index: number) => {
    const newImages = productForm.images.filter((_, i) => i !== index)
    setProductForm({ ...productForm, images: newImages.length > 0 ? newImages : [''] })
  }

  const addImageField = () => {
    setProductForm({ ...productForm, images: [...productForm.images, ''] })
  }

  const updateMaterialField = (index: number, value: string) => {
    const newMaterial = [...productForm.material]
    newMaterial[index] = value
    setProductForm({ ...productForm, material: newMaterial })
  }

  const removeMaterialField = (index: number) => {
    const newMaterial = productForm.material.filter((_, i) => i !== index)
    setProductForm({ ...productForm, material: newMaterial.length > 0 ? newMaterial : [''] })
  }

  const addMaterialField = () => {
    setProductForm({ ...productForm, material: [...productForm.material, ''] })
  }

  // Get unique tags for filter
  const uniqueTags = Array.from(new Set(products.map(p => p.tag).filter(t => t)))

  // Filter products - count only M, L, XL, XXL for stock
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    const matchesTag = tagFilter === 'all' || product.tag === tagFilter
    
    let matchesStock = true
    if (stockFilter === 'in-stock') {
      // Only count M, L, XL, XXL (not S)
      const totalStock = product.stock ? 
        (product.stock.M || 0) + (product.stock.L || 0) + (product.stock.XL || 0) + (product.stock.XXL || 0) : 0
      matchesStock = totalStock > 0
    } else if (stockFilter === 'out-of-stock') {
      const totalStock = product.stock ? 
        (product.stock.M || 0) + (product.stock.L || 0) + (product.stock.XL || 0) + (product.stock.XXL || 0) : 0
      matchesStock = totalStock === 0
    } else if (stockFilter === 'low-stock') {
      const totalStock = product.stock ? 
        (product.stock.M || 0) + (product.stock.L || 0) + (product.stock.XL || 0) + (product.stock.XXL || 0) : 0
      matchesStock = totalStock > 0 && totalStock <= 20
    }
    
    return matchesSearch && matchesCategory && matchesTag && matchesStock
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog ({filteredProducts.length} products)</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="hoodie">Hoodie</option>
              <option value="tshirt">T-Shirt</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (≤20)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            {/* Tag Filter */}
            {uniqueTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="all">All Tags</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}

            {/* Clear Filters */}
            {(categoryFilter !== 'all' || stockFilter !== 'all' || tagFilter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setCategoryFilter('all')
                  setStockFilter('all')
                  setTagFilter('all')
                  setSearchTerm('')
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
              {(categoryFilter !== 'all' || stockFilter !== 'all' || tagFilter !== 'all' || searchTerm) && (
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock (M/L/XL/XXL)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tag
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const stock = product.stock || { M: 0, L: 0, XL: 0, XXL: 0 }
                    // Only count M, L, XL, XXL
                    const totalStock = (stock.M || 0) + (stock.L || 0) + (stock.XL || 0) + (stock.XXL || 0)
                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.productId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">₹{product.price}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-2 text-xs">
                              <span className={stock.M > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>M:{stock.M || 0}</span>
                              <span className={stock.L > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>L:{stock.L || 0}</span>
                              <span className={stock.XL > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>XL:{stock.XL || 0}</span>
                              <span className={stock.XXL > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>XXL:{stock.XXL || 0}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              totalStock === 0
                                ? 'bg-red-100 text-red-800'
                                : totalStock <= 20
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              Total: {totalStock}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {product.tag && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.tag}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openStockModal(product)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              Update Stock
                            </button>
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit Product"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.productId, product.name)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete Product"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Stock Update Modal - Simplified & Better Layout */}
      {showStockModal && stockProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Update Stock</h3>
                <p className="text-sm text-gray-600 mt-1">{stockProduct.name}</p>
              </div>
              <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['M', 'L', 'XL', 'XXL'].map((size) => (
                  <div key={size} className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Size {size}</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={stockForm[size as keyof typeof stockForm]}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                        setStockForm({ ...stockForm, [size]: isNaN(value) ? 0 : value })
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal - Improved Layout */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product ID
                      </label>
                      <input
                        type="text"
                        value={productForm.productId}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="1999"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="hoodie">Hoodie</option>
                        <option value="tshirt">T-Shirt</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                      <input
                        type="text"
                        value={productForm.tag}
                        onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="new, bestseller, sale"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  <div className="space-y-2">
                    {productForm.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder={`Image URL ${index + 1}`}
                        />
                        {productForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      + Add Image URL
                    </button>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Materials</label>
                  <div className="space-y-2">
                    {productForm.material.map((mat, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={mat}
                          onChange={(e) => updateMaterialField(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder={`Material ${index + 1}`}
                        />
                        {productForm.material.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMaterialField(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMaterialField}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      + Add Material
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
