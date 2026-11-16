import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { MobileBrandsPage } from './pages/MobileBrandsPage';
import { LaptopBrandsPage } from './pages/LaptopBrandsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ComparePage } from './pages/ComparePage';
import { BlogPage } from './pages/BlogPage';
import { ExchangePage } from './pages/ExchangePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminPage } from './pages/AdminPage';

function AppRouter() {
  const { path } = useStore();
  const cleanPath = path.split('?')[0] || '/';

  if (cleanPath === '/' || cleanPath === '') return <HomePage />;
  if (cleanPath === '/mobiles') return <CatalogPage mode="mobiles" />;
  if (cleanPath === '/laptops') return <CatalogPage mode="laptops" />;
  if (cleanPath === '/shop') return <CatalogPage mode="shop" />;
  if (cleanPath === '/brands') return <MobileBrandsPage />;
  if (cleanPath === '/laptop-brands') return <LaptopBrandsPage />;
  if (cleanPath === '/categories') return <CategoriesPage />;
  if (cleanPath === '/compare') return <ComparePage />;
  if (cleanPath === '/blog') return <BlogPage />;
  if (cleanPath.startsWith('/blog/')) {
    return <BlogPage slug={cleanPath.replace('/blog/', '')} />;
  }
  if (cleanPath.startsWith('/product/')) {
    return <ProductDetailPage slug={cleanPath.replace('/product/', '')} />;
  }
  if (cleanPath === '/exchange') return <ExchangePage />;
  if (cleanPath === '/checkout') return <CheckoutPage />;
  if (cleanPath === '/orders') return <CheckoutPage showOrdersOnly />;
  if (cleanPath === '/admin') return <AdminPage />;

  return <HomePage />;
}

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0F172A]">
        <Navbar />
        <main className="flex-1">
          <AppRouter />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </StoreProvider>
  );
}
