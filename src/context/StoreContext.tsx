import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  DEFAULT_SITE_SETTINGS,
  SEED_BRANDS,
  SEED_CATEGORIES,
  SEED_POSTS,
  SEED_PRODUCTS,
} from '../data/seedCatalog';
import type {
  Brand,
  CartItem,
  Category,
  ExchangeRequest,
  Order,
  Post,
  Product,
  SiteSettings,
  StaffMember,
} from '../types';

interface StoreContextValue {
  // Routing
  path: string;
  navigate: (to: string) => void;

  // Auth & Role
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isStoreStaff: boolean;
  isEditorialStaff: boolean;
  staffRole: 'admin' | 'store-manager' | 'editor' | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  // Catalog & Editorial Data (Firestore backed with starter fallback)
  products: Product[];
  brands: Brand[];
  categories: Category[];
  posts: Post[];
  settings: SiteSettings;
  orders: Order[];
  exchangeRequests: ExchangeRequest[];
  staffMembers: StaffMember[];
  usingSeedFallback: boolean;
  dataLoading: boolean;

  // Cart & Compare
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  updateCartQty: (idx: number, delta: number) => void;
  removeFromCart: (idx: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  compareSlugs: string[];
  toggleCompare: (slug: string) => void;
  clearCompare: () => void;

  // Firestore Mutations
  seedDatabaseToFirestore: () => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  savePost: (post: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  saveBrand: (brand: Brand) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  saveSiteSettings: (next: SiteSettings) => Promise<void>;
  createOrder: (
    payload: Omit<Order, 'id' | 'userId' | 'paymentStatus' | 'orderStatus' | 'createdAt'>,
  ) => Promise<string>;
  updateOrderStatus: (
    orderId: string,
    updates: Partial<Pick<Order, 'paymentStatus' | 'orderStatus' | 'paymentRef'>>,
  ) => Promise<void>;
  createExchangeRequest: (
    payload: Omit<ExchangeRequest, 'id' | 'userId' | 'status' | 'createdAt'>,
  ) => Promise<string>;
  updateExchangeStatus: (
    id: string,
    updates: Partial<Pick<ExchangeRequest, 'status' | 'estimatedValue'>>,
  ) => Promise<void>;
  saveStaffMember: (member: StaffMember) => Promise<void>;
  deleteStaffMember: (uid: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function normalizeRoute(raw: string): string {
  if (!raw) return '/';
  const cleaned = raw.startsWith('#') ? raw.slice(1) : raw;
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    if (window.location.hash) return normalizeRoute(window.location.hash);
    return window.location.pathname + window.location.search || '/';
  });

  const navigate = (to: string) => {
    const normalized = normalizeRoute(to);
    setPath(normalized);
    if (typeof window !== 'undefined') {
      window.location.hash = normalized;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash) {
        setPath(normalizeRoute(window.location.hash));
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const [myStaffDoc, setMyStaffDoc] = useState<StaffMember | null>(null);

  useEffect(() => {
    if (!authReady || !user) {
      setMyStaffDoc(null);
      return;
    }
    const unsub = onSnapshot(
      doc(db, 'staff', user.uid),
      (snap) => {
        if (snap.exists()) {
          setMyStaffDoc({ id: snap.id, ...(snap.data() as Omit<StaffMember, 'id'>) });
        } else {
          setMyStaffDoc(null);
        }
      },
      () => {
        // Non-staff users simply won't have a staff doc or read access if non-owner
        setMyStaffDoc(null);
      },
    );
    return () => unsub();
  }, [authReady, user]);

  const isBootstrappedAdmin = Boolean(
    user?.emailVerified && user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase(),
  );

  const staffRole: 'admin' | 'store-manager' | 'editor' | null = isBootstrappedAdmin
    ? 'admin'
    : myStaffDoc?.role || null;

  const isAdmin = staffRole === 'admin';
  const isStoreStaff = staffRole === 'admin' || staffRole === 'store-manager';
  const isEditorialStaff = staffRole === 'admin' || staffRole === 'editor';

  // Firestore Collections
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbBrands, setDbBrands] = useState<Brand[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbPosts, setDbPosts] = useState<Post[]>([]);
  const [dbSettings, setDbSettings] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let loadedCount = 0;
    const markLoaded = () => {
      loadedCount++;
      if (loadedCount >= 4) setDataLoading(false);
    };

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        setDbProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) })));
        markLoaded();
      },
      (err) => {
        console.warn('Products listener fallback:', err.message);
        markLoaded();
      },
    );

    const unsubBrands = onSnapshot(
      collection(db, 'brands'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Brand, 'id'>) }));
        list.sort((a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100));
        setDbBrands(list);
        markLoaded();
      },
      (err) => {
        console.warn('Brands listener fallback:', err.message);
        markLoaded();
      },
    );

    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }));
        list.sort((a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100));
        setDbCategories(list);
        markLoaded();
      },
      (err) => {
        console.warn('Categories listener fallback:', err.message);
        markLoaded();
      },
    );

    const unsubSettings = onSnapshot(
      doc(db, 'siteSettings', 'main'),
      (snap) => {
        if (snap.exists()) {
          setDbSettings({ id: snap.id, ...(snap.data() as Omit<SiteSettings, 'id'>) });
        } else {
          setDbSettings(null);
        }
        markLoaded();
      },
      () => markLoaded(),
    );

    return () => {
      unsubProducts();
      unsubBrands();
      unsubCategories();
      unsubSettings();
    };
  }, []);

  // Posts subscription: Admin sees all (including drafts); public sees published
  useEffect(() => {
    const postsQuery = isBootstrappedAdmin
      ? collection(db, 'posts')
      : query(collection(db, 'posts'), where('status', '==', 'published'));

    const unsub = onSnapshot(
      postsQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }));
        list.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
        setDbPosts(list);
      },
      (err) => {
        console.warn('Posts listener fallback:', err.message);
      },
    );
    return () => unsub();
  }, [isBootstrappedAdmin]);

  // Private Orders & Exchange Requests subscription (only when signed in)
  useEffect(() => {
    if (!authReady || !user) {
      setOrders([]);
      setExchangeRequests([]);
      setStaffMembers([]);
      return;
    }

    const ordersQuery = isBootstrappedAdmin
      ? collection(db, 'orders')
      : query(collection(db, 'orders'), where('userId', '==', user.uid));

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders'),
    );

    const exchangeQuery = isBootstrappedAdmin
      ? collection(db, 'exchangeRequests')
      : query(collection(db, 'exchangeRequests'), where('userId', '==', user.uid));

    const unsubExchange = onSnapshot(
      exchangeQuery,
      (snap) => {
        setExchangeRequests(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ExchangeRequest, 'id'>) })),
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'exchangeRequests'),
    );

    let unsubStaff = () => {};
    if (isBootstrappedAdmin) {
      unsubStaff = onSnapshot(
        collection(db, 'staff'),
        (snap) => {
          setStaffMembers(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StaffMember, 'id'>) })),
          );
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'staff'),
      );
    }

    return () => {
      unsubOrders();
      unsubExchange();
      unsubStaff();
    };
  }, [authReady, user, isBootstrappedAdmin]);

  const usingSeedFallback = dbProducts.length === 0;
  const products = dbProducts.length > 0 ? dbProducts : SEED_PRODUCTS;
  const brands = dbBrands.length > 0 ? dbBrands : SEED_BRANDS;
  const categories = dbCategories.length > 0 ? dbCategories : SEED_CATEGORIES;
  const posts = dbPosts.length > 0 ? dbPosts : SEED_POSTS;
  const settings = dbSettings || DEFAULT_SITE_SETTINGS;

  // Cart & Compare State
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('ktmtech_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([
    'samsung-galaxy-s25-ultra',
    'apple-iphone-16-pro-max',
  ]);

  useEffect(() => {
    try {
      localStorage.setItem('ktmtech_cart_v1', JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.variantIndex === item.variantIndex,
      );
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + item.quantity };
        return copy;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === idx ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const toggleCompare = (slug: string) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return [...prev.slice(1), slug];
      return [...prev, slug];
    });
  };

  const clearCompare = () => setCompareSlugs([]);

  // Firestore Mutations
  const seedDatabaseToFirestore = async () => {
    const batch = writeBatch(db);
    const now = serverTimestamp();

    for (const c of SEED_CATEGORIES) {
      batch.set(doc(db, 'categories', c.id), {
        name: c.name,
        slug: c.slug,
        department: c.department,
        description: c.description || '',
        sortOrder: c.sortOrder,
        createdAt: now,
        updatedAt: now,
      });
    }
    for (const b of SEED_BRANDS) {
      batch.set(doc(db, 'brands', b.id), {
        name: b.name,
        slug: b.slug,
        deviceTypes: b.deviceTypes,
        ...(b.tier ? { tier: b.tier } : {}),
        ...(b.subBrands ? { subBrands: b.subBrands } : {}),
        ...(b.laptopTier ? { laptopTier: b.laptopTier } : {}),
        ...(b.laptopLineups ? { laptopLineups: b.laptopLineups } : {}),
        ...(b.gamingDivisionName ? { gamingDivisionName: b.gamingDivisionName } : {}),
        ...(b.gamingLineups ? { gamingLineups: b.gamingLineups } : {}),
        sortOrder: b.sortOrder,
        createdAt: now,
        updatedAt: now,
      });
    }
    for (const p of SEED_PRODUCTS) {
      batch.set(doc(db, 'products', p.id), {
        title: p.title,
        slug: p.slug,
        brandSlug: p.brandSlug,
        brandName: p.brandName,
        categorySlug: p.categorySlug,
        categoryName: p.categoryName,
        department: p.department,
        productType: p.productType,
        basePrice: p.basePrice,
        ...(p.originalPrice ? { originalPrice: p.originalPrice } : {}),
        inStock: p.inStock,
        isFeatured: Boolean(p.isFeatured),
        emiAvailable: Boolean(p.emiAvailable),
        imageUrl: p.imageUrl || '',
        warrantyInfo: p.warrantyInfo || '',
        summary: p.summary || '',
        variants: p.variants || [],
        specs: p.specs || {},
        customSpecs: p.customSpecs || [],
        createdAt: now,
        updatedAt: now,
      });
    }
    for (const post of SEED_POSTS) {
      batch.set(doc(db, 'posts', post.id), {
        title: post.title,
        slug: post.slug,
        postType: post.postType,
        status: post.status,
        authorName: post.authorName || 'KtmTech Editorial',
        readTime: post.readTime || '4 min read',
        featuredImageUrl: post.featuredImageUrl || '',
        excerpt: post.excerpt || '',
        content: post.content,
        relatedProductSlugs: post.relatedProductSlugs || [],
        publishedAt: post.publishedAt || new Date().toISOString().slice(0, 10),
        createdAt: now,
        updatedAt: now,
      });
    }
    batch.set(doc(db, 'siteSettings', 'main'), {
      storeName: DEFAULT_SITE_SETTINGS.storeName,
      announcementBar: DEFAULT_SITE_SETTINGS.announcementBar,
      heroTitle: DEFAULT_SITE_SETTINGS.heroTitle,
      heroSubtitle: DEFAULT_SITE_SETTINGS.heroSubtitle,
      heroCtaLabel: DEFAULT_SITE_SETTINGS.heroCtaLabel,
      heroCtaLink: DEFAULT_SITE_SETTINGS.heroCtaLink,
      whatsappNumber: DEFAULT_SITE_SETTINGS.whatsappNumber,
      bankName: DEFAULT_SITE_SETTINGS.bankName,
      accountName: DEFAULT_SITE_SETTINGS.accountName,
      accountNumber: DEFAULT_SITE_SETTINGS.accountNumber,
      updatedAt: now,
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seed-batch');
    }
  };

  const saveProduct = async (product: Product) => {
    const id = product.slug;
    const existingSnap = await getDocs(
      query(collection(db, 'products'), where('slug', '==', product.slug)),
    );
    const existsInDb = existingSnap.docs.some((d) => d.id === id);

    try {
      const payload = {
        title: product.title.trim(),
        slug: product.slug.trim(),
        brandSlug: product.brandSlug,
        brandName: product.brandName,
        categorySlug: product.categorySlug,
        categoryName: product.categoryName,
        department: product.department,
        productType: product.productType,
        basePrice: Number(product.basePrice),
        ...(product.originalPrice ? { originalPrice: Number(product.originalPrice) } : {}),
        inStock: Boolean(product.inStock),
        isFeatured: Boolean(product.isFeatured),
        emiAvailable: Boolean(product.emiAvailable),
        imageUrl: product.imageUrl || '',
        warrantyInfo: product.warrantyInfo || '1 Year Official Brand Warranty + VAT Bill',
        summary: product.summary || '',
        variants: product.variants || [],
        specs: product.specs || {},
        customSpecs: product.customSpecs || [],
        updatedAt: serverTimestamp(),
      };

      if (existsInDb && product.createdAt) {
        await updateDoc(doc(db, 'products', id), { ...payload, createdAt: product.createdAt });
      } else {
        await setDoc(doc(db, 'products', id), { ...payload, createdAt: serverTimestamp() });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const savePost = async (post: Post) => {
    const id = post.slug;
    const existsInDb = dbPosts.some((p) => p.id === id);
    try {
      const payload = {
        title: post.title.trim(),
        slug: post.slug.trim(),
        postType: post.postType,
        status: post.status,
        authorName: post.authorName || user?.displayName || 'KtmTech Editorial',
        readTime: post.readTime || '4 min read',
        featuredImageUrl: post.featuredImageUrl || '',
        excerpt: post.excerpt || '',
        content: post.content,
        relatedProductSlugs: post.relatedProductSlugs || [],
        publishedAt: post.publishedAt || new Date().toISOString().slice(0, 10),
        updatedAt: serverTimestamp(),
      };
      if (existsInDb) {
        await setDoc(doc(db, 'posts', id), { ...payload, createdAt: serverTimestamp() }, { merge: true });
      } else {
        await setDoc(doc(db, 'posts', id), { ...payload, createdAt: serverTimestamp() });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${id}`);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${id}`);
    }
  };

  const saveBrand = async (brand: Brand) => {
    const id = brand.slug;
    try {
      await setDoc(doc(db, 'brands', id), {
        name: brand.name.trim(),
        slug: brand.slug.trim(),
        deviceTypes: brand.deviceTypes.length ? brand.deviceTypes : ['mobile'],
        ...(brand.tier ? { tier: brand.tier } : {}),
        ...(brand.subBrands ? { subBrands: brand.subBrands } : {}),
        ...(brand.laptopTier ? { laptopTier: brand.laptopTier } : {}),
        ...(brand.laptopLineups ? { laptopLineups: brand.laptopLineups } : {}),
        ...(brand.gamingDivisionName ? { gamingDivisionName: brand.gamingDivisionName } : {}),
        ...(brand.gamingLineups ? { gamingLineups: brand.gamingLineups } : {}),
        sortOrder: Number(brand.sortOrder || 100),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `brands/${id}`);
    }
  };

  const saveCategory = async (category: Category) => {
    const id = category.slug;
    try {
      await setDoc(doc(db, 'categories', id), {
        name: category.name.trim(),
        slug: category.slug.trim(),
        department: category.department,
        description: category.description || '',
        sortOrder: Number(category.sortOrder || 100),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
    }
  };

  const saveSiteSettings = async (next: SiteSettings) => {
    try {
      await setDoc(doc(db, 'siteSettings', 'main'), {
        storeName: next.storeName.trim(),
        announcementBar: next.announcementBar || '',
        heroTitle: next.heroTitle.trim(),
        heroSubtitle: next.heroSubtitle || '',
        heroCtaLabel: next.heroCtaLabel || 'Explore Mobiles',
        heroCtaLink: next.heroCtaLink || '/mobiles',
        whatsappNumber: next.whatsappNumber || '',
        bankName: next.bankName || '',
        accountName: next.accountName || '',
        accountNumber: next.accountNumber || '',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'siteSettings/main');
    }
  };

  const createOrder = async (
    payload: Omit<Order, 'id' | 'userId' | 'paymentStatus' | 'orderStatus' | 'createdAt'>,
  ) => {
    if (!user) throw new Error('Please sign in with Google to confirm your order.');
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await setDoc(doc(db, 'orders', orderId), {
        userId: user.uid,
        customerName: payload.customerName.trim(),
        customerPhone: payload.customerPhone.trim(),
        customerEmail: payload.customerEmail.trim(),
        deliveryZone: payload.deliveryZone,
        shippingAddress: payload.shippingAddress.trim(),
        items: payload.items,
        subtotal: Number(payload.subtotal),
        shippingFee: Number(payload.shippingFee),
        totalAmount: Number(payload.totalAmount),
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'processing',
        paymentRef: payload.paymentRef || `KTM-${Date.now()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return orderId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    updates: Partial<Pick<Order, 'paymentStatus' | 'orderStatus' | 'paymentRef'>>,
  ) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const createExchangeRequest = async (
    payload: Omit<ExchangeRequest, 'id' | 'userId' | 'status' | 'createdAt'>,
  ) => {
    if (!user) throw new Error('Please sign in with Google to submit a trade-in request.');
    const reqId = `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await setDoc(doc(db, 'exchangeRequests', reqId), {
        userId: user.uid,
        customerName: payload.customerName.trim(),
        customerPhone: payload.customerPhone.trim(),
        currentDevice: payload.currentDevice.trim(),
        condition: payload.condition,
        ...(payload.targetProductSlug ? { targetProductSlug: payload.targetProductSlug } : {}),
        ...(typeof payload.estimatedValue === 'number'
          ? { estimatedValue: payload.estimatedValue }
          : {}),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return reqId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `exchangeRequests/${reqId}`);
    }
  };

  const updateExchangeStatus = async (
    id: string,
    updates: Partial<Pick<ExchangeRequest, 'status' | 'estimatedValue'>>,
  ) => {
    try {
      await updateDoc(doc(db, 'exchangeRequests', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `exchangeRequests/${id}`);
    }
  };

  const saveStaffMember = async (member: StaffMember) => {
    try {
      await setDoc(doc(db, 'staff', member.id), {
        email: member.email.trim(),
        name: member.name.trim(),
        role: member.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `staff/${member.id}`);
    }
  };

  const deleteStaffMember = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'staff', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `staff/${uid}`);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        path,
        navigate,
        user,
        authReady,
        isAdmin,
        isStoreStaff,
        isEditorialStaff,
        staffRole,
        signInWithGoogle,
        signOutUser,
        products,
        brands,
        categories,
        posts,
        settings,
        orders,
        exchangeRequests,
        staffMembers,
        usingSeedFallback,
        dataLoading,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartSubtotal,
        compareSlugs,
        toggleCompare,
        clearCompare,
        seedDatabaseToFirestore,
        saveProduct,
        deleteProduct,
        savePost,
        deletePost,
        saveBrand,
        saveCategory,
        saveSiteSettings,
        createOrder,
        updateOrderStatus,
        createExchangeRequest,
        updateExchangeStatus,
        saveStaffMember,
        deleteStaffMember,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
