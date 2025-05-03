

// // RegisterPage.tsx
// import { Card, CardContent } from "../../components/ui/card";
// import { Input } from "../../components/ui/input";
// import { Button } from "../../components/ui/button";
// import { Separator } from "../../components/ui/separator";
// import { useState } from "react";
// import { motion } from "framer-motion";
// import authService from "../../services/user/authService";
// import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import buinessIMg from "../../assets/business.jpg"


// interface RegisterCredentials {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   companyName: string;
//   companyFounded: string;
//   businessRegNumber: string;
//   contactNumber: string;
//   role: "entrepreneur" | "investor";
// }

// export default function RegisterPage() {
//   const navigate = useNavigate();
//   const [step, setStep] = useState<number>(1);
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const [successMessage, setSuccessMessage] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [role, setRole] = useState<"entrepreneur" | "investor">("entrepreneur");

//   const { 
//     register, 
//     handleSubmit: validateForm, 
//     formState: { errors }, 
//     watch, 
//     trigger,
//     reset
//   } = useForm<RegisterCredentials>({
//     mode: "onChange",
//     defaultValues: {
//       role: "entrepreneur"
//     }
//   });

//   const password = watch("password");

//   const onRoleChange = (newRole: "entrepreneur" | "investor") => {
//     setRole(newRole);
//     reset({ ...watch(), role: newRole });
//   };

//   const goToNextStep = async () => {
//     const isValid = await trigger(["name", "email", "password", "confirmPassword"]);
//     if (isValid) {
//       setStep(2);
//     }
//   };

//   const onSubmit = async (data: RegisterCredentials) => {
//     if (isLoading) return;

//     setIsLoading(true);
//     try {
//       // Remove FormData and investmentHistory
//       const signupData = {
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         companyName: data.companyName,
//         companyFounded: data.companyFounded,
//         businessRegNumber: data.businessRegNumber,
//         contactNumber: data.contactNumber,
//         role: data.role
//       };

//       setErrorMessage("");
//       setSuccessMessage("");

//       console.log("Signup Data:", signupData);

//       await authService.sendOtp(signupData, data.role);

