import { zodResolver } from "mantine-form-zod-resolver";
import { Anchor, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
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
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? "/dashboard";

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
    <div className="flex min-h-screen items-center justify-center p-6">
      <Paper
        className="w-full max-w-md border border-slate-200/80 bg-white/90 shadow-xl shadow-indigo-100/50 backdrop-blur-sm"
        radius="lg"
        p="xl"
        withBorder
      >
        <Stack gap="md">
          <div>
            <Title order={2} className="text-slate-800">
              Admin sign in
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Access the artist management dashboard.
            </Text>
          </div>
          <form onSubmit={handleSubmit}>
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
                placeholder="••••••••"
                required
                key={form.key("password")}
                {...form.getInputProps("password")}
              />
              <Button type="submit" fullWidth mt="xs" color="indigo">
                Sign in
              </Button>
            </Stack>
          </form>
          <Text size="sm" ta="center" c="dimmed">
            New admin?{" "}
            <Anchor component={Link} to="/register" size="sm" fw={500}>
              Create an account
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </div>
  );
}
