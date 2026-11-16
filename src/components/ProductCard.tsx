import { useState } from 'react';
import { GitCompare, Laptop, Smartphone, Speaker, Thermometer } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';

function FallbackDeviceIcon({ type }: { type: Product['productType'] }) {
  if (type === 'laptop') return <Laptop className="w-10 h-10 text-slate-400" />;
  if (type === 'appliance') return <Thermometer className="w-10 h-10 text-slate-400" />;
  if (type === 'accessory') return <Speaker className="w-10 h-10 text-slate-400" />;
  return <Smartphone className="w-10 h-10 text-slate-400" />;
}

export function ProductCard({ product }: { product: Product }) {
  const { navigate, addToCart, compareSlugs, toggleCompare } = useStore();
  const [imgFailed, setImgFailed] = useState(false);

  const isCompared = compareSlugs.includes(product.slug);
  const canCompare = product.productType === 'smartphone' || product.productType === 'laptop';

  const specSummary =
    product.productType === 'smartphone' || product.productType === 'laptop'
      ? [product.specs?.processor, product.specs?.gpu || product.specs?.battery]
          .filter(Boolean)
          .slice(0, 2)
          .join(' · ')
      : product.customSpecs?.[0]
        ? `${product.customSpecs[0].label}: ${product.customSpecs[0].value}`
        : product.warrantyInfo || '';

  return (
    <article className="group bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Studio Image (4:3 uniform aspect) */}
      <button
        type="button"
        onClick={() => navigate(`/product/${product.slug}`)}
        className="block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
      >
        <div className="aspect-4/3 w-full bg-[#F4F5F7] overflow-hidden relative flex items-center justify-center">
          {product.imageUrl && !imgFailed ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
              <FallbackDeviceIcon type={product.productType} />
              <span className="text-xs font-medium text-slate-500">{product.brandName}</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          {/* Clean unboxed metadata (no pill badges) */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="uppercase tracking-wider font-medium truncate">
              {product.brandName} · {product.categoryName}
            </span>
            <span
              className={`shrink-0 font-medium ${
                product.inStock ? 'text-[#047857]' : 'text-slate-400'
              }`}
            >
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <h3 className="font-display text-base font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#1D4ED8] transition-colors">
            {product.title}
          </h3>

          {specSummary && (
            <p className="text-xs text-slate-500 line-clamp-1">{specSummary}</p>
          )}
        </div>
      </button>

      {/* Price & Actions Footer */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <div className="font-mono-num text-[15px] font-semibold text-slate-900">
            Rs. {Number(product.basePrice).toLocaleString()}
          </div>
          {product.originalPrice && product.originalPrice > product.basePrice && (
            <div className="font-mono-num text-xs text-slate-400 line-through">
              Rs. {Number(product.originalPrice).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {canCompare && (
            <button
              type="button"
              onClick={() => toggleCompare(product.slug)}
              title={isCompared ? 'Remove from comparison' : 'Add to compare'}
              aria-label={`Compare ${product.title}`}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center ${
                isCompared
                  ? 'border-[#1D4ED8] bg-[#1D4ED8]/10 text-[#1D4ED8]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => {
              const firstVariant = product.variants?.[0];
              addToCart({
                productId: product.id,
                slug: product.slug,
                title: product.title,
                imageUrl: product.imageUrl,
                variantIndex: firstVariant ? 0 : undefined,
                variantLabel: firstVariant
                  ? `${firstVariant.ramStorage} · ${firstVariant.color}`
                  : undefined,
                unitPrice: Number(firstVariant ? firstVariant.price : product.basePrice),
                quantity: 1,
              });
            }}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0 min-h-[38px]"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </article>
  );
}
