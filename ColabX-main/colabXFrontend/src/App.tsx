import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router-dom";
import LandingPage from "./pages/public/landing";
import OnboardingPage from "./pages/public/onboarding";
import DashboardPage from "./pages/dashboard";
import PartnersPage from "./pages/dashboard/partners";
import PartnerDetailsPage from "./pages/dashboard/partners/details";

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
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
        element: <DashboardPage />,
      },
      {
        path: "/partners",
        element: <PartnersPage />,
      },
      {
        path: "/partners/:id",
        element: <PartnerDetailsPage />,
      },
      {
        path: "/teams",
        element: <TeamsPage />,
      },
      {
        path: "/teams/:id",
        element: <TeamDetailsPage />,
      },
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
      {
        path: "/reports",
        element: <ReportsPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
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
