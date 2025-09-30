"use client"

import React, { useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Printer, FileText, Eye, Save, Copy, Calculator, AlertTriangle, CheckCircle, Clock, Users, Package, DollarSign, Calendar, FileCheck, Search, Edit, ArrowLeft } from "lucide-react"

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  client_email?: string
  client_phone?: string
  client_address?: string
  invoice_date: string
  due_date?: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  status: "draft" | "sent" | "paid" | "overdue" | "unpaid" | "refunded"
  payment_status: "unpaid" | "paid" | "refunded"
  notes?: string
  created_at: string
  updated_at: string
}

interface InvoiceItemForm {
     product_name: string
     imei?: string
     marque?: string
     modele?: string
     provenance?: string
     quantity: number
     unit_price: number
     units?: Array<{
       color: string
       imei: string
     }>
  }

interface Product {
   id: string
   nom_produit: string
   marque: string
   couleur: string
   prix_unitaire: number
   quantite_stock: number
   description?: string
   imei_telephone?: string
   provenance?: string
 }

interface InvoicesViewProps {
      invoices: Invoice[]
      showAddInvoiceForm: boolean
      setShowAddInvoiceForm: (show: boolean) => void
      editingInvoiceId: string | null
      onEditInvoice: (invoiceId: string) => void
      invoiceFormData: any
      handleInvoiceFormChange: (field: string, value: string) => void
      invoiceItems: InvoiceItemForm[]
      handleInvoiceItemChange: (index: number, field: string, value: any) => void
      handleInvoiceItemUnitChange?: (itemIndex: number, unitIndex: number, field: string, value: string) => void
      addInvoiceItem: () => void
      removeInvoiceItem: (index: number) => void
      handleAddInvoice: () => Promise<void>
      resetInvoiceForm: () => void
      printInvoice: (invoice: Invoice) => void
      handleDeleteInvoice: (id: string) => Promise<void>
      handleBulkDeleteInvoices?: (ids: string[]) => Promise<void>
      isSubmitting?: boolean
      products?: Product[]
      onProductSelect?: (index: number, product: Product) => void
      invoiceSearchTerm: string
      setInvoiceSearchTerm: (term: string) => void
      invoiceStatusFilter: string
      setInvoiceStatusFilter: (status: string) => void
    }

