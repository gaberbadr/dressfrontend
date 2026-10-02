import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { settingsApi } from '../../features/settings/api/settingsApi';
import type { Settings } from '../../types/models';
import { Lock } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    settingsApi.getSettings().then(res => {
      if (res.success) {
        setSettings(res.data);
      }
    }).catch(console.error);
  }, []);

  return (
    <footer className="footer-wrapper">
      <div className="container footer-container">
        <div className="developer-credit">
          <span className="credit-label">تم إنشاؤه بواسطة</span>
          <span className="credit-name">جابر بدر</span>
          <span className="credit-contact">للتواصل: 01019806684</span>
        </div>

        <div className="footer-info">
          <h3>{settings?.storeName || 'Basant Catalog'}</h3>
          {settings?.location && <p>{settings.location}</p>}
        </div>
        
        <div className="footer-socials">
          {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer">فيسبوك</a>}
          {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer">انستجرام</a>}
          {settings?.tiktokUrl && <a href={settings.tiktokUrl} target="_blank" rel="noreferrer">تيك توك</a>}
        </div>

        <div className="footer-admin">
          <Link to="/admin/login" className="admin-login-link" title="دخول الإدارة">
            <Lock size={16} />
            <span>دخول الإدارة</span>
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} {settings?.storeName || 'Basant Catalog'}. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};

export default Footer;
