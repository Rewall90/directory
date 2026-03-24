import L from "leaflet";

const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#047857"/>
  <circle cx="12" cy="11" r="5" fill="white"/>
</svg>`;

const markerUrl =
  "data:image/svg+xml;base64," +
  (typeof btoa !== "undefined" ? btoa(markerSvg) : Buffer.from(markerSvg).toString("base64"));

export const primaryMarkerIcon = L.icon({
  iconUrl: markerUrl,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
});
