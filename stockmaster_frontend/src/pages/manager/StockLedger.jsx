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
import { Search, Download, ArrowUp, ArrowDown, ArrowRight, FileText, Package, Receipt, Truck, Move } from "lucide-react";
import { ledgerAPI, productsAPI, warehousesAPI } from "@/lib/api";

export function StockLedger() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    movementType: "all",
    productId: "all",
    warehouseId: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadMovements();
    loadProducts();
    loadWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.movementType !== "all") params.movementType = filters.movementType;
      if (filters.productId !== "all") params.productId = filters.productId;
      if (filters.warehouseId !== "all") params.warehouseId = filters.warehouseId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await ledgerAPI.getAll(params);
      setMovements(response.data || []);
    } catch (error) {
      console.error("Error loading movements:", error);
      alert(error.message || "Error loading stock ledger");
    } finally {
      setLoading(false);
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

  const loadWarehouses = async () => {
    try {
      const response = await warehousesAPI.getAll();
      setWarehouses(response.data || []);
    } catch (error) {
      console.error("Error loading warehouses:", error);
    }
  };

  const getMovementIcon = (type) => {
    const icons = {
      receipt: Receipt,
      delivery: Truck,
      transfer: Move,
      adjustment: FileText,
    };
    return icons[type] || FileText;
  };

  const getMovementColor = (type) => {
    const colors = {
      receipt: "text-green-600 bg-green-50 dark:bg-green-950/20",
      delivery: "text-red-600 bg-red-50 dark:bg-red-950/20",
      transfer: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
      adjustment: "text-orange-600 bg-orange-50 dark:bg-orange-950/20",
    };
    return colors[type] || "text-gray-600 bg-gray-50";
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Document", "Product", "Warehouse", "Location", "Quantity", "Before", "After", "Reference", "Performed By"];
    const rows = movements.map(m => [
      new Date(m.movementDate).toLocaleString(),
      m.movementType.toUpperCase(),
      m.documentNumber,
      m.productId?.name || m.productId,
      m.warehouseId?.name || m.warehouseId,
      m.locationId,
      m.quantity > 0 ? `+${m.quantity}` : m.quantity,
      m.quantityBefore,
      m.quantityAfter,
      m.reference || "",
      m.performedBy?.name || m.performedBy
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Ledger</h1>
            <p className="text-muted-foreground mt-1">
              Complete history of all stock movements
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="size-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Movement Type</Label>
                <Select value={filters.movementType} onValueChange={(val) => setFilters({ ...filters, movementType: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="receipt">Receipt</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Product</Label>
                <Select value={filters.productId} onValueChange={(val) => setFilters({ ...filters, productId: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Warehouse</Label>
                <Select value={filters.warehouseId} onValueChange={(val) => setFilters({ ...filters, warehouseId: val })}>
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
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Movements List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : movements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="size-12 mx-auto mb-2 opacity-50" />
                <p>No movements found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {movements.map((movement) => {
              const Icon = getMovementIcon(movement.movementType);
              const isIncrease = movement.quantity > 0;
              const isTransfer = movement.movementType === 'transfer';
              
              return (
                <Card key={movement._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-md ${getMovementColor(movement.movementType)}`}>
                          <Icon className="size-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{movement.documentNumber}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getMovementColor(movement.movementType)}`}>
                              {movement.movementType.toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Product:</span> {movement.productId?.name || movement.productId} ({movement.productId?.sku || ""})
                            </p>
                            <p>
                              <span className="font-medium">Warehouse:</span> {movement.warehouseId?.name || movement.warehouseId}
                              {isTransfer && movement.destinationWarehouseId && (
                                <>
                                  {" → "}
                                  {movement.destinationWarehouseId?.name || movement.destinationWarehouseId}
                                </>
                              )}
                            </p>
                            <p>
                              <span className="font-medium">Location:</span> {movement.locationId}
                              {isTransfer && movement.destinationLocationId && (
                                <>
                                  {" → "}
                                  {movement.destinationLocationId}
                                </>
                              )}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Before:</span>
                                <span>{movement.quantityBefore} {movement.productId?.uom || ""}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isIncrease ? (
                                  <ArrowUp className="size-4 text-green-600" />
                                ) : (
                                  <ArrowDown className="size-4 text-red-600" />
                                )}
                                <span className={`font-medium ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                  {isIncrease ? '+' : ''}{movement.quantity} {movement.productId?.uom || ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">After:</span>
                                <span>{movement.quantityAfter} {movement.productId?.uom || ""}</span>
                              </div>
                            </div>
                            {movement.reference && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Reference:</span> {movement.reference}
                              </p>
                            )}
                            <p className="text-muted-foreground text-xs">
                              {new Date(movement.movementDate).toLocaleString()} • By {movement.performedBy?.name || movement.performedBy}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

