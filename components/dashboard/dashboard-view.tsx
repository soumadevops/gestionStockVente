"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, ShoppingCart, DollarSign, Package, AlertTriangle, BarChart3, CheckCircle, Clock, RefreshCw, Filter } from "lucide-react"
import type { Sale, Product, CompanySettings } from "@/lib/types"

interface DashboardViewProps {
  totalVentes: number
  totalRevenue: number
  totalStock: number
  lowStockProducts: number
  ventes: Sale[]
  products: Product[]
  companySettings: CompanySettings
  salesFilter?: string
  onSalesFilterChange?: (filter: string) => void
}

export const DashboardView = React.memo(function DashboardView({
  totalVentes,
  totalRevenue,
  totalStock,
  lowStockProducts,
  ventes,
  products,
  companySettings,
  salesFilter = "all",
  onSalesFilterChange
}: DashboardViewProps) {
  // Filter sales based on payment status
  const filteredVentes = ventes.filter((vente) => {
    if (salesFilter === "all") return true
    if (salesFilter === "paid") return vente.invoice?.payment_status === "paid"
    if (salesFilter === "unpaid") return vente.invoice?.payment_status === "unpaid"
    if (salesFilter === "refunded") return vente.invoice?.payment_status === "refunded"
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "unpaid":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "refunded":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-3 h-3" />
      case "unpaid":
        return <Clock className="w-3 h-3" />
      case "refunded":
        return <RefreshCw className="w-3 h-3" />
      default:
        return <BarChart3 className="w-3 h-3" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée"
      case "unpaid":
        return "Non payée"
      case "refunded":
        return "Remboursée"
      default:
        return "Brouillon"
    }
  }
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-pink-600/10 rounded-3xl p-8 border border-indigo-200/50 dark:border-indigo-800/50 shadow-lg backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Tableau de Bord
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">Aperçu de vos performances de vente et gestion de stock</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-600/70 group-hover:text-blue-700">Total Ventes</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{totalVentes}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ml-3">
                <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-600/70 group-hover:text-green-700">Chiffre d'Affaires</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">{totalRevenue.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-green-600/60 font-medium">FCFA</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ml-3">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-600/70 group-hover:text-purple-700">Stock Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1">{totalStock}</p>
                <p className="text-xs text-purple-600/60 font-medium">articles</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ml-3">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-600/70 group-hover:text-orange-700">Stock Faible</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-900 mt-1">{lowStockProducts}</p>
                <p className="text-xs text-orange-600/60 font-medium">à réapprovisionner</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ml-3">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales with Invoice Details */}
        <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Ventes & Factures Récentes
              </CardTitle>
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={salesFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSalesFilterChange?.("all")}
                  className={`text-xs px-3 py-1 h-8 ${
                    salesFilter === "all"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Toutes ({ventes.length})
                </Button>
                <Button
                  variant={salesFilter === "paid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSalesFilterChange?.("paid")}
                  className={`text-xs px-3 py-1 h-8 ${
                    salesFilter === "paid"
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Payées ({ventes.filter(v => v.invoice?.payment_status === "paid").length})
                </Button>
                <Button
                  variant={salesFilter === "unpaid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSalesFilterChange?.("unpaid")}
                  className={`text-xs px-3 py-1 h-8 ${
                    salesFilter === "unpaid"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "border-orange-200 text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Non payées ({ventes.filter(v => v.invoice?.payment_status === "unpaid").length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredVentes.slice(0, 8).map((vente, index) => (
                <div key={vente.id} className="bg-white rounded-xl border border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01] overflow-hidden">
                  {/* Header with Client and Status */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{vente.nom_prenom_client}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(vente.date_vente).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                      vente.invoice ? getStatusColor(vente.invoice.payment_status) : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>
                      {vente.invoice ? getStatusIcon(vente.invoice.payment_status) : <BarChart3 className="w-3 h-3" />}
                      {vente.invoice ? getStatusText(vente.invoice.payment_status) : "Sans facture"}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Produit</p>
                        <p className="text-sm font-medium text-gray-800">{vente.nom_produit || `${vente.marque} ${vente.modele}`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Détails</p>
                        <p className="text-sm text-gray-600">{vente.marque} • {vente.modele} • {vente.imei_telephone}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Quantité</p>
                          <p className="text-sm font-semibold text-blue-600">1 unité</p>
                        </div>
                        {vente.invoice && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">N° Facture</p>
                            <p className="text-sm font-mono text-purple-600">{vente.invoice.invoice_number}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Montant</p>
                        <p className="text-lg font-bold text-green-600">{vente.prix.toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredVentes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {salesFilter === "all" ? "Aucune vente récente" : `Aucune vente ${getStatusText(salesFilter).toLowerCase()}`}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {salesFilter === "all" ? "Les ventes apparaîtront ici" : "Essayez un autre filtre"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              Alertes Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products
                .filter((product) => product.quantite_stock <= 5)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-orange-50/30 rounded-xl border border-orange-100/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                            product.quantite_stock === 0
                              ? "bg-gradient-to-br from-red-500 to-red-600"
                              : "bg-gradient-to-br from-orange-500 to-orange-600"
                          }`}
                        >
                          {product.quantite_stock === 0 ? (
                            <AlertTriangle className="w-6 h-6 text-white" />
                          ) : (
                            <Package className="w-6 h-6 text-white" />
                          )}
                        </div>
                        {product.quantite_stock === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{product.nom_produit}</p>
                        <p className="text-sm text-gray-600">
                          {product.marque} {product.couleur}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          product.quantite_stock === 0 ? "text-red-600" : "text-orange-600"
                        }`}
                      >
                        {product.quantite_stock === 0 ? "Rupture" : `${product.quantite_stock} restant`}
                      </p>
                    </div>
                  </div>
                ))}
              {products.filter((product) => product.quantite_stock <= 5).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md mx-auto mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-medium">Stock optimal !</p>
                  <p className="text-sm text-gray-400">Aucune alerte de stock</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})