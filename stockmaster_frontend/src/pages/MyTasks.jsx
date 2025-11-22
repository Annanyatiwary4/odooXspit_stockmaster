import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Package, CheckCircle } from "lucide-react";

export function MyTasks() {
  const [tasks, setTasks] = useState({ pickingTasks: [], packingTasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getMyTasks();
      setTasks({
        pickingTasks: data.pickingTasks || [],
        packingTasks: data.packingTasks || [],
      });
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePicking = async (deliveryId) => {
    try {
      const delivery = tasks.pickingTasks.find((t) => t._id === deliveryId);
      const pickedItems = delivery.items.map((item) => ({
        productId: item.productId._id,
        pickedQty: item.qty,
      }));
      await api.completePicking(deliveryId, pickedItems);
      loadTasks();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCompletePacking = async (deliveryId) => {
    try {
      const delivery = tasks.packingTasks.find((t) => t._id === deliveryId);
      const packedItems = delivery.items.map((item) => ({
        productId: item.productId._id,
        packedQty: item.pickedQty || item.qty,
      }));
      await api.completePacking(deliveryId, packedItems);
      loadTasks();
    } catch (error) {
      alert(error.message);
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
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <p className="text-gray-600">Your assigned picking and packing tasks</p>
      </div>

      {/* Picking Tasks */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-yellow-600" />
          Picking Tasks ({tasks.pickingTasks.length})
        </h3>
        {tasks.pickingTasks.length > 0 ? (
          <div className="grid gap-4">
            {tasks.pickingTasks.map((delivery) => (
              <Card key={delivery._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {delivery.deliveryNumber || delivery._id}
                      </CardTitle>
                      <p className="text-sm text-gray-500">Customer: {delivery.customer}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Picking
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {delivery.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{item.productId?.name || "Unknown"}</span>
                        <span className="text-gray-600">Qty: {item.qty}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleCompletePicking(delivery._id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Picking
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              No picking tasks assigned
            </CardContent>
          </Card>
        )}
      </div>

      {/* Packing Tasks */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-orange-600" />
          Packing Tasks ({tasks.packingTasks.length})
        </h3>
        {tasks.packingTasks.length > 0 ? (
          <div className="grid gap-4">
            {tasks.packingTasks.map((delivery) => (
              <Card key={delivery._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {delivery.deliveryNumber || delivery._id}
                      </CardTitle>
                      <p className="text-sm text-gray-500">Customer: {delivery.customer}</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      Packing
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {delivery.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{item.productId?.name || "Unknown"}</span>
                        <span className="text-gray-600">Qty: {item.pickedQty || item.qty}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleCompletePacking(delivery._id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Packing
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              No packing tasks assigned
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
