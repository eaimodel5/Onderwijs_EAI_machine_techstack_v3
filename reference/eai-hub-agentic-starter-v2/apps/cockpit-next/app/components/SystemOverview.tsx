"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Database, Shield, Zap, Clock, Users, CheckCircle, AlertTriangle, Activity } from "lucide-react"
import TaskDensityMeter from "./TaskDensityMeter"
import SeedTooltip from "./SeedTooltip"

export default function SystemOverview() {
  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-lime-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Actieve Seeds
              <SeedTooltip />
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lime-600">37</div>
            <p className="text-xs text-muted-foreground">+3 nieuwe deze week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CoT Sessies</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">142</div>
            <p className="text-xs text-muted-foreground">+12% van vorige maand</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SAL Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">Ethische borging actief</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reflectie Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0.94</div>
            <p className="text-xs text-muted-foreground">Hoge reflectieve kwaliteit</p>
          </CardContent>
        </Card>

        {/* Task Density Meter */}
        <TaskDensityMeter tdScore={0.42} lastUpdated={new Date().toISOString()} context="Wiskunde HAVO 4" />
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Systeemstatus
            </CardTitle>
            <CardDescription>Huidige status van alle EAI componenten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>EAI PromptRuntime</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Actief
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>SeedEngine Memory</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Geladen
                </Badge>
              </div>
              <Progress value={95} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ReflectionCompiler</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Ready
                </Badge>
              </div>
              <Progress value={98} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>SAL Monitoring</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Actief
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recente Activiteit
            </CardTitle>
            <CardDescription>Laatste reflectieve acties en suggesties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nieuwe Seed voorgesteld</p>
                  <p className="text-xs text-muted-foreground">Seed_UserTrace_Hans_01 - 5 min geleden</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">CoT-analyse voltooid</p>
                  <p className="text-xs text-muted-foreground">Parameter evaluatie - 12 min geleden</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">TTL waarschuwing</p>
                  <p className="text-xs text-muted-foreground">3 Seeds verlopen binnenkort - 1 uur geleden</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Patroon gedetecteerd</p>
                  <p className="text-xs text-muted-foreground">Nieuwe leerflow herkend - 2 uur geleden</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EAI Analysis Framework */}
      <Card>
        <CardHeader>
          <CardTitle>EAI Model 6.5 Analyse Framework</CardTitle>
          <CardDescription>Overzicht van de reflectieve AI-analyse componenten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Chain-of-Thought Kern
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Parameter analyse (P, V, D_A, D_Bc, T, A, B)</li>
                <li>• Rubric-gestuurde redenering</li>
                <li>• Taakdichtheid evaluatie (TD)</li>
                <li>• Semantische interpretatie</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                SAL Compliance & Ethiek
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• System Awareness Layer</li>
                <li>• EU AI Act compliance</li>
                <li>• Transparantie & uitlegbaarheid</li>
                <li>• Menselijk toezicht borging</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Educatieve Toepassing
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• VO, MBO, HO geschikt</li>
                <li>• Didactisch advies generatie</li>
                <li>• LIM-profiel opbouw</li>
                <li>• Rolgericht rapportage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EAI Parameters Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-lime-600" />
            EAI Parameters Status
          </CardTitle>
          <CardDescription>Huidige status van alle analyse parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { param: "P", name: "Procesfase", value: 0.85, status: "actief" },
              { param: "V", name: "Vaardigheid", value: 0.78, status: "actief" },
              { param: "D_A", name: "AI Verwerking", value: 0.65, status: "waarschuwing" },
              { param: "D_Bc", name: "Toezicht", value: 0.92, status: "actief" },
              { param: "T", name: "Technologie", value: 0.88, status: "actief" },
              { param: "A", name: "Autonomie", value: 0.72, status: "actief" },
              { param: "B", name: "Bias", value: 0.15, status: "goed" },
            ].map((item) => (
              <div key={item.param} className="text-center p-3 border rounded-lg">
                <div className="font-bold text-lg">{item.param}</div>
                <div className="text-xs text-muted-foreground mb-2">{item.name}</div>
                <div className="text-sm font-medium">{item.value}</div>
                <Badge
                  variant="secondary"
                  className={
                    item.status === "actief"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : item.status === "waarschuwing"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }
                >
                  {item.status === "waarschuwing" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
