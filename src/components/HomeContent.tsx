"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Thermometer,
  Snowflake,
  CloudRain,
  Search,
  Loader,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ProgressIndicator } from "@radix-ui/react-progress";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [data, setData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);

  const risks = [
    {
      type: "Extreme Heat",
      icon: <Thermometer className="w-6 h-6 text-red-500" />,
      value: 78,
    },
    {
      type: "Extreme Cold",
      icon: <Snowflake className="w-6 h-6 text-blue-500" />,
      value: 20,
    },
    {
      type: "Heavy Rain",
      icon: <CloudRain className="w-6 h-6 text-blue-700" />,
      value: 65,
    },
  ];

  const climateData = [
    { month: "Jan", temp: 15, rain: 30 },
    { month: "Feb", temp: 18, rain: 25 },
    { month: "Mar", temp: 22, rain: 40 },
    { month: "Apr", temp: 28, rain: 60 },
    { month: "May", temp: 32, rain: 80 },
    { month: "Jun", temp: 35, rain: 90 },
  ];

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
    });
    googleMapRef.current = map;

    // Click to select a location
    map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        animation: window.google.maps.Animation.DROP,
      });

      // Reverse geocode to fill input
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0])
          setSearchQuery(results[0].formatted_address);
      });
    });

    setMapLoaded(true);
  };

  // Search input → center map
  const handleSearchPlace = () => {
    if (!searchQuery || !googleMapRef.current || !window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        googleMapRef.current.setCenter(loc);
        googleMapRef.current.setZoom(13);
        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new window.google.maps.Marker({
          position: loc,
          map: googleMapRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      }
    });
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    setData({
      location: searchQuery,
      date: selectedDate,
      event: selectedEvent,
      risks,
    });
  };

  const handleDownloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "weather-details.json";
    link.click();
  };

  const handleDownloadCSV = () => {
    if (!data) return;
    const headers = ["Risk Type,Likelihood (%)"];
    const rows = data.risks.map((r) => `${r.type},${r.value}`);
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "weather-details.csv";
    link.click();
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // add blur after scrolling 50px
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="w-full min-h-screen text-white scroll-smooth"
      style={{ backgroundColor: "#ffffff" }}
    >
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/20 backdrop-blur-md border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-center py-4 px-6">
          <motion.img
            src={
              isScrolled
                ? "src/assets/Weatherly (1).svg"
                : "src/assets/Weatherly.svg"
            }
            alt="Logo"
            className="h-12 rounded mr-auto transition-all duration-500"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
        </div>
      </motion.nav>
      {/* Hero Section */}
      <section
        id="home"
        className="relative w-full h-screen flex items-center justify-center"
      >
        <div className="absolute inset-0 ">
          <img
            src="src/assets/image.png"
            alt="Earth"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/0" />
        </div>
        <motion.div
          className="relative z-10 space-y-6 px-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <span
            className=" leading-none"
            style={{
              fontSize: 110,
              fontFamily: "Lato",
              fontWeight: "bold",
            }}
          >
            Weatherly
          </span>
          <motion.span
            className=" block text-white"
            style={{ fontSize: 35, fontFamily: "Lato", marginTop: 12 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Becuase a perfect day deserves a perfect forecast
          </motion.span>
          <motion.div
            className="flex items-center gap-4 mt-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <motion.span
              className="text-lg  text-[#BFBFBF]"
              style={{ fontFamily: "Lato", width: "70%" }}
            >
              Weatherly is a modern, intuitive web application that delivers
              precise and up-to-date weather information directly from{" "}
              <span style={{ fontWeight: "bold", color: "#FFC107" }}>
                NASA’s
              </span>
              {"\n"}
              datasets.Whether you’re planning your day, tracking climate
              trends, or just curious about the skies.
            </motion.span>
          </motion.div>
          <motion.button
            className="px-7 py-3"
            style={{
              backgroundColor: "#87D0FF",
              borderRadius: 20,
              boxShadow: "0px 4px 4px rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "Lato",
                fontWeight: "bold",
                fontSize: 17,
                color: "black",
              }}
            >
              Start Planing your day
            </span>
          </motion.button>
        </motion.div>
      </section>
      {/* Intro Text */}
      <div className=" w-full justify-center py-5 px-40 text-black mt-8">
        <div className="w-full justify-center">
          <span className="text-2xl font-bold text-[#142636]">
            Plan your Perfect Day
          </span>
          <br />
          <span className="text-[#1a3243]">
            Click on map & choose date and event to get weather forecast
          </span>
        </div>
      </div>
      {/* Search Inputs */}
      <div className="w-full text-white mb-5">
        <div className="w-full justify-center text-black">
          <div className="py-0 px-40">
            <div className="flex items-center space-x-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location"
                onKeyDown={(e) => e.key === "Enter" && handleSearchPlace()}
                className="
              rounded-2xl 
              border border-gray-300 
            focus:border-blue-400 
    focus:ring-0 
    focus:outline-none 
    shadow-sm 
    focus:shadow-lg focus:shadow-blue-200
    px-4 py-2
    transition-all duration-300
  "
              />

              <Input
                className="w-50  rounded-2xl 
    border border-gray-300 
    focus:border-blue-400 
    focus:ring-0 
    focus:outline-none 
    shadow-sm 
    focus:shadow-lg focus:shadow-blue-200
    transition-all duration-300"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Select onValueChange={setSelectedEvent}>
                <SelectTrigger
                  className="w-60 border border-gray-300  rounded-2xl 
    focus:border-blue-400 
    focus:ring-0 
    focus:outline-none 
    shadow-sm 
    focus:shadow-lg focus:shadow-blue-200
    transition-all duration-300"
                >
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-3xl border border-gray-200">
                  <SelectItem value="event1">Event 1</SelectItem>
                  <SelectItem value="event2">Event 2</SelectItem>
                  <SelectItem value="event3">Event 3</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                className=" text-white hover:bg-gray-800 rounded-2xl w-30"
                style={{ backgroundColor: "#4ABD62" }}
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>

            {/* Map */}
            {!data && (
              <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 mt-5">
                <div ref={mapRef} className="w-full h-full mb-6"></div>
                {!mapLoaded && (
                  <div className="flex items-center justify-center bg-gray-100 h-full">
                    <div className="text-center">
                      <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Weather Report */}
          </div>

          <div className=" px-40">
            {data && (
              <>
                <div className="mt-6 shadow-lg shadow-blue-100 border border-gray-300 rounded-2xl p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-lg">
                        Weather Analysis for {data.location || "Demo Location"}
                      </h2>

                      <div className="w-fit bg-green-500 px-3 py-1 rounded-3xl mt-1 text-white text-sm font-medium">
                        Perfect for outdoor activities
                      </div>

                      <h3 className="mt-4 font-semibold text-gray-800">
                        Tips for a perfect day
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                        <li>Have a backup plan in case of emergencies</li>
                        <li>Stay hydrated and carry extra water</li>
                        <li>Wear comfortable clothing and sunscreen</li>
                        <li>Check the weather forecast before heading out</li>
                      </ul>
                    </div>

                    <div className="text-right">
                      <div className="justify-center items-center text-center">
                        <img src="src/assets/cloudy.png" className="w-32" />
                        <span>Partly Raining</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {data.risks.map((risk, i) => (
                    <div
                      key={i}
                      className="p-6 border rounded-2xl border-gray-200 shadow-lg shadow-blue-100 bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="border rounded-2xl border-gray-200 h-12 w-12 flex items-center justify-center">
                          {risk.icon}
                        </div>
                        <div>
                          <span className="text-xl font-bold">
                            {risk.value}%
                          </span>
                          <br />
                          <span className="text-sm text-gray-600">
                            Likelihood
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 font-semibold text-lg">
                        {risk.type}
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              risk.value < 30
                                ? "bg-green-500"
                                : risk.value < 60
                                ? "bg-yellow-400"
                                : risk.value < 80
                                ? "bg-orange-400"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${risk.value}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-gray-600">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Climate Trends */}
                <div className="border rounded-2xl border-gray-200 shadow-lg shadow-blue-100 p-6  bg-white mt-6">
                  <h2 className="font-bold text-lg mb-4">Climate Trends</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={climateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#ef4444"
                        name="Temperature °C"
                      />
                      <Line
                        type="monotone"
                        dataKey="rain"
                        stroke="#3b82f6"
                        name="Rainfall mm"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Download */}
                <div className="mt-6 mb-5 flex gap-4 justify-end">
                  <Button
                    onClick={handleDownloadJSON}
                    className=" text-white hover:bg-gray-800 rounded-2xl w-30"
                    style={{ backgroundColor: "#4A70BD" }}
                  >
                    Download JSON
                  </Button>
                  <Button
                    onClick={handleDownloadCSV}
                    className=" text-white hover:bg-gray-800 rounded-2xl w-30"
                    style={{ backgroundColor: "#4E4ABD" }}
                  >
                    Download CSV
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      \
      <footer className="bg-black text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and Intro */}
          <div>
            <img
              src="src/assets/Weatherly.svg"
              alt="Logo"
              className="h-14 mb-4"
            />
            <h3 className="font-semibold text-white mb-2">
              National Aeronautics and Space Administration
            </h3>
            <p className="text-sm leading-relaxed">
              We explore the unknown in air and space, innovate for the benefit
              of humanity, and inspire the world through discovery.
            </p>
            <div className="mt-3 space-x-2 text-sm">
              <a href="#mission" className="text-blue-400 hover:underline">
                About Our Mission
              </a>{" "}
              •{" "}
              <a href="#join" className="text-blue-400 hover:underline">
                Join Us →
              </a>
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h4 className="font-semibold text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#news" className="hover:underline">
                  News & Events
                </a>
              </li>
              <li>
                <a href="#multimedia" className="hover:underline">
                  Multimedia
                </a>
              </li>
              <li>
                <a href="#missions" className="hover:underline">
                  Missions
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-semibold text-white mb-3">Discover</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#space" className="hover:underline">
                  Humans in Space
                </a>
              </li>
              <li>
                <a href="#earth" className="hover:underline">
                  Earth
                </a>
              </li>
              <li>
                <a href="#solar" className="hover:underline">
                  The Solar System
                </a>
              </li>
              <li>
                <a href="#universe" className="hover:underline">
                  The Universe
                </a>
              </li>
              <li>
                <a href="#science" className="hover:underline">
                  Science
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-semibold text-white mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#aeronautics" className="hover:underline">
                  Aeronautics
                </a>
              </li>
              <li>
                <a href="#technology" className="hover:underline">
                  Technology
                </a>
              </li>
              <li>
                <a href="#resources" className="hover:underline">
                  Learning Resources
                </a>
              </li>
              <li>
                <a href="#about" className="hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="#spanish" className="hover:underline">
                  En Español
                </a>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex gap-4 mt-4 text-gray-400">
              <Facebook className="w-5 h-5 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-white cursor-pointer" />
              <Linkedin className="w-5 h-5 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-4 text-xs text-center text-gray-400">
          Page Last Updated: <span className="font-semibold">Sep 26, 2025</span>{" "}
          • Page Editor: <span className="font-semibold">Kalina Velev</span> •
          Responsible Official:{" "}
          <span className="font-semibold">Diana Logreira</span>
        </div>
      </footer>
    </div>
  );
}
