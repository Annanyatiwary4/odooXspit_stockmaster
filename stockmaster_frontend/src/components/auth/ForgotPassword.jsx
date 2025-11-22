import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ThemeToggle"
import { authAPI } from "@/lib/api"

export function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await authAPI.requestPasswordReset(email);
      setMessage("OTP has been sent to your email");
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.verifyOTP(email, otp);
      setMessage("OTP verified successfully");
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(email, otp, newPassword);
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Reset Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "New Password"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Enter your new password"}
          </CardDescription>

          <CardAction>
            <Link to="/login">
              <Button variant="link" className="px-0">
                Back to Login
              </Button>
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="flex flex-col gap-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm p-3 rounded-md">
                  {message}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

         {step === 2 && (
  <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
    {error && (
      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
        {error}
      </div>
    )}
    {message && (
      <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm p-3 rounded-md">
        {message}
      </div>
    )}

    <div className="grid gap-2">
      <Label htmlFor="otp">OTP Code</Label>
      <Input
        id="otp"
        type="text"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
        disabled={loading}
        maxLength={6}
      />
    </div>

    {/* Stacked verify button */}
    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? "Verifying..." : "Verify OTP"}
    </Button>

    {/* Back button below */}
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => setStep(1)}
      disabled={loading}
    >
      Back
    </Button>
  </form>
)}



          {step === 3 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm p-3 rounded-md">
                  {message}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

