import { useState, useEffect } from 'react';
import { productsApi } from '../../features/products/api/productsApi';
import { categoriesApi } from '../../features/categories/api/categoriesApi';
import type { Product, Category, ProductFeature } from '../../types/models';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { getImageUrl } from '../../utils/image';
import '../../pages/Admin/Admin.css';

interface ProductFormData {
  id?: number;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: number;
  mainImageFile: File | null;
  mainImageUrl: string;
  additionalImageFiles: File[];
  existingAdditionalImages: string[];
  sizes: string[];
  features: ProductFeature[];
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const defaultForm: ProductFormData = {
    description: '',
    price: 0,
    isAvailable: true,
    categoryId: '' as any,
    mainImageFile: null,
    mainImageUrl: '',
    additionalImageFiles: [],
    existingAdditionalImages: [],
    sizes: [],
    features: []
  };

  const [formData, setFormData] = useState<ProductFormData>(defaultForm);
  const [sizeInput, setSizeInput] = useState('');
  const [featureInput, setFeatureInput] = useState({ name: '', value: '' });

  const fetchProducts = async () => {
    setLoading(true);
    const res = await productsApi.getProducts({ pageIndex: 1, pageSize: 100 });
    if (res.success) setProducts(res.data.data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await categoriesApi.getCategories();
    if (res.success) setCategories(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...defaultForm, categoryId: '' as any });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      id: p.id,
      description: p.description,
      price: p.price,
      isAvailable: p.isAvailable,
      categoryId: p.categoryId,
      mainImageFile: null,
      mainImageUrl: p.mainImage || '',
      additionalImageFiles: [],
      existingAdditionalImages: p.additionalImages || [],
      sizes: p.sizes || [],
      features: p.features || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const res = await productsApi.deleteProduct(id);
      if (res.success) fetchProducts();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || formData.categoryId <= 0) {
      alert("الرجاء اختيار القسم");
      return;
    }

    const submitData = new FormData();
    submitData.append('Description', formData.description);
    submitData.append('Price', String(formData.price));
    submitData.append('CategoryId', String(formData.categoryId));
    submitData.append('IsAvailable', String(formData.isAvailable));
    
    formData.sizes.forEach(s => submitData.append('Sizes', s));
    
    formData.features.forEach((f, i) => {
      submitData.append(`Features[${i}].Name`, f.name);
      submitData.append(`Features[${i}].Value`, f.value);
    });

    if (formData.mainImageFile) {
      submitData.append('MainImage', formData.mainImageFile, formData.mainImageFile.name);
    }

