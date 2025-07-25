import { useState, useRef } from "react";
import "./FAQ.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

function FAQ() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const faqData = [
    {
      id: 1,
      question: "How can I find last-minute flight deals?",
      answer:
        "To find last-minute deals, be flexible with your travel dates and destinations. Use our date grid and price calendar to compare prices across different days.",
    },
    {
      id: 2,
      question: "How can I find cheap flights for a weekend getaway?",
      answer:
        "For weekend getaways, try searching for flights departing Friday evening and returning Sunday night. Compare prices for nearby airports and consider mid-week alternatives.",
    },
    {
      id: 3,
      question: "How can I find flight deals if my travel plans are flexible?",
      answer:
        "Use our flexible date search options and explore destinations feature. Consider traveling during off-peak seasons and mid-week for better deals.",
    },
    {
      id: 4,
      question: "How can I find cheap flights to anywhere?",
      answer:
        "Use our 'Explore destinations' feature on the map. Enter your departure city and browse destinations by price and travel time.",
    },
    {
      id: 5,
      question: "How can I get flight alerts for my trip?",
      answer:
        "Set up price alerts by searching for your desired route and clicking 'Track prices'. We'll notify you when prices change for your selected flights.",
    },
  ];

  const popularRoutes = [
    "Flights from New York to London",
    "Flights from New York to Paris",
    "Flights from London to Paris",
    "Flights from New York to Rome",
    "Flights from Montreal to Paris",
    "Flights from London to Milan",
    "Flights from Toronto to London",
    "Flights from New York to Milan",
    "Flights from London to Dubai",
    "Flights from London to Tokyo",
    "Flights from Madrid to Rome",
    "Flights from London to Delhi",
    "Flights from New York to Los Angeles",
    "Flights from Paris to Marrakech",
    "Flights from Sao Paulo to London",
    "Flights from London to Istanbul",
    "Flights from Paris to Bangkok",
    "Flights from New York to Orlando",
    "Flights from London to Berlin",
    "Flights from Chicago to Paris",
    "Flights from Melbourne to London",
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -600, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 600, behavior: "smooth" });
    }
  };

  // Split routes into columns of 7 items each
  const routeColumns = [];
  for (let i = 0; i < popularRoutes.length; i += 7) {
    routeColumns.push(popularRoutes.slice(i, i + 7));
  }

  return (
    <div className="faq-container">
      <div className="faq-section">
        <h2 className="faq-title">Frequently asked questions</h2>
        <div className="faq-list">
          {faqData.map((faq) => (
            <div key={faq.id} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleFAQ(faq.id)}
              >
                <span>{faq.question}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`faq-arrow ${
                    expandedFAQ === faq.id ? "expanded" : ""
                  }`}
                />
              </button>
              {expandedFAQ === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="popular-routes-section">
        <h2 className="routes-title">Find cheap flights on popular routes</h2>
        <div className="routes-container">
          <button className="scroll-button scroll-left" onClick={scrollLeft}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <div className="routes-scroll-container" ref={scrollContainerRef}>
            {routeColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="route-column">
                {column.map((route, index) => (
                  <a key={index} href="#" className="route-link">
                    {route}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <button className="scroll-button scroll-right" onClick={scrollRight}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
