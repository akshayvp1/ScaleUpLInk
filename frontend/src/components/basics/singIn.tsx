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
import { isValidEmail } from "../../utils/authValidation";
import { IUser } from "../../types/auth/auth.types";

interface LoginCredentials {
  email: string;
  password: string;
}

function getOnboardingPath(user?: IUser | null): string {
  if (!user?.profession) return "/profession";
  if (!user.interests?.length && !user.interestRefs?.length) {
    return "/choose-interest";
  }
  return "/mainpage/dashboard";
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
    let nextEmailError = "";
    let nextPasswordError = "";

    if (!email.trim()) {
      valid = false;
    } else if (!isValidEmail(email)) {
      nextEmailError = "Please enter a valid email address";
      valid = false;
    }

    if (!password.trim()) {
      nextPasswordError = "Please enter your password";
      valid = false;
    }

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setIsFormValid(valid);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const loginData: LoginCredentials = { email, password };
      const result = await authService.signIn(loginData);

      toast.success("Your login was successful!", {
        duration: 3000,
        position: "top-right",
      });
      navigate(getOnboardingPath(result?.user));
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error instanceof Error ? error.message : "Login failed. Please try again.",
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  
const handleGoogleLoginSuccess = async (
  credentialResponse: CredentialResponse
) => {
  setErrorMessage("");
  setSuccessMessage("");

  if (!credentialResponse.credential) {
    toast.error("Google credential was not received.");
    return;
  }

  try {
    const result = await authService.verifyGoogleToken(
      credentialResponse.credential
    );

    if (result && typeof result === "object" && result.partialUser) {
      toast.success("Google authentication successful!", {
        duration: 3000,
        position: "top-right",
      });

      setTimeout(() => navigate("/role"), 2000);
    } else {
      toast.success("Google authentication successful!", {
        duration: 3000,
        position: "top-right",
      });

      setTimeout(() => navigate(getOnboardingPath(result.user)), 2000);
    }
  } catch (error) {
    console.error("Google login verification error:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to verify Google credentials. Please try again.",
      {
        duration: 3000,
        position: "top-right",
      }
    );
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
