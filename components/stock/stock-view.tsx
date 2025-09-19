"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Search, Upload, Save, X, Package, TrendingUp, AlertTriangle, DollarSign, BarChart3, Filter } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"

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
  updated_at?: string
}

interface Provenance {
  id: string
  nom_provenance: string
  description?: string
  pays_origine?: string
  contact_fournisseur?: string
  email_fournisseur?: string
  telephone_fournisseur?: string
  adresse_fournisseur?: string
  created_at?: string
  updated_at?: string
}

interface StockViewProps {
  products: Product[]
  setProducts: (products: Product[]) => void
  user: any
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const PHONE_BRANDS = [
  "Apple", "Samsung", "Huawei", "Xiaomi", "Oppo", "Vivo", "OnePlus", "Google", "Sony", "LG", "Nokia", "Motorola", "Asus", "Realme", "Infinix", "Tecno", "Itel", "Autre"
]

export function StockView({ products, setProducts, user, searchTerm, setSearchTerm }: StockViewProps) {
  const { toast } = useToast()
  const supabase = createClient()

  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productFormData, setProductFormData] = useState({
    nom_produit: "",
    marque: "",
    modele: "",
    prix_unitaire: "",
    quantite_stock: "",
    description: "",
    imei_telephone: "",
    provenance: "",
  })
  const [productPhoto, setProductPhoto] = useState<File | null>(null)
  const [productPhotoPreview, setProductPhotoPreview] = useState<string | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [stockFilter, setStockFilter] = useState<string>("all") // all, in-stock, low-stock, out-of-stock
  const [brandFilter, setBrandFilter] = useState<string>("all")

  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marque.toLowerCase().includes(searchTerm.toLowerCase())

    // Stock status filter
    let matchesStock = true
    if (stockFilter === "in-stock") {
      matchesStock = product.quantite_stock > 5
    } else if (stockFilter === "low-stock") {
      matchesStock = product.quantite_stock > 0 && product.quantite_stock <= 5
    } else if (stockFilter === "out-of-stock") {
      matchesStock = product.quantite_stock === 0
    }

    // Brand filter
    const matchesBrand = brandFilter === "all" || product.marque === brandFilter

