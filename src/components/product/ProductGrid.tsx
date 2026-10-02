import type { Product } from '../../types/models';
import ProductCard from './ProductCard';
import './ProductGrid.css';

interface ProductGridProps {
  products: Product[];
  whatsappNumber?: string;
}

const ProductGrid = ({ products, whatsappNumber }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>مفيش منتجات متاحة دلوقتي.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} priority={index < 4} />
      ))}
    </div>
  );
};

export default ProductGrid;
