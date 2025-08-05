import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Search, 
  Plus, 
  Trash2, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  searchQuery: string;
  category?: string;
  maxPrice?: number;
  location?: string;
  isActive: boolean;
  createdAt: string;
  matchCount: number;
  lastNotified?: string;
}

interface InventoryAlertsProps {
  onNavigate: (page: string) => void;
}

const InventoryAlerts = ({ onNavigate }: InventoryAlertsProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      searchQuery: "Calculus Stewart",
      category: "Natural Sciences",
      maxPrice: 100,
      location: "New York",
      isActive: true,
      createdAt: "2024-01-15",
      matchCount: 3,
      lastNotified: "2024-01-20"
    },
    {
      id: "2",
      searchQuery: "Organic Chemistry",
      category: "Natural Sciences",
      maxPrice: 150,
      isActive: true,
      createdAt: "2024-01-10",
      matchCount: 1,
      lastNotified: "2024-01-18"
    },
    {
      id: "3",
      searchQuery: "Programming Concepts",
      category: "Engineering & Technology",
      isActive: false,
      createdAt: "2024-01-05",
      matchCount: 0
    }
  ]);

  const [newAlert, setNewAlert] = useState({
    searchQuery: "",
    category: "",
    maxPrice: "",
    location: ""
  });

  const [showAddForm, setShowAddForm] = useState(false);
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

  const handleCreateAlert = () => {
    if (!newAlert.searchQuery.trim()) {
      toast({
        title: "Missing search query",
        description: "Please enter what book you're looking for.",
        variant: "destructive"
      });
      return;
    }

    const alert: Alert = {
      id: Date.now().toString(),
      searchQuery: newAlert.searchQuery,
      category: newAlert.category || undefined,
      maxPrice: newAlert.maxPrice ? Number(newAlert.maxPrice) : undefined,
      location: newAlert.location || undefined,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      matchCount: 0
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({ searchQuery: "", category: "", maxPrice: "", location: "" });
    setShowAddForm(false);

    toast({
      title: "Alert created",
      description: "You'll be notified when a matching book becomes available.",
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, isActive: !alert.isActive }
          : alert
      )
    );

    const alert = alerts.find(a => a.id === id);
    toast({
      title: alert?.isActive ? "Alert paused" : "Alert activated",
      description: alert?.isActive 
        ? "You won't receive notifications for this alert." 
        : "You'll now receive notifications for this alert.",
    });
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: "Alert deleted",
      description: "The alert has been removed.",
    });
  };

  const simulateNewMatch = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              matchCount: alert.matchCount + 1,
              lastNotified: new Date().toISOString().split('T')[0]
            }
          : alert
      )
    );

    toast({
      title: "New book found!",
      description: "A book matching your alert is now available. Check your email for details.",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Book Alerts
        </h1>
        <p className="text-muted-foreground">
          Get notified when books you're looking for become available
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{alerts.filter(a => a.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{alerts.reduce((sum, a) => sum + a.matchCount, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Search className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-sm text-muted-foreground">All Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Alert Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowAddForm(true)}
          className="w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Alert
        </Button>
      </div>

      {/* Add Alert Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Book Alert</CardTitle>
            <CardDescription>
              We'll notify you when a book matching your criteria becomes available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="searchQuery">What book are you looking for? *</Label>
                <Input
                  id="searchQuery"
                  value={newAlert.searchQuery}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="e.g., Calculus by Stewart, Organic Chemistry, etc."
                />
              </div>

              <div>
                <Label htmlFor="category">Category (optional)</Label>
                <select
                  id="category"
                  value={newAlert.category}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Any category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="maxPrice">Max Price (optional)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={newAlert.maxPrice}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, maxPrice: e.target.value }))}
                  placeholder="e.g., 100"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location">Preferred Location (optional)</Label>
                <Input
                  id="location"
                  value={newAlert.location}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., New York, Boston, etc."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <Button onClick={handleCreateAlert}>
                Create Alert
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Alerts ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first alert to get notified when books become available
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`${alert.isActive ? 'bg-background' : 'bg-muted/50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{alert.searchQuery}</h4>
                          <Badge variant={alert.isActive ? "default" : "secondary"}>
                            {alert.isActive ? "Active" : "Paused"}
                          </Badge>
                          {alert.matchCount > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {alert.matchCount} match{alert.matchCount !== 1 ? 'es' : ''}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          {alert.category && (
                            <p>Category: {alert.category}</p>
                          )}
                          {alert.maxPrice && (
                            <p>Max price: ${alert.maxPrice}</p>
                          )}
                          {alert.location && (
                            <p>Location: {alert.location}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Created: {new Date(alert.createdAt).toLocaleDateString()}
                            </div>
                            {alert.lastNotified && (
                              <div className="flex items-center">
                                <Bell className="w-3 h-3 mr-1" />
                                Last notified: {new Date(alert.lastNotified).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={alert.isActive}
                            onCheckedChange={() => toggleAlert(alert.id)}
                          />
                          <Label className="text-sm">Active</Label>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => simulateNewMatch(alert.id)}
                          disabled={!alert.isActive}
                        >
                          Test
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="w-3 h-3" />
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
  );
};

export default InventoryAlerts;