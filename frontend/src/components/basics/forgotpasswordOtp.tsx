// import { Card, CardContent } from "../ui/card";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import { Separator } from "../ui/separator";
// import { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import { MdLockReset } from "react-icons/md";
// import authService from "../../services/user/authService";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/app/store";
// import { useNavigate } from "react-router-dom";
// import buinessIMg from "../../assets/business.jpg";

// export default function ResetPasswordOTPVerification() {
//   const [otp, setOtp] = useState<string>(""); // Store OTP as a single string
//   const [timeLeft, setTimeLeft] = useState<number>(30);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
//   const [role, setRole] = useState<"entrepreneur" | "investor">("entrepreneur");
//   const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);
//   const navigate = useNavigate();

//   // State for success and error messages
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [isResending, setIsResending] = useState<boolean>(false);
//   const [isVerifying, setIsVerifying] = useState<boolean>(false);

//   useEffect(() => {
//     if (timeLeft <= 0) return;
//     const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
//     return () => clearTimeout(timer);
//   }, [timeLeft]);

//   useEffect(() => {
//     // Set role from tempUser if available
//     if (tempUser?.role) {
//       setRole(tempUser.role as "entrepreneur" | "investor");
//     }
//   }, [tempUser]);

//   const handleChange = (index: number, value: string) => {
//     if (!/^\d*$/.test(value)) return; // Allow only numbers

//     const newOtp = otp.split("");
//     newOtp[index] = value.slice(0, 1); // Ensure single digit per input
//     setOtp(newOtp.join(""));

//     if (value && index < 5) inputRefs.current[index + 1]?.focus();
//   };

//   const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData("text/plain").trim().replace(/\D/g, "").slice(0, 6);
//     setOtp(pastedData);
//     const lastIndex = Math.min(pastedData.length - 1, 5);
//     if (lastIndex >= 0) {
//       inputRefs.current[lastIndex]?.focus();
//     }
//   };

//   const handleResend = async () => {
    

//     setIsResending(true);
//     setErrorMessage(null);
//     setSuccessMessage(null);
    
//     try {
//       // We need to just send the email for OTP resend
//       const email = localStorage.getItem("email")
      
//       // Send only the email for OTP resend
//       await authService.resendOtp(email as string, role);
      
//       setSuccessMessage("OTP resent successfully!");
//       setTimeLeft(30);
//       setOtp("");

//       inputRefs.current[0]?.focus();
//     } catch (error) {
//       console.error("Error resending OTP:", error);
//       setErrorMessage("Failed to resend OTP. Please try again.");
//     } finally {
//       setIsResending(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
    

//     if (otp.length !== 6 || isNaN(Number(otp))) {
//         setErrorMessage("Please enter a valid 6-digit OTP.");
//         return; // Stop execution if OTP is invalid
//     }

//     setIsVerifying(true);
//     setErrorMessage(null);
//     setSuccessMessage(null);

//     try {
//       let email = localStorage.getItem("email");
//       console.log(email,"LLLLLLL")
//         // Call API to verify OTP
//         const response = await authService.verifyforgotOtp(email as string, otp);
//         console.log(response,"ppppppppdddd")

//         if (!response || !response.success) {
//             throw new Error("Invalid OTP");
//         }

//         setSuccessMessage("OTP Verified Successfully! Redirecting to reset password...");
        
//         // Navigate to reset password page after a short delay
//         setTimeout(() => {
//             navigate('/create-new-password');
//         }, 2000);
//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         setErrorMessage("Invalid OTP. Please try again.");
//     } finally {
//         setIsVerifying(false);
//     }
// };


//   return (
//     <div className="flex h-screen items-start justify-center pt-20 bg-gray-100 p-4">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
//       >
//         <div className="hidden md:flex items-center justify-center bg-white p-8">
//           <img src={buinessIMg} alt="Password Reset" className="max-w-xs" />
//         </div>

//         <Card className="w-full p-6 border rounded-none">
//           <CardContent className="space-y-4">
//             {/* Success and Error Messages */}
//             {successMessage && (
//               <div className="p-2 bg-green-100 text-green-600 text-center rounded-md">
//                 {successMessage}
//               </div>
//             )}
//             {errorMessage && (
//               <div className="p-2 bg-red-100 text-red-600 text-center rounded-md">
//                 {errorMessage}
//               </div>
//             )}

//             <div className="flex justify-center mb-2">
//               <div className="bg-orange-100 p-3 rounded-full">
//                 <MdLockReset className="text-orange-500 text-xl" />
//               </div>
//             </div>
//             <h2 className="text-2xl font-bold text-center">Reset Password</h2>
//             <p className="text-gray-500 text-center">
//               Enter the 6-digit code sent to <br />
//               <span className="font-medium">{tempUser?.email || "your email"}</span>
//             </p>

