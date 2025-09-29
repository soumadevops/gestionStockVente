"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { LoadingPage } from "@/components/ui/loading"
import type { Sale, Product, CompanySettings } from "@/lib/types"

export default function DashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [ventes, setVentes] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
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

  const supabase = createClient()

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
    const loadDashboardData = async () => {
      if (!user) return

      try {
        setLoading(true)

        const [salesResponse, productsResponse, settingsResponse] = await Promise.all([
          supabase.from("sales").select("*, invoices(invoice_number, status, payment_status)").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("company_settings").select("*").limit(1).single(),
        ])

        if (salesResponse.error && salesResponse.error.code !== "42P01") {
          throw salesResponse.error
        }
        setVentes(salesResponse.data || [])

        if (productsResponse.error && productsResponse.error.code !== "42P01") {
          throw productsResponse.error
        }
        setProducts(productsResponse.data || [])

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
        }
      } catch (err) {
        console.error("[Dashboard] Error loading data:", err)
        // Error handling removed - app continues with empty data
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Calculate dashboard metrics
  const totalVentes = ventes.length
  const totalRevenue = ventes.reduce((sum, vente) => sum + vente.prix, 0)
  const totalStock = products.reduce((sum, product) => sum + product.quantite_stock, 0)
  const lowStockProducts = products.filter((product) => product.quantite_stock <= 5).length

  if (loading) {
    return <LoadingPage message="Chargement du tableau de bord..." />
  }

  return (
    <DashboardView
      totalVentes={totalVentes}
      totalRevenue={totalRevenue}
      totalStock={totalStock}
      lowStockProducts={lowStockProducts}
      ventes={ventes}
      products={products}
      companySettings={companySettings}
    />
  )
}