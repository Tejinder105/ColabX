
import { createBrowserRouter, ScrollRestoration } from "react-router";
import { RouterProvider } from "react-router-dom";
import LandingPage from "./pages/public/landing";

import { LoginForm } from "./components/login-form";
import { SignupForm } from "./components/signup-form";
import AuthPage from "./pages/public/auth";
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,

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
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }
});
function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
