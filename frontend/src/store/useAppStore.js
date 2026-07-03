import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      cartSummary: {
        totalItems: 0,
        subtotal: 0
      },
      setSession: ({ token, user }) =>
        set({
          token,
          user
        }),
      updateUser: (user) =>
        set((state) => ({
          user: {
            ...(state.user ?? {}),
            ...user
          }
        })),
      clearSession: () =>
        set({
          token: null,
          user: null,
          cartSummary: {
            totalItems: 0,
            subtotal: 0
          }
        }),
      setCartSummary: (cartSummary) =>
        set({
          cartSummary
        }),
      resetCartSummary: () =>
        set({
          cartSummary: {
            totalItems: 0,
            subtotal: 0
          }
        })
    }),
    {
      name: "blush-bloom-store"
    }
  )
);
