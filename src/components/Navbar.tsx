import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import googleLogo from "../assets/google_logo.png";
import appsIcon from "../assets/apps.svg";
import {
  faMoon,
  faBars,
  faSuitcaseRolling,
  faEarthAmerica,
  faPlaneUp,
  faBed,
  faHouseChimney,
  faChartLine,
  faGlobe,
  faDollarSign,
  faMapMarkerAlt,
  faCog,
  faCommentDots,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const isExplore = path.startsWith("/explore");
  const isHome = path === "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <FontAwesomeIcon
              icon={faBars}
              className="menubar"
              onClick={toggleSidebar}
            />
            <div
              className="navbar-logo"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            >
              <img
                src={googleLogo}
                alt="google_logo"
                style={{ height: 24, width: 74 }}
              />
            </div>

            <div className="navbar-nav">
              <ul className="navbar-list">
                <li className="navbar-item">
                  <FontAwesomeIcon className="icon" icon={faSuitcaseRolling} />{" "}
                  &nbsp; Travel
                </li>
                <li
                  className={`navbar-item ${isExplore ? "active" : ""}`}
                  onClick={() => navigate("/explore")}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon className="icon" icon={faEarthAmerica} />{" "}
                  &nbsp;Explore
                </li>
                <li
                  className={`navbar-item ${isHome ? "active" : ""}`}
                  onClick={() => navigate("/")}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon className="icon" icon={faPlaneUp} />{" "}
                  &nbsp;Flights
                </li>
                <li className="navbar-item">
                  <FontAwesomeIcon className="icon" icon={faBed} /> &nbsp;Hotels
                </li>
                <li className="navbar-item">
                  <FontAwesomeIcon className="icon" icon={faHouseChimney} />{" "}
                  &nbsp;Vacation rentals
                </li>
              </ul>
            </div>
          </div>

          <div className="navbar-right">
            <FontAwesomeIcon icon={faMoon} className="mode-icon-item" />
            <img src={appsIcon} className="apps-icon" />
            <button className="signin">Sign In</button>
          </div>
        </div>
      </nav>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-content">
          <div
            className="sidebar-item"
            onClick={() => {
              navigate("/");
              closeSidebar();
            }}
          >
            <FontAwesomeIcon
              icon={faSuitcaseRolling}
              className="sidebar-icon"
            />
            Travel
          </div>
          <div
            className="sidebar-item"
            onClick={() => {
              navigate("/explore");
              closeSidebar();
            }}
          >
            <FontAwesomeIcon icon={faEarthAmerica} className="sidebar-icon" />
            Explore
          </div>
          <div
            className="sidebar-item"
            onClick={() => {
              navigate("/");
              closeSidebar();
            }}
          >
            <FontAwesomeIcon icon={faPlaneUp} className="sidebar-icon" />
            Flights
          </div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faBed} className="sidebar-icon" />
            Hotels
          </div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faHouseChimney} className="sidebar-icon" />
            Vacation rentals
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faChartLine} className="sidebar-icon" />
            Tracked flight prices
          </div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faGlobe} className="sidebar-icon" />
            Change language
          </div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faDollarSign} className="sidebar-icon" />
            Change currency
          </div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="sidebar-icon" />
            Change location
          </div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faCog} className="sidebar-icon" />
            Flights settings
          </div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faCommentDots} className="sidebar-icon" />
            Feedback
          </div>
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faQuestionCircle} className="sidebar-icon" />
            Help
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
