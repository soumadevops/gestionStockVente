"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, Plus, Save, X, Edit, Trash2, Smartphone, Phone, Calendar } from "lucide-react"

interface Sale {
  id: string
  nom_prenom_client: string
  numero_telephone: string
  date_vente: string
  modele: string
  marque: string
  imei_telephone: string
  prix: number
  created_at?: string
}

interface SalesViewProps {
  ventes: Sale[]
  filteredVentes: Sale[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  editingId: string | null
  formData: any
  setFormData: (data: any) => void
  handleAddVente: () => void
  handleEditVente: (id: string) => void
  handleSaveEdit: () => void
  handleCancelEdit: () => void
  handleDeleteSale: (id: string) => void
}

const PHONE_BRANDS = [
  "Apple", "Samsung", "Huawei", "Xiaomi", "Oppo", "Vivo", "OnePlus", "Google",
  "Sony", "LG", "Nokia", "Motorola", "Asus", "Realme", "Infinix", "Tecno", "Itel", "Autre"
]

export const SalesView = React.memo(function SalesView({
  ventes,
  filteredVentes,
  searchTerm,
  setSearchTerm,
  showAddForm,
  setShowAddForm,
  editingId,
  formData,
  setFormData,
  handleAddVente,
  handleEditVente,
  handleSaveEdit,
  handleCancelEdit,
  handleDeleteSale
}: SalesViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-green-500/10 rounded-3xl p-8 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              Gestion de Vente
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Gérez vos ventes et transactions</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Vente
          </Button>
        </div>
      </div>

      {(showAddForm || editingId) && (
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              {editingId ? "Modifier la Vente" : "Ajouter une Nouvelle Vente"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomPrenom" className="text-card-foreground">
                  Nom et Prénom Client
                </Label>
                <Input
                  id="nomPrenom"
                  value={formData.nom_prenom_client}
                  onChange={(e) => setFormData({ ...formData, nom_prenom_client: e.target.value })}
                  placeholder="Ex: Marie Dubois"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="numeroTelephone" className="text-card-foreground">
                  Numéro Téléphone
                </Label>
                <Input
                  id="numeroTelephone"
                  value={formData.numero_telephone}
                  onChange={(e) => setFormData({ ...formData, numero_telephone: e.target.value })}
                  placeholder="Ex: +33 6 12 34 56 78"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="dateVente" className="text-card-foreground">
                  Date de Vente
                </Label>
                <Input
                  id="dateVente"
                  type="date"
                  value={formData.date_vente}
                  onChange={(e) => setFormData({ ...formData, date_vente: e.target.value })}
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="modele" className="text-card-foreground">
                  Modèle
                </Label>
                <Input
                  id="modele"
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  placeholder="Ex: iPhone 15 Pro"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="marque" className="text-card-foreground">
                  Marque
                </Label>
                <Select
                  value={formData.marque}
                  onValueChange={(value) => setFormData({ ...formData, marque: value })}
                >
                  <SelectTrigger className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <SelectValue placeholder="Sélectionnez une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prix" className="text-card-foreground">
                  Prix (FCFA)
                </Label>
                <Input
                  id="prix"
                  type="number"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  placeholder="Ex: 1299000"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="imei" className="text-card-foreground">
                  IMEI Téléphone
                </Label>
                <Input
                  id="imei"
                  value={formData.imei_telephone}
                  onChange={(e) => setFormData({ ...formData, imei_telephone: e.target.value })}
                  placeholder="Ex: 123456789012345"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={editingId ? handleSaveEdit : handleAddVente}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Sauvegarder" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} className="border-border bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Rechercher par nom, modèle ou marque..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Sales List */}
      <div className="grid gap-4">
        {filteredVentes.map((vente) => (
          <Card key={vente.id} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground mb-1">{vente.nom_prenom_client}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {vente.marque} {vente.modele}
                    </p>
                    <p className="text-lg font-bold text-primary mb-2">{vente.prix.toLocaleString("fr-FR")} FCFA</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {vente.numero_telephone}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(vente.date_vente).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-xs col-span-full">IMEI: {vente.imei_telephone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditVente(vente.id)}
                    className="hover:bg-primary/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Voulez-vous vraiment supprimer la vente?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSale(vente.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVentes.length === 0 && (
        <div className="text-center py-12">
          <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune vente trouvée</p>
        </div>
      )}
    </div>
  )
})