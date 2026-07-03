import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "../utils/constants";
import { Button, cn } from "../components/ui";
import { useAppStore } from "../store/useAppStore";

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const clearSession = useAppStore((state) => state.clearSession);

  return (
    <div className="min-h-screen bg-white/50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/80 bg-white/85 p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-ink p-3 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl">Admin Console</div>
              <p className="text-sm text-cocoa/75">SỤT SỊT NAIL</p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] bg-petal/80 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-cocoa/70">ÄÄƒng nháº­p bá»Ÿi</p>
            <div className="mt-3 font-semibold text-ink">{user?.name}</div>
            <div className="text-sm text-cocoa/75">{user?.email}</div>
          </div>

          <nav className="mt-8 grid gap-2">
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "rounded-2xl px-4 py-3 text-sm font-semibold text-cocoa/80 transition hover:bg-white hover:text-ink",
                    isActive && "bg-ink text-white hover:text-white"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 flex gap-3">
            <Button className="flex-1" variant="secondary" onClick={() => navigate("/")}>
              Vá» website
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => {
                clearSession();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              ÄÄƒng xuáº¥t
            </Button>
          </div>
        </aside>

        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


