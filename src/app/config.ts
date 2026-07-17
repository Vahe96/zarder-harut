export const shopConfig = {
  apiBaseUrl: String(import.meta.env.VITE_API_BASE_URL ?? "https://backend.min4max.net/api").replace(/\/$/, ""),
  appId: Number(import.meta.env.VITE_SHOP_APP_ID ?? 25),
  paymentProvider: String(import.meta.env.VITE_PAYMENT_PROVIDER ?? "idram"),
};
