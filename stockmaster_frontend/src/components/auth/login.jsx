import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { Package, AlertCircle, Loader2 } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.login(formData);
      authUtils.login(response.token, response.user);
      
      // Redirect based on role
      const user = response.user;
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else if (user.role === 'manager') {
        navigate('/dashboard');
      } else if (user.role === 'staff') {
        navigate('/my-tasks');
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to StockMaster</CardTitle>
          <CardDescription>
            Sign in to manage your inventory
          </CardDescription>

          <CardAction>
            <Link to="/signup">
              <Button variant="link" className="px-0">
                Create Account
              </Button>
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@stockmaster.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto text-sm text-blue-600 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-gray-500 text-center">
            <p className="mb-2">Demo Credentials:</p>
            <p className="text-xs">Admin: admin@stockmaster.com / admin123</p>
            <p className="text-xs">Manager: manager@stockmaster.com / manager123</p>
            <p className="text-xs">Staff: staff@stockmaster.com / staff123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
