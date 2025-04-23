
import { Routes, Route } from "react-router-dom";
import MainPage from "../pages/mainPage/mainPage";
import SignIn from "../pages/auth/signIn";
import SignUp from "../pages/auth/signUp";
import Otp from "../pages/auth/otp";
import Profession from "../pages/enterpreneur/profession";
import Role from "../pages/auth/role";
import ChooseInterest from "../pages/auth/chooseInterest";
import ForgotPassword from "../pages/auth/forgotPassword";
import ForgotPasswordOtp from "../pages/auth/forgotPasswordOtp";
import CreateNewPassword from "../pages/auth/createNewPassword";
import ProtectedRoute from "../routes/protectedRoute";
import AntiProtectedRoute from "../routes/antiProtectedRoute"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<AntiProtectedRoute><MainPage /></AntiProtectedRoute>} />

      {/* Apply AntiProtectedRoute individually to routes */}
      <Route path="/signin" element={<AntiProtectedRoute><SignIn /></AntiProtectedRoute>} />
      <Route path="/signup" element={<AntiProtectedRoute><SignUp /></AntiProtectedRoute>} />
      <Route path="/otp" element={<AntiProtectedRoute><Otp /></AntiProtectedRoute>} />
      <Route path="/role" element={<AntiProtectedRoute><Role /></AntiProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password-otp" element={<ForgotPasswordOtp />} />
      <Route path="/create-new-password" element={<CreateNewPassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["entrepreneur", "investor"]} />}>
        <Route path="/choose-interest" element={<ChooseInterest />} />
        <Route path="/profession" element={<Profession />} />
      </Route>
    </Routes>
  );
}

export default App;