//       setSuccessMessage("OTP Sent Successfully 🎉");
//       navigate("/otp");
//     } catch (error) {
//       setErrorMessage("Registration failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen items-start justify-center pt-20 bg-gray-100 p-4">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
//       >
//         <div className="hidden md:flex items-center justify-center bg-white p-8">
//           <img src={buinessIMg} alt="Register Illustration" className="max-w-xs" />
//         </div>
//         <Card className="w-full p-6 border rounded-none">
//           <CardContent className="space-y-4">
//             <h2 className="text-xl font-bold text-center">Create Account</h2>
//             {errorMessage && (
//               <div className="p-2 bg-red-100 text-red-600 text-center rounded-md">{errorMessage}</div>
//             )}
//             {successMessage && (
//               <div className="p-2 bg-green-100 text-green-600 text-center rounded-md">{successMessage}</div>
//             )}
//             <div className="flex justify-center gap-6 border-b pb-2">
//               <button
//                 className={`text-sm font-medium pb-2 ${
//                   role === "entrepreneur"
//                     ? "border-b-2 border-orange-500 text-orange-500"
//                     : "text-gray-500"
//                 }`}
//                 onClick={() => onRoleChange("entrepreneur")}
//                 type="button"
//               >
//                 Entrepreneur
//               </button>
//               <button
//                 className={`text-sm font-medium pb-2 ${
//                   role === "investor"
//                     ? "border-b-2 border-orange-500 text-orange-500"
//                     : "text-gray-500"
//                 }`}
//                 onClick={() => onRoleChange("investor")}
//                 type="button"
//               >
//                 Investor
//               </button>
//             </div>
//             <form onSubmit={validateForm(onSubmit)} className="space-y-4">
//               {step === 1 && (
//                 <>
//                   <div>
//                     <Input 
//                       type="text" 
//                       placeholder="Full Name" 
//                       {...register("name", {
//                         required: true,
//                         minLength: 5,
//                         pattern: /^[A-Z][a-zA-Z]*$/
//                       })}
//                     />
//                     {errors.name?.type === "required" && (
//                       <p className="text-red-500 text-xs mt-1">Please enter your name</p>
//                     )}
//                     {errors.name?.type === "minLength" && (
//                       <p className="text-red-500 text-xs mt-1">Name must be at least 5 characters</p>
//                     )}
//                     {errors.name?.type === "pattern" && (
//                       <p className="text-red-500 text-xs mt-1">Name must start with a capital letter and contain only letters</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <Input 
//                       type="text" 
//                       placeholder="Email Address" 
//                       {...register("email", {
//                         required: true,
//                         pattern: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.com$/
//                       })}
//                     />
//                     {errors.email?.type === "required" && (
//                       <p className="text-red-500 text-xs mt-1">Please enter your email</p>
//                     )}
//                     {errors.email?.type === "pattern" && (
//                       <p className="text-red-500 text-xs mt-1">Email must end with .com and cannot contain spaces or special characters</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <Input 
//                       type="password" 
//                       placeholder="Enter Password" 
//                       {...register("password", {
//                         required: true,
//                         minLength: 8,
//                         maxLength: 16,
//                         pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?!.*\s).{8,16}$/
//                       })}
//                     />
//                     {errors.password?.type === "required" && (
//                       <p className="text-red-500 text-xs mt-1">Please enter a password</p>
//                     )}
//                     {errors.password?.type === "minLength" || errors.password?.type === "maxLength" && (
//                       <p className="text-red-500 text-xs mt-1">Password must be between 8-16 characters</p>
//                     )}
//                     {errors.password?.type === "pattern" && (
//                       <p className="text-red-500 text-xs mt-1">Password must contain uppercase, lowercase, number, special character, and no spaces</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <Input 
//                       type="password" 
//                       placeholder="Confirm Password" 
//                       {...register("confirmPassword", {
//                         required: true,
//                         validate: (value) => value === password || "Passwords do not match"
//                       })}
//                     />
//                     {errors.confirmPassword?.type === "required" && (
//                       <p className="text-red-500 text-xs mt-1">Please confirm your password</p>
//                     )}
//                     {errors.confirmPassword?.type === "validate" && (
//                       <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
//                     )}
//                   </div>
                  
//                   {role === "investor" ? (
//                     <Button 
//                       type="button"
//                       className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full" 
//                       onClick={goToNextStep}
//                     >
//                       Next
//                     </Button>
//                   ) : (
//                     <Button
//                       type="submit"
//                       className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? (
//                         <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
//                       ) : (
//                         "Register"
//                       )}
//                     </Button>
//                   )}
//                 </>
//               )}
              
