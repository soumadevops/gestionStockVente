"use client"

import React, { useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Trash2, Printer, FileText, Eye, Save, Copy, Calculator, AlertTriangle, CheckCircle, Clock, Users, Package, DollarSign, Calendar, FileCheck } from "lucide-react"

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
  status: "draft" | "sent" | "paid" | "overdue"
  notes?: string
  created_at: string
  updated_at: string
}

interface InvoiceItem {
  product_name: string
  description?: string
  quantity: number
  unit_price: number
}

interface InvoicesViewProps {
  invoices: Invoice[]
  showAddInvoiceForm: boolean
  setShowAddInvoiceForm: (show: boolean) => void
  editingInvoiceId: string | null
  invoiceFormData: any
  handleInvoiceFormChange: (field: string, value: string) => void
  invoiceItems: InvoiceItem[]
  handleInvoiceItemChange: (index: number, field: string, value: any) => void
  addInvoiceItem: () => void
  removeInvoiceItem: (index: number) => void
  handleAddInvoice: () => void
  resetInvoiceForm: () => void
  printInvoice: (invoice: Invoice) => void
  handleDeleteInvoice: (id: string) => void
  isSubmitting?: boolean
}

export const InvoicesView = React.memo(function InvoicesView({
  invoices,
  showAddInvoiceForm,
  setShowAddInvoiceForm,
  editingInvoiceId,
  invoiceFormData,
  handleInvoiceFormChange,
  invoiceItems,
  handleInvoiceItemChange,
  addInvoiceItem,
  removeInvoiceItem,
  handleAddInvoice,
  resetInvoiceForm,
  printInvoice,
  handleDeleteInvoice,
  isSubmitting = false
}: InvoicesViewProps) {
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

  // Save on form changes
  useEffect(() => {
    if (showAddInvoiceForm) {
      const timeout = setTimeout(saveDraft, 2000) // 2 seconds after last change
      return () => clearTimeout(timeout)
    }
  }, [invoiceFormData, invoiceItems, showAddInvoiceForm, saveDraft])
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-purple-500/10 rounded-3xl p-8 border border-rose-200/50 dark:border-rose-800/50 shadow-lg backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Gestion des Factures
            </h1>
            <p className="text-slate-600 dark:text-slate-300">Créez, modifiez et imprimez vos factures</p>
          </div>
          <Button
            onClick={() => setShowAddInvoiceForm(true)}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Facture
          </Button>
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
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                              <div className="md:col-span-3">
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
                              <div className="md:col-span-3">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Description
                                </Label>
                                <Input
                                  placeholder="Description optionnelle"
                                  value={item.description}
                                  onChange={(e) => handleInvoiceItemChange(index, "description", e.target.value)}
                                  className="bg-background border-border text-foreground text-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Quantité *
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  value={item.quantity}
                                  onChange={(e) => handleInvoiceItemChange(index, "quantity", Math.max(1, Number.parseInt(e.target.value) || 1))}
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
                              <div className="md:col-span-1">
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

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground">Liste des Factures</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-foreground">N° Facture</th>
                  <th className="text-left p-2 text-foreground">Client</th>
                  <th className="text-left p-2 text-foreground">Date</th>
                  <th className="text-left p-2 text-foreground">Montant</th>
                  <th className="text-left p-2 text-foreground">Statut</th>
                  <th className="text-left p-2 text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-2 text-foreground font-medium">{invoice.invoice_number}</td>
                    <td className="p-2 text-foreground">{invoice.client_name}</td>
                    <td className="p-2 text-foreground">{new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</td>
                    <td className="p-2 font-medium">{invoice.total_amount.toLocaleString("fr-FR")} FCFA</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : invoice.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invoice.status === "paid"
                          ? "Payée"
                          : invoice.status === "sent"
                            ? "Envoyée"
                            : invoice.status === "overdue"
                              ? "En retard"
                              : "Brouillon"}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => printInvoice(invoice)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          title="Imprimer la facture"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Voulez-vous vraiment supprimer la facture ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteInvoice(invoice.id)}>
                                Confirmer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{invoice.invoice_number}</h3>
                      <p className="text-sm text-gray-600">{invoice.client_name}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : invoice.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invoice.status === "paid"
                        ? "Payée"
                        : invoice.status === "sent"
                          ? "Envoyée"
                          : invoice.status === "overdue"
                            ? "En retard"
                            : "Brouillon"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Montant</p>
                      <p className="font-medium text-green-600">{invoice.total_amount.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => printInvoice(invoice)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Imprimer
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Voulez-vous vraiment supprimer la facture ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteInvoice(invoice.id)}>
                            Confirmer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune facture trouvée. Créez votre première facture !
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})