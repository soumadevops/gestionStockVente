"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building, User, Edit, Save, X, Upload, Moon, Sun, Mail, Phone, MapPin, Globe, Database, Palette, CheckCircle, AlertCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface CompanySettings {
  companyName: string
  adminName: string
  logoUrl: string
  email: string
  phone: string
  address: string
  website: string
  taxId: string
  currency: string
  language: string
  timezone: string
}


interface SettingsViewProps {
  companySettings: CompanySettings
  isEditingSettings: boolean
  setIsEditingSettings: (editing: boolean) => void
  tempSettings: CompanySettings
  setTempSettings: (settings: CompanySettings) => void
  logoPreview: string | null
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSaveSettings: () => void
  handleCancelSettings: () => void
}

export const SettingsView = React.memo(function SettingsView({
  companySettings,
  isEditingSettings,
  setIsEditingSettings,
  tempSettings,
  setTempSettings,
  logoPreview,
  handleLogoUpload,
  handleSaveSettings,
  handleCancelSettings
}: SettingsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-500/10 via-gray-500/5 to-zinc-500/10 rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent mb-2">
              Paramètres Avancés
            </h1>
            <p className="text-slate-600 dark:text-slate-300">Configuration complète de votre entreprise et préférences utilisateur</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Synchronisé
            </Badge>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informations de l'Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditingSettings ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {companySettings.logoUrl && (
                      <img
                        src={companySettings.logoUrl || "/placeholder.svg"}
                        alt="Logo entreprise"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-card-foreground">Entreprise</p>
                      <p className="text-muted-foreground">{companySettings.companyName}</p>
                    </div>
                  </div>
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">Administrateur</p>
                    <p className="text-muted-foreground">{companySettings.adminName}</p>
                  </div>
                  <User className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companySettings.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <Mail className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{companySettings.email}</p>
                    </div>
                  </div>
                )}
                {companySettings.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <Phone className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p className="text-sm font-medium">{companySettings.phone}</p>
                    </div>
                  </div>
                )}
                {companySettings.website && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <Globe className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Site Web</p>
                      <p className="text-sm font-medium">{companySettings.website}</p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  setTempSettings(companySettings)
                  setIsEditingSettings(true)
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier les Informations
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName" className="text-card-foreground">
                    Nom de l'Entreprise *
                  </Label>
                  <Input
                    id="companyName"
                    value={tempSettings.companyName}
                    onChange={(e) => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                    placeholder="Ex: Mon Entreprise SARL"
                    className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="adminName" className="text-card-foreground">
                    Nom de l'Administrateur *
                  </Label>
                  <Input
                    id="adminName"
                    value={tempSettings.adminName}
                    onChange={(e) => setTempSettings({ ...tempSettings, adminName: e.target.value })}
                    placeholder="Ex: Jean Dupont"
                    className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-card-foreground">
                    Email de l'Entreprise
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={tempSettings.email || ""}
                    onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                    placeholder="contact@monentreprise.com"
                    className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-card-foreground">
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={tempSettings.phone || ""}
                    onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website" className="text-card-foreground">
                    Site Web
                  </Label>
                  <Input
                    id="website"
                    value={tempSettings.website || ""}
                    onChange={(e) => setTempSettings({ ...tempSettings, website: e.target.value })}
                    placeholder="https://www.monentreprise.com"
                    className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="taxId" className="text-card-foreground">
                    Numéro de TVA
                  </Label>
                  <Input
                    id="taxId"
                    value={tempSettings.taxId || ""}
                    onChange={(e) => setTempSettings({ ...tempSettings, taxId: e.target.value })}
                    placeholder="FR 12 345 678 901"
                    className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-card-foreground">
                  Adresse
                </Label>
                <Textarea
                  id="address"
                  value={tempSettings.address || ""}
                  onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                  placeholder="123 Rue de la République, 75001 Paris, France"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency" className="text-card-foreground">
                    Devise
                  </Label>
                  <Select
                    value={tempSettings.currency}
                    onValueChange={(value) => setTempSettings({ ...tempSettings, currency: value })}
                  >
                    <SelectTrigger className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <SelectValue placeholder="Sélectionnez une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="XOF">XOF (FCFA)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language" className="text-card-foreground">
                    Langue
                  </Label>
                  <Select
                    value={tempSettings.language}
                    onValueChange={(value) => setTempSettings({ ...tempSettings, language: value })}
                  >
                    <SelectTrigger className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone" className="text-card-foreground">
                    Fuseau Horaire
                  </Label>
                  <Select
                    value={tempSettings.timezone}
                    onValueChange={(value) => setTempSettings({ ...tempSettings, timezone: value })}
                  >
                    <SelectTrigger className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <SelectValue placeholder="Sélectionnez un fuseau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                      <SelectItem value="Africa/Dakar">Africa/Dakar (UTC+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="logo" className="text-card-foreground">
                  Logo de l'Entreprise
                </Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo")?.click()}
                      className="border-border bg-transparent hover:bg-primary/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un Logo
                    </Button>
                  </div>
                  {logoPreview && (
                    <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-lg overflow-hidden">
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Aperçu du logo"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setTempSettings({ ...tempSettings, logoUrl: "" })
                        }}
                        className="absolute top-1 right-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSaveSettings} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={handleCancelSettings} className="border-border bg-transparent">
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Appearance */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Apparence & Thème
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Mode Sombre</p>
                <p className="text-muted-foreground text-sm">Basculer entre le mode clair et sombre</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Thème Automatique</p>
                <p className="text-muted-foreground text-sm">S'adapter aux préférences système</p>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Bientôt disponible
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Database className="w-5 h-5" />
            Informations Système
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Version de l'Application</p>
              <p className="font-medium text-card-foreground">GestionStock v2.1.0</p>
            </div>
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Dernière Synchronisation</p>
              <p className="font-medium text-card-foreground">{new Date().toLocaleString('fr-FR')}</p>
            </div>
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Base de Données</p>
              <p className="font-medium text-card-foreground">Supabase PostgreSQL</p>
            </div>
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Statut</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-card-foreground">Opérationnel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})