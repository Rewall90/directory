interface HeroImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function HeroImage({ src, alt, width, height }: HeroImageProps) {
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      {...(width && height ? { width, height } : {})}
      className="mb-6 h-auto w-full rounded-lg shadow-md"
      fetchPriority="high"
      decoding="async"
    />
  );
}
