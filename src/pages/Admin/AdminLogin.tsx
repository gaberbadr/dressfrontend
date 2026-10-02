import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { adminApi } from '../../features/admin/api/adminApi';
import { Lock } from 'lucide-react';
import './Admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // If already logged in
  if (localStorage.getItem('token')) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('من فضلك أدخل البريد الإلكتروني وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.login(email, password);
      
      if (res.success && res.token?.accessToken) {
        localStorage.setItem('token', res.token.accessToken);
        navigate('/admin');
      } else {
        setError(res.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حصلت مشكلة أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="icon-wrapper">
            <Lock size={32} />
          </div>
          <h2>لوحة التحكم</h2>
          <p className="text-muted">قم بتسجيل الدخول لإدارة المتجر</p>
        </div>

        {error && <div className="admin-alert error">{error}</div>}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              dir="ltr"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
          <button type="button" className="btn btn-outline w-100 mt-2" onClick={() => navigate('/')}>
            العودة للموقع
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
