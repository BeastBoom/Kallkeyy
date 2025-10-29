import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Search, Users as UsersIcon, Download, Filter } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [ordersFilter, setOrdersFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const result = await adminAPI.getUsers()
      if (result.success) {
        setUsers(result.users)
      }
    } catch (error: any) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const result = await adminAPI.exportUsers()
      if (result.success) {
        // Convert data array to CSV
        const data = result.data || []
        if (data.length === 0) {
          toast.error('No users to export')
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
        
        // Create and download CSV
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        toast.success('Users exported successfully')
      }
    } catch (error: any) {
      toast.error('Failed to export users')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesVerified = verifiedFilter === 'all' ||
                           (verifiedFilter === 'verified' && user.phoneVerified) ||
                           (verifiedFilter === 'unverified' && !user.phoneVerified)
    
    const matchesOrders = ordersFilter === 'all' ||
                         (ordersFilter === 'with-orders' && user.orderCount > 0) ||
                         (ordersFilter === 'no-orders' && (!user.orderCount || user.orderCount === 0))
    
    return matchesSearch && matchesVerified && matchesOrders
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage your customers ({filteredUsers.length} users)</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            
            {/* Phone Verified Filter */}
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="all">All Users</option>
              <option value="verified">Phone Verified</option>
              <option value="unverified">Phone Not Verified</option>
            </select>

            {/* Orders Filter */}
            <select
              value={ordersFilter}
              onChange={(e) => setOrdersFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="all">All Orders Status</option>
              <option value="with-orders">Has Orders</option>
              <option value="no-orders">No Orders</option>
            </select>

            {/* Clear Filters */}
            {(verifiedFilter !== 'all' || ordersFilter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setVerifiedFilter('all')
                  setOrdersFilter('all')
                  setSearchTerm('')
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{user.orderCount || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-bold">
                        ₹{(user.totalSpent || 0).toLocaleString()}
                      </span>
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

