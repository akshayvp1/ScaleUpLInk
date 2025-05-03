





// import { Card, CardContent } from "../ui/card";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import { Separator } from "../ui/separator";
// // import { FaGoogle } from "react-icons/fa";
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
// import authService from "../../services/user/authService";
// import { toast } from "react-hot-toast";
// import buinessIMg from "../../assets/business.jpg"
// import { useTheme } from "../theme-provider";
// import Dark from '../../assets/dark.jpg'



// interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [successMessage, setSuccessMessage] = useState<string>("");
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isFormValid, setIsFormValid] = useState<boolean>(false);
//   const [emailError, setEmailError] = useState<string>("");
//   const [passwordError, setPasswordError] = useState<string>("");
//   const navigate = useNavigate();

//   const { theme } = useTheme();

//   // Validate form whenever email or password changes
//   useEffect(() => {
//     validateForm();
//   }, [email, password]);

//   // Validate the form fields
//   const validateForm = () => {
//     let valid = true;
    
//     // Reset error messages
//     setEmailError("");
//     setPasswordError("");
    
//     // Validate email
//     if (!email.trim()) {
//       valid = false;
//     } else if (!validateEmail(email)) {
//       setEmailError("Please enter a valid email address ending with .com");
//       valid = false;
//     }
    
//     // Validate password
//     if (!password.trim()) {
//       valid = false;
//     }
    
//     setIsFormValid(valid);
//   };
  
//   // Email validation function
//   const validateEmail = (email: string): boolean => {
//     const regex = /^[^\s@]+@[^\s@]+\.[c][o][m]$/;
//     return regex.test(email);
//   };

//   const handleSubmit = async () => {
//     validateForm();
//     if (!isFormValid) return; // Ensure `isFormValid` is a state

//     setIsLoading(true);
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       const loginData: LoginCredentials = { email, password };
//       const result = await authService.signIn(loginData);

//       console.log(result, "XXXXXX");

//       if (result?.user?.profession) {
//         toast.success("Your login was successful!", { duration: 3000, position: "top-right" });
//         navigate('/mainpage/dashboard');
//       } else {
//         navigate('/profession');
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error( "Login failed. Please try again.", { duration: 3000, position: "top-right" });
//     } finally {
//       setIsLoading(false);
//     }
// };


//   // Handle Google login success
//   const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
//     setErrorMessage("");
//     setSuccessMessage("");
    
//     try {
//       console.log("reeee",credentialResponse,"fffffffffffffffffff")
//       // Send the credential token to your backend for verification
//       const isPartialUser = await authService.verifyGoogleToken(credentialResponse.credential??"");
      
//       if (isPartialUser) {
//         setTimeout(() => {
//           toast.success("Google authentication successful!", {
//             duration: 3000,
//             position: "top-right",
//             style: {
//               background: "#333",
//               color: "#fff",
//               borderRadius: "8px",
//             },
//           });
//         }, 500);
//         setTimeout(() => navigate('/role'), 2000);
//       } else {
//         setTimeout(() => {
//           toast.success("Google authentication successful!", {
//             duration: 3000,
//             position: "top-right",
//             style: {
//               background: "#333",
//               color: "#fff",
//               borderRadius: "8px",
//             },
//           });
//         }, 500);
//         setTimeout(() => navigate('/mainpage/dashboard'), 2000)
//       }
//     } catch (error) {
//       console.error("Google login verification error:", error);
//       setTimeout(() => {
//         toast.error("Failed to verify Google credentials. Please try again.", {
//           duration: 3000,
//           position: "top-right",
//           style: {
//             background: "#333",
//             color: "#fff",
//             borderRadius: "8px",
//           },
//         });
//       }, 500);
//     }
//   };

//   // Handle Google login error
//   const handleGoogleLoginError = () => {
//     setErrorMessage("Google login failed. Please try again or use email login.");
//   };

//   return (
//     <div className="flex h-screen items-start bg-primary justify-center pt-20  p-4">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-lg overflow-hidden"
//       >
//         {/* Left Side - Illustration */}
//         <div className="hidden md:flex items-center justify-center  p-8">
//           {theme === "dark" ? (
//             <img
//             src={Dark}
//             alt="Login Illustration"
//             className="max-w-xs"
//           />
//           ) : (
//             <img
//             src={buinessIMg}
//             alt="Login Illustration"
//             className="max-w-xs"
//           />
//           )}
          
//         </div>

//         {/* Right Side - Login Form */}
//         <Card className="w-full p-6 border rounded-none">
//           <CardContent className="space-y-4">
//             <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
//             <p className="text-gray-500 text-center">
//               Connect with professionals, investors & community
//             </p>

