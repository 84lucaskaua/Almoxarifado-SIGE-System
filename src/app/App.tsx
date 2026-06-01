import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";
import { suppressRechartsWarnings } from "./utils/suppressRechartsWarnings";

export default function App() {
  // Suprimir warnings conhecidos do Recharts
  useEffect(() => {
    suppressRechartsWarnings();
  }, []);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}