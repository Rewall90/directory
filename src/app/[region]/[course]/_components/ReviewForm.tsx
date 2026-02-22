"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ReviewFormProps {
  courseSlug: string;
  courseName: string;
}

interface ImageFile {
  file: File;
  preview: string;
}

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function StarInput({ rating, onRate }: { rating: number; onRate: (rating: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${star} stjerner`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-7 w-7 ${
              star <= (hovered || rating) ? "fill-v3d-gold" : "fill-gray-300"
            } transition-colors`}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ReviewForm({ courseSlug, courseName }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    author: "",
    rating: 0,
    text: "",
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    for (const file of Array.from(files)) {
      if (images.length + newImages.length >= MAX_IMAGES) break;

      if (!file.type.startsWith("image/")) continue;

      if (file.size > MAX_IMAGE_SIZE) {
        setStatus({
          type: "error",
          message: `${file.name} er for stort (maks 5 MB).`,
        });
        continue;
      }

      newImages.push({ file, preview: URL.createObjectURL(file) });
    }

    setImages((prev) => [...prev, ...newImages]);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      setStatus({ type: "error", message: "Velg en vurdering (1-5 stjerner)." });
      return;
    }

    setStatus({ type: "loading", message: "Sender..." });

    try {
      // Convert images to base64
      const imageData = await Promise.all(
        images.map(async (img) => ({
          name: img.file.name,
          type: img.file.type,
          data: await fileToBase64(img.file),
        })),
      );

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          courseName,
          author: formData.author,
          rating: formData.rating,
          text: formData.text,
          images: imageData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Takk for din anmeldelse! Den vil bli gjennomgått før publisering.",
        });
        setFormData({ author: "", rating: 0, text: "" });
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
      } else {
        setStatus({
          type: "error",
          message: data.error || "Noe gikk galt. Vennligst prøv igjen.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Kunne ikke sende anmeldelsen. Vennligst prøv igjen.",
      });
    }
  };

  return (
    <div className="rounded-lg border border-v3d-border bg-v3d-warm p-8">
      <h3 className="mb-6 font-serif text-xl font-medium text-v3d-text-dark">
        Skriv en anmeldelse
      </h3>

      {status.type === "success" ? (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">{status.message}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {status.type === "error" && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">{status.message}</div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="review-author"
              className="mb-2 block text-sm font-medium text-v3d-text-dark"
            >
              Navn *
            </label>
            <input
              type="text"
              id="review-author"
              value={formData.author}
              onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
              required
              maxLength={50}
              className="focus:ring-v3d-forest/20 w-full rounded-lg border border-v3d-border bg-white px-4 py-3 text-v3d-text-dark placeholder-gray-400 focus:border-v3d-forest focus:outline-none focus:ring-2"
              placeholder="Ditt navn"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-v3d-text-dark">Vurdering *</label>
            <StarInput
              rating={formData.rating}
              onRate={(rating) => setFormData((prev) => ({ ...prev, rating }))}
            />
          </div>

          {/* Text */}
          <div>
            <label
              htmlFor="review-text"
              className="mb-2 block text-sm font-medium text-v3d-text-dark"
            >
              Din anmeldelse *
            </label>
            <textarea
              id="review-text"
              value={formData.text}
              onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
              required
              maxLength={1000}
              rows={4}
              className="focus:ring-v3d-forest/20 w-full rounded-lg border border-v3d-border bg-white px-4 py-3 text-v3d-text-dark placeholder-gray-400 focus:border-v3d-forest focus:outline-none focus:ring-2"
              placeholder="Fortell om din opplevelse på banen..."
            />
            <div className="mt-1 text-right text-xs text-v3d-text-muted">
              {formData.text.length} / 1000
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="mb-2 block text-sm font-medium text-v3d-text-dark">
              Bilder (valgfritt)
            </label>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="mb-3 flex gap-3">
                {images.map((img, index) => (
                  <div key={index} className="group relative">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-v3d-border">
                      <Image
                        src={img.preview}
                        alt={`Bilde ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Fjern bilde"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageAdd}
                  className="hidden"
                  id="review-images"
                />
                <label
                  htmlFor="review-images"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-v3d-border px-4 py-2.5 text-sm text-v3d-text-muted transition-colors hover:border-v3d-forest hover:text-v3d-forest"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Legg til bilde ({images.length}/{MAX_IMAGES})
                </label>
              </>
            )}
            <p className="mt-1 text-xs text-v3d-text-muted">Maks 3 bilder, 5 MB per bilde</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status.type === "loading"}
            className="rounded-lg bg-v3d-forest px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-v3d-forest-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status.type === "loading" ? "Sender..." : "Send anmeldelse"}
          </button>
        </form>
      )}
    </div>
  );
}
