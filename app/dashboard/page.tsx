'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Plus, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  LogOut
} from 'lucide-react'
import { LetterForm } from '@/components/letter/LetterForm'
import { LetterTimeline } from '@/components/letter/LetterTimeline'
import { LetterPreviewModal } from '@/components/letter/LetterPreviewModal'
import { getCurrentProfile, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Letter {
  id: string
  title: string
  status: string
  created_at: string
  content: string
  sender_name: string
  recipient_name: string
  matter: string
  ai_meta: any
}

export default function UserDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [showTimeline, setShowTimeline] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('generate')
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const userProfile = await getCurrentProfile()
      if (!userProfile) {
        router.push('/login')
        return
      }

      if (userProfile.role !== 'user') {
        // Redirect to appropriate dashboard based on role
        if (userProfile.role === 'admin') {
          router.push('/admin')
        } else if (userProfile.role === 'employee') {
          router.push('/employee')
        }
        return
      }

      setProfile(userProfile)

      // Load user's letters
      const { data: lettersData, error } = await supabase
        .from('letters')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setLetters(lettersData || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLetterGenerated = (letter: Letter) => {
    setSelectedLetter(letter)
    setShowTimeline(true)
    setLetters(prev => [letter, ...prev])
  }

  const handleTimelineComplete = () => {
    setShowTimeline(false)
    setShowPreview(true)
  }

  const handleSubscribe = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'four_letters',
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard?cancelled=true`
        })
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'under_review': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'received': return <AlertCircle className="w-4 h-4 text-blue-600" />
      default: return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'received': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
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
                Welcome back, {profile?.name}!
              </h1>
              <p className="text-gray-600">Generate professional legal letters with AI</p>
            </div>
            <div className="flex items-center space-x-4">
              {profile?.is_subscribed ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {profile.subscription_plan} Plan
                </Badge>
              ) : (
                <Badge variant="secondary">Free Account</Badge>
              )}
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

      {/* Timeline Modal */}
      {showTimeline && selectedLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <LetterTimeline
              letter={selectedLetter}
              onViewPreview={handleTimelineComplete}
              onDownload={() => {
                setShowTimeline(false)
                console.log('Download letter:', selectedLetter.id)
              }}
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <LetterPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        letter={selectedLetter}
        onSubscribe={handleSubscribe}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="generate" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Generate Letter</span>
            </TabsTrigger>
            <TabsTrigger value="letters" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>My Letters ({letters.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-8">
            {!profile?.is_subscribed && (
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <CreditCard className="w-4 h-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      You're on the free plan. Subscribe to unlock full letter previews and downloads.
                    </span>
                    <Button onClick={handleSubscribe} size="sm" className="ml-4">
                      Subscribe Now
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <LetterForm onLetterGenerated={handleLetterGenerated} />
          </TabsContent>

          <TabsContent value="letters" className="mt-8">
            {letters.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No letters yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by generating your first legal letter
                  </p>
                  <Button 
                    onClick={() => setActiveTab('generate')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate First Letter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {letters.map((letter) => (
                  <Card key={letter.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {letter.title || 'Untitled Letter'}
                        </CardTitle>
                        {getStatusIcon(letter.status)}
                      </div>
                      <CardDescription className="text-sm">
                        To: {letter.recipient_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p className="line-clamp-2">{letter.matter}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(letter.status)}>
                          {letter.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(letter.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedLetter(letter)
                            setShowPreview(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => console.log('Download:', letter.id)}
                          disabled={!profile?.is_subscribed}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}