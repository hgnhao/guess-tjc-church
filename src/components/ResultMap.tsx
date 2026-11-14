import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { nearestLng, type LatLng } from '../lib/geo';
import { answerIcon, createMap, guessIcon } from '../lib/mapConfig';

export interface ResultPair {
  answer: LatLng;
  guess: LatLng | null;
  label?: string;
}

interface Props {
  pairs: ResultPair[];
  sizeKey?: number;
}

export default function ResultMap({ pairs, sizeKey = 0 }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const fitRef = useRef<() => void>(() => {});

  useEffect(() => {
    const map = createMap(elRef.current!, { worldCopyJump: false });
    mapRef.current = map;
    const pts: L.LatLng[] = [];
    for (const p of pairs) {
      const a = L.latLng(p.answer.lat, p.answer.lng);
      pts.push(a);
      if (p.guess) {
        // Geser bujur tebakan supaya garis lewat jalur terpendek (termasuk lewat garis bujur 180)
        const g = L.latLng(p.guess.lat, nearestLng(p.guess.lng, p.answer.lng));
        pts.push(g);
        L.polyline([g, a], { color: '#1f1a5c', weight: 3, dashArray: '6 8', opacity: 0.85 }).addTo(map);
        L.marker(g, { icon: guessIcon, interactive: false, keyboard: false }).addTo(map);
      }
      L.marker(a, { icon: answerIcon(p.label), interactive: false, keyboard: false, zIndexOffset: 500 }).addTo(map);
    }
    const fit = () => {
      if (pts.length === 1) map.setView(pts[0], 5);
      else if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 12 });
      else map.setView([20, 0], 1);
    };
    fitRef.current = fit;
    fit();
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // pairs dianggap tetap selama komponen hidup
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize();
    fitRef.current();
  }, [sizeKey]);

  return <div ref={elRef} className="leaflet-host" />;
}
