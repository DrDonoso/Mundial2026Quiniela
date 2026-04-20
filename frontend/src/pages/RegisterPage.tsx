import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, PartyPopper } from "lucide-react";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token") || "";
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!inviteToken) {
      setError("Invite token is required. Check your invite link.");
      return;
    }

    try {
      await register({
        username,
        password,
        display_name: displayName || username,
        invite_token: inviteToken,
      });
      navigate("/dashboard");
    } catch {
      setError("Registration failed. The invite may be expired or already used.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background bg-pitch-pattern">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-pitch-light/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-pitch-light to-pitch shadow-lg glow-green mb-4">
            <PartyPopper className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-1">
            Join the Pool
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ve been invited to the ultimate World Cup betting pool
          </p>
        </div>

        <Card className="glass border-border/30">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create Your Account</CardTitle>
            <CardDescription>
              Pick a username and get ready to make your predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {!inviteToken && (
                <div className="rounded-lg bg-gold/10 border border-gold/30 px-4 py-3 text-sm text-gold-light">
                  No invite token found. You need an invite link from an admin.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                  minLength={3}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  This is how you&apos;ll log in. 3-50 characters.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  Shown on the leaderboard. Defaults to username if blank.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="pr-10"
                    minLength={8}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                className="w-full"
                disabled={isLoading || !username || !password || !inviteToken}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <PartyPopper className="h-4 w-4 mr-2" />
                )}
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-gold hover:text-gold-light font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
