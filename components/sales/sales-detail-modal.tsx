"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Smartphone, Phone, Calendar, Package, ShoppingCart, DollarSign, CheckCircle, Clock, X, Printer, User, MapPin, FileText } from "lucide-react"

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

interface SalesDetailModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
  onPrint?: (sale: Sale) => void
}

export function SalesDetailModal({ isOpen, onClose, sale, onPrint }: SalesDetailModalProps) {
  if (!sale) return null

  const handlePrint = () => {
    if (onPrint) {
      onPrint(sale)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Détails de la Vente
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {sale.nom_prenom_client}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Vente du {new Date(sale.date_vente).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg px-4 py-2 text-white mb-2">
                  <p className="text-2xl font-bold">
                    {sale.prix.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs opacity-90">FCFA</p>
                </div>
                <Badge
                  variant={
                    sale.invoice?.payment_status === 'paid' ? 'default' :
                    sale.invoice?.payment_status === 'unpaid' ? 'secondary' :
                    'outline'
                  }
                  className={
                    sale.invoice?.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : sale.invoice?.payment_status === 'unpaid'
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }
                >
                  {sale.invoice?.payment_status === 'paid' ? 'Payée' :
                   sale.invoice?.payment_status === 'unpaid' ? 'En attente' :
                   'Statut inconnu'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations Client
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nom du Client</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{sale.nom_prenom_client}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Téléphone</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{sale.numero_telephone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Informations Produit
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Produit</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{sale.nom_produit || `${sale.marque} ${sale.modele}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                    <span className="text-sm">🏷️</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Marque</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{sale.marque}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
                    <span className="text-sm">🎨</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Modèle/Couleur</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{sale.modele}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                    <span className="text-sm">#</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quantité</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">1 unité</p>
                  </div>
                </div>
              </div>
            </div>

            {sale.imei_telephone && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">SN</span>
                </div>
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 uppercase tracking-wide font-medium">Numéro de Série (IMEI)</p>
                  <p className="font-mono font-medium text-amber-900 dark:text-amber-100">{sale.imei_telephone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Information */}
          {sale.invoice && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informations Facture
                </h4>
                <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800/50 dark:via-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white text-lg font-bold">📄</span>
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                          Facture #{sale.invoice.invoice_number}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Créée le {new Date(sale.created_at || sale.date_vente).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        sale.invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : sale.invoice.status === 'sent'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }
                    >
                      {sale.invoice.status === 'draft' ? 'Brouillon' :
                       sale.invoice.status === 'sent' ? 'Envoyée' :
                       sale.invoice.status === 'paid' ? 'Payée' :
                       sale.invoice.status === 'overdue' ? 'En retard' :
                       'Annulée'}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Sale Metadata */}
          <Separator />
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>ID de la vente: <span className="font-mono">{sale.id}</span></p>
            <p>Créée le: {new Date(sale.created_at || sale.date_vente).toLocaleString("fr-FR")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}