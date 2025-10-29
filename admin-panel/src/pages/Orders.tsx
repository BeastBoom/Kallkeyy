import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Search, ShoppingCart, Download, Filter, Calendar } from 'lucide-react'

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const result = await adminAPI.getOrders()
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

  const filteredOrders = orders
    .filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
      const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesDateRange = true
      if (startDate || endDate) {
        const orderDate = new Date(order.createdAt)
        if (startDate) matchesDateRange = matchesDateRange && orderDate >= new Date(startDate)
        if (endDate) matchesDateRange = matchesDateRange && orderDate <= new Date(endDate + 'T23:59:59')
      }
      
      return matchesStatus && matchesPayment && matchesSearch && matchesDateRange
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
              {['all', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
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
            {(statusFilter !== 'all' || paymentFilter !== 'all' || startDate || endDate || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setPaymentFilter('all')
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
                      <p className="font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}

