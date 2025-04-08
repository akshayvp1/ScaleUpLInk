import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { motion } from "framer-motion";
import { MdLockReset } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import buinessIMg from "../../assets/business.jpg";
import authService from "../../services/user/authService";

export default function ForgotPasswordEmailPage() {
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear any previous messages when the user starts typing
    if (errorMessage || successMessage) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Call the resendOtp service with the email
      // Using "entrepreneur" as a default role, adjust as needed for your application
      await authService.forgotPassword(email);
      
      setSuccessMessage("Password reset instructions sent! Please check your email.");
      
      // Navigate to OTP verification page after successful submission
      setTimeout(() => {
        // Store email in session storage for the OTP verification page
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
    <div className="flex h-screen items-start justify-center pt-20 bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="hidden md:flex items-center justify-center bg-white p-8">
          <img src={buinessIMg} alt="Forgot Password" className="max-w-xs" />
        </div>

        <Card className="w-full p-6 border rounded-none">
          <CardContent className="space-y-4">
            {/* Success and Error Messages */}
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
            
            <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
            <p className="text-gray-500 text-center">
              Enter your email address to receive a verification code
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full"
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>

            <Separator />

            <div className="text-center text-sm text-gray-500">
              <p>Remembered your password? <a href="/signin" className="text-blue-600 hover:underline">Back to Login</a></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}