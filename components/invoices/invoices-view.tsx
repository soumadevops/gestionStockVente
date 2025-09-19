"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Trash2, Printer, FileText } from "lucide-react"

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
  handleDeleteInvoice
}: InvoicesViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-white">Gestion des Factures</h1>
            <p className="text-white">Créez, modifiez et imprimez vos factures</p>
          </div>
          <Button onClick={() => setShowAddInvoiceForm(true)} className="bg-white text-primary hover:bg-gray-100">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {showAddInvoiceForm && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">{editingInvoiceId ? "Modifier la Facture" : "Nouvelle Facture"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddInvoice()
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name" className="text-foreground">
                    Nom du Client *
                  </Label>
                  <Input
                    id="client_name"
                    value={invoiceFormData.client_name}
                    onChange={(e) => handleInvoiceFormChange("client_name", e.target.value)}
                    required
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="client_email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={invoiceFormData.client_email}
                    onChange={(e) => handleInvoiceFormChange("client_email", e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="client_phone" className="text-foreground">
                    Téléphone
                  </Label>
                  <Input
                    id="client_phone"
                    value={invoiceFormData.client_phone}
                    onChange={(e) => handleInvoiceFormChange("client_phone", e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="due_date" className="text-foreground">
                    Date d'échéance
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={invoiceFormData.due_date}
                    onChange={(e) => handleInvoiceFormChange("due_date", e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="client_address" className="text-foreground">
                  Adresse
                </Label>
                <Textarea
                  id="client_address"
                  value={invoiceFormData.client_address}
                  onChange={(e) => handleInvoiceFormChange("client_address", e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                  rows={3}
                />
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-foreground text-lg">Articles/Services</Label>
                  <Button type="button" onClick={addInvoiceItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un article
                  </Button>
                </div>

                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 p-3 border border-border rounded">
                    <Input
                      placeholder="Nom du produit/service"
                      value={item.product_name}
                      onChange={(e) => handleInvoiceItemChange(index, "product_name", e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleInvoiceItemChange(index, "description", e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                    <Input
                      type="number"
                      placeholder="Quantité"
                      value={item.quantity}
                      onChange={(e) => handleInvoiceItemChange(index, "quantity", Number.parseInt(e.target.value) || 1)}
                      className="bg-background border-border text-foreground"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Prix unitaire (FCFA)"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleInvoiceItemChange(index, "unit_price", Number.parseFloat(e.target.value) || 0)
                      }
                      className="bg-background border-border text-foreground"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">
                        {(item.quantity * item.unit_price).toLocaleString("fr-FR")} FCFA
                      </span>
                      {invoiceItems.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeInvoiceItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax_rate" className="text-foreground">
                    Taux de TVA (%)
                  </Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    value={invoiceFormData.tax_rate}
                    onChange={(e) => handleInvoiceFormChange("tax_rate", e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Total estimé</Label>
                  <div className="p-2 bg-muted rounded text-foreground">
                    {(() => {
                      const subtotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
                      const taxRate = Number.parseFloat(invoiceFormData.tax_rate) / 100
                      const taxAmount = subtotal * taxRate
                      const total = subtotal + taxAmount
                      return `${total.toLocaleString("fr-FR")} FCFA (dont ${taxAmount.toLocaleString(
                        "fr-FR",
                      )} FCFA de TVA)`
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-foreground">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={invoiceFormData.notes}
                  onChange={(e) => handleInvoiceFormChange("notes", e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {editingInvoiceId ? "Modifier" : "Créer"} la Facture
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddInvoiceForm(false)
                    resetInvoiceForm()
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground">Liste des Factures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
            {invoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune facture trouvée. Créez votre première facture !
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})