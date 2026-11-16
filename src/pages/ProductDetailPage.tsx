import { useEffect, useState } from 'react';
import { ArrowLeft, Check, GitCompare, RefreshCw, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { EmiCalculator } from '../components/EmiCalculator';

export function ProductDetailPage({ slug }: { slug: string }) {
  const {
    products,
    posts,
    navigate,
    addToCart,
    compareSlugs,
    toggleCompare,
    settings,
  } = useStore();

  const product = products.find((p) => p.slug === slug);
  const [variantIdx, setVariantIdx] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setVariantIdx(0);
    setImgFailed(false);
  }, [slug]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="text-sm text-slate-600">
          The requested item may have been removed or renamed in the admin catalog.
        </p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-4 py-2 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  const variants = product.variants || [];
  const selectedVariant = variants[variantIdx];
  const activePrice = Number(selectedVariant ? selectedVariant.price : product.basePrice);
  const isCompared = compareSlugs.includes(product.slug);
  const canCompare = product.productType === 'smartphone' || product.productType === 'laptop';

  const specRows: [string, string][] =
    product.productType === 'accessory' || product.productType === 'appliance'
      ? (product.customSpecs || []).map((s) => [s.label, s.value])
      : [
          ['Display', product.specs?.display || '—'],
          ['Processor / Chipset', product.specs?.processor || '—'],
          ...(product.specs?.gpu ? [['Graphics (GPU)', product.specs.gpu] as [string, string]] : []),
          ...(product.productType === 'smartphone'
            ? [
                ['Rear Camera', product.specs?.rearCamera || '—'] as [string, string],
                ['Front Camera', product.specs?.frontCamera || '—'] as [string, string],
              ]
            : []),
          ['Battery & Charging', product.specs?.battery || '—'],
          ['Operating System', product.specs?.os || '—'],
          ...(product.productType === 'smartphone'
            ? [['5G Connectivity', product.specs?.supports5G ? 'Supported' : '4G LTE'] as [string, string]]
            : []),
        ];

  const relatedPosts = posts.filter(
    (post) => post.status === 'published' && post.relatedProductSlugs?.includes(product.slug),
  );

  const handleAction = (goCheckout: boolean) => {
    addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      imageUrl: product.imageUrl,
      variantIndex: variants.length ? variantIdx : undefined,
      variantLabel: selectedVariant
        ? `${selectedVariant.ramStorage} · ${selectedVariant.color}`
        : undefined,
      unitPrice: activePrice,
      quantity: 1,
    });
    if (goCheckout) {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      <button
        type="button"
        onClick={() =>
          navigate(
            product.productType === 'smartphone'
              ? '/mobiles'
              : product.productType === 'laptop'
                ? '/laptops'
                : '/shop',
          )
        }
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1D4ED8] cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {product.categoryName}</span>
      </button>

      {/* Contiguous Purchase Module */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Studio Gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-4">
          <div className="aspect-4/3 w-full bg-[#F4F5F7] rounded-xl overflow-hidden flex items-center justify-center">
            {product.imageUrl && !imgFailed ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-slate-500">{product.title}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-1">
            <span className="inline-flex items-center gap-1.5 text-[#047857] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{product.warrantyInfo || 'Official Brand Warranty + VAT Bill'}</span>
            </span>
            {product.productType === 'smartphone' && (
              <button
                type="button"
                onClick={() => navigate(`/exchange?target=${product.slug}`)}
                className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Exchange old phone</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {product.brandName} · {product.categoryName} ·{' '}
              <span className={product.inStock ? 'text-[#047857]' : 'text-red-600'}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 headline-balance">
              {product.title}
            </h1>
            {product.summary && (
              <p className="text-sm text-slate-600 leading-relaxed">{product.summary}</p>
            )}
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <span className="font-mono-num text-3xl font-bold text-slate-900">
              Rs. {activePrice.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > activePrice && (
              <span className="font-mono-num text-base text-slate-400 line-through">
                Rs. {Number(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          {variants.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Configuration & Color
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, idx) => (
                  <button
                    key={`${v.ramStorage}-${v.color}`}
                    type="button"
                    onClick={() => setVariantIdx(idx)}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      variantIdx === idx
                        ? 'border-[#1D4ED8] bg-[#1D4ED8]/10 text-[#1D4ED8]'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {v.ramStorage} · {v.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => handleAction(false)}
              className="flex-1 py-3 px-4 rounded-lg border border-slate-900 text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Add to Bag
            </button>
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => handleAction(true)}
              className="flex-1 py-3 px-4 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] transition-colors disabled:opacity-40 cursor-pointer"
            >
              {product.inStock ? 'Buy Now' : 'Out of Stock'}
            </button>
            {canCompare && (
              <button
                type="button"
                onClick={() => toggleCompare(product.slug)}
                className={`px-4 py-3 rounded-lg border text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isCompared
                    ? 'border-[#1D4ED8] bg-[#1D4ED8]/10 text-[#1D4ED8]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isCompared ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                <span>{isCompared ? 'Compared' : 'Compare'}</span>
              </button>
            )}
          </div>

          {product.emiAvailable && <EmiCalculator price={activePrice} />}

          {settings.whatsappNumber && (
            <p className="text-xs text-slate-500">
              Need help before ordering?{' '}
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hi, I want to inquire about ${product.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1D4ED8] hover:underline"
              >
                Message our Kathmandu desk on WhatsApp →
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Technical Specifications Table */}
      {specRows.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-[#F8FAFC]">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {product.title} — Technical Specifications
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100">
                {specRows.map(([label, value]) => (
                  <tr key={label}>
                    <td className="px-6 py-3.5 w-52 font-medium text-slate-600 bg-[#FAFAFA]">
                      {label}
                    </td>
                    <td className="px-6 py-3.5 text-slate-900 font-mono-num">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Related Editorial Reviews */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Related Reviews & Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-[#1D4ED8] transition-colors cursor-pointer space-y-2"
              >
                <p className="text-xs font-semibold text-[#1D4ED8]">
                  {post.postType} · {post.readTime || '4 min read'}
                </p>
                <h3 className="font-display text-base font-bold text-slate-900">{post.title}</h3>
                {post.excerpt && <p className="text-xs text-slate-600 line-clamp-2">{post.excerpt}</p>}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
