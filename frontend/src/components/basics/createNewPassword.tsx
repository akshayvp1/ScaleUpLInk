import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdLockReset } from "react-icons/md";
import authService from "../../services/user/authService";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/app/store";
import { useNavigate } from "react-router-dom";
import buinessIMg from "../../assets/business.jpg";

interface ValidationErrors {
  newPassword: string;
  confirmPassword: string;
  match: string;
}

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<string>("entrepreneur");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    newPassword: "",
    confirmPassword: "",
    match: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (tempUser?.role) {
      setRole(tempUser.role as string);
    }
  }, [tempUser]);

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

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    
    const error = validatePassword(password);
    setValidationErrors(prev => ({
      ...prev,
      newPassword: error,
      match: password !== confirmPassword && confirmPassword !== "" ? "Passwords do not match" : ""
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setConfirmPassword(password);
    
    setValidationErrors(prev => ({
      ...prev,
      confirmPassword: password === "" ? "Confirm password is required" : "",
      match: password !== newPassword ? "Passwords do not match" : ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setSuccessMessage(null);
    setErrorMessage(null);
    
    const newPasswordError = validatePassword(newPassword);
    
    if (newPasswordError) {
      setValidationErrors(prev => ({
        ...prev,
        newPassword: newPasswordError
      }));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setValidationErrors(prev => ({  // Fixed from setValidationErrors
        ...prev,
        match: "Passwords do not match"
      }));
      return;
    }
    
    if (!tempUser?.email) {
      setErrorMessage("User email not found. Please try again.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await authService.changePassword(tempUser.email, newPassword);
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
    <div className="flex h-screen items-start justify-center pt-20 bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="hidden md:flex items-center justify-center bg-white p-8">
          <img src={buinessIMg} alt="Password Reset" className="max-w-xs" />
        </div>

        <Card className="w-full p-6 border rounded-none">
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="p-2 bg-green-100 text-green-600 text-center rounded-md">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-2 bg-red-100 text-red-600 text-center rounded-md">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-center mb-2">
              <div className="bg-orange-100 p-3 rounded-full">
                <MdLockReset className="text-orange-500 text-xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Set New Password</h2>
            <p className="text-gray-500 text-center">
              Create a new password for your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  className="w-full"
                  placeholder="Enter new password"
                />
                {validationErrors.newPassword && (
                  <p className="text-xs text-red-500">{validationErrors.newPassword}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full"
                  placeholder="Confirm your password"
                />
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-red-500">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {validationErrors.match && (
                <p className="text-xs text-red-500">{validationErrors.match}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                disabled={hasErrors() || isSubmitting}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            <Separator />

            <div className="text-center text-sm text-gray-500">
              <a href="/login" className="text-blue-600 hover:underline">Back to Login</a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}