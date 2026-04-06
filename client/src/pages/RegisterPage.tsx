import { zodResolver } from "mantine-form-zod-resolver";
import {
  Anchor,
  Grid,
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

const roleOptions = [{ value: "artist", label: "Artist" }];

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
    <>
      <div className="login-root">
        <div className="glow-a" />
        <div className="glow-b" />

        {/* Wider card for register */}
        <div className="login-card" style={{ maxWidth: 560, padding: "2.5rem 2.25rem" }}>
          {/* Decorative accents */}
          <div className="card-accent" />
          <div className="corner-tl" />
          <div className="corner-br" />

          <Stack gap="lg">
            {/* Header */}
            <div className="header-block">
              <div className="monogram-wrap">
                <div className="monogram-ring" />
                <div className="monogram-pulse" />
                <div className="monogram-core">A</div>
              </div>
              <div style={{ paddingTop: 2 }}>
                <Title order={2} className="headline">
                  Create account
                </Title>
                <Text className="subline">
                  Register a new admin or artist manager
                </Text>
              </div>
            </div>

            {/* Section label */}
            <div className="section-label">account details</div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <Stack gap="sm">
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="First name"
                      placeholder="Jane"
                      required
                      key={form.key("first_name")}
                      {...form.getInputProps("first_name")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Last name"
                      placeholder="Doe"
                      required
                      key={form.key("last_name")}
                      {...form.getInputProps("last_name")}
                    />
                  </Grid.Col>
                </Grid>

                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
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

                <TextInput
                  label="Phone"
                  placeholder="9876543210"
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
                  placeholder="123 Main St, City"
                  required
                  key={form.key("address")}
                  {...form.getInputProps("address")}
                />

                <Select
                  label="Role"
                  description="Defaults to artist manager if omitted"
                  data={roleOptions}
                  key={form.key("role")}
                  {...form.getInputProps("role")}
                />

                <button
                  type="submit"
                  className="submit-btn"
                  style={{ width: "100%", marginTop: "1rem", cursor: "pointer" }}
                >
                  Create Account
                </button>
              </Stack>
            </form>

            {/* Footer */}
            <Text ta="center" className="login-footer">
              Already have an account?{" "}
              <Anchor component={Link} to="/login">
                Sign in
              </Anchor>
            </Text>
          </Stack>
        </div>
      </div>
    </>
  );
}
