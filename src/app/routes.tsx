import { createBrowserRouter, Navigate } from "react-router";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";

const isAuthenticated = () => {
  return localStorage.getItem("currentUser") !== null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);