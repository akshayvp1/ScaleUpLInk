import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminAuthService from "../../../services/admin/adminAuthService";
import { toast } from "react-hot-toast";
import buinessIMg from "../../../assets/business.jpg";

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

  // Validate form whenever email or password changes
  useEffect(() => {
    validateForm();
  }, [email, password]);

  // Validate the form fields
  const validateForm = () => {
    let valid = true;
    
    // Reset error messages
    setEmailError("");
    setPasswordError("");
    
    // Validate email
    if (!email.trim()) {
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address ending with .com");
      valid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      valid = false;
    }
    
    setIsFormValid(valid);
  };
  
  // Email validation function
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
      // const loginData: LoginCredentials = { email, password };
      const result = await AdminAuthService.signIn(email,password);

      console.log(result, "XXXXXX");

     
        toast.success("Your login was successful!", { duration: 3000, position: "top-right" });
        navigate('/dashboard/admin-dashboard/home');
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.", { duration: 3000, position: "top-right" });
    } finally {
      setIsLoading(false);
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
        {/* Left Side - Illustration */}
        <div className="hidden md:flex items-center justify-center bg-white p-8">
          <img
            src={buinessIMg}
            alt="Login Illustration"
            className="max-w-xs"
          />
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full p-6 border rounded-none">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
            <p className="text-gray-500 text-center">
              Connect with professionals, investors & community
            </p>

            {/* Success and error messages */}
            {errorMessage && (
              <div className="p-2 bg-red-100 text-red-600 text-center rounded-md">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-2 bg-green-100 text-green-600 text-center rounded-md">
                {successMessage}
              </div>
            )}

            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <p className="text-red-500 text-xs">{emailError}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && (
                <p className="text-red-500 text-xs">{passwordError}</p>
              )}
            </div>

            {/* Login Button with Loading Spinner */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Loading..." : "Log In"}
            </Button>

            <div className="text-center text-sm text-gray-500">
              <a href="/forgot-password" className="hover:underline">
                Forgot Password?
              </a>
            </div>

            <Separator />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}