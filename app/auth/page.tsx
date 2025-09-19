"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SuccessModal } from "@/components/success-modal"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
    subMessage: "",
  })
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push("/")
      }
    }
    checkUser()
  }, [supabase.auth, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) {
        setError(error.message)
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans votre application!",
        })
        router.push("/")
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (signupData.password !== signupData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccessModal({
          isOpen: true,
          message: "Inscription réussie!",
          subMessage: "Vérifiez votre email pour confirmer votre compte",
        })
        setActiveTab("login")
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: "", subMessage: "" })}
        message={successModal.message}
        subMessage={successModal.subMessage}
      />
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Gestion Stock Vente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Se connecter</TabsTrigger>
              <TabsTrigger value="signup">S'inscrire</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-card-foreground">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="bg-input border-border text-card-foreground"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-card-foreground">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="bg-input border-border text-card-foreground pr-10"
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email" className="text-card-foreground">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    className="bg-input border-border text-card-foreground"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password" className="text-card-foreground">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      className="bg-input border-border text-card-foreground pr-10"
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-confirm-password" className="text-card-foreground">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    className="bg-input border-border text-card-foreground"
                    placeholder="Confirmer votre mot de passe"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
