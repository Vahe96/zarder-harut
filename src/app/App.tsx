import { useState, useEffect, useRef, useMemo, useLayoutEffect, type MouseEvent } from "react";
import {
  ShoppingBag, Heart, Search, X, Menu, ChevronRight, ChevronDown, Star,
  ChevronLeft,
  Phone, Mail, MapPin, Instagram, ArrowRight, Plus, Minus, Check,
  MessageCircle, Package, Shield, RefreshCw, Gem, Award, Send,
  Facebook, Twitter, Youtube, Clock, Sparkles, ListFilter, User, LogOut, CreditCard,
  Moon, Sun
} from "lucide-react";
import { shopConfig } from "./config";
import * as shopApi from "./shopApi";
import type { AboutContent, CartLine, Collection, OrderLine, Product, ShopInfo, UserProfile } from "./shopApi";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Page = "home" | "shop" | "collections" | "collection" | "product" | "about" | "custom" | "contact";
type AuthMode = "login" | "register";
type ThemeMode = "dark" | "light";

interface CartItem {
  product: Product;
  quantity: number;
  cartId?: number;
  kind?: "product" | "collection";
  collection?: Collection;
  products?: Product[];
}

const PUBLIC_BASE = import.meta.env.BASE_URL;
const DRAKHT_ASSETS = {
  logoWeb: `${PUBLIC_BASE}drakht/logo-web.png`,
  logoMobile: `${PUBLIC_BASE}drakht/logo-mobile.png`,
  heroWeb: `${PUBLIC_BASE}drakht/hero-web.png`,
  heroMobile: `${PUBLIC_BASE}drakht/hero-mobile.png`,
  birdsLineWeb: `${PUBLIC_BASE}drakht/birds-line-web.png`,
  birdsLineMobile: `${PUBLIC_BASE}drakht/birds-line-mobile.png`,
};
const WISHLIST_STORAGE_KEY = "zarder.shop.wishlist";

// ─── PRODUCTS DATA ─────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1, name: "Ararat Sovereign Ring", subtitle: "Armenian Heritage Collection",
    price: 1840, material: "18K Gold", gemstone: "Ruby",
    collection: "heritage", category: "rings",
    image: "https://images.unsplash.com/photo-1626784214536-d859187e0bd0?w=600&h=720&fit=crop&auto=format",
    isBestSeller: true, inStock: true,
    description: "Forged from 18K gold and set with a Burmese ruby, this ring traces the eternal silhouette of Mount Ararat across its band — Armenia's sacred horizon rendered in precious metal. Each piece is hand-finished by our master goldsmiths in Yerevan."
  },
  {
    id: 2, name: "Khachkar Cross Pendant", subtitle: "Armenian Heritage Collection",
    price: 2340, material: "18K Gold", gemstone: "Diamond",
    collection: "heritage", category: "necklaces",
    image: "https://images.unsplash.com/photo-1626784213922-d9f1e050cf8f?w=600&h=720&fit=crop&auto=format",
    isNew: true, inStock: true,
    description: "A refined interpretation of the sacred Armenian stone cross, paved with 48 brilliant-cut diamonds totalling 0.36ct. Carries centuries of devotion into a contemporary luxury statement. Presented with a fine 18K gold cable chain."
  },
  {
    id: 3, name: "Pomegranate Bloom Bracelet", subtitle: "Pomegranate Collection",
    price: 980, material: "18K Rose Gold", gemstone: "Garnet",
    collection: "pomegranate", category: "bracelets",
    image: "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600&h=720&fit=crop&auto=format",
    isBestSeller: true, inStock: true,
    description: "A garland of pomegranate blossoms cast in 18K rose gold and set with deep red Mozambican garnets. The Armenian symbol of abundance, fertility, and the warmth of family — worn on the wrist."
  },
  {
    id: 4, name: "Areni Sapphire Necklace", subtitle: "Luxury Collection",
    price: 3200, material: "18K Gold", gemstone: "Sapphire",
    collection: "luxury", category: "necklaces",
    image: "https://images.unsplash.com/photo-1611087388916-b6c97e01735b?w=600&h=720&fit=crop&auto=format",
    isNew: true, inStock: true,
    description: "Named for the ancient village where the world's oldest winery was unearthed, this necklace features a cascade of hand-set Ceylon sapphires suspended from a hand-woven 18K gold chain of extraordinary finesse."
  },
  {
    id: 5, name: "Arevakhach Sun Ring", subtitle: "Armenian Heritage Collection",
    price: 1560, material: "18K Gold", gemstone: "Citrine",
    collection: "heritage", category: "rings",
    image: "https://images.unsplash.com/photo-1561812350-932aed735105?w=600&h=720&fit=crop&auto=format",
    inStock: true,
    description: "The ancient Armenian sun-wheel — eternity's own symbol — sculpted in textured 18K gold and crowned with a warm citrine of 1.4ct. A talisman of enduring strength drawn from the Arevakhach of medieval Armenian manuscript borders."
  },
  {
    id: 6, name: "Ararat Mountain Band", subtitle: "Ararat Collection",
    price: 890, material: "Sterling Silver",
    collection: "ararat", category: "rings",
    image: "https://images.unsplash.com/photo-1602751584547-5fb8e6c21740?w=600&h=720&fit=crop&auto=format",
    inStock: true,
    description: "A clean band engraved with the twin peaks of Mount Ararat in meticulous relief. Oxidised sterling silver deepens the engraved silhouette against the polished surface — a meditation in metal on Armenia's eternal mountain."
  },
  {
    id: 7, name: "Alphabet 'Ա' Gold Pendant", subtitle: "Armenian Alphabet Collection",
    price: 740, material: "18K Gold",
    collection: "alphabet", category: "necklaces",
    image: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?w=600&h=720&fit=crop&auto=format",
    isNew: true, inStock: true,
    description: "The first letter of Mesrop Mashtots' Armenian alphabet — Ա (Ayb) — cast in solid 18K gold. Each letter is individually hand-finished and available for all 38 characters of the Armenian script. A deeply personal gift."
  },
  {
    id: 8, name: "Pomegranate Drop Earrings", subtitle: "Pomegranate Collection",
    price: 1120, material: "18K Gold", gemstone: "Garnet",
    collection: "pomegranate", category: "earrings",
    image: "https://images.unsplash.com/photo-1688406264720-e2f9389c9ed1?w=600&h=720&fit=crop&auto=format",
    isBestSeller: true, inStock: true,
    description: "Long pendulous earrings shaped as ripe pomegranates, their seeds rendered in 48 pavé-set garnets that catch light with every movement. Ear posts in 18K gold with secure butterfly backs."
  },
  {
    id: 9, name: "Nairi Diamond Pendant", subtitle: "Wedding Collection",
    price: 4800, material: "18K White Gold", gemstone: "Diamond",
    collection: "wedding", category: "necklaces",
    image: "https://images.unsplash.com/photo-1611583027838-515a1087afdb?w=600&h=720&fit=crop&auto=format",
    inStock: true,
    description: "A breathtaking bridal pendant featuring a 1.2ct oval diamond (E/VS1, GIA certified) suspended in a halo of 36 pavé diamonds, framed by an Armenian ornamental arch worked in 18K white gold."
  },
  {
    id: 10, name: "Everyday Stacking Ring Set", subtitle: "Everyday Collection",
    price: 620, material: "14K Gold",
    collection: "everyday", category: "rings",
    image: "https://images.unsplash.com/photo-1626784214536-d859187e0bd0?w=600&h=720&fit=crop&auto=format",
    inStock: true,
    description: "Three delicate 14K gold bands, each engraved with a different Armenian ornamental motif — pomegranate vine, Arevakhach, and mountain wave. Designed to layer beautifully together or stand alone."
  },
  {
    id: 11, name: "Ararat Bridal Set", subtitle: "Wedding Collection",
    price: 6400, originalPrice: 7200,
    material: "18K Rose Gold", gemstone: "Diamond",
    collection: "wedding", category: "rings",
    image: "https://images.unsplash.com/photo-1626784213922-d9f1e050cf8f?w=600&h=720&fit=crop&auto=format",
    isBestSeller: true, inStock: false,
    description: "An heirloom-quality bridal set — engagement ring and matching band — in 18K rose gold. The principal stone is a 1.5ct princess-cut diamond flanked by Armenian ornamental shoulder detailing worked in hand-engraved filigree."
  },
  {
    id: 12, name: "Nairi Manuscript Brooch", subtitle: "Limited Edition",
    price: 2100, material: "18K Gold", gemstone: "Pearl",
    collection: "luxury", category: "brooches",
    image: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?w=600&h=720&fit=crop&auto=format",
    isNew: true, inStock: true,
    description: "Inspired by the illuminated borders of medieval Armenian manuscripts from the Matenadaran, this brooch is a miniature work of art. Champlevé enamel in lapis lazuli blue, hand-applied gold filigree, centred with a Baroque South Sea pearl."
  }
];

const COLLECTIONS_DATA: Collection[] = [
  { id: "heritage", name: "Armenian Heritage", tagline: "The soul of a civilisation, shaped in gold", count: 24, price: 1680000, image: "https://images.unsplash.com/photo-1688406264720-e2f9389c9ed1?w=800&h=1000&fit=crop&auto=format" },
  { id: "alphabet", name: "Alphabet Collection", tagline: "Mesrop Mashtots' gift — worn close to the heart", count: 38, price: 690000, image: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?w=800&h=1000&fit=crop&auto=format" },
  { id: "ararat", name: "Ararat Collection", tagline: "Armenia's sacred mountain, forever present", count: 12, price: 980000, image: "https://images.unsplash.com/photo-1602751584547-5fb8e6c21740?w=800&h=1000&fit=crop&auto=format" },
  { id: "pomegranate", name: "Pomegranate", tagline: "Abundance, fertility, the warmth of family", count: 18, price: 1240000, image: "https://images.unsplash.com/photo-1529224677962-8f4c65e152fa?w=800&h=1000&fit=crop&auto=format" },
  { id: "wedding", name: "Wedding Collection", tagline: "Jewels to mark life's most sacred union", count: 30, price: 2850000, image: "https://images.unsplash.com/photo-1611583027838-515a1087afdb?w=800&h=1000&fit=crop&auto=format" },
  { id: "luxury", name: "Luxury Collection", tagline: "Exhibition-level craft for those who seek the extraordinary", count: 15, price: 2150000, image: "https://images.unsplash.com/photo-1611087388916-b6c97e01735b?w=800&h=1000&fit=crop&auto=format" },
];

const DEFAULT_SHOP_INFO: ShopInfo = {
  name: "Zarder",
  email: "",
  phone: "",
  address: "",
};

const REVIEWS = [
  { name: "Anahit Vardanyan", location: "Yerevan, Armenia", rating: 5, text: "I ordered the Ararat ring as an anniversary gift. The quality is extraordinary — it looks even more beautiful in person than in the photographs. Areni truly captures the spirit of Armenia in every piece.", product: "Ararat Sovereign Ring" },
  { name: "Sarah Mkrtchyan", location: "Los Angeles, USA", rating: 5, text: "As an Armenian-American, wearing my Khachkar pendant connects me to my heritage in a way that feels both modern and profoundly meaningful. The craftsmanship is impeccable — rivalling anything I have seen from European houses.", product: "Khachkar Cross Pendant" },
  { name: "Hayk Torossian", location: "Paris, France", rating: 5, text: "The packaging alone was a luxury experience. Inside was the most delicate pomegranate bracelet I have ever seen. When my wife opened it she wept. This is exactly what Armenian jewellery should feel like to the world.", product: "Pomegranate Bloom Bracelet" },
  { name: "Emma Kazarian", location: "London, UK", rating: 5, text: "I commissioned a custom piece with my grandmother's name in Armenian script. The process was seamless — they kept me informed at every stage — and the result is a true family heirloom. Beyond five stars.", product: "Custom Alphabet Pendant" },
  { name: "Nare Avetisyan", location: "Beirut, Lebanon", rating: 5, text: "Areni is what Armenian jewellery should look like internationally. Uncompromising quality. At the launch event in Dubai, every guest asked where my earrings were from. Pure pride.", product: "Pomegranate Drop Earrings" },
  { name: "David Lalayan", location: "Sydney, Australia", rating: 5, text: "The bridal set arrived six weeks before our wedding. My fiancée has not taken it off since opening the box. Every compliment at the reception was directed at her ring. Thank you, Areni.", product: "Ararat Bridal Set" },
];

// ─── DECORATIVE SVG COMPONENTS ────────────────────────────────────────────────

function ArevakhachSymbol({ size = 40, className = "" }: { size?: number; className?: string }) {
  const arms = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g transform="translate(50,50)">
        {arms.map((angle) => (
          <path
            key={angle}
            d="M0,0 C6,-12 12,-26 0,-38 C-12,-26 -6,-12 0,0"
            transform={`rotate(${angle})`}
            fill="currentColor"
            opacity="0.88"
          />
        ))}
        <circle r="6" fill="currentColor" />
      </g>
    </svg>
  );
}

