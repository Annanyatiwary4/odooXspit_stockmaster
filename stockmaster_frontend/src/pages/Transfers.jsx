import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ArrowLeftRight, CheckCircle } from "lucide-react";

export function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    items: [{ productId: "", qty: 0 }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transfersData, productsData, warehousesData] = await Promise.all([
        api.getTransfers(),
        api.getProducts(),
        api.getWarehouses(),
      ]);
      setTransfers(transfersData.transfers || []);
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
      await api.createTransfer(formData);
      setShowModal(false);
      setFormData({ from: "", to: "", items: [{ productId: "", qty: 0 }] });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleValidate = async (id) => {
    if (!confirm("Validate this transfer? Stock will be moved.")) return;
    try {
      await api.validateTransfer(id);
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
          <h2 className="text-2xl font-bold text-gray-900">Transfers</h2>
          <p className="text-gray-600">Manage stock transfers between warehouses</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Transfer
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {transfers.map((transfer) => (
            <Card key={transfer._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {transfer.from} → {transfer.to}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {transfer.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    transfer.status === 'Validated' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transfer.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {transfer.status === 'Pending' && (
                  <Button className="w-full" onClick={() => handleValidate(transfer._id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validate Transfer
                  </Button>
                )}
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
              <CardTitle>Create New Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from">From Warehouse</Label>
                    <select
                      id="from"
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base"
                      required
                    >
                      <option value="">Select</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w.code}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="to">To Warehouse</Label>
                    <select
                      id="to"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base"
                      required
                    >
                      <option value="">Select</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w.code}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>
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
                    Create Transfer
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
