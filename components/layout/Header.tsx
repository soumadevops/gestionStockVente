import { Button } from "@/components/ui/button"
import {
  BarChart3,
  ShoppingCart,
  Package,
  FileText,
  Settings,
  Smartphone,
  Menu,
  X as CloseIcon,
} from "lucide-react"
import type { CompanySettings } from "@/lib/types"

interface HeaderProps {
  companySettings: {
    companyName: string
    logoUrl: string
  }
  user: any
  activeTab: string
  setActiveTab: (tab: string) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  handleLogout: () => void
}

export function Header({
  companySettings,
  user,
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-pink-600/10 border-b border-slate-200/50 dark:border-slate-700/50 shadow-xl backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            {companySettings.logoUrl ? (
              <div className="relative flex-shrink-0">
                <img
                  src={companySettings.logoUrl || "/placeholder.svg"}
                  alt={`Logo de ${companySettings.companyName}`}
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
                {companySettings.companyName}
              </h1>
            </div>
          </div>
          <nav className="flex items-center space-x-4" role="navigation" aria-label="Navigation principale">

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-2" role="tablist" aria-label="Onglets de navigation">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("dashboard")}
                className={`transition-all duration-300 hover:scale-105 rounded-full px-6 py-2 ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg ring-2 ring-indigo-500/30 hover:shadow-xl"
                    : "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
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
                className={`transition-all duration-300 hover:scale-105 rounded-full px-6 py-2 ${
                  activeTab === "ventes"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-2 ring-emerald-500/30 hover:shadow-xl"
                    : "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
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
                className={`transition-all duration-300 hover:scale-105 rounded-full px-6 py-2 ${
                  activeTab === "stock"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg ring-2 ring-amber-500/30 hover:shadow-xl"
                    : "hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 hover:text-amber-600 dark:hover:text-amber-400"
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
                className={`transition-all duration-300 hover:scale-105 rounded-full px-6 py-2 ${
                  activeTab === "factures"
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg ring-2 ring-rose-500/30 hover:shadow-xl"
                    : "hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 dark:hover:from-rose-900/20 dark:hover:to-pink-900/20 hover:text-rose-600 dark:hover:text-rose-400"
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
                className={`transition-all duration-300 hover:scale-105 rounded-full px-6 py-2 ${
                  activeTab === "settings"
                    ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg ring-2 ring-slate-500/30 hover:shadow-xl"
                    : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-900/20 dark:hover:to-gray-900/20 hover:text-slate-600 dark:hover:text-slate-400"
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
            <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-lg z-50">
              <div className="px-4 py-6 space-y-4">

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
  )
}