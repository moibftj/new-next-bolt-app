'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, FileText, Scale } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface LetterFormData {
  title: string
  sender_name: string
  sender_address: string
  attorney_name: string
  recipient_name: string
  matter: string
  resolution: string
  jurisdiction: string
  tone: string
  extra_notes: string
}

interface LetterFormProps {
  onLetterGenerated: (letter: any) => void
}

export function LetterForm({ onLetterGenerated }: LetterFormProps) {
  const [formData, setFormData] = useState<LetterFormData>({
    title: '',
    sender_name: '',
    sender_address: '',
    attorney_name: '',
    recipient_name: '',
    matter: '',
    resolution: '',
    jurisdiction: 'General',
    tone: 'firm but professional',
    extra_notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof LetterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate required fields
    const requiredFields: (keyof LetterFormData)[] = [
      'sender_name', 'attorney_name', 'recipient_name', 'matter', 'resolution'
    ]
    
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError(`${field.replace('_', ' ')} is required`)
        setLoading(false)
        return
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in to generate letters')
      }

      // Call the generate-draft edge function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-draft`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: new Date().toISOString().split('T')[0]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate letter')
      }

      const result = await response.json()
      onLetterGenerated(result.letter)
      
      // Reset form
      setFormData({
        title: '',
        sender_name: '',
        sender_address: '',
        attorney_name: '',
        recipient_name: '',
        matter: '',
        resolution: '',
        jurisdiction: 'General',
        tone: 'firm but professional',
        extra_notes: ''
      })
    } catch (err: any) {
      setError(err.message || 'Failed to generate letter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-900">Generate Legal Letter</CardTitle>
            <CardDescription>
              Fill out the form below to generate a professional legal letter using AI
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Letter Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Demand Letter - Unpaid Invoice"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firm but professional">Firm but Professional</SelectItem>
                  <SelectItem value="formal and courteous">Formal and Courteous</SelectItem>
                  <SelectItem value="demanding">Demanding</SelectItem>
                  <SelectItem value="diplomatic">Diplomatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sender_name">Your Name *</Label>
              <Input
                id="sender_name"
                value={formData.sender_name}
                onChange={(e) => handleInputChange('sender_name', e.target.value)}
                required
                placeholder="John Doe"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attorney_name">Attorney/Law Firm Name *</Label>
              <Input
                id="attorney_name"
                value={formData.attorney_name}
                onChange={(e) => handleInputChange('attorney_name', e.target.value)}
                required
                placeholder="Smith & Associates Law Firm"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sender_address">Your Address</Label>
            <Textarea
              id="sender_address"
              value={formData.sender_address}
              onChange={(e) => handleInputChange('sender_address', e.target.value)}
              placeholder="123 Main Street, City, State 12345"
              className="w-full"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="recipient_name">Recipient Name *</Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                required
                placeholder="ABC Company"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                placeholder="State, Federal, etc."
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matter">Matter/Subject *</Label>
            <Textarea
              id="matter"
              value={formData.matter}
              onChange={(e) => handleInputChange('matter', e.target.value)}
              required
              placeholder="Describe the legal matter or issue..."
              className="w-full"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Desired Resolution *</Label>
            <Textarea
              id="resolution"
              value={formData.resolution}
              onChange={(e) => handleInputChange('resolution', e.target.value)}
              required
              placeholder="Describe what you want to achieve..."
              className="w-full"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra_notes">Additional Notes</Label>
            <Textarea
              id="extra_notes"
              value={formData.extra_notes}
              onChange={(e) => handleInputChange('extra_notes', e.target.value)}
              placeholder="Any additional context or requirements..."
              className="w-full"
              rows={2}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 px-8"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Letter...
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 mr-2" />
                  Generate Letter
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> This AI-generated letter is a draft template. 
            Please review and modify as needed. Always consult with a licensed attorney 
            before sending any legal correspondence.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}