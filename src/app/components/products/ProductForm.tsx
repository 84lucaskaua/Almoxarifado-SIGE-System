import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ImageUpload } from "./ImageUpload";
import { getCategories, saveCategories, type ExtendedProduct } from "../../utils/storageExtended";
import { Save, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Partial<ExtendedProduct>) => void;
  initialData?: ExtendedProduct | null;
}

const UNIT_TYPES = [
  { value: "UN", label: "Unidade (UN)" },
  { value: "CX", label: "Caixa (CX)" },
  { value: "PCT", label: "Pacote (PCT)" },
  { value: "PTC", label: "Pacote (PTC)" },
  { value: "FR", label: "Frasco (FR)" },
  { value: "RL", label: "Rolo (RL)" },
  { value: "KIT", label: "Kit (KIT)" },
  { value: "EMB", label: "Embalagem (EMB)" },
  { value: "UM", label: "Unidade de Medida (UM)" },
  { value: "BEM", label: "Bem (BEM)" },
  { value: "KG", label: "Quilograma (KG)" },
  { value: "G", label: "Grama (G)" },
];

export function ProductForm({ open, onOpenChange, onSave, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<ExtendedProduct>>({
    code: "",
    name: "",
    description: "",
    category: "",
    unitType: "UN",
    minStockQuantity: 0,
    imageUrl: "",
    tags: [],
    alertDays: 30,
    notes: "",
    requiresTemperatureControl: false,
    minTemperature: undefined,
    maxTemperature: undefined,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setCategories(getCategories().map(c => c.name));
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        category: "",
        unitType: "UN",
        minStockQuantity: 0,
        imageUrl: "",
        tags: [],
        alertDays: 30,
        notes: "",
        requiresTemperatureControl: false,
        minTemperature: undefined,
        maxTemperature: undefined,
      });
    }
  }, [initialData, open]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);

      // Salva as categorias no storage
      const existingCategories = getCategories();
      const newCategoryObj = {
        id: crypto.randomUUID(),
        name: newCategory.trim(),
        color: "#3b82f6",
        icon: "Package",
        alertDays: 30,
        createdAt: new Date().toISOString(),
      };
      saveCategories([...existingCategories, newCategoryObj]);

      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory("");
      setIsAddingCategory(false);
      toast.success("Categoria adicionada com sucesso!");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      toast.error("Código e nome são obrigatórios");
      return;
    }

    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {initialData ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Imagem */}
            <div className="md:col-span-2">
              <Label className="text-gray-700 dark:text-gray-300">Imagem do Produto</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(base64) => setFormData({ ...formData, imageUrl: base64 })}
                onRemove={() => setFormData({ ...formData, imageUrl: "" })}
              />
            </div>

            {/* Código */}
            <div>
              <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">
                Código/SKU *
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: PROD001"
                required
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Nome */}
            <div>
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                Nome do Produto *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Álcool em Gel 500ml"
                required
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Categoria */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Categoria</Label>
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nova categoria"
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                  />
                  <Button type="button" size="sm" onClick={handleAddCategory}>
                    <Save size={16} />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setIsAddingCategory(false)}>
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      value === "__new__"
                        ? setIsAddingCategory(true)
                        : setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Selecione ou crie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">
                        <div className="flex items-center gap-2">
                          <Plus size={16} />
                          Nova categoria
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Unidade */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Unidade de Medida</Label>
              <Select
                value={formData.unitType}
                onValueChange={(value: any) => setFormData({ ...formData, unitType: value })}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_TYPES.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estoque Mínimo */}
            <div>
              <Label htmlFor="minStock" className="text-gray-700 dark:text-gray-300">
                Estoque Mínimo
              </Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, minStockQuantity: parseInt(e.target.value) || 0 })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Dias de Alerta */}
            <div>
              <Label htmlFor="alertDays" className="text-gray-700 dark:text-gray-300">
                Dias de Alerta de Vencimento
              </Label>
              <Input
                id="alertDays"
                type="number"
                min="1"
                value={formData.alertDays}
                onChange={(e) =>
                  setFormData({ ...formData, alertDays: parseInt(e.target.value) || 30 })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada do produto"
                rows={3}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <Label className="text-gray-700 dark:text-gray-300">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Adicionar tag"
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" size="sm" onClick={handleAddTag}>
                  <Plus size={16} className="mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">
                Notas / Observações
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações internas sobre o produto"
                rows={2}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save size={16} className="mr-2" />
              {initialData ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
