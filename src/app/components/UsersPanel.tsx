import { useState, useEffect } from "react";
import { getUsers, saveUsers, User } from "../utils/storage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if email already exists (except when editing the same user)
    const emailExists = users.some(
      (u) => u.email === formData.email && u.id !== editingUser?.id
    );

    if (emailExists) {
      toast.error("Este email já está cadastrado!");
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              password: formData.password || u.password, // Only update password if provided
              role: formData.role,
            }
          : u
      );
      saveUsers(updatedUsers);
      toast.success("Usuário atualizado com sucesso!");
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);
      toast.success("Usuário cadastrado com sucesso!");
    }

    loadUsers();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't show password
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    
    // Prevent deleting the only admin
    if (userToDelete?.role === "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        toast.error("Não é possível excluir o único administrador!");
        return;
      }
    }

    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      saveUsers(updatedUsers);
      loadUsers();
      toast.success("Usuário excluído com sucesso!");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Usuários</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Cadastre e gerencie usuários do sistema
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                {editingUser ? "Editar Usuário" : "Cadastrar Novo Usuário"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Preencha os dados do usuário abaixo
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  placeholder="Nome do usuário"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  placeholder="usuario@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Senha {editingUser && "(deixe em branco para manter)"}*
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingUser}
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300">
                  Tipo de Usuário *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
                    <SelectItem value="user" className="text-gray-900 dark:text-white">Usuário</SelectItem>
                    <SelectItem value="admin" className="text-gray-900 dark:text-white">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {editingUser ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:!bg-gray-200 dark:hover:!bg-zinc-700 hover:!text-gray-900 dark:hover:!text-white text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          size={18}
        />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-300 dark:border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-300 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800/50">
              <TableHead className="text-gray-700 dark:text-gray-400">Nome</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-400">Email</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-400">Tipo</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-400">Data de Cadastro</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-600 dark:text-gray-500 py-8"
                >
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-gray-300 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.role === "admin"
                          ? "bg-blue-900 text-blue-100"
                          : "bg-zinc-700 text-gray-300"
                      }
                    >
                      {user.role === "admin" ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        className="border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user.id)}
                        className="border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total de Usuários</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Administradores</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
      </div>
    </div>
  );
}