import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon paths broken by bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize Leaflet map (OpenStreetMap — no API key needed!)
    const map = L.map(mapContainer.current).setView(
      [20.932185, 77.757218], // Default center (lng, lat)
      12
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Click handler: place/move marker + reverse geocode
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);

        markerRef.current.on("dragend", async () => {
          const pos = markerRef.current!.getLatLng();
          const address = await reverseGeocode(pos.lat, pos.lng);
          onLocationSelect(pos.lat, pos.lng, address);
        });
      }

      const address = await reverseGeocode(lat, lng);
      onLocationSelect(lat, lng, address);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [onLocationSelect]);

  /**
   * Reverse geocode using Nominatim (OpenStreetMap) — completely free, no key!
   */
  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      return data.display_name ?? `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } catch {
      return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    }
  }

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%", minHeight: "384px" }}
    />
  );
};

export default MapComponent;
