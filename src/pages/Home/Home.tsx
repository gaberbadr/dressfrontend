import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../../features/products/api/productsApi';
import { settingsApi } from '../../features/settings/api/settingsApi';
import type { Product, Settings } from '../../types/models';
import ProductGrid from '../../components/product/ProductGrid';
import { SlidersHorizontal, X as XIcon } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const categoryIdParam = searchParams.get('categoryId');
  const [sortOption, setSortOption] = useState<string>('');
  
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [tempMinPrice, setTempMinPrice] = useState<string>('');
  const [tempMaxPrice, setTempMaxPrice] = useState<string>('');

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
        sortDirection,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
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
  }, [searchKeyword, categoryIdParam, sortOption, minPrice, maxPrice]);

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
    [hasMore, loading, products.length, searchKeyword, categoryIdParam, sortOption, minPrice, maxPrice]
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
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            بحث: {searchKeyword}
            <button 
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('search');
                setSearchParams(newParams);
                setSortOption('');
                setMinPrice('');
                setMaxPrice('');
                setTempMinPrice('');
                setTempMaxPrice('');
              }}
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '8px',
                cursor: 'pointer', 
                fontSize: '1.2rem', 
                color: '#ef4444', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '4px 12px',
                marginRight: '15px',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              aria-label="مسح البحث"
              title="مسح البحث"
            >
              ✕
            </button>
          </h2>
        ) : (
          <h2>أحدث المنتجات</h2>
        )}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              if (!showFilterOptions) {
                setTempMinPrice(minPrice);
                setTempMaxPrice(maxPrice);
              }
              setShowFilterOptions(!showFilterOptions);
            }}
            style={{ 
              background: '#f8f9fa', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#333'
            }}
            aria-label="تصفية وترتيب"
            title="تصفية وترتيب"
          >
            <SlidersHorizontal size={18} />
          </button>
          
          {showFilterOptions && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              background: 'white',
              border: '1px solid #eaeaea',
              borderRadius: '12px',
              padding: '16px',
              width: '280px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>تصفية وترتيب</h3>
                <button onClick={() => setShowFilterOptions(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XIcon size={18} /></button>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ترتيب حسب:</label>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  <option value="">الأحدث</option>
                  <option value="price-asc">السعر: من الأقل للأكثر</option>
                  <option value="price-desc">السعر: من الأكثر للأقل</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>نطاق السعر:</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    placeholder="من" 
                    value={tempMinPrice}
                    onChange={(e) => setTempMinPrice(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                  <span>-</span>
                  <input 
                    type="number" 
                    placeholder="إلى" 
                    value={tempMaxPrice}
                    onChange={(e) => setTempMaxPrice(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button 
                  onClick={() => {
                    setMinPrice(tempMinPrice);
                    setMaxPrice(tempMaxPrice);
                    setShowFilterOptions(false);
                  }}
                  style={{ flex: 1, padding: '8px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  تطبيق
                </button>
                <button 
                  onClick={() => {
                    setSortOption('');
                    setMinPrice('');
                    setMaxPrice('');
                    setTempMinPrice('');
                    setTempMaxPrice('');
                    setShowFilterOptions(false);
                  }}
                  style={{ flex: 1, padding: '8px', background: '#f1f1f1', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  إلغاء التصفية
                </button>
              </div>
            </div>
          )}
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