//               {role === "investor" && step === 2 && (
//                 <>
//                   <div>
//                     <Input 
//                       type="text" 
//                       placeholder="Company Name" 
//                       {...register("companyName", {
//                         required: true,
//                         minLength: 5,
//                         pattern: /^[a-zA-Z]+$/
//                       })}
//                     />
//                     {errors.companyName?.type === "required" && (
//                       <p className="text-red-500 text-xs mt-1">Please enter company name</p>
//                     )}
//                     {errors.companyName?.type === "minLength" && (
//                       <p className="text-red-500 text-xs mt-1">Company name must be at least 5 characters</p>
//                     )}
//                     {errors.companyName?.type === "pattern" && (
//                       <p className="text-red-500 text-xs mt-1">Company name must contain only letters</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <Input 
//                       type="text" 
//                       placeholder="Year Founded" 
//                       {...register("companyFounded", {
//                         required: true,
//                         pattern: /^(19[0-9][0-9]|20[0-1][0-9]|202[0-5])$/
//                       })}
//                     />
//                     {errors.companyFounded?.type === "required" && (
//                       <p className="text-red-500 text-xs mt-1">Please enter founding year</p>
//                     )}
//                     {errors.companyFounded?.type === "pattern" && (
//                       <p className="text-red-500 text-xs mt-1">Year must be between 1900-2025 with 4 digits</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <Input 
//                       type="text" 
//                       placeholder="Business Registration Number" 
//                       {...register("businessRegNumber", {
//                         required: true,
//                         minLength: 5,
//                         maxLength: 8,
//                         pattern: /^\S{5,8}$/
//                       })}
//                     />
//                     {errors.businessRegNumber?.type === "required" && (
//                       <p className="text-red-500 text-xs mt-1">Please enter registration number</p>
//                     )}
//                     {errors.businessRegNumber?.type === "minLength" || errors.businessRegNumber?.type === "maxLength" && (
//                       <p className="text-red-500 text-xs mt-1">Registration number must be between 5-8 characters</p>
//                     )}
//                     {errors.businessRegNumber?.type === "pattern" && (
//                       <p className="text-red-500 text-xs mt-1">Registration number cannot contain spaces</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <Input 
//                       type="text" 
//                       placeholder="Contact Number" 
//                       {...register("contactNumber", {
//                         required: true,
//                         pattern: /^[6789]\d{9}$/
//                       })}
//                     />
//                     {errors.contactNumber?.type === "required" && (
//                       <p className="text-red-500 text-xs mt-1">Please enter contact number</p>
//                     )}
//                     {errors.contactNumber?.type === "pattern" && (
//                       <p className="text-red-500 text-xs mt-1">Contact number must start with 6, 7, 8, or 9 and be 10 digits</p>
//                     )}
//                   </div>
                  
//                   <Button
//                     type="submit"
//                     className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
//                     ) : (
//                       "Register"
//                     )}
//                   </Button>
//                 </>
//               )}
//             </form>
//             <Separator />
//             <div className="text-center text-sm text-gray-500">
//               Already have an account?{" "}
//               <a href="/signin" className="text-blue-600 hover:underline">
//                 Log In
//               </a>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }




