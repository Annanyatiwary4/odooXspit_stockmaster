import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ShoppingCart, CheckCircle } from "lucide-react";

export function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    supplier: "",
    location: "",
    items: [{ productId: "", qty: 0 }],
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [receiptsData, productsData, warehousesData] = await Promise.all([
        api.getReceipts(),
        api.getProducts(),
        api.getWarehouses(),
      ]);
      setReceipts(receiptsData.receipts || []);
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
      await api.createReceipt(formData);
      setShowModal(false);
      setFormData({ supplier: "", location: "", items: [{ productId: "", qty: 0 }], notes: "" });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleValidate = async (id) => {
    if (!confirm("Validate this receipt? Stock will be updated.")) return;
    try {
      await api.validateReceipt(id);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", qty: 0 }],
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...formData.items];
    items[index][field] = value;
    setFormData({ ...formData, items });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Receipts</h2>
          <p className="text-gray-600">Manage incoming stock</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Receipt
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {receipts.map((receipt) => (
            <Card key={receipt._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {receipt.receiptNumber || receipt._id}
                      </CardTitle>
                      <p className="text-sm text-gray-500">Supplier: {receipt.supplier}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    receipt.status === 'Validated' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {receipt.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{receipt.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{receipt.items?.length || 0}</span>
                  </div>
                  {receipt.status === 'Draft' && (
                    <Button className="w-full mt-4" onClick={() => handleValidate(receipt._id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Validate Receipt
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>Create New Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="supplier">Supplier Name</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Warehouse Location</Label>
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base"
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w.code}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Items</Label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, "productId", e.target.value)}
                        className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-base"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-24"
                        value={item.qty}
                        onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
                        required
                      />
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addItem}>
                    + Add Item
                  </Button>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base"
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
                    Create Receipt
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
