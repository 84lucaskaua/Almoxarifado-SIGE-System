import { Package, Edit, Trash2, AlertTriangle, Tag } from "lucide-react";
import { Button } from "../ui/button";
import type { ExtendedProduct } from "../../utils/storageExtended";

interface ProductCardProps {
  product: ExtendedProduct;
  onEdit: (product: ExtendedProduct) => void;
  onDelete: (product: ExtendedProduct) => void;
  stockQuantity?: number;
  isLowStock?: boolean;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  stockQuantity = 0,
  isLowStock = false,
}: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagem */}
      <div className="h-48 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package size={48} className="text-gray-400 dark:text-gray-600" />
        )}
        {isLowStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
            <AlertTriangle size={12} />
            Estoque Baixo
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {/* Código e Nome */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{product.code}</p>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Descrição */}
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Categoria */}
        {product.category && (
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{product.category}</span>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Informações de Estoque */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Estoque Atual</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {stockQuantity} {product.unitType}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Mínimo</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {product.minStockQuantity} {product.unitType}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit size={14} className="mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(product)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
