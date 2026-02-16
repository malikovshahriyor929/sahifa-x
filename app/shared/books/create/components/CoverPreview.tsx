"use client";

import { useRef } from "react";
import { MdAddPhotoAlternate, MdDelete, MdImage, MdUpload } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CoverPreviewProps = {
  title: string;
  genre: string;
  image: string | null;
  uploading: boolean;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
};

export function CoverPreview({
  title,
  genre,
  image,
  uploading,
  onImageUpload,
  onImageRemove,
}: CoverPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function triggerUpload() {
    fileInputRef.current?.click();
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    onImageUpload(file);
    event.target.value = "";
  }

  return (
    <Card className="sticky top-6">
      <CardHeader className="flex-row items-center gap-2 space-y-0 border-b border-primary-light/20">
        <MdImage className="text-2xl text-primary" />
        <CardTitle>Muqova</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-primary-light/20 bg-primary/5 shadow-xl shadow-black/10">
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic image URLs come from upload API response. */}
              <img
                src={image}
                alt="Book cover preview"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/55 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={triggerUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-dark-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <MdUpload className="text-lg" />
                  {uploading ? "Yuklanmoqda..." : "Yuklash"}
                </button>
                <button
                  type="button"
                  onClick={onImageRemove}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/35 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <MdDelete className="text-lg" />
                  O&apos;chirish
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center text-dark-900/55">
              <MdImage className="mb-3 text-6xl opacity-45" />
              <p className="text-sm">Rasm yuklanmagan</p>
              <button
                type="button"
                onClick={triggerUpload}
                disabled={uploading}
                className="mt-3 text-sm font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uploading ? "Yuklanmoqda..." : "Rasm tanlash"}
              </button>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary-light">
              {genre || "JANR"}
            </p>
            <h4 className="line-clamp-3 text-xl font-bold leading-tight text-white">{title || "Kitob nomi"}</h4>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-dark-900/55">
          Tavsiya etilgan o&apos;lcham: 1600x2400px. Muqova sifati yuqori bo&apos;lsa kitob ko&apos;proq
          o&apos;qiladi.
        </p>

        <button
          type="button"
          onClick={triggerUpload}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary-light/35 bg-primary/5 px-3 py-4 text-dark-900/60 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          <MdAddPhotoAlternate className="text-2xl" />
          <span className="text-xs font-medium">Boshqa rasm tanlash</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </CardContent>
    </Card>
  );
}
