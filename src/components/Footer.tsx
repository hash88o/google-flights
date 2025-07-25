import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faLocationDot,
  faCreditCard,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-settings">
          <div className="setting-item">
            <div className="setting-icon">
              <FontAwesomeIcon icon={faGlobe} />
            </div>
            <span className="setting-text">
              Language • English (United States)
            </span>
          </div>

          <div className="setting-item">
            <div className="setting-icon">
              <FontAwesomeIcon icon={faLocationDot} />
            </div>
            <span className="setting-text">Location • United States</span>
          </div>

          <div className="setting-item">
            <div className="setting-icon">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <span className="setting-text">Currency • USD</span>
          </div>
        </div>

        <div className="footer-description">
          <p>
            Current language and currency options applied: English (United
            States) - United States - USD
            <br />
            Displayed currencies may differ from the currencies used to purchase
            flights.{" "}
            <a href="#" className="learn-more-link">
              Learn more
            </a>
          </p>
        </div>

        <div className="footer-navigation">
          <a href="#" className="nav-link">
            About
          </a>
          <a href="#" className="nav-link">
            Privacy
          </a>
          <a href="#" className="nav-link">
            Terms
          </a>
          <a href="#" className="nav-link">
            Join user studies
          </a>
          <a href="#" className="nav-link">
            Feedback
          </a>
          <a href="#" className="nav-link">
            Help Center
          </a>
        </div>

        <div className="footer-bottom">
          <div className="footer-section">
            <div className="section-header">
              <span className="section-title">International sites</span>
              <FontAwesomeIcon icon={faChevronDown} className="section-arrow" />
            </div>
          </div>

          <div className="footer-section">
            <div className="section-header">
              <span className="section-title">Explore flights</span>
              <FontAwesomeIcon icon={faChevronDown} className="section-arrow" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
