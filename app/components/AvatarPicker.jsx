"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";

export function resizeImageToBase64(file, maxSize = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarPicker({ avatarUrl, name, onChange, size = "lg" }) {
  const inputRef = useRef(null);
  const dim = size === "lg" ? "w-24 h-24" : "w-16 h-16";
  const textSize = size === "lg" ? "text-4xl" : "text-2xl";
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    try {
      const base64 = await resizeImageToBase64(file);
      onChange(base64);
    } catch {
      // ignore
    }
    e.target.value = "";
  };

  return (
    <div className="relative inline-block">
      <div
        className={`${dim} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer group`}
        onClick={() => inputRef.current?.click()}
        data-testid="avatar-picker"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className={`${textSize} font-bold text-primary`}>{initial}</span>
        )}
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        data-testid="input-avatar-file"
      />
    </div>
  );
}
