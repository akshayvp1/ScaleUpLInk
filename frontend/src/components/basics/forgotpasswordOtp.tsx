import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { OtpInput } from "../auth/OtpInput";
import authService from "../../services/user/authService";
import { RootState } from "../../redux/app/store";
import { cn } from "../../lib/utils";

export default function ResetPasswordOTPVerification() {
  const [otp, setOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [otpKey, setOtpKey] = useState<number>(0);
  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const email = localStorage.getItem("email");
      await authService.forgotPassword(email as string);

      setSuccessMessage("OTP resent successfully!");
      setTimeLeft(30);
      setOtp("");
      setOtpKey((current) => current + 1);
    } catch (error) {
      console.error("Error resending OTP:", error);
      setErrorMessage("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setErrorMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const email = localStorage.getItem("email");
      const response = await authService.verifyforgotOtp(email as string, otp);

      if (!response || !response.success || !response.resetToken) {
        throw new Error("Invalid OTP");
      }

      sessionStorage.setItem("resetToken", response.resetToken);
      setSuccessMessage(
        "OTP Verified Successfully! Redirecting to reset password..."
      );
      setTimeout(() => {
        navigate("/create-new-password");
      }, 2000);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
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
          title="Enter reset code"
          description={`Enter the 6-digit code sent to ${
            tempUser?.email || "your email"
          }.`}
        />

        {successMessage && (
          <Alert variant="success">
            <CheckCircle2 />
            <div>
              <AlertTitle>Verified</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </div>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <div>
              <AlertTitle>Verification failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        <OtpInput
          key={otpKey}
          value={otp}
          onChange={setOtp}
          autoFocus
          invalid={Boolean(errorMessage)}
          disabled={isVerifying}
        />

        <div className="text-muted-foreground space-y-1 text-center text-sm">
          <p>Code expires in {timeLeft} seconds</p>
          <p>
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 0 || isResending}
              className={cn(
                "font-medium transition-colors",
                timeLeft > 0 || isResending
                  ? "text-muted-foreground/60 cursor-not-allowed"
                  : "text-primary hover:underline"
              )}
            >
              {isResending ? "Resending..." : "Resend"}
            </button>
          </p>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={otp.length !== 6}
          loading={isVerifying}
          onClick={handleVerifyOtp}
        >
          Verify code
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-primary font-medium hover:underline"
          >
            Back to forgot password
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
