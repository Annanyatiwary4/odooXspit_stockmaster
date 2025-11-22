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
import { Plus, Edit, UserX, Users as UsersIcon, Search } from "lucide-react";
import { adminAPI, warehousesAPI } from "@/lib/api";

export function Users() {
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "warehouse",
    assignedWarehouse: "",
  });

  useEffect(() => {
    loadUsers();
    loadWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      
      const response = await adminAPI.getUsers(params);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error loading users:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (!data.password && editingUser) {
        delete data.password;
      }
      if (!data.assignedWarehouse) {
        delete data.assignedWarehouse;
      }

      if (editingUser) {
        await adminAPI.updateUser(editingUser._id, data);
      } else {
        if (!data.password) {
          alert("Password is required for new users");
          return;
        }
        await adminAPI.createUser(data);
      }
      setShowForm(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      alert(error.message || "Error saving user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      assignedWarehouse: user.assignedWarehouse?._id || "",
    });
    setShowForm(true);
  };

  const handleDeactivate = async (id) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await adminAPI.deactivateUser(id);
      loadUsers();
    } catch (error) {
      alert(error.message || "Error deactivating user");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "warehouse",
      assignedWarehouse: "",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, update, and manage users
            </p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingUser(null); resetForm(); }}>
            <Plus className="size-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{editingUser ? "Edit User" : "Create User"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={!!editingUser}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password">
                      Password {editingUser ? "(leave blank to keep current)" : "*"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger id="role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="warehouse">Warehouse Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.role === "warehouse" && (
                      <div>
                        <Label htmlFor="assignedWarehouse">Assigned Warehouse</Label>
                        <Select
                          value={formData.assignedWarehouse || "none"}
                          onValueChange={(value) => setFormData({ ...formData, assignedWarehouse: value === "none" ? "" : value })}
                        >
                          <SelectTrigger id="assignedWarehouse">
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {warehouses.map((wh) => (
                              <SelectItem key={wh._id} value={wh._id}>
                                {wh.name} ({wh.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingUser(null); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button type="submit">Save User</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UsersIcon className="size-12 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Warehouse</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-accent/50">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">
                          <span className="capitalize px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-2">
                          {user.assignedWarehouse ? (
                            <span className="text-sm">{user.assignedWarehouse.name}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-2">
                          <span className={`capitalize text-xs ${
                            user.status === 'active' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            {user.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDeactivate(user._id)}
                              >
                                <UserX className="size-4 text-destructive" />
                              </Button>
                            )}
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

