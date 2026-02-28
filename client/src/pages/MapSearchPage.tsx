import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Loader2, Package, Navigation, X } from "lucide-react";
import { cn } from "@/lib/utils";

// We use Leaflet via CDN-loaded script (no npm install needed)
declare global {
    interface Window { L: any; }
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeaflet(): Promise<void> {
    return new Promise((resolve) => {
        if (window.L) { resolve(); return; }
        const link = document.createElement("link");
        link.rel = "stylesheet"; link.href = LEAFLET_CSS;
        document.head.appendChild(link);
        const script = document.createElement("script");
        script.src = LEAFLET_JS;
        script.onload = () => resolve();
        document.head.appendChild(script);
    });
}

export default function MapSearchPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const circleRef = useRef<any>(null);
    const centerMarkerRef = useRef<any>(null);

    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [leafletReady, setLeafletReady] = useState(false);
    const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [locationInput, setLocationInput] = useState("");
    const [radiusKm] = useState(10);
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [geoLoading, setGeoLoading] = useState(false);

    useEffect(() => {
        loadLeaflet().then(() => setLeafletReady(true));
    }, []);

    useEffect(() => {
        if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;
        const L = window.L;
        const map = L.map(mapRef.current, {
            center: [7.8731, 80.7718], // Sri Lanka center
            zoom: 8,
            zoomControl: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        map.on("click", (e: any) => {
            setCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        mapInstanceRef.current = map;
    }, [leafletReady]);

    useEffect(() => {
        if (!center || !mapInstanceRef.current || !leafletReady) return;
        const L = window.L;
        const map = mapInstanceRef.current;

        // Remove old circle and center marker
        if (circleRef.current) circleRef.current.remove();
        if (centerMarkerRef.current) centerMarkerRef.current.remove();

        // Draw radius circle
        circleRef.current = L.circle([center.lat, center.lng], {
            radius: radiusKm * 1000,
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.08,
            weight: 2,
        }).addTo(map);

        // Center pin
        const centerIcon = L.divIcon({
            html: `<div style="background:#10b981;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
            className: "",
            iconSize: [14, 14],
            iconAnchor: [7, 7],
        });
        centerMarkerRef.current = L.marker([center.lat, center.lng], { icon: centerIcon }).addTo(map);

        fetchNearbyListings(center.lat, center.lng);
    }, [center]);

    const fetchNearbyListings = async (lat: number, lng: number) => {
        if (!supabase) return;
        setLoading(true);
        try {
            // Fetch listings with coordinates within bounding box (approx 10km)
            const delta = radiusKm / 111; // ~1 degree = 111km
            const { data } = await supabase
                .from("listings")
                .select("*")
                .eq("status", "active")
                .not("latitude", "is", null)
                .not("longitude", "is", null)
                .gte("latitude", lat - delta)
                .lte("latitude", lat + delta)
                .gte("longitude", lng - delta)
                .lte("longitude", lng + delta)
                .limit(50);

            const results = (data || []).filter((l: any) => {
                // More precise distance check
                const d = haversineKm(lat, lng, l.latitude, l.longitude);
                return d <= radiusKm;
            });

            setListings(results);
            updateMapMarkers(results);
        } finally {
            setLoading(false);
        }
    };

    const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const updateMapMarkers = (results: any[]) => {
        if (!mapInstanceRef.current || !window.L) return;
        const L = window.L;
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        results.forEach((listing) => {
            if (!listing.latitude || !listing.longitude) return;
            const price = Number(listing.price_monthly || listing.price_daily || listing.price_weekly || 0);
            const icon = L.divIcon({
                html: `<div style="background:white;border:2px solid #10b981;border-radius:12px;padding:3px 8px;font-size:11px;font-weight:800;color:#059669;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15)">Rs ${price.toLocaleString()}</div>`,
                className: "",
                iconAnchor: [0, 0],
            });
            const marker = L.marker([listing.latitude, listing.longitude], { icon })
                .addTo(mapInstanceRef.current)
                .on("click", () => setSelectedListing(listing));
            markersRef.current.push(marker);
        });
    };

    const handleGeolocate = () => {
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setCenter({ lat: latitude, lng: longitude });
                mapInstanceRef.current?.setView([latitude, longitude], 13);
                setGeoLoading(false);
            },
            () => {
                setGeoLoading(false);
                alert("Could not get your location. Please click on the map to set a search area.");
            }
        );
    };

    const handleLocationSearch = async () => {
        if (!locationInput.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&limit=1`);
            const data = await res.json();
            if (data?.[0]) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                setCenter({ lat, lng });
                mapInstanceRef.current?.setView([lat, lng], 13);
            } else {
                alert("Location not found. Try a different search.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Search bar */}
            <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3">
                <div className="max-w-5xl mx-auto flex gap-2">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={locationInput}
                            onChange={e => setLocationInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLocationSearch()}
                            placeholder="Search a location (e.g. Colombo, Kandy)..."
                            className="pl-9 h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
                        />
                    </div>
                    <Button onClick={handleLocationSearch} className="h-10 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none shrink-0">
                        <Search className="h-4 w-4 mr-1.5" /> Search
                    </Button>
                    <Button onClick={handleGeolocate} disabled={geoLoading} variant="outline" className="h-10 rounded-xl border-gray-200 shrink-0">
                        {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-1.5">
                    {center ? `Showing listings within ${radiusKm}km — ${listings.length} found` : 'Click on the map or search a location to find nearby listings'}
                </p>
            </div>

            {/* Map + Results */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>
                {/* Map */}
                <div className="relative flex-1 min-h-[300px] lg:min-h-0">
                    <div ref={mapRef} className="w-full h-full" />
                    {!leafletReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        </div>
                    )}
                    {loading && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Searching...
                        </div>
                    )}
                    {!center && leafletReady && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-5 py-3 shadow-xl border border-gray-100 text-center">
                            <p className="text-sm font-bold text-gray-700">📍 Click anywhere on the map</p>
                            <p className="text-xs text-gray-400 mt-0.5">to search listings within {radiusKm}km</p>
                        </div>
                    )}
                </div>

                {/* Listing panel */}
                {center && (
                    <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto">
                        {selectedListing && (
                            <div className="p-3 border-b border-gray-100">
                                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 relative">
                                    <button onClick={() => setSelectedListing(null)} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <X className="h-3 w-3 text-gray-500" />
                                    </button>
                                    <Link href={`/listing/${selectedListing.id}`}>
                                        <div className="flex gap-3 cursor-pointer">
                                            <img src={selectedListing.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200"}
                                                className="h-16 w-16 object-cover rounded-xl shrink-0" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{selectedListing.title}</p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="h-3 w-3" /> {selectedListing.location}
                                                </p>
                                                <p className="text-emerald-600 font-black text-sm mt-1">
                                                    Rs {Number(selectedListing.price_monthly || selectedListing.price_daily || 0).toLocaleString()}
                                                    <span className="text-gray-400 font-normal text-xs">/{selectedListing.price_monthly ? 'mo' : 'day'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="p-3">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{listings.length} listings nearby</p>
                            {listings.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No listings found in this area</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {listings.map((listing) => {
                                        const price = Number(listing.price_monthly || listing.price_daily || listing.price_weekly || 0);
                                        const unit = listing.price_monthly ? "mo" : "day";
                                        return (
                                            <Link key={listing.id} href={`/listing/${listing.id}`}>
                                                <div
                                                    onClick={() => setSelectedListing(listing)}
                                                    className={cn(
                                                        "flex gap-3 p-2.5 rounded-xl cursor-pointer transition-all border",
                                                        selectedListing?.id === listing.id ? "border-emerald-300 bg-emerald-50" : "border-transparent hover:bg-gray-50"
                                                    )}
                                                >
                                                    <img src={listing.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200"}
                                                        className="h-12 w-12 object-cover rounded-lg shrink-0" alt="" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 text-xs truncate">{listing.title}</p>
                                                        <p className="text-gray-400 text-xs truncate">{listing.location}</p>
                                                        <p className="text-emerald-600 font-black text-sm">Rs {price.toLocaleString()}<span className="text-gray-400 font-normal text-xs">/{unit}</span></p>
                                                    </div>
                                                    {listing.rating && (
                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                            <span className="text-xs font-bold text-gray-600">{listing.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
