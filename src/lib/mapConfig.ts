import L from 'leaflet';

/**
 * Tile peta gratis tanpa API key, label bahasa Inggris (huruf Latin): Esri World Street Map.
 *
 * Riwayat: CARTO Voyager (per Nov 2026 tanpa key hanya menampilkan watermark "API KEY REQUIRED"),
 * lalu OpenStreetMap standar (labelnya bahasa lokal, mis. 日本, Россия). Kalau Esri bermasalah,
 * kembali ke OSM:
 *   url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', subdomains: 'abc', maxZoom: 19,
 *   attribution: '&copy; OpenStreetMap contributors'
 */
export const TILE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  subdomains: '',
  attribution:
    'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> &mdash; Esri, HERE, Garmin, USGS, &copy; OpenStreetMap contributors',
  maxZoom: 18,
};

export function addTiles(map: L.Map): L.TileLayer {
  return L.tileLayer(TILE.url, {
    ...(TILE.subdomains ? { subdomains: TILE.subdomains } : {}),
    attribution: TILE.attribution,
    maxZoom: TILE.maxZoom,
    detectRetina: false,
  }).addTo(map);
}

export function createMap(el: HTMLElement, opts: L.MapOptions = {}): L.Map {
  const map = L.map(el, {
    worldCopyJump: true,
    minZoom: 1,
    zoomSnap: 0.5,
    tapTolerance: 20,
    ...opts,
  });
  map.attributionControl.setPrefix(false);
  addTiles(map);
  return map;
}

export const guessIcon = L.divIcon({
  className: 'map-icon',
  html: '<div class="pin-guess"><span></span></div>',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

export function answerIcon(label = '🚩'): L.DivIcon {
  return L.divIcon({
    className: 'map-icon',
    html: `<div class="pin-answer">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}
