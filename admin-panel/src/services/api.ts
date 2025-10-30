/// <reference types="vite/client" />
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token from localStorage if exists
const token = localStorage.getItem('admin_token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const adminAPI = {
  // Auth
  login: async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password })
    if (data.token) {
      localStorage.setItem('admin_token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    }
    return data
  },

  logout: async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('admin_token')
    delete api.defaults.headers.common['Authorization']
  },

  verifyCookie: async () => {
    try {
      const { data } = await api.get('/auth/verify-cookie')
      if (data.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      }
      return data
    } catch (error) {
      return { success: false }
    }
  },

  // Dashboard
  getDashboard: async () => {
    const { data } = await api.get('/dashboard/overview')
    // Backend returns { success: true, data: { overview, ordersByStatus, revenueByMonth, recentOrders, lowStockProducts } }
    // Transform to match frontend expectations
    if (data.success && data.data) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const revenueData = data.data.revenueByMonth?.map((item: any) => ({
        month: monthNames[item._id.month - 1] + ' ' + item._id.year,
        revenue: item.revenue
      })) || []
      
      return {
        success: true,
        data: {
          totalUsers: data.data.overview?.totalUsers || 0,
          totalOrders: data.data.overview?.totalOrders || 0,
          totalRevenue: data.data.overview?.totalRevenue || 0,
          totalProducts: data.data.overview?.totalProducts || 0,
          totalSubscribers: data.data.overview?.totalSubscribers || 0,
          revenueData,
          recentOrders: data.data.recentOrders || [],
          lowStockProducts: data.data.lowStockProducts || []
        }
      }
    }
    return data
  },

  getCartAnalytics: async () => {
    const { data } = await api.get('/dashboard/cart-analytics')
    // Backend returns { success: true, data: { statistics, topCartProducts, ... } }
    return {
      success: data.success,
      data: data.data || {}
    }
  },

  getProductAnalytics: async () => {
    const { data } = await api.get('/dashboard/product-analytics')
    // Backend returns { success: true, data: { topSellingProducts, lowStockProducts, ... } }
    return {
      success: data.success,
      data: data.data || {}
    }
  },

  getUserAnalytics: async () => {
    const { data } = await api.get('/dashboard/user-analytics')
    // Backend returns { success: true, data: { overview, topCustomers, ... } }
    return {
      success: data.success,
      data: data.data || {}
    }
  },

  getOrderAnalytics: async () => {
    const { data } = await api.get('/dashboard/order-analytics')
    // Backend returns { success: true, data: { overview, avgOrderValue, ... } }
    return {
      success: data.success,
      data: data.data || {}
    }
  },

  // Products
  getProducts: async (params?: any) => {
    const { data } = await api.get('/products', { params })
    // Backend returns { success: true, data: { products, pagination } }
    return {
      success: data.success,
      products: data.data?.products || [],
      pagination: data.data?.pagination
    }
  },

  getProduct: async (productId: string) => {
    const { data } = await api.get(`/products/${productId}`)
    return data
  },

  createProduct: async (product: any) => {
    const { data } = await api.post('/products', product)
    return data
  },

  updateProduct: async (productId: string, product: any) => {
    const { data } = await api.put(`/products/${productId}`, product)
    return data
  },

  updateStock: async (productId: string, stock: any) => {
    const { data } = await api.put(`/products/${productId}/stock`, { stock })
    return data
  },

  deleteProduct: async (productId: string) => {
    const { data } = await api.delete(`/products/${productId}`)
    return data
  },

  // Users
  getUsers: async (params?: any) => {
    const { data } = await api.get('/users', { params })
    // Backend returns { success: true, data: { users, pagination } }
    return {
      success: data.success,
      users: data.data?.users || [],
      pagination: data.data?.pagination
    }
  },

  getUser: async (id: string) => {
    const { data } = await api.get(`/users/${id}`)
    return data
  },

  updateUser: async (id: string, user: any) => {
    const { data } = await api.put(`/users/${id}`, user)
    return data
  },

  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`)
    return data
  },

  exportUsers: async () => {
    const { data } = await api.get('/users/export/csv')
    return data
  },

  // Orders
  getOrders: async (params?: any) => {
    const { data } = await api.get('/orders', { params })
    // Backend returns { success: true, data: { orders, pagination } }
    // We need to flatten it to { success: true, orders, pagination }
    return {
      success: data.success,
      orders: data.data?.orders || [],
      pagination: data.data?.pagination
    }
  },

  getOrder: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },

  updateOrderStatus: async (id: string, updates: any) => {
    const { data } = await api.put(`/orders/${id}/status`, updates)
    return data
  },

  updateShipping: async (id: string, shipping: any) => {
    const { data } = await api.put(`/orders/${id}/shipping`, shipping)
    return data
  },

  cancelOrder: async (id: string, reason: string) => {
    const { data } = await api.put(`/orders/${id}/cancel`, { reason })
    return data
  },

  exportOrders: async (params?: any) => {
    const { data } = await api.get('/orders/export/csv', { params })
    return data
  },

  // Subscribers
  getSubscribers: async (params?: any) => {
    const { data } = await api.get('/subscribers', { params })
    // Backend returns { success: true, data: { subscribers, pagination } }
    return {
      success: data.success,
      subscribers: data.data?.subscribers || [],
      pagination: data.data?.pagination
    }
  },

  getSubscriberStats: async () => {
    const { data } = await api.get('/subscribers/stats')
    // Backend returns { success: true, data: { totalSubscribers, activeSubscribers, inactiveSubscribers } }
    return {
      success: data.success,
      stats: {
        total: data.data?.totalSubscribers || 0,
        active: data.data?.activeSubscribers || 0,
        inactive: data.data?.inactiveSubscribers || 0
      }
    }
  },

  toggleSubscriber: async (id: string) => {
    const { data } = await api.put(`/subscribers/${id}/toggle`)
    return data
  },

  deleteSubscriber: async (id: string) => {
    const { data } = await api.delete(`/subscribers/${id}`)
    return data
  },

  exportSubscribers: async () => {
    const { data } = await api.get('/subscribers/export/csv')
    return data
  },

  // Admins
  getAdmins: async () => {
    const { data } = await api.get('/admins')
    return data
  },

  createAdmin: async (admin: any) => {
    const { data } = await api.post('/admins', admin)
    return data
  },

  deactivateAdmin: async (id: string) => {
    const { data} = await api.put(`/admins/${id}/deactivate`)
    return data
  }
}

export default api

