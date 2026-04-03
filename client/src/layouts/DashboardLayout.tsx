import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  AppShell,
  Badge,
  Box,
  Burger,
  Button,
  Flex,
  Group,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "@/context/AuthContext";

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileNavOpened, { toggle, close }] = useDisclosure();

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    if (tab === "users" || tab === "artists") return tab;
    if (location.pathname.startsWith("/dashboard/artists")) return "artists";
    return "users";
  }, [location.pathname, searchParams]);

  useEffect(() => {
    close();
  }, [location.pathname, location.search, close]);

  const doLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const navLinks = (
    <>
      <NavLink
        label="Users"
        component={Link}
        to="/dashboard?tab=users"
        active={activeTab === "users" && location.pathname === "/dashboard"}
        color="teal"
        variant="light"
        className="rounded-xl font-medium min-h-11"
        onClick={close}
      />
      <NavLink
        label="Artists"
        component={Link}
        to="/dashboard?tab=artists"
        active={activeTab === "artists"}
        color="teal"
        variant="light"
        className="rounded-xl font-medium min-h-11"
        onClick={close}
      />
    </>
  );

  return (
    <AppShell
      padding={{ base: "xs", sm: "md" }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !mobileNavOpened },
      }}
      header={{ height: { base: 56, sm: 64 } }}
      classNames={{
        root: "min-h-[100dvh] bg-transparent",
        navbar:
          "border-r border-zinc-200/90 bg-zinc-50/95 backdrop-blur-xl sm:bg-white/80 supports-[backdrop-filter]:bg-white/70",
        header:
          "border-b border-zinc-200/90 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75",
        main: "bg-transparent min-w-0",
      }}
    >
      <AppShell.Navbar p={0}>
        <Stack h="100%" py={{ base: "md", sm: "lg" }} px="md" gap="md" justify="space-between">
          <div className="rounded-xl border border-teal-200/60 bg-gradient-to-br from-teal-500/12 via-white to-emerald-500/5 p-3 shadow-sm sm:rounded-2xl sm:p-4">
            <Text fw={900} size="md" className="tracking-tight text-zinc-900 sm:text-lg">
              AMS Admin
            </Text>
            <Text size="xs" className="mt-1 leading-relaxed text-zinc-600">
              Artist Management — mobile-friendly workspace.
            </Text>
          </div>

          <Box component="nav" flex={1} style={{ minHeight: 0 }}>
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              className="tracking-wider text-zinc-400 px-1 mb-1"
            >
              Navigate
            </Text>
            <Flex direction="column" gap={6}>
              {navLinks}
            </Flex>
          </Box>

          <div className="rounded-xl border border-zinc-200/90 bg-white/90 p-3 shadow-sm sm:rounded-2xl">
            <Text size="sm" fw={700} className="truncate text-zinc-900">
              {user ? `${user.first_name} ${user.last_name}` : "Admin"}
            </Text>
            <Group gap="xs" mt={6} mb="sm">
              {user ? (
                <Badge variant="light" color="teal" size="sm" className="capitalize shrink-0">
                  {user.role.replace("_", " ")}
                </Badge>
              ) : null}
            </Group>
            <Button
              color="red"
              variant="light"
              fullWidth
              size="sm"
              loading={loggingOut}
              onClick={doLogout}
              className="rounded-xl font-semibold min-h-11"
            >
              Logout
            </Button>
          </div>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Header px={{ base: "sm", sm: "md", lg: "lg" }} className="flex items-center">
        <Group wrap="nowrap" justify="space-between" h="100%" w="100%" gap="sm">
          <Group wrap="nowrap" gap="sm" className="min-w-0 flex-1">
            <Burger
              opened={mobileNavOpened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Open navigation"
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <Text fw={800} className="truncate text-base text-zinc-900 sm:text-lg" component="p">
                {location.pathname.startsWith("/dashboard/artists") ? "Artist songs" : "Dashboard"}
              </Text>
              <Text size="xs" className="hidden text-zinc-500 sm:line-clamp-2 sm:text-sm md:block">
                {location.pathname.startsWith("/dashboard/artists")
                  ? "Tracks for this artist."
                  : "Users, artists, and songs catalog."}
              </Text>
            </div>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main className="px-3 pb-8 pt-3 sm:px-4 md:px-6 lg:pt-4 max-w-full overflow-x-hidden">
        {children ?? <Outlet />}
      </AppShell.Main>
    </AppShell>
  );
}
