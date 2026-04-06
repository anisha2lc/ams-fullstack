import { useMemo } from "react";
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

  const setTab = (t: DashboardTab) => setSearchParams({ tab: t });

  return (
    <>
      <div className="dash-root">
        <div className="dash-wrap">

          {/* ── Header ── */}
          <div className="dash-header">
            <div>
              <h1 className="dash-title">
                Artist <em>Management</em>
              </h1>
              <p className="dash-sub">
                Manage your network of users, catalog of artists, and their extensive song collections.
              </p>
            </div>
            <div className="dash-badge">Admin Panel</div>
          </div>

          {/* ── Tab switcher ── */}
          <div className="dash-tabs">
            <button
              className={`dash-tab${tab === "users" ? " dash-tab--active" : ""}`}
              onClick={() => setTab("users")}
            >
              System Users
            </button>
            <button
              className={`dash-tab${tab === "artists" ? " dash-tab--active" : ""}`}
              onClick={() => setTab("artists")}
            >
              Artists Portfolio
            </button>
          </div>

          <div className="dash-panel">
            {tab === "users" ? <UserManagement /> : <ArtistManagement />}
          </div>

        </div>
      </div>
    </>
  );
}