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
import { Plus, Search, Edit, Trash2, CheckCircle, X, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { receiptsAPI, warehousesAPI, productsAPI } from "@/lib/api";

export function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    supplier: "",
    supplierEmail: "",
    supplierPhone: "",
    warehouseId: "",
    receiptDate: new Date().toISOString().split('T')[0],
    expectedDate: "",
    referenceNumber: "",
    notes: "",
    status: "draft",
    items: [],
  });
  const { isManager, isAdmin } = useAuth();
  const [itemForm, setItemForm] = useState({
    productId: "",
    quantity: "",
    expectedQuantity: "",
    locationId: "",
    unitPrice: "",
    notes: "",
  });

  useEffect(() => {
    loadReceipts();
    loadWarehouses();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, warehouseFilter]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (warehouseFilter !== "all") params.warehouseId = warehouseFilter;
      
      const response = await receiptsAPI.getAll(params);
      setReceipts(response.data || []);
    } catch (error) {
      console.error("Error loading receipts:", error);
      alert(error.message || "Error loading receipts");
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
      expectedQuantity: itemForm.expectedQuantity ? parseFloat(itemForm.expectedQuantity) : null,
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
      expectedQuantity: "",
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
    if (!formData.supplier || !formData.warehouseId || formData.items.length === 0) {
      alert("Please fill in supplier, warehouse, and add at least one item");
      return;
    }

    try {
      if (editingReceipt) {
        await receiptsAPI.update(editingReceipt._id, formData);
      } else {
        await receiptsAPI.create(formData);
      }
      setShowForm(false);
      setEditingReceipt(null);
      resetForm();
      loadReceipts();
    } catch (error) {
      alert(error.message || "Error saving receipt");
    }
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt);
    setFormData({
      supplier: receipt.supplier,
      supplierEmail: receipt.supplierEmail || "",
      supplierPhone: receipt.supplierPhone || "",
      warehouseId: receipt.warehouseId._id || receipt.warehouseId,
      receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDate: receipt.expectedDate ? new Date(receipt.expectedDate).toISOString().split('T')[0] : "",
      referenceNumber: receipt.referenceNumber || "",
      notes: receipt.notes || "",
      status: receipt.status || 'draft',
      // normalize items to primitive shapes expected by the form
      items: (receipt.items || []).map((it) => ({
        productId: it.productId && it.productId._id ? it.productId._id : it.productId,
        quantity: it.quantity,
        expectedQuantity: it.expectedQuantity || "",
        locationId: it.locationId,
        unitPrice: it.unitPrice || "",
        notes: it.notes || "",
      })),
    });
    handleWarehouseChange(receipt.warehouseId._id || receipt.warehouseId);
    setShowForm(true);
  };

  const handleValidate = async (id) => {
    if (!confirm("Are you sure you want to validate this receipt? Stock will be updated automatically.")) return;
    try {
      await receiptsAPI.validate(id);
      loadReceipts();
      alert("Receipt validated successfully");
    } catch (error) {
      alert(error.message || "Error validating receipt");
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    if (!confirm(`Change receipt status to ${newStatus.toUpperCase()}?`)) return;
    try {
      // Only send status to keep other data unchanged on server
      await receiptsAPI.update(id, { status: newStatus });
      loadReceipts();
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      alert(error.message || "Error updating status");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this receipt?")) return;
    try {
      await receiptsAPI.cancel(id);
      loadReceipts();
      alert("Receipt canceled successfully");
    } catch (error) {
      alert(error.message || "Error canceling receipt");
    }
  };

  const resetForm = () => {
    setFormData({
      supplier: "",
      supplierEmail: "",
      supplierPhone: "",
      warehouseId: "",
      receiptDate: new Date().toISOString().split('T')[0],
      expectedDate: "",
      referenceNumber: "",
      notes: "",
      status: "draft",
      items: [],
    });
    setSelectedWarehouse(null);
    setItemForm({
      productId: "",
      quantity: "",
      expectedQuantity: "",
      locationId: "",
      unitPrice: "",
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
            <h1 className="text-3xl font-bold">Receipts</h1>
            <p className="text-muted-foreground mt-1">
              Manage incoming stock receipts
            </p>
          </div>
          <Button onClick={() => { setShowForm(true); resetForm(); }}>
            <Plus className="size-4 mr-2" />
            New Receipt
          </Button>
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
                    placeholder="Search by supplier or reference..."
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

        {/* Receipt Form Modal */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingReceipt ? "Edit Receipt" : "New Receipt"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier *</Label>
                    <Input
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label>Supplier Email</Label>
                    <Input
                      type="email"
                      value={formData.supplierEmail}
                      onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Supplier Phone</Label>
                    <Input
                      value={formData.supplierPhone}
                      onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Receipt Date *</Label>
                    <Input
                      type="date"
                      value={formData.receiptDate}
                      onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Expected Date</Label>
                    <Input
                      type="date"
                      value={formData.expectedDate}
                      onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    <div>
                      <Label>Expected Qty</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={itemForm.expectedQuantity}
                        onChange={(e) => setItemForm({ ...itemForm, expectedQuantity: e.target.value })}
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
                                {item.quantity} {product?.uom || ""} at {location?.name || item.locationId}
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
                  <Button type="submit">{editingReceipt ? "Update" : "Create"} Receipt</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Receipts List */}
        {!showForm && (
          loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : receipts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No receipts found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <Card key={receipt._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {receipt.receiptNumber}
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(receipt.status)}`}>
                            {receipt.status.toUpperCase()}
                          </span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supplier: {receipt.supplier} | Warehouse: {receipt.warehouseId?.name || receipt.warehouseId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(receipt.receiptDate).toLocaleDateString()}
                          {receipt.referenceNumber && ` | Ref: ${receipt.referenceNumber}`}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {receipt.status !== 'done' && receipt.status !== 'canceled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(receipt)}
                            >
                              <Edit className="size-4 mr-2" />
                              Edit
                            </Button>
                            {receipt.status === 'ready' && (
                              <Button
                                size="sm"
                                onClick={() => handleValidate(receipt._id)}
                              >
                                <CheckCircle className="size-4 mr-2" />
                                Validate
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancel(receipt._id)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Cancel
                            </Button>
                          </>
                        )}

                        {/* Status change select for managers/admins - separate action */}
                        {(isManager() || isAdmin()) && receipt.status !== 'done' && (
                          <div className="w-40">
                            <Select value={receipt.status} onValueChange={(val) => handleChangeStatus(receipt._id, val)}>
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
                      {receipt.items.map((item, index) => {
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

