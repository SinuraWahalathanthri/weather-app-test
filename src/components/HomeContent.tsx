"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
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

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [data, setData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);

  // For cursor-following logo gradient
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const logoGradientX = useTransform(cursorX, (v) => `${v}px`);
  const logoGradientY = useTransform(cursorY, (v) => `${v}px`);

  useEffect(() => {
    const onMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [cursorX, cursorY]);

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

const getWeatherGradient = (condition) => {
  const baseBlue = "#1e3a5f"; // deep blue bottom
  const topColor = (() => {
    switch (condition?.toLowerCase()) {
      case "rain":
      case "rainy":
        return "#4b0082"; // purple tint
      case "cloudy":
        return "#64748b"; // slate gray tint
      case "clear":
      case "sunny":
        return "#f59e0b"; // warm orange/golden tint
      case "snow":
        return "#93c5fd"; // light icy blue tint
      case "storm":
        return "#4338ca"; // indigo stormy tint
      default:
        return "#334155"; // fallback muted slate
    }
  })();

  return `linear-gradient(to bottom, ${topColor} 0%, ${baseBlue} 80%)`;
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Updated handleSearch to also set weather condition
  const handleSearch = () => {
    if (!searchQuery) return;

    // Fake weather condition (later replace with API response)
    const conditions = ["Sunny", "Rainy", "Cloudy", "Snow", "Storm"];
    const randomCondition =
      conditions[Math.floor(Math.random() * conditions.length)];

    setData({
      location: searchQuery,
      date: selectedDate,
      event: selectedEvent,
      condition: randomCondition, // 👈 Add condition
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

  // Animation variants
  const navLinkVariant = {
    hidden: { opacity: 0, y: -8 },
    show: { opacity: 1, y: 0 },
  };
  const cardList = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const cardVariant = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120 },
    },
  };

  return (
    <div
      className="w-full min-h-screen text-white scroll-smooth"
      style={{ backgroundColor: "#f7fbff" }}
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
        <div className="max-w-7xl mx-auto flex items-center py-4 px-6">
          {/* Logo - gradient reacts to cursor position */}
          <motion.div
            className="mr-auto flex items-center gap-4 cursor-pointer"
            style={{
              WebkitMaskImage: "none",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.img
              src={
                isScrolled
                  ? "src/assets/Weatherly (1).svg"
                  : "src/assets/Weatherly.svg"
              }
              alt="Logo"
              className="h-12 rounded transition-all duration-500"
              whileHover={{ scale: 1.05 }}
              style={{
                // dynamic CSS variable for gradient center (used by overlay)
                transformOrigin: "center",
              }}
            />
            <motion.div
              className="text-sm hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ fontWeight: 700, color: "#0f172a" }}>Weatherly</div>
              <div style={{ fontSize: 11, color: "#475569" }}>
                Smart forecasts
              </div>
            </motion.div>
          </motion.div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            {["Home", "Explore", "About", "Insights"].map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                initial="hidden"
                animate="show"
                variants={navLinkVariant}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="hover:text-gray-700 transition-colors text-gray-800"
                whileHover={{ scale: 1.05 }}
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
      <div className=" w-full justify-center py-6 px-6 md:px-40 text-black mt-8">
        <div className="w-full justify-center">
          <motion.span
            className="text-2xl font-bold text-[#142636]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Plan your Perfect Day
          </motion.span>
          <br />
          <motion.span
            className="text-[#1a3243]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            Click on map & choose date and event to get weather forecast
          </motion.span>
        </div>
      </div>

      {/* Search Inputs */}
      <div className="w-full text-white">
        <div className="w-full justify-center text-black">
          <div className="py-0 px-6 md:px-40">
            <motion.div
              className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location"
                onKeyDown={(e) => e.key === "Enter" && handleSearchPlace()}
                className={`rounded-2xl border border-gray-300 focus:border-blue-400 focus:ring-0 focus:outline-none shadow-sm focus:shadow-lg focus:shadow-blue-200 px-4 py-2 transition-all duration-300 w-full md:w-1/2`}
              />

              <Input
                className="w-full md:w-1/6 rounded-2xl border border-gray-300 focus:border-blue-400 focus:ring-0 focus:outline-none shadow-sm focus:shadow-lg focus:shadow-blue-200 transition-all duration-300"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <Select onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-full md:w-1/6 border border-gray-300 rounded-2xl focus:border-blue-400 focus:ring-0 focus:outline-none shadow-sm focus:shadow-lg focus:shadow-blue-200 transition-all duration-300">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-3xl border border-gray-200">
                  <SelectItem value="event1">Event 1</SelectItem>
                  <SelectItem value="event2">Event 2</SelectItem>
                  <SelectItem value="event3">Event 3</SelectItem>
                </SelectContent>
              </Select>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  onClick={handleSearch}
                  className=" text-white hover:bg-gray-800 rounded-2xl w-full md:w-auto px-5 py-2"
                  style={{ backgroundColor: "#4ABD62" }}
                >
                  <Search className="w-4 h-4 mr-2 inline-block" /> Search
                </Button>
              </motion.div>
            </motion.div>

            {/* Map */}
            {!data && (
              <motion.div
                className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 mt-5 mb-16"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <div ref={mapRef} className="w-full h-full mb-6" />
                {!mapLoaded && (
                  <div className="flex items-center justify-center bg-gray-100 h-full">
                    <div className="text-center">
                      <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Weather Report */}
          </div>

          <div className=" px-6 md:px-40">
            {data && (
              <motion.div initial="hidden" animate="show" variants={cardList}>
                <motion.div
                  className="mt-6 shadow-lg border border-gray-300 rounded-2xl p-6 bg-white"
                  variants={cardVariant}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="font-bold text-lg text-[#0f172a]">
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
                        <img
                          src="src/assets/cloudy.png"
                          className="w-32 mx-auto"
                          alt="cloudy"
                        />
                        <motion.span
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="block mt-2"
                        >
                          Partly Raining
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Risk Cards */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
                  variants={cardList}
                >
                  {data.risks.map((risk, i) => (
                    <motion.div
                      key={i}
                      className="p-6 border rounded-2xl border-gray-200 shadow-lg bg-white"
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="border rounded-2xl border-gray-200 h-12 w-12 flex items-center justify-center">
                          {risk.icon}
                        </div>
                        <div>
                          <span className="text-xl font-bold text-[#0f172a]">
                            {risk.value}%
                          </span>
                          <br />
                          <span className="text-sm text-gray-600">
                            Likelihood
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 font-semibold text-lg text-[#0f172a]">
                        {risk.type}
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${risk.value}%` }}
                            transition={{ duration: 1.2 }}
                            style={{
                              background:
                                risk.value < 30
                                  ? "linear-gradient(90deg,#34d399,#059669)"
                                  : risk.value < 60
                                  ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                                  : risk.value < 80
                                  ? "linear-gradient(90deg,#fb923c,#f97316)"
                                  : "linear-gradient(90deg,#ef4444,#dc2626)",
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-gray-600">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Climate Trends */}
                <motion.div
                  className="border rounded-2xl border-gray-200 shadow-lg p-6 bg-white mt-6"
                  variants={cardVariant}
                >
                  <h2 className="font-bold text-lg mb-4 text-[#0f172a]">
                    Climate Trends
                  </h2>
                  <div style={{ width: "100%", height: 300 }}>
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
                </motion.div>

                {/* Download */}
                <motion.div
                  className="mt-6 mb-5 flex gap-4 justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.12 }}
                >
                  <motion.button
                    onClick={handleDownloadJSON}
                    className=" text-white hover:bg-gray-800 rounded-2xl w-30 px-4 py-2"
                    style={{ backgroundColor: "#4A70BD" }}
                    whileHover={{ scale: 1.03 }}
                  >
                    Download JSON
                  </motion.button>
                  <motion.button
                    onClick={handleDownloadCSV}
                    className=" text-white hover:bg-gray-800 rounded-2xl w-30 px-4 py-2"
                    style={{ backgroundColor: "#4E4ABD" }}
                    whileHover={{ scale: 1.03 }}
                  >
                    Download CSV
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </div>
          <div>
            {data && (
              <motion.div
                style={{
                  background: getWeatherGradient(data?.condition || "default"),
                }}
                variants={cardVariant}
                transition={{ type: "spring", stiffness: 200 }}
                className="py-15"
              >
                <motion.div className=" px-6 md:px-40 text-white mb-10">
                  <motion.span
                    className="text-2xl font-bold text-[#ffffff]"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Stats for Nerds
                  </motion.span>
                  <br />
                  <motion.span
                    className="text-[#ffffff]"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                  >
                    Go beyond the basics: explore temperature variations,
                    humidity levels, pressure changes, wind speeds, and more –
                    the complete data story behind today’s weather, tailored for
                    curious minds
                  </motion.span>
                </motion.div>

                {/* Detailed Weather Cards */}
                <div className="px-6 md:px-40">
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
                    variants={cardList}
                  >
                    {/* Temperature Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg relative overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        Temperature
                      </h3>

                      <div className="relative mb-6">
                        <svg viewBox="0 0 200 120" className="w-full">
                          <path
                            d="M 10,80 Q 60,40 100,60 T 190,50"
                            fill="none"
                            stroke="url(#tempGradient)"
                            strokeWidth="3"
                          />
                          <circle cx="100" cy="60" r="6" fill="#4dd4ac" />
                          <defs>
                            <linearGradient
                              id="tempGradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="#4dd4ac" />
                              <stop offset="100%" stopColor="#4dd4ac" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-white">
                          57°
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-white text-sm">Steady</span>
                      </div>
                      <p className="text-gray-300 text-xs mt-1">
                        Steady at current value of 57°.
                      </p>
                    </motion.div>

                    {/* Feels Like Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        Feels like
                      </h3>

                      <div className="relative mb-6">
                        <svg viewBox="0 0 200 120" className="w-full">
                          <path
                            d="M 10,70 Q 100,60 190,70"
                            fill="none"
                            stroke="url(#feelsGradient)"
                            strokeWidth="3"
                          />
                          <circle cx="190" cy="70" r="6" fill="#7dd3fc" />
                          <defs>
                            <linearGradient
                              id="feelsGradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="#7dd3fc" />
                              <stop offset="100%" stopColor="#7dd3fc" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      <div className="text-sm text-gray-300 mb-2">
                        Dominant factor: none
                      </div>
                      <div className="flex justify-between items-baseline mb-3">
                        <div>
                          <span className="text-xs text-gray-400">
                            Feels like:
                          </span>
                          <span className="text-3xl font-bold text-white ml-2">
                            57°
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">
                            Temperature:
                          </span>
                          <span className="text-3xl font-bold text-white ml-2">
                            57°
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-white text-sm">Comfortable</span>
                      </div>
                    </motion.div>

                    {/* Cloud Cover Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        Cloud cover
                      </h3>

                      <div className="flex justify-center mb-6">
                        <div className="relative w-32 h-32">
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full -rotate-90"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#374151"
                              strokeWidth="8"
                            />
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#60a5fa"
                              strokeWidth="8"
                              strokeDasharray="251.2"
                              initial={{ strokeDashoffset: 251.2 }}
                              animate={{ strokeDashoffset: 251.2 * 0.95 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              Clear
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-white text-sm">Clear (5%)</span>
                      </div>
                      <p className="text-gray-300 text-xs mt-1 text-center">
                        Steady with sunny sky at 1:35 AM.
                      </p>
                    </motion.div>

                    {/* Precipitation Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        Precipitation
                      </h3>

                      <div className="flex justify-center mb-6">
                        <div className="relative w-32 h-32">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#374151"
                              strokeWidth="2"
                            />
                            <text
                              x="50"
                              y="55"
                              textAnchor="middle"
                              className="text-4xl font-bold fill-white"
                            >
                              0
                            </text>
                            <text
                              x="50"
                              y="70"
                              textAnchor="middle"
                              className="text-sm fill-white"
                            >
                              in
                            </text>
                          </svg>
                          <div className="absolute bottom-2 left-0 right-0 text-center">
                            <span className="text-xs text-gray-300">
                              In next 24h
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-white text-sm">
                          No Precipitation
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs mt-1">
                        Rain expected on Tuesday night. Today is expected to see
                        similar precipitation as...
                      </p>
                    </motion.div>

                    {/* Wind Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        Wind
                      </h3>

                      <div className="flex justify-between items-start mb-6">
                        <div className="relative w-24 h-24">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#374151"
                              strokeWidth="1"
                            />
                            <line
                              x1="50"
                              y1="50"
                              x2="50"
                              y2="10"
                              stroke="#4b5563"
                              strokeWidth="1"
                            />
                            <line
                              x1="50"
                              y1="50"
                              x2="90"
                              y2="50"
                              stroke="#4b5563"
                              strokeWidth="1"
                            />
                            <line
                              x1="50"
                              y1="50"
                              x2="50"
                              y2="90"
                              stroke="#4b5563"
                              strokeWidth="1"
                            />
                            <line
                              x1="50"
                              y1="50"
                              x2="10"
                              y2="50"
                              stroke="#4b5563"
                              strokeWidth="1"
                            />

                            <text
                              x="50"
                              y="8"
                              textAnchor="middle"
                              className="text-xs fill-gray-400"
                            >
                              N
                            </text>
                            <text
                              x="92"
                              y="53"
                              textAnchor="start"
                              className="text-xs fill-gray-400"
                            >
                              E
                            </text>
                            <text
                              x="50"
                              y="98"
                              textAnchor="middle"
                              className="text-xs fill-gray-400"
                            >
                              S
                            </text>
                            <text
                              x="8"
                              y="53"
                              textAnchor="end"
                              className="text-xs fill-gray-400"
                            >
                              W
                            </text>

                            <motion.path
                              d="M 50,50 L 75,35"
                              stroke="#60a5fa"
                              strokeWidth="3"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1 }}
                            />
                            <motion.polygon
                              points="75,35 73,39 77,39"
                              fill="#60a5fa"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8 }}
                            />
                          </svg>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-300 mb-2">
                            From ESE (123°)
                          </p>
                          <div className="mb-2">
                            <span className="text-4xl font-bold text-white">
                              3
                            </span>
                            <span className="text-sm text-gray-300 ml-1">
                              mph
                            </span>
                            <p className="text-xs text-gray-400">Wind Speed</p>
                          </div>
                          <div>
                            <span className="text-4xl font-bold text-white">
                              4
                            </span>
                            <span className="text-sm text-gray-300 ml-1">
                              mph
                            </span>
                            <p className="text-xs text-gray-400">Wind Gust</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-white text-sm">
                          Force: 1 (Light Air)
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs mt-1">
                        Steady with averages holding at 2 mph (gusts to 4)
                        expected from S through morning.
                      </p>
                    </motion.div>

                    {/* Humidity Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        Humidity
                      </h3>

                      <div className="flex justify-center gap-1 mb-6 h-24 items-end">
                        {[65, 70, 55, 75, 80, 85, 83].map((height, i) => (
                          <motion.div
                            key={i}
                            className="w-8 rounded-t-lg"
                            style={{
                              background:
                                "linear-gradient(to top, #3b82f6, #60a5fa)",
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-3xl font-bold text-white">
                            83%
                          </span>
                          <p className="text-xs text-gray-400">
                            Relative Humidity
                          </p>
                        </div>
                        <div>
                          <span className="text-3xl font-bold text-white">
                            52°
                          </span>
                          <p className="text-xs text-gray-400">Dew point</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-white text-sm">Normal</span>
                      </div>
                      <p className="text-gray-300 text-xs mt-1">
                        Steady at 89%.
                      </p>
                    </motion.div>

                    {/* UV Index Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        UV Index
                      </h3>

                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <svg width="160" height="80" viewBox="0 0 160 80">
                            <defs>
                              <linearGradient
                                id="uvGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#22c55e" />
                                <stop offset="20%" stopColor="#eab308" />
                                <stop offset="40%" stopColor="#f97316" />
                                <stop offset="60%" stopColor="#ef4444" />
                                <stop offset="80%" stopColor="#a855f7" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M 20,70 A 60,60 0 0,1 140,70"
                              fill="none"
                              stroke="url(#uvGradient)"
                              strokeWidth="12"
                              strokeLinecap="round"
                            />
                            <motion.line
                              x1="80"
                              y1="70"
                              x2="50"
                              y2="30"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              initial={{ rotate: -60 }}
                              animate={{ rotate: -78 }}
                              style={{ transformOrigin: "80px 70px" }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                            <circle cx="80" cy="70" r="6" fill="white" />
                          </svg>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                            <span className="text-4xl font-bold text-white">
                              2
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-white text-sm">Low</span>
                      </div>
                      <p className="text-gray-300 text-xs mt-1 text-center">
                        No protection required. You can safely stay outside.
                      </p>
                    </motion.div>

                    {/* Visibility Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        Visibility
                      </h3>

                      <div className="relative mb-6 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className="w-20 h-20 rounded-full"
                            style={{
                              background:
                                "radial-gradient(circle, rgba(147,197,253,0.4) 0%, rgba(59,130,246,0) 70%)",
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <div className="relative z-10">
                          <span className="text-5xl font-bold text-white">
                            10
                          </span>
                          <span className="text-xl text-gray-300 ml-1">mi</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-white text-sm">Excellent</span>
                      </div>
                      <p className="text-gray-300 text-xs mt-1 text-center">
                        Clear visibility for driving and outdoor activities.
                      </p>
                    </motion.div>

                    {/* Pressure Card */}
                    <motion.div
                      className="p-6 rounded-2xl shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                      }}
                      variants={cardVariant}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      <h3 className="text-white text-sm font-medium mb-6">
                        Pressure
                      </h3>

                      <div className="relative mb-6">
                        <svg viewBox="0 0 200 100" className="w-full">
                          <defs>
                            <linearGradient
                              id="pressureGradient"
                              x1="0%"
                              y1="0%"
                              x2="0%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity="0.3"
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                          <motion.path
                            d="M 10,70 L 40,60 L 70,55 L 100,50 L 130,52 L 160,48 L 190,45"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5 }}
                          />
                          <path
                            d="M 10,70 L 40,60 L 70,55 L 100,50 L 130,52 L 160,48 L 190,45 L 190,100 L 10,100 Z"
                            fill="url(#pressureGradient)"
                          />
                        </svg>
                      </div>

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-bold text-white">
                          30.12
                        </span>
                        <span className="text-sm text-gray-300">inHg</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-white text-sm">Rising</span>
                      </div>
                      <p className="text-gray-300 text-xs mt-1">
                        Pressure is rising, indicating improving weather
                        conditions.
                      </p>
                    </motion.div>
                  </motion.div>
                  {/* Weather Trends Chart */}
                  <motion.div
                    className="border rounded-2xl border-gray-200 shadow-lg p-6 bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] mt-6"
                    variants={cardVariant}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-bold text-lg text-white">
                        Weather Trends
                      </h2>
                      <div className="flex gap-4 text-sm">
                        <button className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                          Last 12 months
                        </button>
                        <button className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                          All months
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-4">
                      <button className="px-4 py-2 bg-yellow-400 text-black rounded-full text-sm font-medium">
                        Temperature
                      </button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-colors">
                        Precipitation
                      </button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-colors">
                        Humidity
                      </button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-colors">
                        Wind
                      </button>
                    </div>

                    <div style={{ width: "100%", height: 400 }}>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={[
                            {
                              month: "Dec",
                              high: 45,
                              low: 28,
                              avgHigh: 48,
                              avgLow: 32,
                            },
                            {
                              month: "Jan",
                              high: 42,
                              low: 25,
                              avgHigh: 46,
                              avgLow: 30,
                            },
                            {
                              month: "Feb",
                              high: 50,
                              low: 30,
                              avgHigh: 52,
                              avgLow: 35,
                            },
                            {
                              month: "Mar",
                              high: 65,
                              low: 42,
                              avgHigh: 62,
                              avgLow: 45,
                            },
                            {
                              month: "Apr",
                              high: 75,
                              low: 50,
                              avgHigh: 72,
                              avgLow: 52,
                            },
                            {
                              month: "May",
                              high: 85,
                              low: 60,
                              avgHigh: 82,
                              avgLow: 62,
                            },
                            {
                              month: "Jun",
                              high: 95,
                              low: 70,
                              avgHigh: 90,
                              avgLow: 72,
                            },
                            {
                              month: "Jul",
                              high: 100,
                              low: 75,
                              avgHigh: 95,
                              avgLow: 75,
                            },
                            {
                              month: "Aug",
                              high: 98,
                              low: 73,
                              avgHigh: 93,
                              avgLow: 73,
                            },
                            {
                              month: "Sep",
                              high: 88,
                              low: 65,
                              avgHigh: 85,
                              avgLow: 65,
                            },
                            {
                              month: "Oct",
                              high: 72,
                              low: 50,
                              avgHigh: 70,
                              avgLow: 52,
                            },
                            {
                              month: "Nov",
                              high: 55,
                              low: 35,
                              avgHigh: 58,
                              avgLow: 38,
                            },
                          ]}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.1)"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="#ffffff"
                            tick={{ fill: "#ffffff" }}
                          />
                          <YAxis
                            stroke="#ffffff"
                            tick={{ fill: "#ffffff" }}
                            label={{
                              value: "°F",
                              angle: -90,
                              position: "insideLeft",
                              fill: "#ffffff",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e3a5f",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "8px",
                              color: "#ffffff",
                            }}
                          />
                          <Legend
                            wrapperStyle={{ color: "#ffffff" }}
                            iconType="line"
                          />
                          <Line
                            type="monotone"
                            dataKey="high"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ fill: "#ef4444", r: 3 }}
                            name="Daily high"
                          />
                          <Line
                            type="monotone"
                            dataKey="low"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: "#3b82f6", r: 3 }}
                            name="Daily low"
                          />
                          <Line
                            type="monotone"
                            dataKey="avgHigh"
                            stroke="#fbbf24"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Average high"
                          />
                          <Line
                            type="monotone"
                            dataKey="avgLow"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Average low"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex gap-6 text-xs text-gray-300 mt-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-red-500"></div>
                        <span>Daily high</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-blue-500"></div>
                        <span>Daily low</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-yellow-400 opacity-70"></div>
                        <span>Historical daily temperature</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-blue-300 opacity-70"></div>
                        <span>30 day forecast</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-black text-gray-300 ">
        <div className="max-w-7xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and Intro */}
          <div>
            <motion.img
              src="src/assets/Weatherly.svg"
              alt="Logo"
              className="h-14 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <motion.h3
              className="font-semibold text-white mb-2"
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              National Aeronautics and Space Administration
            </motion.h3>
            <motion.p
              className="text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.08 } }}
            >
              We explore the unknown in air and space, innovate for the benefit
              of humanity, and inspire the world through discovery.
            </motion.p>
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
              <motion.div whileHover={{ y: -4 }}>
                <Facebook className="w-5 h-5 hover:text-white cursor-pointer" />
              </motion.div>
              <motion.div whileHover={{ y: -4 }}>
                <Instagram className="w-5 h-5 hover:text-white cursor-pointer" />
              </motion.div>
              <motion.div whileHover={{ y: -4 }}>
                <Twitter className="w-5 h-5 hover:text-white cursor-pointer" />
              </motion.div>
              <motion.div whileHover={{ y: -4 }}>
                <Linkedin className="w-5 h-5 hover:text-white cursor-pointer" />
              </motion.div>
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
