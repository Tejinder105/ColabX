
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import LandingPage from "./pages/public/landing";

const router = createBrowserRouter([
  {
    path: "/",
    element:<LandingPage/>,
  },
]);
function App() {

  return (
      <RouterProvider router={router} />
  )
}

export default App