//             {/* Success and error messages */}
//             {errorMessage && (
//               <div className="p-2 bg-red-100 text-red-600 text-center rounded-md">
//                 {errorMessage}
//               </div>
//             )}
//             {successMessage && (
//               <div className="p-2 bg-green-100 text-green-600 text-center rounded-md">
//                 {successMessage}
//               </div>
//             )}

//             <div className="space-y-1">
//               <Input
//                 type="email"
//                 placeholder="Email Address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={emailError ? "border-red-500" : ""}
//               />
//               {emailError && (
//                 <p className="text-red-500 text-xs">{emailError}</p>
//               )}
//             </div>
            
//             <div className="space-y-1">
//               <Input
//                 type="password"
//                 placeholder="Enter Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className={passwordError ? "border-red-500" : ""}
//               />
//               {passwordError && (
//                 <p className="text-red-500 text-xs">{passwordError}</p>
//               )}
//             </div>

//             {/* Login Button with Loading Spinner */}
//             <Button
//               onClick={handleSubmit}
//               className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full"
//               disabled={isLoading || !isFormValid}
//             >
//               {isLoading ? "Loading..." : "Log In"}
//             </Button>

//             <div className="text-center text-sm text-gray-500">
//               <a href="/forgot-password" className="hover:underline">
//                 Forgot Password?
//               </a>
//             </div>

//             <Separator />

//             {/* Google Login Button */}
//             <div className="flex justify-center">
//               <GoogleLogin
//                 onSuccess={handleGoogleLoginSuccess}
//                 onError={handleGoogleLoginError}
//                 useOneTap
//                 theme="outline"
//                 size="large"
//                 text="signin_with"
//                 shape="pill"
//                 logo_alignment="center"
//               />
//             </div>

//             <div className="text-center text-sm text-gray-500">
//               Don't have an account?{" "}
//               <Link to="/signup" className="text-blue-600 hover:underline">
//                 Register
//               </Link>
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
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import authService from "../../services/user/authService";
import { toast } from "react-hot-toast";
import buinessIMg from "../../assets/business.jpg";
import Dark from "../../assets/dark.jpg";
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
      const loginData: LoginCredentials = { email, password };
      const result = await authService.signIn(loginData);

      console.log(result, "XXXXXX");

      if (result?.user?.profession) {
        toast.success("Your login was successful!", { duration: 3000, position: "top-right" });
        navigate('/mainpage/dashboard');
      } else {
        navigate('/profession');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.", { duration: 3000, position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login success
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      console.log("reeee", credentialResponse, "fffffffffffffffffff");
      const isPartialUser = await authService.verifyGoogleToken(credentialResponse.credential ?? "");
      
      if (isPartialUser) {
        setTimeout(() => {
          toast.success("Google authentication successful!", {
            duration: 3000,
            position: "top-right",
            style: {
              background: theme === "dark" ? "#444" : "#333",
              color: "#fff",
              borderRadius: "8px",
            },
          });
        }, 500);
        setTimeout(() => navigate('/role'), 2000);
      } else {
        setTimeout(() => {
          toast.success("Google authentication successful!", {
            duration: 3000,
            position: "top-right",
            style: {
              background: theme === "dark" ? "#444" : "#333",
              color: "#fff",
              borderRadius: "8px",
            },
          });
        }, 500);
        setTimeout(() => navigate('/mainpage/dashboard'), 2000);
      }
    } catch (error) {
      console.error("Google login verification error:", error);
      setTimeout(() => {
        toast.error("Failed to verify Google credentials. Please try again.", {
          duration: 3000,
          position: "top-right",
          style: {
            background: theme === "dark" ? "#444" : "#333",
            color: "#fff",
            borderRadius: "8px",
          },
        });
      }, 500);
    }
  };

  // Handle Google login error
  const handleGoogleLoginError = () => {
    setErrorMessage("Google login failed. Please try again or use email login.");
  };

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
      >
        {/* Left Side - Login Form */}
        <Card className="w-full p-8 border-none bg-white dark:bg-gray-800">
          <CardContent className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome Back
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Connect with professionals, investors & community
              </p>
            </div>

            {/* Success and error messages */}
            {errorMessage && (
              <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 text-center rounded-lg">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 text-center rounded-lg">
                {successMessage}
              </div>
            )}

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="rishad@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${
                  emailError ? "border-red-500" : ""
                } bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary`}
              />
              {emailError && (
                <p className="text-red-500 dark:text-red-400 text-xs">{emailError}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${
                  passwordError ? "border-red-500" : ""
                } bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary`}
              />
              {passwordError && (
                <p className="text-red-500 dark:text-red-400 text-xs">{passwordError}</p>
              )}
            </div>

            {/* Login Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 rounded-lg py-2"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Loading..." : "Log In"}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline dark:text-primary"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline dark:text-primary"
              >
                Register
              </Link>
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
            src={theme === "dark" ? buinessIMg : buinessIMg}
            alt="Login Illustration"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}