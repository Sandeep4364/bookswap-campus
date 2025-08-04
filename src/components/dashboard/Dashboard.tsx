import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Leaf,
  ArrowRight,
  Star,
  MapPin,
  Clock
} from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const userName = localStorage.getItem("userName") || "Student";
  const userUniversity = localStorage.getItem("userUniversity") || "University";

  const featuredBooks = [
    {
      id: 1,
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      course: "CS 101",
      price: "$45",
      condition: "Like New",
      location: "Engineering Campus",
      seller: "Sarah M.",
      rating: 4.8,
      image: "📚"
    },
    {
      id: 2,
      title: "Organic Chemistry",
      author: "Paula Yurkanis Bruice",
      course: "CHEM 201",
      price: "$85",
      condition: "Good",
      location: "Science Building",
      seller: "Mike R.",
      rating: 4.6,
      image: "🧪"
    },
    {
      id: 3,
      title: "Principles of Economics",
      author: "N. Gregory Mankiw",
      course: "ECON 101",
      price: "Exchange",
      condition: "Fair",
      location: "Business School",
      seller: "Emma K.",
      rating: 4.9,
      image: "📈"
    }
  ];

  const categories = [
    { name: "Engineering", count: 156, icon: "⚙️", color: "bg-blue-100 text-blue-800" },
    { name: "Medical", count: 89, icon: "🩺", color: "bg-red-100 text-red-800" },
    { name: "Business", count: 124, icon: "💼", color: "bg-green-100 text-green-800" },
    { name: "Science", count: 98, icon: "🔬", color: "bg-purple-100 text-purple-800" },
    { name: "Literature", count: 76, icon: "📖", color: "bg-yellow-100 text-yellow-800" },
    { name: "Math", count: 67, icon: "🧮", color: "bg-indigo-100 text-indigo-800" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Find the perfect textbooks at {userUniversity} and connect with fellow students.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Books</p>
                <p className="text-2xl font-bold text-primary">1,247</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-secondary">3,892</p>
              </div>
              <Users className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Books Exchanged</p>
                <p className="text-2xl font-bold text-accent">892</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO2 Saved</p>
                <p className="text-2xl font-bold text-secondary">2.4 tons</p>
              </div>
              <Leaf className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Section */}
      <Card className="mb-8 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Browse by Categories
            <Button variant="ghost" onClick={() => onNavigate("categories")}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            Discover textbooks organized by subject areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.name} 
                className="cursor-pointer hover:shadow-medium transition-shadow"
                onClick={() => onNavigate("categories")}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <Badge variant="secondary" className={category.color}>
                    {category.count} books
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Books */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Featured Books Near You
            <Button variant="ghost" onClick={() => onNavigate("search")}>
              See More <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            Popular textbooks available for exchange in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-medium transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="text-3xl">{book.image}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                      <Badge variant="outline" className="text-xs">{book.course}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">{book.price}</span>
                      <Badge variant="secondary">{book.condition}</Badge>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {book.location}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {book.rating} • {book.seller}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        2h ago
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-3" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-gradient-primary text-white border-0 shadow-medium">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">List Your Textbooks</h3>
            <p className="text-white/80 mb-4">
              Turn your old textbooks into cash or trade them for books you need.
            </p>
            <Button 
              variant="secondary" 
              onClick={() => onNavigate("add-book")}
              className="w-full"
            >
              Start Listing
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2 text-foreground">Join the Community</h3>
            <p className="text-muted-foreground mb-4">
              Connect with students, share study resources, and build lasting relationships.
            </p>
            <Button 
              variant="outline" 
              onClick={() => onNavigate("community")}
              className="w-full"
            >
              Explore Community
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;