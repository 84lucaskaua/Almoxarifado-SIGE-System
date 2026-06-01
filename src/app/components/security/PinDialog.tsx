import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Shield, AlertTriangle, Lock } from "lucide-react";

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string;
  actionDescription: string;
  variant?: "danger" | "warning" | "normal";
}

export function PinDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  actionDescription,
  variant = "normal",
}: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"confirm" | "pin">("confirm");
  const inputRef = useRef<HTMLInputElement>(null);

  // PIN padrão do sistema (pode ser configurado)
  const SYSTEM_PIN = localStorage.getItem("sige_system_pin") || "1234";

  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setPin("");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && step === "pin") {
      inputRef.current?.focus();
    }
  }, [isOpen, step]);

  const handleClose = () => {
    setPin("");
    setError("");
    setStep("confirm");
    onClose();
  };

  const handleConfirmStep = () => {
    setStep("pin");
    setError("");
  };

  const handlePinSubmit = () => {
    if (pin === SYSTEM_PIN) {
      setPin("");
      setError("");
      setStep("confirm");
      onConfirm();
      onClose();
    } else {
      setError("PIN incorreto. Tente novamente.");
      setPin("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "confirm") {
        handleConfirmStep();
      } else {
        handlePinSubmit();
      }
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-600 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-950",
          border: "border-red-200 dark:border-red-900",
          text: "text-red-800 dark:text-red-200",
        };
      case "warning":
        return {
          icon: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-950",
          border: "border-amber-200 dark:border-amber-900",
          text: "text-amber-800 dark:text-amber-200",
        };
      default:
        return {
          icon: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-950",
          border: "border-blue-200 dark:border-blue-900",
          text: "text-blue-800 dark:text-blue-200",
        };
    }
  };

  const colors = getVariantColor();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 max-w-md"
        onKeyDown={handleKeyPress}
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className={colors.icon} />
            Confirmação de Segurança
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Esta ação requer confirmação em 2 etapas
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" ? (
          <div className="space-y-6 py-4">
            <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
              <div className="flex items-start gap-3">
                {variant === "danger" ? (
                  <AlertTriangle size={24} className={colors.icon} />
                ) : (
                  <Shield size={24} className={colors.icon} />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${colors.text}`}>
                    {action}
                  </h4>
                  <p className={`text-sm ${colors.text}`}>
                    {actionDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} className="text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Etapa 1 de 2: Confirmação
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Você está prestes a realizar uma ação que afeta o sistema. 
                Confirme para prosseguir para a etapa de verificação PIN.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmStep}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Confirmar e Prosseguir
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} className="text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Etapa 2 de 2: Verificação PIN
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Digite o PIN de segurança para confirmar esta ação.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                  PIN de Segurança
                </label>
                <Input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/[^0-9]/g, ""));
                    setError("");
                  }}
                  placeholder="Digite o PIN (padrão: 1234)"
                  className="text-center text-2xl tracking-widest font-mono bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700"
                />
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {error}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-900">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💡 <strong>PIN padrão:</strong> 1234
                  <br />
                  Você pode alterar o PIN nas configurações do sistema.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePinSubmit}
                disabled={pin.length < 4}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar com PIN
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}