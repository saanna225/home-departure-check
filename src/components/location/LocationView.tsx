import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MapPin, Navigation } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/storage";
import { toast } from "sonner";

export const LocationView = () => {
  const settings = getSettings();
  const [useManual, setUseManual] = useState(settings.useManualLocation);
  const [manualLat, setManualLat] = useState(settings.manualLocation?.latitude.toString() ?? "");
  const [manualLng, setManualLng] = useState(settings.manualLocation?.longitude.toString() ?? "");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Location Settings</h2>
        <p className="text-sm text-muted-foreground">
          Set your home location for location-based reminders
        </p>
      </div>

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

          <Button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
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
