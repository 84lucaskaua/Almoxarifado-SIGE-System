import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "../ui/button";

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Limite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Product"
            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-zinc-700"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X size={16} className="mr-1" />
            Remover
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-gray-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600"
            }
            bg-gray-50 dark:bg-zinc-800
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              {isDragging ? (
                <Upload size={24} className="text-blue-600 dark:text-blue-400" />
              ) : (
                <ImageIcon size={24} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {isDragging ? "Solte a imagem aqui" : "Clique ou arraste uma imagem"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG ou GIF (máx. 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}
