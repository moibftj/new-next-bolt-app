'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { LogOut, Shield } from 'lucide-react'
import { AdminTables } from '@/components/admin/AdminTables'
import { getCurrentProfile, signOut } from '@/lib/auth'

export default function AdminDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const userProfile = await getCurrentProfile()
      if (!userProfile) {
        router.push('/admin-login')
        return
      }

      if (userProfile.role !== 'admin') {
        // Redirect to appropriate dashboard based on role
        if (userProfile.role === 'user') {
          router.push('/dashboard')
        } else if (userProfile.role === 'employee') {
          router.push('/employee')
        } else {
          router.push('/login')
        }
        return
      }

      setProfile(userProfile)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage users, employees, and platform analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.name}
                </p>
                <Badge variant="destructive">Administrator</Badge>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Message */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Welcome to the Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Monitor platform performance, manage users and employees, and track revenue. 
              All data is updated in real-time and you can export reports as needed.
            </p>
          </div>

          {/* Admin Tables Component */}
          <AdminTables />

          {/* System Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔒 Security Features
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Row Level Security (RLS) enabled</li>
                <li>• Admin-only data access policies</li>
                <li>• Secure API endpoints with authentication</li>
                <li>• Audit trail for all actions</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Available Actions
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Export user and employee data to CSV</li>
                <li>• Monitor letter generation activity</li>
                <li>• Track commission payouts</li>
                <li>• Analyze revenue trends</li>
              </ul>
            </div>
          </div>

          {/* Platform Statistics */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📈 Platform Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">✅</div>
                <p className="text-blue-800 font-medium">Database</p>
                <p className="text-blue-600">Operational</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <p className="text-blue-800 font-medium">AI Service</p>
                <p className="text-blue-600">Operational</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <p className="text-blue-800 font-medium">Payments</p>
                <p className="text-blue-600">Operational</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <p className="text-blue-800 font-medium">Email</p>
                <p className="text-blue-600">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}