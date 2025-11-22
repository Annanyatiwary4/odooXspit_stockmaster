import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ShieldX className="size-12 mx-auto text-destructive mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link to="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

