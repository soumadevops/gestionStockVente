"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, Plus, Save, X, Edit, Trash2, Smartphone, Phone, Calendar, Package } from "lucide-react"

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

interface Product {
  id: string
  nom_produit: string
  marque: string
  couleur: string
  prix_unitaire: number
  quantite_stock: number
  description?: string
  photo_url?: string
  imei_telephone?: string
  provenance?: string
  created_at?: string
  updated_at?: string
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
  products?: Product[]
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
  handleDeleteSale,
  products = []
}: SalesViewProps) {

  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId)
    if (selectedProduct) {
      setSelectedProduct(selectedProduct)
      setFormData({
        ...formData,
        nom_produit: selectedProduct.nom_produit,
        marque: selectedProduct.marque,
        modele: selectedProduct.couleur, // Map couleur to modele for sales
        prix: selectedProduct.prix_unitaire.toString(),
        imei_telephone: selectedProduct.imei_telephone || "",
      })
      // Clear any previous errors for this field
      setFormErrors(prev => ({ ...prev, product: "" }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!selectedProduct) {
      errors.product = "Veuillez sélectionner un produit"
    }

    if (!formData.nom_prenom_client?.trim()) {
      errors.nom_prenom_client = "Le nom du client est requis"
    }

    if (!formData.numero_telephone?.trim()) {
      errors.numero_telephone = "Le numéro de téléphone est requis"
    }

    if (!formData.date_vente) {
      errors.date_vente = "La date de vente est requise"
    }

    if (!formData.prix || isNaN(Number(formData.prix)) || Number(formData.prix) <= 0) {
      errors.prix = "Le prix doit être un nombre positif"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form is ready to submit
  const isFormValid = selectedProduct &&
                     formData.nom_prenom_client?.trim() &&
                     formData.numero_telephone?.trim() &&
                     formData.date_vente &&
                     formData.prix &&
                     !isNaN(Number(formData.prix)) &&
                     Number(formData.prix) > 0

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Call the parent handler
        if (editingId) {
          await handleSaveEdit()
        } else {
          await handleAddVente()
        }
        // Reset form state on success
        setSelectedProduct(null)
        setFormErrors({})
      } catch (error) {
        console.error('Error submitting form:', error)
        // Error handling is done in parent component
      }
    }
  }

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
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="space-y-6"
            >
              {/* Product Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-card-foreground">Sélection du Produit</h3>
                </div>

                <div>
                  <Label htmlFor="productSelect" className="text-card-foreground">
                    Produit disponible en stock *
                  </Label>
                  <Select
                    value=""
                    onValueChange={handleProductSelect}
                  >
                    <SelectTrigger className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <SelectValue placeholder="Sélectionnez un produit du stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter(product => product.quantite_stock > 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col">
                                <span className="font-medium">{product.nom_produit}</span>
                                <span className="text-sm text-muted-foreground">{product.marque} {product.couleur}</span>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-xs px-2 py-1 rounded font-medium ${
                                  product.quantite_stock === 0
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : product.quantite_stock <= 2
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : product.quantite_stock <= 5
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                    : 'bg-green-100 text-green-800 border border-green-200'
                                }`}>
                                  {product.quantite_stock === 0
                                    ? 'Rupture'
                                    : product.quantite_stock <= 2
                                    ? `Critique: ${product.quantite_stock}`
                                    : product.quantite_stock <= 5
                                    ? `Faible: ${product.quantite_stock}`
                                    : `Stock: ${product.quantite_stock}`
                                  }
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {product.prix_unitaire.toLocaleString("fr-FR")} FCFA
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {products.filter(p => p.quantite_stock > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Aucun produit en stock disponible
                    </p>
                  )}
                </div>

              {/* Selected Product Display */}
              {selectedProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Produit sélectionné</h4>
                      <p className="text-sm text-blue-700">
                        {selectedProduct.nom_produit} - {selectedProduct.marque} {selectedProduct.couleur}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Prix unitaire: {selectedProduct.prix_unitaire.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.quantite_stock === 0
                          ? 'bg-red-100 text-red-800'
                          : selectedProduct.quantite_stock <= 2
                          ? 'bg-red-100 text-red-800'
                          : selectedProduct.quantite_stock <= 5
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Stock: {selectedProduct.quantite_stock}
                      </div>
                      {selectedProduct.quantite_stock <= 2 && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          ⚠ Stock critique !
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Status Message */}
              {!isFormValid && selectedProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">ℹ</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Informations requises</h4>
                      <p className="text-sm text-blue-700">
                        Veuillez remplir tous les champs obligatoires (*) pour pouvoir enregistrer la vente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Validation Errors */}
              {Object.keys(formErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✕</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">Erreurs de validation</h4>
                      <ul className="space-y-1">
                        {Object.entries(formErrors).map(([field, error]) => (
                          <li key={field} className="text-sm text-red-700">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Warnings */}
              {products.filter(p => p.quantite_stock <= 5 && p.quantite_stock > 0).length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-800 mb-2">Alerte Stock Faible</h4>
                      <div className="space-y-1">
                        {products
                          .filter(p => p.quantite_stock <= 5 && p.quantite_stock > 0)
                          .slice(0, 3)
                          .map(product => (
                            <p key={product.id} className="text-sm text-orange-700">
                              • {product.nom_produit} ({product.marque} {product.couleur}): {product.quantite_stock} restant{product.quantite_stock > 1 ? 's' : ''}
                            </p>
                          ))
                        }
                        {products.filter(p => p.quantite_stock <= 5 && p.quantite_stock > 0).length > 3 && (
                          <p className="text-sm text-orange-700 font-medium">
                            ... et {products.filter(p => p.quantite_stock <= 5 && p.quantite_stock > 0).length - 3} autres produits
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {products.filter(p => p.quantite_stock === 0).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">⚠</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">Rupture de Stock</h4>
                      <div className="space-y-1">
                        {products
                          .filter(p => p.quantite_stock === 0)
                          .slice(0, 3)
                          .map(product => (
                            <p key={product.id} className="text-sm text-red-700">
                              • {product.nom_produit} ({product.marque} {product.couleur}): Rupture de stock
                            </p>
                          ))
                        }
                        {products.filter(p => p.quantite_stock === 0).length > 3 && (
                          <p className="text-sm text-red-700 font-medium">
                            ... et {products.filter(p => p.quantite_stock === 0).length - 3} autres produits en rupture
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="nomPrenom" className="text-card-foreground">
                   Nom et Prénom Client *
                 </Label>
                 <Input
                   id="nomPrenom"
                   value={formData.nom_prenom_client}
                   onChange={(e) => {
                     setFormData({ ...formData, nom_prenom_client: e.target.value })
                     if (formErrors.nom_prenom_client) {
                       setFormErrors(prev => ({ ...prev, nom_prenom_client: "" }))
                     }
                   }}
                   placeholder="Ex: Marie Dubois"
                   className={`bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                     formErrors.nom_prenom_client ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                   }`}
                 />
                 {formErrors.nom_prenom_client && (
                   <p className="text-sm text-red-600 mt-1">{formErrors.nom_prenom_client}</p>
                 )}
               </div>
              <div>
                <Label htmlFor="numeroTelephone" className="text-card-foreground">
                  Numéro Téléphone *
                </Label>
                <Input
                  id="numeroTelephone"
                  value={formData.numero_telephone}
                  onChange={(e) => {
                    setFormData({ ...formData, numero_telephone: e.target.value })
                    if (formErrors.numero_telephone) {
                      setFormErrors(prev => ({ ...prev, numero_telephone: "" }))
                    }
                  }}
                  placeholder="Ex: +33 6 12 34 56 78"
                  className={`bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                    formErrors.numero_telephone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {formErrors.numero_telephone && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.numero_telephone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="dateVente" className="text-card-foreground">
                  Date de Vente *
                </Label>
                <Input
                  id="dateVente"
                  type="date"
                  value={formData.date_vente}
                  onChange={(e) => {
                    setFormData({ ...formData, date_vente: e.target.value })
                    if (formErrors.date_vente) {
                      setFormErrors(prev => ({ ...prev, date_vente: "" }))
                    }
                  }}
                  className={`bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                    formErrors.date_vente ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {formErrors.date_vente && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.date_vente}</p>
                )}
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
                  Prix (FCFA) *
                </Label>
                <Input
                  id="prix"
                  type="number"
                  value={formData.prix}
                  onChange={(e) => {
                    setFormData({ ...formData, prix: e.target.value })
                    if (formErrors.prix) {
                      setFormErrors(prev => ({ ...prev, prix: "" }))
                    }
                  }}
                  placeholder="Ex: 1299000"
                  className={`bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                    formErrors.prix ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {formErrors.prix && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.prix}</p>
                )}
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
                    type="submit"
                    disabled={!isFormValid}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? "Sauvegarder" : "Ajouter"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="border-border bg-transparent">
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </form>
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