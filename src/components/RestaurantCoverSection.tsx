import { useRef } from "react";
import { Camera, Image, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { KEYS } from "../utils/keys";

interface RestaurantCoverSectionProps {
  coverImage?: string;
  name: string;
  uploadingCover: boolean;
  deletingCover: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

const RestaurantCoverSection = ({
  coverImage,
  name,
  uploadingCover,
  deletingCover,
  onUpload,
  onDelete,
}: RestaurantCoverSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Image size={18} className="text-primary" />
        <h2 className="text-sm font-semibold text-text">Cover image</h2>
      </div>
      <div className="relative w-full h-48 sm:h-60 md:h-64 rounded-2xl overflow-hidden bg-background flex items-center justify-center mb-3">
        {coverImage ? (
          <img
            src={`${KEYS.PUBLIC_S3_PREFIX}/${coverImage}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <Camera size={40} />
            <span className="text-sm mt-2">No cover image</span>
          </div>
        )}
        {uploadingCover && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={28} />
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
              e.target.value = "";
            }
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadingCover}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-text hover:bg-card transition-colors disabled:opacity-60 w-full sm:w-auto"
        >
          {uploadingCover ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImagePlus size={16} />
          )}
          Upload cover image
        </button>
        {coverImage && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deletingCover}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 w-full sm:w-auto"
          >
            <Trash2 size={16} />
            Remove cover image
          </button>
        )}
      </div>
    </div>
  );
};

export default RestaurantCoverSection;
