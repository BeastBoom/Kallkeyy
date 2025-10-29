import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Search, Mail, Download, ToggleLeft, ToggleRight, Trash2, Filter } from 'lucide-react'

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchSubscribers()
    fetchStats()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const result = await adminAPI.getSubscribers()
      if (result.success) {
        setSubscribers(result.subscribers)
      }
    } catch (error: any) {
      toast.error('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const result = await adminAPI.getSubscriberStats()
      if (result.success) {
        setStats(result.stats)
      }
    } catch (error: any) {
      // Stats are optional
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await adminAPI.toggleSubscriber(id)
      toast.success('Subscriber status updated')
      fetchSubscribers()
      fetchStats()
    } catch (error: any) {
      toast.error('Failed to update subscriber')
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Delete subscriber "${email}"?`)) return

    try {
      await adminAPI.deleteSubscriber(id)
      toast.success('Subscriber deleted')
      fetchSubscribers()
      fetchStats()
    } catch (error: any) {
      toast.error('Failed to delete subscriber')
    }
  }

  const handleExport = async () => {
    try {
      const result = await adminAPI.exportSubscribers()
      if (result.success) {
        // Convert data array to CSV
        const data = result.data || []
        if (data.length === 0) {
          toast.error('No subscribers to export')
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
        a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        toast.success('Subscribers exported successfully')
      }
    } catch (error: any) {
      toast.error('Failed to export subscribers')
    }
  }

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && sub.isActive) ||
                         (statusFilter === 'inactive' && !sub.isActive)
    return matchesSearch && matchesStatus
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscribers</h1>
            <p className="text-gray-600 mt-1">Manage newsletter subscribers ({filteredSubscribers.length} subscribers)</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <Mail className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
                </div>
                <ToggleRight className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Inactive</p>
                  <p className="text-3xl font-bold text-gray-600 mt-2">{stats.inactive}</p>
                </div>
                <ToggleLeft className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscribers by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            
            {/* Status Filter Pills */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All', icon: Mail },
                { value: 'active', label: 'Active', icon: ToggleRight },
                { value: 'inactive', label: 'Inactive', icon: ToggleLeft }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    statusFilter === filter.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {(statusFilter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setSearchTerm('')
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No subscribers found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed On
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
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{subscriber.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        subscriber.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscriber.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(subscriber._id)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {subscriber.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(subscriber._id, subscriber.email)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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

