"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { StockView } from "@/components/stock/stock-view"
import { LoadingPage } from "@/components/ui/loading"
import type { Product } from "@/lib/types"

export default function StockPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")

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
    const loadProductsData = async () => {
      if (!user) return

      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error && error.code !== "42P01") {
          throw error
        }

        setProducts(data || [])
      } catch (err) {
        console.error("[Stock] Error loading data:", err)
        // Error handling removed - app continues with empty data
      } finally {
        setLoading(false)
      }
    }

    loadProductsData()
  }, [user])

  if (loading) {
    return <LoadingPage message="Chargement du stock..." />
  }

  return (
    <StockView
      products={products}
      setProducts={setProducts}
      user={user}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  )
}