//             <div className="flex justify-between gap-2 py-4">
//               {[...Array(6)].map((_, index) => (
//                 <Input
//                   key={index}
//                   ref={(el) => { inputRefs.current[index] = el; }}
//                   type="text"
//                   inputMode="numeric"
//                   pattern="[0-9]*"
//                   maxLength={1}
//                   className="w-full h-12 text-center text-lg"
//                   value={otp[index] || ""}
//                   onChange={(e) => handleChange(index, e.target.value)}
//                   onKeyDown={(e) => handleKeyDown(index, e)}
//                   onPaste={index === 0 ? handlePaste : undefined}
//                   autoFocus={index === 0}
//                 />
//               ))}
//             </div>

//             <div className="text-center text-sm text-gray-500 space-y-1">
//               <p>• OTP will expire in {timeLeft} seconds</p>
//               <p>
//                 • Didn't receive the code?{" "}
//                 <button
//                   onClick={handleResend}
//                   disabled={timeLeft > 0 || isResending}
//                   className={`font-medium ${
//                     timeLeft > 0 || isResending ? "text-gray-400" : "text-blue-600 hover:underline"
//                   }`}
//                 >
//                   {isResending ? "Resending..." : "Resend"}
//                 </button>
//               </p>
//             </div>

//             <Button
//               className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full"
//               disabled={otp.length !== 6 || isVerifying}
//               onClick={handleVerifyOtp}
//             >
//               {isVerifying ? "Verifying..." : "Verify Code"}
//             </Button>

//             <Separator />

//             <div className="text-center text-sm text-gray-500">
//               <a href="/forgot-password" className="text-blue-600 hover:underline">Back to Forgot Password</a>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }





import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MdLockReset } from "react-icons/md";
import authService from "../../services/user/authService";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/app/store";
import { useNavigate } from "react-router-dom";
import buinessIMg from "../../assets/business.jpg";
import Dark from "../../assets/dark.jpg";
import { useTheme } from "../theme-provider";

export default function ResetPasswordOTPVerification() {
  const [otp, setOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const [role, setRole] = useState<"entrepreneur" | "investor">("entrepreneur");
  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);
  const navigate = useNavigate();

  const { theme } = useTheme();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (tempUser?.role) {
      setRole(tempUser.role as "entrepreneur" | "investor");
    }
  }, [tempUser]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = otp.split("");
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp.join(""));

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim().replace(/\D/g, "").slice(0, 6);
    setOtp(pastedData);
    const lastIndex = Math.min(pastedData.length - 1, 5);
    if (lastIndex >= 0) {
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const email = localStorage.getItem("email");
      await authService.resendOtp(email as string, role);
      
      setSuccessMessage("OTP resent successfully!");
      setTimeLeft(30);
      setOtp("");
      inputRefs.current[0]?.focus();
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
      let email = localStorage.getItem("email");
      console.log(email, "LLLLLLL");
      const response = await authService.verifyforgotOtp(email as string, otp);
      console.log(response, "ppppppppdddd");

      if (!response || !response.success) {
        throw new Error("Invalid OTP");
      }

      setSuccessMessage("OTP Verified Successfully! Redirecting to reset password...");
      setTimeout(() => {
        navigate('/create-new-password');
      }, 2000);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
      >
        {/* Left Side - OTP Form */}
        <Card className="w-full p-8 border-none bg-white dark:bg-gray-800">
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                  <MdLockReset className="text-primary dark:text-primary text-xl" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Reset Password
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Enter the 6-digit code sent to <br />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {tempUser?.email || "your email"}
                </span>
              </p>
            </div>

            {/* Success and Error Messages */}
            {successMessage && (
              <div className="p-3 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 text-center rounded-lg">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 text-center rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-between gap-2 py-4">
              {[...Array(6)].map((_, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="w-full h-12 text-center text-lg bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                  value={otp[index] || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>OTP will expire in {timeLeft} seconds</p>
              <p>
                Didn’t receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={timeLeft > 0 || isResending}
                  className={`font-medium ${
                    timeLeft > 0 || isResending ? "text-gray-400 dark:text-gray-500" : "text-primary hover:underline dark:text-primary"
                  }`}
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>
              </p>
            </div>

            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 rounded-lg py-2"
              disabled={otp.length !== 6 || isVerifying}
              onClick={handleVerifyOtp}
            >
              {isVerifying ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <a href="/forgot-password" className="text-primary hover:underline dark:text-primary">
                Back to Forgot Password
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Image */}
        <motion.div
          initial={{ opacity: 0, x: 20, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:flex items-center justify-center p-8 bg-white dark:bg-gray-800"
        >
          <img
            src={theme === "dark" ? Dark : buinessIMg}
            alt="Password Reset"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}