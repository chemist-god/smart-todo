"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CheckCircle, Mail, Smartphone, User, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usePhone, setUsePhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract invite code from URL
  useEffect(() => {
    const code = searchParams.get('inviteCode');
    if (code) {
      setInviteCode(code);
    }
  }, [searchParams]);

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { score: 0, label: "", color: "" };
    if (password.length < 6) return { score: 1, label: "Too short", color: "text-destructive" };
    if (password.length < 8) return { score: 2, label: "Weak", color: "text-warning" };
    if (password.length < 10) return { score: 3, label: "Good", color: "text-primary" };
    return { score: 4, label: "Strong", color: "text-success" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: usePhone ? undefined : email,
          phone: usePhone ? phone : undefined,
          password,
          inviteCode: inviteCode || undefined, // Include invite code if present
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store identifier in sessionStorage for resend functionality
        // This is more secure than server-side lookup
        const identifierToStore = usePhone ? phone : email;
        if (identifierToStore) {
          sessionStorage.setItem('verification_identifier', identifierToStore);
          sessionStorage.setItem('verification_type', usePhone ? 'PHONE_VERIFICATION' : 'EMAIL_VERIFICATION');
        }

        // Automatically sign in the user after successful registration
        const signInResult = await signIn("credentials", {
          email: usePhone ? undefined : email,
          phone: usePhone ? phone : undefined,
          password: password,
          redirect: false,
        });

        if (signInResult?.error) {
          // If sign-in fails, still redirect but user will need to sign in manually
          console.error("Auto sign-in failed:", signInResult.error);
          setError("Account created but sign-in failed. Please sign in manually.");
          setTimeout(() => {
            router.push("/auth/signin");
          }, 2000);
          return;
        }

        // Redirect to username setup (which will then redirect to verification/welcome)
        const redirectUrl = data.redirectUrl || searchParams.get('redirect') || "/auth/setup-username";
        setSuccess(data.message || "Account created successfully! Let's set up your username...");
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1500);
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="glass shadow-strong border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Join Smart Todo and boost your productivity
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contact Method Toggle */}
            <div className="flex rounded-lg bg-muted/50 p-1 border">
              <button
                type="button"
                onClick={() => setUsePhone(false)}
                disabled={isLoading}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200",
                  !usePhone
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setUsePhone(true)}
                disabled={isLoading}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200",
                  usePhone
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Smartphone className="w-4 h-4" />
                Phone
              </button>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    disabled={isLoading}
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Email/Phone Field */}
              {!usePhone ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      disabled={isLoading}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      disabled={isLoading}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex items-center gap-2 text-xs">
                    <span>Password strength:</span>
                    <span className={passwordStrength.color}>{passwordStrength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                disabled={isLoading || !name.trim() || (!usePhone ? !email.trim() : !phone.trim()) || password.length < 6 || confirmPassword !== password}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass shadow-strong border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
