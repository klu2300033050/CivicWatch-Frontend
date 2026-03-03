import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoaderProvider } from "./contexts/LoaderContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import { LoaderOverlay } from "./LoaderOverlay";
import { Toaster } from "sonner";
import AnimatedRoutes from "./AnimateRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <LoaderProvider>
              <LoaderOverlay />
              <Toaster richColors position="top-right" />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </LoaderProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
