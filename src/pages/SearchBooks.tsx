import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Shield,
  BookOpen,
  DollarSign,
  Repeat,
  Gift
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchBooksProps {
  onNavigate: (page: string) => void;
  selectedCategory?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  course_code: string;
  category: string;
  condition: string;
  listing_type: string;
  price: number | null;
  location: string;
  verified: boolean;
  created_at: string;
  user_id: string;
}

const SearchBooks = ({ onNavigate, selectedCategory }: SearchBooksProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(selectedCategory || "");
  const [conditionFilter, setConditionFilter] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    "Engineering & Technology",
    "Medical & Health Sciences", 
    "Business & Economics",
    "Natural Sciences",
    "Humanities & Literature",
    "Social Sciences",
    "Law & Legal Studies",
    "Education"
  ];

  const conditions = ["new", "like-new", "good", "fair", "poor"];
  const listingTypes = ["sell", "exchange", "free"];

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, categoryFilter, conditionFilter, listingTypeFilter]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      toast({
        title: "Error fetching books",
        description: "Failed to load books. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(book => book.category === categoryFilter);
    }

    if (conditionFilter) {
      filtered = filtered.filter(book => book.condition === conditionFilter);
    }

    if (listingTypeFilter) {
      filtered = filtered.filter(book => book.listing_type === listingTypeFilter);
    }

    setFilteredBooks(filtered);
  };

  const getListingTypeIcon = (type: string) => {
    switch (type) {
      case 'sell': return <DollarSign className="w-4 h-4" />;
      case 'exchange': return <Repeat className="w-4 h-4" />;
      case 'free': return <Gift className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'sell': return "bg-green-100 text-green-800";
      case 'exchange': return "bg-blue-100 text-blue-800";
      case 'free': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number | null, listingType: string) => {
    if (listingType === 'free') return 'Free';
    if (listingType === 'exchange') return 'Exchange';
    return price ? `$${price}` : 'Contact for price';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {selectedCategory ? `${selectedCategory} Books` : 'Search Books'}
        </h1>
        <p className="text-muted-foreground">
          Find the perfect textbooks for your studies
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by title, author, or course code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Conditions</SelectItem>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {listingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-muted-foreground">
          {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
        </p>
        <Button variant="outline" onClick={() => onNavigate("add-book")}>
          List Your Book
        </Button>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or be the first to list a book in this category.
            </p>
            <Button onClick={() => onNavigate("add-book")}>
              List Your Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="hover:shadow-medium transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                    {book.course_code && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {book.course_code}
                      </Badge>
                    )}
                  </div>
                  {book.verified && (
                    <div title="Verified Book">
                      <Shield className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getListingTypeColor(book.listing_type)}>
                      {getListingTypeIcon(book.listing_type)}
                      <span className="ml-1 capitalize">{book.listing_type}</span>
                    </Badge>
                    <span className="font-bold text-primary">
                      {formatPrice(book.price, book.listing_type)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">
                      {book.condition.charAt(0).toUpperCase() + book.condition.slice(1).replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {book.category}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {book.location}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(book.created_at).toLocaleDateString()}
                    </div>
                    <Star className="w-3 h-3" />
                  </div>
                </div>

                <Button className="w-full mt-4" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBooks;