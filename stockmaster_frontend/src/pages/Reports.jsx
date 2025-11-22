import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, Warehouse } from "lucide-react";

export function Reports() {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.getWarehouseStock();
      setWarehouseStock(data.warehouseStock || []);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600">View inventory insights and statistics</p>
      </div>

      {/* Warehouse Stock Report */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-blue-600" />
              <CardTitle>Warehouse-Level Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {warehouseStock.map((warehouse) => (
                <div key={warehouse.location} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{warehouse.location}</h3>
                    <span className="text-sm text-gray-600">
                      Total: {warehouse.totalItems} items
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {warehouse.products?.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                          </div>
                        </div>
                        <span className={`font-medium ${
                          product.qty <= (product.reorderLevel || 0)
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {product.qty} {product.uom}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Trend Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle>Stock Movement Trends</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Stock movement visualization coming soon</p>
              <p className="text-sm mt-2">Track incoming, outgoing, and net changes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
