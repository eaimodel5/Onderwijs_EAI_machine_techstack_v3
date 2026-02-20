"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Shield,
  Zap,
  Database,
  GitBranch,
  Search,
  Users,
  Settings,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  Target,
  Activity,
  FileText,
} from "lucide-react"

export default function EAIGuide() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="components">Componenten</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="glossary">Woordenlijst</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <Card className="border-l-4 border-l-lime-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-lime-600" />
                  Wat is EAI Model 6.5?
                </CardTitle>
                <CardDescription>Educational AI Model voor reflectieve analyse in het onderwijs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Het EAI Model 6.5 is een geavanceerd Educational AI systeem dat speciaal ontwikkeld is voor het
                  Nederlandse onderwijs. Het model gebruikt Chain-of-Thought redenering om AI-tools in
                  onderwijscontexten te evalueren en te optimaliseren.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-950 dark:to-lime-900">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Hoofddoelen
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Ethische AI-evaluatie in onderwijs</li>
                      <li>• Reflectieve analyse van leerprocessen</li>
                      <li>• Taakdichtheid monitoring</li>
                      <li>• EU AI Act compliance</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Doelgroepen
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Docenten (VO, MBO, HO)</li>
                      <li>• Onderwijsonderzoekers</li>
                      <li>• Beleidsmakers</li>
                      <li>• Leerlingen/Studenten</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Kernconcepten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Chain-of-Thought (CoT)</h4>
                    <p className="text-sm text-muted-foreground">
                      Stap-voor-stap redenering die transparantie biedt in AI-besluitvorming
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Seeds</h4>
                    <p className="text-sm text-muted-foreground">
                      Reflectieve geheugenunits die leerprocessen en contexten vastleggen
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Taakdichtheid (TD)</h4>
                    <p className="text-sm text-muted-foreground">
                      Meet wie de kernleerhandelingen uitvoert: AI of leerling
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parameters">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>EAI Parameters Uitleg</CardTitle>
                <CardDescription>Alle parameters die gebruikt worden in de evaluatie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-lime-600">Kernparameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            P
                          </Badge>
                          <span className="font-medium">Procesfase-specificiteit</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Meet in welke fase van het leerproces de AI-tool wordt ingezet (0.0-1.0)
                        </p>
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Bereik:</span> 0.0 (Introductie) → 1.0 (Evaluatie)
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            V
                          </Badge>
                          <span className="font-medium">Vaardigheidsondersteuning</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Samengestelde score van cognitieve (V_C), metacognitieve (V_M), sociale (V_S) en motivationele
                          (V_A) vaardigheden
                        </p>
                        <div className="mt-2 text-xs space-y-1">
                          <div>• V_C: Cognitieve vaardigheden</div>
                          <div>• V_M: Metacognitieve vaardigheden</div>
                          <div>• V_S: Sociale vaardigheden</div>
                          <div>• V_A: Motivationele vaardigheden</div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            D_A
                          </Badge>
                          <span className="font-medium">AI-verwerkingsniveau</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Transparantie en uitlegbaarheid van AI-beslissingen (0.0-1.0)
                        </p>
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Bereik:</span> 0.0 (Black box) → 1.0 (Volledig transparant)
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            D_Bc
                          </Badge>
                          <span className="font-medium">Correctietoezicht</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Mate waarin menselijk toezicht en correctie mogelijk is (0.0-1.0)
                        </p>
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Bereik:</span> 0.0 (Geen controle) → 1.0 (Volledige controle)
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            T
                          </Badge>
                          <span className="font-medium">Technologische integratie</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Hoe goed de AI-tool integreert in de bestaande onderwijsomgeving (0.0-1.0)
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            A
                          </Badge>
                          <span className="font-medium">Autonomiecoëfficiënt</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Mate waarin leerlingen autonomie behouden bij gebruik van de AI-tool (0.0-1.0)
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            B
                          </Badge>
                          <span className="font-medium">Biascorrectie</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Aanwezigheid van bias in AI-output (0.0-1.0, waarbij lager beter is)
                        </p>
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Bereik:</span> 0.0 (Geen bias) → 1.0 (Hoge bias)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-blue-600">Afgeleide Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            TD
                          </Badge>
                          <span className="font-medium">Taakdichtheid</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Berekend uit P, A en andere parameters. Meet wie de kernleerhandelingen uitvoert.
                        </p>
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Interpretatie:</span> Lager = Leerling doet meer werk (beter)
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            E_AI
                          </Badge>
                          <span className="font-medium">EAI Score</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Gewogen totaalscore die alle parameters combineert tot één evaluatiecijfer (0.0-1.0)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Systeemcomponenten</CardTitle>
                <CardDescription>Overzicht van alle onderdelen van het EAI Model 6.5</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-950 dark:to-lime-900">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        EAI PromptRuntime
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        De kern van het systeem die Chain-of-Thought redenering uitvoert
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• Parameter analyse</li>
                        <li>• Rubric-gestuurde evaluatie</li>
                        <li>• Reflectieve redenering</li>
                        <li>• Onzekerheidsdetectie</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        SeedEngine
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Beheert reflectieve geheugenunits (seeds) die context en leerprocessen vastleggen
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• Seed creatie en beheer</li>
                        <li>• TTL (Time To Live) monitoring</li>
                        <li>• Emotie-gebaseerde categorisatie</li>
                        <li>• Pattern detection</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        ReflectionCompiler
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Compileert en verfijnt reflectieve analyses voor betere inzichten
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• CoT trace verwerking</li>
                        <li>• Assumption validation</li>
                        <li>• Alternative scenario's</li>
                        <li>• Contextualisatie</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        SAL Monitor
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        System Awareness Layer voor ethische borging en compliance monitoring
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• EU AI Act compliance</li>
                        <li>• Transparantie checks</li>
                        <li>• Bias detectie</li>
                        <li>• Autonomie monitoring</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Evaluatie Engine
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Voert gestructureerde evaluaties uit van AI-tools in onderwijscontexten
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• Parameter berekening</li>
                        <li>• Taakdichtheid analyse</li>
                        <li>• Flag generatie</li>
                        <li>• Rapportage</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Analytics Module
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Geavanceerde analytics en pattern recognition voor inzichten
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• Usage analytics</li>
                        <li>• Performance metrics</li>
                        <li>• Trend analysis</li>
                        <li>• Predictive insights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>EAI Analyse Workflow</CardTitle>
                <CardDescription>Stap-voor-stap proces van een volledige EAI evaluatie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        step: 1,
                        title: "Context Collectie",
                        description: "Verzamelen van onderwijscontext, doelgroep en AI-tool informatie",
                        icon: <BookOpen className="h-4 w-4" />,
                      },
                      {
                        step: 2,
                        title: "Rubric Loading",
                        description: "Laden van relevante evaluatierubrieken voor de specifieke context",
                        icon: <Settings className="h-4 w-4" />,
                      },
                      {
                        step: 3,
                        title: "Parameter Analyse",
                        description: "Berekening van alle EAI parameters (P, V, D_A, D_Bc, T, A, B)",
                        icon: <Activity className="h-4 w-4" />,
                      },
                      {
                        step: 4,
                        title: "Chain-of-Thought",
                        description: "Uitvoeren van reflectieve redenering met Explain, Validate, Assumptions stappen",
                        icon: <Brain className="h-4 w-4" />,
                      },
                      {
                        step: 5,
                        title: "Flag Detectie",
                        description: "Genereren van waarschuwingen (🚫, ⚠️, ✅) op basis van parameter waarden",
                        icon: <AlertTriangle className="h-4 w-4" />,
                      },
                      {
                        step: 6,
                        title: "Taakdichtheid",
                        description: "Berekening van TD score om te bepalen wie kernleerhandelingen uitvoert",
                        icon: <Target className="h-4 w-4" />,
                      },
                      {
                        step: 7,
                        title: "SAL Compliance",
                        description: "Controle op ethische aspecten en EU AI Act compliance",
                        icon: <Shield className="h-4 w-4" />,
                      },
                      {
                        step: 8,
                        title: "EAI Score",
                        description: "Berekening van gewogen totaalscore met alle correctiefactoren",
                        icon: <Zap className="h-4 w-4" />,
                      },
                      {
                        step: 9,
                        title: "Rapportage",
                        description: "Genereren van rolspecifieke adviezen voor docent, leerling en beleidsmaker",
                        icon: <FileText className="h-4 w-4" />,
                      },
                    ].map((item) => (
                      <div key={item.step} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-lime-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {item.step}
                          </div>
                          <div className="text-lime-600">{item.icon}</div>
                          <h4 className="font-medium text-sm">{item.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chain-of-Thought Stappen</CardTitle>
                <CardDescription>Gedetailleerde uitleg van de reflectieve redenering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      step: "Explain",
                      description:
                        "Uitleggen van de parameter in de context van de gekozen rubric. Waarom heeft deze parameter deze waarde?",
                      example:
                        "[Explain] Parameter 'AI-feedback systeem' wordt verklaard via rubric: Ondersteunt leerlingbetrokkenheid door adaptieve terugkoppeling.",
                    },
                    {
                      step: "Validate",
                      description:
                        "Valideren van de parameterwaarde tegen bekende bandbreedtes en educatieve literatuur.",
                      example:
                        "[Validate] Score ligt binnen bandbreedte 0.7-0.8, gevalideerd met educatieve literatuur.",
                    },
                    {
                      step: "Assumptions",
                      description: "Identificeren van aannames die gemaakt zijn tijdens de analyse en hun impact.",
                      example:
                        "[Assumptions] Er is aangenomen dat de context voldoende betrouwbaar is. Gebruikersinput: 'Wiskunde, HAVO 4'.",
                    },
                    {
                      step: "Alternatives",
                      description: "Verkennen van alternatieve scenario's en hun mogelijke gevolgen.",
                      example:
                        "[Alternatives] Alternatief scenario met hogere score zou deze risico's tonen: mogelijk agencyverlies bij overmatige AI-sturing.",
                    },
                    {
                      step: "Contextualize",
                      description: "Plaatsen van de analyse in de specifieke onderwijscontext.",
                      example:
                        "[Contextualize] In deze onderwijssetting (Wiskunde) is het effect van AI-feedback afhankelijk van doelgroep HAVO 4.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {item.step}
                        </Badge>
                        <h4 className="font-medium">{item.step}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs font-mono">{item.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  SAL Compliance Framework
                </CardTitle>
                <CardDescription>System Awareness Layer voor ethische AI in het onderwijs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                      <h4 className="font-semibold mb-2">EU AI Act Compliance</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Transparantie vereisten</li>
                        <li>• Menselijk toezicht</li>
                        <li>• Risico classificatie</li>
                        <li>• Documentatie eisen</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                      <h4 className="font-semibold mb-2">Nederlandse Privacy Wet</h4>
                      <ul className="text-sm space-y-1">
                        <li>• GDPR compliance</li>
                        <li>• Leerling data bescherming</li>
                        <li>• Toestemming procedures</li>
                        <li>• Data minimalisatie</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">SAL Controle Categorieën</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          category: "Transparantie",
                          description: "AI-beslissingen moeten uitlegbaar en begrijpelijk zijn",
                          checks: ["Algoritme uitleg", "Decision paths", "Confidence scores"],
                        },
                        {
                          category: "Toezicht",
                          description: "Menselijke controle over AI-processen moet gewaarborgd zijn",
                          checks: ["Human-in-the-loop", "Override mogelijkheden", "Escalatie procedures"],
                        },
                        {
                          category: "Controleerbaarheid",
                          description: "Resultaten moeten verifieerbaar en reproduceerbaar zijn",
                          checks: ["Audit trails", "Versioning", "Reproducibility"],
                        },
                        {
                          category: "Autonomie",
                          description: "Leerling autonomie moet behouden blijven",
                          checks: ["Agency preservation", "Choice availability", "Dependency prevention"],
                        },
                        {
                          category: "Bias",
                          description: "Discriminatie en vooroordelen moeten gedetecteerd worden",
                          checks: ["Fairness metrics", "Bias testing", "Diverse datasets"],
                        },
                      ].map((item) => (
                        <div key={item.category} className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">{item.category}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                          <ul className="text-xs space-y-1">
                            {item.checks.map((check) => (
                              <li key={check}>• {check}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flag Systeem</CardTitle>
                <CardDescription>Automatische waarschuwingen op basis van parameter waarden</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🚫</span>
                        <h4 className="font-semibold text-red-800 dark:text-red-200">Stop Flags</h4>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">Kritieke tekortkomingen</p>
                      <ul className="text-xs space-y-1 text-red-600 dark:text-red-400">
                        <li>• D_A {"<"} 0.2 (Te weinig transparantie)</li>
                        <li>• B {">"} 0.7 (Hoge bias)</li>
                        <li>
                          • A {"<"} 0.3 en P {">"} 0.8 (Autonomieverlies)
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">⚠️</span>
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Warning Flags</h4>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">Aandachtspunten</p>
                      <ul className="text-xs space-y-1 text-yellow-600 dark:text-yellow-400">
                        <li>• 0.2 ≤ D_A {"<"} 0.5 (Beperkte transparantie)</li>
                        <li>• 0.5 {"<"} B ≤ 0.7 (Matige bias)</li>
                        <li>
                          • A {"<"} 0.5 en P {">"} 0.6 (Autonomie risico)
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg border-green-200 bg-green-50 dark:bg-green-950">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">✅</span>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Success Flags</h4>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-2">Didactisch verantwoord</p>
                      <ul className="text-xs space-y-1 text-green-600 dark:text-green-400">
                        <li>• Alle parameters binnen acceptabele ranges</li>
                        <li>• Goede balans tussen AI en leerling</li>
                        <li>• Ethische vereisten voldaan</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="glossary">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Woordenlijst & Definities</CardTitle>
                <CardDescription>Alle belangrijke termen en concepten uitgelegd</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      term: "Chain-of-Thought (CoT)",
                      definition:
                        "Een redeneermethod waarbij AI stap-voor-stap zijn denkproces uitlegt, wat transparantie en controleerbaarheid bevordert.",
                    },
                    {
                      term: "EAI Score",
                      definition:
                        "Educational AI Score - een gewogen totaalscore (0.0-1.0) die alle parameters combineert tot één evaluatiecijfer voor een AI-tool in onderwijscontext.",
                    },
                    {
                      term: "LIM Profiel",
                      definition:
                        "Leerling Interactie Model - een profiel dat beschrijft hoe een leerling interacteert met AI-tools en welke leereffecten dit heeft.",
                    },
                    {
                      term: "Rubric",
                      definition:
                        "Een gestructureerd evaluatiekader dat criteria en standaarden definieert voor het beoordelen van AI-tools in specifieke onderwijscontexten.",
                    },
                    {
                      term: "SAL (System Awareness Layer)",
                      definition:
                        "Een bewustzijnslaag die ethische aspecten, compliance en verantwoord AI-gebruik monitort en waarborgt.",
                    },
                    {
                      term: "Seed",
                      definition:
                        "Een reflectieve geheugeneenheid die context, emoties en leerprocessen vastlegt voor toekomstige analyse en patroonherkenning.",
                    },
                    {
                      term: "Taakdichtheid (TD)",
                      definition:
                        "Een maat (0.0-1.0) die aangeeft wie de kernleerhandelingen uitvoert: lagere waarden betekenen dat de leerling meer actief betrokken is.",
                    },
                    {
                      term: "TTL (Time To Live)",
                      definition:
                        "De levensduur van een seed, waarna deze automatisch verloopt en uit het systeem wordt verwijderd.",
                    },
                    {
                      term: "Vaardigheidsondersteuning (V)",
                      definition:
                        "Samengestelde parameter die meet hoe goed een AI-tool verschillende vaardigheden ondersteunt: cognitief, metacognitief, sociaal en motivationeel.",
                    },
                    {
                      term: "Autonomiecoëfficiënt (A)",
                      definition:
                        "Parameter die meet in hoeverre leerlingen hun autonomie en zelfstandigheid behouden bij het gebruik van een AI-tool.",
                    },
                    {
                      term: "Biascorrectie (B)",
                      definition:
                        "Parameter die de aanwezigheid van vooroordelen en discriminatie in AI-output meet (lagere waarden zijn beter).",
                    },
                    {
                      term: "Procesfase-specificiteit (P)",
                      definition:
                        "Parameter die aangeeft in welke fase van het leerproces (introductie, oefening, toepassing, evaluatie) de AI-tool wordt ingezet.",
                    },
                    {
                      term: "AI-verwerkingsniveau (D_A)",
                      definition:
                        "Parameter die de transparantie en uitlegbaarheid van AI-beslissingen meet - hoe goed kunnen gebruikers begrijpen wat de AI doet.",
                    },
                    {
                      term: "Correctietoezicht (D_Bc)",
                      definition:
                        "Parameter die meet in hoeverre menselijk toezicht en correctie van AI-beslissingen mogelijk en effectief is.",
                    },
                    {
                      term: "Technologische integratie (T)",
                      definition:
                        "Parameter die evalueert hoe goed een AI-tool integreert in de bestaande onderwijsomgeving en -workflow.",
                    },
                  ].map((item) => (
                    <div key={item.term} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-lime-700 dark:text-lime-300 mb-2">{item.term}</h4>
                      <p className="text-sm text-muted-foreground">{item.definition}</p>
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
