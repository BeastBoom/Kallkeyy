import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Search, ShoppingCart, Download, Filter, Calendar, Eye, Truck, RefreshCw, X } from 'lucide-react'

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnDecision, setReturnDecision] = useState('')

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders()
    }, searchTerm ? 500 : 0) // Only debounce if there's a search term
    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, paymentFilter, paymentMethodFilter, startDate, endDate])

  const fetchOrders = async () => {
    try {
      const params: any = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (paymentFilter !== 'all') params.paymentStatus = paymentFilter
      if (paymentMethodFilter !== 'all') params.paymentMethod = paymentMethodFilter
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (searchTerm) params.search = searchTerm

      const result = await adminAPI.getOrders(params)
      if (result.success) {
        setOrders(result.orders)
      }
    } catch (error: any) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus })
      toast.success('Order status updated')
      fetchOrders()
    } catch (error: any) {
      toast.error('Failed to update order status')
    }
  }

  const handleExport = async () => {
    try {
      const result = await adminAPI.exportOrders({ status: statusFilter !== 'all' ? statusFilter : undefined })
      if (result.success) {
        // Convert data array to CSV
        const data = result.data || []
        if (data.length === 0) {
          toast.error('No orders to export')
          return
        }

        // Create CSV header
        const headers = Object.keys(data[0]).join(',')
        
        // Create CSV rows
        const rows = data.map((row: any) => 
          Object.values(row).map((val: any) => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          ).join(',')
        )
        
        const csv = [headers, ...rows].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        toast.success('Orders exported successfully')
      }
    } catch (error: any) {
      toast.error('Failed to export orders')
    }
  }

  // Server-side filtering is now handled, so we just use the orders directly
  const filteredOrders = orders

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'returned':
        return 'bg-gray-100 text-gray-800'
      case 'return_requested':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleReturnRequest = (order: any) => {
    setSelectedOrder(order)
    setShowReturnModal(true)
  }

  const handleReturnDecision = async () => {
    if (!selectedOrder || !returnDecision) {
      toast.error('Please select a decision')
      return
    }

    try {
      const newStatus = returnDecision === 'approve' ? 'returned' : 'delivered'
      await adminAPI.updateOrderStatus(selectedOrder._id, { 
        status: newStatus,
        returnRequested: returnDecision === 'reject' ? false : selectedOrder.returnRequested
      })
      toast.success(`Return ${returnDecision === 'approve' ? 'approved' : 'rejected'} successfully`)
      setShowReturnModal(false)
      setReturnDecision('')
      fetchOrders()
    } catch (error: any) {
      toast.error('Failed to process return request')
    }
  }

  // Shipping update handler is not used currently; removed to satisfy TS noUnusedLocals

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Manage customer orders ({filteredOrders.length} orders)</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter Pills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Status:</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'confirmed', 'paid', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'return_requested' ? 'Return Requested' : status === 'confirmed' ? 'Confirmed' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filters Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Additional Filters:</span>
            
            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="all">All Payment Methods</option>
              <option value="razorpay">Razorpay (Online)</option>
              <option value="cod">Cash on Delivery (COD)</option>
            </select>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                placeholder="Start Date"
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                placeholder="End Date"
              />
            </div>

            {/* Clear Filters */}
            {(statusFilter !== 'all' || paymentFilter !== 'all' || paymentMethodFilter !== 'all' || startDate || endDate || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setPaymentFilter('all')
                  setPaymentMethodFilter('all')
                  setStartDate('')
                  setEndDate('')
                  setSearchTerm('')
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">#{order.orderId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{order.userId?.name || order.shippingAddress?.fullName || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{order.userId?.email || order.shippingAddress?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">₹{order.amount?.toLocaleString() || order.totalAmount?.toLocaleString()}</p>
                      {order.coupon && (
                        <p className="text-xs text-green-600 mt-1">Coupon: {order.coupon.code} (-₹{order.coupon.discountAmount?.toLocaleString() || 0})</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status === 'return_requested' ? 'Return Requested' : order.status === 'confirmed' ? 'Confirmed' : order.status}
                      </span>
                      {order.paymentMethod && (
                        <span className="block mt-1 text-xs text-gray-500">
                          {order.paymentMethod === 'cod' ? '💰 COD' : '💳 Online'}
                        </span>
                      )}
                      {order.returnRequested && (
                        <span className="block mt-1 text-xs text-amber-600 font-medium">
                          Return Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.trackingUrl ? (
                        <a 
                          href={order.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <Truck className="w-4 h-4" />
                          Track
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                      {order.courierName && (
                        <p className="text-xs text-gray-500 mt-1">{order.courierName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {order.returnRequested && (
                          <button
                            onClick={() => handleReturnRequest(order)}
                            className="text-amber-600 hover:text-amber-800 p-1"
                            title="Process Return"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        )}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                    <p className="text-lg font-semibold text-gray-900">#{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                    <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status === 'return_requested' ? 'Return Requested' : selectedOrder.status === 'confirmed' ? 'Confirmed' : selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                    <p className="text-gray-900 text-sm font-semibold">
                      {selectedOrder.paymentMethod === 'cod' ? '💰 Cash on Delivery (COD)' : '💳 Razorpay (Online Payment)'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                      selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.paymentStatus || 'N/A'}
                    </span>
                  </div>
                  {selectedOrder.paymentMethod !== 'cod' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Payment ID</h3>
                      <p className="text-gray-900 text-sm break-all">{selectedOrder.razorpayPaymentId || 'N/A'}</p>
                    </div>
                  )}
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.shippingAddress?.fullName}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.shippingAddress?.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.shippingAddress?.phone}</p>
                    <p><span className="font-medium">Address:</span> {selectedOrder.shippingAddress?.address}</p>
                    <p><span className="font-medium">City:</span> {selectedOrder.shippingAddress?.city}</p>
                    <p><span className="font-medium">State:</span> {selectedOrder.shippingAddress?.state}</p>
                    <p><span className="font-medium">Pincode:</span> {selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="font-semibold text-gray-900 mt-1">₹{item.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                {selectedOrder.trackingUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Courier:</span> {selectedOrder.courierName || 'N/A'}</p>
                      <p><span className="font-medium">AWB Code:</span> {selectedOrder.awbCode || 'N/A'}</p>
                      {selectedOrder.trackingUrl && (
                        <a 
                          href={selectedOrder.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <Truck className="w-4 h-4" />
                          Track Package
                        </a>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <p><span className="font-medium">Estimated Delivery:</span> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Return Info */}
                {selectedOrder.returnRequested && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Return Request</h3>
                    <div className="bg-amber-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Reason:</span> {selectedOrder.returnReason || 'N/A'}</p>
                      <p><span className="font-medium">Comments:</span> {selectedOrder.returnComments || 'N/A'}</p>
                      <p><span className="font-medium">Requested At:</span> {selectedOrder.returnRequestedAt ? new Date(selectedOrder.returnRequestedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* Coupon Information */}
                {selectedOrder.coupon && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Coupon Applied</h3>
                    <div className="bg-green-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Code:</span> {selectedOrder.coupon.code}</p>
                      <p><span className="font-medium">Name:</span> {selectedOrder.coupon.name || 'N/A'}</p>
                      <p><span className="font-medium">Discount:</span> 
                        {selectedOrder.coupon.discountType === 'percentage' 
                          ? `${selectedOrder.coupon.discountValue}%` 
                          : `₹${selectedOrder.coupon.discountValue}`}
                        {selectedOrder.coupon.discountAmount && (
                          <span className="text-green-600 font-semibold"> (₹{selectedOrder.coupon.discountAmount.toLocaleString()} saved)</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    {selectedOrder.coupon && (
                      <>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Subtotal:</span>
                          <span>₹{((selectedOrder.amount || 0) + (selectedOrder.coupon.discountAmount || 0)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                          <span>Discount ({selectedOrder.coupon.code}):</span>
                          <span>-₹{selectedOrder.coupon.discountAmount?.toLocaleString() || 0}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-gray-900">₹{selectedOrder.amount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Request Modal */}
        {showReturnModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Process Return Request</h2>
                <button
                  onClick={() => {
                    setShowReturnModal(false)
                    setReturnDecision('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Order #{selectedOrder.orderId}</h3>
                  <p><span className="font-medium">Customer:</span> {selectedOrder.shippingAddress?.fullName}</p>
                  <p><span className="font-medium">Reason:</span> {selectedOrder.returnReason || 'N/A'}</p>
                  <p><span className="font-medium">Comments:</span> {selectedOrder.returnComments || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="returnDecision"
                        value="approve"
                        checked={returnDecision === 'approve'}
                        onChange={(e) => setReturnDecision(e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-gray-900">Approve Return</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="returnDecision"
                        value="reject"
                        checked={returnDecision === 'reject'}
                        onChange={(e) => setReturnDecision(e.target.value)}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-gray-900">Reject Return</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleReturnDecision}
                    disabled={!returnDecision}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Submit Decision
                  </button>
                  <button
                    onClick={() => {
                      setShowReturnModal(false)
                      setReturnDecision('')
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

