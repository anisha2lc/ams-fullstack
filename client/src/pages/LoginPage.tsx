import { zodResolver } from "mantine-form-zod-resolver";
import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getErrorMessage } from "@/api/http";
import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/lib/schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname ??
    "/dashboard";

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
    validate: zodResolver(loginSchema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      notifications.show({
        title: "Welcome back",
        message: "You are signed in.",
        color: "teal",
      });
      navigate(from, { replace: true });
    } catch (e) {
      notifications.show({
        title: "Sign in failed",
        message: getErrorMessage(e, "Invalid email or password"),
        color: "red",
      });
    }
  });

  return (
    <>
      <div className="login-root">
        <div className="glow-a" />
        <div className="glow-b" />

        <div className="login-card">
          <div className="card-accent" />
          <div className="corner-tl" />
          <div className="corner-br" />

          <Stack gap="lg">
            <div className="header-block">
              <div className="monogram-wrap">
                <div className="monogram-ring" />
                <div className="monogram-pulse" />
                <div className="monogram-core">A</div>
              </div>
              <div style={{ paddingTop: 2 }}>
                <Title order={2} className="headline">
                  Admin sign in
                </Title>
                <Text className="subline">
                  Manage users, artists &amp; song catalogs
                </Text>
              </div>
            </div>

            <div className="section-label">credentials</div>

            <form onSubmit={handleSubmit} className="login-form">
              <Stack gap="sm">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  required
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Password"
                  required
                  key={form.key("password")}
                  {...form.getInputProps("password")}
                />
                <button
                  type="submit"
                  className="submit-btn"
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              </Stack>
            </form>

            <Text ta="center" className="login-footer">
              New admin?{" "}
              <Anchor component={Link} to="/register">
                Create an account
              </Anchor>
            </Text>
          </Stack>
        </div>
      </div>
    </>
  );
}