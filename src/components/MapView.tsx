import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { MapPin, Navigation, Loader2, BookOpen, DollarSign, Repeat, Gift, Target, Settings } from "lucide-react";
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
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const { toast } = useToast();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (mapboxToken && userLocation && mapContainerRef.current && !mapRef.current) {
      initializeMap();
    }
  }, [mapboxToken, userLocation]);

  useEffect(() => {
    if (mapRef.current && userLocation && books.length > 0) {
      updateMapMarkers();
    }
  }, [books, searchRadius, userLocation]);

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

  const initializeMap = () => {
    if (!mapContainerRef.current || !userLocation || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.lng, userLocation.lat],
      zoom: 12
    });

    // Add navigation controls
    mapRef.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add user location marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<div><strong>Your Location</strong></div>'))
      .addTo(mapRef.current);

    // Add radius circle
    mapRef.current.on('load', () => {
      updateRadiusCircle();
    });
  };

  const updateRadiusCircle = () => {
    if (!mapRef.current || !userLocation) return;

    // Remove existing circle
    if (mapRef.current.getSource('radius-circle')) {
      mapRef.current.removeLayer('radius-circle-fill');
      mapRef.current.removeLayer('radius-circle-stroke');
      mapRef.current.removeSource('radius-circle');
    }

    // Create circle geometry using simple math
    const coords = createCircle([userLocation.lng, userLocation.lat], searchRadius[0]);

    // Add circle source and layers
    mapRef.current.addSource('radius-circle', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        },
        properties: {}
      }
    });

    mapRef.current.addLayer({
      id: 'radius-circle-fill',
      type: 'fill',
      source: 'radius-circle',
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.1
      }
    });

    mapRef.current.addLayer({
      id: 'radius-circle-stroke',
      type: 'line',
      source: 'radius-circle',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });
  };

  // Simple distance calculation without external library
  const createCircle = (center: [number, number], radiusInKm: number, points = 64) => {
    const coords = [];
    const distanceX = radiusInKm / (111.320 * Math.cos(center[1] * Math.PI / 180));
    const distanceY = radiusInKm / 110.540;

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const x = center[0] + (distanceX * Math.cos(angle));
      const y = center[1] + (distanceY * Math.sin(angle));
      coords.push([x, y]);
    }
    coords.push(coords[0]); // Close the polygon
    return coords;
  };

  const updateMapMarkers = () => {
    if (!mapRef.current || !userLocation) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Update radius circle
    const radiusInMeters = searchRadius[0] * 1000;
    const coords = createCircle([userLocation.lng, userLocation.lat], searchRadius[0]);

    if (mapRef.current.getSource('radius-circle')) {
      const source = mapRef.current.getSource('radius-circle') as mapboxgl.GeoJSONSource;
      source.setData({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        },
        properties: {}
      });
    } else {
      mapRef.current.addSource('radius-circle', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          },
          properties: {}
        }
      });

      mapRef.current.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.1
        }
      });

      mapRef.current.addLayer({
        id: 'radius-circle-stroke',
        type: 'line',
        source: 'radius-circle',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });
    }

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

      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'book-marker';
      markerEl.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: ${book.listing_type === 'free' ? '#10b981' : book.listing_type === 'exchange' ? '#3b82f6' : '#f59e0b'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      `;
      markerEl.innerHTML = getListingTypeIcon(book.listing_type);

      // Create popup content
      const popupContent = `
        <div style="max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${book.title}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${book.author}</p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${actualDistance.toFixed(1)} km away</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${book.condition}</span>
            <strong style="color: #059669;">${formatPrice(book.price, book.listing_type)}</strong>
          </div>
          <p style="margin: 0; font-size: 11px; color: #666;">📍 ${book.location}</p>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 15 })
        .setHTML(popupContent);

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([bookLng, bookLat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markerEl.addEventListener('click', () => {
        setSelectedBook({...book, latitude: bookLat, longitude: bookLng});
      });

      markersRef.current.push(marker);
    });
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

  const handleTokenSubmit = () => {
    if (!mapboxToken) {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox public token to use the map.",
        variant: "destructive"
      });
      return;
    }
    setShowTokenInput(false);
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

  if (showTokenInput) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Books Near You
          </h1>
          <p className="text-muted-foreground">
            Find textbooks available for pickup in your area
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
              To use the interactive map, please enter your Mapbox public token. You can get one for free at:
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://account.mapbox.com/access-tokens/', '_blank')}
              className="w-full"
            >
              Get Mapbox Token
            </Button>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mapbox Public Token:</label>
              <Input
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwia..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
            </div>
            <Button onClick={handleTokenSubmit} className="w-full">
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
          Find textbooks available for pickup in your area
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Search Radius: {searchRadius[0]} km</label>
                <Button onClick={getUserLocation} variant="outline" size="sm">
                  <Navigation className="w-4 h-4 mr-1" />
                  Update Location
                </Button>
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
                <span>Interactive Map</span>
                <Badge variant="secondary">{nearbyBooks.length} books nearby</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={mapContainerRef}
                className="h-96 w-full rounded-lg"
                style={{ minHeight: '400px' }}
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