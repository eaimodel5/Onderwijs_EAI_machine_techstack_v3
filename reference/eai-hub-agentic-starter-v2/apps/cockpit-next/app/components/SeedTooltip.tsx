"use client"

import type React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface SeedTooltipProps {
  children?: React.ReactNode
  className?: string
}

export default function SeedTooltip({ children, className }: SeedTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || <HelpCircle className={`h-4 w-4 text-muted-foreground cursor-help ${className}`} />}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm font-medium">Seeds - Reflectieve Parameters</p>
            <p className="text-xs">
              Seeds zijn reflectieve geheugenunits die suggesties genereren voor leerprocessen. Ze worden{" "}
              <strong>nooit automatisch geactiveerd</strong> en vereisen altijd handmatige bevestiging.
            </p>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Klik op "EAI Gids" voor meer informatie over het SeedEngine systeem.
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
