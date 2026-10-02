import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../../features/products/api/productsApi';
import { settingsApi } from '../../features/settings/api/settingsApi';
import type { Product, Settings } from '../../types/models';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { generateWhatsAppLink } from '../../utils/whatsapp';
import { getImageUrl } from '../../utils/image';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Settings
    settingsApi.getSettings()
      .then(res => res.success && setSettings(res.data))
      .catch(() => {});

    // Fetch Product
    if (id) {
      setLoading(true);
      productsApi.getProductById(Number(id))
        .then(res => {
          if (res.success && res.data) {
            setProduct(res.data);
            setSelectedImage(res.data.mainImage || '');
          } else {
            setError('المنتج غير موجود.');
          }
        })
        .catch(() => setError('حصلت مشكلة في تحميل تفاصيل المنتج.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container details-loading">
        <div className="spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container details-error">
        <p className="text-error">{error}</p>
        <button className="btn btn-outline mt-4" onClick={() => navigate('/')}>
          رجوع
        </button>
      </div>
    );
  }

  const allImages = [product.mainImage, ...(product.additionalImages || [])].filter(Boolean);

  const handleWhatsApp = () => {
    if (settings?.phoneNumber) {
      window.open(generateWhatsAppLink(settings.phoneNumber, window.location.href), '_blank');
    }
  };

  return (
    <div className="container product-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowRight size={20} />
        <span>رجوع</span>
      </button>

      <div className="details-grid">
        {/* Image Gallery */}
        <div className="details-gallery">
          <div className="main-image-wrapper">
            <img 
              src={getImageUrl(selectedImage)} 
              alt="Product" 
              className="details-main-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/basantlogo.jpg';
                (e.target as HTMLImageElement).classList.add('fallback-img');
              }}
            />
          </div>
          
          {allImages.length > 1 && (
            <div className="thumbnail-list">
              {allImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail-wrapper ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} className="thumbnail-img" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="details-info">
          {!product.isAvailable && (
            <span className="badge-error">غير متاح حاليًا</span>
          )}
          {product.categoryName && (
            <span className="badge-category">{product.categoryName}</span>
          )}
          
          <p className="details-price" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{product.price} جنيه</p>
          
          <div className="details-description">
            <h3>التفاصيل</h3>
            <p>{product.description}</p>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="details-section">
              <h3>المقاسات المتاحة</h3>
              <div className="sizes-list">
                {product.sizes.map((size, idx) => (
                  <span key={idx} className="size-badge">{size}</span>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Features */}
          {product.features && product.features.length > 0 && (
            <div className="details-section">
              <h3>مواصفات إضافية</h3>
              <ul className="features-list">
                {product.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="feature-name">{feature.name}:</span>
                    <span className="feature-value">{feature.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action */}
          <div className="details-actions">
            <button 
              className="btn btn-whatsapp details-whatsapp-btn"
              onClick={handleWhatsApp}
              disabled={!settings?.phoneNumber}
            >
              <MessageCircle size={24} />
              <span>تواصل معنا للحجز والاستفسار</span>
            </button>
            {!settings?.phoneNumber && (
              <p className="text-muted" style={{fontSize: '0.85rem', marginTop: '8px'}}>رقم الواتساب غير متاح حالياً.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
