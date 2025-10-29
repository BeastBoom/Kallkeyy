import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { BarChart3, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('cart')
  const [cartAnalytics, setCartAnalytics] = useState<any>(null)
  const [productAnalytics, setProductAnalytics] = useState<any>(null)
  const [userAnalytics, setUserAnalytics] = useState<any>(null)
  const [orderAnalytics, setOrderAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllAnalytics()
  }, [])

  const fetchAllAnalytics = async () => {
    try {
      const [cart, product, user, order] = await Promise.all([
        adminAPI.getCartAnalytics(),
        adminAPI.getProductAnalytics(),
        adminAPI.getUserAnalytics(),
        adminAPI.getOrderAnalytics()
      ])

      setCartAnalytics(cart.data)
      setProductAnalytics(product.data)
      setUserAnalytics(user.data)
      setOrderAnalytics(order.data)
    } catch (error: any) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

  const tabs = [
    { id: 'cart', label: 'Cart Analytics', icon: ShoppingCart },
    { id: 'product', label: 'Product Analytics', icon: Package },
    { id: 'user', label: 'User Analytics', icon: Users },
    { id: 'order', label: 'Order Analytics', icon: BarChart3 },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Business insights and metrics</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-2 flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Cart Analytics */}
        {activeTab === 'cart' && cartAnalytics && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Active Carts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{cartAnalytics.statistics?.totalCarts || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Avg Cart Value</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₹{cartAnalytics.statistics?.averageCartValue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Saved for Later</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{cartAnalytics.statistics?.totalSavedForLater || 0}</p>
              </div>
            </div>

            {/* Most Added Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Most Added to Cart (Top 10)</h3>
              <div className="space-y-3">
                {cartAnalytics.topCartProducts?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">Total Quantity: {item.totalQuantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{item.timesAdded}</p>
                      <p className="text-xs text-gray-500">times added</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Analytics */}
        {activeTab === 'product' && productAnalytics && (
          <div className="space-y-6">
            {/* Best Sellers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="space-y-3">
                {productAnalytics.topSellingProducts?.slice(0, 10).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product._id.productName}</p>
                      <p className="text-sm text-gray-600">Quantity Sold: {product.totalQuantitySold}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">₹{product.totalRevenue?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500">{product.totalPurchases} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                Low Stock Alerts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productAnalytics.lowStockProducts?.map((product: any) => (
                  <div key={product._id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Product ID: <span className="font-bold text-orange-600">{product.productId}</span>
                    </p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {product.stock && Object.entries(product.stock).map(([size, qty]: any) => (
                        <span key={size} className={`text-xs px-2 py-1 rounded ${qty === 0 ? 'bg-red-100 text-red-800' : 'bg-white'}`}>
                          {size}: {qty}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Analytics */}
        {activeTab === 'user' && userAnalytics && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userAnalytics.overview?.totalUsers || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Users with Orders</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{userAnalytics.overview?.usersWithOrders || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{userAnalytics.overview?.conversionRate || 0}%</p>
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Customers by Spending</h3>
              <div className="space-y-3">
                {userAnalytics.topCustomers?.map((customer: any, index: number) => (
                  <div key={customer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{customer.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">₹{customer.totalSpent?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500">{customer.totalOrders || 0} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Order Analytics */}
        {activeTab === 'order' && orderAnalytics && (
          <div className="space-y-6">
            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{orderAnalytics.overview?.totalOrders || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{orderAnalytics.overview?.completedOrders || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{orderAnalytics.overview?.successRate || 0}%</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">₹{Math.round(orderAnalytics.avgOrderValue?.avgValue || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Top Cities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Cities by Orders</h3>
              <div className="space-y-3">
                {orderAnalytics.topCities?.slice(0, 10).map((city: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                        {index + 1}
                      </div>
                      <p className="font-medium text-gray-900">{city._id || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">₹{city.revenue?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500">{city.orderCount || 0} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

