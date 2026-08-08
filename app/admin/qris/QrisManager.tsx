"use client";

import { useState, useRef } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { updateQrisImage } from "../actions";
import { showToast } from "@/components/ui/Toast";
import { ToastContainer } from "@/components/ui/Toast";

interface QrisManagerProps {
  currentUrl: string;
}

export function QrisManager({ currentUrl }: QrisManagerProps) {
  const [preview, setPreview] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("error", "File harus berupa gambar (PNG, JPG, WebP).");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      await updateQrisImage(result.secure_url);
      setPreview(result.secure_url);
      showToast("success", "QRIS berhasil diupdate.");
    } catch (e: unknown) {
      showToast("error", "Gagal upload: " + String(e));
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <>
      <div>
        <p className="text-[11px] uppercase tracking-[.15em] text-white/35 mb-3">QRIS Aktif</p>
        <div className="hairline rounded-2xl bg-panel overflow-hidden">
          {/* Preview */}
          <div className="p-6 flex justify-center">
            {preview ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="QRIS aktif"
                  className="max-w-[220px] rounded-xl border border-white/[0.06]"
                />
                <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-xs text-white/60">QRIS aktif</span>
                </div>
              </div>
            ) : (
              <div className="w-[220px] h-[220px] rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                <p className="text-sm text-white/20">Belum ada gambar</p>
              </div>
            )}
          </div>

          {/* Upload area */}
          <div className="px-6 pb-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                dragOver
                  ? "border-gold/40 bg-gold/5"
                  : "border-white/[0.06] hover:border-white/10"
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-white/50">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mengupload…
                </div>
              ) : (
                <>
                  <svg className="mx-auto mb-2 text-white/20" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <p className="text-sm text-white/40">Klik atau seret gambar ke sini</p>
                  <p className="text-[11px] text-white/20 mt-1">PNG, JPG, atau WebP</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <ToastContainer />
    </>
  );
}
