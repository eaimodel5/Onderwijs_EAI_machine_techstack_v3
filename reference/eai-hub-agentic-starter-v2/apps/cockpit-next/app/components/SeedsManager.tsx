"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, Heart, Infinity, AlertTriangle, Brain, Activity, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import TTLManager from "./TTLManager"
import SeedFeedbackSystem from "./SeedFeedbackSystem"

interface Seed {
  id: string
  name: string
  type: string
  status: string
  created: string
  ttl: string
  emotie: string
  parameters: {
    P: number
    V_C: number
    V_M: number
    V_S: number
    V_A: number
    D_A: number
    D_Bc: number
    T: number
    A: number
    B: number
  }
  context: string
  flags: string[]
  td_score: number
  compliance_score: number
}

export default function SeedsManager() {
  const [seeds, setSeeds] = useState<Seed[]>([])
  const [filteredSeeds, setFilteredSeeds] = useState<Seed[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedSeedForFeedback, setSelectedSeedForFeedback] = useState<string | null>(null)
  const [feedbackData, setFeedbackData] = useState<any[]>([])

  useEffect(() => {
    fetch("/data/seeds_activated.json")
      .then((res) => res.json())
      .then((data) => {
        const seedsData = data.seeds_active || []
        setSeeds(seedsData)
        setFilteredSeeds(seedsData)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading seeds:", err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let filtered = seeds

    if (searchTerm) {
      filtered = filtered.filter(
        (seed) =>
          seed.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seed.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seed.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((seed) => seed.type === typeFilter)
    }

    setFilteredSeeds(filtered)
  }, [seeds, searchTerm, typeFilter])

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      // Nederlandse emoties
      nieuwsgierigheid: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      concentratie: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      reflectie: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      rust: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      vertrouwen: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      waakzaamheid: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      ondersteuning: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      objectiviteit: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
      aanpassing: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      verbinding: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      inspiratie: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
      gelijkwaardigheid: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    }
    return colors[emotion.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      reflectie: "bg-lime-500",
      analyse: "bg-blue-500",
      metacognitie: "bg-purple-500",
      evaluatie: "bg-green-500",
      feedback: "bg-orange-500",
      planning: "bg-indigo-500",
      samenwerking: "bg-pink-500",
      motivatie: "bg-yellow-500",
      ethiek: "bg-red-500",
      technologie: "bg-cyan-500",
    }
    return colors[type.toLowerCase()] || "bg-gray-500"
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "actief":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "inactief":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "verlopen":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const isExpiringSoon = (ttl: string) => {
    if (ttl === "Infinity") return false
    try {
      const expiryDate = new Date(ttl)
      const now = new Date()
      const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilExpiry < 24 && hoursUntilExpiry > 0
    } catch {
      return false
    }
  }

  const uniqueTypes = [...new Set(seeds.map((seed) => seed.type))]

  const handleArchiveSeed = (seedId: string) => {
    console.log("Archiving seed:", seedId)
    // Implementation for archiving
  }

  const handleDeleteSeed = (seedId: string) => {
    console.log("Deleting seed:", seedId)
    // Implementation for deletion
  }

  const handleExtendTTL = (seedId: string, newTTL: string) => {
    console.log("Extending TTL for seed:", seedId, "to:", newTTL)
    // Implementation for TTL extension
  }

  const handleFeedbackSubmit = (feedback: any) => {
    setFeedbackData((prev) => [...prev, feedback])
    console.log("Feedback submitted:", feedback)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center flex items-center justify-center gap-2">
            <Brain className="h-5 w-5 animate-spin text-lime-500" />
            <span>Laden van Seeds...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-l-4 border-l-lime-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-lime-600" />
            EAI Seeds Beheer
          </CardTitle>
          <CardDescription>
            Beheer en analyseer de {seeds.length} actieve reflectieve geheugenunits van het EAI Model 6.5
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Zoek seeds op ID, naam of context..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter op type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredSeeds.length} van {seeds.length} seeds weergegeven
          </div>
        </CardContent>
      </Card>

      {/* TTL Management */}
      <TTLManager
        seeds={filteredSeeds}
        onArchiveSeed={handleArchiveSeed}
        onDeleteSeed={handleDeleteSeed}
        onExtendTTL={handleExtendTTL}
      />

      {/* Seeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSeeds.map((seed) => (
          <Card key={seed.id} className="relative hover:shadow-lg transition-shadow duration-200">
            {isExpiringSoon(seed.ttl) && (
              <div className="absolute top-2 right-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-mono text-lime-700 dark:text-lime-300">{seed.id}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{seed.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(seed.type)}`}></div>
                    <Badge variant="outline" className="text-xs">
                      {seed.type}
                    </Badge>
                    <Badge className={getStatusColor(seed.status)} variant="secondary">
                      {seed.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-lime-600">{seed.td_score.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">TD Score</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Context
                </h4>
                <p className="text-sm text-muted-foreground">{seed.context}</p>
              </div>

              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <Badge className={getEmotionColor(seed.emotie)}>{seed.emotie}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {seed.ttl === "Infinity" ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      <Infinity className="h-3 w-3 mr-1" />
                      Permanent
                    </Badge>
                  ) : (
                    <span
                      className={isExpiringSoon(seed.ttl) ? "text-yellow-600 font-medium" : "text-muted-foreground"}
                    >
                      {new Date(seed.ttl).toLocaleDateString("nl-NL")}
                    </span>
                  )}
                </span>
              </div>

              {/* EAI Parameters Preview */}
              <div className="pt-2 border-t">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  EAI Parameters
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium">P</div>
                    <div className="text-muted-foreground">{seed.parameters.P.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">V_C</div>
                    <div className="text-muted-foreground">{seed.parameters.V_C.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">D_A</div>
                    <div className="text-muted-foreground">{seed.parameters.D_A.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Flags */}
              {seed.flags && seed.flags.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs font-medium">Flags:</span>
                    {seed.flags.map((flag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Score */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">SAL Compliance:</span>
                  <Badge
                    variant="secondary"
                    className={
                      seed.compliance_score >= 0.9
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : seed.compliance_score >= 0.7
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }
                  >
                    {(seed.compliance_score * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSeedForFeedback(seed.id)}
                  className="w-full text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Geef Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSeeds.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Geen seeds gevonden</h3>
            <p className="text-muted-foreground">Probeer je zoekterm aan te passen of selecteer een ander filter.</p>
          </CardContent>
        </Card>
      )}
      {selectedSeedForFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <SeedFeedbackSystem
                seedId={selectedSeedForFeedback}
                seedDescription={seeds.find((s) => s.id === selectedSeedForFeedback)?.context || ""}
                onFeedbackSubmit={handleFeedbackSubmit}
              />
              <Button variant="outline" onClick={() => setSelectedSeedForFeedback(null)} className="w-full mt-4">
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
