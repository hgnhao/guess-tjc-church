import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LatLng } from '../lib/geo';
import { createMap, guessIcon } from '../lib/mapConfig';

interface Props {
  guess: LatLng | null;
  onGuess: (ll: LatLng) => void;
  /** Ubah nilai ini setiap kali ukuran container berubah (sheet selesai terbuka, panel membesar). */
  sizeKey: number;
}

export default function GuessMap({ guess, onGuess, sizeKey }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onGuessRef = useRef(onGuess);
  onGuessRef.current = onGuess;
  const initialGuess = useRef(guess);

  useEffect(() => {
    const map = createMap(elRef.current!);
    map.setView([20, 0], 1);
    mapRef.current = map;

    const placeMarker = (ll: L.LatLngExpression) => {
      if (markerRef.current) markerRef.current.setLatLng(ll);
      else markerRef.current = L.marker(ll, { icon: guessIcon, interactive: false, keyboard: false }).addTo(map);
    };

    if (initialGuess.current) placeMarker([initialGuess.current.lat, initialGuess.current.lng]);

    map.on('click', (e: L.LeafletMouseEvent) => {
      // Marker digambar di posisi yang diklik (bisa di salinan dunia), tebakan disimpan dengan bujur -180..180
      placeMarker(e.latlng);
      const w = e.latlng.wrap();
      onGuessRef.current({ lat: w.lat, lng: w.lng });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.invalidateSize();
  }, [sizeKey]);

  return <div ref={elRef} className="leaflet-host" />;
}