export const InvoicesView = function InvoicesView({
     invoices,
     showAddInvoiceForm,
     setShowAddInvoiceForm,
     editingInvoiceId,
     onEditInvoice,
     invoiceFormData,
     handleInvoiceFormChange,
     invoiceItems,
     handleInvoiceItemChange,
     handleInvoiceItemUnitChange,
     addInvoiceItem,
     removeInvoiceItem,
     handleAddInvoice,
     resetInvoiceForm,
     printInvoice,
     handleDeleteInvoice,
     handleBulkDeleteInvoices,
     isSubmitting = false,
     products = [],
     onProductSelect,
     invoiceSearchTerm,
     setInvoiceSearchTerm,
     invoiceStatusFilter,
     setInvoiceStatusFilter
   }: InvoicesViewProps) {
   // State for bulk selection
   const [selectedInvoices, setSelectedInvoices] = React.useState<string[]>([])

   const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
     if (checked) {
       setSelectedInvoices(prev => [...prev, invoiceId])
     } else {
       setSelectedInvoices(prev => prev.filter(id => id !== invoiceId))
     }
   }

   const handleSelectAllInvoices = (checked: boolean) => {
     if (checked) {
       setSelectedInvoices(invoices.map(invoice => invoice.id))
     } else {
       setSelectedInvoices([])
     }
   }

   const handleBulkDelete = async () => {
     if (handleBulkDeleteInvoices && selectedInvoices.length > 0) {
       await handleBulkDeleteInvoices(selectedInvoices)
       setSelectedInvoices([])
     }
   }

   // Auto-save functionality
   const autoSaveKey = `invoice_draft_${editingInvoiceId || 'new'}`

  const saveDraft = useCallback(() => {
    if (showAddInvoiceForm && (invoiceFormData.client_name || invoiceItems.length > 0)) {
      const draftData = {
        invoiceFormData,
        invoiceItems,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(autoSaveKey, JSON.stringify(draftData))
    }
  }, [showAddInvoiceForm, invoiceFormData, invoiceItems, autoSaveKey])

  const loadDraft = useCallback(() => {
    const saved = localStorage.getItem(autoSaveKey)
    if (saved) {
      try {
        const draftData = JSON.parse(saved)
        // Note: In a real implementation, you would call the parent handlers to update the state
        console.log('Draft loaded:', draftData)
        return draftData
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
    return null
  }, [autoSaveKey])

  // Auto-save every 30 seconds when form is open
  useEffect(() => {
    if (!showAddInvoiceForm) return

    const interval = setInterval(saveDraft, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [showAddInvoiceForm, saveDraft])

  // IMEI validation
  const validateIMEIUniqueness = (items: InvoiceItemForm[], currentIndex: number, imei: string): boolean => {
    if (!imei.trim()) return true // Empty IMEI is allowed

    // Collect all IMEIs from all items and their units
    const allIMEIs: string[] = []

    items.forEach((item, index) => {
      // Add main item IMEI if it exists
      if (item.imei?.trim()) {
        allIMEIs.push(item.imei.trim())
      }

      // Add unit IMEIs if they exist
      if (item.units) {
        item.units.forEach(unit => {
          if (unit.imei?.trim()) {
            allIMEIs.push(unit.imei.trim())
          }
        })
      }
    })

    // Count occurrences of this IMEI
    const imeiCount = allIMEIs.filter(existingIMEI => existingIMEI === imei.trim()).length

    // Allow if this is the only occurrence
    return imeiCount <= 1
  }

  // Save on form changes
  useEffect(() => {
    if (showAddInvoiceForm) {
      const timeout = setTimeout(saveDraft, 2000) // 2 seconds after last change
      return () => clearTimeout(timeout)
    }
  }, [invoiceFormData, invoiceItems, showAddInvoiceForm, saveDraft])

  return (
    <div className="space-y-8">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  Gestion des Factures
                </h1>
                <p className="text-blue-100 text-lg">Créez, modifiez et imprimez vos factures professionnellement</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{invoices.length}</div>
                <div className="text-blue-100 text-sm">Total Factures</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{invoices.filter(inv => inv.payment_status === "paid").length}</div>
                <div className="text-blue-100 text-sm">Payées</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{invoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString("fr-FR")}</div>
                <div className="text-blue-100 text-sm">Montant Total</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
            {selectedInvoices.length > 0 && handleBulkDeleteInvoices && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-4 rounded-xl font-semibold text-lg"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Supprimer ({selectedInvoices.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer {selectedInvoices.length} facture(s) sélectionnée(s) ?
                      Cette action est irréversible et supprimera également les articles associés.
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
            <Button
              onClick={() => setShowAddInvoiceForm(true)}
              className="bg-white text-indigo-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-4 rounded-xl font-semibold text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Facture
            </Button>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl font-medium"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Rapports
            </Button>
          </div>
        </div>
      </div>

      {showAddInvoiceForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Form */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddInvoiceForm(false)
                        resetInvoiceForm()
                      }}
                      className="mr-2 px-3 py-2 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-500"
                      title="Retour à la liste des factures"
                    >
                      <ArrowLeft className="w-4 h-4 text-green-700 dark:text-green-400 mr-1" />
                      Retour
                    </Button>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {editingInvoiceId ? "Modifier la Facture" : "Créer une Nouvelle Facture"}
                    </CardTitle>
                    {(() => {
                      const draft = loadDraft()
                      return draft ? (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          Brouillon sauvegardé
                        </div>
                      ) : null
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveDraft}
                      disabled={isSubmitting}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Dupliquer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAddInvoice()
                  }}
                  className="space-y-6"
                >
                  {/* Client Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-primary" />
                      <h3 className="font-medium text-foreground">Informations Client</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client_name" className="text-foreground flex items-center gap-1">
                          Nom du Client *
                          {!invoiceFormData.client_name && (
                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                          )}
                        </Label>
                        <Input
                          id="client_name"
                          value={invoiceFormData.client_name}
                          onChange={(e) => handleInvoiceFormChange("client_name", e.target.value)}
                          placeholder="Ex: Société ABC"
                          className={`bg-background border-border text-foreground ${
                            !invoiceFormData.client_name ? 'border-orange-300' : ''
                          }`}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client_email" className="text-foreground">
                          Email
                        </Label>
                        <Input
                          id="client_email"
                          type="email"
                          value={invoiceFormData.client_email}
                          onChange={(e) => handleInvoiceFormChange("client_email", e.target.value)}
                          placeholder="contact@client.com"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client_phone" className="text-foreground">
                          Téléphone
                        </Label>
                        <Input
                          id="client_phone"
                          value={invoiceFormData.client_phone}
                          onChange={(e) => handleInvoiceFormChange("client_phone", e.target.value)}
                          placeholder="+221 77 123 45 67"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="due_date" className="text-foreground flex items-center gap-1">
                          Date d'échéance
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                        </Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={invoiceFormData.due_date}
                          onChange={(e) => handleInvoiceFormChange("due_date", e.target.value)}
                          className="bg-background border-border text-foreground"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client_address" className="text-foreground">
                        Adresse
                      </Label>
                      <Textarea
                        id="client_address"
                        value={invoiceFormData.client_address}
                        onChange={(e) => handleInvoiceFormChange("client_address", e.target.value)}
                        placeholder="Adresse complète du client..."
                        className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Invoice Items Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-foreground">Articles & Services</h3>
                        {invoiceItems.length === 0 && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={addInvoiceItem}
                        variant="outline"
                        size="sm"
                        className="bg-primary/5 hover:bg-primary/10 border-primary/20"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un Article
                      </Button>
                    </div>

                    {invoiceItems.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Aucun article ajouté</p>
                        <Button
                          type="button"
                          onClick={addInvoiceItem}
                          variant="outline"
                          className="bg-primary/5 hover:bg-primary/10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter le Premier Article
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invoiceItems.map((item, index) => (
                          <div key={index} className="p-4 border border-border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                            {/* Product Selection */}
                            <div className="mb-3">
                              <Label className="text-xs text-muted-foreground mb-1 block">
                                Sélectionner un produit du stock
                              </Label>
                              <Select
                                value=""
                                onValueChange={(productId) => {
                                  const selectedProduct = products.find(p => p.id === productId)
                                  if (selectedProduct && onProductSelect) {
                                    onProductSelect(index, selectedProduct)
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-background border-border text-foreground text-sm">
                                  <SelectValue placeholder="Choisir un produit du stock..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.filter(p => p.quantite_stock > 0).map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.nom_produit} - {product.marque} {product.couleur} (Stock: {product.quantite_stock})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Produit/Service *
                                </Label>
                                <Input
                                  placeholder="Nom du produit"
                                  value={item.product_name}
                                  onChange={(e) => handleInvoiceItemChange(index, "product_name", e.target.value)}
                                  className={`bg-background border-border text-foreground text-sm ${
                                    !item.product_name ? 'border-orange-300' : ''
                                  }`}
                                  required
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Marque
                                </Label>
                                <Input
                                  placeholder="Marque"
                                  value={item.marque || ""}
                                  onChange={(e) => handleInvoiceItemChange(index, "marque", e.target.value)}
                                  className="bg-background border-border text-foreground text-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Couleur
                                </Label>
                                <Input
                                  placeholder="Couleur"
                                  value={item.modele || ""}
                                  onChange={(e) => handleInvoiceItemChange(index, "modele", e.target.value)}
                                  className="bg-background border-border text-foreground text-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  IMEI
                                </Label>
                                <Input
                                  placeholder="IMEI"
                                  value={item.imei || ""}
                                  onChange={(e) => {
                                    const newIMEI = e.target.value
                                    handleInvoiceItemChange(index, "imei", newIMEI)
                                  }}
                                  className={`bg-background border-border text-foreground text-sm ${
                                    item.imei && !validateIMEIUniqueness(invoiceItems, index, item.imei)
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                      : ''
                                  }`}
                                />
                                {item.imei && !validateIMEIUniqueness(invoiceItems, index, item.imei) && (
                                  <p className="text-xs text-red-600 mt-1">IMEI déjà utilisé dans cette facture</p>
                                )}
                              </div>
                              <div className="md:col-span-1">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Quantité *
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQuantity = Math.max(1, Number.parseInt(e.target.value) || 1)
                                    handleInvoiceItemChange(index, "quantity", newQuantity)
                                    // Initialize units array if quantity >= 2
                                    if (newQuantity >= 2 && (!item.units || item.units.length !== newQuantity)) {
                                      const units = Array.from({ length: newQuantity }, (_, i) => ({
                                        color: item.modele || "",
                                        imei: ""
                                      }))
                                      handleInvoiceItemChange(index, "units", units)
                                    } else if (newQuantity < 2) {
                                      handleInvoiceItemChange(index, "units", undefined)
                                    }
                                  }}
                                  className="bg-background border-border text-foreground text-sm"
                                  min="1"
                                  required
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Prix Unit. (FCFA) *
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    handleInvoiceItemChange(index, "unit_price", Math.max(0, Number.parseFloat(e.target.value) || 0))
                                  }
                                  className="bg-background border-border text-foreground text-sm"
                                  min="0"
                                  required
                                />
                              </div>
                              <div className="md:col-span-1">
                                <div className="flex items-center justify-between h-9">
                                  <div className="text-sm font-medium text-primary">
                                    {(item.quantity * item.unit_price).toLocaleString("fr-FR")}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3">
                              <div className="md:col-span-6">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Provenance
                                </Label>
                                <Input
                                  placeholder="Provenance"
                                  value={item.provenance || ""}
                                  onChange={(e) => handleInvoiceItemChange(index, "provenance", e.target.value)}
                                  className="bg-background border-border text-foreground text-sm"
                                />
                              </div>
                              <div className="md:col-span-5">
                                <div className="flex items-center justify-end h-9">
                                  {invoiceItems.length > 1 && (
                                    <Button
                                      type="button"
                                      onClick={() => removeInvoiceItem(index)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Unit Details Section - Only show when quantity >= 2 */}
                            {item.quantity >= 2 && item.units && (
                              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Package className="w-4 h-4 text-blue-600" />
                                  <h4 className="font-medium text-blue-800 text-sm">Détails des unités individuelles</h4>
                                </div>
                                <div className="space-y-3">
                                  {item.units.map((unit, unitIndex) => (
                                    <div key={unitIndex} className="p-3 bg-white border border-blue-100 rounded-md">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                          <span className="text-xs font-bold text-blue-600">{unitIndex + 1}</span>
                                        </div>
                                        <span className="text-sm font-medium text-blue-800">Unité {unitIndex + 1}</span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <Label className="text-xs text-blue-700 mb-1 block">
                                            Couleur *
                                          </Label>
                                          <Input
                                            placeholder="Couleur de l'unité"
                                            value={unit.color}
                                            onChange={(e) => handleInvoiceItemUnitChange?.(index, unitIndex, "color", e.target.value)}
                                            className="bg-white border-blue-200 text-foreground text-sm"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs text-blue-700 mb-1 block">
                                            IMEI *
                                          </Label>
                                          <Input
                                            placeholder="IMEI de l'unité"
                                            value={unit.imei}
                                            onChange={(e) => handleInvoiceItemUnitChange?.(index, unitIndex, "imei", e.target.value)}
                                            className={`bg-white border-blue-200 text-foreground text-sm ${
                                              unit.imei && !validateIMEIUniqueness(invoiceItems, index, unit.imei)
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                : ''
                                            }`}
                                            required
                                          />
                                          {unit.imei && !validateIMEIUniqueness(invoiceItems, index, unit.imei) && (
                                            <p className="text-xs text-red-600 mt-1">IMEI déjà utilisé dans cette facture</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 text-xs text-blue-600">
                                  <strong>Note:</strong> Chaque IMEI doit être unique pour cette facture.
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tax and Notes Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-foreground">Configuration TVA</h3>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax_rate" className="text-foreground">
                          Taux de TVA (%)
                        </Label>
                        <Input
                          id="tax_rate"
                          type="number"
                          step="0.01"
                          value={invoiceFormData.tax_rate}
                          onChange={(e) => handleInvoiceFormChange("tax_rate", e.target.value)}
                          placeholder="18.00"
                          className="bg-background border-border text-foreground"
                          min="0"
                          max="100"
                        />
                      </div>
 
                      <div className="space-y-2">
                        <Label htmlFor="payment_status" className="text-foreground">
                          Statut de Paiement
                        </Label>
                        <Select
                          value={invoiceFormData.payment_status}
                          onValueChange={(value) => handleInvoiceFormChange("payment_status", value)}
                        >
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue placeholder="Sélectionnez le statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Non payée</SelectItem>
                            <SelectItem value="paid">Payée</SelectItem>
                            <SelectItem value="refunded">Remboursée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-foreground">Notes & Commentaires</h3>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-foreground">
                          Notes (optionnel)
                        </Label>
                        <Textarea
                          id="notes"
                          value={invoiceFormData.notes}
                          onChange={(e) => handleInvoiceFormChange("notes", e.target.value)}
                          placeholder="Conditions de paiement, remarques..."
                          className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                    <Button
                      type="submit"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {editingInvoiceId ? "Modifier" : "Créer"} la Facture
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddInvoiceForm(false)
                        resetInvoiceForm()
                      }}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border shadow-sm sticky top-6">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Aperçu Facture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invoice Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sous-total</span>
                    <span className="font-medium">
                      {invoiceItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      TVA ({invoiceFormData.tax_rate || 0}%)
                    </span>
                    <span className="font-medium">
                      {(() => {
                        const subtotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
                        const taxRate = Number.parseFloat(invoiceFormData.tax_rate) / 100
                        return (subtotal * taxRate).toLocaleString("fr-FR")
                      })()} FCFA
                    </span>
                  </div>

                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-bold text-lg text-primary">
                        {(() => {
                          const subtotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
                          const taxRate = Number.parseFloat(invoiceFormData.tax_rate) / 100
                          const total = subtotal + (subtotal * taxRate)
                          return total.toLocaleString("fr-FR")
                        })()} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {invoiceFormData.client_name ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="text-sm">Client</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {invoiceItems.length > 0 && invoiceItems[0].product_name ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="text-sm">Articles</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {invoiceFormData.due_date ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm">Échéance</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu Complet
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Envoyer par Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Invoice List Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-6 h-6 text-indigo-600" />
                Liste des Factures
              </h2>
              <p className="text-gray-600 mt-1">Gérez toutes vos factures en un seul endroit</p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Select All Checkbox */}
              {handleBulkDeleteInvoices && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg">
                  <Checkbox
                    checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                    onCheckedChange={handleSelectAllInvoices}
                    className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-sm font-medium">
                    Tout sélectionner ({selectedInvoices.length}/{invoices.length})
                  </span>
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une facture..."
                  value={invoiceSearchTerm}
                  onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full lg:w-64"
                />
              </div>
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tous les statuts</option>
                <option value="paid">Payées</option>
                <option value="unpaid">Non payées</option>
                <option value="refunded">Remboursées</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-indigo-700 font-bold text-sm uppercase tracking-wider">N° Facture</th>
                  <th className="text-left px-6 py-4 text-indigo-700 font-bold text-sm uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-4 text-indigo-700 font-bold text-sm uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-indigo-700 font-bold text-sm uppercase tracking-wider">Montant</th>
                  <th className="text-left px-6 py-4 text-indigo-700 font-bold text-sm uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-indigo-700 font-bold text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice, index) => (
                  <tr key={invoice.id} className={`hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer group ${selectedInvoices.includes(invoice.id) ? 'bg-blue-50' : ''}`} onClick={() => onEditInvoice(invoice.id)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {handleBulkDeleteInvoices && (
                          <Checkbox
                            checked={selectedInvoices.includes(invoice.id)}
                            onCheckedChange={(checked) => {
                              handleSelectInvoice(invoice.id, checked as boolean)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mr-3 border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        )}
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{invoice.invoice_number}</div>
                          <div className="text-sm text-gray-500">Cliquez pour modifier</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{invoice.client_name}</div>
                      {invoice.client_email && <div className="text-sm text-gray-500">{invoice.client_email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</div>
                      {invoice.due_date && (
                        <div className="text-sm text-gray-500">Échéance: {new Date(invoice.due_date).toLocaleDateString("fr-FR")}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">{invoice.total_amount.toLocaleString("fr-FR")} <span className="text-sm font-normal text-gray-500">FCFA</span></div>
                      <div className="text-sm text-gray-500">TVA: {invoice.tax_amount.toLocaleString("fr-FR")} FCFA</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.payment_status === "paid"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : invoice.payment_status === "unpaid"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          invoice.payment_status === "paid"
                            ? "bg-green-400"
                            : invoice.payment_status === "unpaid"
                              ? "bg-yellow-400"
                              : "bg-gray-400"
                        }`}></span>
                        {invoice.payment_status === "paid"
                          ? "Payée"
                          : invoice.payment_status === "unpaid"
                            ? "Non payée"
                            : "Remboursée"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditInvoice(invoice.id);
                          }}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                          title="Modifier la facture"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                              title="Supprimer la facture"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer la facture {invoice.invoice_number} ?
                                Cette action est irréversible et supprimera également les articles associés.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                  variant="destructive"
                                >
                                  Supprimer
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            printInvoice(invoice);
                          }}
                          className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                          title="Imprimer la facture"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-2">
            {invoices.map((invoice, index) => (
               <div key={invoice.id} className={`border border-gray-300 rounded-lg shadow-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors cursor-pointer ${selectedInvoices.includes(invoice.id) ? 'bg-blue-50 border-blue-300' : ''}`} onClick={() => onEditInvoice(invoice.id)}>
                 <div className="p-4">
                   <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-3">
                       {handleBulkDeleteInvoices && (
                         <Checkbox
                           checked={selectedInvoices.includes(invoice.id)}
                           onCheckedChange={(checked) => {
                             handleSelectInvoice(invoice.id, checked as boolean)
                           }}
                           onClick={(e) => e.stopPropagation()}
                           className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                         />
                       )}
                       <div>
                         <h3 className="font-semibold text-gray-900 text-lg">{invoice.invoice_number}</h3>
                         <p className="text-sm text-gray-600 font-medium">{invoice.client_name}</p>
                       </div>
                     </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        invoice.payment_status === "paid"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : invoice.payment_status === "unpaid"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {invoice.payment_status === "paid"
                        ? "Payée"
                        : invoice.payment_status === "unpaid"
                          ? "Non payée"
                          : "Remboursée"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-t border-gray-200 pt-3">
                    <div>
                      <p className="text-gray-500 font-medium">Date</p>
                      <p className="font-semibold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Montant</p>
                      <p className="font-bold text-lg text-green-600">{invoice.total_amount.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditInvoice(invoice.id);
                        }}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                        title="Modifier la facture"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                            title="Supprimer la facture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer la facture {invoice.invoice_number} ?
                              Cette action est irréversible et supprimera également les articles associés.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                variant="destructive"
                              >
                                Supprimer
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          printInvoice(invoice);
                        }}
                        className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                        title="Imprimer la facture"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune facture trouvée. Créez votre première facture !
            </div>
          )}
        </div>
      </div>
    </div>
  )
}