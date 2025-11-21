import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MapPin, Navigation, Search, CloudRain, Wind, Droplets } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/storage";
import { toast } from "sonner";
import { getCurrentWeather, getWeatherEmoji } from "@/lib/weatherService";
import type { WeatherCondition } from "@/lib/weatherService";

const WEATHER_API_KEY = 'b3fc347c6fec23bd0faf3e47f764767f';

interface GeocodeResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export const LocationView = () => {
  const settings = getSettings();
  const [useManual, setUseManual] = useState(settings.useManualLocation);
  const [manualLat, setManualLat] = useState(settings.manualLocation?.latitude.toString() ?? "");
  const [manualLng, setManualLng] = useState(settings.manualLocation?.longitude.toString() ?? "");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    const loadWeather = async () => {
      const location = settings.useManualLocation 
        ? settings.manualLocation 
        : settings.homeLocation;
      
      if (!location) return;

      setIsLoadingWeather(true);
      const weather = await getCurrentWeather(location.latitude, location.longitude);
      setCurrentWeather(weather);
      setIsLoadingWeather(false);
    };

    loadWeather();
    const interval = setInterval(loadWeather, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [settings.homeLocation, settings.manualLocation, settings.useManualLocation]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateSettings({
          homeLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        toast.success("Home location set successfully");
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error("Failed to get location: " + error.message);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSaveManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid coordinates");
      return;
    }

    updateSettings({
      manualLocation: {
        latitude: lat,
        longitude: lng,
      },
      useManualLocation: useManual,
    });

    toast.success("Manual location saved");
  };

  const handleToggleManual = (checked: boolean) => {
    setUseManual(checked);
    updateSettings({ useManualLocation: checked });
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a city or place name");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${WEATHER_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Failed to search location");
      }

      const data = await response.json();
      
      if (data.length === 0) {
        toast.error("No locations found. Try a different search.");
      } else {
        setSearchResults(data);
        toast.success(`Found ${data.length} location(s)`);
      }
    } catch (error) {
      console.error("Location search error:", error);
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: GeocodeResult) => {
    updateSettings({
      homeLocation: {
        latitude: result.lat,
        longitude: result.lon,
        address: `${result.name}, ${result.state ? result.state + ', ' : ''}${result.country}`,
      },
    });
    toast.success(`Location set to ${result.name}`);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Location Settings</h2>
        <p className="text-sm text-muted-foreground">
          Set your home location for location-based reminders
        </p>
      </div>

      {currentWeather && (settings.homeLocation || settings.manualLocation) && (
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Weather</p>
                <p className="text-4xl font-bold">
                  {getWeatherEmoji(currentWeather)} {currentWeather.temp}°C
                </p>
                <p className="text-sm capitalize text-muted-foreground">
                  {currentWeather.description}
                </p>
              </div>
              <div className="space-y-2 text-right">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4" />
                  <span>Feels like {currentWeather.feelsLike}°C</span>
                </div>
              </div>
            </div>
            {isLoadingWeather && (
              <p className="text-xs text-muted-foreground mt-2">Refreshing...</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Home Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.homeLocation ? (
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm font-medium mb-2">Current home location:</p>
              {settings.homeLocation.address && (
                <p className="text-sm mb-2">{settings.homeLocation.address}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Latitude: {settings.homeLocation.latitude.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                Longitude: {settings.homeLocation.longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-warning/10 border border-warning rounded-lg">
              <p className="text-sm text-warning-foreground">
                No home location set. Set your location to enable location-based reminders.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location-search">Search by City or Place Name</Label>
            <div className="flex gap-2">
              <Input
                id="location-search"
                type="text"
                placeholder="e.g., New York, London, Tokyo"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
              />
              <Button
                onClick={handleSearchLocation}
                disabled={isSearching}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Select a location:</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(result)}
                    className="w-full p-3 text-left bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <p className="font-medium">{result.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.state ? `${result.state}, ` : ''}{result.country} • {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            variant="outline"
            className="w-full gap-2"
          >
            <Navigation className="h-4 w-4" />
            {isGettingLocation ? "Getting Location..." : "Use Current Location"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Manual Location (Testing)</span>
            <div className="flex items-center gap-2">
              <Label htmlFor="manual-toggle" className="text-sm font-normal">
                Enabled
              </Label>
              <Switch
                id="manual-toggle"
                checked={useManual}
                onCheckedChange={handleToggleManual}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For testing purposes, you can manually set your location coordinates
          </p>

          <div className="space-y-2">
            <Label htmlFor="manual-lat">Latitude</Label>
            <Input
              id="manual-lat"
              type="number"
              step="0.000001"
              placeholder="e.g., 40.7128"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              disabled={!useManual}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-lng">Longitude</Label>
            <Input
              id="manual-lng"
              type="number"
              step="0.000001"
              placeholder="e.g., -74.0060"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              disabled={!useManual}
            />
          </div>

          <Button
            onClick={handleSaveManualLocation}
            disabled={!useManual}
            className="w-full"
          >
            Save Manual Location
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
