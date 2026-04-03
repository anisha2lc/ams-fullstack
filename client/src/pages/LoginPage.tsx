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
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-8 sm:p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute -right-20 bottom-5 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl sm:bottom-10 sm:h-80 sm:w-80" />
      </div>

      <Paper
        className="relative w-full max-w-md border border-zinc-200/80 bg-white/95 shadow-xl shadow-zinc-900/10 backdrop-blur-xl"
        radius="xl"
        p="xl"
        withBorder
      >
        <Stack gap="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-base font-black text-white shadow-lg shadow-teal-600/25 sm:h-12 sm:w-12 sm:text-lg">
              A
            </div>
            <div>
              <Title order={2} className="text-zinc-900 tracking-tight">
                Admin sign in
              </Title>
              <Text size="sm" className="mt-1 text-zinc-600 leading-relaxed">
                Sign in to manage users, artists, and song catalogs.
              </Text>
            </div>
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
              <Button type="submit" fullWidth mt="md" size="md" radius="md" color="teal" className="min-h-11 font-semibold shadow-md shadow-teal-600/20">
                Sign in
              </Button>
            </Stack>
          </form>
          <Text size="sm" ta="center" className="text-zinc-500">
            New admin?{" "}
            <Anchor component={Link} to="/register" size="sm" fw={600} className="text-teal-700">
              Create an account
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </div>
  );
}
