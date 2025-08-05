import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Locate, Book, Filter, Shield } from "lucide-react";
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
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserLocation();
    fetchBooks();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
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
      return distance <= searchRadius;
    });
  };

  const formatPrice = (price: number | null, listingType: string) => {
    if (listingType === 'free') return 'Free';
    if (listingType === 'exchange') return 'Exchange';
    return price ? `$${price}` : 'Contact for price';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading map...</div>
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
            <Filter className="w-5 h-5 mr-2" />
            Map Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Locate className="w-4 h-4" />
              <span className="text-sm">Search Radius:</span>
            </div>
            <Input
              type="number"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-20"
              min="1"
              max="50"
            />
            <span className="text-sm text-muted-foreground">km</span>
            <Button onClick={getUserLocation} variant="outline" size="sm">
              <Locate className="w-4 h-4 mr-1" />
              Update Location
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div 
                ref={mapContainerRef}
                className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center relative overflow-hidden"
              >
                {/* Map placeholder with pins */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzk0YTNiOCIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPHN2Zz4=')] opacity-20"></div>
                
                {/* User location pin */}
                {userLocation && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                    <div className="text-xs text-center mt-1 font-medium">You</div>
                  </div>
                )}

                {/* Book pins */}
                {nearbyBooks.slice(0, 5).map((book, index) => (
                  <div
                    key={book.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                      index === 0 ? 'top-1/3 left-1/3' :
                      index === 1 ? 'top-2/3 right-1/3' :
                      index === 2 ? 'top-1/4 right-1/4' :
                      index === 3 ? 'bottom-1/3 left-1/4' :
                      'top-3/4 left-3/4'
                    }`}
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <Book className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ))}

                <div className="text-center text-muted-foreground">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Interactive Map</p>
                  <p className="text-sm">Click on pins to view book details</p>
                </div>
              </div>
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
                  <Book className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No books found in your area
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
                nearbyBooks.map((book) => (
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
                        {book.verified && (
                          <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {book.condition}
                        </Badge>
                        <span className="text-xs font-medium text-primary">
                          {formatPrice(book.price, book.listing_type)}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {book.location}
                      </div>
                    </CardContent>
                  </Card>
                ))
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
                </div>
                <Button className="w-full" size="sm">
                  Contact Seller
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