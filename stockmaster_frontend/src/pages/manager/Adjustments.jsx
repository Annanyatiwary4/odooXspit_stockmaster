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
import { Plus, Search, Edit, Trash2, CheckCircle, X, FileText, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adjustmentsAPI, warehousesAPI, productsAPI } from "@/lib/api";

export function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isManager, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    locationId: "",
    countedQuantity: "",
    adjustmentType: "correction",
    reason: "",
    adjustmentDate: new Date().toISOString().split('T')[0],
    notes: "",
    status: "draft",
  });

  useEffect(() => {
    loadAdjustments();
    loadWarehouses();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, warehouseFilter]);

  const loadAdjustments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (warehouseFilter !== "all") params.warehouseId = warehouseFilter;
      
      const response = await adjustmentsAPI.getAll(params);
      setAdjustments(response.data || []);
    } catch (error) {
      console.error("Error loading adjustments:", error);
      alert(error.message || "Error loading adjustments");
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
    setFormData((prev) => ({ ...prev, warehouseId, locationId: "" }));
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

  const handleProductChange = (productId) => {
    setFormData((prev) => ({ ...prev, productId }));
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product);
  };

  const handleCountedQuantityChange = (countedQuantity) => {
    const counted = parseFloat(countedQuantity) || 0;
    const system = selectedProduct?.stockByLocation?.[formData.locationId] || 0;
    const difference = counted - system;
    
    setFormData((prev) => ({
      ...prev,
      countedQuantity: countedQuantity,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.warehouseId || !formData.locationId || 
        formData.countedQuantity === "" || !formData.reason) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingAdjustment) {
        await adjustmentsAPI.update(editingAdjustment._id, formData);
      } else {
        await adjustmentsAPI.create(formData);
      }
      setShowForm(false);
      setEditingAdjustment(null);
      resetForm();
      loadAdjustments();
    } catch (error) {
      alert(error.message || "Error saving adjustment");
    }
  };

  const handleEdit = (adjustment) => {
    setEditingAdjustment(adjustment);
    setFormData({
      productId: adjustment.productId._id || adjustment.productId,
      warehouseId: adjustment.warehouseId._id || adjustment.warehouseId,
      locationId: adjustment.locationId,
      countedQuantity: adjustment.countedQuantity.toString(),
      adjustmentType: adjustment.adjustmentType || "correction",
      reason: adjustment.reason || "",
      adjustmentDate: adjustment.adjustmentDate ? new Date(adjustment.adjustmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: adjustment.notes || "",
      status: adjustment.status || 'draft',
    });
    handleWarehouseChange(adjustment.warehouseId._id || adjustment.warehouseId);
    handleProductChange(adjustment.productId._id || adjustment.productId);
    setShowForm(true);
  };

  const handleValidate = async (id) => {
    if (!confirm("Are you sure you want to validate this adjustment? Stock will be updated automatically.")) return;
    try {
      await adjustmentsAPI.validate(id);
      loadAdjustments();
      alert("Adjustment validated successfully");
    } catch (error) {
      alert(error.message || "Error validating adjustment");
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    if (!confirm(`Change adjustment status to ${newStatus.toUpperCase()}?`)) return;
    try {
      await adjustmentsAPI.update(id, { status: newStatus });
      loadAdjustments();
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      alert(error.message || "Error updating status");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this adjustment?")) return;
    try {
      await adjustmentsAPI.cancel(id);
      loadAdjustments();
      alert("Adjustment canceled successfully");
    } catch (error) {
      alert(error.message || "Error canceling adjustment");
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      warehouseId: "",
      locationId: "",
      countedQuantity: "",
      adjustmentType: "correction",
      reason: "",
      adjustmentDate: new Date().toISOString().split('T')[0],
      notes: "",
      status: "draft",
    });
    setSelectedWarehouse(null);
    setSelectedProduct(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || colors.draft;
  };

  const getAdjustmentTypeColor = (type) => {
    const colors = {
      damaged: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      lost: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      found: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      correction: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };
    return colors[type] || colors.other;
  };

  const systemQuantity = selectedProduct?.stockByLocation?.[formData.locationId] || 0;
  const countedQuantity = parseFloat(formData.countedQuantity) || 0;
  const difference = countedQuantity - systemQuantity;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory Adjustments</h1>
            <p className="text-muted-foreground mt-1">
              Adjust stock levels after physical counts
            </p>
          </div>
          <Button onClick={() => { setShowForm(true); resetForm(); }}>
            <Plus className="size-4 mr-2" />
            New Adjustment
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
                    placeholder="Search by adjustment number..."
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

        {/* Adjustment Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingAdjustment ? "Edit Adjustment" : "New Adjustment"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Product *</Label>
                    <Select value={formData.productId} onValueChange={handleProductChange}>
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
                    <Label>Location *</Label>
                    <Select value={formData.locationId} onValueChange={(val) => setFormData({ ...formData, locationId: val })}>
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
                    <Label>Adjustment Type *</Label>
                    <Select value={formData.adjustmentType} onValueChange={(val) => setFormData({ ...formData, adjustmentType: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="correction">Correction</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="found">Found</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>System Quantity</Label>
                    <Input
                      value={systemQuantity}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label>Counted Quantity *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.countedQuantity}
                      onChange={(e) => handleCountedQuantityChange(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label>Difference</Label>
                    <Input
                      value={difference > 0 ? `+${difference}` : difference}
                      disabled
                      className={`bg-muted ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : ''}`}
                    />
                  </div>
                  <div>
                    <Label>Adjustment Date *</Label>
                    <Input
                      type="date"
                      value={formData.adjustmentDate}
                      onChange={(e) => setFormData({ ...formData, adjustmentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Reason *</Label>
                    <Input
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Reason for adjustment..."
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingAdjustment ? "Update" : "Create"} Adjustment</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Adjustments List */}
        {!showForm && (
          loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : adjustments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No adjustments found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {adjustments.map((adjustment) => {
                const product = adjustment.productId?.name || adjustment.productId;
                const difference = adjustment.difference || 0;
                return (
                  <Card key={adjustment._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {adjustment.adjustmentNumber}
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(adjustment.status)}`}>
                              {adjustment.status.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getAdjustmentTypeColor(adjustment.adjustmentType)}`}>
                              {adjustment.adjustmentType.toUpperCase()}
                            </span>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Product: {product} | Warehouse: {adjustment.warehouseId?.name || adjustment.warehouseId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            System: {adjustment.systemQuantity} | Counted: {adjustment.countedQuantity} | 
                            Difference: <span className={difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : ''}>
                              {difference > 0 ? `+${difference}` : difference}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(adjustment.adjustmentDate).toLocaleDateString()} | Reason: {adjustment.reason}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                          {adjustment.status !== 'done' && adjustment.status !== 'canceled' && (
                            <>
                              {(isManager() || isAdmin()) && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(adjustment)}
                                  >
                                    <Edit className="size-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleValidate(adjustment._id)}
                                  >
                                    <CheckCircle className="size-4 mr-2" />
                                    Validate
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancel(adjustment._id)}
                                  >
                                    <Trash2 className="size-4 mr-2" />
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                          {(isManager() || isAdmin()) && adjustment.status !== 'done' && (
                            <div className="w-40">
                              <Select value={adjustment.status} onValueChange={(val) => handleChangeStatus(adjustment._id, val)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="item-aligned">
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="canceled">Canceled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {adjustment.notes && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Notes: {adjustment.notes}</p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}