function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`drakht-divider ${className}`} aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcSet={DRAKHT_ASSETS.birdsLineMobile} />
        <img
          src={DRAKHT_ASSETS.birdsLineWeb}
          alt=""
          className="mx-auto h-8 w-full object-contain opacity-75 md:h-9"
        />
      </picture>
    </div>
  );
}

function PomegranateIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 4 C12 4 10 2 12 1 C14 2 12 4 12 4Z" fill="currentColor" opacity="0.7"/>
      <path d="M12 4 C7 4 4 8 4 13 C4 18 7.5 21 12 21 C16.5 21 20 18 20 13 C20 8 17 4 12 4Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5"/>
      <circle cx="9" cy="11" r="1.2" fill="currentColor" opacity="0.6"/>
      <circle cx="12" cy="10" r="1.2" fill="currentColor" opacity="0.6"/>
      <circle cx="15" cy="11" r="1.2" fill="currentColor" opacity="0.6"/>
      <circle cx="10" cy="14" r="1.2" fill="currentColor" opacity="0.6"/>
      <circle cx="13" cy="14" r="1.2" fill="currentColor" opacity="0.6"/>
      <circle cx="11.5" cy="17" r="1.2" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
  isWishlisted,
}: {
  product: Product;
  onAddToCart: (p: Product, quantity?: number) => void;
  onToggleWishlist: (id: number) => void;
  onViewProduct: (id: number) => void;
  isWishlisted: boolean;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!product.inStock) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleWishlist(product.id);
  };

  return (
    <div
      className="group relative flex cursor-pointer flex-col"
      onClick={() => onViewProduct(product.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onViewProduct(product.id);
      }}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-primary text-primary-foreground font-heading text-[10px] tracking-[0.2em] uppercase px-2.5 py-1">Նոր</span>
          )}
          {product.isBestSeller && (
            <span className="bg-foreground/90 text-background font-heading text-[10px] tracking-[0.2em] uppercase px-2.5 py-1">Սիրված</span>
          )}
          {!product.inStock && (
            <span className="bg-muted text-muted-foreground font-heading text-[10px] tracking-[0.2em] uppercase px-2.5 py-1">Առկա չէ</span>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="pt-4 pb-2">
        <p className="font-body text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1">{product.subtitle}</p>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-sm tracking-wide text-foreground leading-snug mb-2 transition-colors group-hover:text-primary">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-heading text-primary text-sm tracking-wide">{formatAmdPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="font-body text-muted-foreground text-xs line-through">{formatAmdPrice(product.originalPrice)}</span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="grid h-8 w-8 place-items-center border border-border bg-black/20 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={product.inStock ? "Add to cart" : "Out of stock"}
              title={product.inStock ? "Add to cart" : "Out of stock"}
            >
              {added ? <Check size={14} /> : <ShoppingBag size={14} />}
            </button>
            <button
              onClick={handleWishlist}
              className={`grid h-8 w-8 place-items-center border transition-colors ${isWishlisted ? "border-primary bg-primary text-primary-foreground" : "border-border bg-black/20 text-muted-foreground hover:border-primary hover:text-primary"}`}
              aria-label="Նախընտրածներ"
              title="Նախընտրածներ"
            >
              <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────

function CartDrawer({
  isOpen, onClose, items, onQuantityChange, total, onCheckout, message,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onQuantityChange: (item: CartItem, delta: number) => void;
  total: number;
  onCheckout: () => void;
  message: string;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col transition-transform duration-400 ease-out`}
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <ArevakhachSymbol size={20} className="text-primary" />
            <h2 className="font-heading text-sm tracking-[0.2em] uppercase">Զամբյուղ</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {message && (
          <div className="border-b border-border bg-secondary/30 px-6 py-3">
            <p className="font-body text-[11px] leading-relaxed text-muted-foreground">{message}</p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={40} className="text-muted-foreground/40" />
              <p className="font-heading text-xs tracking-[0.2em] uppercase text-muted-foreground">Զամբյուղը դատարկ է</p>
              <button onClick={onClose} className="font-body text-xs text-primary underline underline-offset-4">Շարունակել գնումները</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={cartItemKey(item)} className="flex gap-4">
                <div className="w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <p className="font-heading text-[11px] tracking-wider text-foreground leading-snug">{item.product.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                      {item.kind === "collection" ? "Ամբողջ հավաքածու" : item.product.material}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border border-border">
                      <button onClick={() => onQuantityChange(item, -1)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="font-heading text-xs w-5 text-center">{item.quantity}</span>
                      <button onClick={() => onQuantityChange(item, 1)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-heading text-sm text-primary">{formatAmdPrice(cartItemTotal(item))}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-body text-xs text-muted-foreground tracking-wider uppercase">Ընդհանուր</span>
              <span className="font-heading text-lg text-primary">{formatAmdPrice(total)}</span>
            </div>
            <p className="font-body text-[10px] text-muted-foreground">Առաքման պայմանները կհստակեցվեն պատվերի ընթացքում։</p>
            <button onClick={onCheckout} className="w-full py-3.5 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors">
              Ձևակերպել պատվերը
            </button>
            <button onClick={onClose} className="w-full py-3 border border-border text-foreground/70 font-heading text-[10px] tracking-[0.2em] uppercase hover:border-primary hover:text-primary transition-all">
              Շարունակել գնումները
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

function Nav({
  currentPage, onNavigate, cartCount, wishlistCount, onCartOpen, onAccountOpen, isAuthenticated, isScrolled, mobileOpen, setMobileOpen, themeMode, onThemeToggle,
}: {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  cartCount: number;
  wishlistCount: number;
  onCartOpen: () => void;
  onAccountOpen: () => void;
  isAuthenticated: boolean;
  isScrolled: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  themeMode: ThemeMode;
  onThemeToggle: () => void;
}) {
  const navLinks: { label: string; page: Page }[] = [
    { label: "Հայկականը", page: "home" },
    { label: "Զարդերը", page: "shop" },
    { label: "Հավաքածուներ", page: "collections" },
    { label: "Մեր մասին", page: "about" },
    { label: "Անհատական պատվերներ", page: "custom" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm transition-all duration-400 ${isScrolled ? "shadow-[0_10px_30px_rgba(0,0,0,0.18)]" : ""}`}>
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[260px_1fr_260px] items-center gap-4 px-5 md:px-12 py-2.5 md:py-3">
        {/* Logo */}
        <button onClick={() => onNavigate("home")} className="flex items-center justify-start group" aria-label="Դրախտ գլխավոր էջ">
          <picture>
            <source media="(max-width: 767px)" srcSet={DRAKHT_ASSETS.logoMobile} />
            <img
              src={DRAKHT_ASSETS.logoWeb}
              alt="Դրախտ"
              className={`h-[34px] w-auto max-w-[210px] object-contain opacity-90 transition-all group-hover:opacity-100 md:h-[28px] ${themeMode === "light" ? "invert" : ""}`}
            />
          </picture>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8">
          {navLinks.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`font-heading text-[11px] tracking-[0.08em] transition-colors relative group ${currentPage === page ? "text-foreground" : "text-foreground/70 hover:text-foreground"}`}
            >
              {label}
              <span className={`absolute -bottom-1 left-0 right-0 h-px bg-foreground/70 transition-transform duration-300 origin-left ${currentPage === page ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
            </button>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center justify-end gap-4">
          <button onClick={onThemeToggle} className="grid h-8 w-8 place-items-center border border-border text-foreground/65 transition-colors hover:border-primary hover:text-primary" aria-label={themeMode === "dark" ? "Միացնել բաց ռեժիմը" : "Միացնել մուգ ռեժիմը"} title={themeMode === "dark" ? "Բաց ռեժիմ" : "Մուգ ռեժիմ"}>
            {themeMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => onNavigate("shop")} className="hidden md:flex text-foreground/65 hover:text-foreground transition-colors" aria-label="Որոնում">
            <Search size={17} />
          </button>
          <button className="relative text-foreground/65 hover:text-foreground transition-colors" aria-label="Նախընտրածներ">
            <Heart size={17} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-heading rounded-full flex items-center justify-center">{wishlistCount}</span>
            )}
          </button>
          <button onClick={onAccountOpen} className="relative text-foreground/65 hover:text-foreground transition-colors" aria-label={isAuthenticated ? "Անձնական էջ" : "Մուտք"}>
            <User size={17} />
            {isAuthenticated && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
          <button onClick={onCartOpen} className="relative text-foreground/65 hover:text-foreground transition-colors" aria-label="Զամբյուղ">
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-heading rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </button>
          <button className="md:hidden text-foreground/70 hover:text-foreground transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Մենյու">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden border-t border-border transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-80" : "max-h-0"}`}>
        <nav className="flex flex-col px-6 py-4 gap-4 bg-background/98">
          {navLinks.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => { onNavigate(page); setMobileOpen(false); }}
              className={`font-heading text-xs tracking-[0.08em] text-left transition-colors ${currentPage === page ? "text-foreground" : "text-foreground/70"}`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { onAccountOpen(); setMobileOpen(false); }}
              className="font-heading text-xs tracking-[0.08em] text-left text-foreground/70 transition-colors"
            >
              {isAuthenticated ? "Անձնական էջ" : "Մուտք"}
            </button>
          </nav>
        </div>
      </header>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

function HeroSection({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section className="relative w-full min-h-[720px] overflow-hidden border-b border-white/15 bg-black md:min-h-[calc(100vh-54px)]">
      <picture className="absolute inset-0">
        <source media="(max-width: 767px)" srcSet={DRAKHT_ASSETS.heroMobile} />
        <img
          src={DRAKHT_ASSETS.heroWeb}
          alt="Դրախտ հայկական զարդերի գլխավոր էջ"
          className="h-full w-full object-cover object-center opacity-95"
        />
      </picture>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_32%,rgba(255,255,255,0.08),transparent_26%),linear-gradient(90deg,rgba(0,0,0,0.26),transparent_50%,rgba(0,0,0,0.18))]" />

      {/* Actions are live HTML over the supplied Drakht hero artwork. */}
      <div className="absolute left-[7.5%] bottom-[11%] z-10 md:bottom-[11.5%]">
        <div
          className="transition-all duration-1000"
          style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(24px)" }}
        >
          <div className="flex flex-wrap gap-2.5 md:gap-3">
            <button
              onClick={() => onNavigate("shop")}
              className="group border border-white bg-white px-4 py-2.5 font-heading text-[11px] tracking-[0.04em] text-black transition-all hover:bg-white/85 md:px-5 md:py-3"
            >
              Տեսականի / Հավաքածուներ
              <ArrowRight size={13} className="ml-2 inline-block align-[-2px] transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate("custom")}
              className="border border-white/35 bg-black/25 px-4 py-2.5 font-heading text-[11px] tracking-[0.04em] text-white transition-all hover:border-white hover:bg-white hover:text-black md:px-5 md:py-3"
            >
              Անհատական պատվերներ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── COLLECTIONS PREVIEW ──────────────────────────────────────────────────────

function CollectionsPreview({
  onNavigate,
  onViewCollection,
  collections,
}: {
  onNavigate: (p: Page) => void;
  onViewCollection: (id: string) => void;
  collections: Collection[];
}) {
  const featured = collections.slice(0, 5);
  if (featured.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-20 md:py-28">
      {/* Section header */}
      <div className="text-center mb-14">
        <h2 className="font-heading text-3xl md:text-4xl tracking-wider mb-5">Հավաքածուներ</h2>
        <OrnamentalDivider className="mx-auto w-[min(72vw,720px)]" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {featured.map((col, i) => (
          <button
            key={col.id}
            onClick={() => onViewCollection(col.id)}
            className={`group relative overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            style={{ aspectRatio: i === 0 ? "auto" : "3/4" }}
          >
            <div className={`relative overflow-hidden ${i === 0 ? "h-full min-h-[420px]" : "aspect-[3/4]"}`}>
              <img src={col.image} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                <p className="font-body text-[9px] tracking-[0.25em] text-primary/80 uppercase mb-1">{col.count} զարդ</p>
                <h3 className="font-heading text-base md:text-lg tracking-wide text-white leading-snug">{col.name}</h3>
                <p className="mt-1 font-heading text-xs tracking-wide text-primary">{formatAmdPrice(col.price)}</p>
                {i === 0 && <p className="font-body text-xs text-white/60 mt-1.5 leading-relaxed hidden md:block">{col.tagline}</p>}
                <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="font-heading text-[10px] tracking-[0.2em] text-primary uppercase">Դիտել</span>
                  <ArrowRight size={11} className="text-primary" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={() => onNavigate("collections")}
          className="font-heading text-[11px] tracking-[0.25em] uppercase text-primary border-b border-primary/40 pb-0.5 hover:border-primary transition-colors"
        >
          Դիտել բոլոր հավաքածուները
        </button>
      </div>
    </section>
  );
}

// ─── CATEGORY CAROUSEL ───────────────────────────────────────────────────────

function CategoryCarousel({ onViewCategory, products }: { onViewCategory: (category: string) => void; products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const categories = useMemo(() => {
    const grouped = new Map<string, { id: string; name: string; count: number; image: string }>();
    products.forEach((product) => {
      const existing = grouped.get(product.category);

      if (existing) {
        existing.count += 1;
        return;
      }

      grouped.set(product.category, {
        id: product.category,
        name: product.categoryLabel || titleCase(product.category),
        count: 1,
        image: product.image,
      });
    });

    return Array.from(grouped.values());
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth",
    });
  };

  if (categories.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-16 md:py-24 bg-secondary/30">
      <div className="relative mb-10 text-center">
        <h2 className="font-heading text-3xl md:text-4xl tracking-wider">Կատեգորիաներ</h2>
        <OrnamentalDivider className="mx-auto mt-5 w-[min(72vw,720px)]" />
      </div>

      <div className="relative mx-auto max-w-[1728px]">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-primary/35 bg-black/60 text-primary transition-colors hover:border-primary hover:bg-primary hover:text-black md:-left-5"
          aria-label="Նախորդ կատեգորիաներ"
        >
          <ChevronLeft size={19} />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-primary/35 bg-black/60 text-primary transition-colors hover:border-primary hover:bg-primary hover:text-black md:-right-5"
          aria-label="Հաջորդ կատեգորիաներ"
        >
          <ChevronRight size={19} />
        </button>
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onViewCategory(category.id)}
              className="group relative h-[360px] min-w-[78vw] snap-start overflow-hidden text-left sm:min-w-[360px] md:min-w-[420px]"
            >
              <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <p className="mb-2 font-body text-[9px] tracking-[0.28em] uppercase text-primary/85">{category.count} ապրանք</p>
                <h3 className="font-heading text-xl tracking-wide text-white">{category.name}</h3>
                <div className="mt-4 inline-flex items-center gap-2 font-heading text-[10px] tracking-[0.22em] uppercase text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Դիտել
                  <ArrowRight size={12} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRODUCTS GRID (reusable) ─────────────────────────────────────────────────

function ProductsGrid({
  title, subtitle, products, onAddToCart, onToggleWishlist, onViewProduct, wishlist,
}: {
  title: string; subtitle: string; products: Product[];
  onAddToCart: (p: Product, quantity?: number) => void;
  onToggleWishlist: (id: number) => void;
  onViewProduct: (id: number) => void;
  wishlist: number[];
}) {
  return (
    <section className="px-6 md:px-12 py-16 md:py-24 bg-secondary/30">
      <div className="text-center mb-12">
        <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-3">{subtitle}</p>
        <h2 className="font-heading text-3xl md:text-4xl tracking-wider">{title}</h2>
        <OrnamentalDivider className="mx-auto mt-5 w-[min(72vw,720px)]" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onViewProduct={onViewProduct}
            isWishlisted={wishlist.includes(p.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ProductCategorySlider({
  title,
  subtitle,
  products,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
  wishlist,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  onAddToCart: (p: Product, quantity?: number) => void;
  onToggleWishlist: (id: number) => void;
  onViewProduct: (id: number) => void;
  wishlist: number[];
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-secondary/30 px-6 py-16 md:px-12 md:py-24">
      <div className="mb-10 text-center">
        <p className="mb-3 font-body text-[10px] uppercase tracking-[0.35em] text-primary">{subtitle}</p>
        <h2 className="font-heading text-3xl tracking-wider md:text-4xl">{title}</h2>
        <OrnamentalDivider className="mx-auto mt-5 w-[min(72vw,720px)]" />
      </div>

      <div className="relative mx-auto max-w-[1728px]">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-[42%] z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-primary/35 bg-black/70 text-primary transition-colors hover:border-primary hover:bg-primary hover:text-black md:-left-5"
          aria-label="Նախորդ զարդերը"
        >
          <ChevronLeft size={19} />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-[42%] z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-primary/35 bg-black/70 text-primary transition-colors hover:border-primary hover:bg-primary hover:text-black md:-right-5"
          aria-label="Հաջորդ զարդերը"
        >
          <ChevronRight size={19} />
        </button>
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[76vw] snap-start sm:min-w-[320px] md:min-w-[360px]">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onViewProduct={onViewProduct}
                isWishlisted={wishlist.includes(product.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HERITAGE BANNER ──────────────────────────────────────────────────────────

function HeritageBanner({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="relative overflow-hidden min-h-[480px] flex items-center">
      <img
        src="https://images.unsplash.com/photo-1529224677962-8f4c65e152fa?w=1600&h=900&fit=crop&auto=format"
        alt="Pomegranates — symbol of Armenian abundance"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-background/85" />
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ArevakhachSymbol size={400} className="text-primary" />
        </div>
      </div>

      <div className="relative z-10 px-6 md:px-16 py-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <PomegranateIcon size={20} className="text-primary" />
          <span className="font-body text-[10px] tracking-[0.35em] text-primary uppercase">Հայկական ժառանգության հավաքածու</span>
        </div>
        <h2 className="font-heading text-3xl md:text-5xl tracking-wider text-foreground leading-snug mb-6">
          3000 տարվա<br />զարդարվեստը<br />
          <span className="text-primary">այսօրվա մեջ</span>
        </h2>
        <p className="font-body text-sm md:text-base text-foreground/65 leading-relaxed mb-8 font-light max-w-xl">
          Հայկական զարդարվեստի հնագույն նախշերը մենք վերածում ենք ժամանակակից արծաթյա զարդերի՝ պահպանելով ձևի նրբությունը, խորհրդանիշի ուժը և ձեռքի աշխատանքի արժեքը։
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate("collections")}
            className="group px-7 py-3 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase flex items-center gap-3 hover:bg-primary/90 transition-all"
          >
            Դիտել հավաքածուները
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigate("about")}
            className="px-7 py-3 border border-foreground/25 text-foreground/80 font-heading text-xs tracking-[0.2em] uppercase hover:border-primary hover:text-primary transition-all"
          >
            Մեր մասին
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── BRAND STORY ──────────────────────────────────────────────────────────────

function BrandStorySection() {
  return (
    <section id="about-us" className="grid scroll-mt-24 md:grid-cols-2 min-h-[560px]">
      {/* Image */}
      <div className="relative overflow-hidden min-h-[360px] md:min-h-0">
        <img
          src="https://images.unsplash.com/photo-1688406264720-e2f9389c9ed1?w=900&h=1000&fit=crop&auto=format"
          alt="Areni master goldsmith at work"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60 hidden md:block" />
        {/* Gold corner accent */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-primary/50" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-primary/50" />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center px-8 md:px-14 py-16 bg-secondary/20">
        <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-4">Մեր մասին</p>
        <h2 className="font-heading text-2xl md:text-3xl tracking-wider mb-6 leading-snug">
          Ծնված Երևանում։<br />Սիրված ամբողջ աշխարհում։
        </h2>
        <OrnamentalDivider className="max-w-48 mb-7" />
        <div className="space-y-4 font-body text-sm text-foreground/70 leading-relaxed font-light">
          <p>«Դրախտ»-ը հայկական զարդերի բրենդ է, որտեղ արծաթը, ձեռքի աշխատանքը և հայկական խորհրդանշանները միավորվում են ժամանակակից նրբագեղության մեջ։ Մեր զարդերը ստեղծվում են այն մարդկանց համար, ովքեր ուզում են կրել ոչ միայն գեղեցիկ իր, այլ նաև հիշողություն, ինքնություն և պատմություն։</p>
          <p>Յուրաքանչյուր զարդ ծնվում է մանրակրկիտ աշխատանքի արդյունքում՝ էսքիզից մինչև վերջնական փայլեցում։ Մենք կարևորում ենք մաքուր ձևերը, հարմար կրելը, որակյալ քարերի ընտրությունը և այնպիսի դիզայնը, որը կարող է ապրել ամենօրյա կերպարում ու մնալ արժեքավոր տարիների ընթացքում։</p>
          <p>Մեր ոգեշնչումը հայկական զարդարվեստն է՝ նռան, Արարատի, արևախաչի, տառերի և հնագույն նախշերի լեզուն։ Այդ ժառանգությունը մենք ներկայացնում ենք զուսպ, ժամանակակից և կրելի ձևով։</p>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center">
              <span className="font-display text-primary text-xs">Դ</span>
            </div>
          </div>
          <div>
            <p className="font-heading text-sm tracking-wide text-foreground">Դրախտ</p>
            <p className="font-body text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Հայկական արծաթյա զարդեր</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES STRIP ───────────────────────────────────────────────────────────

function FeaturesStrip() {
  const features = [
    { icon: <Gem size={20} />, title: "Որակյալ քարեր", desc: "Ընտրված քարեր և ստուգված մատակարարներ" },
    { icon: <Award size={20} />, title: "Ձեռքի աշխատանք", desc: "Մանրակրկիտ մշակված հայկական զարդեր" },
    { icon: <Shield size={20} />, title: "Երաշխիք", desc: "Յուրաքանչյուր զարդ ստուգվում է առաքումից առաջ" },
    { icon: <Package size={20} />, title: "Նվերային փաթեթավորում", desc: "Ներկայանալի տուփ յուրաքանչյուր պատվերի համար" },
    { icon: <RefreshCw size={20} />, title: "Փոխանակման հնարավորություն", desc: "Հարմար պայմաններ պատվերը փոխելու համար" },
    { icon: <Clock size={20} />, title: "Անհատական պատվեր", desc: "Պատրաստում ըստ ձեր նախընտրած գաղափարի" },
  ];

  return (
    <section className="border-y border-border bg-card py-12 px-6 md:px-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4">
        {features.map(({ icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center gap-3 group">
            <div className="text-primary/70 group-hover:text-primary transition-colors">{icon}</div>
            <div>
              <p className="font-heading text-[11px] tracking-[0.15em] uppercase text-foreground mb-1">{title}</p>
              <p className="font-body text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

function ReviewsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="px-6 md:px-12 py-20 md:py-28">
      <div className="text-center mb-14">
        <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-3">Հաճախորդների կարծիքներ</p>
        <h2 className="font-heading text-3xl md:text-4xl tracking-wider">Մեզ վստահողների խոսքերը</h2>
        <OrnamentalDivider className="max-w-xs mx-auto mt-5" />
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {REVIEWS.slice(0, 3).map((review, i) => (
          <div key={i} className="border border-border p-6 md:p-8 relative group hover:border-primary/40 transition-colors">
            {/* Corner accent */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-primary/30 group-hover:border-primary/60 transition-colors" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-primary/30 group-hover:border-primary/60 transition-colors" />

            <div className="flex gap-0.5 mb-5">
              {Array.from({ length: review.rating }).map((_, j) => (
                <Star key={j} size={11} fill="currentColor" className="text-primary" />
              ))}
            </div>
            <blockquote className="font-body text-sm text-foreground/75 leading-relaxed mb-6 font-light italic">
              "{review.text}"
            </blockquote>
            <div className="border-t border-border/40 pt-4 flex items-center justify-between">
              <div>
                <p className="font-heading text-[11px] tracking-wide text-foreground">{review.name}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{review.location}</p>
              </div>
              <p className="font-body text-[9px] tracking-[0.15em] text-primary/70 uppercase text-right max-w-24 leading-tight">{review.product}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          {[4.9, 5, 4.8, 5, 4.9, 5].map((r, i) => (
            <Star key={i} size={13} fill="currentColor" className="text-primary" />
          ))}
        </div>
        <p className="font-heading text-sm text-primary">4.97 / 5</p>
        <p className="font-body text-[10px] text-muted-foreground tracking-wider uppercase mt-1">847 հաստատված կարծիքից</p>
      </div>
    </section>
  );
}

// ─── INSTAGRAM GALLERY ────────────────────────────────────────────────────────

function InstagramGallery() {
  const images = [
    "https://images.unsplash.com/photo-1626784214536-d859187e0bd0?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1611583027838-515a1087afdb?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1626784213922-d9f1e050cf8f?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1561812350-932aed735105?w=400&h=400&fit=crop&auto=format",
  ];

  return (
    <section className="py-16 bg-secondary/20">
      <div className="text-center mb-10 px-6">
        <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-2">Հետևեք մեր աշխարհին</p>
        <a href="#" className="font-heading text-2xl tracking-wider hover:text-primary transition-colors flex items-center justify-center gap-2">
          <Instagram size={20} className="text-primary" /> @areni.jewels
        </a>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 px-1">
        {images.map((src, i) => (
          <div key={i} className="relative overflow-hidden aspect-square group cursor-pointer">
            <img src={src} alt={`Areni jewellery ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <Instagram size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSent(true); setEmail(""); }
  };

  return (
    <section className="px-6 md:px-12 py-20 border-t border-border">
      <div className="max-w-xl mx-auto text-center">
        <ArevakhachSymbol size={36} className="text-primary mx-auto mb-6" />
        <h2 className="font-heading text-2xl md:text-3xl tracking-wider mb-3">Ստացեք Դրախտի նորությունները</h2>
        <p className="font-body text-sm text-muted-foreground mb-8 leading-relaxed">
          Նոր հավաքածուներ, անհատական պատվերների պատմություններ և հատուկ առաջարկներ՝ ուղարկված նույն խնամքով, ինչ մեր զարդերը։
        </p>
        {sent ? (
          <div className="flex items-center justify-center gap-3 py-4 border border-primary/30 text-primary">
            <Check size={16} />
            <span className="font-heading text-xs tracking-[0.2em] uppercase">Շնորհակալություն միանալու համար</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ձեր էլ․ հասցեն"
              required
              className="flex-1 bg-input-background border border-border px-5 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-primary text-primary-foreground font-heading text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              Բաժանորդագրվել
            </button>
          </form>
        )}
        <p className="font-body text-[10px] text-muted-foreground mt-4">Բաժանորդագրվելով՝ համաձայնում եք ստանալ մեր նորությունները։ Ձեր տվյալները չենք փոխանցում երրորդ կողմերի։</p>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer({ onNavigate, shopInfo }: { onNavigate: (p: Page) => void; shopInfo: ShopInfo }) {
  return (
    <footer className="bg-card border-t border-border px-6 md:px-12 pt-16 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-5">
            <ArevakhachSymbol size={28} className="text-primary" />
            <div>
              <p className="font-display text-lg tracking-[0.3em] text-foreground leading-none">ԴՐԱԽՏ</p>
              <p className="font-body text-[8px] tracking-[0.3em] text-muted-foreground uppercase">Հայկական զարդեր</p>
            </div>
          </div>
          <p className="font-body text-xs text-muted-foreground leading-relaxed mb-6">
            Հայկական արծաթյա զարդեր՝ ոգեշնչված ժառանգությունից և ստեղծված ժամանակակից կրելու համար։
          </p>
          <div className="space-y-2 mb-6">
            <a href={`tel:${shopInfo.phone.replace(/\s/g, "")}`} className="font-body text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Phone size={12} className="text-primary" /> {shopInfo.phone}
            </a>
            <a href={`mailto:${shopInfo.email}`} className="font-body text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Mail size={12} className="text-primary" /> {shopInfo.email}
            </a>
          </div>
          <div className="flex gap-3">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          { title: "Հավաքածուներ", links: [["Ժառանգություն", "collections"], ["Հայկական տառեր", "collections"], ["Նուռ", "collections"], ["Արարատ", "collections"], ["Ամենօրյա", "collections"]] },
          { title: "Բրենդ", links: [["Մեր մասին", "about"], ["Ձեռքի աշխատանք", "about"], ["Անհատական պատվեր", "custom"], ["Կապ", "contact"]] },
          { title: "Օգնություն", links: [["Կապ մեզ հետ", "contact"], ["Հարցեր", "contact"], ["Առաքում և փոխանակում", "contact"], ["Զարդերի խնամք", "contact"]] },
        ].map(({ title, links }) => (
          <div key={title}>
            <p className="font-heading text-[10px] tracking-[0.28em] uppercase text-foreground mb-5">{title}</p>
            <ul className="space-y-3">
              {links.map(([label, page]) => (
                <li key={label}>
                  <button onClick={() => onNavigate(page as Page)} className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <OrnamentalDivider className="mb-8" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-body text-[10px] text-muted-foreground">
          © 2026 Դրախտ։ Բոլոր իրավունքները պաշտպանված են։
        </p>
        <div className="flex items-center gap-6">
          {["Գաղտնիության քաղաքականություն", "Օգտագործման պայմաններ", "Cookie քաղաքականություն"].map((t) => (
            <a key={t} href="#" className="font-body text-[10px] text-muted-foreground hover:text-primary transition-colors">{t}</a>
          ))}
        </div>
      </div>

      {/* Payment icons */}
      <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
        {["Visa", "Mastercard", "Apple Pay", "Google Pay", "Idram", "Բանկային փոխանցում"].map((p) => (
          <span key={p} className="font-heading text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 border border-border/60 text-muted-foreground/60">{p}</span>
        ))}
      </div>
    </footer>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage({
  onNavigate, onViewCategory, onAddToCart, onToggleWishlist, onViewProduct, onViewCollection, wishlist, products, collections, isLoading, catalogMessage, onRetry,
}: {
  onNavigate: (p: Page) => void;
  onViewCategory: (category: string) => void;
  onAddToCart: (p: Product, quantity?: number) => void;
  onToggleWishlist: (id: number) => void;
  onViewProduct: (id: number) => void;
  onViewCollection: (id: string) => void;
  wishlist: number[];
  products: Product[];
  collections: Collection[];
  isLoading: boolean;
  catalogMessage: string;
  onRetry: () => void;
}) {
  const bestSellers = products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 4);
  const bestSellerShelf = (bestSellers.length ? bestSellers : products.slice(4)).slice(0, 4);

  return (
    <>
      <HeroSection onNavigate={onNavigate} />
      <CollectionsPreview onNavigate={onNavigate} onViewCollection={onViewCollection} collections={collections} />
      {isLoading && (
        <div className="px-6 md:px-12 py-4 border-y border-border bg-secondary/20 text-center">
          <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Բեռնվում է ընթացիկ հավաքածուն</p>
        </div>
      )}
      {catalogMessage && !isLoading && (
        <div className="px-6 md:px-12 py-4 border-y border-border bg-secondary/20 text-center">
          <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{catalogMessage}</p>
          {products.length === 0 && (
            <button type="button" onClick={onRetry} className="mt-2 font-heading text-[10px] uppercase tracking-[0.2em] text-primary underline underline-offset-4">
              Փորձել կրկին
            </button>
          )}
        </div>
      )}
      <CategoryCarousel onViewCategory={onViewCategory} products={products} />
      <HeritageBanner onNavigate={onNavigate} />
      <ProductsGrid
        title="Սիրված զարդեր"
        subtitle="Ամենաշատ ընտրված"
        products={bestSellerShelf.length ? bestSellerShelf : products.slice(0, 4)}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        onViewProduct={onViewProduct}
        wishlist={wishlist}
      />
      <BrandStorySection />
      <FeaturesStrip />
      <ReviewsSection />
      <InstagramGallery />
      <NewsletterSection />
    </>
  );
}

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────

function ShopPage({
  onAddToCart, onToggleWishlist, onViewProduct, wishlist, products, collections, isLoading, catalogMessage, onRetry, initialCategory,
}: {
  onAddToCart: (p: Product, quantity?: number) => void;
  onToggleWishlist: (id: number) => void;
  onViewProduct: (id: number) => void;
  wishlist: number[];
  products: Product[];
  collections: Collection[];
  isLoading: boolean;
  catalogMessage: string;
  onRetry: () => void;
  initialCategory: string;
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: initialCategory || "all", collection: "all", inStock: false });
  const [sort, setSort] = useState("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>();
    products.forEach((product) => categories.set(product.category, product.categoryLabel || titleCase(product.category)));
    return [["all", "Բոլոր զարդերը"], ...Array.from(categories.entries())] as [string, string][];
  }, [products]);

  const collectionOptions = useMemo(() => {
    return [["all", "Բոլոր հավաքածուները"], ...collections.map((collection) => [collection.id, collection.name])] as [string, string][];
  }, [collections]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
    if (filters.category !== "all") result = result.filter((p) => p.category === filters.category);
    if (filters.collection !== "all") result = result.filter((p) => p.collectionIds.includes(filters.collection));
    if (filters.inStock) result = result.filter((p) => p.inStock);
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "newest") result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else if (sort === "bestseller") result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    return result;
  }, [products, search, filters, sort]);

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-foreground mb-4">Կատեգորիա</p>
        <div className="space-y-2.5">
          {categoryOptions.map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setFilters((f) => ({ ...f, category: cat }))}
              className={`flex items-center gap-2.5 font-body text-xs transition-colors ${filters.category === cat ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className={`w-3 h-3 border transition-colors ${filters.category === cat ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                {filters.category === cat && <Check size={8} className="text-primary-foreground m-auto" style={{ display: "flex", alignItems: "center", justifyContent: "center" }} />}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Collection */}
      <div>
        <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-foreground mb-4">Հավաքածու</p>
        <div className="space-y-2.5">
          {collectionOptions.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilters((f) => ({ ...f, collection: val }))}
              className={`flex items-center gap-2.5 font-body text-xs transition-colors ${filters.collection === val ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className={`w-3 h-3 border transition-colors flex items-center justify-center ${filters.collection === val ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                {filters.collection === val && <Check size={8} className="text-primary-foreground" />}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <button
          onClick={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
          className={`flex items-center gap-2.5 font-body text-xs transition-colors ${filters.inStock ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <span className={`w-3 h-3 border transition-colors flex items-center justify-center ${filters.inStock ? "border-primary bg-primary" : "border-muted-foreground"}`}>
            {filters.inStock && <Check size={8} className="text-primary-foreground" />}
          </span>
          Միայն առկա
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-24 min-h-screen">
      {/* Page header */}
      <div className="px-6 md:px-12 py-10 border-b border-border text-center">
        <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-2">Ամբողջ տեսականին</p>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wider">Բոլոր զարդերը</h1>
        <OrnamentalDivider className="max-w-xs mx-auto mt-4" />
      </div>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-56 flex-shrink-0 border-r border-border px-6 py-8 sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
          <FilterPanel />
        </aside>

        {/* Main */}
        <div className="flex-1 px-4 md:px-8 py-8">
          {/* Controls */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-48 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Որոնել զարդեր..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Mobile filter toggle */}
            <button
              className="md:hidden flex items-center gap-2 border border-border px-3 py-2.5 font-heading text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:border-primary hover:text-primary transition-all"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ListFilter size={12} /> Ֆիլտրեր
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-input-background border border-border px-4 pr-8 py-2.5 font-heading text-[10px] tracking-[0.15em] uppercase text-muted-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="newest">Նորերը</option>
                <option value="bestseller">Ամենապահանջված</option>
                <option value="price-asc">Գին՝ աճման կարգով</option>
                <option value="price-desc">Գին՝ նվազման կարգով</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            <p className="font-body text-[10px] text-muted-foreground tracking-wider ml-auto">
              {isLoading ? "Բեռնվում է..." : `${filtered.length} զարդ`}
            </p>
          </div>

          {catalogMessage && (
            <div className="mb-6 border border-border bg-secondary/30 px-4 py-3">
              <p className="font-body text-[11px] text-muted-foreground">{catalogMessage}</p>
              {!isLoading && products.length === 0 && (
                <button type="button" onClick={onRetry} className="mt-2 font-heading text-[10px] uppercase tracking-[0.2em] text-primary underline underline-offset-4">
                  Փորձել կրկին
                </button>
              )}
            </div>
          )}

          {/* Mobile filter panel */}
          {sidebarOpen && (
            <div className="md:hidden mb-8 p-5 border border-border bg-secondary/30">
              <FilterPanel />
            </div>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-heading text-sm tracking-wider text-muted-foreground">Ձեր ընտրությանը համապատասխան զարդեր չկան։</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  onViewProduct={onViewProduct}
                  isWishlisted={wishlist.includes(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL PAGE ─────────────────────────────────────────────────────

function ProductDetailPage({
  productId,
  products,
  collections,
  onBack,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
  onViewCollection,
  wishlist,
}: {
  productId: number;
  products: Product[];
  collections: Collection[];
  onBack: () => void;
  onAddToCart: (p: Product, quantity?: number) => void;
  onToggleWishlist: (id: number) => void;
  onViewProduct: (id: number) => void;
  onViewCollection: (id: string) => void;
  wishlist: number[];
}) {
  const initialProduct = useMemo(() => products.find((product) => product.id === productId) ?? null, [productId, products]);
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [message, setMessage] = useState("");
  const [activeImage, setActiveImage] = useState(initialProduct?.image ?? "");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    let cancelled = false;
    setProduct(initialProduct);
    setActiveImage(initialProduct?.image ?? "");
    setQuantity(1);
    setSelectedSize(initialProduct?.sizes?.[0]?.name ?? "");
    setMessage("");
    setLoading(true);

    shopApi.getProduct(productId)
      .then((freshProduct) => {
        if (cancelled) return;
        const mergedProduct = initialProduct ? {
          ...freshProduct,
          category: initialProduct.category,
          categoryId: initialProduct.categoryId,
          categoryLabel: initialProduct.categoryLabel,
          isFeatured: initialProduct.isFeatured,
        } : freshProduct;
        const images = mergedProduct.images?.length ? mergedProduct.images : [mergedProduct.image];
        setProduct(mergedProduct);
        setActiveImage(images[0]);
        setSelectedSize(mergedProduct.sizes?.[0]?.name ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        if (initialProduct) setMessage("Some atelier details are temporarily unavailable.");
        else setMessage("This piece is temporarily unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, initialProduct]);

  if (!product && loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <p className="font-heading text-xs tracking-[0.25em] uppercase text-muted-foreground">Զարդը բեռնվում է</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen px-6 text-center">
        <ArevakhachSymbol size={36} className="text-primary mx-auto mb-5" />
        <p className="font-heading text-lg tracking-wider mb-4">{message || "Այս զարդը ժամանակավորապես հասանելի չէ։"}</p>
        <button onClick={onBack} className="px-7 py-3 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase">
          Վերադառնալ զարդերին
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const facts = Object.entries(product.info ?? {}).slice(0, 8);
  const categoryKey = initialProduct?.category || product.category;
  const categoryProducts = products
    .filter((item) => item.id !== product.id && item.category === categoryKey)
    .slice(0, 12);
  const productCollections = collections.filter((collection) => {
    const hasProduct = collection.products?.some((item) => item.id === product.id);
    return hasProduct || product.collectionIds.includes(collection.id);
  });
  const isWishlisted = wishlist.includes(product.id);

  const handleAdd = () => {
    if (!product.inStock) return;
    onAddToCart(product, quantity);
  };

  return (
    <div className="pt-24 min-h-screen">
      <div className="px-6 md:px-12 py-5 border-b border-border flex items-center justify-between gap-4">
        <button onClick={onBack} className="font-heading text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors">
          Վերադառնալ զարդերին
        </button>
        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary">{product.subtitle}</p>
      </div>

      {message && (
        <div className="px-6 md:px-12 py-3 border-b border-border bg-secondary/20 text-center">
          <p className="font-body text-[11px] text-muted-foreground">{message}</p>
        </div>
      )}

      <section className="px-6 md:px-12 py-10 md:py-16 grid lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] gap-10 md:gap-14">
        <div className="space-y-4">
          <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
            <img src={activeImage || product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-5 left-5 flex flex-col gap-2">
              {product.isNew && <span className="bg-primary text-primary-foreground font-heading text-[10px] tracking-[0.2em] uppercase px-3 py-1.5">Նոր</span>}
              {product.isBestSeller && <span className="bg-foreground/90 text-background font-heading text-[10px] tracking-[0.2em] uppercase px-3 py-1.5">Սիրված</span>}
            </div>
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((image) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(image)}
                  className={`aspect-square overflow-hidden border transition-colors ${activeImage === image ? "border-primary" : "border-border hover:border-primary/50"}`}
                >
                  <img src={image} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28 self-start">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-primary/60" />
            <span className="font-body text-[10px] tracking-[0.35em] text-primary uppercase">{product.category}</span>
          </div>

          <h1 className="font-heading text-3xl md:text-5xl tracking-wider leading-tight mb-4">{product.name}</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">{product.material}{product.gemstone ? ` · ${product.gemstone}` : ""}</p>

          <div className="flex items-center gap-3 mb-7">
            <span className="font-heading text-2xl text-primary tracking-wide">{formatAmdPrice(product.price)}</span>
            {product.originalPrice && <span className="font-body text-muted-foreground text-sm line-through">{formatAmdPrice(product.originalPrice)}</span>}
          </div>

          <p className="font-body text-sm md:text-base text-foreground/70 leading-relaxed mb-8 font-light">{product.description}</p>

          {productCollections.length > 0 && (
            <div className="mb-7 border border-border bg-black/20 p-4">
              <p className="mb-2 font-heading text-[10px] uppercase tracking-[0.25em] text-foreground">Հավաքածու</p>
              <p className="mb-4 font-body text-xs leading-relaxed text-muted-foreground">
                Այս զարդը ներառված է ստորև նշված հավաքածուում։ Սեղմեք անունը՝ ամբողջ հավաքածուն տեսնելու համար։
              </p>
              <div className="flex flex-wrap gap-2">
                {productCollections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => onViewCollection(collection.id)}
                  className="group inline-flex items-center gap-2 border border-primary/35 px-4 py-2 font-heading text-[10px] uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary hover:bg-primary hover:text-black"
                >
                  {collection.name}
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </button>
              ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-7">
              <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-foreground mb-3">Չափս</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`border px-4 py-2 font-heading text-[10px] tracking-[0.18em] uppercase transition-colors ${selectedSize === size.name ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary/50"}`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex items-center border border-border w-full sm:w-auto justify-between sm:justify-start">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Minus size={14} />
              </button>
              <span className="font-heading text-sm w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity((value) => value + 1)} className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="flex-1 py-4 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.inStock ? "Ավելացնել զամբյուղ" : "Առկա չէ"}
            </button>
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`w-full sm:w-14 h-14 border flex items-center justify-center transition-colors ${isWishlisted ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary hover:text-primary"}`}
              aria-label="Toggle wishlist"
            >
              <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 py-6 border-y border-border mb-8">
            {[
              { icon: <Gem size={16} />, label: "Ձեռքի աշխատանք" },
              { icon: <Shield size={16} />, label: "Ստուգված որակ" },
              { icon: <Package size={16} />, label: "Նվերային փաթեթ" },
            ].map(({ icon, label }) => (
              <div key={label} className="text-center">
                <div className="text-primary flex justify-center mb-2">{icon}</div>
                <p className="font-heading text-[9px] tracking-[0.18em] uppercase text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {facts.length > 0 && (
            <div className="mb-8">
              <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-foreground mb-4">Մանրամասներ</p>
              <div className="border border-border">
                {facts.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 px-4 py-3 border-b border-border last:border-b-0">
                    <span className="font-body text-[11px] text-muted-foreground uppercase">{titleCase(key)}</span>
                    <span className="font-body text-xs text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {categoryProducts.length > 0 && (
        <ProductCategorySlider
          title="Նույն կատեգորիայի զարդեր"
          subtitle="Ձեզ կարող է հետաքրքրել"
          products={categoryProducts}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          onViewProduct={onViewProduct}
          wishlist={wishlist}
        />
      )}
    </div>
  );
}

// ─── COLLECTIONS PAGE ─────────────────────────────────────────────────────────

function CollectionDetailPage({
  collection,
  products,
  onBack,
  onAddCollectionToCart,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
  wishlist,
}: {
  collection: Collection;
  products: Product[];
  onBack: () => void;
  onAddCollectionToCart: (collection: Collection, products: Product[]) => void;
  onAddToCart: (p: Product, quantity?: number) => void;
  onToggleWishlist: (id: number) => void;
  onViewProduct: (id: number, returnCollectionId?: string) => void;
  wishlist: number[];
}) {
  const collectionProducts = useMemo(() => {
    const ownProducts = collection.products ?? [];
    const knownById = new Map(products.map((product) => [product.id, product]));

    return ownProducts.map((product) => knownById.get(product.id) ?? product);
  }, [collection, products]);

  const productsTotal = collectionProducts.reduce((sum, product) => sum + product.price, 0);
  const collectionAvailable = collection.price > 0
    && collectionProducts.length > 0
    && collectionProducts.every((product) => product.inStock);

  return (
    <div className="pt-24 min-h-screen">
      <div className="px-6 md:px-12 py-5 border-b border-border flex items-center justify-between gap-4">
        <button onClick={onBack} className="font-heading text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors">
          Վերադառնալ հավաքածուներին
        </button>
        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary">{collection.count} զարդ</p>
      </div>

      <section className="px-6 md:px-12 py-10 md:py-16 grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-10 md:gap-14 border-b border-border">
        <div className="relative overflow-hidden bg-secondary aspect-[4/3] lg:aspect-[5/4]">
          <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />
          <div className="absolute top-5 left-5 w-10 h-10 border-l border-t border-primary/50" />
          <div className="absolute bottom-5 right-5 w-10 h-10 border-r border-b border-primary/50" />
        </div>

        <div className="self-center">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-primary/60" />
            <span className="font-body text-[10px] tracking-[0.35em] text-primary uppercase">Հավաքածու</span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl tracking-wider leading-tight mb-5">{collection.name}</h1>
          <p className="font-body text-sm md:text-base text-foreground/70 leading-relaxed mb-7 font-light">{collection.tagline}</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="border border-border p-5">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">Ամբողջ հավաքածուն</p>
              <p className="font-heading text-xl text-primary">{formatAmdPrice(collection.price)}</p>
            </div>
            <div className="border border-border p-5">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">Առանձին զարդերով</p>
              <p className="font-heading text-xl text-primary">{formatAmdPrice(productsTotal)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onAddCollectionToCart(collection, collectionProducts)}
              disabled={!collectionAvailable}
              className="flex-1 py-4 bg-primary text-primary-foreground font-heading text-xs tracking-[0.22em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {collectionAvailable ? "Գնել ամբողջ հավաքածուն" : "Հավաքածուն հասանելի չէ"}
            </button>
            <a
              href="#collection-products"
              className="flex-1 py-4 border border-border text-center font-heading text-xs tracking-[0.22em] uppercase text-foreground/80 hover:border-primary hover:text-primary transition-colors"
            >
              Ընտրել առանձին զարդեր
            </a>
          </div>
        </div>
      </section>

      <section id="collection-products" className="px-6 md:px-12 py-16 md:py-24 bg-secondary/30 scroll-mt-24">
        <div className="text-center mb-12">
          <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-3">Հավաքածուի զարդերը</p>
          <h2 className="font-heading text-3xl md:text-4xl tracking-wider">{collection.name}</h2>
          <OrnamentalDivider className="mx-auto mt-5 w-[min(72vw,720px)]" />
        </div>

        {collectionProducts.length === 0 ? (
          <div className="text-center py-16 border border-border bg-background/40">
            <p className="font-heading text-sm tracking-wider text-muted-foreground">Այս հավաքածուում դեռ զարդեր չկան։</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {collectionProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onViewProduct={(id) => onViewProduct(id, collection.id)}
                isWishlisted={wishlist.includes(product.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CollectionsPage({
  onNavigate,
  onViewCollection,
  collections,
  isLoading,
  message,
  onRetry,
}: {
  onNavigate: (p: Page) => void;
  onViewCollection: (id: string) => void;
  collections: Collection[];
  isLoading: boolean;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="pt-24 min-h-screen">
      <div className="px-6 md:px-12 py-12 border-b border-border text-center">
        <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-2">Մեր աշխարհները</p>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wider">Հավաքածուներ</h1>
        <OrnamentalDivider className="max-w-xs mx-auto mt-4" />
        <p className="font-body text-sm text-muted-foreground mt-5 max-w-xl mx-auto leading-relaxed">
          Յուրաքանչյուր հավաքածու պատմում է հայկական զարդարվեստի մի առանձին կողմը՝ ժամանակակից և կրելի ձևով։
        </p>
      </div>

      <div className="px-6 md:px-12 py-14">
        {isLoading ? (
          <div className="border border-border bg-secondary/20 px-6 py-16 text-center">
            <p className="font-heading text-sm tracking-wider text-muted-foreground">Հավաքածուները բեռնվում են։</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="border border-border bg-secondary/20 px-6 py-16 text-center">
            <p className="font-heading text-sm tracking-wider text-muted-foreground">{message || "Այս խանութի համար հավաքածուներ դեռ չեն հրապարակվել։"}</p>
            <button type="button" onClick={onRetry} className="mt-4 font-heading text-[10px] uppercase tracking-[0.2em] text-primary underline underline-offset-4">
              Թարմացնել
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => onViewCollection(col.id)}
              className="group relative overflow-hidden text-left"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={col.image} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-primary/0 group-hover:border-primary/60 transition-all duration-500" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-primary/0 group-hover:border-primary/60 transition-all duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="font-body text-[9px] tracking-[0.3em] text-primary uppercase mb-2">{col.count} զարդ</p>
                  <h3 className="font-heading text-xl tracking-wide text-white mb-2">{col.name}</h3>
                  <p className="font-heading text-sm tracking-wide text-primary mb-3">{formatAmdPrice(col.price)}</p>
                  <p className="font-body text-xs text-white/60 leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400">{col.tagline}</p>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="font-heading text-[10px] tracking-[0.25em] uppercase">Դիտել</span>
                    <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </button>
            ))}
          </div>
        )}

        {/* Custom CTA */}
        <div className="mt-16 p-10 border border-border text-center relative">
          <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-primary/30" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-primary/30" />
          <ArevakhachSymbol size={32} className="text-primary mx-auto mb-5" />
          <h3 className="font-heading text-xl tracking-wider mb-3">Անհատական պատվերներ</h3>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mb-7 leading-relaxed">
            Պատվիրեք ձեր գաղափարին համապատասխան զարդ՝ խորհրդանիշով, քարով կամ հատուկ ձևով։
          </p>
          <button
            onClick={() => onNavigate("custom")}
            className="px-8 py-3 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors"
          >
            Սկսել պատվերը
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────

function AboutPage({ aboutContent }: { aboutContent: AboutContent | null }) {
  const values = [
    { icon: <Gem size={18} />, title: "Uncompromising Materials", desc: "18K and 22K gold, sterling silver, and gemstones selected personally by Armen from certified suppliers across five continents." },
    { icon: <Award size={18} />, title: "Generational Craft", desc: "Armen trained under his father and grandfather — the fourth generation of Armenian goldsmiths in his family. No casting. Hand only." },
    { icon: <Shield size={18} />, title: "Heritage Preservation", desc: "Ten percent of every sale funds the preservation of traditional Armenian goldsmithing techniques through the Yerevan Craft Academy." },
    { icon: <Sparkles size={18} />, title: "Living Culture", desc: "We work with Armenian cultural historians to ensure every motif is correctly interpreted and honoured, not merely decorative." },
  ];
  const storyParagraphs = aboutContent?.description
    ? splitIntoParagraphs(aboutContent.description)
    : [
        "Armen Petrosyan grew up watching his father beat gold into form. By twelve, he was cleaning tools. By eighteen, he was drawing designs. By twenty-six, he was in the workshops of Vienna and Florence, studying European goldsmithing alongside his deep Armenian training.",
        "He returned to Yerevan in 2008 with a singular vision: to create an Armenian jewellery house that could speak to both Armenians everywhere and the broader world of luxury — a house that was proudly, unapologetically Armenian, yet crafted to international standards of excellence.",
        "Areni opened its doors in 2010 with seven pieces. Today, we create over 200 unique designs, shipping to 48 countries, with a waiting list for bespoke commissions that runs twelve months.",
      ];

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={aboutContent?.imageUrl || "https://images.unsplash.com/photo-1688406264720-e2f9389c9ed1?w=1600&h=800&fit=crop&auto=format"} alt="Areni atelier" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/75" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-3">Our Story</p>
          <h1 className="font-heading text-4xl md:text-5xl tracking-wider">{aboutContent?.title || "The House of Areni"}</h1>
          <OrnamentalDivider className="max-w-xs mx-auto mt-5" />
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-5xl mx-auto">
        {/* Story */}
        <div className="py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-4">Founded 2010</p>
            <h2 className="font-heading text-2xl md:text-3xl tracking-wider mb-6 leading-snug">A Goldsmith's Legacy,<br />Shaped for Today</h2>
            <div className="space-y-4 font-body text-sm text-foreground/70 leading-relaxed">
              {storyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1626784213922-d9f1e050cf8f?w=700&h=850&fit=crop&auto=format" alt="Areni jewellery detail" className="w-full object-cover" />
            <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-primary/50" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-primary/50" />
          </div>
        </div>

        <OrnamentalDivider className="mb-16" />

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-2">What We Stand For</p>
            <h2 className="font-heading text-2xl md:text-3xl tracking-wider">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="border border-border p-7 hover:border-primary/40 transition-colors relative group">
                <div className="absolute top-3 left-3 w-3 h-3 border-l border-t border-primary/0 group-hover:border-primary/50 transition-all" />
                <div className="text-primary mb-4">{icon}</div>
                <h3 className="font-heading text-sm tracking-wider mb-2">{title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-2">How We Work</p>
            <h2 className="font-heading text-2xl md:text-3xl tracking-wider">The Making of an Areni Piece</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Design", desc: "Each design begins with weeks of research into Armenian ornamental history — manuscripts, khachkars, textiles." },
              { step: "02", title: "Forging", desc: "Gold is hand-forged — never cast — ensuring the density, warmth, and weight that only hand-worked metal achieves." },
              { step: "03", title: "Setting", desc: "Every gemstone is hand-set using traditional bead and bezel techniques refined over four generations." },
              { step: "04", title: "Finishing", desc: "Final hand-polishing, quality inspection, and certification. Then presented in our signature lacquered box." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center p-5">
                <p className="font-display text-3xl text-primary/20 mb-3">{step}</p>
                <h3 className="font-heading text-sm tracking-wider mb-2 text-foreground">{title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOM PAGE ──────────────────────────────────────────────────────────────

function CustomPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", description: "", material: "", budget: "", timeline: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const update = (field: string, val: string) => setForm((f) => ({ ...f, [field]: val }));

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1626784214536-d859187e0bd0?w=1600&h=600&fit=crop&auto=format" alt="Custom jewellery" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-3">Անհատական պատվեր</p>
          <h1 className="font-heading text-4xl md:text-5xl tracking-wider">Պատվիրեք ձեր զարդը</h1>
          <OrnamentalDivider className="max-w-xs mx-auto mt-5" />
        </div>
      </div>

      <div className="px-6 md:px-12 py-14 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14">
          {/* Info */}
          <div>
            <h2 className="font-heading text-2xl tracking-wider mb-5">Ինչպես է ստեղծվում անհատական պատվերը</h2>
            <div className="space-y-4 font-body text-sm text-foreground/70 leading-relaxed mb-8">
              <p>Յուրաքանչյուր անհատական զարդ սկսվում է ձեր գաղափարից՝ խորհրդանիշ, պատմություն, առիթ կամ մարդ, ում համար ստեղծվում է զարդը։</p>
              <p>Մենք ձևավորում ենք էսքիզը, ընտրում նյութը և քարերը, հետո սկսում ձեռքի աշխատանքը՝ պահելով ձեզ ընթացքի մեջ։</p>
              <p>Պատրաստման ժամկետը կախված է բարդությունից։ Յուրաքանչյուր անհատական պատվեր ստանում է խնամքով փաթեթավորում և որակի ստուգում։</p>
            </div>

            {/* Steps */}
            <div className="space-y-5">
              {[
                { n: "01", title: "Submit Your Request", desc: "Fill in the form with as much or as little detail as you have." },
                { n: "02", title: "Design Consultation", desc: "A call or meeting with Armen — in person in Yerevan, or via video worldwide." },
                { n: "03", title: "Design Approval", desc: "Review detailed sketches and a material specification. Revise freely." },
                { n: "04", title: "Crafting & Delivery", desc: "Your piece is made by hand and delivered to your door, insured and tracked." },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4">
                  <span className="font-display text-primary/30 text-lg flex-shrink-0 w-8">{n}</span>
                  <div>
                    <p className="font-heading text-[11px] tracking-[0.15em] uppercase text-foreground mb-1">{title}</p>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="border border-border p-7 relative">
            <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-primary/40" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-primary/40" />

            {sent ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-12">
                <div className="w-12 h-12 border border-primary flex items-center justify-center">
                  <Check size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg tracking-wide mb-2">Հայտը ստացվել է</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">Մենք կկապվենք ձեզ հետ՝ պատվերի մանրամասները հստակեցնելու համար։</p>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-heading text-sm tracking-[0.2em] uppercase mb-6">Պատվերի հայտ</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Անուն ազգանուն *</label>
                      <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
                    </div>
                    <div>
                      <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Էլ․ հասցե *</label>
                      <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Հեռախոս / WhatsApp</label>
                    <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
                  </div>
                  <div>
                    <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Նախընտրելի նյութ</label>
                    <select value={form.material} onChange={(e) => update("material", e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground appearance-none">
                      <option value="">Ընտրել նյութը</option>
                      <option>18K Yellow Gold</option>
                      <option>18K White Gold</option>
                      <option>18K Rose Gold</option>
                      <option>22K Gold</option>
                      <option>Արծաթ</option>
                      <option>Դեռ որոշված չէ</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Բյուջե</label>
                    <select value={form.budget} onChange={(e) => update("budget", e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground appearance-none">
                      <option value="">Ընտրել միջակայք</option>
                      <option>$500 – $1,000</option>
                      <option>$1,000 – $2,500</option>
                      <option>$2,500 – $5,000</option>
                      <option>$5,000 – $10,000</option>
                      <option>$10,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Նկարագրեք ձեր գաղափարը *</label>
                    <textarea required value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Գրեք զարդի պատմությունը, առիթը, խորհրդանիշերը կամ ցանկալի զգացողությունը..." className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground resize-none" />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors mt-2 flex items-center justify-center gap-2">
                    Ուղարկել հայտը
                    <Send size={13} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────

function ContactPage({ shopInfo }: { shopInfo: ShopInfo }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const update = (f: string, v: string) => setForm((prev) => ({ ...prev, [f]: v }));

  return (
    <div className="pt-24 min-h-screen">
      <div className="px-6 md:px-12 py-12 border-b border-border text-center">
        <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-2">Կապ</p>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wider">Կապ մեզ հետ</h1>
        <OrnamentalDivider className="max-w-xs mx-auto mt-4" />
      </div>

      <div className="px-6 md:px-12 py-14 max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 className="font-heading text-xl tracking-wider mb-7">Սիրով կպատասխանենք ձեր հարցերին</h2>
          <div className="space-y-6 mb-10">
            {[
              { icon: <MapPin size={16} />, title: "Atelier & Showroom", detail: shopInfo.address },
              { icon: <Phone size={16} />, title: "Telephone", detail: shopInfo.phone },
              { icon: <Mail size={16} />, title: "Email", detail: shopInfo.email },
              { icon: <MessageCircle size={16} />, title: "WhatsApp & Telegram", detail: shopInfo.telegramChatId || shopInfo.phone },
              { icon: <Clock size={16} />, title: "Hours", detail: "Mon–Sat: 10:00–19:00 AMT · Sun by appointment" },
            ].map(({ icon, title, detail }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="text-primary mt-0.5 flex-shrink-0">{icon}</div>
                <div>
                  <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground mb-0.5">{title}</p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="relative h-48 bg-secondary/50 border border-border flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <MapPin size={24} className="text-primary mx-auto mb-2" />
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{shopInfo.address}</p>
            </div>
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(197,151,58,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(197,151,58,0.5) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>
        </div>

        {/* Form */}
        <div className="border border-border p-7 relative">
          <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-primary/40" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-primary/40" />

          {sent ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-12">
              <div className="w-12 h-12 border border-primary flex items-center justify-center">
                <Check size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg tracking-wide mb-2">Հաղորդագրությունն ուղարկվեց</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">Մենք կպատասխանենք հնարավորինս շուտ։ Շնորհակալություն կապ հաստատելու համար։</p>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-heading text-sm tracking-[0.2em] uppercase mb-6">Ուղարկել հաղորդագրություն</h3>
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Անուն *</label>
                    <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
                  </div>
                  <div>
                    <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Էլ․ հասցե *</label>
                    <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
                  </div>
                </div>
                <div>
                  <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Թեմա</label>
                  <select value={form.subject} onChange={(e) => update("subject", e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground appearance-none">
                    <option value="">Ընտրել թեման</option>
                    <option>Զարդի մասին հարց</option>
                    <option>Անհատական պատվեր</option>
                    <option>Պատվերի կարգավիճակ</option>
                    <option>Փոխանակում</option>
                    <option>Այլ</option>
                  </select>
                </div>
                <div>
                  <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Հաղորդագրություն *</label>
                  <textarea required value={form.message} onChange={(e) => update("message", e.target.value)} rows={5} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground resize-none" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-1">
                  Ուղարկել
                  <Send size={13} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthModal({
  isOpen,
  mode,
  message,
  onModeChange,
  onClose,
  onAuthenticated,
}: {
  isOpen: boolean;
  mode: AuthMode;
  message: string;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onAuthenticated: (user: UserProfile) => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const isRegister = mode === "register";
  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      let user: UserProfile | undefined;

      if (isRegister) {
        const result = await shopApi.register({
          firstname: form.firstName,
          lastname: form.lastName,
          phone: form.phone,
          email: form.email,
          password: form.password,
        });
        user = result.user;
      } else {
        await shopApi.login({
          email: form.email,
          password: form.password,
        });
      }

      const profile = user ?? await shopApi.getProfile();
      onAuthenticated(profile);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      <button className="absolute inset-0 bg-black/75" onClick={onClose} aria-label="Փակել մուտքը" />
      <div className="relative w-full max-w-md bg-card border border-border p-7 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" aria-label="Փակել">
          <X size={18} />
        </button>

        <div className="mb-6">
          <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-2">{isRegister ? "Գրանցում" : "Բարի վերադարձ"}</p>
          <h2 className="font-heading text-2xl tracking-wider">{isRegister ? "Ստեղծել հաշիվ" : "Մուտք"}</h2>
          {message && <p className="font-body text-xs text-muted-foreground mt-3 leading-relaxed">{message}</p>}
        </div>

        <div className="grid grid-cols-2 border border-border mb-6">
          {(["login", "register"] as AuthMode[]).map((item) => (
            <button
              key={item}
              onClick={() => onModeChange(item)}
              className={`py-2.5 font-heading text-[10px] tracking-[0.2em] uppercase transition-colors ${mode === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {item === "login" ? "Մուտք" : "Գրանցում"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Անուն</label>
                <input required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
              </div>
              <div>
                <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Ազգանուն</label>
                <input required value={form.lastName} onChange={(event) => update("lastName", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Հեռախոս</label>
              <input required value={form.phone} onChange={(event) => update("phone", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
            </div>
          )}

          <div>
            <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Էլ․ հասցե</label>
            <input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
          </div>

          <div>
            <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Գաղտնաբառ</label>
            <input required type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={(event) => update("password", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
          </div>

          {error && <p className="font-body text-xs text-destructive leading-relaxed">{error}</p>}

          <button disabled={loading} type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-60">
            {loading ? "Խնդրում ենք սպասել" : isRegister ? "Ստեղծել հաշիվ" : "Մուտք"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AccountModal({
  isOpen,
  user,
  onClose,
  onLogout,
  onProfileUpdated,
}: {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onLogout: () => void;
  onProfileUpdated: (user: UserProfile) => void;
}) {
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const [orders, setOrders] = useState<OrderLine[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !user) return;
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
    });
    setMessage("");
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen || !user) return;
    let cancelled = false;

    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const result = await shopApi.getOrders();
        if (!cancelled) setOrders(result);
      } catch (error) {
        if (error instanceof shopApi.ApiError && error.status === 401) onLogout();
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const updated = await shopApi.updateProfile(form);
      onProfileUpdated(updated);
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      <button className="absolute inset-0 bg-black/75" onClick={onClose} aria-label="Փակել հաշիվը" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-5 border-b border-border bg-card">
          <div>
            <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-1">Անձնական էջ</p>
            <h2 className="font-heading text-xl tracking-wider">{user ? `${user.first_name} ${user.last_name}` : "Account"}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Փակել">
            <X size={18} />
          </button>
        </div>

        {!user ? (
          <div className="p-8 text-center">
            <p className="font-heading text-xs tracking-[0.25em] uppercase text-muted-foreground">Հաշիվը բեռնվում է</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] gap-0">
            <form onSubmit={saveProfile} className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border space-y-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="font-heading text-sm tracking-[0.2em] uppercase">Պրոֆիլ</h3>
                <button type="button" onClick={onLogout} className="font-heading text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <LogOut size={12} /> Sign Out
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Անուն</label>
                  <input required value={form.first_name} onChange={(event) => update("first_name", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
                </div>
                <div>
                  <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Ազգանուն</label>
                  <input required value={form.last_name} onChange={(event) => update("last_name", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
                </div>
              </div>

              <div>
                <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Հեռախոս</label>
                <input required value={form.phone} onChange={(event) => update("phone", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
              </div>

              <div>
                <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Էլ․ հասցե</label>
                <input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
              </div>

              {message && <p className="font-body text-xs text-muted-foreground">{message}</p>}

              <button disabled={saving} type="submit" className="w-full py-3 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? "Saving" : "Save Profile"}
              </button>
            </form>

            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h3 className="font-heading text-sm tracking-[0.2em] uppercase">Պատվերներ</h3>
                <span className="font-body text-[10px] text-muted-foreground">{orders.length} total</span>
              </div>

              {loadingOrders ? (
                <p className="font-heading text-xs tracking-[0.2em] uppercase text-muted-foreground">Պատվերները բեռնվում են</p>
              ) : orders.length === 0 ? (
                <div className="border border-border p-6 text-center">
                  <ShoppingBag size={24} className="text-primary mx-auto mb-3" />
                  <p className="font-heading text-xs tracking-[0.2em] uppercase text-muted-foreground">Դեռ պատվերներ չկան</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice().reverse().slice(0, 8).map((order, index) => (
                    <div key={`${order.id ?? index}-${order.product.id}`} className="border border-border p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-heading text-xs tracking-wide text-foreground">{order.product.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground mt-1">Qty {order.productCount} · {orderStatusLabel(order.status)}</p>
                      </div>
                      <p className="font-heading text-sm text-primary">{formatAmdPrice(order.product.price * order.productCount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({
  isOpen,
  items,
  total,
  user,
  onClose,
  onNeedAuth,
  onComplete,
}: {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  user: UserProfile | null;
  onClose: () => void;
  onNeedAuth: () => void;
  onComplete: () => Promise<void>;
}) {
  const [phone, setPhone] = useState("");
  const [buyerTin, setBuyerTin] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "blocked" | "error">("idle");
  const [message, setMessage] = useState("");
  const [summaryItems, setSummaryItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setPhone(user?.phone ?? "");
    setBuyerTin("");
    setComment("");
    setStatus("idle");
    setMessage("");
    setSummaryItems(items);
  }, [isOpen, user]);

  if (!isOpen) return null;

  const provider = shopConfig.paymentProvider.toLowerCase();
  const providerLabel = formatPaymentProvider(provider);
  const visibleItems = summaryItems.length ? summaryItems : items;
  const visibleTotal = visibleItems.reduce((sum, item) => sum + cartItemTotal(item), 0) || total;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !shopApi.hasAuthTokens()) {
      onNeedAuth();
      return;
    }

    if (items.length === 0) {
      setStatus("error");
      setMessage("Your shopping bag is empty.");
      return;
    }

    const normalizedTin = buyerTin.trim();
    if (normalizedTin && !/^\d{8}$/.test(normalizedTin)) {
      setStatus("error");
      setMessage("ՀՎՀՀ-ն պետք է պարունակի ճիշտ 8 թվանշան։");
      return;
    }

    setStatus("submitting");
    setMessage("");
    setSummaryItems(items);

    try {
      const orderGroups = buildCheckoutOrderGroups(items);

      if (orderGroups.length === 0) {
        setStatus("error");
        setMessage("Your shopping bag is empty.");
        return;
      }

      const additionalInfo = comment.trim() ? { comment: comment.trim() } : {};
      const orderResponses = await Promise.all(
        orderGroups.map((orderItems) => shopApi.createOrder(orderItems, phone, additionalInfo, normalizedTin)),
      );
      const orderIds = orderResponses.flatMap((response) => response.order_ids);

      if (orderIds.length === 0) {
        throw new Error("The backend created no payable order IDs.");
      }

      const description = `Drakht order for ${visibleItems.length} ${visibleItems.length === 1 ? "item" : "items"}`;
      const payment = provider === "ameriabank"
        ? await shopApi.initAmeriabankPayment(orderIds, description)
        : await shopApi.initIdramPayment(orderIds, description);

      if (payment.payment_url) {
        await onComplete();
        window.location.assign(payment.payment_url);
        return;
      }

      if (payment.form_action) {
        await onComplete();
        shopApi.submitIdramPayment(payment);
        return;
      }

      setStatus("error");
      setMessage(`Order created, but ${providerLabel} did not return payment handoff data.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Checkout failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      <button className="absolute inset-0 bg-black/75" onClick={onClose} aria-label="Փակել պատվերը" />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border">
          <div>
            <p className="font-body text-[10px] tracking-[0.35em] text-primary uppercase mb-1">Անվտանգ պատվեր</p>
            <h2 className="font-heading text-xl tracking-wider">Ձևակերպել պատվերը</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Փակել">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border space-y-5">
            <div>
              <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Կոնտակտային հեռախոս</label>
              <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
            </div>

            <div>
              <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">ՀՎՀՀ (ըստ ցանկության)</label>
              <input inputMode="numeric" pattern="[0-9]{8}" maxLength={8} value={buyerTin} onChange={(event) => setBuyerTin(event.target.value.replace(/\D/g, ""))} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground" />
            </div>

            <div>
              <label className="font-heading text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">Առաքման նշումներ</label>
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} className="w-full bg-input-background border border-border px-3 py-2.5 font-body text-xs focus:outline-none focus:border-primary/50 text-foreground resize-none" />
            </div>

            <div className="border border-border p-4 flex items-start gap-3">
              <CreditCard size={17} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground">{providerLabel}</p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed mt-1">Պատվերի ստեղծումից հետո վճարման էջը կբացվի ավտոմատ։</p>
              </div>
            </div>

            {message && (
              <div className={`border px-4 py-3 ${status === "error" ? "border-destructive/40" : "border-primary/30"}`}>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{message}</p>
              </div>
            )}

            <button disabled={status === "submitting" || items.length === 0} type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-heading text-xs tracking-[0.25em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-60">
              {status === "submitting" ? "Creating Order" : `Place Order${providerLabel ? ` & Pay` : ""}`}
            </button>
          </div>

          <div className="p-6 md:p-8 bg-secondary/20">
            <h3 className="font-heading text-sm tracking-[0.2em] uppercase mb-5">Պատվերի ամփոփում</h3>
            <div className="space-y-4 mb-6">
              {visibleItems.map((item) => (
                <div key={cartItemKey(item)} className="flex gap-3">
                  <div className="w-14 h-16 bg-secondary overflow-hidden flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-[11px] tracking-wide text-foreground leading-snug">{item.product.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-1">
                      Qty {item.quantity}{item.kind === "collection" ? " · whole collection" : ""}
                    </p>
                  </div>
                  <p className="font-heading text-xs text-primary">{formatAmdPrice(cartItemTotal(item))}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="font-body text-xs text-muted-foreground tracking-wider uppercase">Ընդհանուր</span>
              <span className="font-heading text-lg text-primary">{formatAmdPrice(visibleTotal)}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatPaymentProvider(provider: string): string {
  if (provider === "ameriabank") return "Ameriabank";
  if (provider === "idram") return "Idram";
  return provider ? titleCase(provider) : "Payment";
}

function orderStatusLabel(status: string): string {
  if (!status) return "New";
  return titleCase(status.replace(/_/g, "-"));
}

function formatAmdPrice(value?: number): string {
  const price = Number(value || 0);
  return price > 0 ? `${price.toLocaleString("hy-AM")} AMD` : "Գինը հարցումով";
}

function titleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function splitIntoParagraphs(value: string): string[] {
  const paragraphs = value.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  if (paragraphs.length > 1) return paragraphs.slice(0, 3);

  return value
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function cartLineToItem(line: CartLine, productById: Map<number, Product>): CartItem {
  const knownProduct = productById.get(line.product.id);

  return {
    cartId: line.id,
    quantity: line.quantity,
    product: knownProduct ?? {
      id: line.product.id,
      name: line.product.name,
      subtitle: "",
      price: line.product.price,
      material: "—",
      collection: "",
      collectionIds: [],
      category: "jewellery",
      categoryId: 0,
      categoryLabel: "",
      image: DRAKHT_ASSETS.logoWeb,
      inStock: true,
      status: "active",
      badges: [],
      description: "",
    },
  };
}

function cartItemKey(item: CartItem): string {
  if (item.kind === "collection" && item.collection) return `collection-${item.collection.id}`;
  return `product-${item.product.id}`;
}

function cartItemUnitPrice(item: CartItem): number {
  if (item.kind === "collection" && item.collection) return item.collection.price;
  return item.product.price;
}

function cartItemTotal(item: CartItem): number {
  return cartItemUnitPrice(item) * item.quantity;
}

function collectionCartProduct(collection: Collection): Product {
  const backendId = collection.backendId;
  if (!backendId) throw new Error("Collection is missing its backend ID.");

  return {
    id: -backendId,
    name: collection.name,
    subtitle: "Ամբողջական հավաքածու",
    price: collection.price,
    material: "Collection package",
    collection: collection.id,
    collectionIds: [collection.id],
    category: "collection",
    categoryId: 0,
    categoryLabel: "Հավաքածու",
    image: collection.image,
    images: [collection.image],
    inStock: true,
    status: "active",
    badges: [],
    description: collection.tagline,
  };
}

function buildCheckoutOrderGroups(items: CartItem[]): shopApi.OrderItem[][] {
  const standaloneItems = new Map<number, shopApi.OrderItem>();
  const collectionGroups: shopApi.OrderItem[][] = [];

  const addStandaloneItem = (item: shopApi.OrderItem) => {
    const existing = standaloneItems.get(item.product.id);
    if (!existing) {
      standaloneItems.set(item.product.id, item);
      return;
    }

    existing.quantity += item.quantity;
  };

  items.forEach((item) => {
    if (item.kind !== "collection" || !item.collection) {
      addStandaloneItem({ product: item.product, quantity: item.quantity });
      return;
    }

    const packageProducts = item.products?.length ? item.products : item.collection.products ?? [];
    const collectionId = item.collection.backendId;

    if (
      !collectionId
      || packageProducts.length === 0
      || packageProducts.some((product) => !product.inStock)
      || new Set(packageProducts.map((product) => product.id)).size !== packageProducts.length
    ) {
      throw new Error(`«${item.collection.name}» հավաքածուի տվյալները ամբողջական կամ հասանելի չեն։`);
    }

    collectionGroups.push(
      packageProducts.map((product) => ({
        product,
        quantity: item.quantity,
        orderInfo: {
          collection_purchase: true,
          collection_id: collectionId,
        },
      })),
    );
  });

  const groups: shopApi.OrderItem[][] = [];
  if (standaloneItems.size > 0) groups.push(Array.from(standaloneItems.values()));
  groups.push(...collectionGroups);
  return groups;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("drakht.theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });
  const [page, setPage] = useState<Page>("home");
  const [shopCategory, setShopCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo>(DEFAULT_SHOP_INFO);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [productReturnCollectionId, setProductReturnCollectionId] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogMessage, setCatalogMessage] = useState("");
  const [collectionsMessage, setCollectionsMessage] = useState("");
  const [catalogReloadKey, setCatalogReloadKey] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const value = JSON.parse(window.localStorage.getItem(WISHLIST_STORAGE_KEY) ?? "[]");
      return Array.isArray(value) ? value.filter((id): id is number => Number.isInteger(id)) : [];
    } catch {
      return [];
    }
  });
  const [cartMessage, setCartMessage] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authMessage, setAuthMessage] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId) ?? null,
    [collections, selectedCollectionId],
  );

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem("drakht.theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    let cancelled = false;

    const loadShopData = async () => {
      setCatalogLoading(true);
      setCatalogMessage("");
      setCollectionsMessage("");

      const [shopInfoResult, categoryResult, topProductResult, aboutResult, collectionResult] = await Promise.allSettled([
        shopApi.getAppInfo(),
        shopApi.getCategoryTree(),
        shopApi.getTopProducts(),
        shopApi.getAboutPage(),
        shopApi.getCollections(),
      ]);

      if (cancelled) return;

      if (shopInfoResult.status === "fulfilled") setShopInfo(shopInfoResult.value);
      if (aboutResult.status === "fulfilled") setAboutContent(aboutResult.value);

      if (categoryResult.status === "fulfilled") {
        const topProducts = topProductResult.status === "fulfilled" ? topProductResult.value : [];
        const normalized = shopApi.normalizeCatalog(categoryResult.value, topProducts);
        setProducts(normalized.products);
        if (normalized.products.length === 0) setCatalogMessage("Այս խանութի ապրանքացանկը դեռ դատարկ է։");
      } else {
        setProducts([]);
        setCatalogMessage("Չհաջողվեց բեռնել ապրանքացանկը։ Ստուգեք կապը և փորձեք կրկին։");
      }

      if (collectionResult.status === "fulfilled") {
        setCollections(collectionResult.value);
        if (collectionResult.value.length === 0) {
          setCollectionsMessage("Այս խանութի համար հավաքածուներ դեռ չեն հրապարակվել։");
        }
      } else {
        setCollections([]);
        setCollectionsMessage("Չհաջողվեց բեռնել հավաքածուները։");
      }

      setCatalogLoading(false);
    };

    loadShopData();

    return () => {
      cancelled = true;
    };
  }, [catalogReloadKey]);

  useEffect(() => {
    if (!shopApi.hasAuthTokens()) return;
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const profile = await shopApi.getProfile();
        if (!cancelled) setCurrentUser(profile);
      } catch (error) {
        if (error instanceof shopApi.ApiError && error.status === 401) shopApi.clearTokens();
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!shopApi.hasAuthTokens()) return;
    let cancelled = false;

    const loadRemoteCart = async () => {
      try {
        const lines = await shopApi.getCart();
        if (!cancelled) {
          setCart((prev) => [
            ...lines.map((line) => cartLineToItem(line, productById)),
            ...prev.filter((item) => item.kind === "collection"),
          ]);
        }
      } catch (error) {
        if (error instanceof shopApi.ApiError && error.status === 401) shopApi.clearTokens();
      }
    };

    loadRemoteCart();

    return () => {
      cancelled = true;
    };
  }, [productById]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // Lock body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  const navigate = (p: Page) => {
    if (p === "about") {
      setSelectedProductId(null);
      setSelectedCollectionId(null);
      setProductReturnCollectionId(null);
      setPage("home");
      setMobileOpen(false);
      window.setTimeout(() => {
        document.getElementById("about-us")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return;
    }

    if (p !== "product") setSelectedProductId(null);
    if (p !== "collection") setSelectedCollectionId(null);
    if (p !== "product") setProductReturnCollectionId(null);
    if (p === "shop") setShopCategory("all");
    setPage(p);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const viewCategory = (category: string) => {
    setShopCategory(category);
    setPage("shop");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const viewProduct = (id: number, returnCollectionId?: string) => {
    setSelectedProductId(id);
    setProductReturnCollectionId(returnCollectionId ?? null);
    setPage("product");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const viewCollection = (id: string) => {
    setSelectedCollectionId(id);
    setSelectedProductId(null);
    setProductReturnCollectionId(null);
    setPage("collection");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const refreshRemoteCart = async () => {
    if (!shopApi.hasAuthTokens()) return;

    const lines = await shopApi.getCart();
    setCart((prev) => [
      ...lines.map((line) => cartLineToItem(line, productById)),
      ...prev.filter((item) => item.kind === "collection"),
    ]);
    setCartMessage("");
  };

  const syncCartAfterAuthentication = async () => {
    if (!shopApi.hasAuthTokens()) return;

    try {
      const localProducts = cart.filter((item) => item.kind !== "collection" && !item.cartId);
      const remoteLines = await shopApi.getCart();
      const remoteQuantity = new Map(remoteLines.map((line) => [line.product.id, line.quantity]));

      await Promise.all(
        localProducts.map((item) => {
          const missingQuantity = Math.max(0, item.quantity - (remoteQuantity.get(item.product.id) ?? 0));
          return missingQuantity > 0 ? shopApi.addToCart(item.product.id, missingQuantity) : Promise.resolve();
        }),
      );
      await refreshRemoteCart();
    } catch (error) {
      if (error instanceof shopApi.ApiError && error.status === 401) shopApi.clearTokens();
      setCartMessage("Չհաջողվեց համաժամացնել զամբյուղը։ Փորձեք կրկին։");
    }
  };

  const openAuth = (mode: AuthMode = "login", message = "") => {
    setAuthMode(mode);
    setAuthMessage(message);
    setAuthOpen(true);
  };

  const openAccount = async () => {
    if (!shopApi.hasAuthTokens()) {
      openAuth("login", "Sign in to view your profile, orders, saved bag, and wishlist.");
      return;
    }

    setAccountOpen(true);

    if (!currentUser) {
      try {
        setCurrentUser(await shopApi.getProfile());
      } catch (error) {
        if (error instanceof shopApi.ApiError && error.status === 401) {
          shopApi.clearTokens();
          setCurrentUser(null);
          setAccountOpen(false);
          openAuth("login", "Your session expired. Please sign in again.");
        }
      }
    }
  };

  const logout = () => {
    shopApi.clearTokens();
    setCurrentUser(null);
    setAccountOpen(false);
    setAuthMessage("");
    setCart([]);
  };

  const startCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);

    if (!shopApi.hasAuthTokens()) {
      openAuth("login", "Sign in or create an account to complete checkout.");
      return;
    }
  };

  const completeOrder = async () => {
    const cartIds = cart
      .map((item) => item.cartId)
      .filter((cartId): cartId is number => typeof cartId === "number");

    if (shopApi.hasAuthTokens()) {
      const results = await Promise.allSettled(cartIds.map((cartId) => shopApi.removeFromCart(cartId)));
      if (results.some((result) => result.status === "rejected")) {
        setCartMessage("Պատվերը ստեղծվել է, բայց զամբյուղի մի մասը չհաջողվեց մաքրել։");
      }
    }

    setCart([]);
  };

  const addToCart = async (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.kind !== "collection" && i.product.id === product.id);
      if (existing) return prev.map((i) => i.kind !== "collection" && i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });

    if (!shopApi.hasAuthTokens()) return;

    try {
      await shopApi.addToCart(product.id, quantity);
      await refreshRemoteCart();
    } catch (error) {
      if (error instanceof shopApi.ApiError && error.status === 401) shopApi.clearTokens();
      setCartMessage("Չհաջողվեց թարմացնել զամբյուղը։");
      await refreshRemoteCart().catch(() => undefined);
    }
  };

  const addCollectionToCart = (collection: Collection, packageProducts: Product[]) => {
    if (!collection.backendId || collection.price <= 0 || packageProducts.length === 0 || packageProducts.some((product) => !product.inStock)) {
      setCartMessage("Այս հավաքածուն հիմա հնարավոր չէ ավելացնել զամբյուղ։");
      setCartOpen(true);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.kind === "collection" && item.collection?.id === collection.id);
      if (existing) {
        return prev.map((item) =>
          item.kind === "collection" && item.collection?.id === collection.id
            ? { ...item, quantity: item.quantity + 1, products: packageProducts }
            : item,
        );
      }

      return [
        ...prev,
        {
          kind: "collection",
          product: collectionCartProduct(collection),
          quantity: 1,
          collection,
          products: packageProducts,
        },
      ];
    });
    setCartOpen(true);
  };

  const changeCartQuantity = async (item: CartItem, delta: number) => {
    if (item.kind === "collection") {
      setCart((prev) =>
        prev
          .map((cartItem) => cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity: cartItem.quantity + delta } : cartItem)
          .filter((cartItem) => cartItem.quantity > 0),
      );
      return;
    }

    if (delta > 0) {
      setCart((prev) => prev.map((cartItem) => cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
    } else {
      setCart((prev) => prev
        .map((cartItem) => cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem)
        .filter((cartItem) => cartItem.quantity > 0));
    }

    if (!shopApi.hasAuthTokens()) return;

    const nextQuantity = Math.max(0, item.quantity + delta);
    try {
      if (delta > 0) await shopApi.addToCart(item.product.id, 1);
      else if (item.cartId) await shopApi.replaceCartQuantity(item.cartId, item.product.id, nextQuantity);
      else if (nextQuantity > 0) await shopApi.addToCart(item.product.id, nextQuantity);
      await refreshRemoteCart();
    } catch (error) {
      if (error instanceof shopApi.ApiError && error.status === 401) shopApi.clearTokens();
      setCartMessage("Քանակը չհաջողվեց համաժամացնել backend-ի հետ։");
      await refreshRemoteCart().catch(() => undefined);
    }
  };

  const toggleWishlist = async (id: number) => {
    const shouldLike = !wishlist.includes(id);
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

    if (!shopApi.hasAuthTokens()) return;

    try {
      if (shouldLike) await shopApi.likeProduct(id);
      else await shopApi.unlikeProduct(id);
    } catch (error) {
      if (error instanceof shopApi.ApiError && ((shouldLike && error.status === 409) || (!shouldLike && error.status === 404))) return;
      if (error instanceof shopApi.ApiError && error.status === 401) shopApi.clearTokens();
      setWishlist((prev) => shouldLike ? prev.filter((item) => item !== id) : prev.includes(id) ? prev : [...prev, id]);
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + cartItemTotal(i), 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const isAuthenticated = Boolean(currentUser) || shopApi.hasAuthTokens();

  return (
    <div className="min-h-screen bg-background text-foreground font-body overflow-x-hidden" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(197,197,197,0.3) transparent" }}>
      <Nav
        currentPage={page}
        onNavigate={navigate}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onCartOpen={() => setCartOpen(true)}
        onAccountOpen={openAccount}
        isAuthenticated={isAuthenticated}
        isScrolled={scrolled}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        themeMode={themeMode}
        onThemeToggle={() => setThemeMode((mode) => mode === "dark" ? "light" : "dark")}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onQuantityChange={changeCartQuantity}
        total={cartTotal}
        onCheckout={startCheckout}
        message={cartMessage}
      />

      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        message={authMessage}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setAuthMessage("");
          void syncCartAfterAuthentication();
        }}
      />

      <AccountModal
        isOpen={accountOpen}
        user={currentUser}
        onClose={() => setAccountOpen(false)}
        onLogout={logout}
        onProfileUpdated={setCurrentUser}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        items={cart}
        total={cartTotal}
        user={currentUser}
        onClose={() => setCheckoutOpen(false)}
        onNeedAuth={() => openAuth("login", "Sign in or create an account to complete checkout.")}
        onComplete={completeOrder}
      />

      <main>
        {page === "home" && (
          <HomePage
            onNavigate={navigate}
            onViewCategory={viewCategory}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onViewCollection={viewCollection}
            wishlist={wishlist}
            products={products}
            collections={collections}
            isLoading={catalogLoading}
            catalogMessage={catalogMessage}
            onRetry={() => setCatalogReloadKey((value) => value + 1)}
          />
        )}
        {page === "shop" && (
          <ShopPage
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            wishlist={wishlist}
            products={products}
            collections={collections}
            isLoading={catalogLoading}
            catalogMessage={catalogMessage}
            onRetry={() => setCatalogReloadKey((value) => value + 1)}
            initialCategory={shopCategory}
          />
        )}
        {page === "product" && selectedProductId && (
          <ProductDetailPage
            productId={selectedProductId}
            products={products}
            collections={collections}
            onBack={() => productReturnCollectionId ? viewCollection(productReturnCollectionId) : navigate("shop")}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onViewCollection={viewCollection}
            wishlist={wishlist}
          />
        )}
        {page === "collections" && (
          <CollectionsPage
            onNavigate={navigate}
            onViewCollection={viewCollection}
            collections={collections}
            isLoading={catalogLoading}
            message={collectionsMessage}
            onRetry={() => setCatalogReloadKey((value) => value + 1)}
          />
        )}
        {page === "collection" && selectedCollection && (
          <CollectionDetailPage
            collection={selectedCollection}
            products={products}
            onBack={() => navigate("collections")}
            onAddCollectionToCart={addCollectionToCart}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            wishlist={wishlist}
          />
        )}
        {page === "custom" && <CustomPage />}
        {page === "contact" && <ContactPage shopInfo={shopInfo} />}
      </main>

      <Footer onNavigate={navigate} shopInfo={shopInfo} />
    </div>
  );
}
