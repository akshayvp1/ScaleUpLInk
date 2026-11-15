import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, UserPlus } from "lucide-react";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { FormField } from "../auth/FormField";
import { PasswordInput } from "../auth/PasswordInput";
import authService from "../../services/user/authService";
import { cn } from "../../lib/utils";

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyFounded: string;
  businessRegNumber: string;
  contactNumber: string;
  role: "entrepreneur" | "investor";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [role, setRole] = useState<"entrepreneur" | "investor">("entrepreneur");

  const {
    register,
    handleSubmit: validateForm,
    formState: { errors },
    watch,
    trigger,
    reset,
  } = useForm<RegisterCredentials>({
    mode: "onChange",
    defaultValues: {
      role: "entrepreneur",
    },
  });

  const password = watch("password");

  const onRoleChange = (newRole: "entrepreneur" | "investor") => {
    setRole(newRole);
    reset({ ...watch(), role: newRole });
  };

  const goToNextStep = async () => {
    const isValid = await trigger([
      "name",
      "email",
      "password",
      "confirmPassword",
    ]);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: RegisterCredentials) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const signupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        companyFounded: data.companyFounded,
        businessRegNumber: data.businessRegNumber,
        contactNumber: data.contactNumber,
        role: data.role,
      };

      setErrorMessage("");
      setSuccessMessage("");

      await authService.sendOtp(signupData, data.role);

      setSuccessMessage("OTP Sent Successfully 🎉");
      navigate("/otp");
    } catch {
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout contentClassName="max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <AuthHeader
          icon={<UserPlus className="size-6" />}
          title="Create your account"
          description="Join a community of founders, investors, and professionals."
        />

        <div
          className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1"
          role="tablist"
          aria-label="Account type"
        >
          {(["entrepreneur", "investor"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={role === option}
              onClick={() => onRoleChange(option)}
              className={cn(
                "focus-visible:ring-ring/50 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-[3px]",
                role === option
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <div>
              <AlertTitle>Registration failed</AlertTitle>
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
          onSubmit={validateForm(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {step === 1 && (
            <>
              <FormField
                id="name"
                label="Full name"
                required
                error={
                  errors.name?.type === "required"
                    ? "Please enter your name"
                    : errors.name?.type === "minLength"
                      ? "Name must be at least 5 characters"
                      : errors.name?.type === "pattern"
                        ? "Name must start with a capital letter and contain only letters"
                        : undefined
                }
              >
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  {...register("name", {
                    required: true,
                    minLength: 5,
                    pattern: /^[A-Z][a-zA-Z]*$/,
                  })}
                  aria-invalid={Boolean(errors.name)}
                />
              </FormField>

              <FormField
                id="email"
                label="Email address"
                required
                error={
                  errors.email?.type === "required"
                    ? "Please enter your email"
                    : errors.email?.type === "pattern"
                      ? "Email must end with .com and cannot contain spaces or special characters"
                      : undefined
                }
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  {...register("email", {
                    required: true,
                    pattern: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.com$/,
                  })}
                  aria-invalid={Boolean(errors.email)}
                />
              </FormField>

              <FormField
                id="password"
                label="Password"
                required
                error={
                  errors.password?.type === "required"
                    ? "Please enter a password"
                    : errors.password?.type === "minLength" ||
                        errors.password?.type === "maxLength"
                      ? "Password must be between 8-16 characters"
                      : errors.password?.type === "pattern"
                        ? "Password must contain uppercase, lowercase, number, special character, and no spaces"
                        : undefined
                }
                hint="8-16 characters with upper & lowercase, a number and a symbol."
              >
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  {...register("password", {
                    required: true,
                    minLength: 8,
                    maxLength: 16,
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?!.*\s).{8,16}$/,
                  })}
                  aria-invalid={Boolean(errors.password)}
                />
              </FormField>

              <FormField
                id="confirmPassword"
                label="Confirm password"
                required
                error={
                  errors.confirmPassword?.type === "required"
                    ? "Please confirm your password"
                    : errors.confirmPassword?.type === "validate"
                      ? "Passwords do not match"
                      : undefined
                }
              >
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  {...register("confirmPassword", {
                    required: true,
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
              </FormField>

              {role === "investor" ? (
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={goToNextStep}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={isLoading}
                >
                  Create account
                </Button>
              )}
            </>
          )}

          {role === "investor" && step === 2 && (
            <>
              <FormField
                id="companyName"
                label="Company name"
                required
                error={
                  errors.companyName?.type === "required"
                    ? "Please enter company name"
                    : errors.companyName?.type === "minLength"
                      ? "Company name must be at least 5 characters"
                      : errors.companyName?.type === "pattern"
                        ? "Company name must contain only letters"
                        : undefined
                }
              >
                <Input
                  id="companyName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Acme Ventures"
                  {...register("companyName", {
                    required: true,
                    minLength: 5,
                    pattern: /^[a-zA-Z]+$/,
                  })}
                  aria-invalid={Boolean(errors.companyName)}
                />
              </FormField>

              <FormField
                id="companyFounded"
                label="Year founded"
                required
                error={
                  errors.companyFounded?.type === "required"
                    ? "Please enter founding year"
                    : errors.companyFounded?.type === "pattern"
                      ? "Year must be between 1900-2025 with 4 digits"
                      : undefined
                }
              >
                <Input
                  id="companyFounded"
                  type="text"
                  inputMode="numeric"
                  placeholder="2018"
                  {...register("companyFounded", {
                    required: true,
                    pattern: /^(19[0-9][0-9]|20[0-1][0-9]|202[0-5])$/,
                  })}
                  aria-invalid={Boolean(errors.companyFounded)}
                />
              </FormField>

              <FormField
                id="businessRegNumber"
                label="Business registration number"
                required
                error={
                  errors.businessRegNumber?.type === "required"
                    ? "Please enter registration number"
                    : errors.businessRegNumber?.type === "minLength" ||
                        errors.businessRegNumber?.type === "maxLength"
                      ? "Registration number must be between 5-8 characters"
                      : errors.businessRegNumber?.type === "pattern"
                        ? "Registration number cannot contain spaces"
                        : undefined
                }
              >
                <Input
                  id="businessRegNumber"
                  type="text"
                  placeholder="12345"
                  {...register("businessRegNumber", {
                    required: true,
                    minLength: 5,
                    maxLength: 8,
                    pattern: /^\S{5,8}$/,
                  })}
                  aria-invalid={Boolean(errors.businessRegNumber)}
                />
              </FormField>

              <FormField
                id="contactNumber"
                label="Contact number"
                required
                error={
                  errors.contactNumber?.type === "required"
                    ? "Please enter contact number"
                    : errors.contactNumber?.type === "pattern"
                      ? "Contact number must start with 6, 7, 8, or 9 and be 10 digits"
                      : undefined
                }
              >
                <Input
                  id="contactNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="9876543210"
                  {...register("contactNumber", {
                    required: true,
                    pattern: /^[6789]\d{9}$/,
                  })}
                  aria-invalid={Boolean(errors.contactNumber)}
                />
              </FormField>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1"
                  loading={isLoading}
                >
                  Create account
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
