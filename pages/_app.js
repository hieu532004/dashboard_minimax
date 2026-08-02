import "../styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const PUBLIC_PATHS = ["/login", "/_error"];

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      if (PUBLIC_PATHS.includes(router.pathname)) {
        if (!cancelled) setAuthorized(true);
        return;
      }
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (cancelled) return;
        if (!response.ok) {
          setAuthorized(false);
          await router.replace("/login");
          return;
        }
        setAuthorized(true);
      } catch {
        if (!cancelled) {
          setAuthorized(false);
          await router.replace("/login");
        }
      }
    };
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router, router.pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="text-sm text-slate-400">Đang kiểm tra đăng nhập…</div>
      </div>
    );
  }
  return <Component {...pageProps} />;
}
