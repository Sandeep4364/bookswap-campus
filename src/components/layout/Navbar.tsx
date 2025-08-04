import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Plus,
  BookOpen,
  MessageCircle,
  Heart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar = ({ onLogout, currentPage, onNavigate }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const userName = localStorage.getItem("userName") || "Student";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate("search");
    }
  };

  return (
    <nav className="bg-white border-b border-border shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate("dashboard")}
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BookSwap</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for textbooks, authors, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Add Book Button */}
            <Button
              onClick={() => onNavigate("add-book")}
              className="hidden sm:flex"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              List Book
            </Button>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant={currentPage === "categories" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onNavigate("categories")}
              >
                Categories
              </Button>
              <Button
                variant={currentPage === "my-books" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onNavigate("my-books")}
              >
                My Books
              </Button>
              <Button
                variant={currentPage === "wishlist" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onNavigate("wishlist")}
              >
                <Heart className="w-4 h-4 mr-1" />
                Wishlist
              </Button>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <MessageCircle className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                2
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate("my-books")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Books
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate("messages")}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;