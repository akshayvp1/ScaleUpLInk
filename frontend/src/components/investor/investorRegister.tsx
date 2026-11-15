import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { AlertCircle, CheckCircle2, Building2 } from "lucide-react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { FormField } from "../auth/FormField";
import authService from "../../services/user/authService";
import { RootState } from "../../redux/app/store";

interface InvestorRegistrationForm {
  name: string;
  email: string;
  companyName: string;
  companyFounded: string;
  businessRegNumber: string;
  contactNumber: string;
}

export default function InvestorRegistrationPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvestorRegistrationForm>({
    mode: "onChange",
  });

  const onSubmit = async (data: InvestorRegistrationForm) => {
    const userData = {
      name: tempUser?.name,
      email: tempUser?.email,
      role: tempUser?.role,
      companyName: data.companyName,
      companyFounded: data.companyFounded,
      businessRegNumber: data.businessRegNumber,
      contactNumber: data.contactNumber,
    };
    if (isLoading) return;

    setIsLoading(true);
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await authService.completeProfile(userData);

      setTimeout(() => {
        setSuccessMessage("Registration Successful 🎉");
        navigate("/profession");
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout contentClassName="max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <AuthHeader
          icon={<Building2 className="size-6" />}
          title="Investor registration"
          description="Tell us about your firm so founders can learn more about you."
        />

        {successMessage && (
          <Alert variant="success">
            <CheckCircle2 />
            <div>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </div>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <div>
              <AlertTitle>Registration failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            id="companyName"
            label="Company name"
            required
            error={errors.companyName?.message}
          >
            <Input
              id="companyName"
              type="text"
              autoComplete="organization"
              placeholder="Acme Ventures"
              {...register("companyName", {
                required: "Company name is required",
                minLength: {
                  value: 5,
                  message: "Company name must be at least 5 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9\s]+$/,
                  message:
                    "Company name must contain only letters, numbers and spaces",
                },
              })}
              aria-invalid={Boolean(errors.companyName)}
            />
          </FormField>

          <FormField
            id="companyFounded"
            label="Year founded"
            required
            error={errors.companyFounded?.message}
          >
            <Input
              id="companyFounded"
              type="text"
              inputMode="numeric"
              placeholder="2018"
              {...register("companyFounded", {
                required: "Founding year is required",
                pattern: {
                  value: /^(19[0-9][0-9]|20[0-1][0-9]|202[0-5])$/,
                  message: "Year must be between 1900-2025 with 4 digits",
                },
              })}
              aria-invalid={Boolean(errors.companyFounded)}
            />
          </FormField>

          <FormField
            id="businessRegNumber"
            label="Business registration number"
            required
            error={errors.businessRegNumber?.message}
          >
            <Input
              id="businessRegNumber"
              type="text"
              placeholder="12345"
              {...register("businessRegNumber", {
                required: "Business registration number is required",
                minLength: {
                  value: 5,
                  message: "Registration number must be at least 5 characters",
                },
                maxLength: {
                  value: 15,
                  message: "Registration number must be at most 15 characters",
                },
                pattern: {
                  value: /^\S+$/,
                  message: "Registration number cannot contain spaces",
                },
              })}
              aria-invalid={Boolean(errors.businessRegNumber)}
            />
          </FormField>

          <FormField
            id="contactNumber"
            label="Contact number"
            required
            error={errors.contactNumber?.message}
          >
            <Input
              id="contactNumber"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              {...register("contactNumber", {
                required: "Contact number is required",
                pattern: {
                  value: /^[0-9]{10,15}$/,
                  message:
                    "Please enter a valid contact number (10-15 digits)",
                },
              })}
              aria-invalid={Boolean(errors.contactNumber)}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isLoading}
          >
            Complete registration
          </Button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
