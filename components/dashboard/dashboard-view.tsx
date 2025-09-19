"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, ShoppingCart, DollarSign, Package, AlertTriangle, BarChart3 } from "lucide-react"

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
  modele: string
  prix_unitaire: number
  quantite_stock: number
  description?: string
  photo_url?: string
  imei_telephone?: string
  provenance?: string
  created_at?: string
}

interface CompanySettings {
  companyName: string
  adminName: string
  logoUrl: string
}

interface DashboardViewProps {
  totalVentes: number
  totalRevenue: number
  totalStock: number
  lowStockProducts: number
  ventes: Sale[]
  products: Product[]
  companySettings: CompanySettings
}

export const DashboardView = React.memo(function DashboardView({
  totalVentes,
  totalRevenue,
  totalStock,
  lowStockProducts,
  ventes,
  products,
  companySettings
}: DashboardViewProps) {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3 text-white">Tableau de Bord</h1>
          <p className="text-white/90 text-lg">Aperçu de vos performances de vente et gestion de stock</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600/70 group-hover:text-blue-700">Total Ventes</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{totalVentes}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600/70 group-hover:text-green-700">Chiffre d'Affaires</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{totalRevenue.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-green-600/60 font-medium">FCFA</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600/70 group-hover:text-purple-700">Stock Total</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{totalStock}</p>
                <p className="text-xs text-purple-600/60 font-medium">articles</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600/70 group-hover:text-orange-700">Stock Faible</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{lowStockProducts}</p>
                <p className="text-xs text-orange-600/60 font-medium">à réapprovisionner</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Ventes Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ventes.slice(0, 5).map((vente, index) => (
                <div key={vente.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50/30 rounded-xl border border-blue-100/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{vente.nom_prenom_client}</p>
                      <p className="text-sm text-gray-600">
                        {vente.marque} {vente.modele}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 text-lg">{vente.prix.toLocaleString("fr-FR")} FCFA</p>
                    <p className="text-xs text-gray-500">
                      {vente.created_at ? new Date(vente.created_at).toLocaleDateString("fr-FR") : ""}
                    </p>
                  </div>
                </div>
              ))}
              {ventes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune vente récente</p>
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
                          {product.marque} {product.modele}
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