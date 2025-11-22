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
import { Plus, Search, Edit, Trash2, Package, X } from "lucide-react";
import { productsAPI } from "@/lib/api";

export function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    uom: "",
    description: "",
    reorderLevel: 5,
    reorderQuantity: 10,
    maxStock: "",
  });
  const [generatedSKU, setGeneratedSKU] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    loadProducts();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await productsAPI.getAll(params);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, formData);
      } else {
        await productsAPI.create(formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
      loadCategories(); // Reload categories in case a new one was added
    } catch (error) {
      alert(error.message || "Error saving product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      uom: product.uom,
      description: product.description || "",
      reorderLevel: product.reorderLevel,
      reorderQuantity: product.reorderQuantity,
      maxStock: product.maxStock || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsAPI.delete(id);
      loadProducts();
    } catch (error) {
      alert(error.message || "Error deleting product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      uom: "",
      description: "",
      reorderLevel: 5,
      reorderQuantity: 10,
      maxStock: "",
    });
    setGeneratedSKU("");
    setShowNewCategoryInput(false);
    setNewCategoryName("");
  };

  // Generate SKU preview when category changes (for new products)
  useEffect(() => {
    if (!editingProduct && formData.category) {
      // Generate a preview SKU (actual will be generated on backend)
      const categoryPrefix = formData.category
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase()
        .padEnd(3, 'X');
      setGeneratedSKU(`${categoryPrefix}-XXXX (auto-generated)`);
    } else {
      setGeneratedSKU("");
    }
  }, [formData.category, editingProduct]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, update, and manage products
            </p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingProduct(null); resetForm(); }}>
            <Plus className="size-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{editingProduct ? "Edit Product" : "Create Product"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">
                        SKU {editingProduct ? "" : "(Auto-generated)"}
                      </Label>
                      {editingProduct ? (
                        <Input
                          id="sku"
                          value={formData.sku}
                          disabled
                          className="bg-muted"
                        />
                      ) : (
                        <div>
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                            placeholder={generatedSKU || "Leave empty for auto-generation"}
                            className="mb-1"
                          />
                          {generatedSKU && !formData.sku && (
                            <p className="text-xs text-muted-foreground">
                              {generatedSKU}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      {showNewCategoryInput ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              id="newCategory"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Enter new category name"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newCategoryName.trim()) {
                                  e.preventDefault();
                                  setFormData({ ...formData, category: newCategoryName.trim() });
                                  setShowNewCategoryInput(false);
                                  setNewCategoryName("");
                                } else if (e.key === 'Escape') {
                                  setShowNewCategoryInput(false);
                                  setNewCategoryName("");
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                if (newCategoryName.trim()) {
                                  setFormData({ ...formData, category: newCategoryName.trim() });
                                  setShowNewCategoryInput(false);
                                  setNewCategoryName("");
                                }
                              }}
                            >
                              <Plus className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setShowNewCategoryInput(false);
                                setNewCategoryName("");
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Select
                            value={formData.category || "select"}
                            onValueChange={(value) => {
                              if (value === "new") {
                                setShowNewCategoryInput(true);
                              } else if (value !== "select") {
                                setFormData({ ...formData, category: value });
                              }
                            }}
                            required
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="select" disabled>Select a category</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                              <SelectItem value="new" className="text-primary font-medium">
                                <Plus className="size-4 inline mr-2" />
                                Add New Category
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="uom">Unit of Measure *</Label>
                      <Input
                        id="uom"
                        value={formData.uom}
                        onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                        placeholder="kg, pieces, boxes..."
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="reorderLevel">Reorder Level</Label>
                      <Input
                        id="reorderLevel"
                        type="number"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                      <Input
                        id="reorderQuantity"
                        type="number"
                        value={formData.reorderQuantity}
                        onChange={(e) => setFormData({ ...formData, reorderQuantity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxStock">Max Stock</Label>
                      <Input
                        id="maxStock"
                        type="number"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({ ...formData, maxStock: e.target.value ? parseInt(e.target.value) : "" })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Product</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="size-12 mx-auto mb-2 opacity-50" />
                <p>No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">SKU</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">UOM</th>
                      <th className="text-right p-2">Stock</th>
                      <th className="text-right p-2">Reorder Level</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-b hover:bg-accent/50">
                        <td className="p-2 font-mono text-sm">{product.sku}</td>
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.category}</td>
                        <td className="p-2">{product.uom}</td>
                        <td className="p-2 text-right">
                          <span className={product.totalStock < product.reorderLevel ? "text-orange-600 font-semibold" : ""}>
                            {product.totalStock}
                          </span>
                        </td>
                        <td className="p-2 text-right">{product.reorderLevel}</td>
                        <td className="p-2">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(product._id)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

