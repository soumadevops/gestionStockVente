
"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { StockView } from "@/components/stock/stock-view"
import { SalesView } from "@/components/sales/sales-view"
import { InvoicesView } from "@/components/invoices/invoices-view"
import { SettingsView } from "@/components/settings/settings-view"
import { LoadingPage, LoadingCard } from "@/components/ui/loading"
import { ThemeToggle } from "@/components/theme-toggle"

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
  provenance_id?: string
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

interface CompanySettings {
  id: string
  nom_compagnie: string
  nom_admin: string
  logo_url?: string
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

const PHONE_BRANDS = [
  "Apple",
  "Samsung",
  "Huawei",
  "Xiaomi",
  "Oppo",
  "Vivo",
  "OnePlus",
  "Google",
  "Sony",
  "LG",
  "Nokia",
  "Motorola",
  "Asus",
  "Realme",
  "Infinix",
  "Tecno",
  "Itel",
  "Autre"
]

export default function SalesManagementApp() {
  const { toast } = useToast()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ventes, setVentes] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [provenances, setProvenances] = useState<Provenance[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
    logoUrl: "",
  })
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState(companySettings)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

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


  const handleLogout = async () => {
    try {
      if (!supabase?.auth) {
        console.error("Supabase auth not available")
        router.push("/auth")
        return
      }
      await supabase.auth.signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      })
    }
  }

  const fetchInvoices = async () => {
    try {
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
        throw error
      }

      setInvoices(data || [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
      setInvoices([])
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
    const loadAllData = async () => {
      if (!user) return

      try {
        setLoading(true)

        const { error: testError } = await supabase.from("sales").select("count", { count: "exact", head: true })
        if (testError) {
          throw testError
        }

        const [salesResponse, productsResponse, invoicesResponse, settingsResponse, provenancesResponse] = await Promise.all([
          supabase.from("sales").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("products").select("*, provenances (*)").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("invoices").select("*, invoice_items (*)").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("company_settings").select("*").eq("user_id", user.id).limit(1).single(),
          supabase.from("provenances").select("*").eq("user_id", user.id).order("nom_provenance", { ascending: true }),
        ])

        if (salesResponse.error) {
          throw salesResponse.error
        }
        setVentes(salesResponse.data || [])

        if (productsResponse.error && productsResponse.error.code !== "42P01") {
          throw productsResponse.error
        }
        setProducts(productsResponse.data || [])

        if (invoicesResponse.error && invoicesResponse.error.code !== "42P01") {
          throw invoicesResponse.error
        }
        setInvoices(invoicesResponse.data || [])

        if (settingsResponse.error && settingsResponse.error.code !== "PGRST116") {
          throw settingsResponse.error
        }
        if (settingsResponse.data) {
          setCompanySettings({
            companyName: settingsResponse.data.nom_compagnie,
            adminName: settingsResponse.data.nom_admin,
            logoUrl: settingsResponse.data.logo_url || "",
          })
          setTempSettings({
            companyName: settingsResponse.data.nom_compagnie,
            adminName: settingsResponse.data.nom_admin,
            logoUrl: settingsResponse.data.logo_url || "",
          })
          setLogoPreview(settingsResponse.data.logo_url || null)
        }

        if (provenancesResponse.error && provenancesResponse.error.code !== "42P01") {
          throw provenancesResponse.error
        }
        setProvenances(provenancesResponse.data || [])
      } catch (err) {
        console.error("[v0] Error loading data:", err)
        // Error handling removed - app continues with empty data
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [user])

  const handleAddInvoice = useCallback(async () => {
    if (!user) return

    try {
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

      const { data: existingInvoices, error: countError } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("created_at", { ascending: false })
        .limit(1)

      if (countError) {
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
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (invoiceError) {
        throw invoiceError
      }

      const itemsToInsert = invoiceItems.map((item) => ({
        invoice_id: invoiceData.id,
        product_name: item.product_name,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        user_id: user.id,
      }))

      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert)

      if (itemsError) {
        throw itemsError
      }

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
    if (!user) return

    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

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
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un produit",
        variant: "destructive",
      })
      return
    }

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
  }, [productFormData, toast, productPhoto, products, supabase.storage, user])

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
    if (!user) return

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
      } catch (err) {
        console.error("Error updating product:", err)
        // Error handling removed - app continues with current data
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
    if (!user) {
      return
    }

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
        const insertData = {
          ...formData,
          prix: Number.parseInt(formData.prix),
          user_id: user.id,
        }

        const { data, error } = await supabase
          .from("sales")
          .insert([insertData])
          .select()

        if (error) {
          throw error
        }

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
        // Error handling removed - app continues with current data
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
        const { data, error } = await supabase
          .from("sales")
          .update({
            ...formData,
            prix: Number.parseInt(formData.prix),
          })
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
          modele: "",
          marque: "",
          imei_telephone: "",
          prix: "",
        })
      } catch (err) {
        console.error("Error updating sale:", err)
        // Error handling removed - app continues with current data
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
    if (!user) return

    // Validation
    if (!tempSettings.companyName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'entreprise est requis",
        variant: "destructive",
      })
      return
    }

    if (!tempSettings.adminName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'administrateur est requis",
        variant: "destructive",
      })
      return
    }

    try {
      let logoUrl = tempSettings.logoUrl

      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop()
        const fileName = `${user.id}/logo.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("company-logos")
          .upload(fileName, logoFile, { upsert: true })

        if (uploadError) {
          console.error("Error uploading logo:", uploadError)
          toast({
            title: "Avertissement",
            description: "Erreur lors du téléchargement du logo, les paramètres seront sauvegardés sans logo",
            variant: "default",
          })
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("company-logos")
            .getPublicUrl(fileName)
          logoUrl = publicUrl
        }
      }

      await supabase.from("company_settings").upsert({
        user_id: user.id,
        nom_compagnie: tempSettings.companyName.trim(),
        nom_admin: tempSettings.adminName.trim(),
        logo_url: logoUrl,
      })

      setCompanySettings({ ...tempSettings, logoUrl })
      setIsEditingSettings(false)
      setLogoFile(null)

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres ont été mis à jour avec succès",
      })
    } catch (err) {
      console.error("Error saving settings:", err)
      toast({
        title: "Erreur",
        description: `Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  const handleCancelSettings = () => {
    setTempSettings(companySettings)
    setIsEditingSettings(false)
    setLogoFile(null)
    setLogoPreview(companySettings.logoUrl || null)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

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
    if (!user) return

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
            user_id: user.id,
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
    if (!user) return

    try {
      const { error } = await supabase
        .from("sales")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

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


  if (loading) {
    return <LoadingPage message="Chargement de vos données..." />
  }

  // Error handling removed as requested





  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: "", subMessage: "" })}
        message={successModal.message}
        subMessage={successModal.subMessage}
      />

      <header className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 shadow-lg backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              {companySettings.logoUrl ? (
                <div className="relative">
                  <img
                    src={companySettings.logoUrl || "/placeholder.svg"}
                    alt={`Logo de ${companySettings.companyName}`}
                    className="w-12 h-12 rounded-xl object-cover shadow-md ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" aria-label="Connecté"></div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl shadow-lg" aria-label="Logo par défaut">
                  <Smartphone className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {companySettings.companyName}
                </h1>
                {user && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Statut en ligne"></div>
                    Connecté en tant que {user.email}
                  </p>
                )}
              </div>
            </div>
            <nav className="flex items-center space-x-4" role="navigation" aria-label="Navigation principale">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" aria-hidden="true" />
                <span>{companySettings.adminName}</span>
              </div>
              <ThemeToggle />
              <div className="flex space-x-2" role="tablist" aria-label="Onglets de navigation">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("dashboard")}
                  className={`transition-all duration-200 hover:scale-105 ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg ring-2 ring-primary/20"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-selected={activeTab === "dashboard"}
                  role="tab"
                  aria-controls="dashboard-panel"
                  id="dashboard-tab"
                >
                  <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === "ventes" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("ventes")}
                  className={`transition-all duration-200 hover:scale-105 ${
                    activeTab === "ventes"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg ring-2 ring-primary/20"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-selected={activeTab === "ventes"}
                  role="tab"
                  aria-controls="ventes-panel"
                  id="ventes-tab"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
                  Ventes
                </Button>
                <Button
                  variant={activeTab === "stock" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("stock")}
                  className={`transition-all duration-200 hover:scale-105 ${
                    activeTab === "stock"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg ring-2 ring-primary/20"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-selected={activeTab === "stock"}
                  role="tab"
                  aria-controls="stock-panel"
                  id="stock-tab"
                >
                  <Package className="w-4 h-4 mr-2" aria-hidden="true" />
                  Stock
                </Button>
                <Button
                  variant={activeTab === "factures" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("factures")}
                  className={`transition-all duration-200 hover:scale-105 ${
                    activeTab === "factures"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg ring-2 ring-primary/20"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-selected={activeTab === "factures"}
                  role="tab"
                  aria-controls="factures-panel"
                  id="factures-tab"
                >
                  <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                  Factures
                </Button>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                  className={`transition-all duration-200 hover:scale-105 ${
                    activeTab === "settings"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg ring-2 ring-primary/20"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-selected={activeTab === "settings"}
                  role="tab"
                  aria-controls="settings-panel"
                  id="settings-tab"
                >
                  <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                  Paramètres
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-red-100 hover:text-red-600 transition-colors"
                  aria-label="Se déconnecter"
                >
                  Se déconnecter
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4" role="main">
        {activeTab === "dashboard" ? (
          <div role="tabpanel" id="dashboard-panel" aria-labelledby="dashboard-tab">
            <DashboardView
              totalVentes={totalVentes}
              totalRevenue={totalRevenue}
              totalStock={totalStock}
              lowStockProducts={lowStockProducts}
              ventes={ventes}
              products={products}
              companySettings={companySettings}
            />
          </div>
        ) : activeTab === "ventes" ? (
          <div role="tabpanel" id="ventes-panel" aria-labelledby="ventes-tab">
            <SalesView
              ventes={ventes}
              filteredVentes={filteredVentes}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
              editingId={editingId}
              formData={formData}
              setFormData={setFormData}
              handleAddVente={handleAddVente}
              handleEditVente={handleEditVente}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
              handleDeleteSale={handleDeleteSale}
            />
          </div>
        ) : activeTab === "stock" ? (
          <div role="tabpanel" id="stock-panel" aria-labelledby="stock-tab">
            <StockView
              products={products}
              setProducts={setProducts}
              provenances={provenances}
              setProvenances={setProvenances}
              user={user}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        ) : activeTab === "factures" ? ( // Adding factures tab condition
          <div role="tabpanel" id="factures-panel" aria-labelledby="factures-tab">
            <InvoicesView
              invoices={invoices}
              showAddInvoiceForm={showAddInvoiceForm}
              setShowAddInvoiceForm={setShowAddInvoiceForm}
              editingInvoiceId={editingInvoiceId}
              invoiceFormData={invoiceFormData}
              handleInvoiceFormChange={handleInvoiceFormChange}
              invoiceItems={invoiceItems}
              handleInvoiceItemChange={handleInvoiceItemChange}
              addInvoiceItem={addInvoiceItem}
              removeInvoiceItem={removeInvoiceItem}
              handleAddInvoice={handleAddInvoice}
              resetInvoiceForm={resetInvoiceForm}
              printInvoice={printInvoice}
              handleDeleteInvoice={handleDeleteInvoice}
            />
          </div>
        ) : (
          <div role="tabpanel" id="settings-panel" aria-labelledby="settings-tab">
            <SettingsView
              companySettings={companySettings}
              isEditingSettings={isEditingSettings}
              setIsEditingSettings={setIsEditingSettings}
              tempSettings={tempSettings}
              setTempSettings={setTempSettings}
              logoPreview={logoPreview}
              handleLogoUpload={handleLogoUpload}
              handleSaveSettings={handleSaveSettings}
              handleCancelSettings={handleCancelSettings}
            />
          </div>
        )}
      </main>
    </div>
  )
}
