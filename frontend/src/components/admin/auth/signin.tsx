import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { AuthLayout } from "../../auth/AuthLayout";
import { AuthHeader } from "../../auth/AuthHeader";
import { FormField } from "../../auth/FormField";
import { PasswordInput } from "../../auth/PasswordInput";
import AdminAuthService from "../../../services/admin/adminAuthService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    validateForm();
  }, [email, password]);

  const validateForm = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address ending with .com");
      valid = false;
    }

    if (!password.trim()) {
      valid = false;
    }

    setIsFormValid(valid);
  };

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[c][o][m]$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    validateForm();
    if (!isFormValid) return;

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await AdminAuthService.signIn(email, password);

      toast.success("Your login was successful!", {
        duration: 3000,
        position: "top-right",
      });
      navigate("/dashboard/admin-dashboard/home");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      brandEyebrow="Admin console"
      brandTitle="Manage your platform with confidence."
      brandSubtitle="Review users, moderate content, and keep the ScaleUp Link community thriving."
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <AuthHeader
          icon={<ShieldCheck className="size-6" />}
          title="Admin sign in"
          description="Use your administrator credentials to access the console."
        />

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <div>
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </div>
          </Alert>
        )}
        {successMessage && (
          <Alert variant="success">
            <CheckCircle2 />
            <div>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
          noValidate
        >
          <FormField
            id="admin-email"
            label="Email address"
            required
            error={emailError}
          >
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="admin@scaleuplink.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "admin-email-error" : undefined}
            />
          </FormField>

          <FormField
            id="admin-password"
            label="Password"
            required
            error={passwordError}
          >
            <PasswordInput
              id="admin-password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? "admin-password-error" : undefined
              }
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={!isFormValid}
          >
            Sign in to console
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-xs">
          Authorized personnel only. Activity is monitored.
        </p>
      </motion.div>
    </AuthLayout>
  );
}
