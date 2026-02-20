"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Activity,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Cpu,
  RefreshCw,
} from "lucide-react"

interface SystemMetrics {
  timestamp: string
  cpu_usage: number
  memory_usage: number
  active_sessions: number
  seeds_processed: number
  cot_analyses: number
  compliance_checks: number
  response_time: number
  error_rate: number
}

interface LiveAlert {
  id: string
  type: "info" | "warning" | "error"
  message: string
  timestamp: string
}

export default function RealTimeMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    timestamp: new Date().toISOString(),
    cpu_usage: 45,
    memory_usage: 62,
    active_sessions: 12,
    seeds_processed: 156,
    cot_analyses: 89,
    compliance_checks: 234,
    response_time: 1.2,
    error_rate: 0.3,
  })

  const [alerts, setAlerts] = useState<LiveAlert[]>([
    {
      id: "1",
      type: "info",
      message: "Nieuwe CoT-analyse gestart voor parameter evaluatie",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      type: "warning",
      message: "Hoge taakdichtheid gedetecteerd in reflectie module",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      type: "info",
      message: "SAL compliance check succesvol afgerond",
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        timestamp: new Date().toISOString(),
        cpu_usage: Math.max(20, Math.min(80, prev.cpu_usage + (Math.random() - 0.5) * 10)),
        memory_usage: Math.max(30, Math.min(90, prev.memory_usage + (Math.random() - 0.5) * 8)),
        active_sessions: Math.max(5, Math.min(25, prev.active_sessions + Math.floor((Math.random() - 0.5) * 3))),
        seeds_processed: prev.seeds_processed + Math.floor(Math.random() * 3),
        cot_analyses: prev.cot_analyses + Math.floor(Math.random() * 2),
        compliance_checks: prev.compliance_checks + Math.floor(Math.random() * 4),
        response_time: Math.max(0.5, Math.min(3.0, prev.response_time + (Math.random() - 0.5) * 0.3)),
        error_rate: Math.max(0, Math.min(2, prev.error_rate + (Math.random() - 0.5) * 0.2)),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-l-red-500 bg-red-50 dark:bg-red-950"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950"
      default:
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-lime-600" />
            Real-time Monitoring
          </h2>
          <p className="text-muted-foreground">Live systeem metrics en activiteit van EAI Model 6.5</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Vernieuwen
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Gebruik</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu_usage.toFixed(1)}%</div>
            <Progress value={metrics.cpu_usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.cpu_usage < 60 ? "Normaal" : metrics.cpu_usage < 80 ? "Hoog" : "Kritiek"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geheugen</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory_usage.toFixed(1)}%</div>
            <Progress value={metrics.memory_usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.memory_usage < 70 ? "Normaal" : metrics.memory_usage < 85 ? "Hoog" : "Kritiek"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Sessies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_sessions}</div>
            <p className="text-xs text-muted-foreground">Gelijktijdige gebruikers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-lime-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responstijd</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.response_time.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              {metrics.response_time < 2 ? "Snel" : metrics.response_time < 3 ? "Gemiddeld" : "Langzaam"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* EAI Specific Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-lime-600" />
              EAI Activiteit
            </CardTitle>
            <CardDescription>Reflectieve AI processen en analyses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Seeds Verwerkt</span>
              <Badge variant="secondary" className="bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200">
                {metrics.seeds_processed}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">CoT Analyses</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {metrics.cot_analyses}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Compliance Checks</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {metrics.compliance_checks}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Foutpercentage</span>
              <Badge
                variant="secondary"
                className={
                  metrics.error_rate < 1
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }
              >
                {metrics.error_rate.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Live Meldingen
            </CardTitle>
            <CardDescription>Recente systeem gebeurtenissen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 border-l-4 rounded-r-lg ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString("nl-NL")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parameter Status */}
      <Card>
        <CardHeader>
          <CardTitle>EAI Parameter Status</CardTitle>
          <CardDescription>Huidige status van alle analyse parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { param: "P", name: "Procesfase", value: 0.85, status: "actief", color: "bg-green-500" },
              { param: "V", name: "Vaardigheid", value: 0.78, status: "actief", color: "bg-blue-500" },
              { param: "D_A", name: "AI Verwerking", value: 0.65, status: "waarschuwing", color: "bg-yellow-500" },
              { param: "D_Bc", name: "Toezicht", value: 0.92, status: "actief", color: "bg-green-500" },
              { param: "T", name: "Technologie", value: 0.88, status: "actief", color: "bg-green-500" },
              { param: "A", name: "Autonomie", value: 0.72, status: "actief", color: "bg-green-500" },
              { param: "B", name: "Bias", value: 0.15, status: "goed", color: "bg-lime-500" },
            ].map((item) => (
              <div key={item.param} className="text-center p-3 border rounded-lg hover:shadow-md transition-shadow">
                <div className="font-bold text-lg">{item.param}</div>
                <div className="text-xs text-muted-foreground mb-2">{item.name}</div>
                <div className="text-sm font-medium mb-2">{item.value}</div>
                <div className={`w-full h-2 rounded-full ${item.color} opacity-20 mb-2`}>
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value * 100}%` }}></div>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    item.status === "actief" || item.status === "goed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Systeem Status</CardTitle>
          <CardDescription>Laatste update: {new Date(metrics.timestamp).toLocaleString("nl-NL")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">EAI Runtime</div>
                <div className="text-sm text-muted-foreground">Volledig operationeel</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">SAL Monitoring</div>
                <div className="text-sm text-muted-foreground">Compliance actief</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">Chain-of-Thought</div>
                <div className="text-sm text-muted-foreground">Redenering actief</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
