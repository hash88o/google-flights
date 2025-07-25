import { useEffect, useState } from "react";
import "./Map.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import SanFrancisco from "../assets/SanFrancisco.jpg";
import Delhi from "../assets/Delhi.jpg";
import Mauritious from "../assets/Mauritious.jpg";
import Singapore from "../assets/Singapore.jpg";

function Map() {
  const [isHoveringMap, setIsHoveringMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    city: string;
  }>({
    lat: 19.076,
    lng: 72.8777,
    city: "Mumbai",
  });


  const cities = [
    {
      id: 1,
      name: "San Francisco",
      image: SanFrancisco,
      price: "₹85,420",
      dates: "Oct 11 — Sep 12",
      stops: "1 stop",
      duration: "18h 45m",
    },
    {
      id: 2,
      name: "Delhi",
      image: Delhi,
      price: "₹8,500",
      dates: "Oct 15 — Oct 18",
      stops: "Nonstop",
      duration: "2h 15m",
    },
    {
      id: 3,
      name: "Mauritius",
      image: Mauritious,
      price: "₹42,800",
      dates: "Nov 5 — Nov 12",
      stops: "1 stop",
      duration: "8h 30m",
    },
    {
      id: 4,
      name: "Singapore",
      image: Singapore,
      price: "₹35,600",
      dates: "Oct 20 — Oct 25",
      stops: "Nonstop",
      duration: "5h 50m",
    },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;

          let cityName = "Your Location";
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            cityName =
              data.city || data.locality || data.countryName || "Your Location";
          } catch (_error) {
            console.log("Could not fetch city name");
          }

          setUserLocation({ lat: latitude, lng: longitude, city: cityName });
        },
        (_error) => {
          console.log(
            "Geolocation not available, using default location (Mumbai)"
          );
        }
      );
    } else {
      console.log("Geolocation not supported, using default location (Mumbai)");
    }
  }, []);

  return (
    <>
      <div className="container-main">
        <div className="map-title">
          <p>
            Find cheap flights from {userLocation.city} to anywhere{" "}
            <FontAwesomeIcon
              className="exclamation-icon"
              icon={faCircleExclamation}
            />
          </p>
        </div>

        <div className="top-places">
          <ul>
            <li>Mumbai</li>
            <li>Pune</li>
            <li>Delhi</li>
          </ul>
        </div>

        <div className="map-wrapper">
          <div
            className={`map-container ${isHoveringMap ? "map-darkened" : ""}`}
            onMouseEnter={() => setIsHoveringMap(true)}
            onMouseLeave={() => setIsHoveringMap(false)}
          >
            <div className="simple-map">
              <div className="location-marker user-location">
                <div className="marker-dot"></div>
                <div className="marker-label">{userLocation.city}</div>
              </div>

              <div
                className="location-marker destination-marker"
                style={{ top: "25%", left: "20%" }}
              >
                <div className="marker-dot destination"></div>
              </div>
              <div
                className="location-marker destination-marker"
                style={{ top: "70%", left: "75%" }}
              >
                <div className="marker-dot destination"></div>
              </div>
              <div
                className="location-marker destination-marker"
                style={{ top: "45%", left: "85%" }}
              >
                <div className="marker-dot destination"></div>
              </div>
            </div>
          </div>
          <button className="explore-destinations-btn">
            Explore destinations
          </button>
        </div>

        <div className="city-container">
          {cities.map((city) => (
            <div key={city.id} className="city-card">
              <div className="city-card-image-wrapper">
                <img
                  src={city.image}
                  alt={city.name}
                  className="city-card-image"
                />
              </div>
              <div className="city-card-content">
                <div className="city-header">
                  <h3 className="city-name">{city.name}</h3>
                  <div className="city-price">{city.price}</div>
                </div>
                <p className="city-dates">{city.dates}</p>
                <p className="city-flight-info">
                  {city.stops} • {city.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Map;
