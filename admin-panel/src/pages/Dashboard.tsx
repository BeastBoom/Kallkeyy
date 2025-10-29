import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Users, ShoppingCart, DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardData {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  revenueData: Array<{ month: string, revenue: number }>
  recentOrders: Array<any>
  lowStockProducts: Array<any>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const result = await adminAPI.getDashboard()
      if (result.success) {
        setData(result.data)
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to KALLKEYY Admin Portal</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={data?.totalUsers || 0}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Orders"
            value={data?.totalOrders || 0}
            icon={ShoppingCart}
            color="bg-green-500"
          />
          <StatCard
            title="Revenue"
            value={`₹${(data?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="bg-purple-500"
          />
          <StatCard
            title="Products"
            value={data?.totalProducts || 0}
            icon={Package}
            color="bg-orange-500"
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Revenue Trend (6 Months)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {data?.recentOrders?.length ? (
                data.recentOrders.map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderId}</p>
                      <p className="text-sm text-gray-600">{order.userId?.name || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{order.amount || order.totalAmount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
            </div>
            <div className="space-y-3">
              {data?.lowStockProducts?.length ? (
                data.lowStockProducts.map((product: any) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {Object.entries(product.stock)
                          .filter(([_, qty]: any) => qty <= 5)
                          .map(([size, qty]: any) => `${size}: ${qty}`)
                          .join(', ')}
                      </p>
                    </div>
                    <span className="text-orange-600 font-bold text-sm">⚠️ Low</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">All products well-stocked!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} p-4 rounded-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  )
}