    return matchesSearch && matchesStock && matchesBrand
  })

  // Get unique brands for filter
  const uniqueBrands = Array.from(new Set(products.map(product => product.marque))).sort()

  // Calculate statistics
  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.prix_unitaire * product.quantite_stock), 0)
  const lowStockProducts = products.filter(product => product.quantite_stock <= 5 && product.quantite_stock > 0).length
  const outOfStockProducts = products.filter(product => product.quantite_stock === 0).length
  const totalStockQuantity = products.reduce((sum, product) => sum + product.quantite_stock, 0)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProductPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddProduct = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un produit",
        variant: "destructive",
      })
      return
    }

    setIsAddingProduct(true)
    try {
      // Validation des champs requis
      if (!productFormData.nom_produit.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du produit est requis",
          variant: "destructive",
        })
        return
      }

      if (!productFormData.marque.trim()) {
        toast({
          title: "Erreur",
          description: "La marque est requise",
          variant: "destructive",
        })
        return
      }

      if (!productFormData.prix_unitaire || isNaN(Number.parseFloat(productFormData.prix_unitaire)) || Number.parseFloat(productFormData.prix_unitaire) <= 0) {
        toast({
          title: "Erreur",
          description: "Le prix unitaire doit être un nombre positif",
          variant: "destructive",
        })
        return
      }

      if (!productFormData.quantite_stock || isNaN(Number.parseInt(productFormData.quantite_stock)) || Number.parseInt(productFormData.quantite_stock) < 0) {
        toast({
          title: "Erreur",
          description: "La quantité en stock doit être un nombre positif ou nul",
          variant: "destructive",
        })
        return
      }

      let photoUrl = null

      if (productPhoto) {
        try {
          const fileExt = productPhoto.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const { error: uploadError } = await supabase.storage.from("product-photos").upload(fileName, productPhoto)

          if (uploadError) {
            console.error("Error uploading photo:", uploadError)
            toast({
              title: "Avertissement",
              description: "Erreur lors du téléchargement de la photo, le produit sera ajouté sans photo",
              variant: "default",
            })
          } else {
            const {
              data: { publicUrl },
            } = supabase.storage.from("product-photos").getPublicUrl(fileName)
            photoUrl = publicUrl
          }
        } catch (photoError) {
          console.error("Photo upload failed:", photoError)
          toast({
            title: "Avertissement",
            description: "Erreur lors du téléchargement de la photo, le produit sera ajouté sans photo",
            variant: "default",
          })
        }
      }

      const productData = {
        nom_produit: productFormData.nom_produit.trim(),
        marque: productFormData.marque.trim(),
        modele: productFormData.modele.trim(),
        prix_unitaire: Number.parseFloat(productFormData.prix_unitaire),
        quantite_stock: Number.parseInt(productFormData.quantite_stock),
        description: productFormData.description.trim() || null,
        imei_telephone: productFormData.imei_telephone.trim() || null,
        provenance: productFormData.provenance.trim() || null,
        photo_url: photoUrl,
        user_id: user.id,
      }

      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select()

      if (error) {
        console.error("Database error:", error)
        throw new Error(`Erreur lors de l'ajout du produit: ${error.message}`)
      }

      if (data && data[0]) {
        setProducts([data[0], ...products])
      } else {
        throw new Error("Aucune donnée retournée après l'ajout du produit")
      }

      setProductFormData({
        nom_produit: "",
        marque: "",
        modele: "",
        prix_unitaire: "",
        quantite_stock: "",
        description: "",
        imei_telephone: "",
        provenance: "",
      })
      setProductPhoto(null)
      setProductPhotoPreview(null)
      setShowAddProductForm(false)

      toast({
        title: "Succès",
        description: "Produit ajouté avec succès!",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout du produit: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleEditProduct = (id: string) => {
    const product = products.find((p) => p.id === id)
    if (product) {
      setProductFormData({
        nom_produit: product.nom_produit,
        marque: product.marque,
        modele: product.modele,
        prix_unitaire: product.prix_unitaire.toString(),
        quantite_stock: product.quantite_stock.toString(),
        description: product.description || "",
        imei_telephone: product.imei_telephone || "",
        provenance: product.provenance || "",
      })
      setProductPhotoPreview(product.photo_url || null)
      setEditingProductId(id)
      setShowAddProductForm(true)
    }
  }

  const handleSaveProductEdit = async () => {
    if (!user) return

    if (
      editingProductId &&
      productFormData.nom_produit &&
      productFormData.marque &&
      productFormData.modele &&
      productFormData.prix_unitaire &&
      productFormData.quantite_stock
    ) {
      setIsSavingProduct(true)
      try {
        let photoUrl = productPhotoPreview

        if (productPhoto) {
          const fileExt = productPhoto.name.split(".").pop()
          const fileName = `${Date.now()}.${fileExt}`
          const { error: uploadError } = await supabase.storage.from("product-photos").upload(fileName, productPhoto)

          if (uploadError) {
            console.error("Error uploading photo:", uploadError)
          } else {
            const {
              data: { publicUrl },
            } = supabase.storage.from("product-photos").getPublicUrl(fileName)
            photoUrl = publicUrl
          }
        }

        const { data, error } = await supabase
          .from("products")
          .update({
            ...productFormData,
            prix_unitaire: Number.parseFloat(productFormData.prix_unitaire),
            quantite_stock: Number.parseInt(productFormData.quantite_stock),
            provenance: productFormData.provenance.trim() || null,
            photo_url: photoUrl,
          })
          .eq("id", editingProductId)
          .eq("user_id", user.id)
          .select()

        if (error) throw error

        if (data && data[0]) {
          setProducts(products.map((p) => (p.id === editingProductId ? data[0] : p)))
        }

        setEditingProductId(null)
        setProductFormData({
          nom_produit: "",
          marque: "",
          modele: "",
          prix_unitaire: "",
          quantite_stock: "",
          description: "",
          imei_telephone: "",
          provenance: "",
        })
        setProductPhoto(null)
        setProductPhotoPreview(null)
        setShowAddProductForm(false)

        toast({
          title: "Succès",
          description: "Produit modifié avec succès!",
        })
      } catch (err) {
        console.error("Error updating product:", err)
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Erreur lors de la modification du produit",
          variant: "destructive",
        })
      } finally {
        setIsSavingProduct(false)
      }
    }
  }

  const handleCancelProductEdit = () => {
    setEditingProductId(null)
    setShowAddProductForm(false)
    setProductFormData({
      nom_produit: "",
      marque: "",
      modele: "",
      prix_unitaire: "",
      quantite_stock: "",
      description: "",
      imei_telephone: "",
      provenance: "",
    })
    setProductPhoto(null)
    setProductPhotoPreview(null)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!user) return

    setDeletingProductId(id)
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      setProducts(products.filter((product) => product.id !== id))
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès!",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    } finally {
      setDeletingProductId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-yellow-500/10 rounded-3xl p-8 border border-amber-200/50 dark:border-amber-800/50 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
              Gestion de Stock
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Gérez votre inventaire de produits avec élégance</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
                  <p className="text-2xl font-bold text-gray-900">{totalValue.toLocaleString("fr-FR")} FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Faible</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rupture Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {(showAddProductForm || editingProductId) && (
        <Card className="bg-white border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-8 py-6 border-b border-primary/10">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {editingProductId ? (
                <>
                  <Edit className="w-6 h-6 text-primary" />
                  Modifier le Produit
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-primary" />
                  Ajouter un Nouveau Produit
                </>
              )}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {editingProductId
                ? "Modifiez les informations du produit ci-dessous"
                : "Remplissez les informations pour ajouter un nouveau produit à votre inventaire"
              }
            </p>
          </div>

          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Informations de base
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nomProduit" className="text-gray-700 font-medium">
                        Nom du Produit *
                      </Label>
                      <Input
                        id="nomProduit"
                        value={productFormData.nom_produit}
                        onChange={(e) => setProductFormData({ ...productFormData, nom_produit: e.target.value })}
                        placeholder="Ex: iPhone 15 Pro Max"
                        className="mt-2 h-10 sm:h-12 bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="marque" className="text-gray-700 font-medium">
                          Marque *
                        </Label>
                        <Select
                          value={productFormData.marque}
                          onValueChange={(value) => setProductFormData({ ...productFormData, marque: value })}
                        >
                          <SelectTrigger className="mt-2 h-10 sm:h-12 bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
                        <Label htmlFor="modele" className="text-gray-700 font-medium">
                          Modèle *
                        </Label>
                        <Input
                          id="modele"
                          value={productFormData.modele}
                          onChange={(e) => setProductFormData({ ...productFormData, modele: e.target.value })}
                          placeholder="Ex: 15 Pro Max"
                          className="mt-2 h-10 sm:h-12 bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock and Price Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Stock et Prix
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prixUnitaire" className="text-gray-700 font-medium">
                        Prix Unitaire (FCFA) *
                      </Label>
                      <Input
                        id="prixUnitaire"
                        type="number"
                        value={productFormData.prix_unitaire}
                        onChange={(e) => setProductFormData({ ...productFormData, prix_unitaire: e.target.value })}
                        placeholder="1299000"
                        className="mt-2 h-10 sm:h-12 bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantiteStock" className="text-gray-700 font-medium">
                        Quantité en Stock *
                      </Label>
                      <Input
                        id="quantiteStock"
                        type="number"
                        value={productFormData.quantite_stock}
                        onChange={(e) => setProductFormData({ ...productFormData, quantite_stock: e.target.value })}
                        placeholder="10"
                        className="mt-2 h-10 sm:h-12 bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Informations complémentaires
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="imeiTelephone" className="text-gray-700 font-medium">
                        IMEI (optionnel)
                      </Label>
                      <Input
                        id="imeiTelephone"
                        value={productFormData.imei_telephone}
                        onChange={(e) => setProductFormData({ ...productFormData, imei_telephone: e.target.value })}
                        placeholder="123456789012345"
                        className="mt-2 h-12 bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <Label htmlFor="provenance" className="text-gray-700 font-medium">
                        Provenance (optionnel)
                      </Label>
                      <Input
                        id="provenance"
                        value={productFormData.provenance}
                        onChange={(e) => setProductFormData({ ...productFormData, provenance: e.target.value })}
                        placeholder="Ex: Chine, France, USA..."
                        className="mt-2 h-12 bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-700 font-medium">
                        Description (optionnel)
                      </Label>
                      <Textarea
                        id="description"
                        value={productFormData.description}
                        onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                        placeholder="Description détaillée du produit..."
                        className="mt-2 bg-white border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Photo du Produit
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("photo")?.click()}
                          className="border-2 border-primary/20 hover:border-primary hover:bg-primary/5"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Choisir une photo
                        </Button>
                      </div>

                      {productPhotoPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={productPhotoPreview}
                            alt="Aperçu"
                            className="w-32 h-32 object-cover rounded-lg shadow-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setProductPhoto(null)
                              setProductPhotoPreview(null)
                            }}
                            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Aucune photo sélectionnée</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8">
              <Button
                onClick={editingProductId ? handleSaveProductEdit : handleAddProduct}
                loading={editingProductId ? isSavingProduct : isAddingProduct}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-3 rounded-xl"
              >
                <Save className="w-5 h-5 mr-2" />
                {editingProductId ? "Sauvegarder les modifications" : "Ajouter le produit"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelProductEdit}
                className="border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-xl"
              >
                <X className="w-5 h-5 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Rechercher par nom, modèle ou marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Stock Status Filter */}
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12 bg-white border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Statut du stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="in-stock">En stock</SelectItem>
                  <SelectItem value="low-stock">Stock faible</SelectItem>
                  <SelectItem value="out-of-stock">Rupture de stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Brand Filter */}
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12 bg-white border-border">
                  <SelectValue placeholder="Toutes les marques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les marques</SelectItem>
                  {uniqueBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || stockFilter !== "all" || brandFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                  Recherche: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {stockFilter !== "all" && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700">
                  Statut: {
                    stockFilter === "in-stock" ? "En stock" :
                    stockFilter === "low-stock" ? "Stock faible" :
                    "Rupture de stock"
                  }
                  <button
                    onClick={() => setStockFilter("all")}
                    className="ml-2 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {brandFilter !== "all" && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                  Marque: {brandFilter}
                  <button
                    onClick={() => setBrandFilter("all")}
                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group bg-white border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 overflow-hidden">
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {product.photo_url ? (
                  <img
                    src={product.photo_url}
                    alt={product.nom_produit}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                    <Package className="w-16 h-16 text-primary/40" />
                  </div>
                )}

                {/* Stock Status Badge */}
                <div className="absolute top-3 left-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.quantite_stock === 0
                      ? 'bg-red-500 text-white'
                      : product.quantite_stock <= 5
                        ? 'bg-orange-500 text-white'
                        : 'bg-green-500 text-white'
                  }`}>
                    {product.quantite_stock === 0
                      ? 'Rupture'
                      : product.quantite_stock <= 5
                        ? 'Stock faible'
                        : 'En stock'
                    }
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditProduct(product.id)}
                    className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500/90 hover:bg-red-500 shadow-lg backdrop-blur-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer "{product.nom_produit}" ?
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            onClick={() => handleDeleteProduct(product.id)}
                            loading={deletingProductId === product.id}
                            variant="destructive"
                          >
                            Supprimer
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.nom_produit}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {product.marque} • {product.modele}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {product.prix_unitaire.toLocaleString("fr-FR")} FCFA
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Prix unitaire
                  </div>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">{product.quantite_stock}</div>
                    <div className="text-xs text-gray-600">En stock</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {(product.prix_unitaire * product.quantite_stock).toLocaleString("fr-FR")}
                    </div>
                    <div className="text-xs text-blue-600">FCFA</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  {product.provenance && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Provenance: {product.provenance}
                    </div>
                  )}
                  {product.imei_telephone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      IMEI: {product.imei_telephone}
                    </div>
                  )}
                  {product.description && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-3 line-clamp-2">
                      {product.description}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="relative mx-auto mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 rounded-full flex items-center justify-center shadow-2xl">
              <Package className="w-16 h-16 text-primary/60" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || stockFilter !== "all" || brandFilter !== "all"
                ? "Aucun produit trouvé"
                : "Votre inventaire est vide"
              }
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {searchTerm || stockFilter !== "all" || brandFilter !== "all"
                ? "Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                : "Commencez à construire votre inventaire en ajoutant votre premier produit. C'est rapide et facile !"
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(searchTerm || stockFilter !== "all" || brandFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStockFilter("all")
                    setBrandFilter("all")
                  }}
                  className="px-6 py-3"
                >
                  Effacer les filtres
                </Button>
              )}
              <Button
                onClick={() => setShowAddProductForm(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-3 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                {searchTerm || stockFilter !== "all" || brandFilter !== "all"
                  ? "Ajouter un produit"
                  : "Ajouter votre premier produit"
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowAddProductForm(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 touch-manipulation"
        size="icon"
        title="Ajouter un nouveau produit"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    </div>
  )
}