    try {
      if (editingId) {
        submitData.append('Id', String(editingId));
        formData.existingAdditionalImages.forEach(img => {
          submitData.append('ExistingAdditionalImages', img);
        });
        formData.additionalImageFiles.forEach(f => {
          submitData.append('NewAdditionalImages', f, f.name);
        });
        await productsApi.updateProduct(editingId, submitData);
      } else {
        formData.additionalImageFiles.forEach(f => {
          submitData.append('AdditionalImages', f, f.name);
        });
        await productsApi.createProduct(submitData);
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error("Save error:", error);
      let errorMsg = 'حدث خطأ أثناء الحفظ. ';
      if (error.response?.data?.errors) {
        errorMsg += JSON.stringify(error.response.data.errors);
      } else if (error.response?.data?.message) {
        errorMsg += error.response.data.message;
      } else if (error.response?.data) {
        errorMsg += JSON.stringify(error.response.data);
      }
      alert(errorMsg);
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, mainImageFile: file, mainImageUrl: URL.createObjectURL(file) });
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData({ ...formData, additionalImageFiles: [...formData.additionalImageFiles, ...newFiles] });
    }
  };

  const removeNewAdditionalImage = (index: number) => {
    const newFiles = [...formData.additionalImageFiles];
    newFiles.splice(index, 1);
    setFormData({ ...formData, additionalImageFiles: newFiles });
  };

  const removeExistingAdditionalImage = (index: number) => {
    const existing = [...formData.existingAdditionalImages];
    existing.splice(index, 1);
    setFormData({ ...formData, existingAdditionalImages: existing });
  };

  const addSize = () => {
    if (sizeInput.trim()) {
      setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
      setSizeInput('');
    }
  };

  const removeSize = (idx: number) => {
    const newSizes = [...formData.sizes];
    newSizes.splice(idx, 1);
    setFormData({ ...formData, sizes: newSizes });
  };

  const addFeature = () => {
    if (featureInput.name.trim() && featureInput.value.trim()) {
      setFormData({ ...formData, features: [...formData.features, { ...featureInput }] });
      setFeatureInput({ name: '', value: '' });
    }
  };

  const removeFeature = (idx: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(idx, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>المنتجات</h2>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', gap: '8px' }}>
          <Plus size={18} /> <span>إضافة منتج</span>
        </button>
      </div>

      {loading ? <p>جاري التحميل...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <img src={getImageUrl(p.mainImage)} alt="Product" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }} />
              <p style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '12px' }}>{p.price} جنيه</p>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline" style={{ flex: 1, padding: '6px' }} onClick={() => openEditModal(p)}>
                  <Edit2 size={16} /> تعديل
                </button>
                <button className="btn btn-outline" style={{ flex: 1, padding: '6px', color: 'red', borderColor: 'red' }} onClick={() => handleDelete(p.id)}>
                  <Trash2 size={16} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>{editingId ? 'تعديل منتج' : 'إضافة منتج'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>الوصف</label>
                <textarea className="input-field" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>السعر</label>
                  <input type="number" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>القسم</label>
                  <select className="input-field" value={formData.categoryId || ''} onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})} required>
                    <option value="" disabled>اختر القسم</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px' }}>
                <label>الصورة الرئيسية</label>
                <input type="file" accept="image/*" className="input-field" onChange={handleMainImageChange} required={!editingId} />
                {formData.mainImageUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <p>معاينة:</p>
                    <img src={formData.mainImageFile ? formData.mainImageUrl : getImageUrl(formData.mainImageUrl)} alt="Main Preview" style={{ height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                )}
              </div>

              <div className="form-group" style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px' }}>
                <label>الصور الإضافية</label>
                <input type="file" accept="image/*" multiple className="input-field" onChange={handleAdditionalImagesChange} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {formData.existingAdditionalImages.map((img, idx) => (
                    <div key={`old-${idx}`} style={{ position: 'relative' }}>
                      <img src={getImageUrl(img)} alt="Additional Preview" style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <button type="button" onClick={() => removeExistingAdditionalImage(idx)} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' }}><X size={12}/></button>
                    </div>
                  ))}
                  {formData.additionalImageFiles.map((file, idx) => (
                    <div key={`new-${idx}`} style={{ position: 'relative' }}>
                      <img src={URL.createObjectURL(file)} alt="Additional Preview" style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <button type="button" onClick={() => removeNewAdditionalImage(idx)} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' }}><X size={12}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} />
                  متاح للبيع
                </label>
              </div>

              {/* Sizes */}
              <div className="form-group" style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px' }}>
                <label>المقاسات</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input type="text" className="input-field" value={sizeInput} onChange={e => setSizeInput(e.target.value)} placeholder="مثال: XL" />
                  <button type="button" className="btn btn-secondary" onClick={addSize} style={{background: '#eee'}}>إضافة</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.sizes?.map((s, i) => (
                    <span key={i} style={{ background: '#f8f8f8', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {s} <button type="button" onClick={() => removeSize(i)} style={{color: 'red'}}><X size={14}/></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="form-group" style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px' }}>
                <label>مواصفات إضافية</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input type="text" className="input-field" value={featureInput.name} onChange={e => setFeatureInput({...featureInput, name: e.target.value})} placeholder="الاسم (اللون)" />
                  <input type="text" className="input-field" value={featureInput.value} onChange={e => setFeatureInput({...featureInput, value: e.target.value})} placeholder="القيمة (أحمر)" />
                  <button type="button" className="btn btn-secondary" onClick={addFeature} style={{background: '#eee'}}>إضافة</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.features?.map((f, i) => (
                    <div key={i} style={{ background: '#f8f8f8', padding: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{f.name}: {f.value}</span>
                      <button type="button" onClick={() => removeFeature(i)} style={{color: 'red'}}><X size={16}/></button>
                    </div>
                  ))}
                </div>
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

export default AdminProducts;
