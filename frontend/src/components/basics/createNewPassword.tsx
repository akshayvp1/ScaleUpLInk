import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";

import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { FormField } from "../auth/FormField";
import { PasswordInput } from "../auth/PasswordInput";
import authService from "../../services/user/authService";

interface ValidationErrors {
  newPassword: string;
  confirmPassword: string;
  match: string;
}

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    newPassword: "",
    confirmPassword: "",
    match: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return "";
  };

  const handleNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;
    setNewPassword(password);

    const error = validatePassword(password);
    setValidationErrors((prev) => ({
      ...prev,
      newPassword: error,
      match:
        password !== confirmPassword && confirmPassword !== ""
          ? "Passwords do not match"
          : "",
    }));
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const password = event.target.value;
    setConfirmPassword(password);

    setValidationErrors((prev) => ({
      ...prev,
      confirmPassword: password === "" ? "Confirm password is required" : "",
      match: password !== newPassword ? "Passwords do not match" : "",
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage(null);
    setErrorMessage(null);

    const newPasswordError = validatePassword(newPassword);

    if (newPasswordError) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: newPasswordError,
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        match: "Passwords do not match",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const email = localStorage.getItem("email");
      const resetToken = sessionStorage.getItem("resetToken");

      if (!email || !resetToken) {
        setErrorMessage("Reset session expired. Please request a new OTP.");
        return;
      }

      await authService.changePassword(email, newPassword, resetToken);
      sessionStorage.removeItem("resetToken");
      localStorage.removeItem("email");
      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = (): boolean => {
    return Boolean(
      validationErrors.newPassword ||
        validationErrors.confirmPassword ||
        validationErrors.match ||
        !newPassword ||
        !confirmPassword
    );
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
          icon={<Lock className="size-6" />}
          title="Set a new password"
          description="Create a strong password for your account."
        />

        {successMessage && (
          <Alert variant="success">
            <CheckCircle2 />
            <div>
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </div>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <div>
              <AlertTitle>Could not reset password</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField
            id="newPassword"
            label="New password"
            required
            error={validationErrors.newPassword}
            hint="At least 8 characters with upper & lowercase, a number and a symbol."
          >
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              aria-invalid={Boolean(validationErrors.newPassword)}
            />
          </FormField>

          <FormField
            id="confirmPassword"
            label="Confirm password"
            required
            error={
              validationErrors.confirmPassword || validationErrors.match
            }
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              aria-invalid={Boolean(
                validationErrors.confirmPassword || validationErrors.match
              )}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={hasErrors()}
            loading={isSubmitting}
          >
            Reset password
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          <Link to="/signin" className="text-primary font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
