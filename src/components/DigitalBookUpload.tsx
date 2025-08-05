import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  FileText, 
  BookOpen, 
  Download,
  Share2,
  Eye,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DigitalBook {
  id: string;
  title: string;
  author: string;
  category: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  downloadCount: number;
  description?: string;
}

interface DigitalBookUploadProps {
  onNavigate: (page: string) => void;
}

const DigitalBookUpload = ({ onNavigate }: DigitalBookUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [digitalBooks, setDigitalBooks] = useState<DigitalBook[]>([
    {
      id: "1",
      title: "Introduction to Computer Science - Lecture Notes",
      author: "Prof. Smith",
      category: "Engineering & Technology",
      fileType: "PDF",
      fileSize: 2500000,
      uploadDate: "2024-01-15",
      downloadCount: 45,
      description: "Complete lecture notes for CS101 course"
    },
    {
      id: "2", 
      title: "Organic Chemistry Lab Manual",
      author: "Dr. Johnson",
      category: "Natural Sciences",
      fileType: "PDF",
      fileSize: 5200000,
      uploadDate: "2024-01-10",
      downloadCount: 23,
      description: "Lab procedures and safety guidelines"
    }
  ]);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    file: null as File | null
  });

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/epub+zip', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, EPUB, or TXT files only.",
          variant: "destructive"
        });
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 50MB.",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({ ...prev, file }));
    }
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Wait for upload to complete
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Add to digital books list
      const newBook: DigitalBook = {
        id: Date.now().toString(),
        title: formData.title,
        author: formData.author,
        category: formData.category,
        fileType: formData.file?.type.includes('pdf') ? 'PDF' : 
                  formData.file?.type.includes('epub') ? 'EPUB' : 'TXT',
        fileSize: formData.file?.size || 0,
        uploadDate: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        description: formData.description
      };

      setDigitalBooks(prev => [newBook, ...prev]);
      
      // Reset form
      setFormData({
        title: "",
        author: "",
        category: "",
        description: "",
        file: null
      });

      toast({
        title: "Upload successful",
        description: "Your digital book has been uploaded and is now available for download.",
      });
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.category || !formData.file) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    simulateUpload();
  };

  const handleDownload = (book: DigitalBook) => {
    // Simulate download
    setDigitalBooks(prev => 
      prev.map(b => 
        b.id === book.id 
          ? { ...b, downloadCount: b.downloadCount + 1 }
          : b
      )
    );
    
    toast({
      title: "Download started",
      description: `Downloading ${book.title}...`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Digital Book Library
        </h1>
        <p className="text-muted-foreground">
          Upload and share PDFs, eBooks, notes, and study materials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Digital Book
              </CardTitle>
              <CardDescription>
                Share your study materials with other students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter book/document title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the content"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="file">File *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.epub,.txt"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, EPUB, TXT (max 50MB)
                  </p>
                  {formData.file && (
                    <div className="mt-2 p-2 bg-secondary rounded text-sm">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{formData.file.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(formData.file.size)}
                      </div>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Book"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Digital Books List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Available Digital Books ({digitalBooks.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {digitalBooks.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No digital books yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to upload and share study materials!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {digitalBooks.map((book) => (
                    <Card key={book.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className="text-xs">
                              {book.fileType}
                            </Badge>
                          </div>
                        </div>

                        {book.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {book.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="secondary">{book.category}</Badge>
                            <span className="text-muted-foreground">
                              {formatFileSize(book.fileSize)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Uploaded: {new Date(book.uploadDate).toLocaleDateString()}</span>
                            <div className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              {book.downloadCount}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleDownload(book)}
                              className="flex-1"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DigitalBookUpload;