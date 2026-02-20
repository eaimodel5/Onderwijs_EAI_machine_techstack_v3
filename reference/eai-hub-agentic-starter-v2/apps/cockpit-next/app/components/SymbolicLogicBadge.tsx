"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SigmaIcon as Lambda, Lightbulb, X, FileText, Eye } from "lucide-react"

interface SymbolicLogicBadgeProps {
  onTraceView?: () => void
}

export default function SymbolicLogicBadge({ onTraceView }: SymbolicLogicBadgeProps) {
  const [hasActiveRules, setHasActiveRules] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if there are any active symbolic inference rules
    const checkActiveRules = async () => {
      try {
        const response = await fetch("/data/symbolic_inference_trace.json")
        const trace = await response.json()
        setHasActiveRules(trace && trace.length > 0)
      } catch (error) {
        console.error("Failed to check symbolic inference trace:", error)
        setHasActiveRules(false)
      }
    }

    checkActiveRules()
    // Check every 30 seconds for updates
    const interval = setInterval(checkActiveRules, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!hasActiveRules) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
        >
          <Lambda className="h-3 w-3 mr-1" />
          Symbolische Logica
        </Badge>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] sm:h-[60vh]">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Symbolische Logica Actief
          </SheetTitle>
          <SheetDescription>
            Deze analyse gebruikt extra logica gebaseerd op formele regels, niet alleen op taal of data.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Bijvoorbeeld:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                Als de autonomie laag is en AI te veel doet, krijg je een reflectievraag over je leerdoelen.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                Als er bias is zonder uitleg, vraagt het systeem om toelichting.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Waarom belangrijk?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-sm text-green-800">Transparant</div>
                <div className="text-xs text-green-600">Je ziet waarom iets gebeurt</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-sm text-blue-800">Veilig</div>
                <div className="text-xs text-blue-600">AI voert nooit iets uit zonder voorwaarden</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-sm text-purple-800">Kritisch</div>
                <div className="text-xs text-purple-600">Verbanden tussen scores worden actief bewaakt</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={onTraceView} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Bekijk Logboek
            </Button>
            <Button variant="outline" size="sm" onClick={onTraceView} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Trace Details
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
