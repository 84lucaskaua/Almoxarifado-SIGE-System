import { usePinConfirmation } from "../hooks/usePinConfirmation";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";

export default function TestPinSystem() {
  const { requestConfirmation, PinConfirmationDialog } = usePinConfirmation();

  const handleTestNormal = () => {
    console.log("🔵 Solicitando confirmação NORMAL");
    requestConfirmation({
      action: "Teste Normal",
      actionDescription: "Esta é uma ação de teste normal para verificar o sistema de PIN.",
      variant: "normal",
      onConfirm: () => {
        console.log("✅ Ação NORMAL confirmada!");
        toast.success("Teste normal executado com sucesso!");
      },
    });
  };

  const handleTestWarning = () => {
    console.log("🟡 Solicitando confirmação WARNING");
    requestConfirmation({
      action: "Teste Aviso",
      actionDescription: "Esta é uma ação de teste com aviso para verificar o sistema de PIN.",
      variant: "warning",
      onConfirm: () => {
        console.log("✅ Ação WARNING confirmada!");
        toast.success("Teste aviso executado com sucesso!");
      },
    });
  };

  const handleTestDanger = () => {
    console.log("🔴 Solicitando confirmação DANGER");
    requestConfirmation({
      action: "Teste Perigo",
      actionDescription: "Esta é uma ação de teste perigosa para verificar o sistema de PIN.",
      variant: "danger",
      onConfirm: () => {
        console.log("✅ Ação DANGER confirmada!");
        toast.success("Teste perigo executado com sucesso!");
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Teste do Sistema PIN</h1>
        <p className="text-gray-400">
          PIN padrão: <strong className="text-blue-400">1234</strong>
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white mb-4">
          Testes de Confirmação em 2 Etapas
        </h2>

        <div className="space-y-3">
          <Button
            onClick={handleTestNormal}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Testar Confirmação Normal (Azul)
          </Button>

          <Button
            onClick={handleTestWarning}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            Testar Confirmação Aviso (Amarelo)
          </Button>

          <Button
            onClick={handleTestDanger}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Testar Confirmação Perigo (Vermelho)
          </Button>
        </div>

        <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
          <h3 className="font-semibold text-white mb-2">Instruções:</h3>
          <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1">
            <li>Clique em um dos botões acima</li>
            <li>Na Etapa 1, clique em "Confirmar e Prosseguir"</li>
            <li>Na Etapa 2, digite o PIN: <strong className="text-blue-400">1234</strong></li>
            <li>Clique em "Confirmar com PIN"</li>
            <li>Veja a mensagem de sucesso aparecer</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-blue-950 rounded-lg border border-blue-900">
          <p className="text-sm text-blue-200">
            💡 <strong>Dica:</strong> Abra o console do navegador (F12) para ver os logs de debug
            e verificar o fluxo de execução.
          </p>
        </div>
      </Card>

      <PinConfirmationDialog />
    </div>
  );
}
