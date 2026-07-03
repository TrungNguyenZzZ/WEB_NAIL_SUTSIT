import { resolveMediaUrl } from "../services/api";

export const DEFAULT_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80";

export const DEFAULT_AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80";

export const resolveImageUrl = (value, fallback = DEFAULT_IMAGE_FALLBACK) =>
  resolveMediaUrl(value) || fallback;
