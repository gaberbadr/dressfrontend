import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../../features/products/api/productsApi';
import { settingsApi } from '../../features/settings/api/settingsApi';
import type { Product, Settings } from '../../types/models';
import ProductGrid from '../../components/product/ProductGrid';
import './Home.css';

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const categoryIdParam = searchParams.get('categoryId');
  const [sortOption, setSortOption] = useState<string>('');

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch Settings (for WhatsApp number)
  useEffect(() => {
    settingsApi.getSettings()
      .then(res => res.success && setSettings(res.data))
      .catch(() => {}); // handle silently
  }, []);

  // Fetch Products
  const fetchProducts = async (pageNum: number, isNewSearch: boolean) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      setError(null);

      let sortBy = undefined;
      let sortDirection = undefined;
      
      if (sortOption === 'price-asc') {
        sortBy = 'price';
        sortDirection = 'asc';
      } else if (sortOption === 'price-desc') {
        sortBy = 'price';
        sortDirection = 'desc';
      }

      const response = await productsApi.getProducts({
        pageIndex: pageNum,
        pageSize: 10,
        searchTerm: searchKeyword,
        categoryId: categoryIdParam ? parseInt(categoryIdParam) : undefined,
        sortBy,
        sortDirection
      }, { signal: abortController.signal });

      if (abortController.signal.aborted) return;

      if (response.success) {
        const newProducts = response.data.data;
        const totalCount = response.data.count;

        setProducts(prev => isNewSearch ? newProducts : [...prev, ...newProducts]);
        
        // Check if we fetched everything
        const currentlyLoaded = (pageNum - 1) * 10 + newProducts.length;
        setHasMore(currentlyLoaded < totalCount);
      } else {
        setError(response.message || 'حصلت مشكلة وإحنا بنجيب المنتجات، جرّب تاني.');
        setHasMore(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return; // Ignore aborted requests
      }
      setError('حصلت مشكلة وإحنا بنجيب المنتجات، جرّب تاني.');
      setHasMore(false);
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Reset when search, category, or sort changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    fetchProducts(1, true);
  }, [searchKeyword, categoryIdParam, sortOption]);

  // Handle Infinite Scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      // Added products.length > 0 to prevent fetching page 2 before page 1 is loaded
      if (target.isIntersecting && hasMore && !loading && products.length > 0) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchProducts(nextPage, false);
          return nextPage;
        });
      }
    },
    [hasMore, loading, products.length, searchKeyword, categoryIdParam, sortOption]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="home-container container">
      <div className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        {searchKeyword ? (
          <h2>نتائج البحث عن: "{searchKeyword}"</h2>
        ) : (
          <h2>أحدث المنتجات</h2>
        )}
        <div className="sort-control">
          <label htmlFor="sort" style={{ marginInlineEnd: '10px', marginLeft: '5px' }}>ترتيب:</label>
          <select 
            id="sort" 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">الأحدث</option>
            <option value="price-asc">السعر: من الأقل للأكثر</option>
            <option value="price-desc">السعر: من الأكثر للأقل</option>
          </select>
        </div>
      </div>

      <ProductGrid products={products} whatsappNumber={settings?.phoneNumber} />

      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="error-container">
          <p className="text-error">{error}</p>
          <button className="btn btn-outline" onClick={() => fetchProducts(page, products.length === 0)}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Invisible element for Intersection Observer */}
      <div ref={observerTarget} style={{ height: '20px' }}></div>
    </div>
  );
};

export default Home;
