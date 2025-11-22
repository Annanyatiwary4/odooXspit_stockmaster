import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Settings as SettingsIcon, Mail, Bell, Database } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function Settings() {
  const { theme, setLight, setDark } = useTheme();
  const [settings, setSettings] = useState({
    defaultWarehouse: "",
    emailNotifications: true,
    lowStockAlerts: true,
    outOfStockAlerts: true,
    autoBackup: false,
    backupFrequency: "daily",
  });
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = () => {
    setLoading(true);
    // Save to localStorage (in production, save to backend)
    localStorage.setItem("appSettings", JSON.stringify(settings));
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved successfully!");
    }, 500);
  };

  const handleSaveEmailConfig = () => {
    setLoading(true);
    // Save to localStorage (in production, save to backend)
    localStorage.setItem("emailConfig", JSON.stringify(emailConfig));
    setTimeout(() => {
      setLoading(false);
      alert("Email configuration saved successfully!");
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system settings and preferences
          </p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="size-5" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>
              Configure general system preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={setLight}
                >
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={setDark}
                >
                  Dark
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="defaultWarehouse">Default Warehouse</Label>
              <Input
                id="defaultWarehouse"
                value={settings.defaultWarehouse}
                onChange={(e) => setSettings({ ...settings, defaultWarehouse: e.target.value })}
                placeholder="Select default warehouse"
              />
            </div>
            <Button onClick={handleSaveSettings} disabled={loading}>
              <Save className="size-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="size-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Configure alert and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important events
                </p>
              </div>
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="size-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when products fall below reorder level
                </p>
              </div>
              <input
                type="checkbox"
                id="lowStockAlerts"
                checked={settings.lowStockAlerts}
                onChange={(e) => setSettings({ ...settings, lowStockAlerts: e.target.checked })}
                className="size-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="outOfStockAlerts">Out of Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified immediately when products run out
                </p>
              </div>
              <input
                type="checkbox"
                id="outOfStockAlerts"
                checked={settings.outOfStockAlerts}
                onChange={(e) => setSettings({ ...settings, outOfStockAlerts: e.target.checked })}
                className="size-5"
              />
            </div>
            <Button onClick={handleSaveSettings} disabled={loading}>
              <Save className="size-4 mr-2" />
              {loading ? "Saving..." : "Save Notifications"}
            </Button>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="size-5" />
              <CardTitle>Email Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure SMTP settings for email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                  placeholder="587"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={emailConfig.smtpUser}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={emailConfig.smtpPassword}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                  placeholder="App password"
                />
              </div>
            </div>
            <Button onClick={handleSaveEmailConfig} disabled={loading}>
              <Save className="size-4 mr-2" />
              {loading ? "Saving..." : "Save Email Config"}
            </Button>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="size-5" />
              <CardTitle>Backup Settings</CardTitle>
            </div>
            <CardDescription>
              Configure automatic backup preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Automatic Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic database backups
                </p>
              </div>
              <input
                type="checkbox"
                id="autoBackup"
                checked={settings.autoBackup}
                onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                className="size-5"
              />
            </div>
            {settings.autoBackup && (
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <select
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none mt-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
            <Button onClick={handleSaveSettings} disabled={loading}>
              <Save className="size-4 mr-2" />
              {loading ? "Saving..." : "Save Backup Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

