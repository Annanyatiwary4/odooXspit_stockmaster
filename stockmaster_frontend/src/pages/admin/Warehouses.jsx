import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Warehouse, MapPin, MapPinPlus, MapPinMinus, X } from "lucide-react";
import { warehousesAPI } from "@/lib/api";

export function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({
    name: "",
    code: "",
    type: "area",
    capacity: "",
  });
  const [locationCodeEdited, setLocationCodeEdited] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await warehousesAPI.getAll();
      setWarehouses(response.data || []);
    } catch (error) {
      console.error("Error loading warehouses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await warehousesAPI.update(editingWarehouse._id, formData);
      } else {
        await warehousesAPI.create(formData);
      }
      setShowForm(false);
      setEditingWarehouse(null);
      resetForm();
      loadWarehouses();
    } catch (error) {
      alert(error.message || "Error saving warehouse");
    }
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address || "",
      contactPhone: warehouse.contactPhone || "",
      contactEmail: warehouse.contactEmail || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      await warehousesAPI.delete(id);
      loadWarehouses();
    } catch (error) {
      alert(error.message || "Error deleting warehouse");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      contactPhone: "",
      contactEmail: "",
    });
  };

  const handleManageLocations = async (warehouse) => {
    try {
      const response = await warehousesAPI.getById(warehouse._id);
      setSelectedWarehouse(response.data);
      setShowLocationForm(false);
      setEditingLocation(null);
      resetLocationForm();
    } catch (error) {
      alert(error.message || "Error loading warehouse details");
    }
  };

  const handleAddLocation = () => {
    setShowLocationForm(true);
    setEditingLocation(null);
    // reset and prefill a generated code (if possible)
    resetLocationForm();
    setLocationCodeEdited(false);
    // generate a code based on selected warehouse and default type
    if (selectedWarehouse) {
      const gen = generateLocationCode({ name: "", type: "area" }, selectedWarehouse);
      setLocationForm((f) => ({ ...f, code: gen }));
    }
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setLocationForm({
      name: location.name || "",
      code: location.code || "",
      type: location.type || "area",
      capacity: location.capacity || "",
    });
    setShowLocationForm(true);
    // mark code as edited so generator doesn't overwrite
    setLocationCodeEdited(true);
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    try {
      const locationData = {
        name: locationForm.name,
        code: locationForm.code,
        type: locationForm.type,
        capacity: locationForm.capacity ? parseInt(locationForm.capacity) : null,
      };

      if (editingLocation) {
        // Update existing location using the proper API endpoint
        await warehousesAPI.updateLocation(
          selectedWarehouse._id,
          editingLocation._id,
          locationData
        );
      } else {
        // Add new location using the proper API endpoint
        await warehousesAPI.addLocation(
          selectedWarehouse._id,
          locationData
        );
      }
      setShowLocationForm(false);
      setEditingLocation(null);
      resetLocationForm();
      loadWarehouses();
      // Refresh selected warehouse
      const updated = await warehousesAPI.getById(selectedWarehouse._id);
      setSelectedWarehouse(updated.data);
    } catch (error) {
      alert(error.message || "Error saving location");
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      // Use the proper API endpoint to delete location
      await warehousesAPI.deleteLocation(selectedWarehouse._id, locationId);
      loadWarehouses();
      // Refresh selected warehouse
      const updated = await warehousesAPI.getById(selectedWarehouse._id);
      setSelectedWarehouse(updated.data);
    } catch (error) {
      alert(error.message || "Error deleting location");
    }
  };

  const resetLocationForm = () => {
    setLocationForm({
      name: "",
      code: "",
      type: "area",
      capacity: "",
    });
    setLocationCodeEdited(false);
  };

  // Generate a physical location code using warehouse code, type and sequence
  const generateLocationCode = ({ name, type }, warehouse) => {
    const wh = warehouse?.code ? String(warehouse.code).toUpperCase() : "WH";
    const typeAbbr = (type || "area").charAt(0).toUpperCase();
    // count existing locations of same type to form a sequence (fallback to 1)
    const existing = warehouse?.locations || [];
    const sameTypeCount = existing.filter((l) => String(l.type || "").toLowerCase() === String(type || "").toLowerCase()).length;
    const seq = String(sameTypeCount + 1).padStart(3, "0");
    // optional name part (shortened) — keep it short and alphanumeric
    const namePart = (name || "")
      .replace(/\s+/g, "")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4);
    return `${wh}-${typeAbbr}${namePart ? "-" + namePart + "-" + seq : "-" + seq}`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage warehouses
            </p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingWarehouse(null); resetForm(); }}>
            <Plus className="size-4 mr-2" />
            Add Warehouse
          </Button>
        </div>

        {/* Warehouse Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{editingWarehouse ? "Edit Warehouse" : "Create Warehouse"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Warehouse Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Warehouse Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        disabled={!!editingWarehouse}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingWarehouse(null); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Warehouse</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Location Management Modal */}
        {selectedWarehouse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manage Locations - {selectedWarehouse.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add, edit, or delete locations within this warehouse
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedWarehouse(null);
                      setShowLocationForm(false);
                      resetLocationForm();
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showLocationForm ? (
                  <form onSubmit={handleSaveLocation} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="locName">Location Name *</Label>
                        <Input
                          id="locName"
                          value={locationForm.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocationForm((f) => {
                              const newForm = { ...f, name: val };
                              if (!locationCodeEdited && selectedWarehouse) {
                                newForm.code = generateLocationCode({ name: val, type: newForm.type }, selectedWarehouse);
                              }
                              return newForm;
                            });
                          }}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="locCode">Location Code *</Label>
                        <Input
                          id="locCode"
                          value={locationForm.code}
                          onChange={(e) => {
                            setLocationCodeEdited(true);
                            setLocationForm({ ...locationForm, code: e.target.value.toUpperCase() });
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="locType">Location Type</Label>
                        <Select
                          value={locationForm.type}
                          onValueChange={(val) => {
                            setLocationForm((f) => {
                              const newForm = { ...f, type: val };
                              if (!locationCodeEdited && selectedWarehouse) {
                                newForm.code = generateLocationCode({ name: newForm.name, type: val }, selectedWarehouse);
                              }
                              return newForm;
                            });
                          }}
                        >
                          <SelectTrigger id="locType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="area">Area</SelectItem>
                            <SelectItem value="rack">Rack</SelectItem>
                            <SelectItem value="shelf">Shelf</SelectItem>
                            <SelectItem value="bin">Bin</SelectItem>
                            <SelectItem value="zone">Zone</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="locCapacity">Capacity (optional)</Label>
                        <Input
                          id="locCapacity"
                          type="number"
                          value={locationForm.capacity}
                          onChange={(e) => setLocationForm({ ...locationForm, capacity: e.target.value })}
                          placeholder="Max capacity"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowLocationForm(false);
                          setEditingLocation(null);
                          resetLocationForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Location</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Locations ({selectedWarehouse.locations?.length || 0})</h3>
                      <Button onClick={handleAddLocation}>
                        <MapPinPlus className="size-4 mr-2" />
                        Add Location
                      </Button>
                    </div>
                    {selectedWarehouse.locations && selectedWarehouse.locations.length > 0 ? (
                      <div className="space-y-2">
                        {selectedWarehouse.locations.map((location) => (
                          <div
                            key={location._id}
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div>
                              <p className="font-medium">{location.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Code: {location.code} | Type: {location.type}
                                {location.capacity && ` | Capacity: ${location.capacity}`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEditLocation(location)}
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDeleteLocation(location._id)}
                              >
                                <MapPinMinus className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="size-12 mx-auto mb-2 opacity-50" />
                        <p>No locations added yet</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Warehouses Grid */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : warehouses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Warehouse className="size-12 mx-auto mb-2 opacity-50" />
                <p>No warehouses found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse) => (
              <Card key={warehouse._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Warehouse className="size-5" />
                        {warehouse.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">
                        {warehouse.code}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(warehouse)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(warehouse._id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {warehouse.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="size-4 mt-0.5" />
                      <span>{warehouse.address}</span>
                    </div>
                  )}
                  {warehouse.contactPhone && (
                    <p className="text-sm text-muted-foreground">Phone: {warehouse.contactPhone}</p>
                  )}
                  {warehouse.contactEmail && (
                    <p className="text-sm text-muted-foreground">Email: {warehouse.contactEmail}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    {warehouse.locations && warehouse.locations.length > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {warehouse.locations.length} location(s)
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No locations</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageLocations(warehouse)}
                    >
                      <MapPin className="size-4 mr-2" />
                      Manage Locations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

