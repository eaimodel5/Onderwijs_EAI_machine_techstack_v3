"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calculator, BarChart3, AlertTriangle, CheckCircle, Info } from "lucide-react"

export default function EvaluationTool() {
  const [evaluation, setEvaluation] = useState({
    aiTool: "",
    context: "",
    targetGroup: "",
    domain: "",
    learningGoal: "",
  })

  const [results, setResults] = useState<any>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const handleEvaluation = async () => {
    setIsEvaluating(true)

    // Simulate E_AI evaluation
    setTimeout(() => {
      setResults({
        eai_score: 0.74,
        parameters: {
          P: { score: 0.7, description: "Procesfase-specificiteit", band: "Toepassing/Oefenen" },
          V_C: { score: 0.8, description: "Cognitieve vaardigheden", band: "Hoog potentieel" },
          V_M: { score: 0.6, description: "Metacognitieve vaardigheden", band: "Matig potentieel" },
          V_S: { score: 0.5, description: "Sociale vaardigheden", band: "Beperkt potentieel" },
          V_A: { score: 0.7, description: "Motivationele vaardigheden", band: "Goed potentieel" },
          D_A: { score: 0.8, description: "AI-verwerkingsniveau", band: "Transparant" },
          D_Bc: { score: 0.9, description: "Correctietoezicht", band: "Volledig controleerbaar" },
          T: { score: 0.6, description: "Technologische integratie", band: "Matige integratie" },
          A: { score: 0.4, description: "Autonomiecoëfficiënt", band: "Beperkte autonomie" },
          B: { score: 0.2, description: "Biascorrectie", band: "Goede biascontrole" },
        },
        td_analysis: {
          score: 0.4,
          risk_level: "Laag",
          description: "Leerling behoudt controle over kernleerhandelingen",
        },
        sal_compliance: {
          transparantie: "✓",
          toezicht: "✓",
          controleerbaarheid: "✓",
          autonomie: "✓",
          bias: "✓",
          c_factor: 1.0,
        },
        flags: [
          { type: "info", message: "Hoge transparantie gedetecteerd - positief voor vertrouwen" },
          { type: "warning", message: "Sociale vaardigheden onderbenut - overweeg groepsactiviteiten" },
        ],
        advice: {
          docent:
            "Deze AI-tool is geschikt voor individuele oefening. Overweeg aanvullende groepsactiviteiten voor sociale vaardigheden.",
          leerling: "Gebruik de AI-feedback actief om je begrip te verdiepen. Blijf zelf nadenken over de oplossingen.",
          beleidsmaker: "Tool voldoet aan ethische eisen. Monitoring van leereffecten aanbevolen.",
        },
      })
      setIsEvaluating(false)
    }, 3000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return "bg-green-100"
    if (score >= 0.6) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            EAI Model 6.5 Evaluatie Tool
          </CardTitle>
          <CardDescription>Evalueer AI-tools in onderwijscontext met rubric-gebaseerde analyse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aiTool">AI-Tool</Label>
              <Input
                id="aiTool"
                placeholder="bijv. ChatGPT voor wiskundehulp"
                value={evaluation.aiTool}
                onChange={(e) => setEvaluation({ ...evaluation, aiTool: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Vakgebied</Label>
              <Select
                value={evaluation.domain}
                onValueChange={(value) => setEvaluation({ ...evaluation, domain: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer vakgebied" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wiskunde">Wiskunde</SelectItem>
                  <SelectItem value="nederlands">Nederlands</SelectItem>
                  <SelectItem value="engels">Engels</SelectItem>
                  <SelectItem value="geschiedenis">Geschiedenis</SelectItem>
                  <SelectItem value="natuurkunde">Natuurkunde</SelectItem>
                  <SelectItem value="biologie">Biologie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetGroup">Doelgroep</Label>
              <Select
                value={evaluation.targetGroup}
                onValueChange={(value) => setEvaluation({ ...evaluation, targetGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer doelgroep" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vmbo">VMBO</SelectItem>
                  <SelectItem value="havo">HAVO</SelectItem>
                  <SelectItem value="vwo">VWO</SelectItem>
                  <SelectItem value="mbo">MBO</SelectItem>
                  <SelectItem value="ho">Hoger Onderwijs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningGoal">Leerdoel</Label>
              <Input
                id="learningGoal"
                placeholder="bijv. Vergelijkingen oplossen"
                value={evaluation.learningGoal}
                onChange={(e) => setEvaluation({ ...evaluation, learningGoal: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context & Gebruik</Label>
            <Textarea
              id="context"
              placeholder="Beschrijf hoe de AI-tool wordt ingezet, in welke fase van de les, en wat de rol van de leerling is..."
              value={evaluation.context}
              onChange={(e) => setEvaluation({ ...evaluation, context: e.target.value })}
              rows={4}
            />
          </div>

          <Button
            onClick={handleEvaluation}
            disabled={!evaluation.aiTool || !evaluation.context || isEvaluating}
            className="w-full"
          >
            {isEvaluating ? (
              <>
                <Calculator className="h-4 w-4 mr-2 animate-spin" />
                E_AI Evaluatie wordt uitgevoerd...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Start E_AI Evaluatie
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="advice">Advies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    E_AI Score
                    <div className={`text-3xl font-bold ${getScoreColor(results.eai_score)}`}>
                      {results.eai_score.toFixed(2)}
                    </div>
                  </CardTitle>
                  <CardDescription>Gewogen score op basis van alle parameters en correctiefactoren</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={results.eai_score * 100} className="h-3" />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Didactische waarde</span>
                      <span className="font-medium">Goed</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ethische compliance</span>
                      <span className="font-medium">Uitstekend</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taakdichtheid</span>
                      <span className="font-medium">Veilig</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taakdichtheid Analyse</CardTitle>
                  <CardDescription>Wie voert de kernleerhandelingen uit?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">TD Score</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {results.td_analysis.score}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risico Niveau</span>
                      <Badge variant="outline">{results.td_analysis.risk_level}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">{results.td_analysis.description}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {results.flags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Flags & Waarschuwingen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.flags.map((flag: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          flag.type === "warning" ? "bg-yellow-50 border-yellow-500" : "bg-blue-50 border-blue-500"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {flag.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          ) : (
                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                          )}
                          <span className="text-sm">{flag.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="parameters">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.parameters).map(([key, param]: [string, any]) => (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm font-mono">{key}</CardTitle>
                        <CardDescription className="text-xs">{param.description}</CardDescription>
                      </div>
                      <div className={`text-xl font-bold ${getScoreColor(param.score)}`}>{param.score.toFixed(1)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={param.score * 100} className="h-2" />
                      <div className={`text-xs px-2 py-1 rounded ${getScoreBackground(param.score)}`}>{param.band}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  SAL Compliance Check
                </CardTitle>
                <CardDescription>System Awareness Layer - Ethische en juridische borging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(results.sal_compliance)
                    .filter(([key]) => key !== "c_factor")
                    .map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="capitalize font-medium">{key}</span>
                        <div className="text-2xl">
                          {value === "✓" ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Compliance Factor (C)</span>
                    <div className="text-2xl font-bold text-green-600">
                      {results.sal_compliance.c_factor.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Volledige compliance met EU AI Act vereisten voor educatieve AI
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advice">
            <div className="space-y-4">
              {Object.entries(results.advice).map(([role, advice]: [string, any]) => (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="capitalize">Advies voor {role}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{advice}</p>
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
