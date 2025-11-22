import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Settings } from "lucide-react";

export function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    location: "",
    systemQty: 0,
    countedQty: 0,
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [adjustmentsData, productsData, warehousesData] = await Promise.all([
        api.getAdjustments(),
        api.getProducts(),
        api.getWarehouses(),
      ]);
      setAdjustments(adjustmentsData.adjustments || []);
      setProducts(productsData.products || []);
      setWarehouses(warehousesData.warehouses || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAdjustment(formData);
      setShowModal(false);
      setFormData({ productId: "", location: "", systemQty: 0, countedQty: 0, reason: "" });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Adjustments</h2>
          <p className="text-gray-600">Record inventory corrections</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {adjustments.map((adjustment) => (
            <Card key={adjustment._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {adjustment.productId?.name || "Unknown Product"}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Location: {adjustment.location}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    adjustment.difference > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {adjustment.difference > 0 ? '+' : ''}{adjustment.difference}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">System Qty:</span>
                    <span className="font-medium">{adjustment.systemQty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Counted Qty:</span>
                    <span className="font-medium">{adjustment.countedQty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Difference:</span>
                    <span className={`font-medium ${
                      adjustment.difference > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {adjustment.difference > 0 ? '+' : ''}{adjustment.difference}
                    </span>
                  </div>
                  {adjustment.reason && (
                    <p className="text-sm text-gray-600 pt-2 border-t">
                      Reason: {adjustment.reason}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>New Stock Adjustment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="productId">Product</Label>
                  <select
                    id="productId"
                    value={formData.productId}
                    onChange={(e) => {
                      const product = products.find(p => p._id === e.target.value);
                      const location = formData.location || Object.keys(product?.stockByLocation || {})[0] || "";
                      const systemQty = product?.stockByLocation?.[location] || 0;
                      setFormData({ 
                        ...formData, 
                        productId: e.target.value,
                        location,
                        systemQty 
                      });
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base"
                    required
                  >
                    <option value="">Select Location</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w.code}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="systemQty">System Quantity</Label>
                  <Input
                    id="systemQty"
                    type="number"
                    value={formData.systemQty}
                    onChange={(e) => setFormData({ ...formData, systemQty: Number(e.target.value) })}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="countedQty">Counted Quantity</Label>
                  <Input
                    id="countedQty"
                    type="number"
                    value={formData.countedQty}
                    onChange={(e) => setFormData({ ...formData, countedQty: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create Adjustment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
