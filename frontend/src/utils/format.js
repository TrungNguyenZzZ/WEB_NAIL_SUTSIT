export const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));

export const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));

export const formatDateTime = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export const toBulletList = (value) =>
  value
    ?.split("\n")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const formatStatusLabel = (value) =>
  value
    ?.toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

