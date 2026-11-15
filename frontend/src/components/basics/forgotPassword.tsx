import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { FormField } from "../auth/FormField";
import authService from "../../services/user/authService";

export default function ForgotPasswordEmailPage() {
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (errorMessage || successMessage) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await authService.forgotPassword(email);

      setSuccessMessage(
        "Password reset instructions sent! Please check your email."
      );
      setTimeout(() => {
        sessionStorage.setItem("resetEmail", email);
        navigate("/forgot-password-otp");
      }, 2000);
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setErrorMessage("Failed to send reset instructions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <AuthHeader
          icon={<KeyRound className="size-6" />}
          title="Forgot password?"
          description="Enter your email address and we'll send you a verification code."
        />

        {successMessage && (
          <Alert variant="success">
            <CheckCircle2 />
            <div>
              <AlertTitle>Check your inbox</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </div>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <div>
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField id="email" label="Email address" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={handleEmailChange}
              autoFocus
              required
              aria-invalid={Boolean(errorMessage)}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isSubmitting}
          >
            Send reset code
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Remembered your password?{" "}
          <Link
            to="/signin"
            className="text-primary font-medium hover:underline"
          >
            Back to login
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
