"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Cloud, Navigation, Search, Loader } from "lucide-react";

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: string;
    lng: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Google Maps
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAdI9wBpbZMObHzJWbFP4JKDx0Z5RIsNJo&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 10,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    googleMapRef.current = map;

    map.addListener("click", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      setSelectedLocation({ lat: lat.toFixed(6), lng: lng.toFixed(6) });

      if (markerRef.current) markerRef.current.setMap(null);

      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#EF4444",
          fillOpacity: 1,
          strokeColor: "#FFF",
          strokeWeight: 2,
        },
      });
    });

    setMapLoaded(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !googleMapRef.current || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        googleMapRef.current.setCenter({ lat, lng });
        googleMapRef.current.setZoom(13);

        setSelectedLocation({ lat: lat.toFixed(6), lng: lng.toFixed(6) });

        if (markerRef.current) markerRef.current.setMap(null);

        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#EF4444",
            fillOpacity: 1,
            strokeColor: "#FFF",
            strokeWeight: 2,
          },
        });
      } else alert("Location not found. Please try again.");
    });
  };

  return (
    <div className="w-full min-h-screen bg-black text-white scroll-smooth">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-xl border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <motion.img
            src="src/assets/logo.png"
            alt="Logo"
            className="h-12 rounded"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          />

          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            {["Home", "Explore", "About"].map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className="hover:text-gray-300 transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </div>

          <Button
            variant="outline"
            className="border border-white text-white hover:bg-white hover:text-black px-5 py-2 text-sm"
          >
            Ask AI BOT
          </Button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section
        id="home"
        className="relative w-full h-screen flex items-center justify-center"
      >
        <div className="absolute inset-0 pt-16">
          <img
            src="src/assets/earth.png"
            alt="Earth"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <motion.div
          className="relative z-10 text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <span
            className="font-extrabold block leading-none"
            style={{
              fontSize: 150,
              WebkitTextStroke: "3px white",
              WebkitTextFillColor: "transparent",
            }}
          >
            CLIMATE
          </span>
          <motion.span
            className="font-extrabold block text-white"
            style={{ fontSize: 50 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            PREDICT
          </motion.span>
        </motion.div>
      </section>

      {/* Content / Map */}
      <section
        id="explore"
        className="w-full py-24 px-6 bg-gradient-to-b from-black to-gray-900 flex justify-center"
      >
        <div className="max-w-5xl w-full flex flex-col md:flex-row gap-10">
          {/* Map */}
          <motion.div
            className="flex-1 h-96 bg-gray-800/40 border border-gray-700 rounded-lg overflow-hidden shadow-lg relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="absolute top-4 left-4 right-4 z-10"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>

            <div ref={mapRef} className="w-full h-full" />

            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-400">Loading map...</p>
              </div>
            )}
          </motion.div>

          {/* Coordinates */}
          <motion.div
            className="flex-1 flex flex-col gap-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {selectedLocation ? (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-white flex flex-col gap-2">
                <div className="font-semibold">Latitude:</div>
                <div className="text-xl font-mono">{selectedLocation.lat}°</div>
                <div className="font-semibold">Longitude:</div>
                <div className="text-xl font-mono">{selectedLocation.lng}°</div>
                <Button className="mt-4 bg-white text-black hover:bg-gray-200">
                  Get Weather Data
                </Button>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-20">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                Click on the map to select a location
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
