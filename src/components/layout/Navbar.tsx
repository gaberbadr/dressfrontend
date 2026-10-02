import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { categoriesApi } from '../../features/categories/api/categoriesApi';
import type { Category } from '../../types/models';
import basantLogo from '../../assets/basantlogo.jpg';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem('token');

  const flattenCategories = (cats: Category[], level = 0): (Category & { level: number })[] => {
    let result: (Category & { level: number })[] = [];
    cats.forEach(c => {
      result.push({ ...c, level });
      if (c.children && c.children.length > 0) {
        result = result.concat(flattenCategories(c.children, level + 1));
      }
    });
    return result;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getCategories();
        if (res.success) {
          setCategories(flattenCategories(res.data) as any); // Storing flat categories in the same state
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="navbar-wrapper">
        <div className="container navbar-container">
          <div className="navbar-right">
            {/* Hamburger Menu (Mobile) / Categories (Desktop) */}
            <div className="navbar-actions">
              <button className="icon-btn" onClick={toggleMenu} aria-label="القائمة" style={{ gap: '8px' }}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                <span className="desktop-text">الأقسام</span>
              </button>
            </div>

            {/* Logo */}
            <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
              <img src={basantLogo} alt="Basant Logo" className="logo-img" />
            </Link>
          </div>

          {/* Search Desktop */}
          <div className="navbar-search desktop-search">
            <form onSubmit={handleSearch} className="search-form">
              <input 
                type="text" 
                placeholder="ابحث عن منتج..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn" aria-label="بحث">
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}></div>
      )}

      {/* Category Drawer */}
      <div className={`category-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>الأقسام</h2>
          <button className="icon-btn" onClick={() => setIsMenuOpen(false)} aria-label="إغلاق">
            <X size={24} />
          </button>
        </div>
        <div className="drawer-content">
          <div className="navbar-search mobile-search">
            <form onSubmit={handleSearch} className="search-form">
              <input 
                type="text" 
                placeholder="ابحث عن منتج..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn" aria-label="بحث">
                <Search size={20} />
              </button>
            </form>
          </div>
          
          <nav className="drawer-nav">
            <ul>
              <li><Link to="/" onClick={toggleMenu}>الرئيسية</Link></li>
              {categories.map((cat: any) => (
                <li key={cat.id} style={{ paddingRight: `${cat.level * 15}px` }}>
                  <Link to={`/?categoryId=${cat.id}`} onClick={toggleMenu}>
                    {cat.level > 0 ? '↳ ' : ''}{cat.name}
                  </Link>
                </li>
              ))}

            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
