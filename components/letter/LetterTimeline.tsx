'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, FileText, Eye, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineStep {
  id: number
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  icon: React.ComponentType<{ className?: string }>
}

interface LetterTimelineProps {
  letter: any
  onViewPreview: () => void
  onDownload: () => void
}

export function LetterTimeline({ letter, onViewPreview, onDownload }: LetterTimelineProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)

  const steps: TimelineStep[] = [
    {
      id: 1,
      title: 'Letter Request Received',
      description: 'Your letter request has been successfully received and is being processed.',
      status: 'completed',
      icon: CheckCircle
    },
    {
      id: 2,
      title: 'Under Attorney Review',
      description: 'Our AI system is analyzing your request and generating a professional legal letter.',
      status: currentStep >= 1 ? 'completed' : 'pending',
      icon: Clock
    },
    {
      id: 3,
      title: 'Letter Generated',
      description: 'Your legal letter has been successfully generated and is ready for review.',
      status: currentStep >= 2 ? 'completed' : 'pending',
      icon: FileText
    },
    {
      id: 4,
      title: 'Ready for Download',
      description: 'Your letter is now available for preview and download.',
      status: currentStep >= 3 ? 'completed' : 'pending',
      icon: Download
    }
  ]

  useEffect(() => {
    // Animate through the timeline steps
    const animateTimeline = async () => {
      for (let i = 0; i < 4; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCurrentStep(i)
      }
      setAnimationComplete(true)
    }

    animateTimeline()
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generating Your Legal Letter
        </h2>
        <p className="text-gray-600">
          Please wait while we create your professional legal document
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Animated progress line */}
        <div 
          className="absolute left-8 top-0 w-0.5 bg-blue-600 transition-all duration-1000 ease-in-out"
          style={{ 
            height: `${((currentStep + 1) / steps.length) * 100}%` 
          }}
        ></div>

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = currentStep >= index
            const isCurrent = currentStep === index && !animationComplete

            return (
              <div key={step.id} className="relative flex items-start">
                {/* Step icon */}
                <div 
                  className={cn(
                    "relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500",
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white scale-110"
                      : isCurrent
                      ? "bg-blue-100 border-blue-300 text-blue-600 animate-pulse"
                      : "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Step content */}
                <Card 
                  className={cn(
                    "ml-6 flex-1 transition-all duration-500",
                    isCompleted || isCurrent
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  )}
                >
                  <CardContent className="p-4">
                    <h3 className={cn(
                      "font-semibold text-lg mb-1 transition-colors duration-300",
                      isCompleted ? "text-blue-800" : "text-gray-600"
                    )}>
                      {step.title}
                    </h3>
                    <p className={cn(
                      "text-sm transition-colors duration-300",
                      isCompleted ? "text-blue-600" : "text-gray-500"
                    )}>
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action buttons - only show when animation is complete */}
      {animationComplete && (
        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={onViewPreview}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Preview
            </Button>
            <Button 
              onClick={onDownload}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg inline-block">
            <p className="text-sm text-green-800">
              ✅ Your legal letter "{letter?.title || 'Untitled'}" has been successfully generated!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}