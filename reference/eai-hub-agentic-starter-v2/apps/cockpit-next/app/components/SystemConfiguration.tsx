"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Save, RotateCcw, AlertTriangle, Database, Brain, Shield } from "lucide-react"
import SeedTooltip from "./SeedTooltip"

export default function SystemConfiguration() {
  const [config, setConfig] = useState({
    // Core Settings
    max_active_seeds: 50,
    seed_ttl_default: 30,
    cot_timeout: 300,
    reflection_depth: 3,

    // Performance Settings
    enable_caching: true,
    cache_duration: 3600,
    max_concurrent_sessions: 10,
    auto_cleanup: true,

    // SAL Settings
    sal_strict_mode: true,
    compliance_threshold: 0.95,
    auto_violation_reporting: true,
    ethical_review_required: true,

    // Security Settings
    session_timeout: 1800,
    require_2fa: false,
    audit_retention_days: 365,
    encryption_level: "AES-256",

    // Notification Settings
    email_notifications: true,
    slack_webhook: "",
    alert_threshold_cpu: 80,
    alert_threshold_memory: 85,

    // Advanced Settings
    debug_mode: false,
    experimental_features: false,
    api_rate_limit: 1000,
    backup_frequency: "daily",
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSaving(false)
    setHasChanges(false)
  }

  const handleReset = () => {
    // Reset to defaults
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Systeemconfiguratie
              </CardTitle>
              <CardDescription>Configureer EAI Model 6.5 instellingen en parameters</CardDescription>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Opslaan
                  </>
                )}
              </Button>
            </div>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-600">Er zijn niet-opgeslagen wijzigingen</span>
            </div>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="core" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="core">Kern Instellingen</TabsTrigger>
          <TabsTrigger value="performance">Prestaties</TabsTrigger>
          <TabsTrigger value="security">Beveiliging</TabsTrigger>
          <TabsTrigger value="notifications">Meldingen</TabsTrigger>
          <TabsTrigger value="advanced">Geavanceerd</TabsTrigger>
        </TabsList>

        <TabsContent value="core">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Seed Engine Configuratie
                </CardTitle>
                <CardDescription>Instellingen voor seed management en TTL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="max_seeds" className="flex items-center gap-2">
                    Maximum Actieve Seeds
                    <SeedTooltip />
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[config.max_active_seeds]}
                      onValueChange={([value]) => updateConfig("max_active_seeds", value)}
                      max={100}
                      min={10}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{config.max_active_seeds}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximaal aantal seeds dat tegelijkertijd actief kan zijn. Seeds genereren alleen voorstellen en
                    activeren nooit automatisch.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seed_ttl" className="flex items-center gap-2">
                    Standaard Seed TTL (dagen)
                    <SeedTooltip />
                  </Label>
                  <Input
                    id="seed_ttl"
                    type="number"
                    value={config.seed_ttl_default}
                    onChange={(e) => updateConfig("seed_ttl_default", Number.parseInt(e.target.value))}
                    min={1}
                    max={365}
                  />
                  <p className="text-xs text-muted-foreground">
                    Standaard levensduur voor nieuwe seeds. Na verloop worden ze automatisch gedeactiveerd.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reflection_depth">Reflectie Diepte</Label>
                  <Select
                    value={config.reflection_depth.toString()}
                    onValueChange={(value) => updateConfig("reflection_depth", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Basis (1 niveau)</SelectItem>
                      <SelectItem value="2">Gemiddeld (2 niveaus)</SelectItem>
                      <SelectItem value="3">Diep (3 niveaus)</SelectItem>
                      <SelectItem value="4">Zeer diep (4 niveaus)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Diepte van reflectieve analyse</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Chain-of-Thought Configuratie
                </CardTitle>
                <CardDescription>Instellingen voor CoT reasoning engine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cot_timeout">CoT Timeout (seconden)</Label>
                  <Input
                    id="cot_timeout"
                    type="number"
                    value={config.cot_timeout}
                    onChange={(e) => updateConfig("cot_timeout", Number.parseInt(e.target.value))}
                    min={30}
                    max={600}
                  />
                  <p className="text-xs text-muted-foreground">Maximum tijd voor een CoT analyse</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_sessions">Max Gelijktijdige Sessies</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[config.max_concurrent_sessions]}
                      onValueChange={([value]) => updateConfig("max_concurrent_sessions", value)}
                      max={50}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{config.max_concurrent_sessions}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Aantal gelijktijdige CoT sessies</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto_cleanup">Automatische Opruiming</Label>
                    <p className="text-xs text-muted-foreground">Ruim voltooide sessies automatisch op</p>
                  </div>
                  <Switch
                    id="auto_cleanup"
                    checked={config.auto_cleanup}
                    onCheckedChange={(checked) => updateConfig("auto_cleanup", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Caching & Optimalisatie</CardTitle>
                <CardDescription>Prestatie-instellingen voor snellere responstijden</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable_caching">Caching Inschakelen</Label>
                    <p className="text-xs text-muted-foreground">Cache resultaten voor snellere toegang</p>
                  </div>
                  <Switch
                    id="enable_caching"
                    checked={config.enable_caching}
                    onCheckedChange={(checked) => updateConfig("enable_caching", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cache_duration">Cache Duur (seconden)</Label>
                  <Input
                    id="cache_duration"
                    type="number"
                    value={config.cache_duration}
                    onChange={(e) => updateConfig("cache_duration", Number.parseInt(e.target.value))}
                    min={300}
                    max={86400}
                    disabled={!config.enable_caching}
                  />
                  <p className="text-xs text-muted-foreground">Hoe lang cache items bewaard blijven</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_rate_limit">API Rate Limit (per uur)</Label>
                  <Input
                    id="api_rate_limit"
                    type="number"
                    value={config.api_rate_limit}
                    onChange={(e) => updateConfig("api_rate_limit", Number.parseInt(e.target.value))}
                    min={100}
                    max={10000}
                  />
                  <p className="text-xs text-muted-foreground">Maximum API calls per gebruiker per uur</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Monitoring</CardTitle>
                <CardDescription>Drempelwaarden voor systeem alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cpu_threshold">CPU Alert Drempel (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[config.alert_threshold_cpu]}
                      onValueChange={([value]) => updateConfig("alert_threshold_cpu", value)}
                      max={100}
                      min={50}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{config.alert_threshold_cpu}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memory_threshold">Memory Alert Drempel (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[config.alert_threshold_memory]}
                      onValueChange={([value]) => updateConfig("alert_threshold_memory", value)}
                      max={100}
                      min={50}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{config.alert_threshold_memory}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup_frequency">Backup Frequentie</Label>
                  <Select
                    value={config.backup_frequency}
                    onValueChange={(value) => updateConfig("backup_frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Elk uur</SelectItem>
                      <SelectItem value="daily">Dagelijks</SelectItem>
                      <SelectItem value="weekly">Wekelijks</SelectItem>
                      <SelectItem value="monthly">Maandelijks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SAL Compliance Instellingen
                </CardTitle>
                <CardDescription>System Awareness Layer configuratie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sal_strict">Strikte SAL Modus</Label>
                    <p className="text-xs text-muted-foreground">Blokkeer acties bij compliance overtredingen</p>
                  </div>
                  <Switch
                    id="sal_strict"
                    checked={config.sal_strict_mode}
                    onCheckedChange={(checked) => updateConfig("sal_strict_mode", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compliance_threshold">Compliance Drempel</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[config.compliance_threshold * 100]}
                      onValueChange={([value]) => updateConfig("compliance_threshold", value / 100)}
                      max={100}
                      min={80}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{(config.compliance_threshold * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum compliance score voor goedkeuring</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto_reporting">Auto Violation Reporting</Label>
                    <p className="text-xs text-muted-foreground">Rapporteer overtredingen automatisch</p>
                  </div>
                  <Switch
                    id="auto_reporting"
                    checked={config.auto_violation_reporting}
                    onCheckedChange={(checked) => updateConfig("auto_violation_reporting", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ethical_review">Ethische Review Vereist</Label>
                    <p className="text-xs text-muted-foreground">Vereis handmatige review voor kritieke beslissingen</p>
                  </div>
                  <Switch
                    id="ethical_review"
                    checked={config.ethical_review_required}
                    onCheckedChange={(checked) => updateConfig("ethical_review_required", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Beveiliging & Toegang</CardTitle>
                <CardDescription>Gebruikersbeveiliging en sessie-instellingen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Sessie Timeout (seconden)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={config.session_timeout}
                    onChange={(e) => updateConfig("session_timeout", Number.parseInt(e.target.value))}
                    min={300}
                    max={7200}
                  />
                  <p className="text-xs text-muted-foreground">Automatische uitlog na inactiviteit</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require_2fa">Twee-Factor Authenticatie</Label>
                    <p className="text-xs text-muted-foreground">Vereis 2FA für alle Benutzer</p>
                  </div>
                  <Switch
                    id="require_2fa"
                    checked={config.require_2fa}
                    onCheckedChange={(checked) => updateConfig("require_2fa", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audit_retention">Audit Retentie (dagen)</Label>
                  <Input
                    id="audit_retention"
                    type="number"
                    value={config.audit_retention_days}
                    onChange={(e) => updateConfig("audit_retention_days", Number.parseInt(e.target.value))}
                    min={30}
                    max={2555}
                  />
                  <p className="text-xs text-muted-foreground">Hoe lang audit logs bewaard blijven</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryption">Encryptie Niveau</Label>
                  <Select
                    value={config.encryption_level}
                    onValueChange={(value) => updateConfig("encryption_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES-128">AES-128</SelectItem>
                      <SelectItem value="AES-256">AES-256</SelectItem>
                      <SelectItem value="ChaCha20">ChaCha20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificatie Instellingen</CardTitle>
              <CardDescription>Configureer alerts en meldingen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_notifications">Email Notificaties</Label>
                  <p className="text-xs text-muted-foreground">Verstuur belangrijke meldingen via email</p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={config.email_notifications}
                  onCheckedChange={(checked) => updateConfig("email_notifications", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slack_webhook">Slack Webhook URL</Label>
                <Input
                  id="slack_webhook"
                  type="url"
                  value={config.slack_webhook}
                  onChange={(e) => updateConfig("slack_webhook", e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                />
                <p className="text-xs text-muted-foreground">Optioneel: Verstuur alerts naar Slack kanaal</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Geavanceerde Instellingen</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Alleen voor ervaren gebruikers - wijzig met voorzichtigheid</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug_mode">Debug Modus</Label>
                  <p className="text-xs text-muted-foreground">Schakel uitgebreide logging in voor troubleshooting</p>
                </div>
                <Switch
                  id="debug_mode"
                  checked={config.debug_mode}
                  onCheckedChange={(checked) => updateConfig("debug_mode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="experimental_features">Experimentele Features</Label>
                  <p className="text-xs text-muted-foreground">
                    Schakel beta functionaliteiten in (kan instabiliteit veroorzaken)
                  </p>
                </div>
                <Switch
                  id="experimental_features"
                  checked={config.experimental_features}
                  onCheckedChange={(checked) => updateConfig("experimental_features", checked)}
                />
              </div>

              {config.experimental_features && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Experimentele Features Actief</span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    Deze features zijn nog in ontwikkeling en kunnen onverwacht gedrag vertonen. Gebruik alleen in test
                    omgevingen.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
