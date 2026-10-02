import { useState, useEffect } from 'react';
import { settingsApi } from '../../features/settings/api/settingsApi';
import type { Settings } from '../../types/models';
import '../../pages/Admin/Admin.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    id: 1,
    storeName: '',
    phoneNumber: '',
    location: '',
    tiktokUrl: '',
    facebookUrl: '',
    instagramUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await settingsApi.getSettings();
      if (res.success && res.data) {
        setSettings({
          id: res.data.id || 1,
          storeName: res.data.storeName || '',
          phoneNumber: res.data.phoneNumber || '',
          location: res.data.location || '',
          tiktokUrl: res.data.tiktokUrl || '',
          facebookUrl: res.data.facebookUrl || '',
          instagramUrl: res.data.instagramUrl || ''
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await settingsApi.updateSettings(settings);
      if (res.success) {
        setMessage('تم حفظ الإعدادات بنجاح.');
      } else {
        setMessage('حدث خطأ أثناء الحفظ.');
      }
    } catch {
      setMessage('حدث خطأ أثناء الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>إعدادات المتجر</h2>

      {loading ? <p>جاري التحميل...</p> : (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
          
          {message && (
            <div className={`admin-alert ${message.includes('بنجاح') ? '' : 'error'}`} style={{ backgroundColor: message.includes('بنجاح') ? '#f0fff4' : '', color: message.includes('بنجاح') ? '#2f855a' : '', borderColor: message.includes('بنجاح') ? '#c6f6d5' : '' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>اسم المتجر</label>
              <input type="text" className="input-field" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>رقم الواتساب / الهاتف (بدون كود الدولة، مثال: 01012345678)</label>
              <input type="text" className="input-field" value={settings.phoneNumber || ''} onChange={e => setSettings({...settings, phoneNumber: e.target.value})} dir="ltr" />
            </div>

            <div className="form-group">
              <label>العنوان / الموقع</label>
              <input type="text" className="input-field" value={settings.location || ''} onChange={e => setSettings({...settings, location: e.target.value})} />
            </div>

            <div className="form-group">
              <label>رابط فيسبوك</label>
              <input type="url" className="input-field" value={settings.facebookUrl || ''} onChange={e => setSettings({...settings, facebookUrl: e.target.value})} dir="ltr" />
            </div>

            <div className="form-group">
              <label>رابط انستجرام</label>
              <input type="url" className="input-field" value={settings.instagramUrl || ''} onChange={e => setSettings({...settings, instagramUrl: e.target.value})} dir="ltr" />
            </div>

            <div className="form-group">
              <label>رابط تيك توك</label>
              <input type="url" className="input-field" value={settings.tiktokUrl || ''} onChange={e => setSettings({...settings, tiktokUrl: e.target.value})} dir="ltr" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
