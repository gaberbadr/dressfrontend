import { useState, useEffect } from 'react';
import { categoriesApi } from '../../features/categories/api/categoriesApi';
import type { Category } from '../../types/models';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import '../../pages/Admin/Admin.css';

const AdminCategories = () => {
  const [flatCategories, setFlatCategories] = useState<(Category & { level: number })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<{ name: string; parentCategoryId?: number }>({ name: '' });

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

  const fetchCategories = async () => {
    setLoading(true);
    const res = await categoriesApi.getCategories();
    if (res.success) {
      setFlatCategories(flattenCategories(res.data));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingId(c.id);
    setFormData({ name: c.name, parentCategoryId: c.parentCategoryId || undefined });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟ (قد يؤثر ذلك على المنتجات التابعة له)')) {
      const res = await categoriesApi.deleteCategory(id);
      if (res.success) fetchCategories();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await categoriesApi.updateCategory(editingId, { id: editingId, ...formData });
    } else {
      await categoriesApi.createCategory(formData);
    }
    setIsModalOpen(false);
    fetchCategories();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>الأقسام</h2>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', gap: '8px' }}>
          <Plus size={18} /> <span>إضافة قسم</span>
        </button>
      </div>

      {loading ? <p>جاري التحميل...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {flatCategories.map(c => (
            <div key={c.id} style={{ background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: `${c.level * 20}px`, borderRight: c.level > 0 ? '4px solid #eee' : 'none' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{c.name}</h3>
                {c.parentCategoryId && <p style={{ fontSize: '0.85rem', color: '#888' }}>القسم الأب: {flatCategories.find(x => x.id === c.parentCategoryId)?.name || c.parentCategoryId}</p>}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="icon-btn" onClick={() => openEditModal(c)}><Edit2 size={18} /></button>
                <button className="icon-btn" style={{ color: 'red' }} onClick={() => handleDelete(c.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>{editingId ? 'تعديل قسم' : 'إضافة قسم'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>اسم القسم</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div className="form-group">
                <label>القسم الأب (اختياري)</label>
                <select className="input-field" value={formData.parentCategoryId || ''} onChange={e => setFormData({...formData, parentCategoryId: e.target.value ? Number(e.target.value) : undefined})}>
                  <option value="">بدون قسم أب</option>
                  {flatCategories.filter(x => x.id !== editingId).map(c => <option key={c.id} value={c.id}>{'\u00A0\u00A0'.repeat(c.level)}{c.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>حفظ</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
