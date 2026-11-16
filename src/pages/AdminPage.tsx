import { useEffect, useState } from 'react';
import { Database, LogOut, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { IMG_AUDIO, IMG_CLIMATE, IMG_LAPTOP, IMG_PHONE, IMG_BLOG } from '../data/seedCatalog';
import type {
  Brand,
  Category,
  Department,
  Post,
  PostType,
  Product,
  ProductType,
  SiteSettings,
} from '../types';

type AdminTab = 'products' | 'posts' | 'taxonomy' | 'orders' | 'settings' | 'staff';

function slugify(val: string) {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminPage() {
  const {
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
    orders,
    exchangeRequests,
    settings,
    staffMembers,
    usingSeedFallback,
    seedDatabaseToFirestore,
    saveProduct,
    deleteProduct,
    savePost,
    deletePost,
    saveBrand,
    saveCategory,
    saveSiteSettings,
    updateOrderStatus,
    updateExchangeStatus,
    saveStaffMember,
    deleteStaffMember,
  } = useStore();

  const [tab, setTab] = useState<AdminTab>('products');
  const [statusMsg, setStatusMsg] = useState('');
  const [seeding, setSeeding] = useState(false);

  // Product Form State
  const [prodTitle, setProdTitle] = useState('');
  const [prodBrandSlug, setProdBrandSlug] = useState('samsung');
  const [prodCategorySlug, setProdCategorySlug] = useState('smartphones');
  const [prodType, setProdType] = useState<ProductType>('smartphone');
  const [prodPrice, setProdPrice] = useState('45000');
  const [prodMrp, setProdMrp] = useState('');
  const [prodStock, setProdStock] = useState(true);
  const [prodEmi, setProdEmi] = useState(true);
  const [prodSummary, setProdSummary] = useState('');
  const [prodProcessor, setProdProcessor] = useState('');
  const [prodDisplay, setProdDisplay] = useState('');
  const [prodBattery, setProdBattery] = useState('');
  const [editingProdSlug, setEditingProdSlug] = useState<string | null>(null);

  // Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postType, setPostType] = useState<PostType>('Tech News');
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postRelated, setPostRelated] = useState<string[]>([]);
  const [editingPostSlug, setEditingPostSlug] = useState<string | null>(null);

  // Brand / Category Form State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandType, setNewBrandType] = useState<'mobile' | 'laptop' | 'electronics'>('mobile');
  const [newBrandSub, setNewBrandSub] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDept, setNewCatDept] = useState<Department>('mobile-accessories');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Site Settings Form State
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);

  useEffect(() => {
    setSiteForm(settings);
  }, [settings]);

  // Staff Form State
  const [staffUid, setStaffUid] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffAssignRole, setStaffAssignRole] = useState<'admin' | 'store-manager' | 'editor'>('editor');

  const flashStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  if (!authReady) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-slate-500">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Self-Editable CMS
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Admin & Editorial Login
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in with Google to manage products, update NPR prices, publish tech reviews, process orders, and edit storefront banners.
            </p>
          </div>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-3 px-4 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isStoreStaff && !isEditorialStaff) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Staff Access Required
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            You are signed in as <strong>{user.email}</strong> (UID:{' '}
            <span className="font-mono-num text-xs bg-slate-100 px-1.5 py-0.5 rounded">
              {user.uid}
            </span>
            ). Ask the Super Admin to assign your UID a Store Manager or Blog Editor role inside Staff Logins.
          </p>
          <button
            type="button"
            onClick={signOutUser}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabaseToFirestore();
      flashStatus('All 60+ brands, 31 categories, 15 products, and 4 blog posts synced to Firestore.');
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Seed failed.');
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const brand = brands.find((b) => b.slug === prodBrandSlug) || brands[0];
    const cat = categories.find((c) => c.slug === prodCategorySlug) || categories[0];
    const slug = editingProdSlug || slugify(prodTitle);
    const defaultImg =
      prodType === 'laptop'
        ? IMG_LAPTOP
        : prodType === 'appliance'
          ? IMG_CLIMATE
          : prodType === 'accessory'
            ? IMG_AUDIO
            : IMG_PHONE;

    const existing = products.find((p) => p.slug === slug);

    const payload: Product = {
      id: slug,
      title: prodTitle,
      slug,
      brandSlug: brand.slug,
      brandName: brand.name,
      categorySlug: cat.slug,
      categoryName: cat.name,
      department: cat.department,
      productType: prodType,
      basePrice: Number(prodPrice),
      originalPrice: prodMrp ? Number(prodMrp) : undefined,
      inStock: prodStock,
      isFeatured: existing?.isFeatured ?? true,
      emiAvailable: prodEmi,
      imageUrl: existing?.imageUrl || defaultImg,
      warrantyInfo: existing?.warrantyInfo || '1 Year Official Brand Warranty + VAT Bill',
      summary: prodSummary || existing?.summary || '',
      variants: existing?.variants || [],
      specs:
        prodType === 'smartphone' || prodType === 'laptop'
          ? {
              ...(existing?.specs || {}),
              display: prodDisplay || existing?.specs?.display || 'Full HD+ 120Hz',
              processor: prodProcessor || existing?.specs?.processor || 'Latest Gen Chipset',
              battery: prodBattery || existing?.specs?.battery || '5000mAh Fast Charge',
              supports5G: prodType === 'smartphone',
            }
          : existing?.specs || {},
      customSpecs:
        prodType === 'accessory' || prodType === 'appliance'
          ? existing?.customSpecs || [
              { label: 'Key Spec', value: prodProcessor || 'Official Nepal Stock' },
              { label: 'Warranty', value: '1 Year Official Warranty' },
            ]
          : existing?.customSpecs || [],
      createdAt: existing?.createdAt,
    };

    try {
      await saveProduct(payload);
      setProdTitle('');
      setProdPrice('45000');
      setProdMrp('');
      setProdSummary('');
      setProdProcessor('');
      setProdDisplay('');
      setProdBattery('');
      setEditingProdSlug(null);
      flashStatus(`Saved "${payload.title}" to Firestore.`);
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const loadProductForEdit = (p: Product) => {
    setEditingProdSlug(p.slug);
    setProdTitle(p.title);
    setProdBrandSlug(p.brandSlug);
    setProdCategorySlug(p.categorySlug);
    setProdType(p.productType);
    setProdPrice(String(p.basePrice));
    setProdMrp(p.originalPrice ? String(p.originalPrice) : '');
    setProdStock(p.inStock);
    setProdEmi(Boolean(p.emiAvailable));
    setProdSummary(p.summary || '');
    setProdProcessor(p.specs?.processor || '');
    setProdDisplay(p.specs?.display || '');
    setProdBattery(p.specs?.battery || '');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = editingPostSlug || slugify(postTitle);
    const payload: Post = {
      id: slug,
      title: postTitle,
      slug,
      postType,
      status: postStatus,
      authorName: user.displayName || 'KtmTech Editorial',
      readTime: `${Math.max(2, Math.ceil(postContent.split(/\s+/).length / 180))} min read`,
      featuredImageUrl: IMG_BLOG,
      excerpt: postExcerpt || postContent.slice(0, 140),
      content: postContent,
      relatedProductSlugs: postRelated,
      publishedAt: new Date().toISOString().slice(0, 10),
    };
    try {
      await savePost(payload);
      setPostTitle('');
      setPostExcerpt('');
      setPostContent('');
      setPostRelated([]);
      setEditingPostSlug(null);
      flashStatus(`Saved post "${payload.title}".`);
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Failed to save post.');
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(newBrandName);
    const b: Brand = {
      id: slug,
      name: newBrandName,
      slug,
      deviceTypes: [newBrandType],
      ...(newBrandType === 'mobile' ? { tier: 'global-leaders', subBrands: newBrandSub } : {}),
      ...(newBrandType === 'laptop' ? { laptopTier: 'major-global', laptopLineups: newBrandSub } : {}),
      ...(newBrandType === 'electronics' ? { subBrands: newBrandSub } : {}),
      sortOrder: 90,
    };
    try {
      await saveBrand(b);
      setNewBrandName('');
      setNewBrandSub('');
      flashStatus(`Added brand "${b.name}".`);
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Failed to save brand.');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(newCatName);
    const c: Category = {
      id: slug,
      name: newCatName,
      slug,
      department: newCatDept,
      description: newCatDesc,
      sortOrder: 90,
    };
    try {
      await saveCategory(c);
      setNewCatName('');
      setNewCatDesc('');
      flashStatus(`Added category "${c.name}".`);
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Failed to save category.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Admin Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            CMS Dashboard · Role: {staffRole}
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Welcome, {user.displayName || user.email}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeed}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Database className="w-4 h-4" />
              <span>
                {seeding
                  ? 'Syncing...'
                  : usingSeedFallback
                    ? 'Seed Starter Catalog to Firestore'
                    : 'Re-Sync Starter Catalog'}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={signOutUser}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-[#047857]/10 border border-[#047857]/30 text-[#047857] px-4 py-3 rounded-xl text-sm font-medium">
          {statusMsg}
        </div>
      )}

      {/* CMS Section Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'products', label: `Products (${products.length})`, show: isStoreStaff },
          { id: 'posts', label: `Tech Blog (${posts.length})`, show: isEditorialStaff },
          { id: 'taxonomy', label: 'Brands & Categories', show: isStoreStaff },
          { id: 'orders', label: `Orders (${orders.length})`, show: isStoreStaff },
          { id: 'settings', label: 'Site Settings', show: isStoreStaff },
          { id: 'staff', label: 'Staff Logins', show: isAdmin },
        ]
          .filter((t) => t.show)
          .map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as AdminTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {/* TAB 1: PRODUCTS */}
      {tab === 'products' && isStoreStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveProduct}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editingProdSlug ? 'Edit Product' : 'Add New Product'}
              </h2>
              {editingProdSlug && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProdSlug(null);
                    setProdTitle('');
                  }}
                  className="text-xs text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  + New instead
                </button>
              )}
            </div>

            <input
              required
              value={prodTitle}
              onChange={(e) => setProdTitle(e.target.value)}
              placeholder="Product Title (e.g. Samsung Galaxy A56 5G)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={prodBrandSlug}
                onChange={(e) => setProdBrandSlug(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={prodCategorySlug}
                onChange={(e) => setProdCategorySlug(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <select
                value={prodType}
                onChange={(e) => setProdType(e.target.value as ProductType)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="smartphone">Smartphone</option>
                <option value="laptop">Laptop</option>
                <option value="accessory">Accessory</option>
                <option value="appliance">Appliance</option>
              </select>
              <input
                required
                type="number"
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                placeholder="Price NPR"
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-num"
              />
              <input
                type="number"
                value={prodMrp}
                onChange={(e) => setProdMrp(e.target.value)}
                placeholder="MRP (opt)"
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-num"
              />
            </div>

            <input
              value={prodSummary}
              onChange={(e) => setProdSummary(e.target.value)}
              placeholder="Short highlight summary"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                value={prodDisplay}
                onChange={(e) => setProdDisplay(e.target.value)}
                placeholder="Display"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
              <input
                value={prodProcessor}
                onChange={(e) => setProdProcessor(e.target.value)}
                placeholder="Chip / Key Spec"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
              <input
                value={prodBattery}
                onChange={(e) => setProdBattery(e.target.value)}
                placeholder="Battery / Power"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-5 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prodStock}
                  onChange={(e) => setProdStock(e.target.checked)}
                  className="accent-[#1D4ED8]"
                />
                <span>In Stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prodEmi}
                  onChange={(e) => setProdEmi(e.target.checked)}
                  className="accent-[#1D4ED8]"
                />
                <span>0% EMI Eligible</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{editingProdSlug ? 'Update Product' : 'Publish Product'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900">
                Catalog Inventory
              </h2>
              <span className="text-xs text-slate-500">
                {usingSeedFallback ? 'Viewing starter catalog (click Seed to edit live)' : 'Synced with Firestore'}
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {products.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-slate-900 truncate">
                      {p.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.brandName} · {p.categoryName} ·{' '}
                      <span className="font-mono-num text-slate-900 font-semibold">
                        Rs. {p.basePrice.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => loadProductForEdit(p)}
                      className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Edit
                    </button>
                    {isAdmin && !usingSeedFallback && (
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        aria-label={`Delete ${p.title}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TECH BLOG */}
      {tab === 'posts' && isEditorialStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSavePost}
            className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              {editingPostSlug ? 'Edit Article' : 'Write Tech Article / Review'}
            </h2>

            <input
              required
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Headline (e.g. Best Phones Under Rs. 35,000 in Nepal)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="Tech News">Tech News</option>
                <option value="Review">Review</option>
                <option value="Buying Guide">Buying Guide</option>
                <option value="Price List">Price List</option>
              </select>
              <select
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value as 'published' | 'draft')}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <input
              value={postExcerpt}
              onChange={(e) => setPostExcerpt(e.target.value)}
              placeholder="Brief 1-sentence summary"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <textarea
              required
              rows={6}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write article paragraphs separated by blank lines..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">
                Link Featured &ldquo;Buy Now&rdquo; Products (up to 4)
              </p>
              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postRelated.includes(p.slug)}
                      onChange={(e) => {
                        setPostRelated((prev) =>
                          e.target.checked
                            ? [...prev, p.slug].slice(0, 4)
                            : prev.filter((s) => s !== p.slug),
                        );
                      }}
                      className="accent-[#1D4ED8]"
                    />
                    <span>{p.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] cursor-pointer"
            >
              {editingPostSlug ? 'Update Article' : 'Publish Article'}
            </button>
          </form>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-[#F8FAFC]">
              <h2 className="font-display text-base font-bold text-slate-900">Published & Drafts</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {posts.map((post) => (
                <div key={post.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1D4ED8]">
                      {post.postType} · {post.status}
                    </p>
                    <p className="font-display text-sm font-semibold text-slate-900 truncate">
                      {post.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPostSlug(post.slug);
                        setPostTitle(post.title);
                        setPostType(post.postType);
                        setPostStatus(post.status);
                        setPostExcerpt(post.excerpt || '');
                        setPostContent(post.content);
                        setPostRelated(post.relatedProductSlugs || []);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg cursor-pointer"
                    >
                      Edit
                    </button>
                    {isAdmin && !usingSeedFallback && (
                      <button
                        type="button"
                        onClick={() => deletePost(post.id)}
                        aria-label={`Delete ${post.title}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRANDS & CATEGORIES */}
      {tab === 'taxonomy' && isStoreStaff && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form
            onSubmit={handleAddBrand}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              Add Brand ({brands.length} active)
            </h2>
            <input
              required
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Brand Name (e.g. Baseus, Sharp)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <select
              value={newBrandType}
              onChange={(e) =>
                setNewBrandType(e.target.value as 'mobile' | 'laptop' | 'electronics')
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="mobile">Mobile Phone Brand</option>
              <option value="laptop">Laptop Brand</option>
              <option value="electronics">Electronics / Appliance Brand</option>
            </select>
            <input
              value={newBrandSub}
              onChange={(e) => setNewBrandSub(e.target.value)}
              placeholder="Sub-brands / Lineups (optional)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg cursor-pointer"
            >
              Save Brand
            </button>
          </form>

          <form
            onSubmit={handleAddCategory}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              Add Category ({categories.length} active)
            </h2>
            <input
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category Name (e.g. Smart Door Locks)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <select
              value={newCatDept}
              onChange={(e) => setNewCatDept(e.target.value as Department)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="mobiles-tablets">Mobiles & Tablets</option>
              <option value="laptops-computing">Laptops & Computing</option>
              <option value="mobile-accessories">Mobile Accessories</option>
              <option value="audio-wearables">Audio & Wearables</option>
              <option value="heating-cooling">Heating, Cooling & Climate</option>
              <option value="home-kitchen">Home & Kitchen Electronics</option>
            </select>
            <input
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Short description"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg cursor-pointer"
            >
              Save Category
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ORDERS & EXCHANGE */}
      {tab === 'orders' && isStoreStaff && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-[#F8FAFC]">
              <h2 className="font-display text-base font-bold text-slate-900">
                Customer Orders ({orders.length})
              </h2>
            </div>
            {orders.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No orders placed yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-mono-num text-xs text-slate-500">
                        {ord.id} · {ord.customerName} ({ord.customerPhone})
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {ord.items.map((i) => `${i.title} × ${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ord.shippingAddress} ·{' '}
                        <span className="font-mono-num font-semibold text-slate-900">
                          Rs. {ord.totalAmount.toLocaleString()}
                        </span>{' '}
                        ({ord.paymentMethod})
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={ord.paymentStatus}
                        onChange={(e) =>
                          updateOrderStatus(ord.id, {
                            paymentStatus: e.target.value as 'pending' | 'paid' | 'failed',
                          })
                        }
                        className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="pending">Payment: Pending</option>
                        <option value="paid">Payment: Paid</option>
                        <option value="failed">Payment: Failed</option>
                      </select>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) =>
                          updateOrderStatus(ord.id, {
                            orderStatus: e.target.value as
                              | 'processing'
                              | 'dispatched'
                              | 'delivered'
                              | 'cancelled',
                          })
                        }
                        className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="processing">Processing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-[#F8FAFC]">
              <h2 className="font-display text-base font-bold text-slate-900">
                Phone Trade-In Requests ({exchangeRequests.length})
              </h2>
            </div>
            {exchangeRequests.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No exchange requests yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {exchangeRequests.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {ex.currentDevice} ({ex.condition})
                      </p>
                      <p className="text-xs text-slate-500">
                        {ex.customerName} · {ex.customerPhone}
                      </p>
                    </div>
                    <select
                      value={ex.status}
                      onChange={(e) =>
                        updateExchangeStatus(ex.id, {
                          status: e.target.value as
                            | 'pending'
                            | 'reviewed'
                            | 'approved'
                            | 'completed',
                        })
                      }
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white w-fit"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STOREFRONT SETTINGS */}
      {tab === 'settings' && isStoreStaff && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await saveSiteSettings(siteForm);
              flashStatus('Storefront banner and payment details updated.');
            } catch (err) {
              flashStatus(err instanceof Error ? err.message : 'Unable to save settings.');
            }
          }}
          className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-900">
            Self-Editable Storefront & Fonepay Settings
          </h2>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Store Name</label>
            <input
              required
              value={siteForm.storeName}
              onChange={(e) => setSiteForm({ ...siteForm, storeName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Top Announcement Bar
            </label>
            <input
              value={siteForm.announcementBar || ''}
              onChange={(e) => setSiteForm({ ...siteForm, announcementBar: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Hero Headline</label>
            <input
              required
              value={siteForm.heroTitle}
              onChange={(e) => setSiteForm({ ...siteForm, heroTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Hero Subtitle
            </label>
            <textarea
              rows={3}
              value={siteForm.heroSubtitle || ''}
              onChange={(e) => setSiteForm({ ...siteForm, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={siteForm.bankName || ''}
              onChange={(e) => setSiteForm({ ...siteForm, bankName: e.target.value })}
              placeholder="Bank Name"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <input
              value={siteForm.accountName || ''}
              onChange={(e) => setSiteForm({ ...siteForm, accountName: e.target.value })}
              placeholder="Account Name"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <input
              value={siteForm.accountNumber || ''}
              onChange={(e) => setSiteForm({ ...siteForm, accountNumber: e.target.value })}
              placeholder="Account Number"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-num"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] cursor-pointer"
          >
            Save Storefront Settings
          </button>
        </form>
      )}

      {/* TAB 6: STAFF LOGINS */}
      {tab === 'staff' && isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await saveStaffMember({
                  id: staffUid.trim(),
                  email: staffEmail.trim(),
                  name: staffName.trim(),
                  role: staffAssignRole,
                });
                setStaffUid('');
                setStaffEmail('');
                setStaffName('');
                flashStatus('Staff login role saved.');
              } catch (err) {
                flashStatus(err instanceof Error ? err.message : 'Failed to save staff role.');
              }
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              Assign Team Login Role
            </h2>
            <p className="text-xs text-slate-500">
              Give your blog writers or store managers login permissions using their Google Firebase UID.
            </p>
            <input
              required
              value={staffUid}
              onChange={(e) => setStaffUid(e.target.value)}
              placeholder="Firebase User UID"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-num"
            />
            <input
              required
              type="email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder="Staff Google Email"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <input
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Staff Full Name"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            <select
              value={staffAssignRole}
              onChange={(e) =>
                setStaffAssignRole(e.target.value as 'admin' | 'store-manager' | 'editor')
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="editor">Blog Editor (Posts Only)</option>
              <option value="store-manager">Store Manager (Products, Prices & Orders)</option>
              <option value="admin">Super Admin (Full Access)</option>
            </select>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg cursor-pointer"
            >
              Grant Role
            </button>
          </form>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-[#F8FAFC]">
              <h2 className="font-display text-base font-bold text-slate-900">
                Active Staff Logins ({staffMembers.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {staffMembers.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">
                      {m.email} · {m.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteStaffMember(m.id)}
                    aria-label={`Remove ${m.name}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {staffMembers.length === 0 && (
                <p className="p-5 text-xs text-slate-500">
                  No additional staff members assigned yet. Your primary owner account has permanent Super Admin access.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
