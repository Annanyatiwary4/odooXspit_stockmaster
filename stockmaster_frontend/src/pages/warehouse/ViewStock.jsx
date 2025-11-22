import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, Warehouse, MapPin, AlertTriangle } from "lucide-react";
import { productsAPI, warehousesAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function ViewStock() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [viewMode, setViewMode] = useState("product"); // "product" or "warehouse"

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter, warehouseFilter, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsRes = await productsAPI.getAll({ limit: 1000 });
      setProducts(productsRes.data || []);

      // Load warehouses
      const warehousesRes = await warehousesAPI.getAll();
      setWarehouses(warehousesRes.data || []);

      // For warehouse staff, only show assigned warehouse
      if (user?.role === 'warehouse' && user?.assignedWarehouse) {
        const assignedWarehouseId = user.assignedWarehouse?._id || user.assignedWarehouse;
        const assignedWarehouse = warehousesRes.data?.find(
          wh => wh._id?.toString() === assignedWarehouseId?.toString() || wh._id === assignedWarehouseId
        );
        if (assignedWarehouse) {
          setWarehouseFilter(assignedWarehouse._id);
          setSelectedWarehouse(assignedWarehouse);
          // Set view mode to warehouse since they can only see one warehouse
          setViewMode("warehouse");
        }
        // Filter warehouses list to only show assigned warehouse
        setWarehouses(assignedWarehouse ? [assignedWarehouse] : []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert(error.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Warehouse filter (if viewing by warehouse)
    if (viewMode === "warehouse" && warehouseFilter !== "all" && selectedWarehouse) {
      filtered = filtered.filter((p) => {
        // Check if product has stock in the selected warehouse
        if (typeof p.stockByLocation === 'object' && p.stockByLocation !== null) {
          const locations = selectedWarehouse.locations || [];
          return locations.some(loc => {
            const locationId = loc._id?.toString() || loc._id;
            return p.stockByLocation[locationId] > 0;
          });
        }
        return false;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleWarehouseFilterChange = async (warehouseId) => {
    setWarehouseFilter(warehouseId);
    if (warehouseId !== "all") {
      try {
        const warehouse = await warehousesAPI.getById(warehouseId);
        setSelectedWarehouse(warehouse.data);
      } catch (error) {
        console.error("Error loading warehouse:", error);
        setSelectedWarehouse(null);
      }
    } else {
      setSelectedWarehouse(null);
    }
  };

  const getProductStockInWarehouse = (product, warehouse) => {
    if (!warehouse || !warehouse.locations) return 0;
    
    let totalStock = 0;
    warehouse.locations.forEach((loc) => {
      const locationId = loc._id?.toString() || loc._id;
      if (product.stockByLocation && product.stockByLocation[locationId]) {
        totalStock += product.stockByLocation[locationId];
      }
    });
    return totalStock;
  };

  const getProductStockByLocation = (product, warehouse) => {
    if (!warehouse || !warehouse.locations) return [];
    
    return warehouse.locations
      .map((loc) => {
        const locationId = loc._id?.toString() || loc._id;
        const stock = product.stockByLocation?.[locationId] || 0;
        return { location: loc, stock };
      })
      .filter((item) => item.stock > 0);
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">View Stock</h1>
          <p className="text-muted-foreground mt-1">
            Check stock by product and warehouse
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>View Mode</Label>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">By Product</SelectItem>
                    <SelectItem value="warehouse">By Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {viewMode === "warehouse" && (
                <div>
                  <Label>Warehouse</Label>
                  {user?.role === 'warehouse' && user?.assignedWarehouse ? (
                    <Input 
                      value={user.assignedWarehouse?.name || selectedWarehouse?.name || 'Assigned Warehouse'} 
                      disabled 
                      className="bg-muted"
                    />
                  ) : (
                    <Select value={warehouseFilter} onValueChange={handleWarehouseFilterChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Warehouses</SelectItem>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh._id} value={wh._id}>
                            {wh.name} ({wh.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Package className="size-12 mx-auto mb-2 opacity-50" />
                <p>No products found</p>
              </div>
            </CardContent>
          </Card>
        ) : user?.role === 'warehouse' && !selectedWarehouse ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Warehouse className="size-12 mx-auto mb-2 opacity-50" />
                <p>No warehouse assigned. Please contact admin.</p>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "product" && !(user?.role === 'warehouse') ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const isLowStock = product.totalStock <= product.reorderLevel && product.status === 'active';
              return (
                <Card key={product._id} className={isLowStock ? "border-orange-500" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          SKU: {product.sku}
                        </p>
                        {product.category && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Category: {product.category}
                          </p>
                        )}
                      </div>
                      {isLowStock && (
                        <AlertTriangle className="size-5 text-orange-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Stock</p>
                        <p className="text-2xl font-bold">
                          {product.totalStock} {product.uom}
                        </p>
                        {isLowStock && (
                          <p className="text-xs text-orange-600 mt-1">
                            Reorder Level: {product.reorderLevel} {product.uom}
                          </p>
                        )}
                      </div>
                      {selectedWarehouse && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-2">
                            Stock in {selectedWarehouse.name}:
                          </p>
                          <p className="text-lg font-semibold">
                            {getProductStockInWarehouse(product, selectedWarehouse)} {product.uom}
                          </p>
                          {getProductStockByLocation(product, selectedWarehouse).length > 0 && (
                            <div className="mt-2 space-y-1">
                              {getProductStockByLocation(product, selectedWarehouse).map((item, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="size-3" />
                                  {item.location.name}: {item.stock} {product.uom}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {warehouseFilter === "all" ? (
              warehouses.map((warehouse) => {
                const warehouseProducts = filteredProducts.filter((p) =>
                  getProductStockInWarehouse(p, warehouse) > 0
                );
                if (warehouseProducts.length === 0) return null;

                return (
                  <Card key={warehouse._id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Warehouse className="size-5 text-blue-600" />
                        <CardTitle>{warehouse.name} ({warehouse.code})</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {warehouseProducts.map((product) => {
                          const stock = getProductStockInWarehouse(product, warehouse);
                          const stockByLocation = getProductStockByLocation(product, warehouse);
                          return (
                            <Card key={product._id} className="border-l-4 border-l-blue-500">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">{product.name}</CardTitle>
                                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Total Stock</p>
                                    <p className="text-xl font-bold">
                                      {stock} {product.uom}
                                    </p>
                                  </div>
                                  {stockByLocation.length > 0 && (
                                    <div className="pt-2 border-t">
                                      <p className="text-xs font-medium mb-1">By Location:</p>
                                      <div className="space-y-1">
                                        {stockByLocation.map((item, idx) => (
                                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="size-3" />
                                            {item.location.name}: {item.stock} {product.uom}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : selectedWarehouse ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Warehouse className="size-5 text-blue-600" />
                    <CardTitle>{selectedWarehouse.name} ({selectedWarehouse.code})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => {
                      const stock = getProductStockInWarehouse(product, selectedWarehouse);
                      if (stock === 0) return null;
                      const stockByLocation = getProductStockByLocation(product, selectedWarehouse);
                      return (
                        <Card key={product._id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{product.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Total Stock</p>
                                <p className="text-xl font-bold">
                                  {stock} {product.uom}
                                </p>
                              </div>
                              {stockByLocation.length > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-xs font-medium mb-1">By Location:</p>
                                  <div className="space-y-1">
                                    {stockByLocation.map((item, idx) => (
                                      <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="size-3" />
                                        {item.location.name}: {item.stock} {product.uom}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Warehouse className="size-12 mx-auto mb-2 opacity-50" />
                    <p>Please select a warehouse to view stock</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

