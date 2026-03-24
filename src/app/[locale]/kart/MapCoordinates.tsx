"use client";

interface MapCoordinatesProps {
  center: [number, number];
  zoom: number;
}

export function MapCoordinates({ center, zoom }: MapCoordinatesProps) {
  const [lat, lng] = center;

  return (
    <div
      className="absolute bottom-4 right-4 z-[1000] rounded bg-white/90 px-3 py-1.5 font-mono text-xs shadow-lg backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Map coordinates and zoom level"
    >
      <span className="font-semibold">LAT:</span> {lat.toFixed(4)}° |{" "}
      <span className="font-semibold">LON:</span> {lng.toFixed(4)}° |{" "}
      <span className="font-semibold">ZOOM:</span> {zoom}x
    </div>
  );
}
