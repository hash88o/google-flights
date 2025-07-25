import "./Adv.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChartLine,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import calendarImage from "../assets/dates_benefits_light.svg";

function Adv() {
  return (
    <div className="adv-container">
      <div className="adv-title">
        <p>Useful tools to help you find the best flight deals</p>
      </div>
      <div className="adv-content">
        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Find the cheapest days to fly</h3>
              <p className="feature-description">
                The Date grid and Price graph make it easy to find the best
                flight deals
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">
                Know when to book with price insights
              </h3>
              <p className="feature-description">
                Price history and trend data show you the best time to book your
                airline ticket to get the cheapest price for your flight
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Track flight prices for a trip</h3>
              <p className="feature-description">
                Not ready to book yet? Observe price changes for a route or
                flight and get notified when prices drop.
              </p>
            </div>
          </div>
        </div>

        <div className="insights-section">
          <div className="insights-content">
            <h2 className="insights-title">
              Insightful tools help you choose your trip dates
            </h2>
            <p className="insights-description">
              If your travel plans are flexible, use the form above to start
              searching for a specific trip. Then, play around with the{" "}
              <strong>Date grid</strong> and <strong>Price graph</strong>{" "}
              options on the Search page to find the cheapest days to fly and
              book your tickets.
            </p>
            <div className="calendar-illustration">
              <img
                src={calendarImage}
                alt="Date selection benefits"
                className="calendar-image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adv;
