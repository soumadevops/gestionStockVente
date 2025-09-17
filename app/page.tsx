
"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Search,
  Plus,
  Phone,
  Calendar,
  Smartphone,
  Edit,
  Save,
  X,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  User,
  Building,
  Package,
  Upload,
  Trash2,
  AlertTriangle,
  FileText,
  Printer,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

import { SuccessModal } from "@/components/success-modal"

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
  updated_at?: string
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
  updated_at?: string
}

interface CompanySettings {
  id: string
  nom_compagnie: string
  nom_admin: string
  created_at?: string
  updated_at?: string
}

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
  id: string
  invoice_id: string
  product_name: string
  description?: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function SalesManagementApp() {
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ventes, setVentes] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showAddInvoiceForm, setShowAddInvoiceForm] = useState(false)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [invoiceFormData, setInvoiceFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_address: "",
    due_date: "",
    tax_rate: "20",
    notes: "",
  })
  const [invoiceItems, setInvoiceItems] = useState([{ product_name: "", description: "", quantity: 1, unit_price: 0 }])

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

  const [companySettings, setCompanySettings] = useState({
    companyName: "VentesPro",
    adminName: "Administrateur",
  })
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState(companySettings)

  const [formData, setFormData] = useState({
    nom_prenom_client: "",
    numero_telephone: "",
    date_vente: "",
    modele: "",
    marque: "",
    imei_telephone: "",
    prix: "",
  })

  const [saleFormData, setSaleFormData] = useState({
    nom_prenom_client: "",
    numero_telephone: "",
    date_vente: "",
    modele: "",
    marque: "",
    imei_telephone: "",
    prix: "",
  })
  const [showAddSaleForm, setShowAddSaleForm] = useState(false)

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
    subMessage: "",
  })

  const supabase = createClient()

  const fetchInvoices = async () => {
    try {
      console.log("[v0] Fetching invoices...")
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
        *,
        invoice_items (*)
      `,
        )
        .order("created_at", { ascending: false })

      if (error) {
        console.log("[v0] Fetch error:", error)
        throw error
      }

      console.log("[v0] Invoices fetched successfully:", data?.length || 0)
      setInvoices(data || [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
      setInvoices([])
    }
  }

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        console.log("[v0] Starting to load all data...")

        const { error: testError } = await supabase.from("sales").select("count", { count: "exact", head: true })
        if (testError) {
          console.error("[v0] Connection test failed:", testError)
          throw testError
        }

        const [salesResponse, productsResponse, invoicesResponse, settingsResponse] = await Promise.all([
          supabase.from("sales").select("*").order("created_at", { ascending: false }),
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("invoices").select("*, invoice_items (*)").order("created_at", { ascending: false }),
          supabase.from("company_settings").select("*").limit(1).single(),
        ])

        if (salesResponse.error) throw salesResponse.error
        setVentes(salesResponse.data || [])
        console.log("[v0] Sales loaded:", salesResponse.data?.length)

        if (productsResponse.error && productsResponse.error.code !== "42P01") throw productsResponse.error
        setProducts(productsResponse.data || [])
        console.log("[v0] Products loaded:", productsResponse.data?.length)

        if (invoicesResponse.error && invoicesResponse.error.code !== "42P01") throw invoicesResponse.error
        setInvoices(invoicesResponse.data || [])
        console.log("[v0] Invoices loaded:", invoicesResponse.data?.length)

        if (settingsResponse.error && settingsResponse.error.code !== "PGRST116") throw settingsResponse.error
        if (settingsResponse.data) {
          setCompanySettings({
            companyName: settingsResponse.data.nom_compagnie,
            adminName: settingsResponse.data.nom_admin,
          })
          setTempSettings({
            companyName: settingsResponse.data.nom_compagnie,
            adminName: settingsResponse.data.nom_admin,
          })
        }
        console.log("[v0] Settings loaded.")

        console.log("[v0] All data loading completed successfully.")
      } catch (err) {
        console.error("[v0] Error loading data:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  const handleAddInvoice = useCallback(async () => {
    try {
      console.log("[v0] Starting invoice creation...")
      console.log("[v0] Invoice form data:", invoiceFormData)
      console.log("[v0] Invoice items:", invoiceItems)

      if (!invoiceFormData.client_name.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du client est requis",
          variant: "destructive",
        })
        return
      }

      if (invoiceItems.length === 0 || !invoiceItems[0].product_name.trim()) {
        toast({
          title: "Erreur",
          description: "Au moins un article est requis",
          variant: "destructive",
        })
        return
      }

      const subtotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
      const tax_rate = Number.parseFloat(invoiceFormData.tax_rate) / 100
      const tax_amount = subtotal * tax_rate
      const total_amount = subtotal + tax_amount

      console.log("[v0] Calculated totals:", { subtotal, tax_rate, tax_amount, total_amount })

      const { data: existingInvoices, error: countError } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("created_at", { ascending: false })
        .limit(1)

      if (countError) {
        console.log("[v0] Error fetching invoice count:", countError)
        throw countError
      }

      let nextNumber = 1
      if (existingInvoices && existingInvoices.length > 0) {
        const lastInvoiceNumber = existingInvoices[0].invoice_number
        const match = lastInvoiceNumber.match(/INV-(\d+)/)
        if (match) {
          nextNumber = Number.parseInt(match[1]) + 1
        }
      }

      const invoiceNumber = `INV-${nextNumber.toString().padStart(4, "0")}`
      console.log("[v0] Generated invoice number:", invoiceNumber)

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert([
          {
            invoice_number: invoiceNumber,
            client_name: invoiceFormData.client_name,
            client_email: invoiceFormData.client_email || null,
            client_phone: invoiceFormData.client_phone || null,
            client_address: invoiceFormData.client_address || null,
            invoice_date: new Date().toISOString(),
            due_date: invoiceFormData.due_date || null,
            subtotal,
            tax_rate: Number.parseFloat(invoiceFormData.tax_rate),
            tax_amount,
            total_amount,
            notes: invoiceFormData.notes || null,
          },
        ])
        .select()
        .single()

      if (invoiceError) {
        console.log("[v0] Error creating invoice:", invoiceError)
        throw invoiceError
      }

      console.log("[v0] Invoice created successfully:", invoiceData)

      const itemsToInsert = invoiceItems.map((item) => ({
        invoice_id: invoiceData.id,
        product_name: item.product_name,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }))

      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert)

      if (itemsError) {
        console.log("[v0] Error creating invoice items:", itemsError)
        throw itemsError
      }

      console.log("[v0] Invoice items created successfully")

      await fetchInvoices()
      setShowAddInvoiceForm(false)

      setInvoiceFormData({
        client_name: "",
        client_email: "",
        client_phone: "",
        client_address: "",
        due_date: "",
        tax_rate: "18",
        notes: "",
      })
      setInvoiceItems([{ product_name: "", description: "", quantity: 1, unit_price: 0 }])

      console.log("[v0] Invoice creation completed successfully")
      setSuccessModal({
        isOpen: true,
        message: "Facture créée avec succès!",
        subMessage: "La nouvelle facture a été ajoutée à votre système.",
      })
    } catch (error) {
      console.error("[v0] Error adding invoice:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout de la facture: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }, [invoiceFormData, invoiceItems, toast])

  const handleDeleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id)

      if (error) throw error

      setInvoices(invoices.filter((invoice) => invoice.id !== id))
      setSuccessModal({
        isOpen: true,
        message: "Facture supprimée avec succès!",
        subMessage: "La facture a été définitivement supprimée du système.",
      })
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  const resetInvoiceForm = () => {
    setInvoiceFormData({
      client_name: "",
      client_email: "",
      client_phone: "",
      client_address: "",
      due_date: "",
      tax_rate: "20",
      notes: "",
    })
    setInvoiceItems([{ product_name: "", description: "", quantity: 1, unit_price: 0 }])
    setEditingInvoiceId(null)
  }

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { product_name: "", description: "", quantity: 1, unit_price: 0 }])
  }

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
    }
  }

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setInvoiceItems(updatedItems)
  }

  const handleInvoiceFormChange = useCallback((field: string, value: string) => {
    setInvoiceFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleInvoiceItemChange = useCallback((index: number, field: string, value: any) => {
    setInvoiceItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const invoiceItemsForPrint = invoiceItems.filter((item) => item.product_name)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .client-info, .company-info { width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURE</h1>
            <h2>${invoice.invoice_number}</h2>
          </div>
          
          <div class="invoice-info">
            <div class="company-info">
              <h3>${companySettings.companyName}</h3>
              <p>Géré par: ${companySettings.adminName}</p>
            </div>
            <div class="client-info">
              <h3>Facturé à:</h3>
              <p><strong>${invoice.client_name}</strong></p>
              ${invoice.client_email ? `<p>Email: ${invoice.client_email}</p>` : ""}
              ${invoice.client_phone ? `<p>Tél: ${invoice.client_phone}</p>` : ""}
              ${invoice.client_address ? `<p>${invoice.client_address}</p>` : ""}
            </div>
          </div>
          
          <p><strong>Date de facture:</strong> ${new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</p>
          ${
            invoice.due_date
              ? `<p><strong>Date d'échéance:</strong> ${new Date(invoice.due_date).toLocaleDateString("fr-FR")}</p>`
              : ""
          }
          
          <table>
            <thead>
              <tr>
                <th>Produit/Service</th>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceItemsForPrint
                .map(
                  (item) => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.description || ""}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit_price.toLocaleString("fr-FR")} FCFA</td>
                  <td>${(item.quantity * item.unit_price).toLocaleString("fr-FR")} FCFA</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Sous-total: ${invoice.subtotal.toLocaleString("fr-FR")} FCFA</p>
            <p>TVA (${invoice.tax_rate}%): ${invoice.tax_amount.toLocaleString("fr-FR")} FCFA</p>
            <p class="total-row">Total: ${invoice.total_amount.toLocaleString("fr-FR")} FCFA</p>
          </div>
          
          ${invoice.notes ? `<div style="margin-top: 30px;"><strong>Notes:</strong><br>${invoice.notes}</div>` : ""}
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  const totalVentes = ventes.length
  const totalRevenue = ventes.reduce((sum, vente) => sum + vente.prix, 0)
  const totalProducts = products.length
  const totalStock = products.reduce((sum, product) => sum + product.quantite_stock, 0)
  const lowStockProducts = products.filter((product) => product.quantite_stock <= 5).length
  const outOfStockProducts = products.filter((product) => product.quantite_stock === 0).length

  const topBrand = ventes.reduce(
    (acc, vente) => {
      acc[vente.marque] = (acc[vente.marque] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  const mostPopularBrand = Object.entries(topBrand).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

  const filteredVentes = ventes.filter(
    (vente) =>
      vente.nom_prenom_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vente.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vente.marque.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const handleAddProduct = useCallback(async () => {
    try {
      if (!productFormData.nom_produit.trim() || !productFormData.marque.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du produit et la marque sont requis",
          variant: "destructive",
        })
        return
      }

      let photoUrl = null

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
        .insert([
          {
            ...productFormData,
            prix_unitaire: Number.parseFloat(productFormData.prix_unitaire),
            quantite_stock: Number.parseInt(productFormData.quantite_stock),
            photo_url: photoUrl,
          },
        ])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setProducts([data[0], ...products])
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

      setSuccessModal({
        isOpen: true,
        message: "Produit ajouté avec succès!",
        subMessage: "Le nouveau produit est maintenant disponible dans votre inventaire.",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout du produit: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }, [productFormData, toast, productPhoto, products, supabase.storage])

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
      setActiveTab("stock")
    }
  }

  const handleSaveProductEdit = async () => {
    if (
      editingProductId &&
      productFormData.nom_produit &&
      productFormData.marque &&
      productFormData.modele &&
      productFormData.prix_unitaire &&
      productFormData.quantite_stock
    ) {
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
            photo_url: photoUrl,
          })
          .eq("id", editingProductId)
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
      } catch (err) {
        console.error("Error updating product:", err)
        setError(err instanceof Error ? err.message : "Erreur lors de la modification du produit")
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

  const handleAddVente = async () => {
    if (
      formData.nom_prenom_client &&
      formData.numero_telephone &&
      formData.date_vente &&
      formData.modele &&
      formData.marque &&
      formData.imei_telephone &&
      formData.prix
    ) {
      try {
        const { data, error } = await supabase
          .from("sales")
          .insert([
            {
              ...formData,
              prix: Number.parseInt(formData.prix),
            },
          ])
          .select()

        if (error) throw error

        if (data && data[0]) {
          setVentes([data[0], ...ventes])
        }

        setFormData({
          nom_prenom_client: "",
          numero_telephone: "",
          date_vente: "",
          modele: "",
          marque: "",
          imei_telephone: "",
          prix: "",
        })
        setShowAddForm(false)
      } catch (err) {
        console.error("Error adding sale:", err)
        setError(err instanceof Error ? err.message : "Erreur lors de l'ajout")
      }
    }
  }

  const handleEditVente = (id: string) => {
    const vente = ventes.find((v) => v.id === id)
    if (vente) {
      setFormData({ ...vente, prix: vente.prix.toString() })
      setEditingId(id)
      setActiveTab("ventes")
    }
  }

  const handleSaveEdit = async () => {
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
        const { data, error } = await supabase
          .from("sales")
          .update({
            ...formData,
            prix: Number.parseInt(formData.prix),
          })
          .eq("id", editingId)
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
          modele: "",
          marque: "",
          imei_telephone: "",
          prix: "",
        })
      } catch (err) {
        console.error("Error updating sale:", err)
        setError(err instanceof Error ? err.message : "Erreur lors de la modification")
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
      modele: "",
      marque: "",
      imei_telephone: "",
      prix: "",
    })
  }

  const handleSaveSettings = async () => {
    try {
      await supabase.from("company_settings").upsert({
        nom_compagnie: tempSettings.companyName,
        nom_admin: tempSettings.adminName,
      })

      setCompanySettings(tempSettings)
      setIsEditingSettings(false)
    } catch (err) {
      console.error("Error saving settings:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde")
    }
  }

  const handleCancelSettings = () => {
    setTempSettings(companySettings)
    setIsEditingSettings(false)
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error

      setProducts(products.filter((product) => product.id !== id))
      setSuccessModal({
        isOpen: true,
        message: "Produit supprimé avec succès!",
        subMessage: "Le produit a été retiré de votre inventaire.",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  const handleAddSale = useCallback(async () => {
    try {
      if (!saleFormData.nom_prenom_client.trim() || !saleFormData.modele.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du client et le modèle sont requis",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("sales")
        .insert([
          {
            ...saleFormData,
            prix: Number.parseInt(saleFormData.prix),
          },
        ])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setVentes([data[0], ...ventes])
      }

      setSaleFormData({
        nom_prenom_client: "",
        numero_telephone: "",
        date_vente: "",
        modele: "",
        marque: "",
        imei_telephone: "",
        prix: "",
      })
      setShowAddSaleForm(false)

      setSuccessModal({
        isOpen: true,
        message: "Vente ajoutée avec succès!",
        subMessage: "La nouvelle vente a été enregistrée dans le système.",
      })
    } catch (error) {
      console.error("Error adding sale:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout de la vente: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }, [saleFormData, supabase, toast, ventes])

  const handleDeleteSale = async (id: string) => {
    try {
      const { error } = await supabase.from("sales").delete().eq("id", id)

      if (error) throw error

      setVentes(ventes.filter((vente) => vente.id !== id))
      setSuccessModal({
        isOpen: true,
        message: "Vente supprimée avec succès!",
        subMessage: "La vente a été supprimée de vos enregistrements.",
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

  const InvoicesView = () => (
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
                <textarea
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
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, tax_rate: e.target.value })}
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
                <textarea
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Smartphone className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button
            onClick={() => {
              setError(null)
              // empty function to avoid error
            }}
          >
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="bg-primary rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 text-white">Tableau de Bord</h1>
        <p className="text-white">Aperçu de vos performances de vente et gestion de stock</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ventes</p>
                <p className="text-2xl font-bold text-card-foreground">{totalVentes}</p>
              </div>
              <div className="w-12 h-12 bg-chart-1/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-card-foreground">{totalRevenue.toLocaleString("fr-FR")} FCFA</p>
              </div>
              <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Total</p>
                <p className="text-2xl font-bold text-card-foreground">{totalStock}</p>
              </div>
              <div className="w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Faible</p>
                <p className="text-2xl font-bold text-card-foreground">{lowStockProducts}</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Ventes Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ventes.slice(0, 5).map((vente) => (
                <div key={vente.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{vente.nom_prenom_client}</p>
                      <p className="text-sm text-muted-foreground">
                        {vente.marque} {vente.modele}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{vente.prix.toLocaleString("fr-FR")} FCFA</p>
                    <p className="text-xs text-muted-foreground">
                      {vente.created_at ? new Date(vente.created_at).toLocaleDateString("fr-FR") : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Package className="w-5 h-5" />
              Alertes Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products
                .filter((product) => product.quantite_stock <= 5)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          product.quantite_stock === 0 ? "bg-destructive/10" : "bg-orange-500/10"
                        }`}
                      >
                        {product.quantite_stock === 0 ? (
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        ) : (
                          <Package className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{product.nom_produit}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.marque} {product.modele}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          product.quantite_stock === 0 ? "text-destructive" : "text-orange-500"
                        }`}
                      >
                        {product.quantite_stock === 0 ? "Rupture" : `${product.quantite_stock} restant`}
                      </p>
                    </div>
                  </div>
                ))}
              {products.filter((product) => product.quantite_stock <= 5).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune alerte de stock</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const StockView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Gestion de Stock</h1>
        <Button
          onClick={() => setShowAddProductForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Produit
        </Button>
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
                <Input
                  id="marque"
                  value={productFormData.marque}
                  onChange={(e) => setProductFormData({ ...productFormData, marque: e.target.value })}
                  placeholder="Ex: Apple"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
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
                <Input
                  id="provenance"
                  value={productFormData.provenance}
                  onChange={(e) => setProductFormData({ ...productFormData, provenance: e.target.value })}
                  placeholder="Ex: Chine"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
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
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                    {product.photo_url ? (
                      <img
                        src={product.photo_url || "/placeholder.svg"}
                        alt={product.nom_produit}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground mb-1">{product.nom_produit}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.marque} {product.modele}
                    </p>
                    <p className="text-lg font-bold text-primary mb-2">
                      {product.prix_unitaire.toLocaleString("fr-FR")} FCFA
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Package className="w-3 h-3 mr-1" />
                        Stock: {product.quantite_stock}
                      </span>
                      {product.provenance && (
                        <span className="flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          Provenance: {product.provenance}
                        </span>
                      )}
                      {product.imei_telephone && (
                        <span className="text-xs col-span-full">IMEI: {product.imei_telephone}</span>
                      )}
                      {product.description && <span className="text-xs col-span-full">{product.description}</span>}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditProduct(product.id)}
                  className="hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun produit trouvé</p>
        </div>
      )}
    </div>
  )

  const VentesView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Gestion de Vente</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Vente
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              {editingId ? "Modifier la Vente" : "Ajouter une Nouvelle Vente"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomPrenom" className="text-card-foreground">
                  Nom et Prénom Client
                </Label>
                <Input
                  id="nomPrenom"
                  value={formData.nom_prenom_client}
                  onChange={(e) => setFormData({ ...formData, nom_prenom_client: e.target.value })}
                  placeholder="Ex: Marie Dubois"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="numeroTelephone" className="text-card-foreground">
                  Numéro Téléphone
                </Label>
                <Input
                  id="numeroTelephone"
                  value={formData.numero_telephone}
                  onChange={(e) => setFormData({ ...formData, numero_telephone: e.target.value })}
                  placeholder="Ex: +33 6 12 34 56 78"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="dateVente" className="text-card-foreground">
                  Date de Vente
                </Label>
                <Input
                  id="dateVente"
                  type="date"
                  value={formData.date_vente}
                  onChange={(e) => setFormData({ ...formData, date_vente: e.target.value })}
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="modele" className="text-card-foreground">
                  Modèle
                </Label>
                <Input
                  id="modele"
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  placeholder="Ex: iPhone 15 Pro"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="marque" className="text-card-foreground">
                  Marque
                </Label>
                <Input
                  id="marque"
                  value={formData.marque}
                  onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                  placeholder="Ex: Apple"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="prix" className="text-card-foreground">
                  Prix (FCFA)
                </Label>
                <Input
                  id="prix"
                  type="number"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  placeholder="Ex: 1299000"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="imei" className="text-card-foreground">
                  IMEI Téléphone
                </Label>
                <Input
                  id="imei"
                  value={formData.imei_telephone}
                  onChange={(e) => setFormData({ ...formData, imei_telephone: e.target.value })}
                  placeholder="Ex: 123456789012345"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={editingId ? handleSaveEdit : handleAddVente}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Sauvegarder" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} className="border-border bg-transparent">
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

      {/* Sales List */}
      <div className="grid gap-4">
        {filteredVentes.map((vente) => (
          <Card key={vente.id} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground mb-1">{vente.nom_prenom_client}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {vente.marque} {vente.modele}
                    </p>
                    <p className="text-lg font-bold text-primary mb-2">{vente.prix.toLocaleString("fr-FR")} FCFA</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {vente.numero_telephone}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(vente.date_vente).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-xs col-span-full">IMEI: {vente.imei_telephone}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditVente(vente.id)}
                  className="hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Voulez-vous vraiment supprimer la vente?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteSale(vente.id)}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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

  const SettingsView = () => (
    <div className="space-y-6">
      <div className="bg-primary rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 text-white">Paramètres</h1>
        <p className="text-white">Configuration de l'entreprise et de l'administrateur</p>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informations de l'Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingSettings ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-card-foreground">Nom de l'Entreprise</p>
                  <p className="text-muted-foreground">{companySettings.companyName}</p>
                </div>
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-card-foreground">Nom de l'Administrateur</p>
                  <p className="text-muted-foreground">{companySettings.adminName}</p>
                </div>
                <User className="w-5 h-5 text-primary" />
              </div>
              <Button
                onClick={() => {
                  setTempSettings(companySettings)
                  setIsEditingSettings(true)
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-card-foreground">
                  Nom de l'Entreprise
                </Label>
                <Input
                  id="companyName"
                  value={tempSettings.companyName}
                  onChange={(e) => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                  placeholder="Ex: Mon Entreprise"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="adminName" className="text-card-foreground">
                  Nom de l'Administrateur
                </Label>
                <Input
                  id="adminName"
                  value={tempSettings.adminName}
                  onChange={(e) => setTempSettings({ ...tempSettings, adminName: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                  className="bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSaveSettings} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={handleCancelSettings} className="border-border bg-transparent">
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: "", subMessage: "" })}
        message={successModal.message}
        subMessage={successModal.subMessage}
      />

      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">{companySettings.companyName}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{companySettings.adminName}</span>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("dashboard")}
                  className={activeTab === "dashboard" ? "bg-primary text-primary-foreground" : ""}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === "ventes" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("ventes")}
                  className={activeTab === "ventes" ? "bg-primary text-primary-foreground" : ""}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Ventes
                </Button>
                <Button
                  variant={activeTab === "stock" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("stock")}
                  className={activeTab === "stock" ? "bg-primary text-primary-foreground" : ""}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Stock
                </Button>
                <Button
                  variant={activeTab === "factures" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("factures")}
                  className={activeTab === "factures" ? "bg-primary text-primary-foreground" : ""}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Factures
                </Button>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                  className={activeTab === "settings" ? "bg-primary text-primary-foreground" : ""}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {activeTab === "dashboard" ? (
          <DashboardView />
        ) : activeTab === "ventes" ? (
          <VentesView />
        ) : activeTab === "stock" ? (
          <StockView />
        ) : activeTab === "factures" ? ( // Adding factures tab condition
          <InvoicesView />
        ) : (
          <SettingsView />
        )}
      </div>
    </div>
  )
}
