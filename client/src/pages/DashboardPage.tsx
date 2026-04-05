import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { UserManagement } from "@/components/users/UserManagement";
import { ArtistManagement } from "@/components/artists/ArtistManagement";

type DashboardTab = "users" | "artists";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Mono:wght@300;400;500&display=swap');

.dash-root {
  font-family: 'DM Mono', monospace;
  background: #f8f5ef;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  color: #1a1612;
}

.dash-wrap {
  max-width: 1320px;
  margin: 0 auto;
}

/* ── Header ── */
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.25rem;
  flex-wrap: wrap;
}
.dash-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #1a1612;
  margin: 0;
}
.dash-title em {
  font-style: italic;
  color: #c9871c;
}
.dash-sub {
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: #7a7068;
  margin-top: 0.5rem;
  max-width: 440px;
  line-height: 1.7;
}
.dash-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: #1a1612;
  color: #f0c060;
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
}
.dash-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9871c;
  animation: dash-live 2s ease-in-out infinite;
}
@keyframes dash-live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

/* ── Tab bar ── */
.dash-tabs {
  display: inline-flex;
  background: #fff;
  border: 1px solid rgba(26,22,18,0.09);
  border-radius: 12px;
  padding: 4px;
  gap: 2px;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 3px rgba(26,22,18,0.05), 0 8px 32px rgba(26,22,18,0.05);
}
.dash-tab {
  padding: 8px 22px;
  border-radius: 9px;
  border: none;
  background: transparent;
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a7068;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.dash-tab:hover { background: #f2ede4; color: #1a1612; }
.dash-tab.dash-tab--active {
  background: #1a1612;
  color: #f0c060;
  box-shadow: 0 2px 8px rgba(26,22,18,0.2);
}

/* ── Content panel ── */
.dash-panel {
  background: #fff;
  border: 1px solid rgba(26,22,18,0.09);
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(26,22,18,0.05), 0 8px 32px rgba(26,22,18,0.06);
  overflow: hidden;
}
`;

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
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="dash-root">
        <div className="dash-wrap">

          {/* ── Header ── */}
          <div className="dash-header">
            <div>
              <h1 className="dash-title">
                Workspace <em>Overview</em>
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