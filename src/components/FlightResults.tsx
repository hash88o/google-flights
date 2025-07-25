import { useState, useEffect } from "react";
import "./FlightResults.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faClock,
  faExchangeAlt,
  faLeaf,
  faExternalLinkAlt,
  faSort,
  faFilter,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import type { FlightResult, FlightSearchResponse } from "../services/FlightAPI";

console.log("FlightResults.tsx: Imports loaded successfully");

interface FlightResultsProps {
  searchResponse: FlightSearchResponse | null;
  loading: boolean;
  onRetry?: () => void;
}

function FlightResults({
  searchResponse,
  loading,
  onRetry,
}: FlightResultsProps) {
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">(
    "price"
  );
  const [filterStops, setFilterStops] = useState<
    "all" | "nonstop" | "one" | "multiple"
  >("all");
  const [filteredFlights, setFilteredFlights] = useState<FlightResult[]>([]);

  useEffect(() => {
    if (searchResponse?.data?.outbound) {
      let flights = [...searchResponse.data.outbound];

      // Apply filters
      if (filterStops !== "all") {
        flights = flights.filter((flight) => {
          switch (filterStops) {
            case "nonstop":
              return flight.stops === 0;
            case "one":
              return flight.stops === 1;
            case "multiple":
              return flight.stops > 1;
            default:
              return true;
          }
        });
      }

      // Apply sorting
      flights.sort((a, b) => {
        switch (sortBy) {
          case "price":
            return a.price.amount - b.price.amount;
          case "duration":
            const durationA = parseInt(a.duration.replace(/[^\d]/g, ""));
            const durationB = parseInt(b.duration.replace(/[^\d]/g, ""));
            return durationA - durationB;
          case "departure":
            return a.departure.time.localeCompare(b.departure.time);
          default:
            return 0;
        }
      });

      setFilteredFlights(flights);
    }
  }, [searchResponse, sortBy, filterStops]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStopsText = (stops: number) => {
    if (stops === 0) return "Nonstop";
    if (stops === 1) return "1 stop";
    return `${stops} stops`;
  };

  const handleBookFlight = (flight: FlightResult) => {
    if (flight.bookingUrl) {
      window.open(flight.bookingUrl, "_blank");
    } else {
      // Fallback to a search on a booking site
      const searchUrl = `https://www.kayak.com/flights/${flight.departure.airport}-${flight.arrival.airport}/${flight.departure.date}`;
      window.open(searchUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flight-results">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
          <h3>Searching for flights...</h3>
          <p>Finding the best deals for you</p>
        </div>
      </div>
    );
  }

  if (!searchResponse) {
    return null;
  }

  if (!searchResponse.success) {
    return (
      <div className="flight-results">
        <div className="error-container">
          <h3>Oops! Something went wrong</h3>
          <p>{searchResponse.error}</p>
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!searchResponse.data || filteredFlights.length === 0) {
    return (
      <div className="flight-results">
        <div className="no-results-container">
          <FontAwesomeIcon icon={faPlane} className="no-results-icon" />
          <h3>No flights found</h3>
          <p>Try adjusting your search criteria or dates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-results">
      <div className="results-header">
        <div className="results-info">
          <h2>Flight Results</h2>
          <p>{searchResponse.data.totalResults} flights found</p>
          {searchResponse.rateLimit && (
            <div className="rate-limit-info">
              <small>
                API calls remaining: {searchResponse.rateLimit.remaining}
              </small>
            </div>
          )}
        </div>

        <div className="results-controls">
          <div className="sort-control">
            <FontAwesomeIcon icon={faSort} />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "price" | "duration" | "departure")
              }
            >
              <option value="price">Price (Low to High)</option>
              <option value="duration">Duration (Shortest)</option>
              <option value="departure">Departure Time</option>
            </select>
          </div>

          <div className="filter-control">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={filterStops}
              onChange={(e) =>
                setFilterStops(
                  e.target.value as "all" | "nonstop" | "one" | "multiple"
                )
              }
            >
              <option value="all">All flights</option>
              <option value="nonstop">Nonstop only</option>
              <option value="one">1 stop</option>
              <option value="multiple">2+ stops</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-list">
        {filteredFlights.map((flight) => (
          <div key={flight.id} className="flight-card">
            <div className="flight-header">
              <div className="airline-info">
                <div className="airline-name">{flight.airline}</div>
                <div className="flight-number">{flight.flightNumber}</div>
              </div>
              <div className="flight-price">
                <span className="price-amount">
                  {formatPrice(flight.price.amount, flight.price.currency)}
                </span>
                <span className="price-per-person">per person</span>
              </div>
            </div>

            <div className="flight-details">
              <div className="departure-info">
                <div className="time">{flight.departure.time}</div>
                <div className="airport">{flight.departure.airport}</div>
                <div className="date">{formatDate(flight.departure.date)}</div>
              </div>

              <div className="flight-middle">
                <div className="duration">
                  <FontAwesomeIcon icon={faClock} />
                  {flight.duration}
                </div>
                <div className="flight-path">
                  <div className="path-line"></div>
                  <FontAwesomeIcon icon={faPlane} className="plane-icon" />
                </div>
                <div className="stops-info">{getStopsText(flight.stops)}</div>
              </div>

              <div className="arrival-info">
                <div className="time">{flight.arrival.time}</div>
                <div className="airport">{flight.arrival.airport}</div>
                <div className="date">{formatDate(flight.arrival.date)}</div>
              </div>
            </div>

            <div className="flight-footer">
              <div className="flight-extras">
                {flight.emissions && (
                  <div className="emissions-info">
                    <FontAwesomeIcon icon={faLeaf} />
                    <span>{flight.emissions}kg CO₂</span>
                  </div>
                )}
                {flight.aircraft && (
                  <div className="aircraft-info">
                    <span>{flight.aircraft}</span>
                  </div>
                )}
              </div>

              <button
                className="book-button"
                onClick={() => handleBookFlight(flight)}
              >
                Book Flight
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {searchResponse.data.inbound &&
        searchResponse.data.inbound.length > 0 && (
          <div className="return-flights">
            <h3>Return Flights</h3>
            <div className="results-list">
              {searchResponse.data.inbound.map((flight) => (
                <div key={flight.id} className="flight-card"></div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

export default FlightResults;
