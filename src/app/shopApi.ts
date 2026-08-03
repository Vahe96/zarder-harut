import { shopConfig } from "./config";

export interface Product {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  collection: string;
  collectionIds: string[];
  category: string;
  categoryId: number;
  categoryLabel: string;
  image: string;
  images?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  status: "active" | "out_of_stock" | "inactive" | "archived";
  badges: string[];
  description: string;
  descriptionHtml?: string;
  colors?: ProductOption[];
  sizes?: ProductOption[];
}

export interface Collection {
  id: string;
  backendId?: number;
  name: string;
  tagline: string;
  count: number;
  image: string;
  price: number;
  products?: Product[];
}

export interface ShopInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  telegramChatId?: string;
}

export interface AboutContent {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface ProductOption {
  name: string;
  value?: string;
  info?: string;
}

export interface AuthTokens {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export interface CartLine {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export interface OrderLine {
  id?: number;
  productCount: number;
  productNumber: string;
  status: string;
  created_at?: string;
  createdAt?: string;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export interface PaymentInitResponse {
  id: number;
  provider: string;
  status: string;
  order_ids: number[];
  payment_url?: string | null;
  form_action?: string | null;
  form_method?: string | null;
  form_payload?: Record<string, string> | null;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  orderInfo?: Record<string, unknown>;
}

export interface OrderCreateResponse {
  message: string;
  order_ids: number[];
}

interface BackendProduct {
  id: number;
  category_id: number;
  name: string;
  price: number | string | null;
  new_price?: number | string | null;
  status?: "active" | "out_of_stock" | "inactive" | "archived" | null;
  badges?: unknown;
  collection_ids?: unknown;
  collections?: Array<{ id?: number; name?: string | null }>;
  info?: unknown;
  description?: string | null;
  description_html?: string | null;
  colors?: unknown[];
  sizes?: unknown[];
  media_urls?: string[];
  created_at?: string | null;
}

interface BackendCategory {
  id: number;
  app_id: number;
  name: string;
  parent_id: number | null;
  products?: BackendProduct[];
  subcategories?: BackendCategory[];
  media_url?: string[] | string | null;
}

interface BackendCollection {
  id: number;
  app_id: number;
  name: string;
  price?: number | string | null;
  media_url?: string[] | string | null;
  products?: BackendProduct[];
  created_at?: string | null;
}

interface BackendTopProduct {
  category_id?: number | null;
  product_id?: number | null;
  image_url?: string | null;
  url?: string | null;
}

interface BackendAppInfo {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  telegram_chat_id?: string | number | null;
}

interface BackendAboutPage {
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
}

interface BackendBlog {
  id: number;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  created_at?: string | null;
}

type Resource<T> = { data: T } | T;

const TOKEN_STORAGE_KEY = "zarder.shop.tokens";
const LEGACY_TOKEN_STORAGE_KEY = "areni.shop.tokens";
const DEFAULT_PRODUCT_IMAGE = `${import.meta.env.BASE_URL}drakht/logo-web.png`;
const DEFAULT_COLLECTION_IMAGE = `${import.meta.env.BASE_URL}drakht/logo-web.png`;

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function hasAuthTokens(): boolean {
  return Boolean(readTokens()?.access_token);
}

export function readTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(TOKEN_STORAGE_KEY)
      ?? window.localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
    return value ? (JSON.parse(value) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    TOKEN_STORAGE_KEY,
    JSON.stringify({
      token_type: tokens.token_type,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    }),
  );
  window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
}

function unwrapData<T>(payload: Resource<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

async function shopRequest<T>(
  path: string,
  options: Omit<RequestInit, "body"> & {
    body?: unknown;
    auth?: boolean;
    retry?: boolean;
    parseAs?: "json" | "text";
  } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body: BodyInit | undefined;
  const inputBody = options.body;
  const isFormData = typeof FormData !== "undefined" && inputBody instanceof FormData;
  const isUrlParams = typeof URLSearchParams !== "undefined" && inputBody instanceof URLSearchParams;

  if (typeof inputBody === "string" || isFormData || isUrlParams) {
    body = inputBody as BodyInit;
  } else if (inputBody !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(inputBody);
  }

  if (options.auth) {
    const token = readTokens()?.access_token;
    if (!token) throw new ApiError(401, "Sign in is required for this action.");
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${shopConfig.apiBaseUrl}${path}`, {
    ...options,
    body,
    headers,
  });

  if (response.status === 401 && options.auth && options.retry !== false && readTokens()?.refresh_token) {
    await refreshAuthToken();
    return shopRequest<T>(path, { ...options, retry: false });
  }

  const payload = await parseResponse(response, options.parseAs);

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(payload, response.status), payload);
  }

  return payload as T;
}

async function parseResponse(response: Response, parseAs?: "json" | "text"): Promise<unknown> {
  if (response.status === 204) return null;
  if (parseAs === "text") return response.text();

  const contentType = response.headers.get("content-type") ?? "";
  if (parseAs === "json" || contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return `Request failed with status ${status}.`;
}

async function refreshAuthToken(): Promise<AuthTokens> {
  const refreshToken = readTokens()?.refresh_token;
  if (!refreshToken) throw new ApiError(401, "Your session has expired.");

  const response = await shopRequest<Resource<AuthTokens>>("/user/refresh_token", {
    method: "POST",
    body: { refresh_token: refreshToken },
    retry: false,
  });
  const tokens = unwrapData(response);
  storeTokens(tokens);
  return tokens;
}

export async function login(payload: { email: string; password: string }): Promise<AuthTokens> {
  const response = await shopRequest<Resource<AuthTokens>>("/user/login", {
    method: "POST",
    body: payload,
  });
  const tokens = unwrapData(response);
  storeTokens(tokens);
  return tokens;
}

export async function register(payload: {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
}): Promise<AuthTokens & { user?: UserProfile }> {
  const response = await shopRequest<Resource<AuthTokens & { user?: UserProfile }>>("/user/register", {
    method: "POST",
    body: payload,
  });
  const data = unwrapData(response);
  storeTokens(data);
  return data;
}

export async function getProfile(): Promise<UserProfile> {
  return unwrapData(await shopRequest<Resource<UserProfile>>("/user", { auth: true }));
}

export async function updateProfile(payload: Omit<UserProfile, "id">): Promise<UserProfile> {
  return unwrapData(
    await shopRequest<Resource<UserProfile>>("/user", {
      method: "PUT",
      auth: true,
      body: payload,
    }),
  );
}

export async function getAppInfo(): Promise<ShopInfo> {
  const data = unwrapData(await shopRequest<Resource<BackendAppInfo>>(`/app/get/${shopConfig.appId}`));
  return {
    name: data.name?.trim() || "Zarder",
    email: data.email?.trim() || "",
    phone: data.phone?.trim() || "",
    address: data.address?.trim() || "",
    telegramChatId: data.telegram_chat_id ? String(data.telegram_chat_id) : undefined,
  };
}

export async function getCategoryTree(): Promise<BackendCategory[]> {
  return unwrapData(await shopRequest<Resource<BackendCategory[]>>(`/category/product/${shopConfig.appId}`));
}

export async function getCollections(): Promise<Collection[]> {
  const data = unwrapData(await shopRequest<Resource<BackendCollection[]>>(`/collections/${shopConfig.appId}`));
  return data.map(mapBackendCollection);
}

export async function getNavigationCategories(): Promise<BackendCategory[]> {
  return unwrapData(await shopRequest<Resource<BackendCategory[]>>(`/category/${shopConfig.appId}`));
}

export async function getTopProducts(): Promise<BackendTopProduct[]> {
  return unwrapData(await shopRequest<Resource<BackendTopProduct[]>>(`/product/top-product/${shopConfig.appId}`));
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const data = unwrapData(await shopRequest<Resource<BackendProduct[]>>(`/product/category/${categoryId}`));
  return data.map((product) => mapBackendProduct(product));
}

export async function getProduct(productId: number): Promise<Product> {
  return mapBackendProduct(unwrapData(await shopRequest<Resource<BackendProduct>>(`/product/${productId}`)));
}

export async function getAboutPage(): Promise<AboutContent> {
  const data = unwrapData(await shopRequest<Resource<BackendAboutPage>>(`/about-pages/${shopConfig.appId}`));
  return {
    title: data.title?.trim() || "Zarder",
    description: toPlainText(data.description),
    imageUrl: data.image_url || undefined,
  };
}

export async function getBlogs(): Promise<BlogPost[]> {
  const data = unwrapData(await shopRequest<Resource<BackendBlog[]>>(`/blogs/${shopConfig.appId}`));
  return data.map((blog) => ({
    id: blog.id,
    title: blog.title?.trim() || "Zarder Journal",
    description: toPlainText(blog.description),
    imageUrl: blog.image_url || undefined,
    createdAt: blog.created_at || undefined,
  }));
}

export async function getCart(): Promise<CartLine[]> {
  return unwrapData(await shopRequest<Resource<CartLine[]>>(`/cart/${shopConfig.appId}`, { auth: true }));
}

export async function addToCart(productId: number, quantity = 1): Promise<void> {
  await shopRequest<{ status: string }>("/cart/add", {
    method: "POST",
    auth: true,
    body: {
      app_id: shopConfig.appId,
      product_id: productId,
      quantity,
    },
  });
}

export async function removeFromCart(cartId: number): Promise<void> {
  await shopRequest<{ status: string }>(`/cart/${cartId}/remove`, {
    method: "DELETE",
    auth: true,
  });
}

export async function replaceCartQuantity(cartId: number, productId: number, quantity: number): Promise<void> {
  await removeFromCart(cartId);
  if (quantity > 0) await addToCart(productId, quantity);
}

export async function likeProduct(productId: number): Promise<void> {
  await shopRequest<{ message: string }>("/product/like", {
    method: "POST",
    auth: true,
    body: {
      app_id: shopConfig.appId,
      product_id: productId,
    },
  });
}

export async function unlikeProduct(productId: number): Promise<void> {
  await shopRequest<{ message: string }>("/product/unlike", {
    method: "DELETE",
    auth: true,
    body: { product_id: productId },
  });
}

export async function createOrder(
  items: OrderItem[],
  phoneNumber: string,
  additionalInfo: Record<string, unknown> = {},
  buyerTin = "",
): Promise<OrderCreateResponse> {
  const productIds = items.map((item) => item.product.id);
  const productCounts = Object.fromEntries(items.map((item) => [String(item.product.id), item.quantity]));
  const productInfo = Object.fromEntries(
    items.map((item) => [
      String(item.product.id),
      {
        name: item.product.name,
        ...(item.orderInfo ?? {}),
      },
    ]),
  );

  const response = await shopRequest<unknown>("/order", {
    method: "POST",
    auth: true,
    body: {
      app_id: shopConfig.appId,
      product_ids: productIds,
      product_counts: productCounts,
      product_info: productInfo,
      phone_number: phoneNumber,
      ...(buyerTin ? { buyer_tin: buyerTin } : {}),
      additional_info: additionalInfo,
    },
  });

  if (
    !response
    || typeof response !== "object"
    || !("order_ids" in response)
    || !Array.isArray(response.order_ids)
    || !response.order_ids.every((orderId) => Number.isInteger(orderId))
  ) {
    throw new ApiError(502, "The backend order endpoint did not return the required order_ids.", response);
  }

  return {
    message: "message" in response && typeof response.message === "string" ? response.message : "Order created",
    order_ids: response.order_ids as number[],
  };
}

export async function getOrders(): Promise<OrderLine[]> {
  return unwrapData(await shopRequest<Resource<OrderLine[]>>(`/order/${shopConfig.appId}`, { auth: true }));
}

export async function initAmeriabankPayment(orderIds: number[], description: string): Promise<PaymentInitResponse> {
  return unwrapData(
    await shopRequest<Resource<PaymentInitResponse>>("/payments/ameriabank/init", {
      method: "POST",
      auth: true,
      body: {
        app_id: shopConfig.appId,
        order_ids: orderIds,
        description,
        lang: "am",
      },
    }),
  );
}

export async function initIdramPayment(orderIds: number[], description: string): Promise<PaymentInitResponse> {
  return unwrapData(
    await shopRequest<Resource<PaymentInitResponse>>("/payments/idram/init", {
      method: "POST",
      auth: true,
      body: {
        app_id: shopConfig.appId,
        order_ids: orderIds,
        description,
        lang: "am",
      },
    }),
  );
}

export function submitIdramPayment(payment: PaymentInitResponse): void {
  if (!payment.form_action || !payment.form_payload) {
    throw new ApiError(422, "Idram payment data is incomplete.");
  }

  const form = document.createElement("form");
  form.action = payment.form_action;
  form.method = payment.form_method || "POST";
  form.style.display = "none";

  Object.entries(payment.form_payload).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export function normalizeCatalog(
  categories: BackendCategory[],
  topProducts: BackendTopProduct[] = [],
): { products: Product[] } {
  const categoryById = buildCategoryMap(categories);
  const topProductIds = new Set(
    topProducts
      .map((topProduct) => topProduct.product_id)
      .filter((productId): productId is number => typeof productId === "number"),
  );
  const productsById = new Map<number, Product>();

  const collectProducts = (category: BackendCategory) => {
    category.products?.forEach((product) => {
      if (product.status === "inactive" || product.status === "archived") return;
      productsById.set(
        product.id,
        mapBackendProduct(product, {
          category: categoryById.get(product.category_id) ?? category,
          topProductIds,
        }),
      );
    });
    category.subcategories?.forEach(collectProducts);
  };

  categories.forEach(collectProducts);

  return {
    products: Array.from(productsById.values()),
  };
}

export function mapBackendProduct(
  product: BackendProduct,
  options: { category?: BackendCategory; topProductIds?: Set<number> } = {},
): Product {
  const images = product.media_urls?.filter(Boolean) ?? [];
  const categoryName = options.category?.name || "";
  const backendCollections = (product.collections ?? []).filter(
    (collection): collection is { id: number; name?: string | null } => Number.isInteger(collection.id),
  );
  const collectionIds = Array.from(new Set([
    ...backendCollections.map((collection) => `collection-${collection.id}`),
    ...(Array.isArray(product.collection_ids)
      ? product.collection_ids.filter((id): id is number => Number.isInteger(id)).map((id) => `collection-${id}`)
      : []),
  ]));
  const collectionName = backendCollections[0]?.name?.trim() || "";
  const listPrice = toNumber(product.price);
  const salePrice = toNumber(product.new_price);
  const hasSale = salePrice > 0 && listPrice > 0 && salePrice < listPrice;
  const price = hasSale ? salePrice : listPrice || salePrice;
  const status = product.status || "active";
  const badges = normalizeBadges(product.badges);

  return {
    id: product.id,
    name: product.name,
    subtitle: collectionName || categoryName,
    price,
    originalPrice: hasSale ? listPrice : undefined,
    collection: collectionIds[0] || "",
    collectionIds,
    category: slugify(categoryName || "jewellery"),
    categoryId: product.category_id,
    categoryLabel: categoryName || "",
    image: images[0] || DEFAULT_PRODUCT_IMAGE,
    images: images.length ? images : [DEFAULT_PRODUCT_IMAGE],
    isNew: badges.includes("new"),
    isBestSeller: badges.includes("best_seller"),
    isFeatured: options.topProductIds?.has(product.id) || false,
    inStock: status === "active",
    status,
    badges,
    description: product.description?.trim() || toPlainText(product.description_html),
    descriptionHtml: product.description_html || undefined,
    colors: normalizeOptions(product.colors),
    sizes: normalizeOptions(product.sizes),
  };
}

function buildCategoryMap(categories: BackendCategory[]): Map<number, BackendCategory> {
  const map = new Map<number, BackendCategory>();
  const visit = (category: BackendCategory) => {
    map.set(category.id, category);
    category.subcategories?.forEach(visit);
  };
  categories.forEach(visit);
  return map;
}

function mapBackendCollection(collection: BackendCollection): Collection {
  const products = collection.products ?? [];
  const collectionId = `collection-${collection.id}`;
  const mappedProducts = products.map((product) => {
    const mappedProduct = mapBackendProduct(product);
    return {
      ...mappedProduct,
      subtitle: `${collection.name} Collection`,
      collection: collectionId,
      collectionIds: Array.from(new Set([collectionId, ...mappedProduct.collectionIds])),
    };
  });
  const image =
    firstMediaUrl(collection.media_url) ||
    products.find((product) => product.media_urls?.length)?.media_urls?.[0] ||
    DEFAULT_COLLECTION_IMAGE;

  return {
    id: collectionId,
    backendId: collection.id,
    name: collection.name,
    tagline: collection.name,
    count: products.length,
    image,
    price: toNumber(collection.price),
    products: mappedProducts,
  };
}

function firstMediaUrl(value: BackendCategory["media_url"]): string | undefined {
  if (Array.isArray(value)) return value.find(Boolean);
  return value || undefined;
}

function normalizeOptions(options?: unknown[]): ProductOption[] {
  if (!Array.isArray(options)) return [];

  return options
    .map((option) => {
      if (typeof option === "string") return { name: option };
      if (!option || typeof option !== "object") return null;

      const record = option as Record<string, unknown>;
      const fields = record.fields && typeof record.fields === "object" ? record.fields as Record<string, unknown> : {};
      const name = getOptionString(record.name) || getOptionString(fields.name) || getOptionString(record.value);
      if (!name) return null;

      return {
        name,
        value: getOptionString(record.value) || getOptionString(fields.value),
        info: getOptionString(record.info) || getOptionString(fields.info),
      };
    })
    .filter((option): option is ProductOption => Boolean(option));
}

function normalizeBadges(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((badge): badge is string => typeof badge === "string" && badge.trim().length > 0);
}

function getOptionString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function slugify(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "jewellery";
}

function toPlainText(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
