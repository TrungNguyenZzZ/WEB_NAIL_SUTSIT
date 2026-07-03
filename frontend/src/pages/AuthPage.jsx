import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole, Sparkles, UserPlus } from "lucide-react";
import { Button, Card, PageHero } from "../components/ui";
import AuthForm from "../components/forms/AuthForm";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "login";
  const redirect = useMemo(() => searchParams.get("redirect") || "/account", [searchParams]);

  const switchMode = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    next.set("mode", nextMode);
    setSearchParams(next);
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Welcome back"
        title="ÄÄƒng nháº­p Ä‘á»ƒ Ä‘áº·t lá»‹ch, theo dÃµi lá»‹ch háº¹n vÃ  quáº£n lÃ½ Ä‘Æ¡n hÃ ng."
        description="TÃ i khoáº£n giÃºp báº¡n lÆ°u lá»‹ch sá»­ lÃ m Ä‘áº¹p, giá» hÃ ng vÃ  tráº¡ng thÃ¡i Ä‘Æ¡n sáº£n pháº©m á»Ÿ cÃ¹ng má»™t nÆ¡i."
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-ink text-white">
          <div className="eyebrow bg-white/10 text-white/80">Why create an account</div>
          <div className="mt-5 space-y-4">
            {[
              {
                icon: LockKeyhole,
                title: "Theo dÃµi lá»‹ch háº¹n",
                description: "Xem tráº¡ng thÃ¡i xÃ¡c nháº­n, lá»‹ch sá»­ Ä‘áº·t lá»‹ch vÃ  há»§y háº¹n trong khung thá»i gian cho phÃ©p."
              },
              {
                icon: Sparkles,
                title: "LÆ°u gu lÃ m Ä‘áº¹p",
                description: "Dá»… dÃ ng quay láº¡i dá»‹ch vá»¥ yÃªu thÃ­ch hoáº·c mua láº¡i sáº£n pháº©m Ä‘Ã£ há»£p vá»›i báº¡n."
              },
              {
                icon: UserPlus,
                title: "Quáº£n lÃ½ Ä‘Æ¡n hÃ ng",
                description: "Theo dÃµi thanh toÃ¡n, giao hÃ ng vÃ  cÃ¡c mÃ£ giáº£m giÃ¡ Ä‘Ã£ dÃ¹ng trÆ°á»›c Ä‘Ã³."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/10 p-5">
                <item.icon className="h-6 w-6 text-white" />
                <h3 className="mt-4 text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/80">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <Button variant={mode === "login" ? "primary" : "secondary"} onClick={() => switchMode("login")}>
              ÄÄƒng nháº­p
            </Button>
            <Button variant={mode === "register" ? "primary" : "secondary"} onClick={() => switchMode("register")}>
              ÄÄƒng kÃ½
            </Button>
          </div>
          <div className="mt-6">
            <h2 className="text-3xl">{mode === "register" ? "Táº¡o tÃ i khoáº£n má»›i" : "ÄÄƒng nháº­p tÃ i khoáº£n"}</h2>
            <p className="mt-3 text-sm leading-7 text-cocoa/80">
              {mode === "register"
                ? "Äiá»n thÃ´ng tin cÆ¡ báº£n Ä‘á»ƒ báº¯t Ä‘áº§u Ä‘áº·t lá»‹ch vÃ  mua sáº¯m trÃªn SỤT SỊT NAIL."
                : "Sá»­ dá»¥ng email vÃ  máº­t kháº©u Ä‘Ã£ Ä‘Äƒng kÃ½ Ä‘á»ƒ tiáº¿p tá»¥c."}
            </p>
          </div>
          <div className="mt-8">
            <AuthForm
              mode={mode}
              onSuccess={() => {
                navigate(redirect, { replace: true });
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;


