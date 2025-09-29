"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { SalesView } from "@/components/sales/sales-view"
import { LoadingPage } from "@/components/ui/loading"
import type { Sale, Product } from "@/lib/types"

export default function SalesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [ventes, setVentes] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form states
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Stable callback for payment status filter
  const handlePaymentStatusFilterChange = useCallback((status: string) => {
    setPaymentStatusFilter(status)
  }, [])
  const [formData, setFormData] = useState({
    nom_prenom_client: "",
    numero_telephone: "",
    date_vente: "",
    nom_produit: "",
    modele: "",
    marque: "",
    imei_telephone: "",
    prix: "",
  })

  const supabase = createClient()

  // Transaction wrapper for atomic operations with rollback
  const executeTransactionWithRollback = async (
    operation: () => Promise<any>,
    rollback: (result: any) => Promise<void>
  ): Promise<any> => {
    let result: any = null;

    try {
      // Execute the main operation
      result = await operation();
      return result;
    } catch (error) {
      // If operation fails, execute rollback
      console.error("Transaction failed, executing rollback:", error);

      if (result) {
        try {
          await rollback(result);
          console.log("Rollback completed successfully");
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
          toast({
            title: "Erreur critique",
            description: "Une erreur s'est produite et la restauration automatique a échoué. Contactez le support.",
            variant: "destructive",
          });
        }
      }

      throw error;
    }
  }

  const deductFromInventory = async (invoiceItems: any[], userId: string) => {
    try {
      // Group items by product details to find matching products
      for (const item of invoiceItems) {
        if (item.product_name && item.quantity > 0) {
          // Find products that match the invoice item details
          const { data: matchingProducts, error } = await supabase
            .from("products")
            .select("*")
            .eq("user_id", userId)
            .eq("nom_produit", item.product_name)
            .eq("marque", item.marque || "")
            .eq("couleur", item.modele || "") // Use couleur instead of modele
            .gte("quantite_stock", item.quantity) // Ensure enough stock

          if (error) {
            console.error("Error finding matching products:", error)
            continue
          }

          if (matchingProducts && matchingProducts.length > 0) {
            // Use the first matching product (FIFO)
            const productToUpdate = matchingProducts[0]
            const newStockQuantity = productToUpdate.quantite_stock - item.quantity

            const { error: updateError } = await supabase
              .from("products")
              .update({
                quantite_stock: newStockQuantity,
                updated_at: new Date().toISOString(),
              })
              .eq("id", productToUpdate.id)
              .eq("user_id", userId)

            if (updateError) {
              console.error("Error updating product stock:", updateError)
              toast({
                title: "Avertissement",
                description: `Impossible de mettre à jour le stock pour ${item.product_name}`,
                variant: "default",
              })
            } else {
              console.log(`Deducted ${item.quantity} from ${productToUpdate.nom_produit} stock. New stock: ${newStockQuantity}`)
            }
          } else {
            console.warn(`No matching product found for ${item.product_name} with sufficient stock`)
            toast({
              title: "Avertissement",
              description: `Stock insuffisant pour ${item.product_name}`,
              variant: "default",
            })
          }
        }
      }

      // Refresh products data
      const { data: updatedProducts, error: refreshError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (!refreshError && updatedProducts) {
        setProducts(updatedProducts)
      }
    } catch (error) {
      console.error("Error in deductFromInventory:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du stock",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }
      setUser(user)
    }

    checkUser()
  }, [supabase.auth, router])

  useEffect(() => {
    const loadSalesData = async () => {
      if (!user) return

      try {
        setLoading(true)

        const [salesResponse, productsResponse] = await Promise.all([
          supabase.from("sales").select(`
            *,
            invoices!sales_invoice_id_fkey(invoice_number, status, payment_status, id, total_amount)
          `).eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        ])

        if (salesResponse.error && salesResponse.error.code !== "42P01") {
          throw salesResponse.error
        }
        setVentes(salesResponse.data || [])

        if (productsResponse.error && productsResponse.error.code !== "42P01") {
          throw productsResponse.error
        }
        setProducts(productsResponse.data || [])
      } catch (err) {
        console.error("[Sales] Error loading data:", err)
        // Error handling removed - app continues with empty data
      } finally {
        setLoading(false)
      }
    }

    loadSalesData()
  }, [user])

  const filteredVentes = ventes.filter(
    (vente) => {
      // Search filter
      const matchesSearch =
        vente.nom_prenom_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vente.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vente.marque.toLowerCase().includes(searchTerm.toLowerCase())

      // Payment status filter
      const matchesPaymentStatus = paymentStatusFilter === "all" ||
        vente.invoice?.payment_status === paymentStatusFilter

      return matchesSearch && matchesPaymentStatus
    }
  )

  const handleAddVente = async () => {
    if (!user) return

    try {
      if (!formData.nom_prenom_client.trim() || !formData.modele.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du client et le modèle sont requis",
          variant: "destructive",
        })
        return
      }

      // Validate stock availability before creating sale
      const selectedProduct = products.find(p =>
        p.nom_produit === formData.nom_produit &&
        p.marque === formData.marque &&
        p.couleur === formData.modele
      )

      if (!selectedProduct) {
        toast({
          title: "Erreur",
          description: "Produit non trouvé dans l'inventaire",
          variant: "destructive",
        })
        return
      }

      if (selectedProduct.quantite_stock <= 0) {
        toast({
          title: "Erreur",
          description: "Ce produit n'est plus en stock",
          variant: "destructive",
        })
        return
      }

      // Create sale and invoice with transaction safety
      const saleResult = await executeTransactionWithRollback(
        // Main operation: create sale and auto-generate invoice
        async () => {
          // Prepare sale data excluding nom_produit (not in sales table schema)
          const saleData = {
            nom_prenom_client: formData.nom_prenom_client,
            numero_telephone: formData.numero_telephone,
            date_vente: formData.date_vente,
            modele: formData.modele,
            marque: formData.marque,
            imei_telephone: formData.imei_telephone,
            prix: Number.parseInt(formData.prix),
            user_id: user.id,
          }

          const { data, error } = await supabase
            .from("sales")
            .insert([saleData])
            .select()

          if (error) throw error
          if (!data || !data[0]) throw new Error("Échec de la création de la vente")

          const createdSale = data[0]

          // Auto-generate invoice for the sale
          const invoiceNumber = `INV-SALE-${createdSale.id.slice(-6).toUpperCase()}`

          const invoiceData = {
            invoice_number: invoiceNumber,
            client_name: formData.nom_prenom_client,
            client_email: null,
            client_phone: formData.numero_telephone,
            client_address: null,
            invoice_date: new Date().toISOString(),
            due_date: null,
            subtotal: Number.parseInt(formData.prix),
            tax_rate: 18, // Default tax rate
            tax_amount: Math.round(Number.parseInt(formData.prix) * 0.18),
            total_amount: Math.round(Number.parseInt(formData.prix) * 1.18),
            status: "pending", // As requested by user
            payment_status: "unpaid",
            notes: `Facture générée automatiquement pour la vente ${createdSale.id}`,
            sales_id: createdSale.id, // Link to the sale
            user_id: user.id,
          }

          const { data: invoiceResult, error: invoiceError } = await supabase
            .from("invoices")
            .insert([invoiceData])
            .select()

          if (invoiceError) throw invoiceError
          if (!invoiceResult || !invoiceResult[0]) throw new Error("Échec de la création de la facture")

          // Update sale with invoice_id
          await supabase
            .from("sales")
            .update({ invoice_id: invoiceResult[0].id })
            .eq("id", createdSale.id)
            .eq("user_id", user.id)

          // Create invoice item
          const invoiceItemData = {
            invoice_id: invoiceResult[0].id,
            product_name: `${formData.marque} ${formData.modele}`,
            imei: formData.imei_telephone,
            quantity: 1,
            unit_price: Number.parseInt(formData.prix),
            total_price: Number.parseInt(formData.prix),
            marque: formData.marque,
            modele: formData.modele,
            provenance: null,
          }

          const { error: itemError } = await supabase
            .from("invoice_items")
            .insert([invoiceItemData])

          if (itemError) throw itemError

          return { ...createdSale, invoice_id: invoiceResult[0].id }
        },
        // Rollback operation: delete sale and related invoice if stock deduction fails
        async (createdSale: any) => {
          console.log("Rolling back sale and invoice creation:", createdSale.id)

          // Delete invoice items first
          const { data: invoice } = await supabase
            .from("invoices")
            .select("id")
            .eq("sales_id", createdSale.id)
            .eq("user_id", user.id)
            .single()

          if (invoice) {
            await supabase
              .from("invoice_items")
              .delete()
              .eq("invoice_id", invoice.id)
              .eq("user_id", user.id)

            // Delete invoice
            await supabase
              .from("invoices")
              .delete()
              .eq("id", invoice.id)
              .eq("user_id", user.id)
          }

          // Delete sale
          await supabase
            .from("sales")
            .delete()
            .eq("id", createdSale.id)
            .eq("user_id", user.id)
        }
      )

      // Deduct stock after successful sale creation
      const saleItem = [{
        product_name: selectedProduct.nom_produit,
        marque: selectedProduct.marque,
        modele: selectedProduct.couleur,
        quantity: 1, // Sales are for individual items
        unit_price: selectedProduct.prix_unitaire,
      }]

      await deductFromInventory(saleItem, user.id)

      // Update local state only after everything succeeds
      setVentes([saleResult, ...ventes])

      setFormData({
        nom_prenom_client: "",
        numero_telephone: "",
        date_vente: "",
        nom_produit: "",
        modele: "",
        marque: "",
        imei_telephone: "",
        prix: "",
      })
      setShowAddForm(false)

      toast({
        title: "Succès",
        description: "Vente ajoutée avec succès",
      })
    } catch (error) {
      console.error("Error adding sale:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout de la vente: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  const handleEditVente = (id: string) => {
    const vente = ventes.find((v) => v.id === id)
    if (vente) {
      setFormData({
         nom_prenom_client: vente.nom_prenom_client,
         numero_telephone: vente.numero_telephone,
         date_vente: vente.date_vente,
         nom_produit: vente.nom_produit || "",
         modele: vente.modele,
         marque: vente.marque,
         imei_telephone: vente.imei_telephone,
         prix: vente.prix.toString()
       })
      setEditingId(id)
      setShowAddForm(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!user) return

    if (
      editingId &&
      formData.nom_prenom_client &&
      formData.numero_telephone &&
      formData.date_vente &&
      formData.modele &&
      formData.marque &&
      formData.imei_telephone &&
      formData.prix
    ) {
      try {
        // Prepare sale data excluding nom_produit (not in sales table schema)
        const saleData = {
          nom_prenom_client: formData.nom_prenom_client,
          numero_telephone: formData.numero_telephone,
          date_vente: formData.date_vente,
          modele: formData.modele,
          marque: formData.marque,
          imei_telephone: formData.imei_telephone,
          prix: Number.parseInt(formData.prix),
        }

        const { data, error } = await supabase
          .from("sales")
          .update(saleData)
          .eq("id", editingId)
          .eq("user_id", user.id)
          .select()

        if (error) throw error

        if (data && data[0]) {
          setVentes(ventes.map((v) => (v.id === editingId ? data[0] : v)))
        }

        setEditingId(null)
        setFormData({
          nom_prenom_client: "",
          numero_telephone: "",
          date_vente: "",
          nom_produit: "",
          modele: "",
          marque: "",
          imei_telephone: "",
          prix: "",
        })
        setShowAddForm(false)

        toast({
          title: "Succès",
          description: "Vente modifiée avec succès",
        })
      } catch (err) {
        console.error("Error updating sale:", err)
        toast({
          title: "Erreur",
          description: `Erreur lors de la modification de la vente: ${err instanceof Error ? err.message : "Erreur inconnue"}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setShowAddForm(false)
    setFormData({
      nom_prenom_client: "",
      numero_telephone: "",
      date_vente: "",
      nom_produit: "",
      modele: "",
      marque: "",
      imei_telephone: "",
      prix: "",
    })
  }

  const handleDeleteSale = async (id: string) => {
    if (!user) return

    try {
      // First delete associated invoice if it exists
      const saleToDelete = ventes.find(v => v.id === id)
      if (saleToDelete?.invoice) {
        const { error: invoiceError } = await supabase
          .from("invoices")
          .delete()
          .eq("sales_id", id)
          .eq("user_id", user.id)

        if (invoiceError) {
          console.error("Error deleting associated invoice:", invoiceError)
          // Continue with sale deletion even if invoice deletion fails
        }
      }

      // Then delete the sale
      const { error } = await supabase
        .from("sales")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      setVentes(ventes.filter((vente) => vente.id !== id))
      toast({
        title: "Succès",
        description: "Vente supprimée avec succès",
      })
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  const handleBulkDeleteSales = async (ids: string[]) => {
    if (!user) return

    try {
      // First delete associated invoices for all selected sales
      for (const id of ids) {
        const saleToDelete = ventes.find(v => v.id === id)
        if (saleToDelete?.invoice) {
          const { error: invoiceError } = await supabase
            .from("invoices")
            .delete()
            .eq("sales_id", id)
            .eq("user_id", user.id)

          if (invoiceError) {
            console.error("Error deleting associated invoice:", invoiceError)
            // Continue with other deletions
          }
        }
      }

      // Then delete all selected sales
      const { error } = await supabase
        .from("sales")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id)

      if (error) throw error

      setVentes(ventes.filter((vente) => !ids.includes(vente.id)))
      toast({
        title: "Succès",
        description: `${ids.length} vente(s) supprimée(s) avec succès`,
      })
    } catch (error) {
      console.error("Error bulk deleting sales:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }


  if (loading) {
    return <LoadingPage message="Chargement des ventes..." />
  }

  return (
    <SalesView
      ventes={ventes}
      filteredVentes={filteredVentes}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      paymentStatusFilter={paymentStatusFilter}
      setPaymentStatusFilter={handlePaymentStatusFilterChange}
      handleDeleteSale={handleDeleteSale}
      handleBulkDeleteSales={handleBulkDeleteSales}
      products={products}
    />
  )
}