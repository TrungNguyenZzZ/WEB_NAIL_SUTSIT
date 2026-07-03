import { useEffect, useState } from "react";
import { authApi, cartApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";

export const useBootstrapApp = () => {
  const token = useAppStore((state) => state.token);
  const updateUser = useAppStore((state) => state.updateUser);
  const clearSession = useAppStore((state) => state.clearSession);
  const setCartSummary = useAppStore((state) => state.setCartSummary);
  const resetCartSummary = useAppStore((state) => state.resetCartSummary);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!token) {
        resetCartSummary();
        if (active) {
          setReady(true);
        }
        return;
      }

      try {
        const [meResponse, cartResponse] = await Promise.all([
          authApi.me(),
          cartApi.get().catch(() => ({
            item: {
              totalItems: 0,
              subtotal: 0
            }
          }))
        ]);

        updateUser(meResponse.user);
        setCartSummary({
          totalItems: cartResponse.item?.totalItems ?? 0,
          subtotal: cartResponse.item?.subtotal ?? 0
        });
      } catch {
        clearSession();
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [token, updateUser, clearSession, setCartSummary, resetCartSummary]);

  return ready;
};

