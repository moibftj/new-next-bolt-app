'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { X, Download, Mail, Eye, Lock, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentProfile } from '@/lib/auth'

interface LetterPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  letter: any
  onSubscribe: () => void
}

export function LetterPreviewModal({ isOpen, onClose, letter, onSubscribe }: LetterPreviewModalProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const profile = await getCurrentProfile()
        setIsSubscribed(profile?.is_subscribed || false)
      } catch (error) {
        console.error('Error checking subscription:', error)
        setIsSubscribed(false)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      checkSubscription()
    }
  }, [isOpen])

  const handleSimulateSubscription = () => {
    // For demo purposes - simulate subscription
    setShowFullPreview(true)
    setIsSubscribed(true)
  }

  const handleDownloadPDF = () => {
    // This would typically call a PDF generation endpoint
    console.log('Downloading PDF for letter:', letter?.id)
    // Placeholder implementation
    alert('PDF download functionality would be implemented here')
  }

  const handleSendEmail = () => {
    // This would typically call an email sending endpoint
    console.log('Sending email for letter:', letter?.id)
    alert('Email sending functionality would be implemented here')
  }

  if (!letter) return null

  const canViewFullContent = isSubscribed || showFullPreview
  const letterContent = letter.content || ''
  const previewContent = letterContent.substring(0, 200) + '...'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="w-6 h-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl text-gray-900">
                  Letter Preview
                </DialogTitle>
                <DialogDescription>
                  {letter.title || 'Untitled Letter'}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Letter metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Letter Details
                <Badge variant={letter.status === 'posted' ? 'default' : 'secondary'}>
                  {letter.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">From:</p>
                  <p className="text-gray-600">{letter.sender_name}</p>
                  {letter.sender_address && (
                    <p className="text-gray-500 text-xs mt-1">{letter.sender_address}</p>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-700">To:</p>
                  <p className="text-gray-600">{letter.recipient_name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Attorney:</p>
                  <p className="text-gray-600">{letter.attorney_name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Matter:</p>
                  <p className="text-gray-600">{letter.matter}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Letter content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Letter Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "relative",
                !canViewFullContent && "overflow-hidden"
              )}>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-900">
                    {canViewFullContent ? letterContent : previewContent}
                  </pre>
                </div>

                {/* Subscription overlay */}
                {!canViewFullContent && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent backdrop-blur-sm flex items-end justify-center pb-8">
                    <Card className="w-full max-w-md mx-4 shadow-lg border-blue-200">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Lock className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            Subscribe to View Full Letter
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Get access to the complete letter content, PDF downloads, and email sending capabilities.
                          </p>
                        </div>
                        <div className="space-y-2">
                          {/* Demo/Simulation button */}
                          <Button
                            onClick={handleSimulateSubscription}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Preview (Demo)
                          </Button>
                          {/* Real subscription button */}
                          <Button
                            onClick={onSubscribe}
                            variant="outline"
                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Subscribe Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons - only show for subscribed users */}
          {canViewFullContent && (
            <>
              <Separator />
              <div className="flex justify-center space-x-4 pt-4">
                <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleSendEmail} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Mail className="w-4 h-4 mr-2" />
                  Send via Attorney Email
                </Button>
              </div>
            </>
          )}

          {/* AI metadata (for subscribed users) */}
          {canViewFullContent && letter.ai_meta && (
            <>
              <Separator />
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-700">AI Generation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-gray-600">
                    {letter.ai_meta.summary && (
                      <p><strong>Summary:</strong> {letter.ai_meta.summary}</p>
                    )}
                    {letter.ai_meta.tone && (
                      <p><strong>Tone:</strong> {letter.ai_meta.tone}</p>
                    )}
                    {letter.ai_meta.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {letter.ai_meta.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Legal Disclaimer:</strong> This AI-generated letter is a draft template. 
            Please review with a licensed attorney before sending. This does not constitute legal advice.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}