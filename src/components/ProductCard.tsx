import React from 'react';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onViewAR: (product: Product) => void;
  onView3D: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewAR, onView3D }) => {
  const discountedPrice = product.originalPrice 
    ? product.price 
    : product.price;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{product.discount}%
          </div>
        )}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onView3D(product)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            title="View in 3D"
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 font-medium">{product.category}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{product.rating} ({product.reviews})</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(discountedPrice)}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onViewAR(product)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            View in AR
          </button>
          
          <button 
            onClick={() => {
              if (product.flipkartUrl) {
                window.open(product.flipkartUrl, '_blank');
              }
            }}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Buy on Flipkart</span>
          </button>
        </div>
      </div>
    </div>
  );
};