import React from "react";
import {
  ChakraProvider,
  ColorModeScript,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ProviderProvider } from "./ProviderContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainPage from "./MainPage";
import Auth from "./pages/Auth";
import theme from "./theme";

// Loading spinner component
const LoadingSpinner = () => (
  <Center height="100vh">
    <Spinner size="xl" />
  </Center>
);

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    // Store the attempted URL
    sessionStorage.setItem("auth_redirect", location.pathname);

    return <Navigate to="/auth" replace={true} state={{ from: location }} />;
  }

  return children;
};

// Public Route wrapper to prevent authenticated users from accessing auth page
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    const redirect = sessionStorage.getItem("auth_redirect") || "/";
    sessionStorage.removeItem("auth_redirect");
    return <Navigate to={redirect} replace={true} />;
  }

  return children;
};

const App = () => {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <ProviderProvider>
            <Router>
              <Routes>
                {/* Public auth route with wrapper */}
                <Route
                  path="/auth"
                  element={
                    <PublicRoute>
                      <Auth />
                    </PublicRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/providers"
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exams"
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/custom-exam"
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/actual-exam"
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/actual-exam/:examId"
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  }
                />

                {/* Redirect unknown routes to home if authenticated, auth if not */}
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/" replace />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </ProviderProvider>
        </AuthProvider>
      </ChakraProvider>
    </>
  );
};

export default App;
