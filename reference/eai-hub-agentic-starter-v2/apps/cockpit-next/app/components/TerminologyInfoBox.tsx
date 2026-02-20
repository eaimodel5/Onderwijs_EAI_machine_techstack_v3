"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, BookOpen, Brain, Database, FileText } from "lucide-react"

export default function TerminologyInfoBox() {
  const [isOpen, setIsOpen] = useState(false)

  const concepts = [
    {
      category: "Reflectievoorstellen",
      icon: <Brain className="h-4 w-4" />,
      color: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
      items: [
        {
          term: "Seeds",
          description:
            "Reflectieve parameters die suggesties genereren. Ze worden nooit automatisch geactiveerd en vereisen altijd bevestiging.",
        },
        {
          term: "Chain-of-Thought",
          description:
            "Stap-voor-stap redenering die transparantie biedt in AI-besluitvorming en voorstellen genereert.",
        },
      ],
    },
    {
      category: "Analyseparameters",
      icon: <Database className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      items: [
        {
          term: "TD (Taakdichtheid)",
          description: "Meet wie kernleerhandelingen uitvoert - lagere waarden betekenen meer leerlingactiviteit.",
        },
        {
          term: "A (Autonomie)",
          description: "Mate waarin leerlingen hun zelfstandigheid behouden bij AI-gebruik.",
        },
        {
          term: "D_Bc (Correctietoezicht)",
          description: "Mogelijkheid voor menselijk toezicht en correctie van AI-beslissingen.",
        },
      ],
    },
    {
      category: "Logging & Monitoring",
      icon: <FileText className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      items: [
        {
          term: "LIM Profiel",
          description: "Leerling Interactie Model - vastlegging van hoe leerlingen met AI-tools interacteren.",
        },
        {
          term: "SeedJournal",
          description: "Audit trail van alle seed-activiteiten en reflectieve processen voor transparantie.",
        },
        {
          term: "SAL Monitoring",
          description: "System Awareness Layer voor ethische borging en compliance controle.",
        },
      ],
    },
  ]

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">EAI Terminologie & Concepten</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            <CardDescription>
              Klik om uitleg te zien over reflectievoorstellen, analyseparameters en logging
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {concepts.map((concept) => (
                <div key={concept.category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-muted-foreground">{concept.icon}</div>
                    <Badge className={concept.color}>{concept.category}</Badge>
                  </div>

                  <div className="space-y-2">
                    {concept.items.map((item) => (
                      <div key={item.term} className="p-3 border rounded-lg bg-muted/30">
                        <h4 className="font-medium text-sm mb-1">{item.term}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Belangrijk:</strong> Alle reflectievoorstellen zijn suggesties die handmatige goedkeuring
                vereisen. Het systeem neemt nooit automatisch beslissingen over leerprocessen.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
