'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Check, Gift, TrendingUp, Users, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getCurrentProfile } from '@/lib/auth'

interface CouponStats {
  coupon_code: string
  points: number
  commission_earned: number
  usage_count: number
  recent_usage: Array<{
    user_email: string
    revenue: number
    created_at: string
  }>
}

export function CouponBox() {
  const [stats, setStats] = useState<CouponStats | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCouponStats()
  }, [])

  const loadCouponStats = async () => {
    try {
      const profile = await getCurrentProfile()
      if (!profile || profile.role !== 'employee') {
        throw new Error('Employee access required')
      }

      // Get employee metadata
      const { data: employeeMeta, error: metaError } = await supabase
        .from('employees_meta')
        .select('*')
        .eq('profile_id', profile.id)
        .single()

      if (metaError && metaError.code !== 'PGRST116') {
        throw metaError
      }

      // Get coupon usage statistics
      const { data: usageData, error: usageError } = await supabase
        .from('coupon_usage')
        .select(`
          revenue,
          created_at,
          profiles:user_id (email)
        `)
        .eq('employee_profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (usageError) {
        throw usageError
      }

      const couponCode = employeeMeta?.coupon_code || `SAVE20${profile.name.toUpperCase().replace(/\s+/g, '').slice(0, 6)}`

      setStats({
        coupon_code: couponCode,
        points: profile.points || 0,
        commission_earned: profile.commission_earned || 0,
        usage_count: usageData?.length || 0,
        recent_usage: usageData?.map(usage => ({
          user_email: usage.profiles?.email || 'Unknown',
          revenue: usage.revenue || 0,
          created_at: usage.created_at
        })) || []
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (!stats?.coupon_code) return

    try {
      await navigator.clipboard.writeText(stats.coupon_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>No coupon data available. Please contact support.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Coupon Card */}
      <Card className="relative overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100 rounded-full -ml-12 -mb-12 opacity-50"></div>

        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-600 rounded-full shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  Your Discount Coupon
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  Share this code and earn 5% commission on each subscription
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-lg px-4 py-2">
              20% OFF
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Coupon Code Display */}
          <div className="flex items-center justify-center p-6 bg-white rounded-xl border-2 border-dashed border-emerald-300 shadow-inner">
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Your Coupon Code
              </p>
              <div className="flex items-center space-x-3">
                <code className="text-3xl font-bold text-emerald-600 bg-gray-50 px-4 py-2 rounded-lg border tracking-wider">
                  {stats.coupon_code}
                </code>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "transition-all duration-200",
                    copied
                      ? "bg-green-100 border-green-300 text-green-700"
                      : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Share this code with users to earn commissions
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/70 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Share Code</h3>
              <p className="text-sm text-gray-600">
                Give your coupon code to users who want to subscribe
              </p>
            </div>
            <div className="p-4 bg-white/70 rounded-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">User Saves</h3>
              <p className="text-sm text-gray-600">
                Users get 20% off their subscription with your code
              </p>
            </div>
            <div className="p-4 bg-white/70 rounded-lg">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">You Earn</h3>
              <p className="text-sm text-gray-600">
                Earn 5% commission + 1 point for each subscription
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.points}</h3>
            <p className="text-sm text-gray-600">Points Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ${stats.commission_earned.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Commission Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.usage_count}</h3>
            <p className="text-sm text-gray-600">Total Uses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Usage */}
      {stats.recent_usage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Coupon Usage</CardTitle>
            <CardDescription>Latest users who used your coupon code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_usage.map((usage, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{usage.user_email}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(usage.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +${(usage.revenue * 0.05).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">commission</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}