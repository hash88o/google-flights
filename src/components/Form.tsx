import { useState } from "react";
import "./Form.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendarWeek,
  faMagnifyingGlass,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { flightAPI } from "../services/FlightAPI";
import type {
  FlightSearchParams,
  FlightSearchResponse,
} from "../services/FlightAPI";
import { useNavigate } from "react-router-dom";

interface FormProps {
  onSearchResults?: (results: FlightSearchResponse, loading: boolean) => void;
}

function Form({ onSearchResults }: FormProps) {
  const [tripType, setTripType] = useState("roundtrip");
  const [fromLocation, setFromLocation] = useState("Mumbai");
  const [toLocation, setToLocation] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState("Economy");

  // Passenger state (main state)
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infantsInSeat, setInfantsInSeat] = useState(0);
  const [infantsOnLap, setInfantsOnLap] = useState(0);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  // Temporary passenger state for dropdown (only updated on Done)
  const [tempAdults, setTempAdults] = useState(1);
  const [tempChildren, setTempChildren] = useState(0);
  const [tempInfantsInSeat, setTempInfantsInSeat] = useState(0);
  const [tempInfantsOnLap, setTempInfantsOnLap] = useState(0);

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempDepartDate, setTempDepartDate] = useState("");
  const [tempReturnDate, setTempReturnDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const navigate = useNavigate();

  const getTotalPassengers = () =>
    adults + children + infantsInSeat + infantsOnLap;

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleFlightSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate required fields
    if (!fromLocation.trim()) {
      alert("Please enter a departure location");
      return;
    }
    if (!toLocation.trim()) {
      alert("Please enter a destination");
      return;
    }
    if (!departDate) {
      alert("Please select a departure date");
      return;
    }
    if (tripType === "roundtrip" && !returnDate) {
      alert("Please select a return date for round trip");
      return;
    }

    // Prepare search parameters
    const searchParams: FlightSearchParams = {
      origin: fromLocation.trim(),
      destination: toLocation.trim(),
      departureDate: departDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      adults: adults,
      children: children,
      infants: infantsOnLap,
      infantsInSeat: infantsInSeat,
      cabinClass: cabinClass.toLowerCase(),
      tripType: tripType,
    };

    // Show loading state
    if (onSearchResults) {
      onSearchResults(
        {
          success: true,
          data: {
            outbound: [],
            searchId: "",
            currency: "USD",
            totalResults: 0,
          },
        },
        true
      );
    }

    try {
      console.log("Searching flights with params:", searchParams);
      const response = await flightAPI.searchFlights(searchParams);

      if (onSearchResults) {
        onSearchResults(response, false);
      }

      // Show rate limit status
      const rateLimitStatus = flightAPI.getRateLimitStatus();
      console.log("Rate limit status:", rateLimitStatus);
    } catch (error) {
      console.error("Flight search error:", error);
      const errorResponse: FlightSearchResponse = {
        success: false,
        error: "Failed to search flights. Please try again.",
      };

      if (onSearchResults) {
        onSearchResults(errorResponse, false);
      }
    }
  };

  const updateTempPassengerCount = (type: string, operation: string) => {
    switch (type) {
      case "adults":
        if (operation === "increase") {
          setTempAdults((prev) => prev + 1);
        } else if (operation === "decrease" && tempAdults > 1) {
          setTempAdults((prev) => prev - 1);
        }
        break;
      case "children":
        if (operation === "increase") {
          setTempChildren((prev) => prev + 1);
        } else if (operation === "decrease" && tempChildren > 0) {
          setTempChildren((prev) => prev - 1);
        }
        break;
      case "infantsInSeat":
        if (operation === "increase") {
          setTempInfantsInSeat((prev) => prev + 1);
        } else if (operation === "decrease" && tempInfantsInSeat > 0) {
          setTempInfantsInSeat((prev) => prev - 1);
        }
        break;
      case "infantsOnLap":
        if (operation === "increase") {
          setTempInfantsOnLap((prev) => prev + 1);
        } else if (operation === "decrease" && tempInfantsOnLap > 0) {
          setTempInfantsOnLap((prev) => prev - 1);
        }
        break;
    }
  };

  const handlePassengerDropdownOpen = () => {
    setTempAdults(adults);
    setTempChildren(children);
    setTempInfantsInSeat(infantsInSeat);
    setTempInfantsOnLap(infantsOnLap);
    setShowPassengerDropdown(true);
  };

  const handleCancel = () => {
    setShowPassengerDropdown(false);
  };

  const handleDone = () => {
    setAdults(tempAdults);
    setChildren(tempChildren);
    setInfantsInSeat(tempInfantsInSeat);
    setInfantsOnLap(tempInfantsOnLap);
    setShowPassengerDropdown(false);
  };

  // Calendar functions
  const handleCalendarOpen = () => {
    setTempDepartDate(departDate);
    setTempReturnDate(returnDate);
    // Reset to current month when opening calendar
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setShowCalendar(true);
  };

  const handleCalendarReset = () => {
    setTempDepartDate("");
    setTempReturnDate("");
  };

  const handleCalendarDone = () => {
    setDepartDate(tempDepartDate);
    setReturnDate(tempReturnDate);
    setShowCalendar(false);
  };

  const handleCalendarCancel = () => {
    setShowCalendar(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const generateCalendarDays = (month: Date) => {
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
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleDateClick = (date: Date) => {
    // Don't allow selection of past dates
    if (isPastDate(date)) {
      return;
    }

    // Use timezone-safe date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    if (!tempDepartDate || (tempDepartDate && tempReturnDate)) {
      setTempDepartDate(dateStr);
      setTempReturnDate("");
    } else if (tempDepartDate && !tempReturnDate) {
      if (date >= new Date(tempDepartDate)) {
        setTempReturnDate(dateStr);
      } else {
        setTempDepartDate(dateStr);
        setTempReturnDate("");
      }
    }
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const prevMonth = () => {
    const today = new Date();
    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();

    // Don't allow navigation to months before current month
    if (
      currentYear > today.getFullYear() ||
      (currentYear === today.getFullYear() &&
        currentMonthIndex > today.getMonth())
    ) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
      );
    }
  };

  const getNextMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  };

  const renderCalendar = (month: Date) => {
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
            // Use timezone-safe date formatting
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
            const isPast = isPastDate(day);
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
  };

  // Helper to increment/decrement a date string (YYYY-MM-DD) by n days
  const addDays = (dateStr: string, n: number) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    date.setDate(date.getDate() + n);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper to check if a date string is today or in the future
  const isTodayOrFuture = (dateStr: string) => {
    if (!dateStr) return false;
    const [year, month, day] = dateStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="top-controls">
          <div className="control-group">
            <div className="swap-icon-small">⇄</div>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
              className="top-select"
            >
              <option value="roundtrip">Round trip</option>
              <option value="oneway">One way</option>
              <option value="multicity">Multi-city</option>
            </select>
          </div>

          <div className="control-group">
            <div className="person-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="passenger-selector">
              <button
                onClick={handlePassengerDropdownOpen}
                className="passenger-button"
                type="button"
              >
                {getTotalPassengers()} <FontAwesomeIcon icon={faChevronDown} />
              </button>

              {showPassengerDropdown && (
                <div className="passenger-dropdown">
                  <div className="passenger-row">
                    <div className="passenger-info">
                      <div className="passenger-type">Adults</div>
                    </div>
                    <div className="passenger-controls">
                      <button
                        onClick={() =>
                          updateTempPassengerCount("adults", "decrease")
                        }
                        className={`passenger-btn ${
                          tempAdults <= 1 ? "disabled" : ""
                        }`}
                        disabled={tempAdults <= 1}
                        type="button"
                      >
                        -
                      </button>
                      <span className="passenger-count">{tempAdults}</span>
                      <button
                        onClick={() =>
                          updateTempPassengerCount("adults", "increase")
                        }
                        className="passenger-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="passenger-row">
                    <div className="passenger-info">
                      <div className="passenger-type">Children</div>
                      <div className="passenger-age">Aged 2-11</div>
                    </div>
                    <div className="passenger-controls">
                      <button
                        onClick={() =>
                          updateTempPassengerCount("children", "decrease")
                        }
                        className={`passenger-btn ${
                          tempChildren <= 0 ? "disabled" : ""
                        }`}
                        disabled={tempChildren <= 0}
                        type="button"
                      >
                        -
                      </button>
                      <span className="passenger-count">{tempChildren}</span>
                      <button
                        onClick={() =>
                          updateTempPassengerCount("children", "increase")
                        }
                        className="passenger-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="passenger-row">
                    <div className="passenger-info">
                      <div className="passenger-type">Infants</div>
                      <div className="passenger-age">In seat</div>
                    </div>
                    <div className="passenger-controls">
                      <button
                        onClick={() =>
                          updateTempPassengerCount("infantsInSeat", "decrease")
                        }
                        className={`passenger-btn ${
                          tempInfantsInSeat <= 0 ? "disabled" : ""
                        }`}
                        disabled={tempInfantsInSeat <= 0}
                        type="button"
                      >
                        -
                      </button>
                      <span className="passenger-count">
                        {tempInfantsInSeat}
                      </span>
                      <button
                        onClick={() =>
                          updateTempPassengerCount("infantsInSeat", "increase")
                        }
                        className="passenger-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="passenger-row">
                    <div className="passenger-info">
                      <div className="passenger-type">Infants</div>
                      <div className="passenger-age">On lap</div>
                    </div>
                    <div className="passenger-controls">
                      <button
                        onClick={() =>
                          updateTempPassengerCount("infantsOnLap", "decrease")
                        }
                        className={`passenger-btn ${
                          tempInfantsOnLap <= 0 ? "disabled" : ""
                        }`}
                        disabled={tempInfantsOnLap <= 0}
                        type="button"
                      >
                        -
                      </button>
                      <span className="passenger-count">
                        {tempInfantsOnLap}
                      </span>
                      <button
                        onClick={() =>
                          updateTempPassengerCount("infantsOnLap", "increase")
                        }
                        className="passenger-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="dropdown-actions">
                    <button
                      onClick={handleCancel}
                      className="dropdown-btn cancel-btn"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDone}
                      className="dropdown-btn done-btn"
                      type="button"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value)}
            className="top-select"
          >
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
        </div>

        <div className="main-form">
          <div className="location-container">
            <div className="location-field">
              <div className="location-icon">○</div>
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="location-input"
              />
            </div>

            <div className="location-field">
              <div className="location-icon">
                <FontAwesomeIcon icon={faLocationDot} />
              </div>
              <input
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="Where to?"
                className="location-input"
              />
            </div>

            <button
              onClick={swapLocations}
              className="swap-button-main"
              type="button"
            >
              ⇄
            </button>
          </div>

          <div className="date-container">
            <div className="date-field" onClick={handleCalendarOpen}>
              <div className="date-icon">
                <FontAwesomeIcon icon={faCalendarWeek} />
              </div>
              <div
                className="date-content"
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <div className="date-display">
                  {departDate ? formatDate(departDate) : "DEPARTURE"}
                </div>
                {departDate && (
                  <>
                    <button
                      type="button"
                      className="date-inc-btn"
                      aria-label="Previous day"
                      onClick={(e) => {
                        e.stopPropagation();
                        const prev = addDays(departDate, -1);
                        if (
                          prev &&
                          isTodayOrFuture(prev) &&
                          (!returnDate || prev <= returnDate)
                        )
                          setDepartDate(prev);
                      }}
                      disabled={!isTodayOrFuture(addDays(departDate, -1))}
                    >
                      {"<"}
                    </button>
                    <button
                      type="button"
                      className="date-inc-btn"
                      aria-label="Next day"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = addDays(departDate, 1);
                        if (next && (!returnDate || next <= returnDate))
                          setDepartDate(next);
                      }}
                    >
                      {">"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {tripType === "roundtrip" && (
              <div className="date-field" onClick={handleCalendarOpen}>
                <div
                  className="date-content"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <div className="date-display">
                    {returnDate ? formatDate(returnDate) : "RETURN"}
                  </div>
                  {returnDate && (
                    <>
                      <button
                        type="button"
                        className="date-inc-btn"
                        aria-label="Previous day"
                        onClick={(e) => {
                          e.stopPropagation();
                          const prev = addDays(returnDate, -1);
                          if (
                            prev &&
                            prev >= departDate &&
                            isTodayOrFuture(prev)
                          )
                            setReturnDate(prev);
                        }}
                        disabled={
                          !isTodayOrFuture(addDays(returnDate, -1)) ||
                          addDays(returnDate, -1) < departDate
                        }
                      >
                        {"<"}
                      </button>
                      <button
                        type="button"
                        className="date-inc-btn"
                        aria-label="Next day"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = addDays(returnDate, 1);
                          setReturnDate(next);
                        }}
                      >
                        {">"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="search-button-container">
          <button
            onClick={() => {
              navigate("/explore", {
                state: {
                  fromLocation,
                  toLocation,
                  departDate,
                  returnDate,
                  tripType,
                  cabinClass,
                  adults,
                  children,
                  infantsInSeat,
                  infantsOnLap,
                  passengers: adults + children + infantsInSeat + infantsOnLap,
                },
              });
            }}
            className="search-button"
            type="button"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Explore
          </button>
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
                      {tempDepartDate
                        ? formatDate(tempDepartDate)
                        : "Select date"}
                    </div>
                  </div>
                  {tripType === "roundtrip" && (
                    <div className="calendar-date-field">
                      <span className="calendar-field-label">Return</span>
                      <div className="calendar-field-value">
                        {tempReturnDate
                          ? formatDate(tempReturnDate)
                          : "Select date"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="calendar-nav">
                <button onClick={prevMonth} className="nav-btn" type="button">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button onClick={nextMonth} className="nav-btn" type="button">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>

              <div className="calendar-grid">
                {renderCalendar(currentMonth)}
                {renderCalendar(getNextMonth())}
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
      </div>
    </div>
  );
}

export default Form;
