import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { resendSignupVerification, verifySignupCode } from "@/lib/auth";
import { validateEmail } from "@/lib/validation";

const dashboardRoutes: Record<string, string> = {
  citizen: "/dashboard",
  lawyer: "/lawyer-dashboard",
  judge: "/judge-dashboard",
  clerk: "/clerk-dashboard",
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResend = async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({ title: "Invalid email", description: emailValidation.error, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await resendSignupVerification(email);
    setIsLoading(false);

    if (error) {
      toast({ title: "Could not resend verification", description: error, variant: "destructive" });
      return;
    }

    toast({ title: "Verification email sent", description: `Check ${email} for the new link.` });
  };

  const handleVerifyCode = async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({ title: "Invalid email", description: emailValidation.error, variant: "destructive" });
      return;
    }

    if (code.trim().length < 6) {
      toast({ title: "Verification code needed", description: "Enter the code from your email.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { user, error } = await verifySignupCode(email, code.trim());
    setIsLoading(false);

    if (error || !user) {
      toast({ title: "Verification failed", description: error || "Please try again.", variant: "destructive" });
      return;
    }

    toast({ title: "Email verified", description: "Welcome. Redirecting you to your dashboard." });
    navigate(dashboardRoutes[user.role] || "/dashboard", { replace: true });
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/auth" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Mail className="h-6 w-6 text-accent" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent a verification link to the email used during signup. Open that link, or enter the code from the email if one was included.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-email">Email used</Label>
                <Input
                  id="verification-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification code</Label>
                <Input
                  id="verification-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\s/g, ""))}
                  placeholder="Enter code from email"
                  className="text-center text-xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  If your email only has a button/link, click that link instead of entering a code.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button type="button" variant="hero" size="lg" className="w-full" onClick={handleVerifyCode} disabled={isLoading}>
                Verify code
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleResend} disabled={isLoading}>
                Resend verification email
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyEmail;
