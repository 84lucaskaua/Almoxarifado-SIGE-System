import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Camera, User as UserIcon, Mail, Lock } from "lucide-react";
import { getCurrentUser, setCurrentUser, type User } from "../../utils/storage";
import { logProfileUpdate } from "../../utils/auditLogger";
import { toast } from "sonner";

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProfileEditor({ isOpen, onClose, onUpdate }: ProfileEditorProps) {
  const currentUser = getCurrentUser();
  const [name, setName] = useState(currentUser?.name || "");
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState(currentUser?.profileImage || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida");
        return;
      }

      // Validar tamanho (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setProfileImage(url);
    setImagePreview(url);
  };

  const handleSave = () => {
    // Validações
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }

    // Validar alteração de senha se algum campo foi preenchido
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        toast.error("Digite sua senha atual para alterá-la");
        return;
      }

      if (currentPassword !== currentUser.password) {
        toast.error("Senha atual incorreta");
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        toast.error("A nova senha deve ter no mínimo 6 caracteres");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
    }

    // Atualizar usuário
    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      profileImage: profileImage || undefined,
      password: newPassword || currentUser.password,
    };

    // Atualizar no localStorage
    setCurrentUser(updatedUser);

    // Atualizar na lista de usuários
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem("users", JSON.stringify(users));
    }

    // Log da atividade
    const changes: string[] = [];
    if (name !== currentUser.name) changes.push("nome");
    if (profileImage !== currentUser.profileImage) changes.push("foto de perfil");
    if (newPassword) changes.push("senha");

    if (changes.length > 0) {
      logProfileUpdate(
        currentUser.id,
        currentUser.name,
        changes.join(", ")
      );
    }

    toast.success("Perfil atualizado com sucesso!");
    onUpdate();
    onClose();
    
    // Forçar reload da página para atualizar as informações do usuário em todos os componentes
    window.location.reload();
  };

  const handleRemoveImage = () => {
    setProfileImage("");
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Editar Perfil
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Atualize suas informações pessoais e configurações de conta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={40} className="text-gray-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              >
                <Camera size={16} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-gray-300 dark:border-zinc-700"
              >
                Enviar Imagem
              </Button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="border-gray-300 dark:border-zinc-700 text-red-600 hover:text-red-700"
                >
                  Remover
                </Button>
              )}
            </div>
          </div>

          {/* URL da Imagem */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-gray-900 dark:text-white">
              Ou use URL da imagem
            </Label>
            <Input
              id="imageUrl"
              type="url"
              value={profileImage}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            />
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900 dark:text-white flex items-center gap-2">
              <UserIcon size={16} />
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            />
          </div>

          {/* Email (somente leitura) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900 dark:text-white flex items-center gap-2">
              <Mail size={16} />
              Email
            </Label>
            <Input
              id="email"
              value={currentUser.email}
              disabled
              className="border-gray-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 opacity-60"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              O email não pode ser alterado
            </p>
          </div>

          {/* Alteração de Senha */}
          <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock size={16} />
              Alterar Senha (opcional)
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-900 dark:text-white">
                  Senha Atual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-900 dark:text-white">
                  Nova Senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 dark:border-zinc-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}