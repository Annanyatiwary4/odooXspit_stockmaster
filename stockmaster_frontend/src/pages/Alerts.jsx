import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Bell } from "lucide-react";

export function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const [alertsData, summaryData] = await Promise.all([
        api.getAlerts(),
        api.getAlertSummary(),
      ]);
      setAlerts(alertsData.alerts || []);
      setSummary(summaryData.summary);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      await api.generateAlerts();
      loadAlerts();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.acknowledgeAlert(id);
      loadAlerts();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolveAlert(id);
      loadAlerts();
    } catch (error) {
      alert(error.message);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Low: "bg-blue-100 text-blue-800",
      Medium: "bg-yellow-100 text-yellow-800",
      High: "bg-orange-100 text-orange-800",
      Critical: "bg-red-100 text-red-800",
    };
    return colors[severity] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Alerts</h2>
          <p className="text-gray-600">Monitor low stock and critical items</p>
        </div>
        <Button onClick={handleGenerate}>
          <Bell className="mr-2 h-4 w-4" />
          Generate Alerts
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{summary.activeAlerts}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-3xl font-bold text-red-600">{summary.criticalAlerts}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">{summary.highAlerts}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Medium Priority</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {summary.recentAlerts?.filter(a => a.severity === 'Medium').length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert._id} className={`${
              alert.severity === 'Critical' ? 'border-red-500 border-2' : ''
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'Critical' ? 'text-red-600' :
                      alert.severity === 'High' ? 'text-orange-600' :
                      alert.severity === 'Medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <CardTitle className="text-base">{alert.type}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'Active' ? 'bg-red-100 text-red-800' :
                      alert.status === 'Acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {alert.status === 'Active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert._id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alert.status !== 'Resolved' && (
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert._id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {alerts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                No alerts at the moment
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
