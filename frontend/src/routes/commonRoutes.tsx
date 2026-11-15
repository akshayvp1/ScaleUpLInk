// src/routes/commonRoutes.tsx

import { Routes, Route } from "react-router-dom";

import SignIn from "../pages/auth/signIn";
import SignUp from "../pages/auth/signUp";
import Otp from "../pages/auth/otp";
import Role from "../pages/auth/role";
import Profession from "../pages/enterpreneur/profession";
import ChooseInterest from "../pages/auth/chooseInterest";
import ForgotPassword from "../pages/auth/forgotPassword";
import ForgotPasswordOtp from "../pages/auth/forgotPasswordOtp";
import CreateNewPassword from "../pages/auth/createNewPassword";

import ProtectedRoute from "./protectedRoute";
import AntiProtectedRoute from "./antiProtectedRoute";

import DashboardLayout from "../components/layouts/DashboardLayout";

import HomePage from "../pages/enterpreneur/HomePage";
import FeedsPage from "../pages/enterpreneur/FeedsPage";
import EventCard from "../pages/common/EventsCard";
import EventCreation from "../pages/common/EventCreation";
import NewsFeed from "../pages/basics/newsFeed";

import Checkout from "../pages/enterpreneur/checkOutPage"; // <-- verify this path
import PaymentDetails from "../pages/common/PaymentDetails";
import Profile from "../pages/enterpreneur/profile";
import SearchUser from "../pages/common/Search";
import Investors from "../pages/common/Investors";
import UserProfileData from "../pages/common/UserProfile";
import Notification from "../pages/common/NotificationsPage";
import PostShareDetail from "../components/basics/PostShareDetail";
import Chat from "../components/chat/chat";

function CommonRoutes() {
  return (
    <Routes>
      {/* =======================
          PUBLIC ROUTES
      ======================== */}

      <Route
        path="/"
        element={
          <AntiProtectedRoute>
            <SignIn />
          </AntiProtectedRoute>
        }
      />

      <Route
        path="/signin"
        element={
          <AntiProtectedRoute>
            <SignIn />
          </AntiProtectedRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <AntiProtectedRoute>
            <SignUp />
          </AntiProtectedRoute>
        }
      />

      <Route
        path="/otp"
        element={
          <AntiProtectedRoute>
            <Otp />
          </AntiProtectedRoute>
        }
      />

      <Route
        path="/role"
        element={
          <AntiProtectedRoute>
            <Role />
          </AntiProtectedRoute>
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password-otp" element={<ForgotPasswordOtp />} />
      <Route path="/create-new-password" element={<CreateNewPassword />} />

      {/* =======================
          PROTECTED ROUTES
      ======================== */}

      <Route
        element={<ProtectedRoute allowedRoles={["entrepreneur", "investor"]} />}
      >
        <Route element={<DashboardLayout />}>
          {/* Dashboard Pages */}
          <Route path="/notification" element={<Notification />} />
          <Route path="/search" element={<SearchUser />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/profile/:id" element={<UserProfileData />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/feeds" element={<FeedsPage />} />
          <Route path="/events" element={<EventCard />} />
          <Route path="/event-create" element={<EventCreation />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/profession" element={<Profession />} />
          <Route path="/choose-interest" element={<ChooseInterest />} />

          <Route
            path="/profile"
            element={
              <AntiProtectedRoute>
                <Profile />
              </AntiProtectedRoute>
            }
          />

          {/* Checkout Pages */}
          <Route path="/checkout/checkout" element={<Checkout />} />
          <Route
            path="/checkout/booking/:bookingId"
            element={<PaymentDetails />}
          />
          <Route path="/post/:postId/share" element={<PostShareDetail />} />
          <Route path="/post/:postId" element={<PostShareDetail />} />

          <Route path="/chat" element={<Chat />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default CommonRoutes;
