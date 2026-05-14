import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/useAuthStore";
import useNotificationStore from "./store/useNotificationStore";

import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import DashboardPage from "./pages/DashboardPage";
import RequestBoardPage from "./pages/RequestBoardPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import PostRequestPage from "./pages/PostRequestPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import SessionRoomPage from "./pages/SessionRoomPage";
import MySessionsPage from "./pages/MySessionsPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import MyProfilePage from "./pages/MyProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import CreditWalletPage from "./pages/CreditWalletPage";
import TutorSessionPrepPage from "./pages/TutorSessionPrepPage";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { token, fetchMe } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (token) {
      fetchMe();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <ProtectedRoute>
            <VerifyOtpPage />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/requests" element={<RequestBoardPage />} />
        <Route path="/requests/new" element={<PostRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/sessions" element={<MySessionsPage />} />
        <Route path="/sessions/:id" element={<SessionRoomPage />} />
        <Route path="/tutor/sessions/:id/prep" element={<TutorSessionPrepPage />} />
        <Route path="/tutor/sessions/:id" element={<SessionRoomPage />} />
        <Route path="/tutors/:id" element={<TutorProfilePage />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/wallet" element={<CreditWalletPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
