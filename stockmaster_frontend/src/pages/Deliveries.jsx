import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, TruckIcon, User, CheckCircle, Clock, Package } from "lucide-react";

export function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    items: [{ productId: "", qty: 0 }],
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deliveriesData, productsData] = await Promise.all([
        api.getDeliveries(),
        api.getProducts(),
      ]);
      setDeliveries(deliveriesData.deliveries || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createDelivery(formData);
      setShowModal(false);
      setFormData({ customer: "", items: [{ productId: "", qty: 0 }], notes: "" });
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

  const getStatusColor = (status) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      Confirmed: "bg-blue-100 text-blue-800",
      Picking: "bg-yellow-100 text-yellow-800",
      Packing: "bg-orange-100 text-orange-800",
      Ready: "bg-purple-100 text-purple-800",
      Validated: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Validated":
        return <CheckCircle className="h-4 w-4" />;
      case "Draft":
      case "Confirmed":
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deliveries</h2>
          <p className="text-gray-600">Manage outgoing shipments</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Delivery
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {deliveries.map((delivery) => (
            <Card key={delivery._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TruckIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {delivery.deliveryNumber || delivery._id}
                      </CardTitle>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {delivery.customer}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                      {delivery.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Picking:</span>
                    <span className="font-medium">{delivery.pickingStatus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Packing:</span>
                    <span className="font-medium">{delivery.packingStatus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{delivery.items?.length || 0}</span>
                  </div>
                  {delivery.notes && (
                    <p className="text-sm text-gray-600 pt-2 border-t">
                      Note: {delivery.notes}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>Create New Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    required
                  />
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
                            {p.name} ({p.sku}) - Stock: {p.totalStock}
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
                    Create Delivery
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
