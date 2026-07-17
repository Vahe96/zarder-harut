export const shopConfig = {
  apiBaseUrl: String(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api").replace(/\/$/, ""),
  appId: Number(import.meta.env.VITE_SHOP_APP_ID ?? 1),
  paymentProvider: String(import.meta.env.VITE_PAYMENT_PROVIDER ?? "idram"),
};

