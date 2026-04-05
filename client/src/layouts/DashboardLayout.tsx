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
        color="indigo"
        variant="light"
        className="rounded-2xl font-semibold min-h-12 transition-all"
        onClick={close}
      />
      <NavLink
        label="Artists"
        component={Link}
        to="/dashboard?tab=artists"
        active={activeTab === "artists"}
        color="indigo"
        variant="light"
        className="rounded-2xl font-semibold min-h-12 transition-all"
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
          "border-r border-white/40 bg-white/40 backdrop-blur-2xl shadow-[4px_0_24px_rgb(0,0,0,0.02)]",
        header:
          "border-b border-white/40 bg-white/40 backdrop-blur-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)]",
        main: "bg-transparent min-w-0",
      }}
    >
      <AppShell.Navbar p={0}>
        <Stack h="100%" py={{ base: "md", sm: "lg" }} px="md" gap="md" justify="space-between">
          <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-500/10 via-white/50 to-cyan-500/10 p-3 shadow-sm sm:rounded-3xl sm:p-5">
            <Text fw={900} size="lg" className="tracking-tight text-slate-800">
              AMS Admin
            </Text>
            <Text size="xs" className="mt-1 font-medium leading-relaxed text-slate-500">
              Artist Management Workspace
            </Text>
          </div>

          <Box component="nav" flex={1} style={{ minHeight: 0 }}>
            {/* <Text
              size="xs"
              fw={700}
              tt="uppercase"
              className="tracking-wider text-zinc-400 px-1 mb-1"
            >
              Navigate
            </Text> */}
            <Flex direction="column" gap={6}>
              {navLinks}
            </Flex>
          </Box>

          <div className="rounded-3xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-md">
            <Text size="sm" fw={800} className="truncate text-slate-800">
              {user ? `${user.first_name} ${user.last_name}` : "Admin"}
            </Text>
            <Group gap="xs" mt={6} mb="md">
              {user ? (
                <Badge variant="gradient" gradient={{ from: 'indigo.4', to: 'cyan.4', deg: 90 }} size="sm" className="capitalize shrink-0 shadow-sm border-0">
                  {user.role.replace("_", " ")}
                </Badge>
              ) : null}
            </Group>
            <Button
              color="red"
              variant="light"
              fullWidth
              size="md"
              loading={loggingOut}
              onClick={doLogout}
              className="rounded-2xl font-bold min-h-12 hover:bg-red-50 hover:-translate-y-0.5 transition-all"
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
