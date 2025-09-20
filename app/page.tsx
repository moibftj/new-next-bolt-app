'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Scale, 
  FileText, 
  Users, 
  Briefcase, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Star,
  Zap,
  DollarSign
} from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const userProfile = await getCurrentProfile()
      setProfile(userProfile)

      // Redirect authenticated users to their dashboard
      if (userProfile) {
        switch (userProfile.role) {
          case 'admin':
            router.push('/admin')
            return
          case 'employee':
            router.push('/employee')
            return
          case 'user':
            router.push('/dashboard')
            return
        }
      }
    } catch (error) {
      // User is not authenticated, continue to show landing page
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Talk To My Lawyer</h1>
                <p className="text-sm text-gray-600">AI-Powered Legal Letters</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/signup')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin-login')}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-800">
              🚀 Powered by Gemini 2.5-Flash AI
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Generate Professional
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}Legal Letters{" "}
              </span>
              in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Transform your legal communication with AI-powered letter generation. 
              Create professional demand letters, cease and desist notices, and more 
              with the expertise of seasoned attorneys.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/signup')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                <FileText className="w-5 h-5 mr-2" />
                Start Generating Letters
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/login')}
                className="px-8 py-4 text-lg border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Talk To My Lawyer?
            </h2>
            <p className="text-xl text-gray-600">
              Professional legal letters powered by advanced AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-100 hover:border-blue-200 transition-all hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">AI-Powered Generation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Advanced AI analyzes your situation and generates professional legal letters 
                  with proper formatting, tone, and legal language.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Instant Results</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Get your professional legal letter in minutes, not days. 
                  No waiting, no back-and-forth - just instant, professional results.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 hover:border-purple-200 transition-all hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Professional Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Every letter is crafted with legal expertise, proper formatting, 
                  and professional language that gets results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Three Ways to Benefit
            </h2>
            <p className="text-xl text-gray-600">
              Whether you're a user, employee, or administrator
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Users */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">For Users</CardTitle>
                <CardDescription className="text-gray-600">
                  Generate professional legal letters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    AI-powered letter generation
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Professional legal formatting
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    PDF downloads & email sending
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    Multiple subscription options
                  </li>
                </ul>
                <div className="pt-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push('/signup')}
                  >
                    Start as User
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Employees */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-2 border-emerald-200">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">For Employees</CardTitle>
                <CardDescription className="text-gray-600">
                  Earn commissions by sharing discount codes
                </CardDescription>
                <Badge className="mt-2 bg-emerald-100 text-emerald-800">
                  💰 Earn 5% Commission
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <DollarSign className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    20% discount codes for users
                  </li>
                  <li className="flex items-center text-gray-700">
                    <DollarSign className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    5% commission on all sales
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Star className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    Points system & tracking
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    Performance analytics
                  </li>
                </ul>
                <div className="pt-4">
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => router.push('/signup')}
                  >
                    Join as Employee
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Admin */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">For Admins</CardTitle>
                <CardDescription className="text-gray-600">
                  Comprehensive platform management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    User & employee management
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    Revenue & commission tracking
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    Analytics & reporting
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    CSV data exports
                  </li>
                </ul>
                <div className="pt-4">
                  <Button 
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => router.push('/admin-login')}
                  >
                    Admin Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your legal letter needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Single Letter</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">$299</div>
                <CardDescription>One-time payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    1 Professional Legal Letter
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI-Generated Content
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    PDF Download
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Email Sending
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 shadow-lg scale-105 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">4 Letters Monthly</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">$299</div>
                <CardDescription>Billed yearly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    4 Letters per Month
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI-Generated Content
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Unlimited PDF Downloads
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Email Sending
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Priority Support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-green-300 transition-all">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">8 Letters Monthly</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">$599</div>
                <CardDescription>Billed yearly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    8 Letters per Month
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI-Generated Content
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Unlimited PDF Downloads
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Email Sending
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Premium Support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Generate Your First Legal Letter?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Join thousands of users who trust Talk To My Lawyer for their legal communication needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push('/signup')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/login')}
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div className="text-white text-xl font-bold">Talk To My Lawyer</div>
            </div>
            <p className="text-gray-400 mb-8">
              Professional AI-powered legal letter generation platform
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">
                © 2024 Talk To My Lawyer. All rights reserved. 
                This service provides AI-generated legal templates and does not constitute legal advice.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}