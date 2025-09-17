"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  subMessage?: string
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "SUCCESS",
  message = "Opération réussie!",
  subMessage = "Votre demande a été traitée avec succès.",
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-xl font-semibold text-green-600 tracking-wide">{title}</h2>

          <div className="space-y-2">
            <p className="text-gray-900 font-medium">{message}</p>
            <p className="text-gray-600 text-sm">{subMessage}</p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-8 rounded-md mt-6"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
