# ✈️ Google Flights Clone

A modern, responsive flight search application that replicates Google Flights functionality. Built with React, TypeScript, and powered by the Sky Scrapper API for real-time flight data.

![Google Flights Clone](https://img.shields.io/badge/React-18.0+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Status](https://img.shields.io/badge/Status-Demo%20Ready-green.svg)

## Quick Start

### Prerequisites

Before you begin, make sure you have these installed on your computer:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- A **RapidAPI account** for flight data - [Sign up here](https://rapidapi.com/)

### Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/google-flights-clone.git
   cd google-flights-clone
   ```

2. **Install Dependencies**

   ```bash
   npm install
   npm install react-router-dom
   ```

3. **Set Up API Keys**

   Create a file named `.env` in the project root folder and add:

   ```
   VITE_RAPIDAPI_KEY=your_rapidapi_key_here
   ```

   **To get your RapidAPI key:**

   - Visit [Sky Scrapper API on RapidAPI](https://rapidapi.com/apiheya/api/sky-scrapper)
   - Copy your API key from the dashboard
   - Replace `your_rapidapi_key_here` with your actual key

4. **Start the Application**

   ```bash
   npm run dev
   ```

5. **Open in Browser**

   The application will automatically open at `http://localhost:5173`

## 🛠️ Built With

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Build Tool**: Vite for fast development and building
- **Maps**: Mapbox GL for interactive maps
- **Icons**: FontAwesome for beautiful icons
- **API**: Sky Scrapper API via RapidAPI for flight data
- **Routing**: React Router for navigation

## 📁 Project Structure

```
google-flights-clone/
├── src/
│   ├── components/
│   │   ├── Form.tsx
│   │   ├── FlightResults.tsx
│   │   ├── Navbar.tsx
│   │   ├── Map.tsx
│   │   ├── Explore.tsx
│   │   └── ...
│   ├── services/
│   │   └── FlightAPI.ts
│   ├── assets/
│   └── App.tsx
├── public/
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required: RapidAPI Key for Sky Scrapper API
VITE_RAPIDAPI_KEY=your_rapidapi_key_here

# Optional: Mapbox token for enhanced map features
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## 📄 License

This project is for demonstration purposes. Please ensure you comply with the API provider's terms of service when using in production.

## Contributing

This project was created as a technical assessment. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---
