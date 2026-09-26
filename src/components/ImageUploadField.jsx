import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { validateImageFiles } from "@/services/storageApi";

export default function ImageUploadField({
  files,
  onFilesChange,
  existingUrls = [],
  onExistingUrlsChange = () => undefined,
  maxFiles = 6,
  label = "Photos",
  help = "JPG, PNG ou WebP — 8 Mo maximum par image",
}) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => next.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [files]);

  const validExistingUrls = existingUrls.filter(Boolean);

  const chooseFiles = (event) => {
    try {
      const remaining = Math.max(0, maxFiles - validExistingUrls.length);
      const selected = validateImageFiles(event.target.files, remaining);
      onFilesChange(selected);
      setError("");
    } catch (selectionError) {
      setError(selectionError.message);
    } finally {
      event.target.value = "";
    }
  };

  const removeFile = (index) => onFilesChange(files.filter((_, itemIndex) => itemIndex !== index));
  const removeExisting = (index) => onExistingUrlsChange(validExistingUrls.filter((_, itemIndex) => itemIndex !== index));
  const total = validExistingUrls.length + files.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-700">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{help}</p>
        </div>
        <span className="text-xs font-bold text-slate-400">{total}/{maxFiles}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={maxFiles > 1}
        className="sr-only"
        onChange={chooseFiles}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={total >= maxFiles}
        className="flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/60 px-4 py-5 text-center transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
          {total ? <ImagePlus className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
        </span>
        <span className="mt-3 text-sm font-bold text-slate-800">Choisir depuis l’appareil</span>
        <span className="mt-1 text-xs text-slate-500">Fichiers sur ordinateur, galerie ou appareil photo sur mobile</span>
      </button>

      {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}

      {(validExistingUrls.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {validExistingUrls.map((url, index) => (
            <div key={url} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <img src={url} alt={`Image enregistrée ${index + 1}`} className="h-28 w-full object-cover" />
              <button type="button" onClick={() => removeExisting(index)} className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-rose-600 shadow" aria-label="Retirer cette image">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {previews.map((preview, index) => (
            <div key={`${preview.file.name}-${preview.file.lastModified}`} className="relative overflow-hidden rounded-xl border border-sky-200 bg-sky-50">
              <img src={preview.url} alt={`Nouvelle image ${index + 1}`} className="h-28 w-full object-cover" />
              <span className="absolute bottom-2 left-2 rounded-full bg-sky-700 px-2 py-1 text-[10px] font-bold text-white">NOUVELLE</span>
              <button type="button" onClick={() => removeFile(index)} className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-rose-600 shadow" aria-label="Retirer cette image">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
