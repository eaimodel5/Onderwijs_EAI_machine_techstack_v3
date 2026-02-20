"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, TrendingUp, Clock, Heart, Zap } from "lucide-react"

interface Pattern {
  pattern: string[]
  emotion_flow: string[]
  frequency: number
  last_occurred: string
  next_recommended_seed: string
  weight_hint: number
}

export default function PatternViewer() {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/data/seed_trace_graph.json")
      .then((res) => res.json())
      .then((data) => {
        setPatterns(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading patterns:", err)
        setLoading(false)
      })
  }, [])

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      Ciekawość: "bg-purple-100 text-purple-800",
      Introspekcja: "bg-indigo-100 text-indigo-800",
      Zamysł: "bg-slate-100 text-slate-800",
      Determinacja: "bg-red-100 text-red-800",
      Dociekliwość: "bg-cyan-100 text-cyan-800",
      Czujność: "bg-orange-100 text-orange-800",
    }
    return colors[emotion] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Laden van patronen...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Seed Trace Patronen
          </CardTitle>
          <CardDescription>Gedetecteerde patronen in seed-activatie en emotie-flows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{patterns.length}</div>
              <div className="text-sm text-muted-foreground">Actieve Patronen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {patterns.reduce((sum, p) => sum + p.frequency, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Totale Frequentie</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...patterns.map((p) => p.weight_hint)).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Hoogste Weight Hint</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(patterns.flatMap((p) => p.emotion_flow)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unieke Emoties</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patterns.map((pattern, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Patroon #{index + 1}</CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{pattern.weight_hint}</div>
                  <div className="text-xs text-muted-foreground">weight hint</div>
                </div>
              </div>
              <CardDescription>
                Frequentie: {pattern.frequency} keer | Laatst:{" "}
                {new Date(pattern.last_occurred).toLocaleDateString("nl-NL")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Seed Pattern */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Seed Sequentie
                </h4>
                <div className="flex flex-wrap gap-1">
                  {pattern.pattern.map((seed, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs font-mono">
                      {seed}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Emotion Flow */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Emotie Flow
                </h4>
                <div className="flex flex-wrap gap-1">
                  {pattern.emotion_flow.map((emotion, idx) => (
                    <Badge key={idx} className={getEmotionColor(emotion)}>
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{pattern.frequency}x</div>
                    <div className="text-xs text-muted-foreground">Voorkomen</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">
                      {Math.round((Date.now() - new Date(pattern.last_occurred).getTime()) / (1000 * 60 * 60))}h
                    </div>
                    <div className="text-xs text-muted-foreground">Geleden</div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Aanbevolen Volgende Seed</span>
                </div>
                <div className="text-sm font-mono text-blue-800">{pattern.next_recommended_seed}</div>
                <Button size="sm" className="mt-2 w-full">
                  Activeer Aanbevolen Seed
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pattern Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Patroon Analyse</CardTitle>
          <CardDescription>Inzichten uit de seed trace patronen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Meest Frequente Emoties</h3>
              <div className="space-y-2">
                {Array.from(new Set(patterns.flatMap((p) => p.emotion_flow)))
                  .slice(0, 3)
                  .map((emotion) => (
                    <div key={emotion} className="flex justify-between">
                      <span className="text-sm">{emotion}</span>
                      <Badge className={getEmotionColor(emotion)}>
                        {patterns.flatMap((p) => p.emotion_flow).filter((e) => e === emotion).length}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Hoogste Weight Hints</h3>
              <div className="space-y-2">
                {patterns
                  .sort((a, b) => b.weight_hint - a.weight_hint)
                  .slice(0, 3)
                  .map((pattern, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-sm">Patroon #{patterns.indexOf(pattern) + 1}</span>
                      <Badge variant="secondary">{pattern.weight_hint}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Recente Activiteit</h3>
              <div className="space-y-2">
                {patterns
                  .sort((a, b) => new Date(b.last_occurred).getTime() - new Date(a.last_occurred).getTime())
                  .slice(0, 3)
                  .map((pattern, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-sm">Patroon #{patterns.indexOf(pattern) + 1}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(pattern.last_occurred).toLocaleDateString("nl-NL")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
