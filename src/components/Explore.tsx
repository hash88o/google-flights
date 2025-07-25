import { useState, useEffect, useRef } from "react";
import "./Explore.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendarWeek,
  faMagnifyingGlass,
  faChevronDown,
  faLocationDot,
  faExchangeAlt,
  faPlane,
  faFilter,
  faTimes,
  faMap,
} from "@fortawesome/free-solid-svg-icons";
import { flightAPI } from "../services/FlightAPI";
import type {
  FlightSearchParams,
  FlightSearchResponse,
  FlightResult,
} from "../services/FlightAPI";
import { useLocation, useNavigate } from "react-router-dom";

console.log("Explore.tsx: Imports loaded successfully");

// Declare mapboxgl for TypeScript
declare global {
  interface Window {
    mapboxgl: any;
  }
}

interface ExploreProps {
  onBackToHome?: () => void;
}

function Explore({ onBackToHome }: ExploreProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    fromLocation: initialFrom,
    toLocation: initialTo,
    departDate: initialDepart,
    returnDate: initialReturn,
    passengers: initialPassengers,
    cabinClass: initialCabin,
    tripType: initialTripType,
    adults: initialAdults,
    children: initialChildren,
    infantsInSeat: initialInfantsInSeat,
    infantsOnLap: initialInfantsOnLap,
  } = location.state || {};

  const [tripType, setTripType] = useState(initialTripType || "roundtrip");
  const [fromLocation, setFromLocation] = useState(initialFrom || "Mumbai");
  const [toLocation, setToLocation] = useState(initialTo || "");
  const [departDate, setDepartDate] = useState(
    initialDepart ||
      (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
      })
  );
  const [returnDate, setReturnDate] = useState(
    initialReturn ||
      (() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 8);
        return nextWeek.toISOString().split("T")[0];
      })
  );
  const [passengers, setPassengers] = useState(
    initialPassengers || initialAdults || 1
  );
  const [cabinClass, setCabinClass] = useState(initialCabin || "Economy");

  // Flight search results
  const [searchResults, setSearchResults] =
    useState<FlightSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentMarkers, setCurrentMarkers] = useState<any[]>([]);

  const [showCalendar, setShowCalendar] = useState<null | "depart" | "return">(
    null
  );
  const [tempDepartDate, setTempDepartDate] = useState(departDate);
  const [tempReturnDate, setTempReturnDate] = useState(returnDate);

  // Passenger dropdown state (mirroring Form.tsx)
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [tempAdults, setTempAdults] = useState(passengers);
  const [tempChildren, setTempChildren] = useState(0);
  const [tempInfantsInSeat, setTempInfantsInSeat] = useState(0);
  const [tempInfantsOnLap, setTempInfantsOnLap] = useState(0);

  // Dynamic destinations based on search results
  const [destinations, setDestinations] = useState([
    { name: "Reykjavik", price: "$689", lat: 64.1466, lng: -21.9426 },
    { name: "Stockholm", price: "$459", lat: 59.3293, lng: 18.0686 },
    { name: "Oslo", price: "$459", lat: 59.9139, lng: 10.7522 },
    { name: "Berlin", price: "$267", lat: 52.52, lng: 13.405 },
    { name: "Paris", price: "$177", lat: 48.8566, lng: 2.3522 },
    { name: "Prague", price: "$177", lat: 50.0755, lng: 14.4378 },
    { name: "Rome", price: "$177", lat: 41.9028, lng: 12.4964 },
    { name: "Venice", price: "$177", lat: 45.4408, lng: 12.3155 },
    { name: "Vienna", price: "$177", lat: 48.2082, lng: 16.3738 },
    { name: "Munich", price: "$177", lat: 48.1351, lng: 11.582 },
    { name: "Zurich", price: "$177", lat: 47.3769, lng: 8.5417 },
    { name: "Amsterdam", price: "$177", lat: 52.3676, lng: 4.9041 },
    { name: "Brussels", price: "$177", lat: 50.8503, lng: 4.3517 },
    { name: "London", price: "$177", lat: 51.5074, lng: -0.1278 },
  ]);

  const filterBarRef = useRef<HTMLDivElement>(null);

  // Track if all fields are filled
  const allFieldsFilled = fromLocation && toLocation && departDate;

  // Auto-search when inputs change with debounce
  useEffect(() => {
    if (allFieldsFilled) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromLocation,
    toLocation,
    departDate,
    returnDate,
    tripType,
    passengers,
    cabinClass,
  ]);

  // Helper function to format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get coordinates for a location name
  const getLocationCoordinates = (locationName: string) => {
    if (!locationName || typeof locationName !== "string") {
      console.warn("Invalid location name provided:", locationName);
      return null;
    }

    const locationMap: { [key: string]: { lat: number; lng: number } } = {
      mumbai: { lat: 19.076, lng: 72.8777 },
      delhi: { lat: 28.7041, lng: 77.1025 },
      bangalore: { lat: 12.9716, lng: 77.5946 },
      chennai: { lat: 13.0827, lng: 80.2707 },
      kolkata: { lat: 22.5726, lng: 88.3639 },
      hyderabad: { lat: 17.385, lng: 78.4867 },
      pune: { lat: 18.5204, lng: 73.8567 },
      london: { lat: 51.5074, lng: -0.1278 },
      paris: { lat: 48.8566, lng: 2.3522 },
      "new york": { lat: 40.7128, lng: -74.006 },
      dubai: { lat: 25.2048, lng: 55.2708 },
      singapore: { lat: 1.3521, lng: 103.8198 },
      tokyo: { lat: 35.6762, lng: 139.6503 },
      sydney: { lat: -33.8688, lng: 151.2093 },
      "los angeles": { lat: 34.0522, lng: -118.2437 },
      "san francisco": { lat: 37.7749, lng: -122.4194 },
      lisbon: { lat: 38.7223, lng: -9.1393 },
      rome: { lat: 41.9028, lng: 12.4964 },
      amsterdam: { lat: 52.3676, lng: 4.9041 },
    };

    try {
      const normalizedLocation = locationName.toLowerCase().trim();
      const coords = locationMap[normalizedLocation];

      if (coords && !isNaN(coords.lat) && !isNaN(coords.lng)) {
        return coords;
      }

      console.warn(`No coordinates found for location: ${locationName}`);
      return null;
    } catch (error) {
      console.error("Error getting location coordinates:", error);
      return null;
    }
  };

  // Update map view to show relevant markers
  const updateMapView = () => {
    if (!map.current || !mapLoaded) return;

    try {
      const fromCoords = getLocationCoordinates(fromLocation);
      const toCoords = getLocationCoordinates(toLocation);

      if (
        fromCoords &&
        toCoords &&
        !isNaN(fromCoords.lat) &&
        !isNaN(fromCoords.lng) &&
        !isNaN(toCoords.lat) &&
        !isNaN(toCoords.lng)
      ) {
        // Calculate bounds to include both locations
        const bounds = new window.mapboxgl.LngLatBounds();
        bounds.extend([fromCoords.lng, fromCoords.lat]);
        bounds.extend([toCoords.lng, toCoords.lat]);

        // Fit map to bounds with padding
        map.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 6,
        });
      } else if (toCoords && !isNaN(toCoords.lat) && !isNaN(toCoords.lng)) {
        // Center on destination
        map.current.flyTo({
          center: [toCoords.lng, toCoords.lat],
          zoom: 6,
          duration: 1000,
        });
      }
    } catch (error) {
      console.error("Error updating map view:", error);
    }
  };

  // Add FROM and TO markers with connecting line
  const addRouteMarkers = () => {
    if (!map.current || !mapLoaded || !fromLocation || !toLocation) return;

    try {
      const fromCoords = getLocationCoordinates(fromLocation);
      const toCoords = getLocationCoordinates(toLocation);

      if (!fromCoords || !toCoords) {
        console.warn("Could not get coordinates for route markers");
        return;
      }

      // Create FROM marker (green)
      const fromMarkerElement = document.createElement("div");
      fromMarkerElement.innerHTML = `
        <div style="
          background: #34a853;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">A</div>
      `;

      const fromMarker = new window.mapboxgl.Marker(fromMarkerElement)
        .setLngLat([fromCoords.lng, fromCoords.lat])
        .addTo(map.current);

      // Create TO marker (red)
      const toMarkerElement = document.createElement("div");
      toMarkerElement.innerHTML = `
        <div style="
          background: #ea4335;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">B</div>
      `;

      const toMarker = new window.mapboxgl.Marker(toMarkerElement)
        .setLngLat([toCoords.lng, toCoords.lat])
        .addTo(map.current);

      // Add route line
      if (map.current.getSource("route")) {
        map.current.removeLayer("route");
        map.current.removeSource("route");
      }

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [fromCoords.lng, fromCoords.lat],
              [toCoords.lng, toCoords.lat],
            ],
          },
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1a73e8",
          "line-width": 3,
          "line-opacity": 0.8,
        },
      });

      // Store markers for cleanup
      setCurrentMarkers((prev) => [...prev, fromMarker, toMarker]);
    } catch (error) {
      console.error("Error adding route markers:", error);
    }
  };

  // Clear existing markers and route line
  const clearMarkers = () => {
    currentMarkers.forEach((marker) => marker.remove());
    setCurrentMarkers([]);

    // Remove route line if it exists
    if (map.current && map.current.getSource("route")) {
      try {
        map.current.removeLayer("route");
        map.current.removeSource("route");
      } catch (error) {
        // Layer might not exist, ignore error
      }
    }
  };

  // Add markers based on search results
  const addSearchResultMarkers = () => {
    if (
      !map.current ||
      !mapLoaded ||
      !searchResults?.success ||
      !searchResults.data
    )
      return;

    clearMarkers();
    const newMarkers: any[] = [];

    // Default fallback coordinates (Paris)
    const defaultCoords = { lat: 48.8566, lng: 2.3522 };

    // Update destinations based on search results
    const newDestinations = searchResults.data.outbound.map((flight, index) => {
      const destinationName = flight.destination || toLocation;
      const destinationCoords = getLocationCoordinates(destinationName);

      // Ensure we always have valid coordinates
      let finalCoords = defaultCoords;

      if (
        destinationCoords &&
        !isNaN(destinationCoords.lat) &&
        !isNaN(destinationCoords.lng)
      ) {
        finalCoords = destinationCoords;
      } else if (index < destinations.length) {
        const fallbackDest = destinations[index];
        if (
          fallbackDest &&
          !isNaN(fallbackDest.lat) &&
          !isNaN(fallbackDest.lng)
        ) {
          finalCoords = { lat: fallbackDest.lat, lng: fallbackDest.lng };
        }
      }

      return {
        name: destinationName,
        price: `$${flight.price.amount}`,
        lat: finalCoords.lat,
        lng: finalCoords.lng,
        flight: flight,
      };
    });

    setDestinations(newDestinations);

    // Add markers for each flight result
    newDestinations.forEach((destination) => {
      // Double-check coordinates before creating marker
      if (isNaN(destination.lat) || isNaN(destination.lng)) {
        console.warn(
          `Skipping marker for ${destination.name} due to invalid coordinates:`,
          destination.lat,
          destination.lng
        );
        return;
      }

      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `
        <div class="price-marker">
          <span class="price-text">${destination.price}</span>
        </div>
      `;

      markerElement.addEventListener("click", () => {
        handleDestinationClick(destination);
      });

      try {
        const marker = new window.mapboxgl.Marker(markerElement)
          .setLngLat([destination.lng, destination.lat])
          .addTo(map.current);

        newMarkers.push(marker);
      } catch (error) {
        console.error(
          `Failed to create marker for ${destination.name}:`,
          error
        );
      }
    });

    setCurrentMarkers(newMarkers);
    updateMapView();
    addRouteMarkers(); // Call this after search results are processed
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Load Mapbox GL JS
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
    script.onload = initializeMap;
    document.head.appendChild(script);

    const link = document.createElement("link");
    link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && searchResults?.success) {
      try {
        addSearchResultMarkers();
      } catch (error) {
        console.error("Error adding search result markers:", error);
        // Clear any partial markers that might have been added
        clearMarkers();
      }
    }
  }, [mapLoaded, searchResults]);

  // Update route markers when locations change
  useEffect(() => {
    if (mapLoaded && fromLocation && toLocation) {
      addRouteMarkers();
    }
  }, [mapLoaded, fromLocation, toLocation]);

  const initializeMap = () => {
    if (!window.mapboxgl || !mapContainer.current) return;

    window.mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [2.3522, 48.8566], // Paris as center
      zoom: 4,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      addDestinationMarkers();
      addRouteMarkers(); // Add route markers when map loads
    });
  };

  const addDestinationMarkers = () => {
    if (!map.current || !mapLoaded) return;

    destinations.forEach((destination) => {
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `
        <div class="price-marker">
          <span class="price-text">${destination.price}</span>
        </div>
      `;

      markerElement.addEventListener("click", () => {
        handleDestinationClick(destination);
      });

      new window.mapboxgl.Marker(markerElement)
        .setLngLat([destination.lng, destination.lat])
        .addTo(map.current);
    });
  };

  const handleDestinationClick = (destination: any) => {
    console.log("Selected destination:", destination);
    setToLocation(destination.name);
  };

  const handleSearch = async () => {
    if (!fromLocation || !toLocation || !departDate) {
      console.warn("Missing required search parameters");
      return;
    }

    setLoading(true);
    setSearchResults(null);

    const searchParams: FlightSearchParams = {
      origin: fromLocation,
      destination: toLocation,
      departureDate: departDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      adults: tempAdults,
      children: tempChildren,
      infants: 0,
      infantsInSeat: 0,
      cabinClass: cabinClass.toLowerCase(),
      tripType: tripType,
    };

    try {
      console.log("Searching flights with params:", searchParams);
      const response = await flightAPI.searchFlights(searchParams);
      console.log("Flight search response:", response);

      setSearchResults(response);

      if (response.success && response.data) {
        console.log(
          `Found ${response.data.totalResults} flights from ${fromLocation} to ${toLocation}`
        );
      } else {
        console.error("Search failed:", response.error);
        // Still set the response so UI can show error message
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({
        success: false,
        error: "Failed to search flights. Please try again.",
        data: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const renderFlightResults = () => {
    if (!searchResults) return null;

    if (loading) {
      return (
        <div className="results-loading">
          <FontAwesomeIcon icon={faMagnifyingGlass} spin />
          <p>Searching for flights...</p>
        </div>
      );
    }

    if (!searchResults.success) {
      return (
        <div className="results-error">
          <p>Error: {searchResults.error}</p>
          <button onClick={handleSearch} className="retry-btn">
            Try Again
          </button>
        </div>
      );
    }

    if (
      !searchResults.data?.outbound ||
      searchResults.data.outbound.length === 0
    ) {
      return (
        <div className="results-empty">
          <p>No flights found for your search.</p>
        </div>
      );
    }

    return (
      <div className="results-container">
        <div className="results-header">
          <div className="results-count">
            <p>About these results</p>
          </div>
        </div>

        <div className="flight-results">
          {searchResults.data.outbound.map((flight) => (
            <div key={flight.id} className="flight-card">
              <div className="flight-image">
                <img
                  src={`https://images.unsplash.com/photo-1551632811-561732d1e306?w=150&h=100&fit=crop&crop=center`}
                  alt={flight.destination || toLocation}
                />
              </div>

              <div className="flight-info">
                <h3 className="destination-name">
                  {flight.destination || toLocation}
                </h3>
                <div className="flight-details">
                  <FontAwesomeIcon icon={faPlane} className="flight-icon" />
                  <span className="flight-type">
                    {flight.stops === 0
                      ? "Nonstop"
                      : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                  </span>
                  <span className="flight-duration">{flight.duration}</span>
                </div>
              </div>

              <div className="flight-price">
                <span className="price">${flight.price.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalPassengers = passengers;

  // Calendar logic (mirroring Form.tsx)
  function handleCalendarOpen(type: "depart" | "return") {
    setShowCalendar(type);
    setTempDepartDate(departDate);
    setTempReturnDate(returnDate);
  }

  function handleCalendarReset() {
    setTempDepartDate("");
    setTempReturnDate("");
  }

  function handleCalendarDone() {
    setDepartDate(tempDepartDate);
    setReturnDate(tempReturnDate);
    setShowCalendar(null);
  }

  function handleCalendarCancel() {
    setShowCalendar(null);
  }

  function handleDateClick(date: Date) {
    // Use timezone-safe date formatting (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    if (showCalendar === "depart") {
      setTempDepartDate(dateStr);
      if (tempReturnDate && new Date(dateStr) > new Date(tempReturnDate)) {
        setTempReturnDate("");
      }
    } else if (showCalendar === "return") {
      if (tempDepartDate && new Date(dateStr) < new Date(tempDepartDate)) {
        setTempDepartDate(dateStr);
        setTempReturnDate("");
      } else {
        setTempReturnDate(dateStr);
      }
    }
  }

  function generateCalendarDays(month: Date) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const days = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }

  function renderCalendar(month: Date) {
    const days = generateCalendarDays(month);
    const monthName = month.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return (
      <div className="calendar-month">
        <div className="calendar-header">
          <h3>{monthName}</h3>
        </div>
        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === month.getMonth();
            // Use timezone-safe date formatting (YYYY-MM-DD)
            const year = day.getFullYear();
            const monthNum = String(day.getMonth() + 1).padStart(2, "0");
            const dayNum = String(day.getDate()).padStart(2, "0");
            const dateStr = `${year}-${monthNum}-${dayNum}`;

            const isSelected =
              dateStr === tempDepartDate || dateStr === tempReturnDate;
            const isInRange =
              tempDepartDate &&
              tempReturnDate &&
              dateStr > tempDepartDate &&
              dateStr < tempReturnDate;
            const isPast = day < new Date();
            const isDisabled = !isCurrentMonth || isPast;

            // Get today's date in same format
            const today = new Date();
            const todayYear = today.getFullYear();
            const todayMonthNum = String(today.getMonth() + 1).padStart(2, "0");
            const todayDay = String(today.getDate()).padStart(2, "0");
            const todayStr = `${todayYear}-${todayMonthNum}-${todayDay}`;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleDateClick(day)}
                disabled={isDisabled}
                className={`calendar-day ${
                  !isCurrentMonth ? "other-month" : ""
                } ${isSelected ? "selected" : ""} ${
                  isInRange ? "in-range" : ""
                } ${isPast ? "past-date" : ""} ${
                  isToday && isCurrentMonth ? "today" : ""
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  function nextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  }
  function prevMonth() {
    const today = new Date();
    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();
    if (
      currentYear > today.getFullYear() ||
      (currentYear === today.getFullYear() &&
        currentMonthIndex > today.getMonth())
    ) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
      );
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function handlePassengerDropdownOpen() {
    setTempAdults(passengers);
    setTempChildren(0);
    setTempInfantsInSeat(0);
    setTempInfantsOnLap(0);
    setShowPassengerDropdown(true);
  }
  function handlePassengerCancel() {
    setShowPassengerDropdown(false);
  }
  function handlePassengerDone() {
    setPassengers(tempAdults);
    setShowPassengerDropdown(false);
  }
  function updateTempPassengerCount(type: string, operation: string) {
    switch (type) {
      case "adults":
        if (operation === "increase") setTempAdults((prev) => prev + 1);
        else if (operation === "decrease" && tempAdults > 1)
          setTempAdults((prev) => prev - 1);
        break;
      case "children":
        if (operation === "increase") setTempChildren((prev) => prev + 1);
        else if (operation === "decrease" && tempChildren > 0)
          setTempChildren((prev) => prev - 1);
        break;
      case "infantsInSeat":
        if (operation === "increase") setTempInfantsInSeat((prev) => prev + 1);
        else if (operation === "decrease" && tempInfantsInSeat > 0)
          setTempInfantsInSeat((prev) => prev - 1);
        break;
      case "infantsOnLap":
        if (operation === "increase") setTempInfantsOnLap((prev) => prev + 1);
        else if (operation === "decrease" && tempInfantsOnLap > 0)
          setTempInfantsOnLap((prev) => prev - 1);
        break;
    }
  }

  // Scroll filter bar left/right
  const scrollFilterBar = (direction: "left" | "right") => {
    const bar = filterBarRef.current;
    if (!bar) return;
    const scrollAmount = 120;
    if (direction === "left") {
      bar.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      bar.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Static mapping for city coordinates
  const cityCoords: Record<string, [number, number]> = {
    Mumbai: [72.8777, 19.076],
    Singapore: [103.8198, 1.3521],
    Paris: [2.3522, 48.8566],
    London: [-0.1278, 51.5074],
    Berlin: [13.405, 52.52],
    Rome: [12.4964, 41.9028],
    Delhi: [77.1025, 28.7041],
    "San Francisco": [-122.4194, 37.7749],
    Mauritius: [57.5522, -20.3484],
    // ... add more as needed
  };

  // Airline logo mapping
  const airlineLogos: Record<string, string> = {
    IndiGo:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/IndiGo_Logo.svg",
    "Air India":
      "https://upload.wikimedia.org/wikipedia/commons/2/2d/Air_India_Logo.svg",
    Vistara:
      "https://upload.wikimedia.org/wikipedia/commons/2/2d/Vistara_logo.svg",
    // ... add more as needed
  };
  const defaultAirlineLogo =
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/IndiGo_Logo.svg";

  // Add markers and line when both locations are filled and map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    // Remove previous markers and line
    if (map.current._fromMarker) {
      map.current._fromMarker.remove();
      map.current._fromMarker = null;
    }
    if (map.current._toMarker) {
      map.current._toMarker.remove();
      map.current._toMarker = null;
    }
    if (map.current.getSource("route-line")) {
      map.current.removeLayer("route-line");
      map.current.removeSource("route-line");
    }
    const fromCoord = cityCoords[fromLocation];
    const toCoord = cityCoords[toLocation];
    if (fromCoord && toCoord) {
      // Add from marker
      const fromMarker = new window.mapboxgl.Marker({ color: "#1a73e8" })
        .setLngLat(fromCoord)
        .addTo(map.current);
      map.current._fromMarker = fromMarker;
      // Add to marker
      const toMarker = new window.mapboxgl.Marker({ color: "#34a853" })
        .setLngLat(toCoord)
        .addTo(map.current);
      map.current._toMarker = toMarker;
      // Add line
      map.current.addSource("route-line", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [fromCoord, toCoord],
          },
        },
      });
      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route-line",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#1a73e8",
          "line-width": 3,
          "line-opacity": 0.85,
        },
      });
    }
  }, [fromLocation, toLocation, mapLoaded]);

  // Helper: Format date range for header
  function formatDateRange(depart: string, ret: string) {
    if (!depart || !ret) return "";
    return `${depart} – ${ret}`;
  }

  // Helper: Get random image for destination, fallback to default
  function getDestinationImage(dest: string) {
    if (!dest)
      return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";
    return `https://source.unsplash.com/600x200/?${encodeURIComponent(
      dest
    )},cityscape`;
  }
  const defaultPlaceImage =
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";

  // Helper: Get country for destination (demo, fallback to empty)
  function getCountry(dest: string) {
    // In real app, use a mapping or API
    const map: Record<string, string> = {
      Singapore: "Singapore",
      Paris: "France",
      London: "United Kingdom",
      Berlin: "Germany",
      Rome: "Italy",
      Mumbai: "India",
      Delhi: "India",
      "San Francisco": "USA",
      Mauritius: "Mauritius",
      // ... add more as needed
    };
    return map[dest] || "";
  }

  const [imgError, setImgError] = useState(false);

  // New: Render flight results in card layout like Google Flights
  function renderFlightResultsCard() {
    if (
      !searchResults ||
      !searchResults.success ||
      !searchResults.data?.outbound?.length
    )
      return null;
    const dest = toLocation;
    const country = getCountry(dest);
    const imageUrl = getDestinationImage(dest);
    const dateRange = formatDateRange(departDate, returnDate);
    return (
      <div className="explore-flight-card-outer">
        <div className="explore-flight-card-header">
          <img
            className="explore-flight-card-img"
            src={imgError ? defaultPlaceImage : imageUrl}
            alt={dest}
            onError={() => setImgError(true)}
          />
          <div className="explore-flight-card-header-content">
            <div>
              <div className="explore-flight-card-dest">{dest}</div>
              <div className="explore-flight-card-country">{country}</div>
            </div>
            <div className="explore-flight-card-dates">{dateRange}</div>
          </div>
        </div>
        <div className="explore-flight-card-title-row">
          <span className="explore-flight-card-title">
            Flights from {fromLocation}
          </span>
          <span className="explore-flight-card-info">ⓘ</span>
        </div>
        <div className="explore-flight-card-list">
          {searchResults.data.outbound.map((flight, idx) => {
            // Airline logo logic
            const airlineName = flight.airline || "IndiGo";
            const airlineLogo = airlineLogos[airlineName] || defaultAirlineLogo;
            return (
              <div
                className="explore-flight-card-flight"
                key={flight.id || idx}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    flex: 1,
                  }}
                >
                  <div className="explore-flight-card-airline">
                    <img
                      className="explore-flight-card-airline-img"
                      src={airlineLogo}
                      alt="Airline"
                      onError={(e) =>
                        (e.currentTarget.src = defaultAirlineLogo)
                      }
                    />
                    <span>{airlineName}</span>
                  </div>
                  <div className="explore-flight-card-details">
                    <span>
                      {flight.stops === 0
                        ? "Nonstop"
                        : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                    </span>
                    <span>• {flight.duration}</span>
                    <span>
                      • {fromLocation}–{toLocation}
                    </span>
                  </div>
                </div>
                <div className="explore-flight-card-price-row">
                  <span className="explore-flight-card-price">
                    ${flight.price.amount}
                  </span>
                  <span className="explore-flight-card-roundtrip">
                    Round trip
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <button className="explore-flight-card-view-btn">View flights</button>
      </div>
    );
  }

  return (
    <div className="explore-container">
      <div className="explore-sidebar">
        <button
          className="explore-back-btn"
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            padding: "10px 16px 4px 8px",
            cursor: "pointer",
            color: "#1a73e8",
            fontWeight: 600,
            outline: "none",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 10,
          }}
          aria-label="Back to main page"
        >
          ←
        </button>
        <div className="explore-form">
          <div className="explore-top-controls">
            <div className="explore-control-group">
              <div className="explore-swap-icon-small">⇄</div>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="explore-top-select"
              >
                <option value="roundtrip">Round trip</option>
                <option value="oneway">One way</option>
                <option value="multicity">Multi-city</option>
              </select>
            </div>
            <div className="explore-control-group">
              <div className="explore-person-icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <button
                className="explore-passenger-button"
                type="button"
                onClick={handlePassengerDropdownOpen}
              >
                {totalPassengers} <FontAwesomeIcon icon={faChevronDown} />
              </button>
              {showPassengerDropdown && (
                <div className="explore-passenger-dropdown">
                  <div className="explore-passenger-row">
                    <div className="explore-passenger-info">
                      <div className="explore-passenger-type">Adults</div>
                    </div>
                    <div className="explore-passenger-controls">
                      <button
                        onClick={() =>
                          updateTempPassengerCount("adults", "decrease")
                        }
                        className={`explore-passenger-btn ${
                          tempAdults <= 1 ? "disabled" : ""
                        }`}
                        disabled={tempAdults <= 1}
                        type="button"
                      >
                        -
                      </button>
                      <span className="explore-passenger-count">
                        {tempAdults}
                      </span>
                      <button
                        onClick={() =>
                          updateTempPassengerCount("adults", "increase")
                        }
                        className="explore-passenger-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="explore-passenger-row">
                    <div className="explore-passenger-info">
                      <div className="explore-passenger-type">Children</div>
                      <div className="explore-passenger-age">Aged 2-11</div>
                    </div>
                    <div className="explore-passenger-controls">
                      <button
                        onClick={() =>
                          updateTempPassengerCount("children", "decrease")
                        }
                        className={`explore-passenger-btn ${
                          tempChildren <= 0 ? "disabled" : ""
                        }`}
                        disabled={tempChildren <= 0}
                        type="button"
                      >
                        -
                      </button>
                      <span className="explore-passenger-count">
                        {tempChildren}
                      </span>
                      <button
                        onClick={() =>
                          updateTempPassengerCount("children", "increase")
                        }
                        className="explore-passenger-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="explore-passenger-row">
                    <div className="explore-passenger-info">
                      <div className="explore-passenger-type">Infants</div>
                      <div className="explore-passenger-age">In seat</div>
                    </div>
                    <div className="explore-passenger-controls">
                      <button
                        onClick={() =>
                          updateTempPassengerCount("infantsInSeat", "decrease")
                        }
                        className={`explore-passenger-btn ${
                          tempInfantsInSeat <= 0 ? "disabled" : ""
                        }`}
                        disabled={tempInfantsInSeat <= 0}
                        type="button"
                      >
                        -
                      </button>
                      <span className="explore-passenger-count">
                        {tempInfantsInSeat}
                      </span>
                      <button
                        onClick={() =>
                          updateTempPassengerCount("infantsInSeat", "increase")
                        }
                        className="explore-passenger-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="explore-passenger-row">
                    <div className="explore-passenger-info">
                      <div className="explore-passenger-type">Infants</div>
                      <div className="explore-passenger-age">On lap</div>
                    </div>
                    <div className="explore-passenger-controls">
                      <button
                        onClick={() =>
                          updateTempPassengerCount("infantsOnLap", "decrease")
                        }
                        className={`explore-passenger-btn ${
                          tempInfantsOnLap <= 0 ? "disabled" : ""
                        }`}
                        disabled={tempInfantsOnLap <= 0}
                        type="button"
                      >
                        -
                      </button>
                      <span className="explore-passenger-count">
                        {tempInfantsOnLap}
                      </span>
                      <button
                        onClick={() =>
                          updateTempPassengerCount("infantsOnLap", "increase")
                        }
                        className="explore-passenger-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="explore-dropdown-actions">
                    <button
                      onClick={handlePassengerCancel}
                      className="explore-dropdown-btn explore-cancel-btn"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePassengerDone}
                      className="explore-dropdown-btn explore-done-btn"
                      type="button"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="explore-top-select"
            >
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </div>

          <div className="explore-fields-container">
            <div className="explore-form-row explore-places-row">
              <input
                className="explore-input-field"
                type="text"
                placeholder="From"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
              />
              <input
                className="explore-input-field"
                type="text"
                placeholder="To"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
              />
            </div>

            <div className="explore-date-fields-container">
              <div
                className="explore-date-field"
                onClick={() => handleCalendarOpen("depart")}
              >
                {departDate ? formatDisplayDate(departDate) : "Departure"}
              </div>
              <div
                className="explore-date-field"
                onClick={() => handleCalendarOpen("return")}
              >
                {returnDate ? formatDisplayDate(returnDate) : "Return"}
              </div>
            </div>
          </div>
          {showCalendar && (
            <div className="calendar-overlay">
              <div className="calendar-dropdown">
                <div className="calendar-dropdown-header">
                  <div className="calendar-controls">
                    <select
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                      className="calendar-trip-select"
                    >
                      <option value="roundtrip">Round trip</option>
                      <option value="oneway">One way</option>
                    </select>
                    <button
                      className="reset-btn"
                      onClick={handleCalendarReset}
                      type="button"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="calendar-date-fields">
                    <div className="calendar-date-field">
                      <span className="calendar-field-label">Departure</span>
                      <div className="calendar-field-value">
                        {tempDepartDate ? tempDepartDate : "Select date"}
                      </div>
                    </div>
                    {tripType === "roundtrip" && (
                      <div className="calendar-date-field">
                        <span className="calendar-field-label">Return</span>
                        <div className="calendar-field-value">
                          {tempReturnDate ? tempReturnDate : "Select date"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="calendar-nav">
                  <button onClick={prevMonth} className="nav-btn" type="button">
                    {"<"}
                  </button>
                  <button onClick={nextMonth} className="nav-btn" type="button">
                    {">"}
                  </button>
                </div>
                <div className="calendar-grid">
                  {renderCalendar(currentMonth)}
                  {renderCalendar(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  )}
                </div>
                <div className="calendar-actions">
                  <button
                    onClick={handleCalendarCancel}
                    className="calendar-cancel-btn"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCalendarDone}
                    className="calendar-done-btn"
                    type="button"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="explore-filters-divider" />
          <div className="explore-filters-bar-container">
            <button
              className="explore-filters-arrow left"
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollFilterBar("left")}
            >
              {"<"}
            </button>
            <div className="explore-filters-bar" ref={filterBarRef}>
              <button className="explore-filter-chip">All Filters</button>
              <button className="explore-filter-chip selected">
                <span className="filter-x">×</span>Flight stops
              </button>
              <button className="explore-filter-chip">Price</button>
              <button className="explore-filter-chip">Airlines</button>
              <button className="explore-filter-chip">Times</button>
              <button className="explore-filter-chip">Duration</button>
              <button className="explore-filter-chip">Bags</button>
            </div>
            <button
              className="explore-filters-arrow right"
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollFilterBar("right")}
            >
              {">"}
            </button>
          </div>
          <div className="explore-filters-divider" />

          {renderFlightResultsCard()}
        </div>
      </div>

      <div
        className={`explore-map ${showMobileMap ? "mobile-map-visible" : ""}`}
      >
        <div ref={mapContainer} className="map-container"></div>

        {showMobileMap && (
          <button
            className="mobile-map-close"
            onClick={() => setShowMobileMap(false)}
            aria-label="Close map"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      <button
        className="mobile-view-map-btn"
        onClick={() => setShowMobileMap(true)}
        style={{
          display: window.innerWidth < 768 ? "flex" : "none",
        }}
      >
        <FontAwesomeIcon icon={faMap} />
        View Map
      </button>
    </div>
  );
}

export default Explore;
