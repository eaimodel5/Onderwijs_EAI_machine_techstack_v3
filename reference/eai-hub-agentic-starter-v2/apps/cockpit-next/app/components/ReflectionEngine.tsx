"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Play, FileText, Lightbulb, AlertCircle, CheckCircle } from "lucide-react"
import SymbolicInferenceEngine from "./SymbolicInferenceEngine"

export default function ReflectionEngine() {
  const [parameter, setParameter] = useState("")
  const [context, setContext] = useState("")
  const [rubric, setRubric] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [cotSessionActive, setCotSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Update handleReflection to validate context
  const handleReflection = async () => {
    if (!parameter || !context || !rubric) {
      alert("Alle velden (Parameter, Context, Rubric) zijn vereist voor seed-generatie")
      return
    }

    setIsProcessing(true)
    setCotSessionActive(true)
    setSessionId(`session_${Date.now()}`)

    // Simulate reflection process
    setTimeout(() => {
      setResult({
        cot_trace: [
          "[Explain] Parameter 'AI-feedback systeem' wordt verklaard via rubric: Ondersteunt leerlingbetrokkenheid door adaptieve terugkoppeling.",
          "[Validate] Score ligt binnen bandbreedte 0.7-0.8, gevalideerd met educatieve literatuur.",
          "[Assumptions] Er is aangenomen dat de context voldoende betrouwbaar is. Gebruikersinput: 'Wiskunde, HAVO 4'.",
          "[Alternatives] Alternatief scenario met hogere score zou deze risico's tonen: mogelijk agencyverlies bij overmatige AI-sturing.",
          "[Contextualize] In deze onderwijssetting (Wiskunde) is het effect van AI-feedback afhankelijk van doelgroep HAVO 4.",
        ],
        uncertainty_label: "✅",
        matched_descriptors: ["Adaptieve feedback", "Leerlingbetrokkenheid"],
        suggested_seed: {
          id: "Seed_Gen_AI_feedback_systeem",
          type: "RuntimeGenerated",
          intention: "Nieuwe reflectie op AI-feedback systeem",
          emotion: "Adaptief",
          ttl: "2026-01-01T00:00:00Z",
          weight: 0.7,
          description:
            "Gegenereerd op basis van gebruikersgedrag en semantische analyse: Adaptieve feedback in wiskundeonderwijs",
        },
        refined_trace: [
          "Verfijnde analyse toont consistentie tussen rubric en context",
          "Geen significante aannames gedetecteerd die herziening vereisen",
        ],
      })
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Chain-of-Thought Reflectie Engine
          </CardTitle>
          <CardDescription>Voer een reflectieve analyse uit met de NesyPromptRuntime</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parameter">Parameter</Label>
              <Input
                id="parameter"
                placeholder="bijv. AI-feedback systeem"
                value={parameter}
                onChange={(e) => setParameter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rubric">Rubric</Label>
              <Input
                id="rubric"
                placeholder="bijv. Vaardigheidspotentieel"
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Textarea
              id="context"
              placeholder="Beschrijf de onderwijscontext, doelgroep, en specifieke situatie..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
            />
          </div>

          {!cotSessionActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Seeds kunnen alleen worden gegenereerd binnen een actieve CoT-sessie met volledige parameter- en
                rubric-koppeling.
              </p>
            </div>
          )}

          <Button onClick={handleReflection} disabled={!parameter || !context || isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                Reflectie wordt uitgevoerd...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Reflectieve Analyse
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Tabs defaultValue="trace" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trace">CoT Trace</TabsTrigger>
            <TabsTrigger value="seed">Voorgestelde Seed</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
            <TabsTrigger value="symbolic">Symbolische Logica</TabsTrigger>
          </TabsList>

          <TabsContent value="trace">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chain-of-Thought Spoor
                  <Badge variant="secondary" className="ml-2">
                    {result.uncertainty_label}
                  </Badge>
                </CardTitle>
                <CardDescription>Stap-voor-stap redenering van de reflectieve engine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.cot_trace.map((step: string, index: number) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm font-mono">{step}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Matched Descriptors</h4>
                  <div className="flex gap-2">
                    {result.matched_descriptors.map((desc: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {desc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Voorgestelde Nieuwe Seed
                </CardTitle>
                <CardDescription>Deze seed wordt voorgesteld op basis van de reflectieve analyse</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">ID</Label>
                      <div className="font-mono text-sm">{result.suggested_seed.id}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <Badge variant="outline">{result.suggested_seed.type}</Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Intentie</Label>
                    <div className="text-sm text-muted-foreground">{result.suggested_seed.intention}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Emotie</Label>
                      <Badge className="bg-blue-100 text-blue-800">{result.suggested_seed.emotion}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Weight</Label>
                      <div className="font-bold">{result.suggested_seed.weight}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">TTL</Label>
                      <div className="text-sm">{new Date(result.suggested_seed.ttl).toLocaleDateString("nl-NL")}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Beschrijving</Label>
                    <div className="text-sm text-muted-foreground p-3 bg-slate-50 rounded-lg">
                      {result.suggested_seed.description}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="default">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepteer Seed
                    </Button>
                    <Button variant="outline">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Wijzig Seed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Verfijnde Analyse</CardTitle>
                <CardDescription>Resultaat van de ReflectionCompiler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.refined_trace.map((item: string, index: number) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="text-sm">{item}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="symbolic">
            <SymbolicInferenceEngine
              contextScores={{
                A: 0.35,
                B: 0.65,
                V: 0.85,
                V_A: 0.4,
                V_M: 0.85,
                V_C: 0.85,
                D_A: 0.35,
                D_Bc: 0.25,
              }}
              tdScore={0.75}
              adaStatus="pass"
              userConfirmationRequired={true}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
