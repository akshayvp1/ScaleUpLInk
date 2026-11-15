import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { AlertCircle, CheckCircle2, LogIn } from "lucide-react";
import { toast } from "react-hot-toast";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { FormField } from "../auth/FormField";
import { PasswordInput } from "../auth/PasswordInput";
import authService from "../../services/user/authService";
import { useTheme } from "../theme-provider";

interface LoginCredentials {
  email: string;
  password: string;
}

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

  const { theme } = useTheme();

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
      const loginData: LoginCredentials = { email, password };
      const result = await authService.signIn(loginData);

      if (result?.user?.profession) {
        toast.success("Your login was successful!", {
          duration: 3000,
          position: "top-right",
        });
        navigate("/mainpage/dashboard");
      } else {
        navigate("/profession");
      }
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

  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const isPartialUser = await authService.verifyGoogleToken(
        credentialResponse.credential ?? ""
      );

      if (isPartialUser) {
        setTimeout(() => {
          toast.success("Google authentication successful!", {
            duration: 3000,
            position: "top-right",
            style: {
              background: "var(--card)",
              color: "var(--card-foreground)",
              borderRadius: "8px",
            },
          });
        }, 500);
        setTimeout(() => navigate("/role"), 2000);
      } else {
        setTimeout(() => {
          toast.success("Google authentication successful!", {
            duration: 3000,
            position: "top-right",
            style: {
              background: "var(--card)",
              color: "var(--card-foreground)",
              borderRadius: "8px",
            },
          });
        }, 500);
        setTimeout(() => navigate("/mainpage/dashboard"), 2000);
      }
    } catch (error) {
      console.error("Google login verification error:", error);
      setTimeout(() => {
        toast.error("Failed to verify Google credentials. Please try again.", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "8px",
          },
        });
      }, 500);
    }
  };

  const handleGoogleLoginError = () => {
    setErrorMessage(
      "Google login failed. Please try again or use email login."
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
          icon={<LogIn className="size-6" />}
          title="Welcome back"
          description="Sign in to continue to your dashboard."
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
            id="email"
            label="Email address"
            required
            error={emailError}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
            />
          </FormField>

          <FormField
            id="password"
            label="Password"
            required
            error={passwordError}
          >
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
          </FormField>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-primary text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={!isFormValid}
          >
            Sign in
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
            theme={theme === "dark" ? "filled_black" : "outline"}
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>

        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
