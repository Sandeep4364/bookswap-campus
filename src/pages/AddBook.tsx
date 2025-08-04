import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, BookOpen, DollarSign, Repeat, Gift, Star } from "lucide-react";

interface AddBookProps {
  onNavigate: (page: string) => void;
}

const AddBook = ({ onNavigate }: AddBookProps) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    course: "",
    category: "",
    condition: "",
    listingType: "",
    price: "",
    description: "",
    location: "",
    contactMethod: "platform"
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const conditions = [
    { value: "new", label: "New", icon: "✨", description: "Brand new, never used" },
    { value: "like-new", label: "Like New", icon: "⭐", description: "Excellent condition, minimal wear" },
    { value: "good", label: "Good", icon: "👍", description: "Good condition, some wear" },
    { value: "fair", label: "Fair", icon: "📖", description: "Readable but shows wear" },
    { value: "poor", label: "Poor", icon: "📄", description: "Heavy wear but usable" }
  ];

  const listingTypes = [
    { value: "sell", label: "Sell", icon: "💰", description: "Sell for money" },
    { value: "exchange", label: "Exchange", icon: "🔄", description: "Trade for another book" },
    { value: "free", label: "Free", icon: "🎁", description: "Give away for free" }
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Book listed successfully!",
        description: "Your textbook is now available for other students to find.",
      });
      setIsLoading(false);
      onNavigate("my-books");
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate image upload
      const newImages = Array.from(files).map((file, index) => 
        `https://via.placeholder.com/200x250?text=Book${index + 1}`
      );
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">List Your Textbook</h1>
        <p className="text-muted-foreground">
          Share your textbook with fellow students and help them save money while earning some yourself.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Book Information */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Book Information
            </CardTitle>
            <CardDescription>
              Provide details about the textbook you want to list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Algorithms"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  placeholder="e.g., Thomas H. Cormen"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (Optional)</Label>
                <Input
                  id="isbn"
                  placeholder="e.g., 978-0262033848"
                  value={formData.isbn}
                  onChange={(e) => handleInputChange("isbn", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course Code</Label>
                <Input
                  id="course"
                  placeholder="e.g., CS 101"
                  value={formData.course}
                  onChange={(e) => handleInputChange("course", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Engineering Campus, Room 201"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the book's condition, any markings, missing pages, etc."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Condition */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Book Condition
            </CardTitle>
            <CardDescription>
              Select the condition that best describes your book
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {conditions.map((condition) => (
                <div
                  key={condition.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.condition === condition.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleInputChange("condition", condition.value)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{condition.icon}</div>
                    <div className="font-medium text-sm">{condition.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {condition.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Listing Type & Pricing */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Listing Type & Pricing
            </CardTitle>
            <CardDescription>
              Choose how you want to list your book
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {listingTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.listingType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleInputChange("listingType", type.value)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.listingType === "sell" && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 45"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </div>
            )}

            {formData.listingType === "exchange" && (
              <div className="space-y-2">
                <Label htmlFor="wanted">Books you want in exchange</Label>
                <Textarea
                  placeholder="Describe the books you're looking for in exchange"
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Book Photos
            </CardTitle>
            <CardDescription>
              Add photos to help others see the condition of your book (up to 5 images)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Book ${index + 1}`}
                      className="w-24 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="w-24 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate("dashboard")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.title || !formData.author || !formData.condition || !formData.listingType}
            className="flex-1"
          >
            {isLoading ? "Listing Book..." : "List Book"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;