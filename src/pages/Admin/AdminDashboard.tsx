import { useState, useEffect } from 'react';
import { productsApi } from '../../features/products/api/productsApi';
import { categoriesApi } from '../../features/categories/api/categoriesApi';
import { Package, List } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsApi.getProducts({ pageIndex: 1, pageSize: 1 }), // Just to get count
          categoriesApi.getCategories()
        ]);
        
        setStats({
          products: prodRes.success ? prodRes.data.count : 0,
          categories: catRes.success ? catRes.data.length : 0
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <h2 style={{marginBottom: '24px'}}>لوحة التحكم</h2>
      
      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f0f4f8', padding: '16px', borderRadius: '50%', color: '#1a1a1a' }}>
              <Package size={32} />
            </div>
            <div>
              <p style={{ color: '#757575', fontSize: '0.9rem', marginBottom: '4px' }}>إجمالي المنتجات</p>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.products}</h3>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f0f4f8', padding: '16px', borderRadius: '50%', color: '#1a1a1a' }}>
              <List size={32} />
            </div>
            <div>
              <p style={{ color: '#757575', fontSize: '0.9rem', marginBottom: '4px' }}>إجمالي الأقسام</p>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.categories}</h3>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
