import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, CheckCircle, X, Truck, Package, Box } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { deliveriesAPI, warehousesAPI, productsAPI } from "@/lib/api";

export function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const { isManager, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    customer: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    warehouseId: "",
    deliveryDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: "",
    referenceNumber: "",
    notes: "",
    status: "draft",
    items: [],
  });
  const [itemForm, setItemForm] = useState({
    productId: "",
    quantity: "",
    locationId: "",
    unitPrice: "",
    notes: "",
  });

  useEffect(() => {
    loadDeliveries();
    loadWarehouses();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, warehouseFilter]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (warehouseFilter !== "all") params.warehouseId = warehouseFilter;
      
      const response = await deliveriesAPI.getAll(params);
      setDeliveries(response.data || []);
    } catch (error) {
      console.error("Error loading deliveries:", error);
      alert(error.message || "Error loading deliveries");
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await warehousesAPI.getAll();
      setWarehouses(response.data || []);
    } catch (error) {
      console.error("Error loading warehouses:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 1000 });
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const handleWarehouseChange = async (warehouseId) => {
    setFormData((prev) => ({ ...prev, warehouseId }));
    if (warehouseId) {
      try {
        const warehouse = await warehousesAPI.getById(warehouseId);
        setSelectedWarehouse(warehouse.data);
      } catch (error) {
        console.error("Error loading warehouse:", error);
      }
    } else {
      setSelectedWarehouse(null);
    }
  };

  const handleAddItem = () => {
    if (!itemForm.productId || !itemForm.quantity || !itemForm.locationId) {
      alert("Please fill in product, quantity, and location");
      return;
    }

    const newItem = {
      productId: itemForm.productId,
      quantity: parseFloat(itemForm.quantity),
      locationId: itemForm.locationId,
      unitPrice: itemForm.unitPrice ? parseFloat(itemForm.unitPrice) : 0,
      notes: itemForm.notes || "",
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    setItemForm({
      productId: "",
      quantity: "",
      locationId: "",
      unitPrice: "",
      notes: "",
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.warehouseId || formData.items.length === 0) {
      alert("Please fill in customer, warehouse, and add at least one item");
      return;
    }

    try {
      if (editingDelivery) {
        await deliveriesAPI.update(editingDelivery._id, formData);
      } else {
        await deliveriesAPI.create(formData);
      }
      setShowForm(false);
      setEditingDelivery(null);
      resetForm();
      loadDeliveries();
    } catch (error) {
      alert(error.message || "Error saving delivery");
    }
  };

  const handleEdit = (delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      customer: delivery.customer,
      customerEmail: delivery.customerEmail || "",
      customerPhone: delivery.customerPhone || "",
      deliveryAddress: delivery.deliveryAddress || "",
      warehouseId: delivery.warehouseId._id || delivery.warehouseId,
      deliveryDate: delivery.deliveryDate ? new Date(delivery.deliveryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDeliveryDate: delivery.expectedDeliveryDate ? new Date(delivery.expectedDeliveryDate).toISOString().split('T')[0] : "",
      referenceNumber: delivery.referenceNumber || "",
      notes: delivery.notes || "",
      status: delivery.status || 'draft',
      items: (delivery.items || []).map((it) => ({
        productId: it.productId && it.productId._id ? it.productId._id : it.productId,
        quantity: it.quantity,
        locationId: it.locationId,
        unitPrice: it.unitPrice || "",
        notes: it.notes || "",
      })),
    });
    handleWarehouseChange(delivery.warehouseId._id || delivery.warehouseId);
    setShowForm(true);
  };

  const handlePick = async (id) => {
    if (!confirm("Mark all items as picked?")) return;
    try {
      await deliveriesAPI.pick(id);
      loadDeliveries();
      alert("Items marked as picked");
    } catch (error) {
      alert(error.message || "Error picking items");
    }
  };

  const handlePack = async (id) => {
    if (!confirm("Mark all items as packed?")) return;
    try {
      await deliveriesAPI.pack(id);
      loadDeliveries();
      alert("Items marked as packed");
    } catch (error) {
      alert(error.message || "Error packing items");
    }
  };

  const handleValidate = async (id) => {
    if (!confirm("Are you sure you want to validate this delivery? Stock will be decreased automatically.")) return;
    try {
      await deliveriesAPI.validate(id);
      loadDeliveries();
      alert("Delivery validated successfully");
    } catch (error) {
      alert(error.message || "Error validating delivery");
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    if (!confirm(`Change delivery status to ${newStatus.toUpperCase()}?`)) return;
    try {
      await deliveriesAPI.update(id, { status: newStatus });
      loadDeliveries();
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      alert(error.message || "Error updating status");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this delivery?")) return;
    try {
      await deliveriesAPI.cancel(id);
      loadDeliveries();
      alert("Delivery canceled successfully");
    } catch (error) {
      alert(error.message || "Error canceling delivery");
    }
  };

  const resetForm = () => {
    setFormData({
      customer: "",
      customerEmail: "",
      customerPhone: "",
      deliveryAddress: "",
      warehouseId: "",
      deliveryDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: "",
      referenceNumber: "",
      notes: "",
      status: "draft",
      items: [],
    });
    setSelectedWarehouse(null);
    setItemForm({
      productId: "",
      quantity: "",
      locationId: "",
      unitPrice: "",
      notes: "",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      waiting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      picking: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      packing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      ready: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || colors.draft;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Delivery Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage outgoing stock deliveries
            </p>
          </div>
          {(isManager() || isAdmin()) && (
            <Button onClick={() => { setShowForm(true); resetForm(); }}>
              <Plus className="size-4 mr-2" />
              New Delivery
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="picking">Picking</SelectItem>
                    <SelectItem value="packing">Packing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Warehouse</Label>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh._id} value={wh._id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Form */}
        {showForm && (isManager() || isAdmin()) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingDelivery ? "Edit Delivery" : "New Delivery"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Customer *</Label>
                    <Input
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Warehouse *</Label>
                    <Select value={formData.warehouseId} onValueChange={handleWarehouseChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh._id} value={wh._id}>
                            {wh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Customer Email</Label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Customer Phone</Label>
                    <Input
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Delivery Address</Label>
                    <Input
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Delivery Date *</Label>
                    <Input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Expected Delivery Date</Label>
                    <Input
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Reference Number</Label>
                    <Input
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    />
                  </div>
                </div>

                {/* Add Item Form */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Add Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Product *</Label>
                      <Select value={itemForm.productId} onValueChange={(val) => setItemForm({ ...itemForm, productId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p._id} value={p._id}>
                              {p.name} ({p.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Select value={itemForm.locationId} onValueChange={(val) => setItemForm({ ...itemForm, locationId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedWarehouse?.locations?.map((loc) => (
                            <SelectItem key={loc._id} value={loc._id}>
                              {loc.name} ({loc.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={itemForm.quantity}
                        onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={handleAddItem} className="w-full">
                        <Plus className="size-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Items ({formData.items.length})</h3>
                    <div className="space-y-2">
                      {formData.items.map((item, index) => {
                        const product = products.find(p => p._id === item.productId);
                        const location = selectedWarehouse?.locations?.find(l => l._id === item.locationId);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                            <div className="flex-1">
                              <p className="font-medium">{product?.name || item.productId}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} {product?.uom || ""} from {location?.name || item.locationId}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingDelivery ? "Update" : "Create"} Delivery</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Deliveries List */}
        {!showForm && (
          loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : deliveries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No deliveries found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <Card key={delivery._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {delivery.deliveryNumber}
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(delivery.status)}`}>
                            {delivery.status.toUpperCase()}
                          </span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Customer: {delivery.customer} | Warehouse: {delivery.warehouseId?.name || delivery.warehouseId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(delivery.deliveryDate).toLocaleDateString()}
                          {delivery.referenceNumber && ` | Ref: ${delivery.referenceNumber}`}
                        </p>
                        {delivery.deliveryAddress && (
                          <p className="text-sm text-muted-foreground">
                            Address: {delivery.deliveryAddress}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        {delivery.status !== 'done' && delivery.status !== 'canceled' && (
                          <>
                            {(isManager() || isAdmin()) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(delivery)}
                              >
                                <Edit className="size-4 mr-2" />
                                Edit
                              </Button>
                            )}
                            {delivery.status === 'waiting' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePick(delivery._id)}
                              >
                                <Package className="size-4 mr-2" />
                                Pick
                              </Button>
                            )}
                            {delivery.status === 'picking' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePack(delivery._id)}
                              >
                                <Box className="size-4 mr-2" />
                                Pack
                              </Button>
                            )}
                            {delivery.status === 'ready' && (isManager() || isAdmin()) && (
                              <Button
                                size="sm"
                                onClick={() => handleValidate(delivery._id)}
                              >
                                <CheckCircle className="size-4 mr-2" />
                                Validate
                              </Button>
                            )}
                            {(isManager() || isAdmin()) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancel(delivery._id)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </>
                        )}
                        {(isManager() || isAdmin()) && delivery.status !== 'done' && (
                          <div className="w-40">
                            <Select value={delivery.status} onValueChange={(val) => handleChangeStatus(delivery._id, val)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent position="item-aligned">
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="waiting">Waiting</SelectItem>
                                <SelectItem value="picking">Picking</SelectItem>
                                <SelectItem value="packing">Packing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Items:</h4>
                      {delivery.items.map((item, index) => {
                        const product = item.productId?.name || item.productId;
                        return (
                          <div key={index} className="text-sm">
                            {product} - {item.quantity} {item.productId?.uom || ""}
                            {item.pickedQuantity > 0 && ` (Picked: ${item.pickedQuantity})`}
                            {item.packedQuantity > 0 && ` (Packed: ${item.packedQuantity})`}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}

