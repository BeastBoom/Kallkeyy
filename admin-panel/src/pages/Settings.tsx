import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Users, Plus, Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  const { admin } = useAuth()
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'admin' as 'founder' | 'developer' | 'admin'
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const result = await adminAPI.getAdmins()
      if (result.success) {
        setAdmins(result.admins)
      }
    } catch (error: any) {
      toast.error('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAdmin.username || !newAdmin.email || !newAdmin.password || !newAdmin.fullName) {
      toast.error('Please fill all fields')
      return
    }

    try {
      await adminAPI.createAdmin(newAdmin)
      toast.success('Admin created successfully')
      setShowModal(false)
      setNewAdmin({ username: '', email: '', password: '', fullName: '', role: 'admin' })
      fetchAdmins()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create admin')
    }
  }

  const handleDeactivate = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate admin "${name}"?`)) return

    try {
      await adminAPI.deactivateAdmin(id)
      toast.success('Admin deactivated')
      fetchAdmins()
    } catch (error: any) {
      toast.error('Failed to deactivate admin')
    }
  }

  const canCreateAdmin = admin?.role === 'founder' || admin?.role === 'developer'

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Admin management and configuration</p>
          </div>
          {canCreateAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Admin
            </button>
          )}
        </div>

        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Your Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium text-gray-900 mt-1">{admin?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium text-gray-900 mt-1">{admin?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900 mt-1">{admin?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 capitalize mt-1">
                {admin?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Admin List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            All Admins
          </h2>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">
                        {a.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{a.fullName}</p>
                      <p className="text-sm text-gray-600">{a.email} • @{a.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      a.role === 'founder'
                        ? 'bg-purple-100 text-purple-800'
                        : a.role === 'developer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {a.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      a.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {admin?.role === 'founder' && a.role !== 'founder' && a.isActive && (
                      <button
                        onClick={() => handleDeactivate(a._id, a.fullName)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Admin</h3>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newAdmin.fullName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  {admin?.role === 'founder' && <option value="founder">Founder</option>}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setNewAdmin({ username: '', email: '', password: '', fullName: '', role: 'admin' })
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

