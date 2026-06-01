import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  initializeData,
  getUsers,
  setCurrentUser,
} from "../utils/storage";
import { initializeExtendedData } from "../utils/storageExtended";
import { logLogin } from "../utils/auditLogger";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import senacLogo from "../../imports/Senac_logo.svg.png";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeData();
    initializeExtendedData();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Email inválido");
      return;
    }

    if (!password) {
      toast.error("Digite sua senha");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = getUsers();
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        setCurrentUser(user);
        toast.success(`Bem-vindo, ${user.name}!`);
        logLogin(user.id, user.name, user.email);
        navigate("/");
      } else {
        toast.error("Email ou senha incorretos");
      }
      setIsLoading(false);
    }, 500);
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src={senacLogo} alt="SENAC Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2">SIGE</h1>
          <p className="text-gray-600 dark:text-gray-400">Sistema de Gerenciamento de Estoque</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-300 dark:border-zinc-800 shadow-lg overflow-hidden">
          <div className="p-8">
            {/* LOGIN */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="pt-4 border-t border-gray-300 dark:border-zinc-700 space-y-2">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
                    <strong>Administrador:</strong> admin@sige.com / admin123
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <p className="text-xs text-green-800 dark:text-green-200 text-center">
                    <strong>Visualizador:</strong> visualizador@sige.com / visualizador123
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}