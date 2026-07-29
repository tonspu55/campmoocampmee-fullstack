"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type SanityDocument } from "next-sanity";
import CampInfoCard from "@/components/CampInfoCard";
import MobileCampCard from "@/components/MobileCampCard";

interface CampMapProps {
  posts: SanityDocument[];
  className?: string;
}

// Default map center (Thailand)
const defaultCenter: L.LatLngExpression = [13.7563, 100.5018];

// OpenStreetMap-based raster tiles (ไม่ต้องใช้ API key)
// เปลี่ยน provider ได้ด้วย env NEXT_PUBLIC_MAP_TILE_URL หากต้องการ tile server ของตัวเอง
const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ||
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Price pill marker (styles อยู่ใน globals.css → .camp-price-pill)
// cache ไว้เพื่อให้ icon มี identity คงที่ — ไม่งั้น react-leaflet จะสร้าง DOM marker ใหม่ทุก render
const iconCache = new Map<string, L.DivIcon>();

const getPriceIcon = (price: string, isSelected: boolean) => {
  const key = `${price}|${isSelected}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const width = Math.max(60, price.length * 10 + 24);
  const icon = L.divIcon({
    className: "camp-price-marker",
    html: `<div class="camp-price-pill${isSelected ? " is-selected" : ""}" style="width:${width}px">฿${escapeHtml(price)}</div>`,
    iconSize: [width, 32],
    iconAnchor: [width / 2, 16],
    popupAnchor: [0, -18],
  });

  iconCache.set(key, icon);
  return icon;
};

// ปรับ viewport ให้เห็นทุก marker (เทียบเท่า fitBounds ของ Google Maps)
function FitBounds({ points }: { points: L.LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [map, points]);

  return null;
}

// คลิกพื้นที่ว่างบนแผนที่ → เคลียร์ camp ที่เลือกอยู่
// หมายเหตุ: ห้ามผูก `popupclose` ที่นี่ — react-leaflet remount popup ทุกครั้งที่ position เปลี่ยน
// (cleanup เรียก map.removeLayer) ทำให้ popupclose ยิงตอนสลับหมุด แล้วปิด popup ที่เพิ่งเปิด
function MapEvents({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({
    click: onDeselect,
  });

  return null;
}

export default function CampMap({ posts, className = "" }: CampMapProps) {
  const [selectedCamp, setSelectedCamp] = useState<SanityDocument | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter posts that have location data
  const postsWithLocation = useMemo(() => {
    return posts.filter((post) => post.location?.lat && post.location?.lng);
  }, [posts]);

  // position ต้องมี identity คงที่ (useMemo) — react-leaflet ใช้ค่านี้เป็น effect dependency
  const markers = useMemo(
    () =>
      postsWithLocation.map((post) => ({
        post,
        position: [post.location.lat, post.location.lng] as L.LatLngTuple,
        price: String(post.otherBenefits?.priceOfStay || "---"),
      })),
    [postsWithLocation],
  );

  const points = useMemo<L.LatLngTuple[]>(
    () => markers.map((m) => m.position),
    [markers],
  );

  const selectedPosition = useMemo<L.LatLngTuple | null>(
    () =>
      selectedCamp?.location
        ? [selectedCamp.location.lat, selectedCamp.location.lng]
        : null,
    [selectedCamp],
  );

  // Calculate center based on posts or use default
  const center = useMemo<L.LatLngExpression>(() => {
    if (points.length === 0) return defaultCenter;

    const avgLat = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const avgLng = points.reduce((sum, p) => sum + p[1], 0) / points.length;

    return [avgLat, avgLng];
  }, [points]);

  const handleMarkerClick = (post: SanityDocument) => {
    setSelectedCamp(post);
    if (mapRef.current && post.location) {
      mapRef.current.panTo([post.location.lat, post.location.lng]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={points.length === 1 ? 14 : 10}
        scrollWheelZoom
        zoomControl
        className="w-full h-full"
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          subdomains="abcd"
          maxZoom={20}
        />

        <FitBounds points={points} />
        <MapEvents onDeselect={() => setSelectedCamp(null)} />

        {markers.map(({ post, position, price }) => {
          const isSelected = selectedCamp?._id === post._id;

          return (
            <Marker
              key={post._id}
              position={position}
              icon={getPriceIcon(price, isSelected)}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => handleMarkerClick(post) }}
            />
          );
        })}

        {/* Popup - Desktop only */}
        {selectedCamp && selectedPosition && !isMobile && (
          <Popup
            position={selectedPosition}
            offset={[0, -18]}
            minWidth={220}
            maxWidth={220}
            autoPan
            closeButton={false}
          >
            <CampInfoCard
              camp={selectedCamp}
              onClose={() => setSelectedCamp(null)}
            />
          </Popup>
        )}
      </MapContainer>

      {/* Mobile Selected Camp Card - Fixed at bottom */}
      {selectedCamp && (
        <div className="lg:hidden absolute bottom-4 left-4 right-4 z-1000">
          <MobileCampCard
            camp={selectedCamp}
            onClose={() => setSelectedCamp(null)}
          />
        </div>
      )}
    </div>
  );
}

// Skeleton loader
export function CampMapSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-400 dark:text-gray-500">
          กำลังโหลดแผนที่...
        </span>
      </div>
    </div>
  );
}
