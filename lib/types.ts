export interface Sale {
    id: string
    nom_prenom_client: string
    numero_telephone: string
    date_vente: string
    nom_produit?: string
    modele: string
    marque: string
    imei_telephone: string
    prix: number
    created_at?: string
    updated_at?: string
    invoice?: {
      invoice_number: string
      status: string
      payment_status: string
    }
  }

export interface Product {
  id: string
  nom_produit: string
  marque: string
  couleur: string
  prix_unitaire: number
  quantite_stock: number
  description?: string
  photo_url?: string
  imei_telephone?: string
  provenance?: string
  created_at?: string
  updated_at?: string
}

export interface Provenance {
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

export interface CompanySettings {
  id: string
  nom_compagnie: string
  nom_admin: string
  logo_url?: string
  email: string
  phone: string
  address: string
  website: string
  tax_id: string
  currency: string
  language: string
  timezone: string
  created_at?: string
  updated_at?: string
}

export interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  autoBackup: boolean
  twoFactorAuth: boolean
  dataExport: boolean
}

export interface Invoice {
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
  status: "draft" | "sent" | "paid" | "overdue" | "unpaid" | "refunded"
  payment_status: "unpaid" | "paid" | "refunded"
  notes?: string
  created_at: string
  updated_at: string
  invoice_items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_name: string
  imei?: string
  marque?: string
  modele?: string
  provenance?: string
  quantity: number
  unit_price: number
  total_price: number
  units?: Array<{
    color: string
    imei: string
  }>
}

export interface FormData {
  nom_prenom_client: string
  numero_telephone: string
  date_vente: string
  modele: string
  marque: string
  imei_telephone: string
  prix: string
}

export interface ProductFormData {
  nom_produit: string
  marque: string
  couleur: string
  prix_unitaire: string
  quantite_stock: string
  description: string
  imei_telephone: string
  provenance: string
}

export interface InvoiceFormData {
  client_name: string
  client_email: string
  client_phone: string
  client_address: string
  due_date: string
  tax_rate: string
  payment_status: "unpaid" | "paid" | "refunded"
  notes: string
}

export interface InvoiceItemFormData {
  product_name: string
  imei?: string
  marque?: string
  modele?: string
  provenance?: string
  quantity: number
  unit_price: number
  units?: Array<{
    color: string
    imei: string
  }>
}

export interface SuccessModalState {
  isOpen: boolean
  message: string
  subMessage: string
}