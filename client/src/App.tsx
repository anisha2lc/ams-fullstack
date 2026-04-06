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

// Theme matching the reference repo: blue/teal palette, clean professional look
const theme = createTheme({
  colors: {
    primary: [
      "#e3f2fd",
      "#bbdefb",
      "#90caf9",
      "#64b5f6",
      "#42a5f5",
      "#2196f3",
      "#1e88e5",
      "#1976d2",
      "#1565c0",
      "#0d47a1",
    ],
  },
  primaryColor: "teal",
  fontFamily: "'Inter', system-ui, sans-serif",
  headings: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontWeight: "600",
  },
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: { radius: "md" },
    },
    TextInput: { defaultProps: { radius: "md" } },
    PasswordInput: { defaultProps: { radius: "md" } },
    NumberInput: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md" } },
    Card: { defaultProps: { radius: "md", shadow: "sm", withBorder: true } },
    Paper: { defaultProps: { radius: "md", shadow: "sm" } },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications position="top-right" zIndex={5000} />
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
