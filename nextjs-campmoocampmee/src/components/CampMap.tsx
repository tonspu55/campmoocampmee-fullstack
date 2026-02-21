"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import Image from "next/image";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { X } from "lucide-react";

// Image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

interface CampMapProps {
  posts: SanityDocument[];
  className?: string;
}

// Default map center (Thailand)
const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018,
};

// Custom map styles for a cleaner look (similar to Airbnb)
const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: mapStyles,
  clickableIcons: false,
};

// Create price marker SVG
const createPriceMarkerSvg = (price: string, isSelected: boolean) => {
  const bgColor = isSelected ? "#085953" : "#ffffff";
  const textColor = isSelected ? "#ffffff" : "#085953";
  const strokeColor = isSelected ? "#ffffff" : "#085953";
  const width = Math.max(60, price.length * 10 + 24);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="${width}" height="32" viewBox="0 0 ${width} 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="${width - 2}" height="28" rx="14" fill="${bgColor}" stroke="${strokeColor}" stroke-width="1.5"/>
      <text x="${width / 2}" y="20" text-anchor="middle" fill="${textColor}" font-size="12" font-weight="600" font-family="Arial, sans-serif">฿${price}</text>
    </svg>
  `)}`;
};

export default function CampMap({ posts, className = "" }: CampMapProps) {
  const [selectedCamp, setSelectedCamp] = useState<SanityDocument | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // Filter posts that have location data
  const postsWithLocation = useMemo(() => {
    return posts.filter(
      (post) => post.location?.lat && post.location?.lng
    );
  }, [posts]);

  // Calculate center based on posts or use default
  const center = useMemo(() => {
    if (postsWithLocation.length === 0) return defaultCenter;

    const avgLat =
      postsWithLocation.reduce(
        (sum, post) => sum + (post.location?.lat || 0),
        0
      ) / postsWithLocation.length;
    const avgLng =
      postsWithLocation.reduce(
        (sum, post) => sum + (post.location?.lng || 0),
        0
      ) / postsWithLocation.length;

    return { lat: avgLat, lng: avgLng };
  }, [postsWithLocation]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Fit bounds to show all markers
    if (postsWithLocation.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      postsWithLocation.forEach((post) => {
        if (post.location?.lat && post.location?.lng) {
          bounds.extend({ lat: post.location.lat, lng: post.location.lng });
        }
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [postsWithLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (post: SanityDocument) => {
    setSelectedCamp(post);
    if (map && post.location) {
      map.panTo({ lat: post.location.lat, lng: post.location.lng });
    }
  };

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}>
        <p className="text-gray-500">ไม่สามารถโหลดแผนที่ได้</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`}>
        <p className="text-gray-500">กำลังโหลดแผนที่...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={center}
        zoom={postsWithLocation.length === 1 ? 14 : 10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onClick={() => setSelectedCamp(null)}
      >
        {postsWithLocation.map((post) => {
          const price = post.otherBenefits?.priceOfStay || "---";
          const isSelected = selectedCamp?._id === post._id;
          const markerWidth = Math.max(60, String(price).length * 10 + 24);

          return (
            <MarkerF
              key={post._id}
              position={{
                lat: post.location.lat,
                lng: post.location.lng,
              }}
              onClick={() => handleMarkerClick(post)}
              icon={{
                url: createPriceMarkerSvg(String(price), isSelected),
                scaledSize: new google.maps.Size(markerWidth, 32),
                anchor: new google.maps.Point(markerWidth / 2, 16),
              }}
              zIndex={isSelected ? 1000 : 1}
            />
          );
        })}

        {/* Info Window - Desktop only */}
        {selectedCamp && selectedCamp.location && !isMobile && (
          <InfoWindowF
            position={{
              lat: selectedCamp.location.lat,
              lng: selectedCamp.location.lng,
            }}
            onCloseClick={() => setSelectedCamp(null)}
            options={{
              pixelOffset: new google.maps.Size(0, -25),
              disableAutoPan: false,
            }}
          >
            <CampInfoCard camp={selectedCamp} />
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Mobile Selected Camp Card - Fixed at bottom */}
      {selectedCamp && (
        <div className="lg:hidden absolute bottom-4 left-4 right-4 z-10">
          <MobileCampCard camp={selectedCamp} onClose={() => setSelectedCamp(null)} />
        </div>
      )}
    </div>
  );
}

// Info Card for desktop (inside InfoWindow)
// หมายเหตุ: InfoWindow default styles (padding/radius/close btn) ถูก override ใน globals.css
function CampInfoCard({ camp }: { camp: SanityDocument }) {
  const imageUrl = camp.thumbnail
    ? urlFor(camp.thumbnail)?.width(280).height(158).url()
    : null;

  return (
    <div className="w-55 p-0">
      <Link href={`/land/${camp.slug?.current}`} className="flex flex-col gap-2">
        {/* Image */}
        <div className="relative w-full aspect-video bg-muted  overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={camp.title || "Camp"}
              fill
              className="object-cover"
              sizes="220px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm">ไม่มีรูปภาพ</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-2 pb-2">
          <h3 className="text-sm font-semibold line-clamp-1">
            {camp.title}
          </h3>
          {camp.otherBenefits?.priceOfStay && (
            <p className="text-sm text-gray-700">
              <strong className="font-bold!">฿{camp.otherBenefits.priceOfStay}</strong> / คน / คืน
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

// Mobile Camp Card (fixed at bottom)
function MobileCampCard({ camp, onClose }: { camp: SanityDocument; onClose: () => void }) {
  const imageUrl = camp.thumbnail
    ? urlFor(camp.thumbnail)?.width(120).height(120).url()
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <Link href={`/land/${camp.slug?.current}`} className="flex items-stretch">
        {/* Image */}
        <div className="relative w-24 h-24 shrink-0 bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={camp.title || "Camp"}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xs">ไม่มีรูป</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 pr-10 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
            {camp.title}
          </h3>
          {camp.address?.province && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              {camp.address.district && `${camp.address.district}, `}
              {camp.address.province}
            </p>
          )}
          {camp.otherBenefits?.priceOfStay && (
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              ฿{camp.otherBenefits.priceOfStay}{" "}
              <span className="font-normal text-gray-500 dark:text-gray-400">/ คน / คืน</span>
            </p>
          )}
        </div>
      </Link>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="ปิด"
      >
        <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}

// Skeleton loader
export function CampMapSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-400 dark:text-gray-500">กำลังโหลดแผนที่...</span>
      </div>
    </div>
  );
}
