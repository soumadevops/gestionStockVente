"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, User, Edit, Save, X, Upload, Moon, Sun } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface CompanySettings {
  companyName: string
  adminName: string
  logoUrl: string
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
      <div className="bg-gradient-to-r from-slate-500/10 via-gray-500/5 to-zinc-500/10 rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent mb-2">
            Paramètres
          </h1>
          <p className="text-slate-600 dark:text-slate-300">Configuration de l'entreprise et de l'administrateur</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informations de l'Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingSettings ? (
            <div className="space-y-4">
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
                    <p className="font-medium text-card-foreground">Nom de l'Entreprise</p>
                    <p className="text-muted-foreground">{companySettings.companyName}</p>
                  </div>
                </div>
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-card-foreground">Nom de l'Administrateur</p>
                  <p className="text-muted-foreground">{companySettings.adminName}</p>
                </div>
                <User className="w-5 h-5 text-primary" />
              </div>
              <Button
                onClick={() => {
                  setTempSettings(companySettings)
                  setIsEditingSettings(true)
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-card-foreground">
                  Nom de l'Entreprise
                </Label>
                <Input
                  id="companyName"
                  value={tempSettings.companyName}
                  onChange={(e) => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                  placeholder="Ex: Mon Entreprise"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="adminName" className="text-card-foreground">
                  Nom de l'Administrateur
                </Label>
                <Input
                  id="adminName"
                  value={tempSettings.adminName}
                  onChange={(e) => setTempSettings({ ...tempSettings, adminName: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
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
                      Choisir
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

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Apparence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div>
              <p className="font-medium text-card-foreground">Mode sombre</p>
              <p className="text-muted-foreground text-sm">Basculer entre le mode clair et sombre</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  )
})