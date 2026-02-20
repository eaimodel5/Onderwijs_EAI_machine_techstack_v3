"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Archive, Trash2, AlertTriangle, RefreshCw } from "lucide-react"

interface TTLManagerProps {
  seeds: any[]
  onArchiveSeed: (seedId: string) => void
  onDeleteSeed: (seedId: string) => void
  onExtendTTL: (seedId: string, newTTL: string) => void
}

export default function TTLManager({ seeds, onArchiveSeed, onDeleteSeed, onExtendTTL }: TTLManagerProps) {
  const [expiredSeeds, setExpiredSeeds] = useState<any[]>([])
  const [expiringSoon, setExpiringSoon] = useState<any[]>([])

  useEffect(() => {
    const checkTTL = () => {
      const now = new Date()
      const expired: any[] = []
      const expiring: any[] = []

      seeds.forEach((seed) => {
        if (seed.ttl === "Infinity") return

        try {
          const expiryDate = new Date(seed.ttl)
          const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)

          if (hoursUntilExpiry <= 0) {
            expired.push(seed)
          } else if (hoursUntilExpiry <= 24) {
            expiring.push(seed)
          }
        } catch (error) {
          console.error("Invalid TTL format for seed:", seed.id)
        }
      })

      setExpiredSeeds(expired)
      setExpiringSoon(expiring)
    }

    checkTTL()
    const interval = setInterval(checkTTL, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [seeds])

  const handleExtendTTL = (seedId: string) => {
    const newTTL = new Date()
    newTTL.setDate(newTTL.getDate() + 7) // Extend by 7 days
    onExtendTTL(seedId, newTTL.toISOString())
  }

  return (
    <div className="space-y-4">
      {/* Expired Seeds */}
      {expiredSeeds.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Verlopen Seeds ({expiredSeeds.length})
            </CardTitle>
            <CardDescription className="text-red-600">Deze seeds zijn verlopen en vereisen actie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiredSeeds.map((seed) => (
              <div key={seed.id} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex-1">
                  <div className="font-mono text-sm text-red-700">{seed.id}</div>
                  <div className="text-xs text-muted-foreground">
                    Verlopen: {new Date(seed.ttl).toLocaleString("nl-NL")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExtendTTL(seed.id)} className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Verleng
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onArchiveSeed(seed.id)} className="text-xs">
                    <Archive className="h-3 w-3 mr-1" />
                    Archiveer
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDeleteSeed(seed.id)} className="text-xs">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Verwijder
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-4 w-4" />
              Verlopen Binnenkort ({expiringSoon.length})
            </CardTitle>
            <CardDescription className="text-yellow-600">Deze seeds verlopen binnen 24 uur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringSoon.map((seed) => {
              const hoursLeft = Math.floor((new Date(seed.ttl).getTime() - new Date().getTime()) / (1000 * 60 * 60))
              return (
                <div key={seed.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex-1">
                    <div className="font-mono text-sm text-yellow-700">{seed.id}</div>
                    <div className="text-xs text-muted-foreground">Verloopt over {hoursLeft} uur</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {hoursLeft}h resterend
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleExtendTTL(seed.id)} className="text-xs">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Verleng
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {expiredSeeds.length === 0 && expiringSoon.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Alle seeds hebben geldige TTL-waarden</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
