import { shopConfig } from "./config";

export interface Product {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  material: string;
  gemstone?: string;
  collection: string;
  category: string;
  image: string;
  images?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  inStock: boolean;
  description: string;
  descriptionHtml?: string;
  colors?: ProductOption[];
  sizes?: ProductOption[];
  info?: Record<string, string>;
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

const TOKEN_STORAGE_KEY = "areni.shop.tokens";
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1626784214536-d859187e0bd0?w=600&h=720&fit=crop&auto=format";
const DEFAULT_COLLECTION_IMAGE =
  "https://images.unsplash.com/photo-1688406264720-e2f9389c9ed1?w=800&h=1000&fit=crop&auto=format";

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
    const value = window.localStorage.getItem(TOKEN_STORAGE_KEY);
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
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
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
    name: data.name?.trim() || "Areni Armenian Jewels",
    email: data.email?.trim() || "hello@areni.am",
    phone: data.phone?.trim() || "+374 10 52 84 00",
    address: data.address?.trim() || "14 Abovyan Street, Yerevan 0001, Republic of Armenia",
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

export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const data = unwrapData(
    await shopRequest<Resource<BackendProduct[]>>(`/product/search/${encodeURIComponent(trimmed)}`),
  );
  return data.map((product) => mapBackendProduct(product));
}

export async function getAboutPage(): Promise<AboutContent> {
  const data = unwrapData(await shopRequest<Resource<BackendAboutPage>>(`/about-pages/${shopConfig.appId}`));
  return {
    title: data.title?.trim() || "The House of Areni",
    description: toPlainText(data.description),
    imageUrl: data.image_url || undefined,
  };
}

export async function getBlogs(): Promise<BlogPost[]> {
  const data = unwrapData(await shopRequest<Resource<BackendBlog[]>>(`/blogs/${shopConfig.appId}`));
  return data.map((blog) => ({
    id: blog.id,
    title: blog.title?.trim() || "Areni Journal",
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
): Promise<OrderCreateResponse> {
  const productIds = items.map((item) => item.product.id);
  const productCounts = Object.fromEntries(items.map((item) => [String(item.product.id), item.quantity]));
  const productInfo = Object.fromEntries(
    items.map((item) => [
      String(item.product.id),
      {
        name: item.product.name,
        material: item.product.material,
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
): { products: Product[]; collections: Collection[] } {
  const categoryById = buildCategoryMap(categories);
  const topProductIds = new Set(
    topProducts
      .map((topProduct) => topProduct.product_id)
      .filter((productId): productId is number => typeof productId === "number"),
  );
  const productsById = new Map<number, Product>();

  const collectProducts = (category: BackendCategory) => {
    category.products?.forEach((product) => {
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
    collections: categories.map((category) => mapCategoryToCollection(category)),
  };
}

export function mapBackendProduct(
  product: BackendProduct,
  options: { category?: BackendCategory; topProductIds?: Set<number> } = {},
): Product {
  const info = toRecord(product.info);
  const images = product.media_urls?.filter(Boolean) ?? [];
  const categoryName = options.category?.name || getInfoValue(info, ["category", "type"]);
  const collectionName = getInfoValue(info, ["collection", "line", "series"]) || categoryName || "Areni";
  const listPrice = toNumber(product.price);
  const salePrice = toNumber(product.new_price);
  const hasSale = salePrice > 0 && listPrice > 0 && salePrice < listPrice;
  const price = hasSale ? salePrice : listPrice || salePrice;

  return {
    id: product.id,
    name: product.name,
    subtitle: getInfoValue(info, ["subtitle", "tagline"]) || `${collectionName} Collection`,
    price,
    originalPrice: hasSale ? listPrice : undefined,
    material: getInfoValue(info, ["material", "metal", "karat"]) || "Fine jewellery",
    gemstone: getInfoValue(info, ["gemstone", "stone", "gem"]),
    collection: slugify(collectionName),
    category: slugify(categoryName || "jewellery"),
    image: images[0] || DEFAULT_PRODUCT_IMAGE,
    images: images.length ? images : [DEFAULT_PRODUCT_IMAGE],
    isNew: isRecent(product.created_at),
    isBestSeller: options.topProductIds?.has(product.id) || false,
    inStock: true,
    description: product.description?.trim() || toPlainText(product.description_html) || "A hand-finished piece from the Areni atelier.",
    descriptionHtml: product.description_html || undefined,
    colors: normalizeOptions(product.colors),
    sizes: normalizeOptions(product.sizes),
    info: stringifyRecord(info),
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

function mapCategoryToCollection(category: BackendCategory): Collection {
  const products = collectProductsForCategory(category);
  const mappedProducts = products.map((product) => mapBackendProduct(product, { category }));
  const image =
    firstMediaUrl(category.media_url) ||
    products.find((product) => product.media_urls?.length)?.media_urls?.[0] ||
    DEFAULT_COLLECTION_IMAGE;

  return {
    id: slugify(category.name || `collection-${category.id}`),
    backendId: category.id,
    name: category.name,
    tagline: `Explore ${category.name.toLowerCase()} pieces from the Areni atelier`,
    count: products.length,
    image,
    price: 0,
    products: mappedProducts,
  };
}

function mapBackendCollection(collection: BackendCollection): Collection {
  const products = collection.products ?? [];
  const collectionId = slugify(collection.name || `collection-${collection.id}`);
  const mappedProducts = products.map((product) => ({
    ...mapBackendProduct(product),
    subtitle: `${collection.name} Collection`,
    collection: collectionId,
  }));
  const image =
    firstMediaUrl(collection.media_url) ||
    products.find((product) => product.media_urls?.length)?.media_urls?.[0] ||
    DEFAULT_COLLECTION_IMAGE;

  return {
    id: collectionId,
    backendId: collection.id,
    name: collection.name,
    tagline: `Explore ${collection.name.toLowerCase()} pieces from the Areni atelier`,
    count: products.length,
    image,
    price: toNumber(collection.price),
    products: mappedProducts,
  };
}

function collectProductsForCategory(category: BackendCategory): BackendProduct[] {
  const products = [...(category.products ?? [])];
  category.subcategories?.forEach((subcategory) => {
    products.push(...collectProductsForCategory(subcategory));
  });
  return products;
}

function firstMediaUrl(value: BackendCategory["media_url"]): string | undefined {
  if (Array.isArray(value)) return value.find(Boolean);
  return value || undefined;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

function stringifyRecord(value: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== null && item !== undefined && item !== "")
      .map(([key, item]) => [key, typeof item === "string" ? item : String(item)]),
  );
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

function getOptionString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function getInfoValue(info: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = info[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function isRecent(value?: string | null): boolean {
  if (!value) return false;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;

  const daysSinceCreated = (Date.now() - timestamp) / 86_400_000;
  return daysSinceCreated >= 0 && daysSinceCreated <= 60;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "jewellery";
}

function toPlainText(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
