"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, UserPlus, Shield, Activity, Settings } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "docent" | "onderzoeker" | "leerling"
  status: "active" | "inactive" | "pending"
  lastActive: string
  seedsCreated: number
  cotSessions: number
  permissions: string[]
}

export default function UserManagement() {
  const [users] = useState<User[]>([
    {
      id: "user_001",
      name: "Hans Visser",
      email: "h.visser@university.edu",
      role: "admin",
      status: "active",
      lastActive: "2025-01-26T14:30:00Z",
      seedsCreated: 12,
      cotSessions: 45,
      permissions: ["full_access", "user_management", "system_config"],
    },
    {
      id: "user_002",
      name: "Maria van der Berg",
      email: "m.vandeberg@school.nl",
      role: "docent",
      status: "active",
      lastActive: "2025-01-26T13:15:00Z",
      seedsCreated: 8,
      cotSessions: 23,
      permissions: ["create_evaluations", "view_analytics", "manage_students"],
    },
    {
      id: "user_003",
      name: "Prof. Jan Janssen",
      email: "j.janssen@research.nl",
      role: "onderzoeker",
      status: "active",
      lastActive: "2025-01-26T12:45:00Z",
      seedsCreated: 15,
      cotSessions: 67,
      permissions: ["advanced_analytics", "export_data", "research_access"],
    },
    {
      id: "user_004",
      name: "Emma de Vries",
      email: "emma.devries@student.nl",
      role: "leerling",
      status: "active",
      lastActive: "2025-01-26T11:20:00Z",
      seedsCreated: 3,
      cotSessions: 12,
      permissions: ["basic_access", "self_evaluation"],
    },
    {
      id: "user_005",
      name: "Thomas Bakker",
      email: "t.bakker@school.nl",
      role: "docent",
      status: "pending",
      lastActive: "2025-01-25T16:30:00Z",
      seedsCreated: 0,
      cotSessions: 0,
      permissions: [],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "docent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "onderzoeker":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "leerling":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const roleStats = {
    admin: users.filter((u) => u.role === "admin").length,
    docent: users.filter((u) => u.role === "docent").length,
    onderzoeker: users.filter((u) => u.role === "onderzoeker").length,
    leerling: users.filter((u) => u.role === "leerling").length,
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gebruikersbeheer
              </CardTitle>
              <CardDescription>Beheer gebruikers, rollen en toegangsrechten voor EAI Model 6.5</CardDescription>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-lime-500 hover:bg-lime-600 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nieuwe Gebruiker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nieuwe Gebruiker Toevoegen</DialogTitle>
                  <DialogDescription>Voeg een nieuwe gebruiker toe aan het EAI systeem</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Naam</Label>
                      <Input id="name" placeholder="Volledige naam" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leerling">Leerling</SelectItem>
                        <SelectItem value="docent">Docent</SelectItem>
                        <SelectItem value="onderzoeker">Onderzoeker</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-lime-500 hover:bg-lime-600">Gebruiker Toevoegen</Button>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Annuleren
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Zoek gebruikers op naam of email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Alle rollen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle rollen</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="docent">Docent</SelectItem>
                <SelectItem value="onderzoeker">Onderzoeker</SelectItem>
                <SelectItem value="leerling">Leerling</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Alle statussen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="active">Actief</SelectItem>
                <SelectItem value="inactive">Inactief</SelectItem>
                <SelectItem value="pending">In afwachting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredUsers.length} van {users.length} gebruikers weergegeven
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-lime-500 data-[state=active]:text-white">
            Overzicht
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-lime-500 data-[state=active]:text-white">
            Gebruikers
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-lime-500 data-[state=active]:text-white">
            Rollen & Rechten
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-lime-500 data-[state=active]:text-white">
            Activiteit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-lime-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {users.filter((u) => u.status === "active").length} actief
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Docenten</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.docent}</div>
                <p className="text-xs text-muted-foreground">Onderwijsprofessionals</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leerlingen</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.leerling}</div>
                <p className="text-xs text-muted-foreground">Actieve studenten</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Onderzoekers</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.onderzoeker}</div>
                <p className="text-xs text-muted-foreground">Research toegang</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200">
                        <AvatarInitials name={user.name} />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Laatst actief: {new Date(user.lastActive).toLocaleDateString("nl-NL")}</span>
                        <span>Seeds: {user.seedsCreated}</span>
                        <span>CoT Sessies: {user.cotSessions}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="hover:bg-lime-50 hover:border-lime-300">
                        <Settings className="h-4 w-4 mr-1" />
                        Bewerken
                      </Button>
                      {user.status === "pending" && (
                        <Button size="sm" className="bg-lime-500 hover:bg-lime-600 text-white">
                          Goedkeuren
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rol Definities</CardTitle>
                <CardDescription>Overzicht van beschikbare rollen en hun rechten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Administrator</Badge>
                    <span className="text-sm text-muted-foreground">Volledige toegang</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Gebruikersbeheer</li>
                    <li>• Systeemconfiguratie</li>
                    <li>• Alle analytics en data</li>
                    <li>• Audit trail toegang</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Docent</Badge>
                    <span className="text-sm text-muted-foreground">Onderwijsgerichte toegang</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI-tool evaluaties</li>
                    <li>• Leerling analytics</li>
                    <li>• Seed management</li>
                    <li>• Rapportage tools</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Onderzoeker
                    </Badge>
                    <span className="text-sm text-muted-foreground">Research toegang</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Geavanceerde analytics</li>
                    <li>• Data export</li>
                    <li>• Patroon analyse</li>
                    <li>• Experimentele features</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Leerling
                    </Badge>
                    <span className="text-sm text-muted-foreground">Basis toegang</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Zelfevaluatie tools</li>
                    <li>• Persoonlijke analytics</li>
                    <li>• Reflectie interface</li>
                    <li>• Basis seed viewing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rechten Matrix</CardTitle>
                <CardDescription>Gedetailleerde toegangsrechten per functionaliteit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2 items-center text-sm font-medium border-b pb-2">
                    <span>Functionaliteit</span>
                    <span className="text-center">Admin</span>
                    <span className="text-center">Docent</span>
                    <span className="text-center">Onderzoeker</span>
                    <span className="text-center">Leerling</span>
                  </div>
                  {[
                    { feature: "Seeds Management", admin: true, docent: true, onderzoeker: true, leerling: false },
                    { feature: "CoT Analysis", admin: true, docent: true, onderzoeker: true, leerling: true },
                    { feature: "AI Evaluation", admin: true, docent: true, onderzoeker: true, leerling: false },
                    { feature: "Advanced Analytics", admin: true, docent: false, onderzoeker: true, leerling: false },
                    { feature: "User Management", admin: true, docent: false, onderzoeker: false, leerling: false },
                    { feature: "System Config", admin: true, docent: false, onderzoeker: false, leerling: false },
                    { feature: "Data Export", admin: true, docent: true, onderzoeker: true, leerling: false },
                    { feature: "Audit Trail", admin: true, docent: false, onderzoeker: true, leerling: false },
                  ].map((item) => (
                    <div key={item.feature} className="grid grid-cols-5 gap-2 items-center text-sm">
                      <span className="font-medium">{item.feature}</span>
                      <div className="text-center">
                        {item.admin ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            ✓
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          >
                            ✗
                          </Badge>
                        )}
                      </div>
                      <div className="text-center">
                        {item.docent ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            ✓
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          >
                            ✗
                          </Badge>
                        )}
                      </div>
                      <div className="text-center">
                        {item.onderzoeker ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            ✓
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          >
                            ✗
                          </Badge>
                        )}
                      </div>
                      <div className="text-center">
                        {item.leerling ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            ✓
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          >
                            ✗
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gebruikersactiviteit</CardTitle>
                <CardDescription>Recente activiteiten en engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users
                    .filter((u) => u.status === "active")
                    .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
                    .slice(0, 10)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200">
                            <AvatarInitials name={user.name} />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{user.name}</span>
                            <Badge className={getRoleColor(user.role)} variant="secondary">
                              {user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Laatst actief: {new Date(user.lastActive).toLocaleTimeString("nl-NL")}</span>
                            <span>Seeds: {user.seedsCreated}</span>
                            <span>CoT: {user.cotSessions}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round((Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60))}m geleden
                          </div>
                        </div>
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
