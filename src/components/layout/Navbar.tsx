import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, X, ChevronDown, ChevronLeft } from 'lucide-react';
import { categoriesApi } from '../../features/categories/api/categoriesApi';
import type { Category } from '../../types/models';
import basantLogo from '../../assets/basantlogo.jpg';
import './Navbar.css';

const CategoryNode = ({ category, toggleMenu, level = 0 }: { category: Category, toggleMenu: () => void, level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <li className="category-node" style={{ display: 'block', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: `${level * 15}px` }}>
        <Link to={`/?categoryId=${category.id}`} onClick={toggleMenu} style={{ flexGrow: 1 }}>
          {category.name}
        </Link>
        {hasChildren && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(!isExpanded); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--color-text-main)' }}
            aria-label="Expand/Collapse"
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>
      {isExpanded && hasChildren && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {category.children.map(child => (
            <CategoryNode key={child.id} category={child} toggleMenu={toggleMenu} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getCategories();
        if (res.success) {
          setCategories(res.data);
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

          {/* Logo on the left */}
          <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
            <img src={basantLogo} alt="Basant Logo" className="logo-img" />
          </Link>
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
              {categories.map((cat: Category) => (
                <CategoryNode key={cat.id} category={cat} toggleMenu={toggleMenu} />
              ))}

            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
