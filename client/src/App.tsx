import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { GuestRoute } from "@/routes/GuestRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ArtistSongsPage } from "@/pages/ArtistSongsPage";
import { DashboardLayout } from "@/layouts/DashboardLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "md",
  fontFamily: "DM Sans, system-ui, sans-serif",
  headings: {
    fontFamily: "DM Sans, system-ui, sans-serif",
    fontWeight: "700",
  },
  defaultGradient: { from: "teal.6", to: "emerald.6", deg: 125 },
  components: {
    Button: { defaultProps: { radius: "md", size: "sm" } },
    TextInput: { defaultProps: { radius: "md", size: "sm" } },
    PasswordInput: { defaultProps: { radius: "md", size: "sm" } },
    Select: { defaultProps: { radius: "md", size: "sm" } },
    Table: { defaultProps: { verticalSpacing: "sm", horizontalSpacing: "md" } },
    Paper: { defaultProps: { radius: "lg", shadow: "sm" } },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications position="top-center" zIndex={10000} />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <DashboardPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/artists/:artistId/songs"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ArtistSongsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

