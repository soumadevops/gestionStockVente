"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Search, Upload, Save, X, Package } from "lucide-react"
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
  provenance_id?: string
  provenances?: Provenance
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
  provenances: Provenance[]
  setProvenances: (provenances: Provenance[]) => void
  user: any
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const PHONE_BRANDS = [
  "Apple", "Samsung", "Huawei", "Xiaomi", "Oppo", "Vivo", "OnePlus", "Google", "Sony", "LG", "Nokia", "Motorola", "Asus", "Realme", "Infinix", "Tecno", "Itel", "Autre"
]

export function StockView({ products, setProducts, provenances, setProvenances, user, searchTerm, setSearchTerm }: StockViewProps) {
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
    provenance_id: "",
  })
  const [productPhoto, setProductPhoto] = useState<File | null>(null)
  const [productPhotoPreview, setProductPhotoPreview] = useState<string | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marque.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        provenance_id: productFormData.provenance_id ? productFormData.provenance_id : null,
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
        provenance_id: "",
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
        provenance_id: product.provenance_id || "",
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
            provenance_id: productFormData.provenance_id ? productFormData.provenance_id : null,
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
          provenance_id: "",
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
      provenance_id: "",
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gestion de Stock
          </h1>
          <p className="text-gray-600 mt-2">Gérez votre inventaire de produits</p>
        </div>
      </div>

      {(showAddProductForm || editingProductId) && (
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              {editingProductId ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomProduit" className="text-card-foreground">
                  Nom du Produit
                </Label>
                <Input
                  id="nomProduit"
                  value={productFormData.nom_produit}
                  onChange={(e) => setProductFormData({ ...productFormData, nom_produit: e.target.value })}
                  placeholder="Ex: iPhone 15 Pro Max"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="marque" className="text-card-foreground">
                  Marque
                </Label>
                <Select
                  value={productFormData.marque}
                  onValueChange={(value) => setProductFormData({ ...productFormData, marque: value })}
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
                <Label htmlFor="modele" className="text-card-foreground">
                  Modèle
                </Label>
                <Input
                  id="modele"
                  value={productFormData.modele}
                  onChange={(e) => setProductFormData({ ...productFormData, modele: e.target.value })}
                  placeholder="Ex: 15 Pro Max"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="prixUnitaire" className="text-card-foreground">
                  Prix Unitaire (FCFA)
                </Label>
                <Input
                  id="prixUnitaire"
                  type="number"
                  value={productFormData.prix_unitaire}
                  onChange={(e) => setProductFormData({ ...productFormData, prix_unitaire: e.target.value })}
                  placeholder="Ex: 1299000"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="quantiteStock" className="text-card-foreground">
                  Quantité en Stock
                </Label>
                <Input
                  id="quantiteStock"
                  type="number"
                  value={productFormData.quantite_stock}
                  onChange={(e) => setProductFormData({ ...productFormData, quantite_stock: e.target.value })}
                  placeholder="Ex: 10"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="imeiTelephone" className="text-card-foreground">
                  IMEI (optionnel)
                </Label>
                <Input
                  id="imeiTelephone"
                  value={productFormData.imei_telephone}
                  onChange={(e) => setProductFormData({ ...productFormData, imei_telephone: e.target.value })}
                  placeholder="Ex: 123456789012345"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="provenance" className="text-card-foreground">
                  Provenance
                </Label>
                <Select
                  value={productFormData.provenance_id}
                  onValueChange={(value) => setProductFormData({ ...productFormData, provenance_id: value })}
                >
                  <SelectTrigger className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <SelectValue placeholder="Sélectionnez une provenance" />
                  </SelectTrigger>
                  <SelectContent>
                    {provenances.map((provenance) => (
                      <SelectItem key={provenance.id} value={provenance.id}>
                        {provenance.nom_provenance}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description" className="text-card-foreground">
                  Description (optionnel)
                </Label>
                <Textarea
                  id="description"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  placeholder="Description du produit..."
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="photo" className="text-card-foreground">
                  Photo du Produit
                </Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("photo")?.click()}
                      className="border-border bg-transparent hover:bg-primary/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir
                    </Button>
                  </div>
                  {productPhotoPreview && (
                    <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-lg overflow-hidden">
                      <img
                        src={productPhotoPreview || "/placeholder.svg"}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setProductPhoto(null)
                          setProductPhotoPreview(null)
                        }}
                        className="absolute top-1 right-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={editingProductId ? handleSaveProductEdit : handleAddProduct}
                loading={editingProductId ? isSavingProduct : isAddingProduct}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingProductId ? "Sauvegarder" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={handleCancelProductEdit} className="border-border bg-transparent">
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

      {/* Products List */}
      <div className="grid gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                      {product.photo_url ? (
                        <img
                          src={product.photo_url || "/placeholder.svg"}
                          alt={product.nom_produit}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-primary" />
                      )}
                    </div>
                    {product.quantite_stock <= 5 && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white ${
                        product.quantite_stock === 0 ? 'bg-red-500' : 'bg-orange-500'
                      }`}></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                      {product.nom_produit}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      {product.marque} {product.modele}
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
                      {product.prix_unitaire.toLocaleString("fr-FR")} FCFA
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className={`flex items-center px-3 py-2 rounded-lg ${
                        product.quantite_stock === 0
                          ? 'bg-red-100 text-red-700'
                          : product.quantite_stock <= 5
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        <Package className="w-4 h-4 mr-2" />
                        Stock: {product.quantite_stock}
                      </div>
                      {product.provenances && (
                        <div className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">
                          <Package className="w-4 h-4 mr-2" />
                          {product.provenances.nom_provenance}
                        </div>
                      )}
                      {product.imei_telephone && (
                        <div className="col-span-full text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg mt-2">
                          IMEI: {product.imei_telephone}
                        </div>
                      )}
                      {product.description && (
                        <div className="col-span-full text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg mt-2">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProduct(product.id)}
                    className="hover:bg-blue-100 hover:text-blue-600 transition-colors rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-red-100 hover:text-red-600 transition-colors rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Voulez-vous vraiment supprimer ce produit ?
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
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter votre premier produit</p>
          <Button
            onClick={() => setShowAddProductForm(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      )}
    </div>
  )
}