"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Save, X, Edit, Trash2, Smartphone, Phone, Calendar, Package, ShoppingCart, Calculator, CheckCircle, Eye, Printer, Clock, RefreshCw } from "lucide-react"

interface Sale {
  id: string
  nom_prenom_client: string
  numero_telephone: string
  date_vente: string
  nom_produit?: string
  modele: string
  marque: string
  imei_telephone: string
  prix: number
  created_at?: string
  invoice?: {
    invoice_number: string
    status: string
    payment_status: string
  }
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
  paymentStatusFilter: string
  setPaymentStatusFilter: (status: string) => void
  handleDeleteSale: (id: string) => void
  handleBulkDeleteSales?: (ids: string[]) => void
  products?: Product[]
  onRefresh?: () => void
}

const PHONE_BRANDS = [
  "Apple", "Samsung", "Huawei", "Xiaomi", "Oppo", "Vivo", "OnePlus", "Google",
  "Sony", "LG", "Nokia", "Motorola", "Asus", "Realme", "Infinix", "Tecno", "Itel", "Autre"
]

export const SalesView = function SalesView({
  ventes,
  filteredVentes,
  searchTerm,
  setSearchTerm,
  paymentStatusFilter,
  setPaymentStatusFilter,
  handleDeleteSale,
  handleBulkDeleteSales,
  products = [],
  onRefresh
}: SalesViewProps) {
  // Component for displaying and managing sales with filtering and bulk operations

  const [selectedSales, setSelectedSales] = React.useState<string[]>([])

  const handleSelectSale = (saleId: string, checked: boolean) => {
    if (checked) {
      setSelectedSales(prev => [...prev, saleId])
    } else {
      setSelectedSales(prev => prev.filter(id => id !== saleId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSales(filteredVentes.map(vente => vente.id))
    } else {
      setSelectedSales([])
    }
  }

  const handleBulkDelete = () => {
    if (handleBulkDeleteSales && selectedSales.length > 0) {
      handleBulkDeleteSales(selectedSales)
      setSelectedSales([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-green-500/10 rounded-3xl p-8 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent mb-1">
                  Gestion des Ventes
                </h1>
                <p className="text-emerald-700 dark:text-emerald-300 text-lg">Enregistrez et suivez vos transactions commerciales</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 shadow-sm">
                <div className="text-2xl font-bold text-emerald-800">{ventes.length}</div>
                <div className="text-emerald-600 text-sm">Total Ventes</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 shadow-sm">
                <div className="text-2xl font-bold text-emerald-800">
                  {ventes.reduce((sum, vente) => sum + vente.prix, 0).toLocaleString("fr-FR")}
                </div>
                <div className="text-emerald-600 text-sm">Chiffre d'Affaires</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 shadow-sm">
                <div className="text-2xl font-bold text-emerald-800">
                  {ventes.filter(v => v.invoice?.payment_status === 'paid').length}
                </div>
                <div className="text-emerald-600 text-sm">Ventes Payées</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
            {selectedSales.length > 0 && handleBulkDeleteSales && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-medium"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Supprimer ({selectedSales.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer {selectedSales.length} vente(s) sélectionnée(s) ?
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button onClick={handleBulkDelete} variant="destructive">
                        Supprimer
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20 px-6 py-4 rounded-xl font-medium"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Actualiser
              </Button>
            )}
            <Button
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/20 px-6 py-4 rounded-xl font-medium"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Rapports
            </Button>
          </div>
        </div>
      </div>


      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Rechercher par nom du client, modèle ou marque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base rounded-xl"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-3">
            {/* Select All Checkbox */}
            {handleBulkDeleteSales && (
              <div className="flex items-center gap-2 h-12 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 rounded-xl">
                <Checkbox
                  checked={selectedSales.length === filteredVentes.length && filteredVentes.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <span className="text-sm font-medium">
                  Tout sélectionner ({selectedSales.length}/{filteredVentes.length})
                </span>
              </div>
            )}
            <Button
              variant={paymentStatusFilter === "paid" ? "default" : "outline"}
              size="sm"
              className={`h-12 px-6 rounded-xl font-medium ${
                paymentStatusFilter === "paid"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-300 dark:border-green-700"
              }`}
              onClick={() => {
                if (setPaymentStatusFilter) {
                  setPaymentStatusFilter(paymentStatusFilter === "paid" ? "all" : "paid")
                }
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Payées ({ventes.filter(v => v.invoice?.payment_status === 'paid').length})
            </Button>
            <Button
              variant={paymentStatusFilter === "unpaid" ? "default" : "outline"}
              size="sm"
              className={`h-12 px-6 rounded-xl font-medium ${
                paymentStatusFilter === "unpaid"
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700"
              }`}
              onClick={() => {
                if (setPaymentStatusFilter) {
                  setPaymentStatusFilter(paymentStatusFilter === "unpaid" ? "all" : "unpaid")
                }
              }}
            >
              <Clock className="w-4 h-4 mr-2" />
              Non payées ({ventes.filter(v => v.invoice?.payment_status === 'unpaid').length})
            </Button>
            <Button
              variant={paymentStatusFilter === "refunded" ? "default" : "outline"}
              size="sm"
              className={`h-12 px-6 rounded-xl font-medium ${
                paymentStatusFilter === "refunded"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-300 dark:border-red-700"
              }`}
              onClick={() => {
                if (setPaymentStatusFilter) {
                  setPaymentStatusFilter(paymentStatusFilter === "refunded" ? "all" : "refunded")
                }
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Remboursées ({ventes.filter(v => v.invoice?.payment_status === 'refunded').length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-12 px-6 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-600 rounded-xl font-medium"
              onClick={() => {
                setSearchTerm('')
                if (setPaymentStatusFilter) {
                  setPaymentStatusFilter('all')
                }
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Tout afficher ({ventes.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="grid gap-4">
        {filteredVentes.map((vente) => (
           <Card key={vente.id} className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 dark:hover:border-slate-600 group ${selectedSales.includes(vente.id) ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
             <CardContent className="p-6">
               <div className="flex items-start justify-between gap-6">
                 {/* Checkbox for selection */}
                 {handleBulkDeleteSales && (
                   <div className="flex items-center gap-2 mb-4">
                     <Checkbox
                       checked={selectedSales.includes(vente.id)}
                       onCheckedChange={(checked) => handleSelectSale(vente.id, checked as boolean)}
                       className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                     />
                     <span className="text-sm text-slate-600 dark:text-slate-400">Sélectionner</span>
                   </div>
                 )}
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Client Name and Product */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1 truncate">{vente.nom_prenom_client}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{vente.marque} {vente.modele}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          {vente.prix.toLocaleString("fr-FR")}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">FCFA</p>
                      </div>
                    </div>

                    {/* Contact and Date Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Téléphone</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{vente.numero_telephone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Date vente</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(vente.date_vente).toLocaleDateString("fr-FR")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
                      <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                          <Package className="w-3 h-3 text-purple-700 dark:text-purple-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-purple-700 dark:text-purple-300 uppercase tracking-wide font-medium">Produit</p>
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100 truncate">{vente.nom_produit || `${vente.marque} ${vente.modele}`}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">🏷️</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wide font-medium">Marque</p>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{vente.marque}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                        <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">🎨</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-indigo-700 dark:text-indigo-300 uppercase tracking-wide font-medium">Couleur</p>
                          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{vente.modele}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-green-700 dark:text-green-300">#</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-green-700 dark:text-green-300 uppercase tracking-wide font-medium">Quantité</p>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">1 unité</p>
                        </div>
                      </div>

                      {vente.imei_telephone && (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50 sm:col-span-4">
                          <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">SN</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide font-medium">Numéro de Série (IMEI)</p>
                            <p className="text-sm font-mono font-medium text-amber-900 dark:text-amber-100">{vente.imei_telephone}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Invoice Information - Enhanced Design */}
                    {vente.invoice && (
                      <div className="mt-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800/50 dark:via-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
                        <div className="p-4">
                          {/* Header with Invoice Number and Status */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white text-lg font-bold">📄</span>
                              </div>
                              <div>
                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  Facture #{vente.invoice.invoice_number}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(vente.created_at || vente.date_vente).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 shadow-sm ${
                              vente.invoice.payment_status === 'paid'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-300 dark:border-green-700'
                                : vente.invoice.payment_status === 'unpaid'
                                ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300 dark:from-orange-900/40 dark:to-amber-900/40 dark:text-orange-300 dark:border-orange-700'
                                : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-300 dark:from-slate-900/40 dark:to-gray-900/40 dark:text-slate-300 dark:border-slate-700'
                            }`}>
                              {vente.invoice.payment_status === 'paid' ? '✓ Payée' :
                               vente.invoice.payment_status === 'unpaid' ? '⏳ En attente' :
                               '↩ Remboursée'}
                            </div>
                          </div>

                          {/* Invoice Details Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Montant</span>
                              </div>
                              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {vente.prix.toLocaleString("fr-FR")} <span className="text-sm font-normal text-slate-600 dark:text-slate-400">FCFA</span>
                              </p>
                            </div>

                            <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Statut</span>
                              </div>
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                                {vente.invoice.status === 'draft' ? 'Brouillon' :
                                 vente.invoice.status === 'sent' ? 'Envoyée' :
                                 vente.invoice.status === 'paid' ? 'Payée' :
                                 vente.invoice.status === 'overdue' ? 'En retard' :
                                 'Annulée'}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-600/50">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-slate-600 dark:text-slate-400">Facture active</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // TODO: Navigate to invoice details
                                  console.log('View invoice details:', vente.invoice?.invoice_number)
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Détails
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // TODO: Print invoice
                                  console.log('Print invoice:', vente.invoice?.invoice_number)
                                }}
                              >
                                <Printer className="w-3 h-3 mr-1" />
                                Imprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    <div className={`w-3 h-3 rounded-full ${
                      vente.invoice?.payment_status === 'paid' ? 'bg-green-500 animate-pulse' :
                      vente.invoice?.payment_status === 'unpaid' ? 'bg-orange-500' :
                      vente.invoice?.payment_status === 'refunded' ? 'bg-red-500' :
                      'bg-slate-400'
                    }`}></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {vente.invoice?.payment_status === 'paid' ? 'Payé' :
                       vente.invoice?.payment_status === 'unpaid' ? 'Non payé' :
                       vente.invoice?.payment_status === 'refunded' ? 'Remboursé' :
                       'Statut inconnu'}
                    </span>
                  </div>
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
}