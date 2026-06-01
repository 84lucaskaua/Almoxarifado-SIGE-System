import { useState } from "react";
import { PinDialog } from "../components/security/PinDialog";

interface PinConfirmationOptions {
  action: string;
  actionDescription: string;
  variant?: "danger" | "warning" | "normal";
  onConfirm: () => void;
}

export function usePinConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<PinConfirmationOptions | null>(null);

  const requestConfirmation = (options: PinConfirmationOptions) => {
    setCurrentAction(options);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (currentAction) {
      currentAction.onConfirm();
    }
    setIsOpen(false);
    setCurrentAction(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentAction(null);
  };

  const PinConfirmationDialog = () => {
    return (
      <PinDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        action={currentAction?.action || ""}
        actionDescription={currentAction?.actionDescription || ""}
        variant={currentAction?.variant}
      />
    );
  };

  return {
    requestConfirmation,
    PinConfirmationDialog,
  };
}