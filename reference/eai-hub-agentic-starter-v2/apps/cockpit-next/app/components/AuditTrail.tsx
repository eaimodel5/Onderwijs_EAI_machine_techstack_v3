"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Clock, User, AlertTriangle, CheckCircle, Info } from "lucide-react"

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock audit data
  const auditEntries = [
    {
      id: "audit_001",
      timestamp: "2025-01-26T14:30:00Z",
      type: "seed_proposal",
      user: "Arkadiusz",
      action: "Nieuwe seed voorgesteld",
      details: "Seed_UserTrace_Arkadiusz_01 voorgesteld na reflectieve analyse",
      status: "pending",
      data: {
        seed_id: "Seed_UserTrace_Arkadiusz_01",
        emotion: "Inspiratie met uważnością",
        weight: 0.95,
      },
    },
    {
      id: "audit_002",
      timestamp: "2025-01-26T14:15:00Z",
      type: "cot_analysis",
      user: "System",
      action: "Chain-of-Thought analyse voltooid",
      details: "Parameter evaluatie voor AI-feedback systeem",
      status: "completed",
      data: {
        parameter: "AI-feedback systeem",
        uncertainty_label: "✅",
        matched_descriptors: ["Adaptieve feedback", "Leerlingbetrokkenheid"],
      },
    },
    {
      id: "audit_003",
      timestamp: "2025-01-26T13:45:00Z",
      type: "ttl_warning",
      user: "System",
      action: "TTL waarschuwing gegenereerd",
      details: "3 Seeds verlopen binnen 24 uur",
      status: "warning",
      data: {
        expiring_seeds: ["Seed_0003", "Seed_0008", "Seed_0010"],
        hours_remaining: [18, 12, 6],
      },
    },
    {
      id: "audit_004",
      timestamp: "2025-01-26T13:20:00Z",
      type: "pattern_detection",
      user: "System",
      action: "Nieuw patroon gedetecteerd",
      details: "Emotie-flow patroon herkend in seed activatie",
      status: "info",
      data: {
        pattern: ["Seed_0005", "Seed_0008", "Seed_0010"],
        emotion_flow: ["Ciekawość", "Introspekcja", "Zamysł"],
        frequency: 4,
      },
    },
    {
      id: "audit_005",
      timestamp: "2025-01-26T12:50:00Z",
      type: "sal_compliance",
      user: "System",
      action: "SAL compliance check uitgevoerd",
      details: "Volledige compliance gevalideerd voor nieuwe AI-tool",
      status: "completed",
      data: {
        tool: "ChatGPT voor wiskundehulp",
        c_factor: 1.0,
        flags: [],
      },
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "warning":
        return "bg-orange-100 text-orange-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredEntries = auditEntries.filter(
    (entry) =>
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>Volledige logging van alle EAI Model 6.5 activiteiten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Zoek in audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredEntries.length} van {auditEntries.length} entries weergegeven
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="statistics">Statistieken</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-full ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm">{entry.action}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString("nl-NL")}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{entry.details}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {entry.type}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-mono">{entry.id}</CardTitle>
                    <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                  </div>
                  <CardDescription>
                    {new Date(entry.timestamp).toLocaleString("nl-NL")} | {entry.user} | {entry.type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Actie</h4>
                      <p className="text-sm text-muted-foreground">{entry.action}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-1">Details</h4>
                      <p className="text-sm text-muted-foreground">{entry.details}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-1">Data</h4>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <pre className="text-xs text-slate-700 overflow-x-auto">
                          {JSON.stringify(entry.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Totaal Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditEntries.length}</div>
                <p className="text-xs text-muted-foreground">Laatste 24 uur</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Seed Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {auditEntries.filter((e) => e.type === "seed_proposal").length}
                </div>
                <p className="text-xs text-muted-foreground">Voorgestelde seeds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">CoT Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditEntries.filter((e) => e.type === "cot_analysis").length}</div>
                <p className="text-xs text-muted-foreground">Voltooide analyses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Waarschuwingen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditEntries.filter((e) => e.status === "warning").length}</div>
                <p className="text-xs text-muted-foreground">Actieve warnings</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Activiteit per Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  auditEntries.reduce(
                    (acc, entry) => {
                      acc[entry.type] = (acc[entry.type] || 0) + 1
                      return acc
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{type.replace("_", " ")}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
