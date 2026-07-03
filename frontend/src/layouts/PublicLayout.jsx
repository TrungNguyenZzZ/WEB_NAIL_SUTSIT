import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "../utils/constants";
import { Button, cn } from "../components/ui";
import { formatCurrency } from "../utils/format";
import { useAppStore } from "../store/useAppStore";
import { authApi } from "../services/api";

const PublicLayout = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const cartSummary = useAppStore((state) => state.cartSummary);
  const clearSession = useAppStore((state) => state.clearSession);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/services?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Client-side logout is enough for JWT in local storage.
    } finally {
      clearSession();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-full bg-ink px-3 py-2 font-display text-lg text-white">SS</div>
            <div>
              <div className="font-display text-2xl">SỤT SỊT NAIL</div>
              <div className="text-xs uppercase tracking-[0.22em] text-cocoa/70">Nail and Lash Studio</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn("text-sm font-semibold text-cocoa/80 hover:text-ink", isActive && "text-ink")
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user?.role === "ADMIN" ? (
              <NavLink to="/admin/dashboard" className="text-sm font-semibold text-cocoa/80 hover:text-ink">
                Admin
              </NavLink>
            ) : null}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <form onSubmit={handleSearch} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa/60" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-full border border-rose/10 bg-white/90 py-2 pl-10 pr-4 text-sm outline-none focus:border-rose/30"
                placeholder="TÃ¬m dá»‹ch vá»¥..."
              />
            </form>
            <Button variant="secondary" onClick={() => navigate("/cart")} className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              {cartSummary.totalItems}
            </Button>
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/account")} className="gap-2">
                  <UserRound className="h-4 w-4" />
                  {user.name?.split(" ")[0]}
                </Button>
                <Button variant="primary" onClick={handleLogout}>
                  ÄÄƒng xuáº¥t
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")}>ÄÄƒng nháº­p</Button>
            )}
          </div>

          <button
            type="button"
            className="rounded-full bg-white p-3 text-cocoa shadow-card lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/70 bg-white/95 lg:hidden">
            <div className="container space-y-4 py-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa/60" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-full border border-rose/10 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-rose/30"
                  placeholder="TÃ¬m dá»‹ch vá»¥..."
                />
              </form>
              <div className="grid gap-2">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className="rounded-2xl bg-petal/70 px-4 py-3 text-sm font-semibold text-cocoa"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="rounded-3xl bg-ink p-4 text-white">
                <p className="text-sm">Giá» hÃ ng hiá»‡n táº¡i</p>
                <div className="mt-2 font-display text-2xl">{formatCurrency(cartSummary.subtotal)}</div>
              </div>
              {user ? (
                <div className="flex gap-3">
                  <Button className="flex-1" variant="secondary" onClick={() => navigate("/account")}>
                    TÃ i khoáº£n
                  </Button>
                  <Button className="flex-1" onClick={handleLogout}>
                    ÄÄƒng xuáº¥t
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  ÄÄƒng nháº­p
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="container py-8 md:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/70 bg-white/70">
        <div className="container grid gap-6 py-10 md:grid-cols-3">
          <div>
            <h3 className="text-2xl">SỤT SỊT NAIL</h3>
            <p className="mt-3 text-sm leading-7 text-cocoa/80">
              KhÃ´ng gian Ä‘áº·t lá»‹ch nail, mi vÃ  beauty care Ä‘Æ°á»£c thiáº¿t káº¿ Ä‘á»ƒ nháº¹ nhÃ ng, nhanh vÃ  tháº­t dá»… dÃ¹ng.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cocoa/70">LiÃªn há»‡</p>
            <p className="mt-3 text-sm text-cocoa/80">12 Nguyá»…n TrÃ£i, Quáº­n 1, TP.HCM</p>
            <p className="mt-2 text-sm text-cocoa/80">0909 000 000</p>
            <p className="mt-2 text-sm text-cocoa/80">hello@blushbloom.vn</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cocoa/70">Giá» má»Ÿ cá»­a</p>
            <p className="mt-3 text-sm text-cocoa/80">Thá»© 2 - Chá»§ nháº­t</p>
            <p className="mt-2 text-sm text-cocoa/80">09:00 - 20:00</p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-cocoa/55">
              Instagram / Facebook / TikTok
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;


