import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  ChefHat,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Shield,
  Plus,
  FileText,
  Search,
  Activity,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import {
  getRecipes,
  createRecipe,
  getQualityChecks,
  createQualityCheck,
  type Recipe,
  type QualityCheck,
} from "../../utils/storageExtended";
import { getBatchItems } from "../../utils/storage";

type ActiveTab = "recipes" | "quality" | "traceability";

export function HealthGastronomy() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("recipes");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [isQualityDialogOpen, setIsQualityDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");

  const [recipeForm, setRecipeForm] = useState({
    name: "",
    description: "",
    category: "",
    yield: 0,
    yieldUnit: "",
    prepTime: 0,
    cookTime: 0,
    instructions: "",
  });

  const [qualityForm, setQualityForm] = useState({
    temperature: 0,
    temperatureUnit: "C" as "C" | "F",
    visualInspection: true,
    packagingIntact: true,
    approved: true,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecipes(getRecipes());
    setQualityChecks(getQualityChecks());
  };

  const handleCreateRecipe = () => {
    if (!recipeForm.name || !recipeForm.yieldUnit) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createRecipe({
      ...recipeForm,
      ingredients: [],
    });

    toast.success("Receita criada com sucesso!");
    setIsRecipeDialogOpen(false);
    setRecipeForm({
      name: "",
      description: "",
      category: "",
      yield: 0,
      yieldUnit: "",
      prepTime: 0,
      cookTime: 0,
      instructions: "",
    });
    loadData();
  };

  const handleCreateQualityCheck = () => {
    if (!selectedItem) {
      toast.error("Selecione um item para inspecionar");
      return;
    }

    createQualityCheck({
      batchItemId: selectedItem,
      checkDate: new Date().toISOString(),
      ...qualityForm,
    });

    toast.success(
      qualityForm.approved
        ? "Item aprovado no controle de qualidade"
        : "Item reprovado no controle de qualidade"
    );

    setIsQualityDialogOpen(false);
    setQualityForm({
      temperature: 0,
      temperatureUnit: "C",
      visualInspection: true,
      packagingIntact: true,
      approved: true,
      notes: "",
    });
    setSelectedItem("");
    loadData();
  };

  const items = getBatchItems();

  const stats = {
    recipes: recipes.length,
    qualityChecks: qualityChecks.length,
    approved: qualityChecks.filter((q) => q.approved).length,
    rejected: qualityChecks.filter((q) => !q.approved).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gastronomia & Saúde
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Receitas, controle de qualidade e rastreabilidade sanitária
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <ChefHat size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receitas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recipes}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inspeções</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.qualityChecks}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-green-500 dark:border-green-700 border-l-4 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aprovados</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.approved}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-red-500 dark:border-red-700 border-l-4 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reprovados</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.rejected}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-300 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab("recipes")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "recipes"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <ChefHat size={16} className="inline mr-2" />
          Receitas
        </button>
        <button
          onClick={() => setActiveTab("quality")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "quality"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Shield size={16} className="inline mr-2" />
          Controle de Qualidade
        </button>
        <button
          onClick={() => setActiveTab("traceability")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "traceability"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Activity size={16} className="inline mr-2" />
          Rastreabilidade
        </button>
      </div>

      {/* RECEITAS */}
      {activeTab === "recipes" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Receitas Cadastradas</h3>
            <Button
              onClick={() => setIsRecipeDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus size={16} />
              Nova Receita
            </Button>
          </div>

          {recipes.length === 0 ? (
            <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-12 text-center">
              <ChefHat size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma receita cadastrada
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comece criando sua primeira receita
              </p>
              <Button
                onClick={() => setIsRecipeDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus size={16} />
                Criar Receita
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{recipe.name}</h4>
                    {recipe.category && (
                      <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                        {recipe.category}
                      </Badge>
                    )}
                  </div>

                  {recipe.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-200 dark:border-zinc-700 pt-3">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Rendimento</p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {recipe.yield} {recipe.yieldUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Tempo Total</p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)}min
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTROLE DE QUALIDADE */}
      {activeTab === "quality" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Inspeções de Qualidade
            </h3>
            <Button
              onClick={() => setIsQualityDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus size={16} />
              Nova Inspeção
            </Button>
          </div>

          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Temperatura
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Visual
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Embalagem
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Responsável
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {qualityChecks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        <Shield size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Nenhuma inspeção realizada</p>
                      </td>
                    </tr>
                  ) : (
                    qualityChecks.slice(0, 20).map((check) => (
                      <tr
                        key={check.id}
                        className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {new Date(check.checkDate).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {check.temperature ? (
                            <div className="flex items-center gap-1">
                              <Thermometer size={14} />
                              {check.temperature}°{check.temperatureUnit}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {check.visualInspection ? (
                            <CheckCircle size={16} className="mx-auto text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertTriangle size={16} className="mx-auto text-red-600 dark:text-red-400" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {check.packagingIntact ? (
                            <CheckCircle size={16} className="mx-auto text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertTriangle size={16} className="mx-auto text-red-600 dark:text-red-400" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={
                              check.approved
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            }
                          >
                            {check.approved ? "APROVADO" : "REPROVADO"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {check.checkedByName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* RASTREABILIDADE */}
      {activeTab === "traceability" && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Rastreabilidade Sanitária
          </h3>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 p-6">
            <div className="flex items-start gap-4">
              <Activity size={32} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
                  Sistema de Rastreabilidade Completa
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                  Todos os lotes e produtos possuem rastreabilidade completa através do sistema PVPS
                  (Primeiro que Vence, Primeiro que Sai).
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-200">
                        Rastreamento por Lote
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Cada produto possui número de lote único com data de entrada e validade
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-200">
                        Histórico Completo
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Todas as movimentações (entradas/saídas) são registradas com data, hora e
                        responsável
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-200">
                        Controle de Validade
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Sistema automático de alertas para produtos próximos do vencimento
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-200">
                        Auditoria Completa
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Logs de auditoria rastreiam todas as ações realizadas no sistema
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-200">
                        Exportação de Dados
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Relatórios podem ser exportados para CSV para conformidade regulatória
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">
              🏥 Conformidade com Normas Sanitárias
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  RDC 216/2004 - ANVISA
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Regulamento Técnico de Boas Práticas para Serviços de Alimentação
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  CVS 5/2013 - São Paulo
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Regulamento técnico sobre boas práticas para estabelecimentos comerciais
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  PVPS (First Expired, First Out)
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Sistema automático de controle de validade implementado
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Rastreabilidade Total
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Do recebimento ao consumo, todos os processos são rastreados
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Dialog de Receita */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Nova Receita</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-gray-700 dark:text-gray-300">Nome da Receita *</Label>
              <Input
                value={recipeForm.name}
                onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
                placeholder="Ex: Bolo de Chocolate"
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-700 dark:text-gray-300">Descrição</Label>
              <Textarea
                value={recipeForm.description}
                onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                placeholder="Breve descrição da receita"
                rows={2}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Categoria</Label>
              <Input
                value={recipeForm.category}
                onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })}
                placeholder="Ex: Sobremesas"
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Rendimento *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={recipeForm.yield}
                  onChange={(e) =>
                    setRecipeForm({ ...recipeForm, yield: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Quantidade"
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                />
                <Input
                  value={recipeForm.yieldUnit}
                  onChange={(e) => setRecipeForm({ ...recipeForm, yieldUnit: e.target.value })}
                  placeholder="Unidade"
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Tempo de Preparo (min)</Label>
              <Input
                type="number"
                value={recipeForm.prepTime}
                onChange={(e) =>
                  setRecipeForm({ ...recipeForm, prepTime: parseInt(e.target.value) || 0 })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Tempo de Cozimento (min)</Label>
              <Input
                type="number"
                value={recipeForm.cookTime}
                onChange={(e) =>
                  setRecipeForm({ ...recipeForm, cookTime: parseInt(e.target.value) || 0 })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-700 dark:text-gray-300">Modo de Preparo</Label>
              <Textarea
                value={recipeForm.instructions}
                onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                placeholder="Instruções passo a passo..."
                rows={4}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecipeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRecipe} className="bg-blue-600 hover:bg-blue-700 text-white">
              Criar Receita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Controle de Qualidade */}
      <Dialog open={isQualityDialogOpen} onOpenChange={setIsQualityDialogOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Controle de Qualidade</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Selecionar Item *</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
                  <SelectValue placeholder="Escolha um item do estoque" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.productName} - {item.quantity} {item.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Temperatura</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={qualityForm.temperature}
                  onChange={(e) =>
                    setQualityForm({ ...qualityForm, temperature: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.0"
                  className="col-span-2 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                />
                <Select
                  value={qualityForm.temperatureUnit}
                  onValueChange={(value: "C" | "F") =>
                    setQualityForm({ ...qualityForm, temperatureUnit: value })
                  }
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">°C</SelectItem>
                    <SelectItem value="F">°F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visualInspection"
                checked={qualityForm.visualInspection}
                onChange={(e) =>
                  setQualityForm({ ...qualityForm, visualInspection: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="visualInspection" className="text-gray-700 dark:text-gray-300">
                Inspeção visual aprovada
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="packagingIntact"
                checked={qualityForm.packagingIntact}
                onChange={(e) =>
                  setQualityForm({ ...qualityForm, packagingIntact: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="packagingIntact" className="text-gray-700 dark:text-gray-300">
                Embalagem íntegra
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="approved"
                checked={qualityForm.approved}
                onChange={(e) => setQualityForm({ ...qualityForm, approved: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="approved" className="text-gray-700 dark:text-gray-300 font-bold">
                Item APROVADO no controle
              </Label>
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Observações</Label>
              <Textarea
                value={qualityForm.notes}
                onChange={(e) => setQualityForm({ ...qualityForm, notes: e.target.value })}
                placeholder="Observações sobre a inspeção..."
                rows={3}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQualityDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateQualityCheck}
              className={
                qualityForm.approved
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {qualityForm.approved ? "Aprovar Item" : "Reprovar Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
