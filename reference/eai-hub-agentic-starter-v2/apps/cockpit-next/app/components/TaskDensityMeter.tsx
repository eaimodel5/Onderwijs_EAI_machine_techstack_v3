"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Activity, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface TaskDensityMeterProps {
  tdScore: number
  lastUpdated?: string
  context?: string
}

export default function TaskDensityMeter({ tdScore, lastUpdated, context }: TaskDensityMeterProps) {
  const getTDStatus = (score: number) => {
    if (score <= 0.5) return { status: "balanced", color: "text-green-600", bgColor: "bg-green-500", label: "Balanced" }
    if (score <= 0.7)
      return { status: "risk", color: "text-orange-600", bgColor: "bg-orange-500", label: "Risico op Oversupport" }
    return { status: "critical", color: "text-red-600", bgColor: "bg-red-500", label: "Agencyverlies" }
  }

  const tdStatus = getTDStatus(tdScore)

  const getMicroDescriptor = (score: number) => {
    if (score <= 0.3) return "Leerling voert kernleerhandelingen uit - optimaal voor leerproces"
    if (score <= 0.5) return "Goede balans tussen AI-ondersteuning en leerlingactiviteit"
    if (score <= 0.7) return "AI neemt meer taken over - monitor leerlingbetrokkenheid"
    return "Kritiek: AI domineert leerproces - leerling wordt passief"
  }

  const getIcon = () => {
    switch (tdStatus.status) {
      case "balanced":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "risk":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <TooltipProvider>
      <Card
        className={`border-l-4 ${tdStatus.status === "balanced" ? "border-l-green-500" : tdStatus.status === "risk" ? "border-l-orange-500" : "border-l-red-500"}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Taakdichtheid Monitor
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Taakdichtheid meet wie de kernleerhandelingen uitvoert. Lagere waarden betekenen dat de leerling
                    actiever betrokken is bij het leerproces.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            {getIcon()}
          </div>
          <CardDescription className="text-xs">Real-time analyse van AI vs. leerling taakverdeling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">TD Score</span>
              <span className={`text-lg font-bold ${tdStatus.color}`}>{tdScore.toFixed(2)}</span>
            </div>

            <div className="relative">
              <Progress value={tdScore * 100} className="h-3" />
              <div
                className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${tdStatus.bgColor}`}
                style={{ width: `${tdScore * 100}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.0 (Leerling actief)</span>
              <span>1.0 (AI dominant)</span>
            </div>
          </div>

          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={
                tdStatus.status === "balanced"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : tdStatus.status === "risk"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }
            >
              {tdStatus.label}
            </Badge>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 bg-muted rounded-lg cursor-help">
                  <p className="text-xs text-muted-foreground">{getMicroDescriptor(tdScore)}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="text-xs font-medium">TD Matrix Interpretatie:</p>
                  <div className="space-y-1 text-xs">
                    <div>• 0.0-0.3: Optimaal - Leerling centraal</div>
                    <div>• 0.3-0.5: Goed - Gebalanceerde ondersteuning</div>
                    <div>• 0.5-0.7: Risico - Monitor leerlingactiviteit</div>
                    <div>• 0.7-1.0: Kritiek - AI overname</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          {lastUpdated && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Laatste update: {new Date(lastUpdated).toLocaleTimeString("nl-NL")}
              </p>
              {context && <p className="text-xs text-muted-foreground">Context: {context}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
