"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Download } from "lucide-react"

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("7d")
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    // Simulate analytics data loading
    setAnalyticsData({
      seed_usage: {
        total_activations: 1247,
        unique_seeds: 37,
        avg_weight: 0.73,
        top_emotions: [
          { emotion: "Ciekawość", count: 156, percentage: 25.2 },
          { emotion: "Introspekcja", count: 134, percentage: 21.7 },
          { emotion: "Determinacja", count: 98, percentage: 15.8 },
          { emotion: "Zamysł", count: 87, percentage: 14.1 },
          { emotion: "Dociekliwość", count: 72, percentage: 11.6 },
        ],
        type_distribution: [
          { type: "Core", count: 8, percentage: 21.6 },
          { type: "Direction", count: 6, percentage: 16.2 },
          { type: "Meta", count: 5, percentage: 13.5 },
          { type: "Security", count: 4, percentage: 10.8 },
          { type: "Extension", count: 4, percentage: 10.8 },
          { type: "Other", count: 10, percentage: 27.1 },
        ],
      },
      cot_performance: {
        total_analyses: 342,
        success_rate: 98.5,
        avg_processing_time: 2.4,
        uncertainty_distribution: [
          { label: "✅ Zeker", count: 287, percentage: 83.9 },
          { label: "⚠️ Onzeker", count: 45, percentage: 13.2 },
          { label: "❌ Fout", count: 10, percentage: 2.9 },
        ],
        top_parameters: [
          { parameter: "AI-feedback systeem", count: 45 },
          { parameter: "Adaptieve leeromgeving", count: 38 },
          { parameter: "Peer assessment", count: 32 },
          { parameter: "Gamification", count: 28 },
          { parameter: "Personalisatie", count: 24 },
        ],
      },
      user_behavior: {
        active_users: 156,
        sessions_per_user: 3.2,
        avg_session_duration: 18.5,
        user_types: [
          { type: "Docent", count: 89, percentage: 57.1 },
          { type: "Leerling", count: 52, percentage: 33.3 },
          { type: "Onderzoeker", count: 15, percentage: 9.6 },
        ],
        peak_hours: [
          { hour: "09:00", activity: 85 },
          { hour: "11:00", activity: 92 },
          { hour: "14:00", activity: 78 },
          { hour: "16:00", activity: 65 },
        ],
      },
      sal_compliance: {
        compliance_score: 98.2,
        checks_performed: 1456,
        violations_detected: 3,
        categories: [
          { category: "Transparantie", score: 99.1, status: "excellent" },
          { category: "Toezicht", score: 98.7, status: "excellent" },
          { category: "Controleerbaarheid", score: 97.8, status: "good" },
          { category: "Autonomie", score: 98.9, status: "excellent" },
          { category: "Bias", score: 96.5, status: "good" },
        ],
      },
    })
  }, [timeRange])

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600"
    if (score >= 85) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Laden van analytics...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Geavanceerde Analytics
              </CardTitle>
              <CardDescription>Diepgaande analyse van EAI Model 6.5 prestaties en gebruik</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Laatste dag</SelectItem>
                  <SelectItem value="7d">Laatste week</SelectItem>
                  <SelectItem value="30d">Laatste maand</SelectItem>
                  <SelectItem value="90d">Laatste kwartaal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="seeds" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="seeds">Seed Analytics</TabsTrigger>
          <TabsTrigger value="cot">CoT Performance</TabsTrigger>
          <TabsTrigger value="users">Gebruikersgedrag</TabsTrigger>
          <TabsTrigger value="compliance">SAL Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="seeds">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seed Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Seed Gebruik Overzicht</CardTitle>
                <CardDescription>Activatie statistieken en trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.seed_usage.total_activations}</div>
                    <div className="text-sm text-muted-foreground">Totale Activaties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.seed_usage.avg_weight.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Gem. Weight</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Seed Type Distributie</h4>
                  {analyticsData.seed_usage.type_distribution.map((item: any) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="text-sm">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={item.percentage} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground w-12">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Emotions */}
            <Card>
              <CardHeader>
                <CardTitle>Emotie Analyse</CardTitle>
                <CardDescription>Meest voorkomende emoties in seeds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.seed_usage.top_emotions.map((item: any, index: number) => (
                    <div key={item.emotion} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{item.emotion}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cot">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CoT Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Chain-of-Thought Prestaties</CardTitle>
                <CardDescription>Analyse kwaliteit en snelheid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.cot_performance.total_analyses}
                    </div>
                    <div className="text-xs text-muted-foreground">Analyses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.cot_performance.success_rate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Succes Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.cot_performance.avg_processing_time}s
                    </div>
                    <div className="text-xs text-muted-foreground">Gem. Tijd</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Zekerheid Distributie</h4>
                  {analyticsData.cot_performance.uncertainty_distribution.map((item: any) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={item.percentage} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground w-12">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Populaire Parameters</CardTitle>
                <CardDescription>Meest geanalyseerde onderwijsparameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.cot_performance.top_parameters.map((item: any, index: number) => (
                    <div key={item.parameter} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.parameter}</span>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Behavior */}
            <Card>
              <CardHeader>
                <CardTitle>Gebruikersgedrag</CardTitle>
                <CardDescription>Activiteit en engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.user_behavior.active_users}</div>
                    <div className="text-xs text-muted-foreground">Actieve Gebruikers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.user_behavior.sessions_per_user}
                    </div>
                    <div className="text-xs text-muted-foreground">Sessies/Gebruiker</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.user_behavior.avg_session_duration}m
                    </div>
                    <div className="text-xs text-muted-foreground">Gem. Sessieduur</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Gebruikerstypen</h4>
                  {analyticsData.user_behavior.user_types.map((item: any) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="text-sm">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={item.percentage} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground w-12">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Piekuren Activiteit</CardTitle>
                <CardDescription>Gebruikspatronen gedurende de dag</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.user_behavior.peak_hours.map((item: any) => (
                    <div key={item.hour} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium">{item.hour}</div>
                      <div className="flex-1">
                        <Progress value={item.activity} className="h-3" />
                      </div>
                      <div className="w-8 text-sm text-muted-foreground">{item.activity}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-6">
            {/* Overall Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>SAL Compliance Overzicht</CardTitle>
                <CardDescription>System Awareness Layer ethische borging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {analyticsData.sal_compliance.compliance_score}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Compliance Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {analyticsData.sal_compliance.checks_performed}
                    </div>
                    <div className="text-sm text-muted-foreground">Uitgevoerde Checks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {analyticsData.sal_compliance.violations_detected}
                    </div>
                    <div className="text-sm text-muted-foreground">Gedetecteerde Overtredingen</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance per Categorie</CardTitle>
                <CardDescription>Gedetailleerde scores voor elke SAL categorie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.sal_compliance.categories.map((item: any) => (
                    <div key={item.category} className="flex items-center gap-4">
                      <div className="w-32">
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <Progress value={item.score} className="flex-1 mr-2" />
                          <span className={`text-sm font-medium ${getScoreColor(item.score)}`}>
                            {item.score.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
