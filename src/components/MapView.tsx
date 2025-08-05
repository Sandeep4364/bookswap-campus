import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, Loader2, BookOpen, DollarSign, Repeat, Gift, Target, Settings, Satellite, Map as MapIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  condition: string;
  listing_type: string;
  price: number | null;
  location: string;
  verified: boolean;
  latitude?: number;
  longitude?: number;
}

interface MapViewProps {
  onNavigate: (page: string) => void;
}

const MapView = ({ onNavigate }: MapViewProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState([5]); // km, using array for Slider component
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const { toast } = useToast();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const loaderRef = useRef<Loader | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (googleMapsApiKey && userLocation && mapContainerRef.current && !mapRef.current) {
      initializeMap();
    }
  }, [googleMapsApiKey, userLocation]);

  useEffect(() => {
    if (mapRef.current && userLocation && books.length > 0) {
      updateMapMarkers();
    }
  }, [books, searchRadius, userLocation]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(isSatelliteView ? 'satellite' : 'roadmap');
    }
  }, [isSatelliteView]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location Found",
            description: "Your location has been updated successfully."
          });
        },
        (error) => {
          toast({
            title: "Location Access",
            description: "Could not get your location. Please enable location services.",
            variant: "destructive"
          });
          // Default to a central location if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
      setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York
    }
  };

  const initializeMap = async () => {
    if (!mapContainerRef.current || !userLocation || !googleMapsApiKey) return;

    try {
      loaderRef.current = new Loader({
        apiKey: googleMapsApiKey,
        version: "weekly",
        libraries: ["places", "geometry"]
      });

      const { Map } = await loaderRef.current.importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await loaderRef.current.importLibrary("marker") as google.maps.MarkerLibrary;

      mapRef.current = new Map(mapContainerRef.current, {
        center: userLocation,
        zoom: 12,
        mapTypeId: isSatelliteView ? 'satellite' : 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
        },
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Add user location marker
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: mapRef.current,
        title: "Your Location",
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="12" fill="#3b82f6" stroke="white" stroke-width="3"/>
              <circle cx="15" cy="15" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15)
        }
      });

      // Add info window for user location
      const userInfoWindow = new google.maps.InfoWindow({
        content: '<div><strong>Your Location</strong></div>'
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(mapRef.current, userMarker);
      });

      // Add radius circle
      updateRadiusCircle();

    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Map Loading Error",
        description: "Failed to load Google Maps. Please check your API key.",
        variant: "destructive"
      });
    }
  };

  const updateRadiusCircle = () => {
    if (!mapRef.current || !userLocation) return;

    // Remove existing circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // Create new circle
    circleRef.current = new google.maps.Circle({
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      map: mapRef.current,
      center: userLocation,
      radius: searchRadius[0] * 1000, // Convert km to meters
    });
  };

  const updateMapMarkers = () => {
    if (!mapRef.current || !userLocation) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Update radius circle
    updateRadiusCircle();

    // Add book markers
    const nearbyBooks = getNearbyBooks();
    nearbyBooks.forEach((book, index) => {
      // Generate random coordinates within radius for demo
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * searchRadius[0] * 0.8; // Keep within 80% of radius
      const bookLat = userLocation.lat + (distance / 111) * Math.cos(angle);
      const bookLng = userLocation.lng + (distance / (111 * Math.cos(userLocation.lat * Math.PI / 180))) * Math.sin(angle);

      // Calculate actual distance
      const actualDistance = calculateDistance(userLocation.lat, userLocation.lng, bookLat, bookLng);

      // Create custom marker icon based on listing type
      const markerColor = getMarkerColor(book.listing_type);
      const markerIcon = getListingTypeIcon(book.listing_type);

      const marker = new google.maps.Marker({
        position: { lat: bookLat, lng: bookLng },
        map: mapRef.current,
        title: book.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="15" fill="${markerColor}" stroke="white" stroke-width="3"/>
              <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${markerIcon}</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });

      // Create info window content
      const infoWindowContent = `
        <div style="max-width: 250px; padding: 10px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${book.title}</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${book.author}</p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${actualDistance.toFixed(1)} km away</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${book.condition}</span>
            <strong style="color: #059669; font-size: 14px;">${formatPrice(book.price, book.listing_type)}</strong>
          </div>
          <p style="margin: 0; font-size: 12px; color: #666;">📍 ${book.location}</p>
          <button onclick="window.selectBook('${book.id}')" style="
            width: 100%; 
            margin-top: 8px; 
            padding: 6px 12px; 
            background: #3b82f6; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 12px;
          ">View Details</button>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
      });

      marker.addListener('click', () => {
        // Close other info windows
        markersRef.current.forEach((m: any) => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        infoWindow.open(mapRef.current, marker);
        setSelectedBook({...book, latitude: bookLat, longitude: bookLng});
      });

      // Store info window reference
      (marker as any).infoWindow = infoWindow;
      markersRef.current.push(marker);
    });

    // Add global function to select book from info window
    (window as any).selectBook = (bookId: string) => {
      const book = nearbyBooks.find(b => b.id === bookId);
      if (book) {
        setSelectedBook(book);
      }
    };
  };

  const getMarkerColor = (listingType: string) => {
    switch (listingType) {
      case 'sell': return '#f59e0b';
      case 'exchange': return '#3b82f6';
      case 'free': return '#10b981';
      default: return '#6b7280';
    }
  };

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      toast({
        title: "Error fetching books",
        description: "Failed to load books for map view.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearbyBooks = () => {
    if (!userLocation) return books;
    
    return books.filter(book => {
      // For demo purposes, assign random coordinates near user location
      const bookLat = userLocation.lat + (Math.random() - 0.5) * 0.1;
      const bookLng = userLocation.lng + (Math.random() - 0.5) * 0.1;
      const distance = calculateDistance(userLocation.lat, userLocation.lng, bookLat, bookLng);
      return distance <= searchRadius[0];
    });
  };

  const getListingTypeIcon = (type: string) => {
    switch (type) {
      case 'sell': return '$';
      case 'exchange': return '↔';
      case 'free': return '★';
      default: return '📖';
    }
  };

  const formatPrice = (price: number | null, listingType: string) => {
    if (listingType === 'free') return 'Free';
    if (listingType === 'exchange') return 'Exchange';
    return price ? `$${price}` : 'Contact for price';
  };

  const handleApiKeySubmit = () => {
    if (!googleMapsApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google Maps API key to use the map.",
        variant: "destructive"
      });
      return;
    }
    setShowApiKeyInput(false);
    getUserLocation();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  if (showApiKeyInput) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Books Near You
          </h1>
          <p className="text-muted-foreground">
            Find textbooks available for pickup in your area using satellite mapping
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To use the interactive map with satellite view, please enter your Google Maps API key. You can get one for free at:
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://developers.google.com/maps/documentation/javascript/get-api-key', '_blank')}
              className="w-full"
            >
              Get Google Maps API Key
            </Button>
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Maps API Key:</label>
              <Input
                placeholder="AIzaSyBdVl-cTICSwYKrZ95SuvNw7dbMuDt1KG0"
                value={googleMapsApiKey}
                onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                type="password"
              />
            </div>
            <Button onClick={handleApiKeySubmit} className="w-full">
              Initialize Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nearbyBooks = getNearbyBooks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Books Near You
        </h1>
        <p className="text-muted-foreground">
          Find textbooks available for pickup in your area with satellite mapping
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Search Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="satellite-mode"
                    checked={isSatelliteView}
                    onCheckedChange={setIsSatelliteView}
                  />
                  <Label htmlFor="satellite-mode" className="flex items-center">
                    {isSatelliteView ? <Satellite className="w-4 h-4 mr-1" /> : <MapIcon className="w-4 h-4 mr-1" />}
                    {isSatelliteView ? 'Satellite View' : 'Map View'}
                  </Label>
                </div>
              </div>
              <Button onClick={getUserLocation} variant="outline" size="sm">
                <Navigation className="w-4 h-4 mr-1" />
                Update Location
              </Button>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Search Radius: {searchRadius[0]} km</label>
              </div>
              <Slider
                value={searchRadius}
                onValueChange={setSearchRadius}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            {userLocation && (
              <p className="text-xs text-muted-foreground">
                📍 Current location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  {isSatelliteView ? <Satellite className="w-5 h-5 mr-2" /> : <MapIcon className="w-5 h-5 mr-2" />}
                  Interactive {isSatelliteView ? 'Satellite' : 'Map'} View
                </span>
                <Badge variant="secondary">{nearbyBooks.length} books nearby</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={mapContainerRef}
                className="h-96 w-full rounded-lg"
                style={{ minHeight: '500px' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Book List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Nearby Books ({nearbyBooks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {nearbyBooks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No books found in your search radius
                  </p>
                  <Button 
                    onClick={() => onNavigate("add-book")} 
                    size="sm" 
                    className="mt-2"
                  >
                    List Your Book
                  </Button>
                </div>
              ) : (
                nearbyBooks.map((book) => {
                  const distance = userLocation ? 
                    calculateDistance(
                      userLocation.lat, 
                      userLocation.lng, 
                      userLocation.lat + (Math.random() - 0.5) * 0.1,
                      userLocation.lng + (Math.random() - 0.5) * 0.1
                    ) : 0;

                  return (
                    <Card 
                      key={book.id} 
                      className={`cursor-pointer transition-all ${
                        selectedBook?.id === book.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedBook(book)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              book.listing_type === 'free' ? 'bg-green-100 text-green-800' :
                              book.listing_type === 'exchange' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {book.listing_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary">
                            {formatPrice(book.price, book.listing_type)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {distance.toFixed(1)} km away
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {book.location}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Selected Book Details */}
          {selectedBook && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{selectedBook.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedBook.author}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge>{selectedBook.category}</Badge>
                  <span className="font-bold text-primary">
                    {formatPrice(selectedBook.price, selectedBook.listing_type)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  {selectedBook.location}
                  {selectedBook.latitude && selectedBook.longitude && userLocation && (
                    <span className="ml-2">
                      • {calculateDistance(
                        userLocation.lat, 
                        userLocation.lng, 
                        selectedBook.latitude, 
                        selectedBook.longitude
                      ).toFixed(1)} km away
                    </span>
                  )}
                </div>
                <Button className="w-full" size="sm">
                  Contact Seller
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    if (selectedBook.latitude && selectedBook.longitude) {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedBook.latitude},${selectedBook.longitude}`;
                      window.open(url, '_blank');
                    }
                  }}
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;