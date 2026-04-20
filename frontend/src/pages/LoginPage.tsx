import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login({ username, password });
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background bg-pitch-pattern">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pitch-light/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-gold to-gold-dark shadow-lg glow-gold mb-4">
            <Trophy className="h-8 w-8 text-pitch-dark" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-1">
            Mundial 2026
          </h1>
          <p className="text-lg font-medium text-foreground/80">Over 9000</p>
          <p className="text-sm text-muted-foreground mt-1">
            The ultimate World Cup betting pool
          </p>
        </div>

        <Card className="glass border-border/30">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to manage your predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                className="w-full"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trophy className="h-4 w-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Got an invite link?{" "}
              <Link
                to="/register"
                className="text-gold hover:text-gold-light font-medium transition-colors"
              >
                Create your account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Fun footer text */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          48 teams &middot; 12 groups &middot; 424 max points &middot; 1 champion
        </p>
      </div>
    </div>
  );
}
