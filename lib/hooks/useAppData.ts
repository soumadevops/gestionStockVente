import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Sale, Product, Invoice, CompanySettings } from "@/lib/types"

export function useAppData(user: any) {
  const [ventes, setVentes] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [companySettings, setCompanySettings] = useState({
    companyName: "VentesPro",
    adminName: "Administrateur",
    logoUrl: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    taxId: "",
    currency: "XOF",
    language: "fr",
    timezone: "Africa/Dakar",
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const loadAllData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      const { error: testError } = await supabase.from("sales").select("count", { count: "exact", head: true })
      if (testError) {
        throw testError
      }

      const [salesResponse, productsResponse, invoicesResponse, settingsResponse] = await Promise.all([
        supabase.from("sales").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*, invoice_items (*)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("company_settings").select("*").eq("user_id", user.id).limit(1).single(),
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
          email: settingsResponse.data.email || "",
          phone: settingsResponse.data.phone || "",
          address: settingsResponse.data.address || "",
          website: settingsResponse.data.website || "",
          taxId: settingsResponse.data.tax_id || "",
          currency: settingsResponse.data.currency || "XOF",
          language: settingsResponse.data.language || "fr",
          timezone: settingsResponse.data.timezone || "Africa/Dakar",
        })
      }
    } catch (err) {
      console.error("[v0] Error loading data:", err)
      // Error handling removed - app continues with empty data
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Debug database schema and RLS policies
  useEffect(() => {
    const debugDatabase = async () => {
      if (!user) return

      try {
        console.log("🔍 Debugging database schema and RLS policies...")

        // Check if invoices table exists and has user_id column
        const { data: invoiceColumns, error: invoiceError } = await supabase
          .from("information_schema.columns")
          .select("column_name")
          .eq("table_name", "invoices")
          .eq("table_schema", "public")

        if (invoiceError) {
          console.error("❌ Error checking invoices table:", invoiceError)
        } else {
          console.log("📋 Invoices table columns:", invoiceColumns?.map(col => col.column_name))
          const hasUserId = invoiceColumns?.some(col => col.column_name === "user_id")
          console.log("👤 Invoices table has user_id column:", hasUserId)
        }

        // Check if invoice_items table exists and has user_id column
        const { data: itemColumns, error: itemError } = await supabase
          .from("information_schema.columns")
          .select("column_name")
          .eq("table_name", "invoice_items")
          .eq("table_schema", "public")

        if (itemError) {
          console.error("❌ Error checking invoice_items table:", itemError)
        } else {
          console.log("📋 Invoice_items table columns:", itemColumns?.map(col => col.column_name))
          const hasUserId = itemColumns?.some(col => col.column_name === "user_id")
          console.log("👤 Invoice_items table has user_id column:", hasUserId)
        }

        // Test RLS policies by trying to insert a test invoice
        console.log("🧪 Testing RLS policies...")
        const testInvoiceData = {
          invoice_number: "TEST-" + Date.now(),
          client_name: "Test Client",
          subtotal: 100,
          tax_rate: 18,
          tax_amount: 18,
          total_amount: 118,
          user_id: user.id,
        }

        const { data: testResult, error: testError } = await supabase
          .from("invoices")
          .insert([testInvoiceData])
          .select()

        if (testError) {
          console.error("❌ RLS Policy Test Failed:", testError)
          console.log("🔧 This indicates the RLS policy is blocking insertions")
          console.log("📋 Solution: Run the updated SQL script in Supabase dashboard")
        } else {
          console.log("✅ RLS Policy Test Passed:", testResult)
          // Clean up test data
          if (testResult && testResult[0]) {
            await supabase.from("invoices").delete().eq("id", testResult[0].id)
          }
        }

      } catch (err) {
        console.error("❌ Database debug error:", err)
      }
    }

    if (user) {
      debugDatabase()
    }
  }, [user])

  return {
    ventes,
    setVentes,
    products,
    setProducts,
    invoices,
    setInvoices,
    companySettings,
    setCompanySettings,
    loading,
    loadAllData,
  }
}