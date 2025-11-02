import React, { useState } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ProductGrid } from './components/ProductGrid';
import { ARViewer } from './components/ARViewer';
import { Product3DViewer } from './components/Product3DViewer';
import { useProducts } from './hooks/useProducts';
import { Product } from './types/product';
import { Loader2 } from 'lucide-react';

function App() {
  const {
    products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useProducts();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isARViewerOpen, setIsARViewerOpen] = useState(false);
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);

  const handleViewAR = (product: Product) => {
    setSelectedProduct(product);
    setIsARViewerOpen(true);
  };

  const handleView3D = (product: Product) => {
    setSelectedProduct(product);
    setIs3DViewerOpen(true);
  };

  const closeARViewer = () => {
    setIsARViewerOpen(false);
    setSelectedProduct(null);
  };

  const close3DViewer = () => {
    setIs3DViewerOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Products</h2>
            <p className="text-gray-500">Fetching the latest furniture collection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-semibold mb-2">Error Loading Products</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Visualize Your Dream Home
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience furniture in your space with cutting-edge AR technology. 
            Browse thousands of products and see exactly how they'll look in your room.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time AR Placement</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>3D Product Preview</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Room Scanning Technology</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory || 'All'} Products
            </h2>
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <ProductGrid
              products={products}
              onViewAR={handleViewAR}
              onView3D={handleView3D}
            />
          )}
        </section>
      </main>

      {/* AR Viewer */}
      <ARViewer
        isOpen={isARViewerOpen}
        onClose={closeARViewer}
        product={selectedProduct}
      />

      {/* 3D Viewer */}
      <Product3DViewer
        isOpen={is3DViewerOpen}
        onClose={close3DViewer}
        product={selectedProduct}
      />
    </div>
  );
}

export default App;