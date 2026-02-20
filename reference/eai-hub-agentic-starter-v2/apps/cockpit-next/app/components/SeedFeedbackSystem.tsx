"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ThumbsUp, MessageSquare, Send, Star } from "lucide-react"

interface SeedFeedbackProps {
  seedId: string
  seedDescription: string
  onFeedbackSubmit: (feedback: any) => void
}

export default function SeedFeedbackSystem({ seedId, seedDescription, onFeedbackSubmit }: SeedFeedbackProps) {
  const [rating, setRating] = useState<string>("")
  const [relevance, setRelevance] = useState<string>("")
  const [comments, setComments] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const feedback = {
      seedId,
      timestamp: new Date().toISOString(),
      rating: Number.parseInt(rating),
      relevance,
      comments,
      sessionId: `session_${Date.now()}`,
    }

    onFeedbackSubmit(feedback)
    setSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setRating("")
      setRelevance("")
      setComments("")
    }, 3000)
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm font-medium">Feedback ontvangen! Bedankt voor je input.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4" />
          Seed Feedback
        </CardTitle>
        <CardDescription className="text-xs">Help ons de kwaliteit van deze seed te verbeteren</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-2 bg-slate-50 rounded text-xs text-muted-foreground">
          <strong>Seed:</strong> {seedDescription}
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Kwaliteitsbeoordeling</Label>
            <RadioGroup value={rating} onValueChange={setRating} className="flex gap-4 mt-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center space-x-1">
                  <RadioGroupItem value={num.toString()} id={`rating-${num}`} />
                  <Label htmlFor={`rating-${num}`} className="text-xs flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {num}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Relevantie voor context</Label>
            <RadioGroup value={relevance} onValueChange={setRelevance} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zeer-relevant" id="zeer-relevant" />
                <Label htmlFor="zeer-relevant" className="text-xs">
                  Zeer relevant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="relevant" id="relevant" />
                <Label htmlFor="relevant" className="text-xs">
                  Relevant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutraal" id="neutraal" />
                <Label htmlFor="neutraal" className="text-xs">
                  Neutraal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="niet-relevant" id="niet-relevant" />
                <Label htmlFor="niet-relevant" className="text-xs">
                  Niet relevant
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="comments" className="text-sm font-medium">
              Aanvullende opmerkingen
            </Label>
            <Textarea
              id="comments"
              placeholder="Optioneel: specifieke feedback over deze seed..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!rating || !relevance} size="sm" className="w-full">
          <Send className="h-3 w-3 mr-2" />
          Verstuur Feedback
        </Button>
      </CardContent>
    </Card>
  )
}
