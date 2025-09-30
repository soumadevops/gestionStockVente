
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
  Menu,
  X as CloseIcon,
  ArrowLeft,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

import { SuccessModal } from "@/components/success-modal"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { StockView } from "@/components/stock/stock-view"
import { SalesView } from "@/components/sales/sales-view"
import { InvoicesView } from "@/components/invoices/invoices-view"
import { SettingsView } from "@/components/settings/settings-view"
import { LoadingPage, LoadingCard } from "@/components/ui/loading"
import type { Sale, Product, Provenance, CompanySettings, Invoice, InvoiceItem } from "@/lib/types"


interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  autoBackup: boolean
  twoFactorAuth: boolean
  dataExport: boolean
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
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false)
  const [isLoadingSales, setIsLoadingSales] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [invoiceFormData, setInvoiceFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_address: "",
    due_date: "",
    tax_rate: "18",
    payment_status: "unpaid" as "unpaid" | "paid" | "refunded",
    notes: "",
  })
  const [invoiceItems, setInvoiceItems] = useState<any[]>([{ product_name: "", imei: "", marque: "", modele: "", provenance: "", quantity: 1, unit_price: 0 }])

  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productFormData, setProductFormData] = useState({
    nom_produit: "",
    marque: "",
    couleur: "",
    prix_unitaire: "",
    quantite_stock: "",
    description: "",
    imei_telephone: "",
    provenance: "",
  })
  const [productPhoto, setProductPhoto] = useState<File | null>(null)
  const [productPhotoPreview, setProductPhotoPreview] = useState<string | null>(null)

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    id: "",
    nom_compagnie: "VentesPro",
    nom_admin: "Administrateur",
    logo_url: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    tax_id: "",
    currency: "XOF",
    language: "fr",
    timezone: "Africa/Dakar",
  })
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    twoFactorAuth: false,
    dataExport: true,
  })
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState<CompanySettings>({
    id: companySettings.id,
    nom_compagnie: companySettings.nom_compagnie,
    nom_admin: companySettings.nom_admin,
    logo_url: companySettings.logo_url || "",
    email: companySettings.email,
    phone: companySettings.phone,
    address: companySettings.address,
    website: companySettings.website,
    tax_id: companySettings.tax_id,
    currency: companySettings.currency,
    language: companySettings.language,
    timezone: companySettings.timezone,
  })
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
    nom_produit: "",
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(null)
  const [showInvoicePreview, setShowInvoicePreview] = useState(false)

  // Invoice filters
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("")
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("")
  const [salesFilter, setSalesFilter] = useState("all")

  const supabase = createClient()

  // Keyboard shortcuts - only escape for mobile menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to close mobile menu
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])


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
        invoice_items (
          *,
          invoice_item_units (*)
        )
      `,
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      // Process the data to include units in the invoice_items
      const processedData = data?.map(invoice => ({
        ...invoice,
        invoice_items: invoice.invoice_items?.map((item: any) => ({
          ...item,
          units: item.invoice_item_units?.sort((a: any, b: any) => a.unit_index - b.unit_index).map((unit: any) => ({
            color: unit.color,
            imei: unit.imei,
          })) || undefined,
        })),
      })) || []

      setInvoices(processedData)
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

        const [salesResponse, productsResponse, invoicesResponse, settingsResponse] = await Promise.all([
          supabase.from("sales").select(`
            *,
            invoice:invoices!sales_invoice_id_fkey(invoice_number, status, payment_status)
          `).eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("invoices").select("*, invoice_items (*)").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("company_settings").select("*").limit(1).single(),
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
          const loadedSettings: CompanySettings = {
            id: settingsResponse.data.id,
            nom_compagnie: settingsResponse.data.nom_compagnie,
            nom_admin: settingsResponse.data.nom_admin,
            logo_url: settingsResponse.data.logo_url || "",
            email: settingsResponse.data.email || "",
            phone: settingsResponse.data.phone || "",
            address: settingsResponse.data.address || "",
            website: settingsResponse.data.website || "",
            tax_id: settingsResponse.data.tax_id || "",
            currency: settingsResponse.data.currency || "XOF",
            language: settingsResponse.data.language || "fr",
            timezone: settingsResponse.data.timezone || "Africa/Dakar",
          }
          setCompanySettings(loadedSettings)
          setTempSettings(loadedSettings)
          setLogoPreview(settingsResponse.data.logo_url || null)
        }
      } catch (err) {
        // Error handling removed as requested
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [user])

  const handleAddInvoice = useCallback(async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une facture",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingInvoice(true)
    try {
      // Validation des champs requis
      if (!invoiceFormData.client_name.trim()) {
        toast({
          title: "Erreur de validation",
          description: "Le nom du client est requis",
          variant: "destructive",
        })
        return
      }

      if (invoiceItems.length === 0 || !invoiceItems[0].product_name.trim()) {
        toast({
          title: "Erreur de validation",
          description: "Au moins un article avec un nom est requis",
          variant: "destructive",
        })
        return
      }

      // Validation des articles
      for (let i = 0; i < invoiceItems.length; i++) {
        const item = invoiceItems[i]
        if (item.product_name.trim() && (item.quantity <= 0 || item.unit_price < 0)) {
          toast({
            title: "Erreur de validation",
            description: `Article ${i + 1}: La quantité doit être positive et le prix unitaire doit être >= 0`,
            variant: "destructive",
          })
          return
        }

        // Validate IMEI uniqueness for items with quantity >= 2
        if (item.quantity >= 2 && item.units) {
          const imeis = item.units.map((unit: any) => unit.imei.trim()).filter((imei: string) => imei)
          const uniqueImeis = new Set(imeis)

          if (imeis.length !== uniqueImeis.size) {
            toast({
              title: "Erreur de validation",
              description: `Article ${i + 1}: Les IMEI doivent être uniques pour chaque unité`,
              variant: "destructive",
            })
            return
          }

          // Check that all units have both color and IMEI
          for (let j = 0; j < item.units.length; j++) {
            const unit = item.units[j]
            if (!unit.color.trim() || !unit.imei.trim()) {
              toast({
                title: "Erreur de validation",
                description: `Article ${i + 1}, Unité ${j + 1}: La couleur et l'IMEI sont requis`,
                variant: "destructive",
              })
              return
            }
          }
        }

        // Validate stock availability
        if (item.product_name.trim()) {
          const product = products.find(p =>
            p.nom_produit === item.product_name &&
            p.marque === item.marque &&
            p.couleur === item.modele
          )

          if (!product) {
            toast({
              title: "Erreur de validation",
              description: `Article ${i + 1}: Produit "${item.product_name}" non trouvé dans l'inventaire`,
              variant: "destructive",
            })
            return
          }

          if (product.quantite_stock < item.quantity) {
            toast({
              title: "Erreur de validation",
              description: `Article ${i + 1}: Stock insuffisant pour "${item.product_name}". Disponible: ${product.quantite_stock}, Demandé: ${item.quantity}`,
              variant: "destructive",
            })
            return
          }
        }
      }

      const subtotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
      const tax_rate = Number.parseFloat(invoiceFormData.tax_rate) / 100
      const tax_amount = subtotal * tax_rate
      const total_amount = subtotal + tax_amount

      const isEditing = !!editingInvoiceId

      if (isEditing) {
        // Update existing invoice and linked sale
        const invoiceData = {
          client_name: invoiceFormData.client_name.trim(),
          client_email: invoiceFormData.client_email?.trim() || null,
          client_phone: invoiceFormData.client_phone?.trim() || null,
          client_address: invoiceFormData.client_address?.trim() || null,
          due_date: invoiceFormData.due_date || null,
          subtotal: Math.round(subtotal * 100) / 100,
          tax_rate: Number.parseFloat(invoiceFormData.tax_rate),
          tax_amount: Math.round(tax_amount * 100) / 100,
          total_amount: Math.round(total_amount * 100) / 100,
          notes: invoiceFormData.notes?.trim() || null,
        }

        const { error: invoiceError } = await supabase
          .from("invoices")
          .update(invoiceData)
          .eq("id", editingInvoiceId)
          .eq("user_id", user.id)

        if (invoiceError) {
          throw new Error(`Erreur lors de la modification de la facture: ${invoiceError.message}`)
        }

        // Update linked sale if it exists
        const { data: existingSale } = await supabase
          .from("sales")
          .select("id")
          .eq("invoice_id", editingInvoiceId)
          .eq("user_id", user.id)
          .single()

        if (existingSale) {
          // Update the linked sale with invoice data
          const saleUpdateData = {
            nom_prenom_client: invoiceFormData.client_name.trim(),
            numero_telephone: invoiceFormData.client_phone?.trim() || "",
            prix: Math.round(total_amount * 100) / 100, // Update sale price to match invoice total
          }

          const { error: saleError } = await supabase
            .from("sales")
            .update(saleUpdateData)
            .eq("id", existingSale.id)
            .eq("user_id", user.id)

          if (saleError) {
            console.error("Error updating linked sale:", saleError)
            // Don't throw error, just log it - invoice update was successful
          }
        }

        // Delete existing items and their units
        const { data: existingItems } = await supabase
          .from("invoice_items")
          .select("id")
          .eq("invoice_id", editingInvoiceId)
          .eq("user_id", user.id)

        if (existingItems) {
          for (const item of existingItems) {
            await supabase
              .from("invoice_item_units")
              .delete()
              .eq("invoice_item_id", item.id)
          }
        }

        await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", editingInvoiceId)
          .eq("user_id", user.id)

        const validItems = invoiceItems.filter(item => item.product_name.trim())
        if (validItems.length > 0) {
          const itemsToInsert = validItems.map((item) => ({
            invoice_id: editingInvoiceId,
            product_name: item.product_name.trim(),
            imei: item.imei?.trim() || null,
            quantity: item.quantity,
            unit_price: Math.round(item.unit_price * 100) / 100,
            total_price: Math.round((item.quantity * item.unit_price) * 100) / 100,
            marque: item.marque?.trim() || null,
            modele: item.modele?.trim() || null,
            provenance: item.provenance?.trim() || null,
            couleur: item.units && item.units.length > 0 ? item.units[0]?.color || null : null,
            user_id: user.id,
          }))

          const { data: insertedItems, error: itemsError } = await supabase
            .from("invoice_items")
            .insert(itemsToInsert)
            .select()

          if (itemsError) {
            toast({
              title: "Avertissement",
              description: "La facture a été modifiée mais certains articles n'ont pas pu être mis à jour",
              variant: "default",
            })
          } else if (insertedItems) {
            // Insert unit details for items with quantity >= 2
            for (let i = 0; i < validItems.length; i++) {
              const item = validItems[i]
              const insertedItem = insertedItems[i]

              if (item.units && item.units.length > 0) {
                const unitsToInsert = item.units.map((unit: any, unitIndex: number) => ({
                  invoice_item_id: insertedItem.id,
                  unit_index: unitIndex,
                  color: unit.color.trim(),
                  imei: unit.imei.trim(),
                }))

                const { error: unitsError } = await supabase
                  .from("invoice_item_units")
                  .insert(unitsToInsert)

                if (unitsError) {
                  console.error("Invoice item units insertion error:", unitsError)
                  toast({
                    title: "Avertissement",
                    description: "Les détails des unités n'ont pas pu être mis à jour",
                    variant: "default",
                  })
                }
              }
            }
          }
        }

        setSuccessModal({
          isOpen: true,
          message: "Facture modifiée avec succès!",
          subMessage: "Les modifications ont été sauvegardées.",
        })

        toast({
          title: "Succès",
          description: "Facture modifiée avec succès",
        })
      } else {
        // Create new invoice
        console.log("Creating invoice with data:", {
          client_name: invoiceFormData.client_name,
          subtotal,
          tax_rate,
          total_amount,
          items_count: invoiceItems.length,
          user_id: user.id
        })

        // Générer le numéro de facture de manière simplifiée
        const timestamp = Date.now()
        const invoiceNumber = `INV-${timestamp.toString().slice(-6)}`

        // Créer la facture
        const invoiceData = {
          invoice_number: invoiceNumber,
          client_name: invoiceFormData.client_name.trim(),
          client_email: invoiceFormData.client_email?.trim() || null,
          client_phone: invoiceFormData.client_phone?.trim() || null,
          client_address: invoiceFormData.client_address?.trim() || null,
          invoice_date: new Date().toISOString(),
          due_date: invoiceFormData.due_date || null,
          subtotal: Math.round(subtotal * 100) / 100, // Arrondir à 2 décimales
          tax_rate: Number.parseFloat(invoiceFormData.tax_rate),
          tax_amount: Math.round(tax_amount * 100) / 100,
          total_amount: Math.round(total_amount * 100) / 100,
          payment_status: invoiceFormData.payment_status,
          notes: invoiceFormData.notes?.trim() || null,
          user_id: user.id,
        }

        // Create invoice with transaction safety
        const insertedInvoice = await executeTransactionWithRollback(
          // Main operation: create invoice and items
          async () => {
            console.log("Inserting invoice:", invoiceData)

            const { data: invoice, error: invoiceError } = await supabase
              .from("invoices")
              .insert([invoiceData])
              .select()
              .single()

            if (invoiceError) {
              console.error("Invoice insertion error:", invoiceError)
              throw new Error(`Erreur lors de la création de la facture: ${invoiceError.message}`)
            }

            if (!invoice) {
              throw new Error("La facture n'a pas été créée correctement")
            }

            console.log("Invoice created successfully:", invoice)

            // Créer les articles de la facture
            const validItems = invoiceItems.filter(item => item.product_name.trim())
            if (validItems.length > 0) {
              const itemsToInsert = validItems.map((item) => ({
                invoice_id: invoice.id,
                product_name: item.product_name.trim(),
                imei: item.imei?.trim() || null,
                quantity: item.quantity,
                unit_price: Math.round(item.unit_price * 100) / 100,
                total_price: Math.round((item.quantity * item.unit_price) * 100) / 100,
                marque: item.marque?.trim() || null,
                modele: item.modele?.trim() || null,
                provenance: item.provenance?.trim() || null,
                couleur: item.units && item.units.length > 0 ? item.units[0]?.color || null : null,
                user_id: user.id,
              }))

              console.log("Inserting invoice items:", itemsToInsert)

              const { data: insertedItems, error: itemsError } = await supabase
                .from("invoice_items")
                .insert(itemsToInsert)
                .select()

              if (itemsError) {
                console.error("Invoice items insertion error:", itemsError)
                throw new Error(`Erreur lors de l'ajout des articles: ${itemsError.message}`)
              }

              console.log("Invoice items created successfully")

              // Insert unit details for items with quantity >= 2
              for (let i = 0; i < validItems.length; i++) {
                const item = validItems[i]
                const insertedItem = insertedItems?.[i]

                if (item.units && item.units.length > 0 && insertedItem) {
                  const unitsToInsert = item.units.map((unit: any, unitIndex: number) => ({
                    invoice_item_id: insertedItem.id,
                    unit_index: unitIndex,
                    color: unit.color.trim(),
                    imei: unit.imei.trim(),
                  }))

                  console.log("Inserting invoice item units:", unitsToInsert)

                  const { error: unitsError } = await supabase
                    .from("invoice_item_units")
                    .insert(unitsToInsert)

                  if (unitsError) {
                    console.error("Invoice item units insertion error:", unitsError)
                    throw new Error(`Erreur lors de l'ajout des détails des unités: ${unitsError.message}`)
                  }

                  console.log("Invoice item units created successfully")
                }
              }
            }

            return invoice
          },
          // Rollback operation: delete invoice and items if stock deduction fails
          async (createdInvoice: any) => {
            console.log("Rolling back invoice creation:", createdInvoice.id)

            // Delete invoice items first
            await supabase
              .from("invoice_items")
              .delete()
              .eq("invoice_id", createdInvoice.id)
              .eq("user_id", user.id)

            // Delete invoice
            await supabase
              .from("invoices")
              .delete()
              .eq("id", createdInvoice.id)
              .eq("user_id", user.id)
          }
        )

        // Create corresponding sale record for the invoice
        const validItems = invoiceItems.filter(item => item.product_name.trim())
        const saleData = {
          nom_prenom_client: invoiceFormData.client_name.trim(),
          numero_telephone: invoiceFormData.client_phone?.trim() || "",
          date_vente: new Date().toISOString().split('T')[0], // Today's date
          nom_produit: validItems.length > 0 ? validItems[0].product_name : "Multiple Products",
          modele: validItems.length > 0 ? validItems[0].modele || "" : "",
          marque: validItems.length > 0 ? validItems[0].marque || "" : "",
          imei_telephone: validItems.length > 0 ? validItems[0].imei || "" : "",
          prix: Math.round(total_amount * 100) / 100,
          user_id: user.id,
        }

        const { data: createdSale, error: saleError } = await supabase
          .from("sales")
          .insert([saleData])
          .select()
          .single()

        if (saleError) {
          console.error("Error creating corresponding sale:", saleError)
          // Don't throw error, invoice was created successfully
          toast({
            title: "Avertissement",
            description: "La facture a été créée mais la vente associée n'a pas pu être enregistrée",
            variant: "default",
          })
        } else if (createdSale) {
          // Update invoice with sales_id
          await supabase
            .from("invoices")
            .update({ sales_id: createdSale.id })
            .eq("id", insertedInvoice.id)
            .eq("user_id", user.id)

          // Update sale with invoice_id
          await supabase
            .from("sales")
            .update({ invoice_id: insertedInvoice.id })
            .eq("id", createdSale.id)
            .eq("user_id", user.id)
        }

        // Deduct quantities from inventory immediately upon invoice creation
        await deductFromInventory(validItems, user.id)

        setSuccessModal({
          isOpen: true,
          message: "Facture créée avec succès!",
          subMessage: `Facture ${invoiceNumber} ajoutée à votre système.`,
        })

        toast({
          title: "Succès",
          description: `Facture ${invoiceNumber} créée avec succès`,
        })
      }

      // Recharger les factures
      await fetchInvoices()

      // Fermer le formulaire et réinitialiser
      setShowAddInvoiceForm(false)
      setInvoiceFormData({
        client_name: "",
        client_email: "",
        client_phone: "",
        client_address: "",
        due_date: "",
        tax_rate: "18",
        payment_status: "unpaid",
        notes: "",
      })
      setInvoiceItems([{ product_name: "", imei: "", marque: "", modele: "", provenance: "", quantity: 1, unit_price: 0 }])
      setEditingInvoiceId(null)

    } catch (error) {
      console.error("Error saving invoice:", error)

      let errorMessage = "Erreur lors de la sauvegarde de la facture"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmittingInvoice(false)
    }
  }, [invoiceFormData, invoiceItems, toast, user, fetchInvoices, editingInvoiceId])

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

  const handleBulkDeleteInvoices = async (ids: string[]) => {
    if (!user) return

    try {
      // Delete all selected invoices
      const { error } = await supabase
        .from("invoices")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id)

      if (error) throw error

      setInvoices(invoices.filter((invoice) => !ids.includes(invoice.id)))
      setSuccessModal({
        isOpen: true,
        message: `${ids.length} facture(s) supprimée(s) avec succès!`,
        subMessage: "Les factures ont été définitivement supprimées du système.",
      })
    } catch (error) {
      console.error("Error bulk deleting invoices:", error)
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
      tax_rate: "18",
      payment_status: "unpaid",
      notes: "",
    })
    setInvoiceItems([{ product_name: "", imei: "", marque: "", modele: "", provenance: "", quantity: 1, unit_price: 0 }])
    setEditingInvoiceId(null)
  }

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { product_name: "", imei: "", marque: "", modele: "", provenance: "", quantity: 1, unit_price: 0 }])
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

  const handleInvoiceItemUnitChange = useCallback((itemIndex: number, unitIndex: number, field: string, value: string) => {
    setInvoiceItems((prev) => {
      const updated = [...prev]
      if (!updated[itemIndex].units) {
        updated[itemIndex].units = []
      }
      if (!updated[itemIndex].units![unitIndex]) {
        updated[itemIndex].units![unitIndex] = { color: "", imei: "" }
      }
      updated[itemIndex].units![unitIndex] = {
        ...updated[itemIndex].units![unitIndex],
        [field]: value
      }
      return updated
    })
  }, [])

  const handleProductSelect = useCallback((index: number, product: Product) => {
    setInvoiceItems((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        product_name: product.nom_produit,
        marque: product.marque,
        modele: product.couleur,
        imei: product.imei_telephone || "",
        provenance: product.provenance || "",
        unit_price: product.prix_unitaire,
        quantity: 1, // Default to 1, user can change
      }
      return updated
    })
  }, [])

  // Transaction wrapper for atomic operations with rollback
  const executeTransactionWithRollback = useCallback(async (
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
  }, [toast]);

  const deductFromInventory = useCallback(async (invoiceItems: any[], userId: string) => {
    try {
      let hasUpdates = false

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
            .order("created_at", { ascending: true }) // FIFO - first in, first out

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
              hasUpdates = true

              // Update local state immediately for real-time sync
              setProducts(prevProducts =>
                prevProducts.map(product =>
                  product.id === productToUpdate.id
                    ? { ...product, quantite_stock: newStockQuantity, updated_at: new Date().toISOString() }
                    : product
                )
              )
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

      // Only refresh from database if we had updates and want to ensure consistency
      if (hasUpdates) {
        // Small delay to ensure database consistency
        setTimeout(async () => {
          const { data: updatedProducts, error: refreshError } = await supabase
            .from("products")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

          if (!refreshError && updatedProducts) {
            setProducts(updatedProducts)
          }
        }, 500)
      }
    } catch (error) {
      console.error("Error in deductFromInventory:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du stock",
        variant: "destructive",
      })
    }
  }, [supabase, toast])

  const handleEditInvoice = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (!invoice) return

    // Populate form data
    setInvoiceFormData({
      client_name: invoice.client_name,
      client_email: invoice.client_email || "",
      client_phone: invoice.client_phone || "",
      client_address: invoice.client_address || "",
      due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : "",
      tax_rate: invoice.tax_rate.toString(),
      payment_status: invoice.payment_status,
      notes: invoice.notes || "",
    })

    // Populate invoice items
    if (invoice.invoice_items) {
      setInvoiceItems(invoice.invoice_items.map(item => ({
        product_name: item.product_name,
        imei: item.imei || "",
        marque: item.marque || "",
        modele: item.modele || "",
        provenance: item.provenance || "",
        quantity: item.quantity,
        unit_price: item.unit_price,
        units: item.units, // Include units if they exist
      })))
    }

    setEditingInvoiceId(invoiceId)
    setShowAddInvoiceForm(true)
  }

  const previewInvoice = (invoice: Invoice) => {
    setInvoicePreview(invoice)
    setShowInvoicePreview(true)
  }

  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Use the invoice's stored items from database, not the form state
    const invoiceItemsForPrint = invoice.invoice_items || []

    // Get payment status styling
    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'paid':
          return { bg: '#10b981', color: '#ffffff', text: 'PAYÉE' }
        case 'unpaid':
          return { bg: '#f59e0b', color: '#ffffff', text: 'NON PAYÉE' }
        case 'refunded':
          return { bg: '#6b7280', color: '#ffffff', text: 'REMBOURSÉE' }
        default:
          return { bg: '#6b7280', color: '#ffffff', text: 'BROUILLON' }
      }
    }

    const statusStyle = getStatusStyle(invoice.payment_status)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture ${invoice.invoice_number} - ${companySettings.nom_compagnie}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1a202c;
              background: #f7fafc;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              border-radius: 12px;
              overflow: hidden;
            }

            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 50px;
              position: relative;
              overflow: hidden;
            }

            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: pulse 4s ease-in-out infinite;
            }

            @keyframes pulse {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }

            .header-content {
              position: relative;
              z-index: 1;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .invoice-title-section {
              flex: 1;
            }

            .invoice-title {
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.025em;
            }

            .invoice-number {
              font-size: 18px;
              font-weight: 500;
              opacity: 0.9;
              background: rgba(255, 255, 255, 0.2);
              padding: 6px 12px;
              border-radius: 20px;
              display: inline-block;
              backdrop-filter: blur(10px);
            }

            .status-badge {
              background: ${statusStyle.bg};
              color: ${statusStyle.color};
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .invoice-meta {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 40px;
              padding: 30px 50px;
              background: #f8fafc;
              border-bottom: 1px solid #e2e8f0;
            }

            .company-info h3,
            .client-info h3 {
              font-size: 14px;
              font-weight: 600;
              color: #718096;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 12px;
            }

            .company-info p,
            .client-info p {
              margin-bottom: 4px;
              color: #2d3748;
              font-weight: 500;
            }

            .company-info .company-name {
              font-size: 20px;
              font-weight: 700;
              color: #1a202c;
              margin-bottom: 8px;
            }

            .client-info .client-name {
              font-size: 18px;
              font-weight: 600;
              color: #2b6cb0;
              margin-bottom: 8px;
            }

            .invoice-details {
              padding: 30px 50px;
              background: white;
            }

            .details-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }

            .detail-item {
              background: #f7fafc;
              padding: 16px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }

            .detail-label {
              font-size: 12px;
              font-weight: 600;
              color: #718096;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 4px;
            }

            .detail-value {
              font-size: 16px;
              font-weight: 600;
              color: #2d3748;
            }

            .products-section {
              margin-bottom: 30px;
            }

            .section-title {
              font-size: 20px;
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .section-title::before {
              content: '';
              width: 4px;
              height: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 2px;
            }

            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .products-table thead {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .products-table th {
              padding: 16px 20px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .products-table tbody tr {
              border-bottom: 1px solid #e2e8f0;
              transition: background-color 0.2s ease;
            }

            .products-table tbody tr:hover {
              background: #f8fafc;
            }

            .products-table tbody tr:last-child {
              border-bottom: none;
            }

            .products-table td {
              padding: 16px 20px;
              vertical-align: top;
            }

            .product-name {
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 4px;
            }

            .product-details {
              font-size: 14px;
              color: #718096;
              line-height: 1.4;
            }

            .product-details div {
              margin-bottom: 2px;
            }

            .quantity-badge {
              background: #e6fffa;
              color: #065f46;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              display: inline-block;
            }

            .price-cell {
              font-weight: 600;
              color: #2d3748;
              text-align: right;
            }

            .totals-section {
              background: #f8fafc;
              border-radius: 8px;
              padding: 24px;
              margin-top: 30px;
            }

            .totals-title {
              font-size: 18px;
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 16px;
            }

            .totals-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }

            .totals-row:last-child {
              border-bottom: none;
              border-top: 2px solid #667eea;
              padding-top: 16px;
              margin-top: 8px;
            }

            .totals-row.total {
              font-size: 20px;
              font-weight: 700;
              color: #667eea;
            }

            .totals-label {
              font-weight: 500;
              color: #4a5568;
            }

            .totals-value {
              font-weight: 600;
              color: #2d3748;
            }

            .notes-section {
              margin-top: 30px;
              padding: 20px;
              background: #fef5e7;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }

            .notes-title {
              font-size: 16px;
              font-weight: 600;
              color: #92400e;
              margin-bottom: 8px;
            }

            .notes-content {
              color: #78350f;
              line-height: 1.6;
            }

            .footer {
              background: #1a202c;
              color: white;
              padding: 20px 50px;
              text-align: center;
              font-size: 14px;
            }

            .footer p {
              margin-bottom: 4px;
            }

            .footer .company-name {
              font-weight: 600;
            }

            @media print {
              body {
                background: white !important;
              }

              .invoice-container {
                box-shadow: none !important;
                margin: 0 !important;
                max-width: none !important;
              }

              .header::before {
                animation: none !important;
              }

              .products-table tbody tr:hover {
                background: transparent !important;
              }
            }

            @media (max-width: 768px) {
              .header {
                padding: 30px 20px;
              }

              .header-content {
                flex-direction: column;
                gap: 20px;
                text-align: center;
              }

              .invoice-meta {
                grid-template-columns: 1fr;
                gap: 20px;
                padding: 20px;
              }

              .invoice-details {
                padding: 20px;
              }

              .products-table {
                font-size: 14px;
              }

              .products-table th,
              .products-table td {
                padding: 12px 8px;
              }

              .footer {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header Section -->
            <div class="header">
              <div class="header-content">
                <div class="invoice-title-section">
                  <h1 class="invoice-title">Facture</h1>
                  <div class="invoice-number">${invoice.invoice_number}</div>
                </div>
                <div class="status-badge">${statusStyle.text}</div>
              </div>
            </div>

            <!-- Company and Client Info -->
            <div class="invoice-meta">
              <div class="company-info">
                <h3>Émis par</h3>
                <div class="company-name">${companySettings.nom_compagnie}</div>
                <p>Géré par: ${companySettings.nom_admin}</p>
                ${companySettings.email ? `<p>Email: ${companySettings.email}</p>` : ""}
                ${companySettings.phone ? `<p>Tél: ${companySettings.phone}</p>` : ""}
                ${companySettings.address ? `<p>${companySettings.address}</p>` : ""}
              </div>
              <div class="client-info">
                <h3>Facturé à</h3>
                <div class="client-name">${invoice.client_name}</div>
                ${invoice.client_email ? `<p>Email: ${invoice.client_email}</p>` : ""}
                ${invoice.client_phone ? `<p>Tél: ${invoice.client_phone}</p>` : ""}
                ${invoice.client_address ? `<p>${invoice.client_address.replace(/\n/g, '<br>')}</p>` : ""}
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Date de facture</div>
                  <div class="detail-value">${new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</div>
                </div>
                ${invoice.due_date ? `
                  <div class="detail-item">
                    <div class="detail-label">Date d'échéance</div>
                    <div class="detail-value">${new Date(invoice.due_date).toLocaleDateString("fr-FR")}</div>
                  </div>
                ` : ""}
                <div class="detail-item">
                  <div class="detail-label">Numéro de facture</div>
                  <div class="detail-value">${invoice.invoice_number}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Statut</div>
                  <div class="detail-value" style="color: ${statusStyle.bg}">${statusStyle.text}</div>
                </div>
              </div>

              <!-- Products Section -->
              <div class="products-section">
                <h2 class="section-title">Articles</h2>
                <table class="products-table">
                  <thead>
                    <tr>
                      <th>Produit/Service</th>
                      <th>Détails</th>
                      <th>Quantité</th>
                      <th>Prix unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoiceItemsForPrint.map((item, index) => `
                      <tr>
                        <td>
                          <div class="product-name">${item.product_name}</div>
                        </td>
                        <td>
                          <div class="product-details">
                            ${item.marque ? `<div><strong>Marque:</strong> ${item.marque}</div>` : ""}
                            ${item.modele ? `<div><strong>Modèle:</strong> ${item.modele}</div>` : ""}
                            ${item.imei ? `<div><strong>SN:</strong> ${item.imei}</div>` : ""}
                            ${item.provenance ? `<div><strong>Provenance:</strong> ${item.provenance}</div>` : ""}
                          </div>
                        </td>
                        <td>
                          <span class="quantity-badge">${item.quantity}</span>
                        </td>
                        <td class="price-cell">${item.unit_price.toLocaleString("fr-FR")} FCFA</td>
                        <td class="price-cell">${(item.quantity * item.unit_price).toLocaleString("fr-FR")} FCFA</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>

              <!-- Totals Section -->
              <div class="totals-section">
                <h3 class="totals-title">Récapitulatif</h3>
                <div class="totals-row">
                  <span class="totals-label">Sous-total</span>
                  <span class="totals-value">${invoice.subtotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div class="totals-row">
                  <span class="totals-label">TVA (${invoice.tax_rate}%)</span>
                  <span class="totals-value">${invoice.tax_amount.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div class="totals-row total">
                  <span class="totals-label">Total</span>
                  <span class="totals-value">${invoice.total_amount.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              <!-- Notes Section -->
              ${invoice.notes ? `
                <div class="notes-section">
                  <h3 class="notes-title">Notes</h3>
                  <div class="notes-content">${invoice.notes.replace(/\n/g, '<br>')}</div>
                </div>
              ` : ""}
            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="company-name">${companySettings.nom_compagnie}</p>
              <p>Merci pour votre confiance • Facture générée le ${new Date().toLocaleDateString("fr-FR")}</p>
              ${companySettings.website ? `<p>${companySettings.website}</p>` : ""}
            </div>
          </div>

          <script>
            window.onload = function() {
              // Small delay to ensure styles are loaded
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }, 100);
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
      product.couleur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marque.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.client_name.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(invoiceSearchTerm.toLowerCase()),
  ).filter(
    (invoice) =>
      invoiceStatusFilter === "" || invoice.payment_status === invoiceStatusFilter,
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
        couleur: productFormData.couleur.trim(),
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
        couleur: "",
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
        couleur: product.couleur,
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
      productFormData.couleur &&
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
          couleur: "",
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
      couleur: "",
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
        toast({
          title: "Erreur",
          description: `Erreur lors de l'ajout de la vente: ${err instanceof Error ? err.message : "Erreur inconnue"}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleEditVente = (id: string) => {
    const vente = ventes.find((v) => v.id === id)
    if (vente) {
      setSaleFormData({
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
      setActiveTab("ventes")
    }
  }

  const handleSaveEdit = async () => {
    if (!user) return

    if (
      editingId &&
      saleFormData.nom_prenom_client &&
      saleFormData.numero_telephone &&
      saleFormData.date_vente &&
      saleFormData.modele &&
      saleFormData.marque &&
      saleFormData.imei_telephone &&
      saleFormData.prix
    ) {
      try {
        // Prepare sale data excluding nom_produit (not in sales table schema)
        const saleData = {
          nom_prenom_client: saleFormData.nom_prenom_client,
          numero_telephone: saleFormData.numero_telephone,
          date_vente: saleFormData.date_vente,
          modele: saleFormData.modele,
          marque: saleFormData.marque,
          imei_telephone: saleFormData.imei_telephone,
          prix: Number.parseInt(saleFormData.prix),
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
        setSaleFormData({
          nom_prenom_client: "",
          numero_telephone: "",
          date_vente: "",
          nom_produit: "",
          modele: "",
          marque: "",
          imei_telephone: "",
          prix: "",
        })
        setSuccessModal({
          isOpen: true,
          message: "Vente modifiée avec succès!",
          subMessage: "Les modifications ont été sauvegardées.",
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
    setShowAddSaleForm(false)
    setSaleFormData({
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

  const handleSaveSettings = async () => {
    if (!user) return

    // Validation
    if (!tempSettings.nom_compagnie.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de l'entreprise est requis",
        variant: "destructive",
      })
      return
    }

    if (!tempSettings.nom_admin.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de l'administrateur est requis",
        variant: "destructive",
      })
      return
    }

    try {
      let logoUrl = tempSettings.logo_url

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
        nom_compagnie: tempSettings.nom_compagnie.trim(),
        nom_admin: tempSettings.nom_admin.trim(),
        logo_url: logoUrl,
        email: tempSettings.email?.trim() || null,
        phone: tempSettings.phone?.trim() || null,
        address: tempSettings.address?.trim() || null,
        website: tempSettings.website?.trim() || null,
        tax_id: tempSettings.tax_id?.trim() || null,
        currency: tempSettings.currency,
        language: tempSettings.language,
        timezone: tempSettings.timezone,
      })

      const dbSettings: CompanySettings = {
        id: companySettings.id,
        nom_compagnie: tempSettings.nom_compagnie.trim(),
        nom_admin: tempSettings.nom_admin.trim(),
        logo_url: logoUrl,
        email: tempSettings.email?.trim() || "",
        phone: tempSettings.phone?.trim() || "",
        address: tempSettings.address?.trim() || "",
        website: tempSettings.website?.trim() || "",
        tax_id: tempSettings.tax_id?.trim() || "",
        currency: tempSettings.currency,
        language: tempSettings.language,
        timezone: tempSettings.timezone,
      }
      setCompanySettings(dbSettings)
      setIsEditingSettings(false)
      setLogoFile(null)

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres d'entreprise ont été mis à jour avec succès",
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

  const handleSavePreferences = async () => {
    if (!user) return

    try {
      // Save user preferences to localStorage for now
      // In a real app, this would be saved to the database
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(userPreferences))

      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences utilisateur ont été mises à jour",
      })
    } catch (err) {
      console.error("Error saving preferences:", err)
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des préférences",
        variant: "destructive",
      })
    }
  }

  const handleCancelSettings = () => {
    setTempSettings(companySettings)
    setIsEditingSettings(false)
    setLogoFile(null)
    setLogoPreview(companySettings.logo_url || null)
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
    return <LoadingPage message="Chargement de vos données..." />
  }

  // Error handling removed as requested





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-foreground">
      <Toaster />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: "", subMessage: "" })}
        message={successModal.message}
        subMessage={successModal.subMessage}
      />

      {/* Invoice Preview Modal */}
      {showInvoicePreview && invoicePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Aperçu Facture - {invoicePreview.invoice_number}
              </h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => printInvoice(invoicePreview)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
                <Button
                  onClick={() => setShowInvoicePreview(false)}
                  variant="outline"
                  className="px-4 py-2 rounded-lg"
                >
                  <CloseIcon className="w-4 h-4" />
                  Fermer
                </Button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6">
                {(() => {
                  const invoice = invoicePreview
                  const invoiceItemsForPrint = invoice.invoice_items || []

                  const getStatusStyle = (status: string) => {
                    switch (status) {
                      case 'paid':
                        return { bg: '#10b981', color: '#ffffff', text: 'PAYÉE' }
                      case 'unpaid':
                        return { bg: '#f59e0b', color: '#ffffff', text: 'NON PAYÉE' }
                      case 'refunded':
                        return { bg: '#6b7280', color: '#ffffff', text: 'REMBOURSÉE' }
                      default:
                        return { bg: '#6b7280', color: '#ffffff', text: 'BROUILLON' }
                    }
                  }

                  const statusStyle = getStatusStyle(invoice.payment_status)

                  return (
                    <div className="invoice-container" style={{maxWidth: 'none', margin: '0', boxShadow: 'none', borderRadius: '0'}}>
                      {/* Header Section */}
                      <div className="header" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '8px 8px 0 0'
                      }}>
                        <div style={{
                          position: 'relative',
                          zIndex: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h1 style={{
                              fontSize: '36px',
                              fontWeight: 700,
                              marginBottom: '8px',
                              letterSpacing: '-0.025em'
                            }}>Facture</h1>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: 500,
                              opacity: 0.9,
                              background: 'rgba(255, 255, 255, 0.2)',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              backdropFilter: 'blur(10px)'
                            }}>{invoice.invoice_number}</div>
                          </div>
                          <div style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: 600,
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}>{statusStyle.text}</div>
                        </div>
                      </div>

                      {/* Company and Client Info */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '40px',
                        marginTop: '0',
                        padding: '30px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#718096',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '12px'
                          }}>Émis par</h3>
                          <div style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#1a202c',
                            marginBottom: '8px'
                          }}>{companySettings.nom_compagnie}</div>
                          <p style={{marginBottom: '4px', color: '#2d3748', fontWeight: 500}}>
                            Géré par: {companySettings.nom_admin}
                          </p>
                          {companySettings.email && <p style={{marginBottom: '4px', color: '#2d3748', fontWeight: 500}}>
                            Email: {companySettings.email}
                          </p>}
                          {companySettings.phone && <p style={{marginBottom: '4px', color: '#2d3748', fontWeight: 500}}>
                            Tél: {companySettings.phone}
                          </p>}
                          {companySettings.address && <p style={{marginBottom: '4px', color: '#2d3748', fontWeight: 500}}>
                            {companySettings.address}
                          </p>}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#718096',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '12px'
                          }}>Facturé à</h3>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#2b6cb0',
                            marginBottom: '8px'
                          }}>{invoice.client_name}</div>
                          {invoice.client_email && <p style={{marginBottom: '4px', color: '#2d3748', fontWeight: 500}}>
                            Email: {invoice.client_email}
                          </p>}
                          {invoice.client_phone && <p style={{marginBottom: '4px', color: '#2d3748', fontWeight: 500}}>
                            Tél: {invoice.client_phone}
                          </p>}
                          {invoice.client_address && <p style={{marginBottom: '4px', color: '#2d3748', fontWeight: 500}}>
                            {invoice.client_address.replace(/\n/g, '<br>')}
                          </p>}
                        </div>
                      </div>

                      {/* Invoice Details */}
                      <div style={{padding: '30px', background: 'white'}}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '20px',
                          marginBottom: '30px'
                        }}>
                          <div style={{
                            background: '#f7fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#718096',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '4px'
                            }}>Date de facture</div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#2d3748'
                            }}>{new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</div>
                          </div>
                          {invoice.due_date && (
                            <div style={{
                              background: '#f7fafc',
                              padding: '16px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#718096',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '4px'
                              }}>Date d'échéance</div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#2d3748'
                              }}>{new Date(invoice.due_date).toLocaleDateString("fr-FR")}</div>
                            </div>
                          )}
                          <div style={{
                            background: '#f7fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#718096',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '4px'
                            }}>Numéro de facture</div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#2d3748'
                            }}>{invoice.invoice_number}</div>
                          </div>
                          <div style={{
                            background: '#f7fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#718096',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '4px'
                            }}>Statut</div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: statusStyle.bg
                            }}>{statusStyle.text}</div>
                          </div>
                        </div>

                        {/* Products Section */}
                        <div style={{marginBottom: '30px'}}>
                          <h2 style={{
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#2d3748',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <span style={{
                              width: '4px',
                              height: '20px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: '2px'
                            }}></span>
                            Articles
                          </h2>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: '20px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}>
                            <thead>
                              <tr style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white'
                              }}>
                                <th style={{
                                  padding: '16px 20px',
                                  textAlign: 'left',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>Produit/Service</th>
                                <th style={{
                                  padding: '16px 20px',
                                  textAlign: 'left',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>Détails</th>
                                <th style={{
                                  padding: '16px 20px',
                                  textAlign: 'left',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>Quantité</th>
                                <th style={{
                                  padding: '16px 20px',
                                  textAlign: 'left',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>Prix unitaire</th>
                                <th style={{
                                  padding: '16px 20px',
                                  textAlign: 'left',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceItemsForPrint.map((item, index) => {
                                // If item has units (quantity >= 2), display each unit separately
                                if (item.units && item.units.length > 0) {
                                  return item.units.map((unit, unitIndex) => (
                                    <tr key={`${index}-${unitIndex}`} style={{
                                      borderBottom: '1px solid #e2e8f0',
                                      transition: 'background-color 0.2s ease'
                                    }}>
                                      <td style={{padding: '16px 20px', verticalAlign: 'top'}}>
                                        <div style={{
                                          fontWeight: 600,
                                          color: '#2d3748',
                                          marginBottom: '4px'
                                        }}>{item.product_name} - Unité {unitIndex + 1}</div>
                                      </td>
                                      <td style={{padding: '16px 20px', verticalAlign: 'top'}}>
                                        <div style={{
                                          fontSize: '14px',
                                          color: '#718096',
                                          lineHeight: '1.4'
                                        }}>
                                          {item.marque && <div><strong>Marque:</strong> {item.marque}</div>}
                                          {item.modele && <div><strong>Modèle:</strong> {item.modele}</div>}
                                          <div><strong>Couleur:</strong> {unit.color}</div>
                                          <div><strong>SN:</strong> {unit.imei}</div>
                                          {item.provenance && <div><strong>Provenance:</strong> {item.provenance}</div>}
                                        </div>
                                      </td>
                                      <td style={{padding: '16px 20px', verticalAlign: 'top'}}>
                                        <span style={{
                                          background: '#e6fffa',
                                          color: '#065f46',
                                          padding: '4px 8px',
                                          borderRadius: '12px',
                                          fontSize: '12px',
                                          fontWeight: 600,
                                          display: 'inline-block'
                                        }}>1</span>
                                      </td>
                                      <td style={{
                                        padding: '16px 20px',
                                        verticalAlign: 'top',
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        textAlign: 'right'
                                      }}>{item.unit_price.toLocaleString("fr-FR")} FCFA</td>
                                      <td style={{
                                        padding: '16px 20px',
                                        verticalAlign: 'top',
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        textAlign: 'right'
                                      }}>{item.unit_price.toLocaleString("fr-FR")} FCFA</td>
                                    </tr>
                                  ));
                                } else {
                                  // Original behavior for items without units
                                  return (
                                    <tr key={index} style={{
                                      borderBottom: '1px solid #e2e8f0',
                                      transition: 'background-color 0.2s ease'
                                    }}>
                                      <td style={{padding: '16px 20px', verticalAlign: 'top'}}>
                                        <div style={{
                                          fontWeight: 600,
                                          color: '#2d3748',
                                          marginBottom: '4px'
                                        }}>{item.product_name}</div>
                                      </td>
                                      <td style={{padding: '16px 20px', verticalAlign: 'top'}}>
                                        <div style={{
                                          fontSize: '14px',
                                          color: '#718096',
                                          lineHeight: '1.4'
                                        }}>
                                          {item.marque && <div><strong>Marque:</strong> {item.marque}</div>}
                                          {item.modele && <div><strong>Modèle:</strong> {item.modele}</div>}
                                          {item.imei && <div><strong>SN:</strong> {item.imei}</div>}
                                          {item.provenance && <div><strong>Provenance:</strong> {item.provenance}</div>}
                                        </div>
                                      </td>
                                      <td style={{padding: '16px 20px', verticalAlign: 'top'}}>
                                        <span style={{
                                          background: '#e6fffa',
                                          color: '#065f46',
                                          padding: '4px 8px',
                                          borderRadius: '12px',
                                          fontSize: '12px',
                                          fontWeight: 600,
                                          display: 'inline-block'
                                        }}>{item.quantity}</span>
                                      </td>
                                      <td style={{
                                        padding: '16px 20px',
                                        verticalAlign: 'top',
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        textAlign: 'right'
                                      }}>{item.unit_price.toLocaleString("fr-FR")} FCFA</td>
                                      <td style={{
                                        padding: '16px 20px',
                                        verticalAlign: 'top',
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        textAlign: 'right'
                                      }}>{(item.quantity * item.unit_price).toLocaleString("fr-FR")} FCFA</td>
                                    </tr>
                                  );
                                }
                              }).flat()}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals Section */}
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '24px',
                          marginTop: '30px'
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#2d3748',
                            marginBottom: '16px'
                          }}>Récapitulatif</h3>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid #e2e8f0'
                          }}>
                            <span style={{fontWeight: 500, color: '#4a5568'}}>Sous-total</span>
                            <span style={{fontWeight: 600, color: '#2d3748'}}>
                              {invoice.subtotal.toLocaleString("fr-FR")} FCFA
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid #e2e8f0'
                          }}>
                            <span style={{fontWeight: 500, color: '#4a5568'}}>
                              TVA ({invoice.tax_rate}%)
                            </span>
                            <span style={{fontWeight: 600, color: '#2d3748'}}>
                              {invoice.tax_amount.toLocaleString("fr-FR")} FCFA
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderTop: '2px solid #667eea',
                            paddingTop: '16px',
                            marginTop: '8px',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#667eea'
                          }}>
                            <span style={{fontWeight: 500, color: '#4a5568'}}>Total</span>
                            <span style={{fontWeight: 600, color: '#667eea'}}>
                              {invoice.total_amount.toLocaleString("fr-FR")} FCFA
                            </span>
                          </div>
                        </div>

                        {/* Notes Section */}
                        {invoice.notes && (
                          <div style={{
                            marginTop: '30px',
                            padding: '20px',
                            background: '#fef5e7',
                            borderRadius: '8px',
                            borderLeft: '4px solid #f59e0b'
                          }}>
                            <h3 style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#92400e',
                              marginBottom: '8px'
                            }}>Notes</h3>
                            <div style={{
                              color: '#78350f',
                              lineHeight: '1.6'
                            }}>{invoice.notes.replace(/\n/g, '<br>')}</div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{
                        background: '#1a202c',
                        color: 'white',
                        padding: '20px',
                        textAlign: 'center',
                        fontSize: '14px'
                      }}>
                        <p style={{marginBottom: '4px'}}>
                          <span style={{fontWeight: 600}}>{companySettings.nom_compagnie}</span>
                        </p>
                        <p>Merci pour votre confiance • Facture générée le {new Date().toLocaleDateString("fr-FR")}</p>
                        {companySettings.website && <p>{companySettings.website}</p>}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 lg:p-6 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              {companySettings.logo_url ? (
                <div className="relative flex-shrink-0">
                  <img
                    src={companySettings.logo_url || "/placeholder.svg"}
                    alt={`Logo de ${companySettings.nom_compagnie}`}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-md ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white" aria-label="Connecté"></div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-primary to-primary/80 p-2 sm:p-3 rounded-xl shadow-lg flex-shrink-0" aria-label="Logo par défaut">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                  {companySettings.nom_compagnie}
                </h1>
                {user && (
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 truncate">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" aria-label="Statut en ligne"></div>
                    <span className="truncate">Connecté en tant que {user.email}</span>
                  </p>
                )}
              </div>
            </div>
            <nav className="flex items-center space-x-4" role="navigation" aria-label="Navigation principale">
              <div className="hidden sm:flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>{user?.email}</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1" role="tablist" aria-label="Navigation principale">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("dashboard")}
                  className={`transition-all duration-200 rounded-full px-4 py-2 font-medium ${
                    activeTab === "dashboard"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
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
                  className={`transition-all duration-200 rounded-full px-4 py-2 font-medium ${
                    activeTab === "ventes"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
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
                  className={`transition-all duration-200 rounded-full px-4 py-2 font-medium ${
                    activeTab === "stock"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
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
                  className={`transition-all duration-200 rounded-full px-4 py-2 font-medium ${
                    activeTab === "factures"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
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
                  className={`transition-all duration-200 rounded-full px-4 py-2 font-medium ${
                    activeTab === "settings"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                  aria-selected={activeTab === "settings"}
                  role="tab"
                  aria-controls="settings-panel"
                  id="settings-tab"
                >
                  <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                  Paramètres
                </Button>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-full px-4 py-2 font-medium"
                  aria-label="Se déconnecter"
                >
                  Se déconnecter
                </Button>
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2"
                  aria-label="Menu mobile"
                >
                  {isMobileMenuOpen ? (
                    <CloseIcon className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </nav>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-lg z-50 animate-in slide-in-from-top-2 duration-300">
                <div className="px-4 py-6 space-y-4">
                  {/* Mobile Admin Info */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground pb-4 border-b border-slate-200 dark:border-slate-700">
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span>{user?.email}</span>
                  </div>

                  {/* Mobile Navigation Buttons */}
                  <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="Navigation mobile">
                    <Button
                      variant={activeTab === "dashboard" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setActiveTab("dashboard")
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex flex-col items-center justify-center h-16 space-y-1 ${
                        activeTab === "dashboard"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          : "hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      }`}
                      aria-selected={activeTab === "dashboard"}
                      role="tab"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-xs">Dashboard</span>
                    </Button>

                    <Button
                      variant={activeTab === "ventes" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setActiveTab("ventes")
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex flex-col items-center justify-center h-16 space-y-1 ${
                        activeTab === "ventes"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                          : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      }`}
                      aria-selected={activeTab === "ventes"}
                      role="tab"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span className="text-xs">Ventes</span>
                    </Button>

                    <Button
                      variant={activeTab === "stock" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setActiveTab("stock")
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex flex-col items-center justify-center h-16 space-y-1 ${
                        activeTab === "stock"
                          ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                          : "hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      }`}
                      aria-selected={activeTab === "stock"}
                      role="tab"
                    >
                      <Package className="w-5 h-5" />
                      <span className="text-xs">Stock</span>
                    </Button>

                    <Button
                      variant={activeTab === "factures" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setActiveTab("factures")
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex flex-col items-center justify-center h-16 space-y-1 ${
                        activeTab === "factures"
                          ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white"
                          : "hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      }`}
                      aria-selected={activeTab === "factures"}
                      role="tab"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="text-xs">Factures</span>
                    </Button>

                    <Button
                      variant={activeTab === "settings" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setActiveTab("settings")
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex flex-col items-center justify-center h-16 space-y-1 ${
                        activeTab === "settings"
                          ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900/20"
                      }`}
                      aria-selected={activeTab === "settings"}
                      role="tab"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="text-xs">Paramètres</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex flex-col items-center justify-center h-16 space-y-1 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                      aria-label="Se déconnecter"
                    >
                      <CloseIcon className="w-5 h-5" />
                      <span className="text-xs">Déconnexion</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" role="main">
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
              salesFilter={salesFilter}
              onSalesFilterChange={setSalesFilter}
            />
          </div>
        ) : activeTab === "ventes" ? (
          <div role="tabpanel" id="ventes-panel" aria-labelledby="ventes-tab">
            <SalesView
              ventes={ventes}
              filteredVentes={filteredVentes}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              paymentStatusFilter={salesFilter}
              setPaymentStatusFilter={setSalesFilter}
              handleDeleteSale={handleDeleteSale}
              handleBulkDeleteSales={handleBulkDeleteSales}
              products={products}
            />
          </div>
        ) : activeTab === "stock" ? (
          <div role="tabpanel" id="stock-panel" aria-labelledby="stock-tab">
            <StockView
              products={products}
              setProducts={setProducts}
              user={user}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        ) : activeTab === "factures" ? ( // Adding factures tab condition
          <div role="tabpanel" id="factures-panel" aria-labelledby="factures-tab">
            <InvoicesView
              invoices={filteredInvoices}
              showAddInvoiceForm={showAddInvoiceForm}
              setShowAddInvoiceForm={setShowAddInvoiceForm}
              editingInvoiceId={editingInvoiceId}
              onEditInvoice={handleEditInvoice}
              invoiceFormData={invoiceFormData}
              handleInvoiceFormChange={handleInvoiceFormChange}
              invoiceItems={invoiceItems}
              handleInvoiceItemChange={handleInvoiceItemChange}
              handleInvoiceItemUnitChange={handleInvoiceItemUnitChange}
              addInvoiceItem={addInvoiceItem}
              removeInvoiceItem={removeInvoiceItem}
              handleAddInvoice={handleAddInvoice}
              resetInvoiceForm={resetInvoiceForm}
              printInvoice={previewInvoice}
              handleDeleteInvoice={handleDeleteInvoice}
              handleBulkDeleteInvoices={handleBulkDeleteInvoices}
              isSubmitting={isSubmittingInvoice}
              products={products}
              onProductSelect={handleProductSelect}
              invoiceSearchTerm={invoiceSearchTerm}
              setInvoiceSearchTerm={setInvoiceSearchTerm}
              invoiceStatusFilter={invoiceStatusFilter}
              setInvoiceStatusFilter={setInvoiceStatusFilter}
            />
          </div>
        ) : (
          <div role="tabpanel" id="settings-panel" aria-labelledby="settings-tab">
            <SettingsView
              companySettings={{
                companyName: companySettings.nom_compagnie,
                adminName: companySettings.nom_admin,
                logoUrl: companySettings.logo_url || "",
                email: companySettings.email,
                phone: companySettings.phone,
                address: companySettings.address,
                website: companySettings.website,
                taxId: companySettings.tax_id,
                currency: companySettings.currency,
                language: companySettings.language,
                timezone: companySettings.timezone,
              }}
              isEditingSettings={isEditingSettings}
              setIsEditingSettings={setIsEditingSettings}
              tempSettings={{
                companyName: tempSettings.nom_compagnie,
                adminName: tempSettings.nom_admin,
                logoUrl: tempSettings.logo_url || "",
                email: tempSettings.email,
                phone: tempSettings.phone,
                address: tempSettings.address,
                website: tempSettings.website,
                taxId: tempSettings.tax_id,
                currency: tempSettings.currency,
                language: tempSettings.language,
                timezone: tempSettings.timezone,
              }}
              setTempSettings={(settings) => setTempSettings({
                id: tempSettings.id,
                nom_compagnie: settings.companyName,
                nom_admin: settings.adminName,
                logo_url: settings.logoUrl || "",
                email: settings.email,
                phone: settings.phone,
                address: settings.address,
                website: settings.website,
                tax_id: settings.taxId,
                currency: settings.currency,
                language: settings.language,
                timezone: settings.timezone,
              })}
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