import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import authService from "../../services/user/authService";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import buinessIMg from "../../assets/business.jpg";
import Dark from "../../assets/dark.jpg";
import { useTheme } from "../theme-provider";

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

  const { theme } = useTheme();

  const { 
    register, 
    handleSubmit: validateForm, 
    formState: { errors }, 
    watch, 
    trigger,
    reset
  } = useForm<RegisterCredentials>({
    mode: "onChange",
    defaultValues: {
      role: "entrepreneur"
    }
  });

  const password = watch("password");

  const onRoleChange = (newRole: "entrepreneur" | "investor") => {
    setRole(newRole);
    reset({ ...watch(), role: newRole });
  };

  const goToNextStep = async () => {
    const isValid = await trigger(["name", "email", "password", "confirmPassword"]);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: RegisterCredentials) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Remove FormData and investmentHistory
      const signupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        companyFounded: data.companyFounded,
        businessRegNumber: data.businessRegNumber,
        contactNumber: data.contactNumber,
        role: data.role
      };

      setErrorMessage("");
      setSuccessMessage("");

      console.log("Signup Data:", signupData);

      await authService.sendOtp(signupData, data.role);

      setSuccessMessage("OTP Sent Successfully 🎉");
      navigate("/otp");
    } catch (error) {
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
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
        {/* Left Side - Register Form */}
        <Card className="w-full p-8 border-none bg-white dark:bg-gray-800">
          <CardContent className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Create Account
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Connect with professionals, investors & community
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex justify-center gap-6 border-b pb-2">
              <button
                className={`text-sm font-medium pb-2 ${
                  role === "entrepreneur"
                    ? "border-b-2 border-primary text-primary dark:border-primary dark:text-primary"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => onRoleChange("entrepreneur")}
                type="button"
              >
                Entrepreneur
              </button>
              <button
                className={`text-sm font-medium pb-2 ${
                  role === "investor"
                    ? "border-b-2 border-primary text-primary dark:border-primary dark:text-primary"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => onRoleChange("investor")}
                type="button"
              >
                Investor
              </button>
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

            <form onSubmit={validateForm(onSubmit)} className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Full Name" 
                      {...register("name", {
                        required: true,
                        minLength: 5,
                        pattern: /^[A-Z][a-zA-Z]*$/
                      })}
                      className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                    />
                    {errors.name?.type === "required" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Please enter your name</p>
                    )}
                    {errors.name?.type === "minLength" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Name must be at least 5 characters</p>
                    )}
                    {errors.name?.type === "pattern" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Name must start with a capital letter and contain only letters</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      type="text" 
                      placeholder="rishad@gmail.com" 
                      {...register("email", {
                        required: true,
                        pattern: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.com$/
                      })}
                      className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                    />
                    {errors.email?.type === "required" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Please enter your email</p>
                    )}
                    {errors.email?.type === "pattern" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Email must end with .com and cannot contain spaces or special characters</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...register("password", {
                        required: true,
                        minLength: 8,
                        maxLength: 16,
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?!.*\s).{8,16}$/
                      })}
                      className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                    />
                    {errors.password?.type === "required" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Please enter a password</p>
                    )}
                    {errors.password?.type === "minLength" || errors.password?.type === "maxLength" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Password must be between 8-16 characters</p>
                    )}
                    {errors.password?.type === "pattern" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Password must contain uppercase, lowercase, number, special character, and no spaces</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...register("confirmPassword", {
                        required: true,
                        validate: (value) => value === password || "Passwords do not match"
                      })}
                      className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                    />
                    {errors.confirmPassword?.type === "required" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Please confirm your password</p>
                    )}
                    {errors.confirmPassword?.type === "validate" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>
                  
                  {role === "investor" ? (
                    <Button 
                      type="button"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 rounded-lg py-2"
                      onClick={goToNextStep}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 rounded-lg py-2 flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  )}
                </>
              )}
              
              {role === "investor" && step === 2 && (
                <>
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Company Name" 
                      {...register("companyName", {
                        required: true,
                        minLength: 5,
                        pattern: /^[a-zA-Z]+$/
                      })}
                      className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                    />
                    {errors.companyName?.type === "required" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Please enter company name</p>
                    )}
                    {errors.companyName?.type === "minLength" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Company name must be at least 5 characters</p>
                    )}
                    {errors.companyName?.type === "pattern" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Company name must contain only letters</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Year Founded" 
                      {...register("companyFounded", {
                        required: true,
                        pattern: /^(19[0-9][0-9]|20[0-1][0-9]|202[0-5])$/
                      })}
                      className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                    />
                    {errors.companyFounded?.type === "required" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Please enter founding year</p>
                    )}
                    {errors.companyFounded?.type === "pattern" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Year must be between 1900-2025 with 4 digits</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Business Registration Number" 
                      {...register("businessRegNumber", {
                        required: true,
                        minLength: 5,
                        maxLength: 8,
                        pattern: /^\S{5,8}$/
                      })}
                      className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                    />
                    {errors.businessRegNumber?.type === "required" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Please enter registration number</p>
                    )}
                    {errors.businessRegNumber?.type === "minLength" || errors.businessRegNumber?.type === "maxLength" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Registration number must be between 5-8 characters</p>
                    )}
                    {errors.businessRegNumber?.type === "pattern" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Registration number cannot contain spaces</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Contact Number" 
                      {...register("contactNumber", {
                        required: true,
                        pattern: /^[6789]\d{9}$/
                      })}
                      className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary"
                    />
                    {errors.contactNumber?.type === "required" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Please enter contact number</p>
                    )}
                    {errors.contactNumber?.type === "pattern" && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">Contact number must start with 6, 7, 8, or 9 and be 10 digits</p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 rounded-lg py-2 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </>
              )}
            </form>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <a href="/signin" className="text-primary hover:underline dark:text-primary">
                Log In
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
            src={theme === "dark" ? buinessIMg : buinessIMg}
            alt="Register Illustration"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}