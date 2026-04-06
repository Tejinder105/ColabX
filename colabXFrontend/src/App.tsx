import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router-dom";
import LandingPage from "./pages/public/landing";
import OnboardingPage from "./pages/public/onboarding";
import DashboardPage from "./pages/dashboard";
import PartnersPage from "./pages/dashboard/partners";
import PartnerDetailsPage from "./pages/dashboard/partners/details";
import MyPartnershipPage from "./pages/dashboard/my-partnership";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "./components/login-form";
import { SignupForm } from "./components/signup-form";
import AuthPage from "./pages/public/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";
import TeamsPage from "./pages/teams";
import TeamDetailsPage from "./pages/teams/details";
import OkrsPage from "./pages/okrs";
import DealsPage from "./pages/deals";
import DocumentsPage from "./pages/documents";
import ReportsPage from "./pages/reports";
import SettingsPage from "./pages/settings";
import SupportPage from "./pages/support";
import FeedbackPage from "./pages/feedback";
import { Toaster } from "sonner";
import { useAuthStore } from "./stores/authStore";

// RBAC Route Guards

/** Admin-only pages (Settings, User Management) */
function AdminOnlyGuard({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((state) => state.activeOrg?.role);

  if (role && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/** Admin + Manager pages (Partners list, Teams, Reports) */
function ManagerGuard({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((state) => state.activeOrg?.role);

  if (role === "partner") {
    return <Navigate to="/my-partnership" replace />;
  }

  return <>{children}</>;
}

/** Partner-only page (My Partnership) */
function PartnerOnlyGuard({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((state) => state.activeOrg?.role);

  if (role && role !== "partner") {
    return <Navigate to="/partners" replace />;
  }

  return <>{children}</>;
}

/** Dashboard access guard - partners redirect to /my-partnership */
function DashboardGuard({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((state) => state.activeOrg?.role);

  if (role === "partner") {
    return <Navigate to="/my-partnership" replace />;
  }

  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  // Catch better-auth error redirects that land on the frontend
  {
    path: "/api/auth/error",
    element: <Navigate to="/auth/login?error=auth_failed" replace />,
  },
  // Redirect /login and /signup to /auth/*
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: "/signup",
    element: <Navigate to="/auth/signup" replace />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
    children: [
      {
        path: "login",
        element: <LoginForm />,
      },
      {
        path: "signup",
        element: <SignupForm />,
      },
      {
        path: "error",
        element: <Navigate to="/auth/login?error=auth_failed" replace />,
      },
    ],
  },
  {
    // Require auth but not an org — users land here after signup
    path: "/onboarding",
    element: (
      <ProtectedRoute requireOrg={false}>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  // All protected dashboard routes share a single ProtectedRoute + DashboardLayout
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: (
          <DashboardGuard>
            <DashboardPage />
          </DashboardGuard>
        ),
      },
      // Admin + Manager: Partner management
      {
        path: "/partners",
        element: (
          <ManagerGuard>
            <PartnersPage />
          </ManagerGuard>
        ),
      },
      {
        path: "/partners/:id",
        element: (
          <ManagerGuard>
            <PartnerDetailsPage />
          </ManagerGuard>
        ),
      },
      // Partner only: Self view
      {
        path: "/my-partnership",
        element: (
          <PartnerOnlyGuard>
            <MyPartnershipPage />
          </PartnerOnlyGuard>
        ),
      },
      // Admin + Manager: Teams
      {
        path: "/teams",
        element: (
          <ManagerGuard>
            <TeamsPage />
          </ManagerGuard>
        ),
      },
      {
        path: "/teams/:id",
        element: (
          <ManagerGuard>
            <TeamDetailsPage />
          </ManagerGuard>
        ),
      },
      // All roles: OKRs, Deals, Documents
      {
        path: "/okrs",
        element: <OkrsPage />,
      },
      {
        path: "/deals",
        element: <DealsPage />,
      },
      {
        path: "/documents",
        element: <DocumentsPage />,
      },
      // Admin + Manager: Reports
      {
        path: "/reports",
        element: (
          <ManagerGuard>
            <ReportsPage />
          </ManagerGuard>
        ),
      },
      // Admin only: Organization Settings
      {
        path: "/settings",
        element: (
          <AdminOnlyGuard>
            <SettingsPage />
          </AdminOnlyGuard>
        ),
      },
      // All roles: Support & Feedback
      {
        path: "/support",
        element: <SupportPage />,
      },
      {
        path: "/feedback",
        element: <FeedbackPage />,
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}

export default App
