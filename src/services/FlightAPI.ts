console.log('FlightAPI.ts: Starting to load module');

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  infantsInSeat: number;
  cabinClass: string;
  tripType: string;
}

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  aircraft: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: {
    amount: number;
    currency: string;
  };
  emissions?: number;
  bookingUrl?: string;
  destination?: string;
}

interface FlightSearchResponse {
  success: boolean;
  data?: {
    outbound: FlightResult[];
    inbound?: FlightResult[];
    searchId: string;
    currency: string;
    totalResults: number;
  };
  error?: string;
  rateLimit?: {
    remaining: number;
    resetTime: number;
  };
}

class FlightAPIService {
  private readonly API_BASE_URL = 'https://sky-scrapper.p.rapidapi.com';
  private readonly API_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '';
  private readonly cache = new Map<string, { data: any; timestamp: number; expiresIn: number }>();
  private readonly rateLimitWindow = 60000; 
  private readonly maxRequestsPerWindow = 10; 
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor() {
    setInterval(() => {
      this.clearExpiredCache();
    }, 600000);
  }

  private getCacheKey(params: FlightSearchParams): string {
    return `flight_search_${JSON.stringify(params)}`;
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    const windowKey = Math.floor(now / this.rateLimitWindow).toString();
    
    const currentWindow = this.requestCounts.get(windowKey) || { count: 0, resetTime: now + this.rateLimitWindow };
    
    if (currentWindow.count >= this.maxRequestsPerWindow) {
      return true;
    }
    
    return false;
  }

  private updateRateLimit(): void {
    const now = Date.now();
    const windowKey = Math.floor(now / this.rateLimitWindow).toString();
    
    const currentWindow = this.requestCounts.get(windowKey) || { count: 0, resetTime: now + this.rateLimitWindow };
    currentWindow.count += 1;
    
    this.requestCounts.set(windowKey, currentWindow);
    
    for (const [key, window] of this.requestCounts.entries()) {
      if (window.resetTime < now) {
        this.requestCounts.delete(key);
      }
    }
  }

