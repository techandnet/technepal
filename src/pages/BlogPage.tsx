import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { PostType } from '../types';

const POST_FILTERS: ('All' | PostType)[] = ['All', 'Review', 'Buying Guide', 'Price List', 'Tech News'];

export function BlogPage({ slug }: { slug?: string }) {
  const { posts, products, navigate, addToCart } = useStore();
  const [filterType, setFilterType] = useState<'All' | PostType>('All');

  const publishedPosts = posts.filter((p) => p.status === 'published');

  if (slug) {
    const post = posts.find((p) => p.slug === slug);
    if (!post) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-slate-900">Article not found</h1>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="px-4 py-2 bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            Back to Tech Blog
          </button>
        </div>
      );
    }

    const linkedProducts = (post.relatedProductSlugs || [])
      .map((ps) => products.find((p) => p.slug === ps))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    return (
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1D4ED8] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Tech Info & Reviews</span>
        </button>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-[#1D4ED8]">{post.postType}</span>
            <span aria-hidden="true">·</span>
            <span>{post.authorName || 'KtmTech Editorial'}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime || '4 min read'}</span>
            {post.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.publishedAt}</span>
              </>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight headline-balance">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-base text-slate-600 leading-relaxed">{post.excerpt}</p>
          )}
        </header>

        {post.featuredImageUrl && (
          <div className="aspect-16/9 w-full rounded-2xl overflow-hidden bg-[#F4F5F7] border border-slate-200">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 text-[15px] sm:text-base text-slate-800 leading-relaxed">
          {post.content.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Embedded Buy Now Product Cards */}
        {linkedProducts.length > 0 && (
          <section className="space-y-4 pt-2">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Featured Devices in This Article
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {linkedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 uppercase">{prod.brandName}</p>
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${prod.slug}`)}
                      className="font-display text-sm font-bold text-slate-900 hover:text-[#1D4ED8] truncate block text-left cursor-pointer"
                    >
                      {prod.title}
                    </button>
                    <p className="font-mono-num text-sm font-semibold text-[#1D4ED8] mt-1">
                      Rs. {prod.basePrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart({
                          productId: prod.id,
                          slug: prod.slug,
                          title: prod.title,
                          imageUrl: prod.imageUrl,
                          unitPrice: prod.basePrice,
                          quantity: 1,
                        });
                      }}
                      className="px-3.5 py-2 bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg hover:bg-[#1E40AF] cursor-pointer whitespace-nowrap"
                    >
                      Buy Now
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${prod.slug}`)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Full Specs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    );
  }

  const filteredPosts =
    filterType === 'All'
      ? publishedPosts
      : publishedPosts.filter((p) => p.postType === filterType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Editorial Portal
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Tech News, Reviews & Buying Guides
          </h1>
          <p className="text-sm text-slate-600">
            Honest Nepal market comparisons, updated mobile price lists, and hardware guides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {POST_FILTERS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
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
              <div className="p-6 space-y-2.5">
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
                <h2 className="font-display text-xl font-bold text-slate-900 leading-snug">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 pb-5 text-xs font-semibold text-[#1D4ED8]">
              Read full article →
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
