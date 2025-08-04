import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { useState } from "react";

interface CategoriesProps {
  onNavigate: (page: string) => void;
}

const Categories = ({ onNavigate }: CategoriesProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      name: "Engineering & Technology",
      icon: "⚙️",
      count: 342,
      description: "Computer Science, Electrical, Mechanical, Civil Engineering",
      subcategories: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Software Engineering"],
      color: "bg-blue-50 border-blue-200"
    },
    {
      name: "Medical & Health Sciences",
      icon: "🩺",
      count: 198,
      description: "Medicine, Nursing, Pharmacy, Dentistry, Health Sciences",
      subcategories: ["Medicine", "Nursing", "Pharmacy", "Dentistry", "Public Health"],
      color: "bg-red-50 border-red-200"
    },
    {
      name: "Business & Economics",
      icon: "💼",
      count: 267,
      description: "Business Administration, Economics, Finance, Marketing",
      subcategories: ["Business Administration", "Economics", "Finance", "Marketing", "Accounting"],
      color: "bg-green-50 border-green-200"
    },
    {
      name: "Natural Sciences",
      icon: "🔬",
      count: 189,
      description: "Physics, Chemistry, Biology, Mathematics, Environmental Science",
      subcategories: ["Physics", "Chemistry", "Biology", "Mathematics", "Environmental Science"],
      color: "bg-purple-50 border-purple-200"
    },
    {
      name: "Humanities & Literature",
      icon: "📖",
      count: 156,
      description: "Literature, History, Philosophy, Languages, Arts",
      subcategories: ["Literature", "History", "Philosophy", "Languages", "Fine Arts"],
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      name: "Social Sciences",
      icon: "👥",
      count: 134,
      description: "Psychology, Sociology, Political Science, Anthropology",
      subcategories: ["Psychology", "Sociology", "Political Science", "Anthropology", "Geography"],
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      name: "Law & Legal Studies",
      icon: "⚖️",
      count: 89,
      description: "Constitutional Law, Criminal Law, Corporate Law, International Law",
      subcategories: ["Constitutional Law", "Criminal Law", "Corporate Law", "International Law"],
      color: "bg-gray-50 border-gray-200"
    },
    {
      name: "Education",
      icon: "🎓",
      count: 76,
      description: "Teaching Methods, Educational Psychology, Curriculum Development",
      subcategories: ["Teaching Methods", "Educational Psychology", "Curriculum Development", "Special Education"],
      color: "bg-orange-50 border-orange-200"
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Browse Categories</h1>
        <p className="text-muted-foreground">
          Find textbooks organized by academic disciplines and subjects
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.name} className={`${category.color} hover:shadow-medium transition-all duration-200 cursor-pointer`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {category.count} books
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                {category.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <Badge key={sub} variant="outline" className="text-xs">
                      {sub}
                    </Badge>
                  ))}
                  {category.subcategories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.subcategories.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  variant="default" 
                  size="sm"
                  onClick={() => onNavigate("search")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Books
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or browse all available categories.
          </p>
        </div>
      )}

      {/* Statistics */}
      <Card className="mt-12 bg-gradient-card border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Total Books</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">8</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">45</div>
              <div className="text-sm text-muted-foreground">Subcategories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">892</div>
              <div className="text-sm text-muted-foreground">Exchanges Made</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;