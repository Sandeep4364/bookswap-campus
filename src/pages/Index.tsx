import { useState, useEffect } from "react";
import Auth from "./Auth";
import Dashboard from "@/components/dashboard/Dashboard";
import Categories from "./Categories";
import AddBook from "./AddBook";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUniversity");
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-muted-foreground">Loading BookSwap...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "categories":
        return <Categories onNavigate={handleNavigate} />;
      case "add-book":
        return <AddBook onNavigate={handleNavigate} />;
      case "my-books":
      case "profile":
      case "messages":
      case "search":
      case "wishlist":
      case "community":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground mb-6">
                This feature is under development and will be available soon!
              </p>
              <button
                onClick={() => handleNavigate("dashboard")}
                className="text-primary hover:underline"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      {renderCurrentPage()}
    </div>
  );
};

export default Index;
