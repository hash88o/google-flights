import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/herosection";
import Form from "./components/Form";
import Map from "./components/Map";
import Adv from "./components/Adv";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import FlightResults from "./components/FlightResults";
import Explore from "./components/Explore";
import type { FlightSearchResponse } from "./services/FlightAPI";

console.log("App.tsx: Imports loaded successfully");

function App() {
  const [searchResults, setSearchResults] =
    useState<FlightSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearchResults = (
    results: FlightSearchResponse,
    isLoading: boolean
  ) => {
    setSearchResults(results);
    setLoading(isLoading);
    if (!isLoading && results) {
      setTimeout(() => {
        const resultsElement = document.querySelector(".flight-results");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const handleRetrySearch = () => {
    setSearchResults(null);
    setLoading(false);
    const formElement = document.querySelector(".form-container");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <Form onSearchResults={handleSearchResults} />
              <FlightResults
                searchResponse={searchResults}
                loading={loading}
                onRetry={handleRetrySearch}
              />
              <Map />
              <Adv />
              <FAQ />
              <Footer />
            </>
          }
        />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </div>
  );
}

export default App;
