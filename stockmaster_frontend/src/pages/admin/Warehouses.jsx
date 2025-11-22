import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Warehouse, MapPin } from "lucide-react";
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
                  {warehouse.locations && warehouse.locations.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {warehouse.locations.length} location(s)
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

