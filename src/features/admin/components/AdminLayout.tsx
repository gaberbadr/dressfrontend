import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { Home, Package, List, Settings as SettingsIcon, LogOut, Menu, X, Globe } from 'lucide-react';
import '../../../pages/Admin/Admin.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    adminApi.logout();
    navigate('/admin/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? '' : 'mobile-closed'}`}>
        <div className="admin-sidebar-header">
          <h3>لوحة الإدارة</h3>
          <button className="icon-btn d-lg-none" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({isActive}) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Home size={20} />
            <span>الرئيسية</span>
          </NavLink>
          <NavLink to="/admin/products" className={({isActive}) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Package size={20} />
            <span>المنتجات</span>
          </NavLink>
          <NavLink to="/admin/categories" className={({isActive}) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <List size={20} />
            <span>الأقسام</span>
          </NavLink>
          <NavLink to="/admin/settings" className={({isActive}) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <SettingsIcon size={20} />
            <span>الإعدادات</span>
          </NavLink>
        </nav>

        <div className="admin-logout">
          <button className="btn btn-primary w-100 mb-2" onClick={() => navigate('/')} style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
            <Globe size={18} />
            <span>الذهاب للموقع</span>
          </button>
          <button className="btn btn-outline w-100" onClick={handleLogout} style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
            <LogOut size={18} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="icon-btn menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
