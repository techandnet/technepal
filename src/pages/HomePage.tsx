import { useState } from 'react';
import { ArrowRight, GitCompare, Laptop, Search, Smartphone, Speaker, Thermometer } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { IMG_HERO } from '../data/seedCatalog';
import { ProductCard } from '../components/ProductCard';

const FEATURED_TABS = [
  { id: 'mobiles-tablets', label: 'Smartphones', route: '/mobiles' },
  { id: 'laptops-computing', label: 'Laptops', route: '/laptops' },
  { id: 'audio-wearables', label: 'Audio & Chargers', route: '/categories' },
  { id: 'heating-cooling', label: 'Heating & Cooling', route: '/shop?department=heating-cooling' },
] as const;

export function HomePage() {
  const { navigate, settings, products, posts } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('mobiles-tablets');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      navigate('/shop');
      return;
    }
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const tabProducts = products
    .filter((p) =>
      activeTab === 'audio-wearables'
        ? p.department === 'audio-wearables' || p.department === 'mobile-accessories'
        : p.department === activeTab,
    )
    .slice(0, 3);

  const publishedPosts = posts.filter((p) => p.status === 'published').slice(0, 3);
  const currentTabMeta = FEATURED_TABS.find((t) => t.id === activeTab) || FEATURED_TABS[0];

  return (
    <div className="space-y-16">
      {/* 1. Storefront Hero + 4-Column Directory Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Nepal Tech Store · Verified Specifications · VAT Bill
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.12] headline-balance">
                {settings.heroTitle}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                {settings.heroSubtitle}
              </p>
            </div>

            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search phones, laptops, 65W charger, room heater..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Search Catalog
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(settings.heroCtaLink || '/mobiles')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>{settings.heroCtaLabel || 'Explore Mobiles'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/compare')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#1D4ED8] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <GitCompare className="w-4 h-4" />
                  <span>Compare Specs</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F4F5F7] min-h-[260px] lg:min-h-full relative overflow-hidden">
            <img
              src={IMG_HERO}
              alt="Flagship smartphone, brushed aluminum laptop, and wireless earbuds on limestone desk"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover lg:h-full"
            />
          </div>
        </div>

        {/* Full-width 4-Column Quick Directory Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Smartphone,
              title: '36 Mobile Brands',
              desc: 'Apple, Samsung, Xiaomi, Nothing & Gaming',
              href: '/brands',
            },
            {
              icon: Laptop,
              title: 'Laptop & Gaming Brands',
              desc: 'MacBook, ROG, Legion, ThinkPad & XPS',
              href: '/laptop-brands',
            },
            {
              icon: Speaker,
              title: 'Audio & Chargers',
              desc: 'Earbuds, Bluetooth speakers, cases & GaN',
              href: '/categories',
            },
            {
              icon: Thermometer,
              title: 'Heaters, Coolers & AC',
              desc: 'Room heaters, inverter ACs & water geysers',
              href: '/shop?department=heating-cooling',
            },
          ].map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => navigate(item.href)}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-[#1D4ED8] transition-colors flex items-start gap-3.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F4F5F7] text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-[#1D4ED8]/10 group-hover:text-[#1D4ED8] transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-semibold text-slate-900 group-hover:text-[#1D4ED8]">
                  {item.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Featured Collection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Featured Hardware & Appliances
            </h2>
            <p className="text-sm text-slate-600">
              Genuine stock with official Nepal brand warranties and 0% EMI options.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            {FEATURED_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tabProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Budget Finder & View More Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Browse by budget:</span>
            {[
              { label: 'Under Rs. 20,000', href: '/shop?max=20000' },
              { label: 'Phones Under Rs. 50,000', href: '/mobiles?max=50000' },
              { label: 'Gaming Laptops', href: '/laptops?gaming=true' },
            ].map((chip) => (
              <button
                key={chip.href}
                type="button"
                onClick={() => navigate(chip.href)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors cursor-pointer whitespace-nowrap"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(currentTabMeta.route)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
          >
            <span>View all {currentTabMeta.label}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. Editorial Tech Info, Reviews & Buying Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Tech Info, Reviews & Buying Guides
            </h2>
            <p className="text-sm text-slate-600">
              Benchmark breakdowns, Nepal price lists, and seasonal appliance guides.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
          >
            <span>Read all articles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {post.featuredImageUrl && (
                  <div className="aspect-16/9 w-full bg-[#F4F5F7] overflow-hidden">
                    <img
                      src={post.featuredImageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#1D4ED8]">{post.postType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime || '4 min read'}</span>
                    {post.publishedAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{post.publishedAt}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-slate-900 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>
              <div className="px-5 pb-4 text-xs font-semibold text-slate-800">
                Read full guide →
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
