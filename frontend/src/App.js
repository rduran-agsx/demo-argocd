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
import { ProviderProvider } from "./contexts/ProviderContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainPage from "./MainPage";
import Auth from "./pages/Auth";
import PremiumPage from "./pages/PremiumPage";
import theme from "./theme";

const LoadingSpinner = () => (
  <Center height="100vh">
    <Spinner size="xl" />
  </Center>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    sessionStorage.setItem("auth_redirect", location.pathname);

    return <Navigate to="/auth" replace={true} state={{ from: location }} />;
  }

  return children;
};

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

                {/* Premium route */}
                <Route
                  path="/premium"
                  element={
                    <ProtectedRoute>
                      <PremiumPage />
                    </ProtectedRoute>
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