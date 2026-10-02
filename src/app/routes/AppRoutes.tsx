import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

const AdminLayout = lazy(() => import('../../features/admin/components/AdminLayout'));
const Home = lazy(() => import('../../pages/Home/Home'));
const ProductDetails = lazy(() => import('../../pages/ProductDetails/ProductDetails'));
const AdminLogin = lazy(() => import('../../pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../../pages/Admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../../pages/Admin/AdminProducts'));
const AdminCategories = lazy(() => import('../../pages/Admin/AdminCategories'));
const AdminSettings = lazy(() => import('../../pages/Admin/AdminSettings'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><span>Loading...</span></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products/:id" element={<ProductDetails />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
