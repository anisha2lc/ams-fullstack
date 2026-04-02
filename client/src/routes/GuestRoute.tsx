import { Center, Loader } from "@mantine/core";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();

  if (!ready) {
    return (
      <Center className="min-h-screen">
        <Loader color="indigo" />
      </Center>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
