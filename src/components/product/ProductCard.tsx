import type { Product } from '../../types/models';
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../../utils/whatsapp';
import { getImageUrl } from '../../utils/image';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  whatsappNumber?: string;
  priority?: boolean;
}

const ProductCard = React.memo(({ product, whatsappNumber, priority = false }: ProductCardProps) => {
  const currentUrl = `${window.location.origin}/products/${product.id}`;
  
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (whatsappNumber) {
      window.open(generateWhatsAppLink(whatsappNumber, currentUrl), '_blank');
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-image-container">
        <img 
          src={getImageUrl(product.mainImage)}
          alt="Product" 
          className="product-image"
          loading={priority ? undefined : "lazy"}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/basantlogo.jpg';
            (e.target as HTMLImageElement).classList.add('fallback-img');
          }}
        />
        {!product.isAvailable && (
          <div className="product-badge out-of-stock">غير متاح حاليًا</div>
        )}
      </div>
      
      <div className="product-info">

        <p className="product-price">{product.price} جنيه</p>
        <p className="product-desc">{product.description}</p>
        
        {whatsappNumber && (
          <button 
            className="btn btn-whatsapp whatsapp-btn"
            onClick={handleWhatsApp}
            title="تواصل معنا على واتساب"
          >
            <MessageCircle size={18} />
            <span>طلب واتساب</span>
          </button>
        )}
      </div>
    </Link>
  );
});

export default ProductCard;
