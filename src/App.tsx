import React from "react";
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BookingProvider } from "./contexts/BookingContext";
import { PayrollProvider } from "./contexts/PayrollContext";
import { MessagingProvider } from "./contexts/MessagingContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { I18nProvider } from "./contexts/LanguageContext";
import { ToastProvider } from "./contexts/ToastContext";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";

// Public Pages
import { LandingPage } from "./pages/public/LandingPage";
import { TermsPage } from "./pages/public/TermsPage";
import { PrivacyPage } from "./pages/public/PrivacyPage";
import { CookiePage } from "./pages/public/CookiePage";

// Admin Pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminBookingsPage } from "./pages/admin/AdminBookingsPage";
import { AdminPaymentsPage } from "./pages/admin/AdminPaymentsPage";
import { AdminApprovalsPage } from "./pages/admin/AdminApprovalsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminPayrollPage } from "./pages/admin/AdminPayrollPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminTestimonialsPage } from "./pages/admin/AdminTestimonialsPage";
import { AdminReservationsPage } from "./pages/admin/AdminReservationsPage";

// Ustaadh Pages
import { UstaadhDashboardPage } from "./pages/ustaadh/UstaadhDashboardPage";
import { UstaadhSchedulePage } from "./pages/ustaadh/UstaadhSchedulePage";
import { UstaadhStudentsPage } from "./pages/ustaadh/UstaadhStudentsPage";
import { UstaadhEarningsPage } from "./pages/ustaadh/UstaadhEarningsPage";

// Student Pages
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage";
import { StudentBrowsePage } from "./pages/student/StudentBrowsePage";
import { StudentLessonsPage } from "./pages/student/StudentLessonsPage";
import { StudentPaymentsPage } from "./pages/student/StudentPaymentsPage";

// Shared Pages
import { MessagesPage } from "./pages/shared/MessagesPage";
import { ProfilePage } from "./pages/shared/ProfilePage";
import { SuspendedPage } from "./pages/shared/SuspendedPage";

// Layout Components
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { PublicLayout } from "./components/layout/PublicLayout";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  return null;
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <PublicLayout>
              <RegisterPage />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/verify-email"
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <PublicLayout>
              <VerifyEmailPage />
            </PublicLayout>
          )
        }
      />

      {/* Legal */}
      <Route
        path="/terms"
        element={
          <PublicLayout>
            <TermsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/privacy"
        element={
          <PublicLayout>
            <PrivacyPage />
          </PublicLayout>
        }
      />
      <Route
        path="/cookies"
        element={
          <PublicLayout>
            <CookiePage />
          </PublicLayout>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminUsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminBookingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminPaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminApprovalsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminReportsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminSettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/testimonials"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminTestimonialsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payroll"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminPayrollPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Ustaadh Routes */}
      <Route
        path="/ustaadh"
        element={
          <ProtectedRoute allowedRoles={["ustaadh"]}>
            <DashboardLayout>
              <UstaadhDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ustaadh/schedule"
        element={
          <ProtectedRoute allowedRoles={["ustaadh"]}>
            <DashboardLayout>
              <UstaadhSchedulePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ustaadh/students"
        element={
          <ProtectedRoute allowedRoles={["ustaadh"]}>
            <DashboardLayout>
              <UstaadhStudentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ustaadh/earnings"
        element={
          <ProtectedRoute allowedRoles={["ustaadh"]}>
            <DashboardLayout>
              <UstaadhEarningsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/browse"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentBrowsePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/lessons"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentLessonsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/payments"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentPaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route path="/suspended" element={<SuspendedPage />} />
      <Route
        path="/messages"
        element={
          <ProtectedRoute allowedRoles={["admin", "ustaadh", "student"]}>
            <DashboardLayout>
              <MessagesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["admin", "ustaadh", "student"]}>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <PayrollProvider>
          <ToastProvider>
            <MessagingProvider>
              <NotificationsProvider>
                <I18nProvider>
                  <Router>
                    <ScrollToTop />
                    <AppRoutes />
                  </Router>
                </I18nProvider>
              </NotificationsProvider>
            </MessagingProvider>
          </ToastProvider>
        </PayrollProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