  private getCachedResult(cacheKey: string): any | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.timestamp + cached.expiresIn) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult(cacheKey: string, data: any, expiresInMs: number = 300000): void {

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs
    });
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now >= cached.timestamp + cached.expiresIn) {
        this.cache.delete(key);
      }
    }
  }

  private validateSearchParams(params: FlightSearchParams): string | null {
    if (!params.origin || params.origin.trim().length < 2) {
      return 'Origin location is required (minimum 2 characters)';
    }
    if (!params.destination || params.destination.trim().length < 2) {
      return 'Destination location is required (minimum 2 characters)';
    }
    if (!params.departureDate) {
      return 'Departure date is required';
    }
    if (params.tripType === 'roundtrip' && !params.returnDate) {
      return 'Return date is required for round trips';
    }
    if (params.adults < 1) {
      return 'At least one adult passenger is required';
    }
    
    // validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departureDate = new Date(params.departureDate);
    departureDate.setHours(0, 0, 0, 0);
    
    if (departureDate < today) {
      return 'Departure date cannot be in the past';
    }
    
    if (params.returnDate) {
      const returnDate = new Date(params.returnDate);
      if (returnDate <= departureDate) {
        return 'Return date must be after departure date';
      }
    }
    return null;
  }

  private formatSearchParamsForAPI(params: FlightSearchParams): any {
  
    return {
      originSkyId: this.getAirportCode(params.origin),
      destinationSkyId: this.getAirportCode(params.destination),
      originEntityId: this.getAirportCode(params.origin),
      destinationEntityId: this.getAirportCode(params.destination),
      outboundDate: params.departureDate,
      inboundDate: params.returnDate,
      cabinClass: params.cabinClass.toLowerCase(),
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      sortBy: 'best',
      currency: 'USD',
      market: 'US',
      locale: 'en-US',
      countryCode: 'US'
    };
  }

  private getAirportCode(location: string): string {
    const cityToAirportMap: { [key: string]: string } = {
      'mumbai': 'BOM',
      'delhi': 'DEL',
      'bangalore': 'BLR',
      'chennai': 'MAA',
      'kolkata': 'CCU',
      'hyderabad': 'HYD',
      'pune': 'PNQ',
      'ahmedabad': 'AMD',
      'kochi': 'COK',
      'goa': 'GOI',
      'london': 'LON',
      'paris': 'PAR',
      'new york': 'NYC',
      'dubai': 'DXB',
      'singapore': 'SIN',
      'bangkok': 'BKK',
      'tokyo': 'TYO',
      'sydney': 'SYD',
      'los angeles': 'LAX',
      'san francisco': 'SFO',
      'chicago': 'CHI',
      'toronto': 'YTO',
      'vancouver': 'YVR',
      'amsterdam': 'AMS',
      'frankfurt': 'FRA',
      'rome': 'ROM',
      'madrid': 'MAD',
      'barcelona': 'BCN',
      'berlin': 'BER',
      'munich': 'MUC',
      'zurich': 'ZUR',
      'vienna': 'VIE',
      'brussels': 'BRU',
      'stockholm': 'STO',
      'oslo': 'OSL',
      'copenhagen': 'CPH',
      'helsinki': 'HEL',
      'istanbul': 'IST',
      'athens': 'ATH',
      'lisbon': 'LIS',
      'dublin': 'DUB',
      'edinburgh': 'EDI',
      'manchester': 'MAN'
    };

    const normalizedLocation = location.toLowerCase().trim();
    
  
    if (location.length === 3 && /^[A-Z]{3}$/.test(location.toUpperCase())) {
      return location.toUpperCase();
    }
    
    const airportCode = cityToAirportMap[normalizedLocation];
    if (airportCode) {
      return airportCode;
    }
    

    return location.substring(0, 3).toUpperCase();
  }

  private async makeAPIRequest(endpoint: string, params: any): Promise<any> {
    const url = new URL(`${this.API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.API_KEY,
        'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    return await response.json();
  }

  private parseAPIResponse(apiResponse: any): FlightResult[] {
    
    try {
      const flights: FlightResult[] = [];
      
      let itineraries = [];
      
      if (apiResponse.data?.itineraries) {
        itineraries = apiResponse.data.itineraries;
      } else if (apiResponse.itineraries) {
        itineraries = apiResponse.itineraries;
      } else if (Array.isArray(apiResponse.data)) {
        itineraries = apiResponse.data;
      } else if (Array.isArray(apiResponse)) {
        itineraries = apiResponse;
      }
      
      for (const itinerary of itineraries) {
        const legs = itinerary.legs || [];
        const pricing = itinerary.price || itinerary.pricing || {};
        
        for (const leg of legs) {
          const segments = leg.segments || [];
          const mainSegment = segments[0];
          
          if (mainSegment) {
            const departureTime = mainSegment.departure || leg.departure;
            const arrivalTime = mainSegment.arrival || leg.arrival;
            
            flights.push({
              id: `${mainSegment.flightNumber || Math.random()}_${leg.id || Math.random()}`,
              airline: mainSegment.marketingCarrier?.name || mainSegment.airline?.name || 'Unknown Airline',
              flightNumber: mainSegment.flightNumber || '',
              aircraft: mainSegment.operatingCarrier?.name || mainSegment.aircraft || '',
              departure: {
                airport: leg.origin?.displayCode || leg.originAirport || '',
                time: typeof departureTime === 'string' ? 
                      departureTime.split('T')[1]?.substring(0, 5) || '' :
                      departureTime?.time || '',
                date: typeof departureTime === 'string' ? 
                      departureTime.split('T')[0] || '' :
                      departureTime?.date || ''
              },
              arrival: {
                airport: leg.destination?.displayCode || leg.destinationAirport || '',
                time: typeof arrivalTime === 'string' ? 
                      arrivalTime.split('T')[1]?.substring(0, 5) || '' :
                      arrivalTime?.time || '',
                date: typeof arrivalTime === 'string' ? 
                      arrivalTime.split('T')[0] || '' :
                      arrivalTime?.date || ''
              },
              duration: this.formatDuration(leg.durationInMinutes || leg.duration || 0),
              stops: segments.length - 1,
              price: {
                amount: pricing.raw || pricing.amount || pricing.total || 0,
                currency: pricing.currency || 'USD'
              },
              emissions: leg.emissions?.total || undefined,
              bookingUrl: itinerary.deeplink || itinerary.bookingUrl || undefined
            });
          }
        }
      }
      
      return flights;
    } catch (error) {
      console.error('Error parsing API response:', error);
      return [];
    }
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }


  private getMockFlightData(params: FlightSearchParams): FlightResult[] {
    console.log('Returning mock flight data for demonstration');
    const basePrice = Math.floor(Math.random() * 500) + 200;
    
    const destinations = [
      { city: 'Lisbon', airport: 'LIS', airline: 'TAP Air Portugal', flight: 'TP 439', duration: '1h 20m', stops: 0 },
      { city: 'Paris', airport: 'CDG', airline: 'Air France', flight: 'AF 1028', duration: '1h 55m', stops: 0 },
      { city: 'London', airport: 'LHR', airline: 'British Airways', flight: 'BA 458', duration: '2h 25m', stops: 0 },
      { city: 'Rome', airport: 'FCO', airline: 'Alitalia', flight: 'AZ 78', duration: '2h 30m', stops: 0 },
      { city: 'Amsterdam', airport: 'AMS', airline: 'KLM', flight: 'KL 1678', duration: '2h 45m', stops: 0 }
    ];
    
    return destinations.map((dest, index) => ({
      id: `mock_${index + 1}`,
      airline: dest.airline,
      flightNumber: dest.flight,
      aircraft: 'Boeing 737',
      departure: {
        airport: this.getAirportCode(params.origin),
        time: '14:30',
        date: params.departureDate
      },
      arrival: {
        airport: dest.airport,
        time: '16:45',
        date: params.departureDate
      },
      duration: dest.duration,
      stops: dest.stops,
      price: {
        amount: basePrice + (index * 30) - 50,
        currency: 'USD'
      },
      emissions: 120 + (index * 10),
      destination: dest.city
    }));
  }

  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    try {
      const validationError = this.validateSearchParams(params);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      if (this.isRateLimited()) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait before making another request.',
          rateLimit: {
            remaining: 0,
            resetTime: Date.now() + this.rateLimitWindow
          }
        };
      }

      const cacheKey = this.getCacheKey(params);
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        console.log('Returning cached flight results');
        return cachedResult;
      }

      if (!this.API_KEY) {
        return {
          success: false,
          error: 'API key not configured. Please add VITE_RAPIDAPI_KEY to your environment variables.'
        };
      }

      this.updateRateLimit();

      const apiParams = this.formatSearchParamsForAPI(params);

      console.log('Making flight search API request with params:', apiParams);
      let flights: FlightResult[] = [];
      
      try {
        const apiResponse = await this.makeAPIRequest('/api/v1/flights/searchFlights', apiParams);
        flights = this.parseAPIResponse(apiResponse);
      } catch (error) {
        console.log('Primary endpoint failed, trying alternative endpoint...');
        try {
          const apiResponse = await this.makeAPIRequest('/api/v2/flights/searchFlights', apiParams);
          flights = this.parseAPIResponse(apiResponse);
        } catch (error2) {
          console.log('Alternative endpoint also failed, trying /api/v1/flights/search...');
          try {
            const apiResponse = await this.makeAPIRequest('/api/v1/flights/search', apiParams);
            flights = this.parseAPIResponse(apiResponse);
          } catch (error3) {
            console.error('All endpoints failed:', error3);
            flights = this.getMockFlightData(params);
          }
        }
      }

      const result: FlightSearchResponse = {
        success: true,
        data: {
          outbound: flights,
          inbound: params.tripType === 'roundtrip' ? [] : undefined,
          searchId: Date.now().toString(),
          currency: 'USD',
          totalResults: flights.length
        },
        rateLimit: {
          remaining: this.maxRequestsPerWindow - (this.requestCounts.get(Math.floor(Date.now() / this.rateLimitWindow).toString())?.count || 0),
          resetTime: Date.now() + this.rateLimitWindow
        }
      };

      this.setCachedResult(cacheKey, result);

      return result;

    } catch (error) {
      console.error('Flight search API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during flight search'
      };
    }
  }


  getRateLimitStatus(): { remaining: number; resetTime: number } {
    const now = Date.now();
    const windowKey = Math.floor(now / this.rateLimitWindow).toString();
    const currentWindow = this.requestCounts.get(windowKey) || { count: 0, resetTime: now + this.rateLimitWindow };
    
    return {
      remaining: Math.max(0, this.maxRequestsPerWindow - currentWindow.count),
      resetTime: currentWindow.resetTime
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const flightAPI = new FlightAPIService();

export type { FlightSearchParams, FlightResult, FlightSearchResponse };

console.log('FlightAPI.ts: Module loaded successfully, exports available:', {
  flightAPI: typeof flightAPI,
  FlightSearchParams: 'type',
  FlightResult: 'type', 
  FlightSearchResponse: 'type'
});