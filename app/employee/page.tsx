'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { LogOut } from 'lucide-react'
import { CouponBox } from '@/components/employee/CouponBox'
import { getCurrentProfile, signOut } from '@/lib/auth'

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadEmployeeData()
  }, [])

  const loadEmployeeData = async () => {
    try {
      const userProfile = await getCurrentProfile()
      if (!userProfile) {
        router.push('/login')
        return
      }

      if (userProfile.role !== 'employee') {
        // Redirect to appropriate dashboard based on role
        if (userProfile.role === 'admin') {
          router.push('/admin')
        } else if (userProfile.role === 'user') {
          router.push('/dashboard')
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600">Loading your employee dashboard...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {profile?.name}!
              </h1>
              <p className="text-gray-600">Share discount codes and earn commissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="default" className="bg-emerald-100 text-emerald-800">
                Employee
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.points || 0} Points
                </p>
                <p className="text-sm text-gray-500">
                  ${(profile?.commission_earned || 0).toFixed(2)} Earned
                </p>
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
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Employee Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              As an employee, you can share discount codes with users and earn commissions. 
              Each time someone uses your code to subscribe, you earn 1 point and 5% commission 
              on their subscription amount.
            </p>
          </div>

          {/* Coupon Box Component */}
          <CouponBox />

          {/* How to Maximize Earnings */}
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              💡 How to Maximize Your Earnings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Share Your Code</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Share on social media platforms</li>
                  <li>• Send to friends and family via email</li>
                  <li>• Include in professional networking</li>
                  <li>• Add to your email signature</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Commission Structure</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 20% discount for users</li>
                  <li>• 5% commission for you</li>
                  <li>• 1 point per successful subscription</li>
                  <li>• Commissions paid monthly</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Subscription Plans Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📋 Available Subscription Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">Single Letter</h4>
                <p className="text-gray-600">$299 (one-time)</p>
                <p className="text-green-600 font-medium">Your commission: $14.95</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">4 Letters Monthly</h4>
                <p className="text-gray-600">$299/year</p>
                <p className="text-green-600 font-medium">Your commission: $14.95</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">8 Letters Monthly</h4>
                <p className="text-gray-600">$599/year</p>
                <p className="text-green-600 font-medium">Your commission: $29.95</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}