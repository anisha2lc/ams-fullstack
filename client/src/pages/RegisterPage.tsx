import { zodResolver } from "mantine-form-zod-resolver";
import {
  Anchor,
  Button,
  Grid,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/api/http";
import * as authApi from "@/api/auth.api";
import { registerSchema } from "@/lib/schemas";

const genderOptions = [
  { value: "m", label: "Male" },
  { value: "f", label: "Female" },
  { value: "o", label: "Other" },
];

const roleOptions = [
  { value: "artist_manager", label: "Artist manager" },
  { value: "super_admin", label: "Super admin" },
  { value: "artist", label: "Artist" },
];

export function RegisterPage() {
  const navigate = useNavigate();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      dob: "",
      gender: "m" as "m" | "f" | "o",
      address: "",
      role: "artist_manager" as "super_admin" | "artist_manager" | "artist",
    },
    validate: zodResolver(registerSchema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await authApi.register({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        dob: values.dob,
        gender: values.gender,
        address: values.address,
        role: values.role,
      });
      notifications.show({
        title: "Account created",
        message: "You can sign in now.",
        color: "teal",
      });
      navigate("/login", { replace: true });
    } catch (e) {
      notifications.show({
        title: "Registration failed",
        message: getErrorMessage(e),
        color: "red",
      });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-6 py-12">
      <Paper
        className="w-full max-w-2xl border border-slate-200/80 bg-white/90 shadow-xl shadow-indigo-100/50 backdrop-blur-sm"
        radius="lg"
        p="xl"
        withBorder
      >
        <Stack gap="md">
          <div>
            <Title order={2} className="text-slate-800">
              Register admin
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Create your account, then sign in on the next screen.
            </Text>
          </div>
          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <Grid gutter="sm">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="First name"
                    required
                    key={form.key("first_name")}
                    {...form.getInputProps("first_name")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Last name"
                    required
                    key={form.key("last_name")}
                    {...form.getInputProps("last_name")}
                  />
                </Grid.Col>
              </Grid>
              <TextInput
                label="Email"
                type="email"
                required
                key={form.key("email")}
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label="Password"
                required
                key={form.key("password")}
                {...form.getInputProps("password")}
              />
              <TextInput
                label="Phone"
                required
                key={form.key("phone")}
                {...form.getInputProps("phone")}
              />
              <Grid gutter="sm">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Date of birth"
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    key={form.key("dob")}
                    {...form.getInputProps("dob")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Gender"
                    data={genderOptions}
                    required
                    key={form.key("gender")}
                    {...form.getInputProps("gender")}
                  />
                </Grid.Col>
              </Grid>
              <TextInput
                label="Address"
                required
                key={form.key("address")}
                {...form.getInputProps("address")}
              />
              <Select
                label="Role"
                description="Defaults to artist manager if omitted on API"
                data={roleOptions}
                key={form.key("role")}
                {...form.getInputProps("role")}
              />
              <Button type="submit" fullWidth mt="xs" color="indigo">
                Register
              </Button>
            </Stack>
          </form>
          <Text size="sm" ta="center" c="dimmed">
            Already have an account?{" "}
            <Anchor component={Link} to="/login" size="sm" fw={500}>
              Sign in
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </div>
  );
}
