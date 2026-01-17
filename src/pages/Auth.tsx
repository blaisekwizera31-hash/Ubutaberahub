import React, { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

type AuthMode = "login" | "signup";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const roles = [
    { id: "citizen", label: "Citizen", description: "Submit cases, find lawyers" },
    { id: "lawyer", label: "Lawyer", description: "Manage clients & cases" },
    { id: "clerk", label: "Court Clerk", description: "Process court documents" },
    { id: "judge", label: "Judge", description: "Review & decide cases" },
  ];

  // Dashboard routes
  const dashboardRoutes: Record<string, string> = {
    citizen: "/dashboard",
    lawyer: "/lawyer-dashboard",
    judge: "/judge-dashboard",
    clerk: "/clerk-dashboard",
  };

  // Simulate signup
  const handleSignup = () => {
    if (!email || !password || !name) {
      alert("Fill all fields");
      return;
    }
    const user = { email, password, name, role: selectedRole };
    localStorage.setItem("user", JSON.stringify(user));
    navigate(dashboardRoutes[selectedRole]);
  };

 const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();

  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    alert("No account found. Please sign up.");
    return;
  }

  const user = JSON.parse(savedUser);

  if (user.email !== email || user.password !== password) {
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));

  const roleRoutes: Record<string, string> = {
    citizen: "/dashboard",
    lawyer: "/lawyer-dashboard",
    judge: "/judge-dashboard",
    clerk: "/clerk-dashboard",
  };

  navigate(roleRoutes[user.role]);
};

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold">
                UBUTABERA<span className="text-accent">hub</span>
              </span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">
              Welcome to Rwanda's Digital Justice Platform
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Access legal guidance, connect with professionals, and navigate the justice system with confidence.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex gap-2 p-1 bg-muted rounded-xl mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <form className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-3">
                <Label>Select Your Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedRole === role.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="font-medium text-sm">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Signup / Login Button */}
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={mode === "signup" ? handleSignup : handleLogin}
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-accent hover:underline font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
