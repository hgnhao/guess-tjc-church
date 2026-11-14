import L from 'leaflet';

/**
 * Tile peta gratis tanpa API key.
 *
 * Default: OpenStreetMap standar. (CARTO Voyager sudah dicoba, tapi per Nov 2026 tile CARTO tanpa
 * key hanya menampilkan watermark "API KEY REQUIRED".) Label OSM memakai bahasa lokal
 * (mis. 日本, Россия); kalau mau label Latin/Inggris, ganti ke Esri World Street Map:
 *   url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
 *   subdomains: '', attribution: 'Tiles &copy; Esri'
 * (cek dulu syarat pemakaian Esri).
 */
export const TILE = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: 'abc',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  maxZoom: 19,
};

export function addTiles(map: L.Map): L.TileLayer {
  return L.tileLayer(TILE.url, {
    subdomains: TILE.subdomains,
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
