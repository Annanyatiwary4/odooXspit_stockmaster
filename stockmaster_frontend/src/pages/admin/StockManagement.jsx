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
import { Package, Warehouse, Search, Edit } from "lucide-react";
import { productsAPI, warehousesAPI } from "@/lib/api";

export function StockManagement() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStockForm, setShowStockForm] = useState(false);
  const [stockForm, setStockForm] = useState({
    locationId: "",
    quantity: 0,
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouse, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      
      const response = await productsAPI.getAll(params);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
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

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.updateStock(selectedProduct._id, stockForm.locationId, parseInt(stockForm.quantity));
      setShowStockForm(false);
      setSelectedProduct(null);
      resetStockForm();
      loadProducts();
      alert("Stock updated successfully!");
    } catch (error) {
      alert(error.message || "Error updating stock");
    }
  };

  const handleEditStock = (product) => {
    setSelectedProduct(product);
    setShowStockForm(true);
    resetStockForm();
  };

  const resetStockForm = () => {
    setStockForm({
      locationId: "",
      quantity: 0,
    });
  };

  const getSelectedWarehouse = () => {
    return warehouses.find(w => w._id === selectedWarehouse);
  };

  const getProductStockByLocation = (product) => {
    if (!product.stockByLocation || !selectedWarehouse) return {};
    
    const warehouse = getSelectedWarehouse();
    if (!warehouse || !warehouse.locations) return {};

    const stockMap = {};
    // stockByLocation comes as a plain object from API (MongoDB Map is serialized as object)
    const stockByLoc = product.stockByLocation || {};
    
    warehouse.locations.forEach(location => {
      // Access as plain object property
      const locationId = location._id.toString();
      const stock = stockByLoc[locationId] || 0;
      if (stock > 0) {
        stockMap[location._id] = {
          location,
          stock
        };
      }
    });
    return stockMap;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage stock levels by location
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedWarehouse || "select"} onValueChange={(value) => setSelectedWarehouse(value === "select" ? "" : value)}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select" disabled>Select a warehouse</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh._id} value={wh._id}>
                      {wh.name} ({wh.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stock Update Form Modal */}
        {showStockForm && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Update Stock - {selectedProduct.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateStock} className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      value={stockForm.locationId || "select"}
                      onValueChange={(value) => setStockForm({ ...stockForm, locationId: value === "select" ? "" : value })}
                      required
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select" disabled>Select a location</SelectItem>
                        {getSelectedWarehouse()?.locations?.map((loc) => (
                          <SelectItem key={loc._id} value={loc._id.toString()}>
                            {loc.name} ({loc.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={stockForm.quantity}
                      onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowStockForm(false);
                        setSelectedProduct(null);
                        resetStockForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update Stock</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products with Stock */}
        {!selectedWarehouse ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Warehouse className="size-12 mx-auto mb-2 opacity-50" />
                <p>Please select a warehouse to view stock</p>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Package className="size-12 mx-auto mb-2 opacity-50" />
                <p>No products found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const locationStock = getProductStockByLocation(product);
              const hasStock = Object.keys(locationStock).length > 0;
              
              return (
                <Card key={product._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="size-5" />
                          {product.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          SKU: {product.sku} | Total Stock: {product.totalStock} {product.uom}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStock(product)}
                      >
                        <Edit className="size-4 mr-2" />
                        Update Stock
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {hasStock ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium mb-2">Stock by Location:</p>
                        {Object.values(locationStock).map(({ location, stock }) => (
                          <div
                            key={location._id}
                            className="flex items-center justify-between p-2 bg-accent rounded-md"
                          >
                            <div>
                              <p className="text-sm font-medium">{location.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {location.code} ({location.type})
                              </p>
                            </div>
                            <p className="text-sm font-semibold">
                              {stock} {product.uom}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No stock in this warehouse
                      </p>
                    )}
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

