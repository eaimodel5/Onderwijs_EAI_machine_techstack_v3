"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Brain,
  Database,
  GitBranch,
  Search,
  BarChart3,
  FileText,
  Zap,
  Settings,
  Users,
  TrendingUp,
  Sun,
  Moon,
  HelpCircle,
  BookOpen,
} from "lucide-react"
import { useTheme } from "next-themes"
import SeedsManager from "./components/SeedsManager"
import ReflectionEngine from "./components/ReflectionEngine"
import EvaluationTool from "./components/EvaluationTool"
import PatternViewer from "./components/PatternViewer"
import AuditTrail from "./components/AuditTrail"
import SystemOverview from "./components/SystemOverview"
import AdvancedAnalytics from "./components/AdvancedAnalytics"
import UserManagement from "./components/UserManagement"
import SystemConfiguration from "./components/SystemConfiguration"
import RealTimeMonitor from "./components/RealTimeMonitor"
import EAIGuide from "./components/EAIGuide"
import TerminologyInfoBox from "./components/TerminologyInfoBox"
import SymbolicLogicBadge from "./components/SymbolicLogicBadge"

export default function EAIReflectiveDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lime-500 rounded-lg shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">EAI Model 6.5</h1>
                <p className="text-muted-foreground">EAI Runtime Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-xl border-2 hover:bg-accent transition-colors"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl border-2 hover:bg-lime-50 hover:border-lime-300 dark:hover:bg-lime-950"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    EAI Gids
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-lime-600" />
                      EAI Model 6.5 - Uitgebreide Gids
                    </DialogTitle>
                    <DialogDescription>
                      Alles wat je moet weten over het Educational AI Model 6.5 en zijn componenten
                    </DialogDescription>
                  </DialogHeader>
                  <EAIGuide />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200">
              <Zap className="h-3 w-3 mr-1" />
              Reflectief Actief
            </Badge>
            <Badge variant="outline">Chain-of-Thought Ready</Badge>
            <Badge variant="outline">37 Seeds Geladen</Badge>
            <Badge variant="outline">SAL Compliance</Badge>
            <Badge variant="outline">Real-time Monitoring</Badge>
            <SymbolicLogicBadge onTraceView={() => setActiveTab("reflection")} />
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 lg:w-fit bg-muted/50 gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Systeemoverzicht"
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Overzicht</span>
            </TabsTrigger>
            <TabsTrigger
              value="monitor"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Real-time Monitoring"
            >
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Monitor</span>
            </TabsTrigger>
            <TabsTrigger
              value="seeds"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Seeds Beheer"
            >
              <Database className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Seeds</span>
            </TabsTrigger>
            <TabsTrigger
              value="reflection"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Reflectie Engine"
            >
              <Brain className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Reflectie</span>
            </TabsTrigger>
            <TabsTrigger
              value="evaluation"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="AI Evaluatie Tool"
            >
              <Search className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Evaluatie</span>
            </TabsTrigger>
            <TabsTrigger
              value="patterns"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Patroon Viewer"
            >
              <GitBranch className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Patronen</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Geavanceerde Analytics"
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Gebruikersbeheer"
            >
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Gebruikers</span>
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Audit Trail"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Audit</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-lime-500 data-[state=active]:text-white truncate min-w-0"
              title="Systeemconfiguratie"
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Instellingen</span>
            </TabsTrigger>
          </TabsList>

          {/* Terminology Info Box */}
          <TerminologyInfoBox />

          <TabsContent value="overview">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="monitor">
            <RealTimeMonitor />
          </TabsContent>

          <TabsContent value="seeds">
            <SeedsManager />
          </TabsContent>

          <TabsContent value="reflection">
            <ReflectionEngine />
          </TabsContent>

          <TabsContent value="evaluation">
            <EvaluationTool />
          </TabsContent>

          <TabsContent value="patterns">
            <PatternViewer />
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrail />
          </TabsContent>

          <TabsContent value="settings">
            <SystemConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
