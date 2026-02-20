"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Zap, FileText, Brain, SigmaIcon as Lambda } from "lucide-react"

interface SymbolicRule {
  id: string
  description: string
  timestamp?: string
  triggered_by?: Record<string, number>
  action: {
    type: string
    message: string
    seed_type?: string
    weight?: number
    ttl?: number
  }
  status?: string
}

interface SymbolicInferenceEngineProps {
  contextScores: Record<string, number>
  tdScore: number
  adaStatus?: string
  userConfirmationRequired?: boolean
}

export default function SymbolicInferenceEngine({
  contextScores,
  tdScore,
  adaStatus = "pass",
  userConfirmationRequired = true,
}: SymbolicInferenceEngineProps) {
  const [rules, setRules] = useState<SymbolicRule[]>([])
  const [triggeredRules, setTriggeredRules] = useState<SymbolicRule[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Load rules from JSON
  useEffect(() => {
    const loadRules = async () => {
      try {
        const response = await fetch("/data/symbolic_inference_rules_expanded.json")
        const rulesData = await response.json()
        setRules(rulesData)
      } catch (error) {
        console.error("Failed to load symbolic inference rules:", error)
      }
    }
    loadRules()
  }, [])

  // Load existing trace
  useEffect(() => {
    const loadTrace = async () => {
      try {
        const response = await fetch("/data/symbolic_inference_trace.json")
        const traceData = await response.json()
        setTriggeredRules(traceData)
      } catch (error) {
        console.error("Failed to load symbolic inference trace:", error)
      }
    }
    loadTrace()
  }, [])

  const evaluateRules = () => {
    setIsProcessing(true)

    setTimeout(() => {
      const newTriggeredRules: SymbolicRule[] = []

      rules.forEach((rule) => {
        let match = true
        const triggeredBy: Record<string, number> = {}

        Object.entries(rule.trigger).forEach(([param, condition]) => {
          // Special handling for ADA and user_confirmation
          if (param === "ADA") {
            if (condition === "fail" && adaStatus !== "fail") {
              match = false
            }
            return
          }
          if (param === "user_confirmation") {
            if (condition === "not_required" && userConfirmationRequired) {
              match = false
            }
            return
          }

          // Evaluate numerical conditions
          const value = param === "TD" ? tdScore : contextScores[param]
          if (value === undefined) {
            match = false
            return
          }

          const op = condition.charAt(0)
          const threshold = Number.parseFloat(condition.slice(1))

          if (op === "<" && value >= threshold) {
            match = false
          } else if (op === ">" && value <= threshold) {
            match = false
          }

          if (match) {
            triggeredBy[param] = value
          }
        })

        if (match) {
          const triggeredRule = {
            ...rule,
            timestamp: new Date().toISOString(),
            triggered_by: triggeredBy,
            status: "executed",
          }
          newTriggeredRules.push(triggeredRule)
        }
      })

      setTriggeredRules((prev) => [...prev, ...newTriggeredRules])
      setIsProcessing(false)
    }, 1500)
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "seed_injection":
        return <Brain className="h-4 w-4" />
      case "warning_flag":
        return <AlertTriangle className="h-4 w-4" />
      case "hard_block":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "prompt_intervention":
        return <FileText className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case "seed_injection":
        return "bg-blue-100 text-blue-800"
      case "warning_flag":
        return "bg-orange-100 text-orange-800"
      case "hard_block":
        return "bg-red-100 text-red-800"
      case "prompt_intervention":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lambda className="h-5 w-5 text-purple-600" />
            Symbolische Inferentie Engine
          </CardTitle>
          <CardDescription>Formele logica-evaluatie op basis van context scores en taakdichtheid</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{rules.length}</div>
              <div className="text-sm text-muted-foreground">Geladen Regels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{triggeredRules.length}</div>
              <div className="text-sm text-muted-foreground">Geactiveerde Regels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {triggeredRules.filter((r) => r.action.type === "warning_flag").length}
              </div>
              <div className="text-sm text-muted-foreground">Waarschuwingen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {triggeredRules.filter((r) => r.action.type === "seed_injection").length}
              </div>
              <div className="text-sm text-muted-foreground">Seeds Geïnjecteerd</div>
            </div>
          </div>

          <Button onClick={evaluateRules} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Lambda className="h-4 w-4 mr-2 animate-spin" />
                Evaluatie wordt uitgevoerd...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Voer Symbolische Evaluatie Uit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {triggeredRules.length > 0 && (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Actieve Regels</TabsTrigger>
            <TabsTrigger value="trace">Volledige Trace</TabsTrigger>
            <TabsTrigger value="actions">Uitgevoerde Acties</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-4">
              {triggeredRules.slice(-5).map((rule, index) => (
                <Card key={`${rule.id}-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-2 rounded-full ${getActionColor(rule.action.type)}`}>
                          {getActionIcon(rule.action.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-sm">{rule.description}</h3>
                          <Badge className={getActionColor(rule.action.type)}>{rule.action.type}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{rule.action.message}</p>

                        {rule.triggered_by && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Geactiveerd door:</strong>{" "}
                            {Object.entries(rule.triggered_by)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </div>
                        )}

                        {rule.timestamp && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(rule.timestamp).toLocaleString("nl-NL")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trace">
            <Card>
              <CardHeader>
                <CardTitle>Symbolische Inferentie Trace</CardTitle>
                <CardDescription>Volledige logging van alle geëvalueerde regels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <pre className="text-xs text-slate-700 overflow-x-auto">
                    {JSON.stringify(triggeredRules, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <div className="space-y-4">
              {Object.entries(
                triggeredRules.reduce(
                  (acc, rule) => {
                    const type = rule.action.type
                    if (!acc[type]) acc[type] = []
                    acc[type].push(rule)
                    return acc
                  },
                  {} as Record<string, SymbolicRule[]>,
                ),
              ).map(([actionType, rules]) => (
                <Card key={actionType}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getActionIcon(actionType)}
                      {actionType.replace("_", " ").toUpperCase()}
                      <Badge variant="secondary">{rules.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rules.map((rule, index) => (
                        <div key={index} className="text-sm p-2 bg-slate-50 rounded">
                          <div className="font-medium">{rule.description}</div>
                          <div className="text-muted-foreground">{rule.action.message}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
