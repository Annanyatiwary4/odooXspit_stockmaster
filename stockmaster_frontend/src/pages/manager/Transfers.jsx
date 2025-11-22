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
import { Plus, Search, Edit, Trash2, CheckCircle, X, Move, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { transfersAPI, warehousesAPI, productsAPI } from "@/lib/api";

export function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [sourceWarehouse, setSourceWarehouse] = useState(null);
  const [destWarehouse, setDestWarehouse] = useState(null);
  const { isManager, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    sourceWarehouseId: "",
    sourceLocationId: "",
    destinationWarehouseId: "",
    destinationLocationId: "",
    transferDate: new Date().toISOString().split('T')[0],
    scheduledDate: "",
    reason: "",
    notes: "",
    status: "draft",
    items: [],
  });
  const [itemForm, setItemForm] = useState({
    productId: "",
    quantity: "",
    notes: "",
  });

  useEffect(() => {
    loadTransfers();
    loadWarehouses();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await transfersAPI.getAll(params);
      setTransfers(response.data || []);
    } catch (error) {
      console.error("Error loading transfers:", error);
      alert(error.message || "Error loading transfers");
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

  const handleSourceWarehouseChange = async (warehouseId) => {
    setFormData((prev) => ({ ...prev, sourceWarehouseId: warehouseId, sourceLocationId: "" }));
    if (warehouseId) {
      try {
        const warehouse = await warehousesAPI.getById(warehouseId);
        setSourceWarehouse(warehouse.data);
      } catch (error) {
        console.error("Error loading warehouse:", error);
      }
    } else {
      setSourceWarehouse(null);
    }
  };

  const handleDestWarehouseChange = async (warehouseId) => {
    setFormData((prev) => ({ ...prev, destinationWarehouseId: warehouseId, destinationLocationId: "" }));
    if (warehouseId) {
      try {
        const warehouse = await warehousesAPI.getById(warehouseId);
        setDestWarehouse(warehouse.data);
      } catch (error) {
        console.error("Error loading warehouse:", error);
      }
    } else {
      setDestWarehouse(null);
    }
  };

  const handleAddItem = () => {
    if (!itemForm.productId || !itemForm.quantity) {
      alert("Please fill in product and quantity");
      return;
    }

    const newItem = {
      productId: itemForm.productId,
      quantity: parseFloat(itemForm.quantity),
      notes: itemForm.notes || "",
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    setItemForm({
      productId: "",
      quantity: "",
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
    if (!formData.sourceWarehouseId || !formData.sourceLocationId || 
        !formData.destinationWarehouseId || !formData.destinationLocationId || 
        formData.items.length === 0) {
      alert("Please fill in source, destination, and add at least one item");
      return;
    }

    try {
      if (editingTransfer) {
        await transfersAPI.update(editingTransfer._id, formData);
      } else {
        await transfersAPI.create(formData);
      }
      setShowForm(false);
      setEditingTransfer(null);
      resetForm();
      loadTransfers();
    } catch (error) {
      alert(error.message || "Error saving transfer");
    }
  };

  const handleEdit = (transfer) => {
    setEditingTransfer(transfer);
    setFormData({
      sourceWarehouseId: transfer.sourceWarehouseId._id || transfer.sourceWarehouseId,
      sourceLocationId: transfer.sourceLocationId,
      destinationWarehouseId: transfer.destinationWarehouseId._id || transfer.destinationWarehouseId,
      destinationLocationId: transfer.destinationLocationId,
      transferDate: transfer.transferDate ? new Date(transfer.transferDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      scheduledDate: transfer.scheduledDate ? new Date(transfer.scheduledDate).toISOString().split('T')[0] : "",
      reason: transfer.reason || "",
      notes: transfer.notes || "",
      status: transfer.status || 'draft',
      items: (transfer.items || []).map((it) => ({
        productId: it.productId && it.productId._id ? it.productId._id : it.productId,
        quantity: it.quantity,
        notes: it.notes || "",
      })),
    });
    handleSourceWarehouseChange(transfer.sourceWarehouseId._id || transfer.sourceWarehouseId);
    handleDestWarehouseChange(transfer.destinationWarehouseId._id || transfer.destinationWarehouseId);
    setShowForm(true);
  };

  const handleExecute = async (id) => {
    if (!confirm("Are you sure you want to execute this transfer? Stock will be moved between locations.")) return;
    try {
      await transfersAPI.execute(id);
      loadTransfers();
      alert("Transfer executed successfully");
    } catch (error) {
      alert(error.message || "Error executing transfer");
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    if (!confirm(`Change transfer status to ${newStatus.toUpperCase()}?`)) return;
    try {
      await transfersAPI.update(id, { status: newStatus });
      loadTransfers();
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      alert(error.message || "Error updating status");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this transfer?")) return;
    try {
      await transfersAPI.cancel(id);
      loadTransfers();
      alert("Transfer canceled successfully");
    } catch (error) {
      alert(error.message || "Error canceling transfer");
    }
  };

  const resetForm = () => {
    setFormData({
      sourceWarehouseId: "",
      sourceLocationId: "",
      destinationWarehouseId: "",
      destinationLocationId: "",
      transferDate: new Date().toISOString().split('T')[0],
      scheduledDate: "",
      reason: "",
      notes: "",
      status: "draft",
      items: [],
    });
    setSourceWarehouse(null);
    setDestWarehouse(null);
    setItemForm({
      productId: "",
      quantity: "",
      notes: "",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      waiting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      ready: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
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
            <h1 className="text-3xl font-bold">Internal Transfers</h1>
            <p className="text-muted-foreground mt-1">
              Move stock between locations
            </p>
          </div>
          {(isManager() || isAdmin()) && (
            <Button onClick={() => { setShowForm(true); resetForm(); }}>
              <Plus className="size-4 mr-2" />
              New Transfer
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by transfer number..."
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
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Form */}
        {showForm && (isManager() || isAdmin()) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingTransfer ? "Edit Transfer" : "New Transfer"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Source Warehouse *</Label>
                    <Select value={formData.sourceWarehouseId} onValueChange={handleSourceWarehouseChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source warehouse" />
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
                    <Label>Source Location *</Label>
                    <Select value={formData.sourceLocationId} onValueChange={(val) => setFormData({ ...formData, sourceLocationId: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceWarehouse?.locations?.map((loc) => (
                          <SelectItem key={loc._id} value={loc._id}>
                            {loc.name} ({loc.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Destination Warehouse *</Label>
                    <Select value={formData.destinationWarehouseId} onValueChange={handleDestWarehouseChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination warehouse" />
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
                    <Label>Destination Location *</Label>
                    <Select value={formData.destinationLocationId} onValueChange={(val) => setFormData({ ...formData, destinationLocationId: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                      <SelectContent>
                        {destWarehouse?.locations?.map((loc) => (
                          <SelectItem key={loc._id} value={loc._id}>
                            {loc.name} ({loc.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Transfer Date *</Label>
                    <Input
                      type="date"
                      value={formData.transferDate}
                      onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Reason</Label>
                    <Input
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Reason for transfer..."
                    />
                  </div>
                </div>

                {/* Add Item Form */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Add Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                            <div className="flex-1">
                              <p className="font-medium">{product?.name || item.productId}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} {product?.uom || ""}
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
                  <Button type="submit">{editingTransfer ? "Update" : "Create"} Transfer</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transfers List */}
        {!showForm && (
          loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transfers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Move className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No transfers found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <Card key={transfer._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {transfer.transferNumber}
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(transfer.status)}`}>
                            {transfer.status.toUpperCase()}
                          </span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{transfer.sourceWarehouseId?.name || transfer.sourceWarehouseId}</span>
                          <ArrowRight className="size-4" />
                          <span>{transfer.destinationWarehouseId?.name || transfer.destinationWarehouseId}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(transfer.transferDate).toLocaleDateString()}
                          {transfer.reason && ` | Reason: ${transfer.reason}`}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        {transfer.status !== 'done' && transfer.status !== 'canceled' && (
                          <>
                            {(isManager() || isAdmin()) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(transfer)}
                              >
                                <Edit className="size-4 mr-2" />
                                Edit
                              </Button>
                            )}
                            {transfer.status === 'ready' && (
                              <Button
                                size="sm"
                                onClick={() => handleExecute(transfer._id)}
                              >
                                <CheckCircle className="size-4 mr-2" />
                                Execute
                              </Button>
                            )}
                            {(isManager() || isAdmin()) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancel(transfer._id)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </>
                        )}
                        {(isManager() || isAdmin()) && transfer.status !== 'done' && (
                          <div className="w-40">
                            <Select value={transfer.status} onValueChange={(val) => handleChangeStatus(transfer._id, val)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent position="item-aligned">
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="waiting">Waiting</SelectItem>
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
                      {transfer.items.map((item, index) => {
                        const product = item.productId?.name || item.productId;
                        return (
                          <div key={index} className="text-sm">
                            {product} - {item.quantity} {item.productId?.uom || ""}
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

