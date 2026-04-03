import { useMemo } from "react";
import { Tabs } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { UserManagement } from "@/components/users/UserManagement";
import { ArtistManagement } from "@/components/artists/ArtistManagement";

type DashboardTab = "users" | "artists";

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab: DashboardTab = useMemo(() => {
    const t = searchParams.get("tab");
    if (t === "artists") return "artists";
    return "users";
  }, [searchParams]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="rounded-xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/5 backdrop-blur-xl sm:rounded-2xl sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
              Workspace
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-600">
              Users, artists, songs — pagination and validation on every form.
            </p>
          </div>
          <div className="inline-flex h-9 shrink-0 items-center self-start rounded-full border border-teal-200/80 bg-teal-50/90 px-3 text-[10px] font-bold uppercase tracking-wider text-teal-800 sm:px-4 sm:text-xs">
            AMS · Admin
          </div>
        </div>

        <Tabs
          value={tab}
          onChange={(v) => {
            const next = v === "artists" ? "artists" : "users";
            setSearchParams({ tab: next });
          }}
          variant="pills"
          radius="lg"
          keepMounted={false}
          color="teal"
          classNames={{
            root: "w-full min-w-0",
            list: "mb-5 w-full min-w-0 gap-1.5 rounded-xl border border-zinc-200/70 bg-zinc-100/90 p-1 sm:gap-2 sm:p-1.5 flex-nowrap overflow-x-auto sm:overflow-visible",
            tab: "shrink-0 grow basis-0 rounded-lg px-4 py-2.5 text-center text-xs font-semibold min-h-11 sm:min-h-0 sm:px-5 sm:text-sm",
          }}
        >
          <Tabs.List grow className="flex sm:flex-1">
            <Tabs.Tab value="users">Users</Tabs.Tab>
            <Tabs.Tab value="artists">Artists</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="users" pt={0}>
            <UserManagement />
          </Tabs.Panel>

          <Tabs.Panel value="artists" pt={0}>
            <ArtistManagement />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
