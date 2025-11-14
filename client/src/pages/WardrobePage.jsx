import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import CategoryFilter from '../components/wardrobe/CategoryFilter';
import ItemCard from '../components/wardrobe/ItemCard';
import ItemDetailModal from '../components/wardrobe/ItemDetailModal';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorMessage from '../components/common/ErrorMessage';
import ToastNotification from '../components/common/ToastNotification';
import { wardrobeAPI } from '../services/api';

const WardrobePage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadWardrobe();
  }, []);

  useEffect(() => {
    // Save category preference
    if (activeCategory !== null) {
      localStorage.setItem('wardrobe_category', activeCategory);
    }
  }, [activeCategory]);

  useEffect(() => {
    // Filter items based on category
    if (activeCategory === null) {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.category === activeCategory));
    }
  }, [activeCategory, items]);

  const loadWardrobe = async () => {
    try {
      const data = await wardrobeAPI.getItems();
      setItems(data);

      // Restore category filter from localStorage
      const savedCategory = localStorage.getItem('wardrobe_category');
      if (savedCategory && savedCategory !== 'null') {
        setActiveCategory(savedCategory);
      }
    } catch (err) {
      console.error('Failed to load wardrobe:', err);
      setError('Failed to load your wardrobe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleItemUpdated = (updatedItem) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    setSelectedItem(updatedItem);
  };

  const handleItemDeleted = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setToast({ message: 'Item removed from wardrobe', type: 'info' });
    setShowDetailModal(false);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      top: 'tops',
      bottom: 'bottoms',
      dress: 'dresses',
      shoes: 'shoes',
      outerwear: 'outerwear items',
    };
    return labels[category] || 'items';
  };

  if (loading) {
    return <LoadingScreen message="Loading your wardrobe..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wardrobe</h1>
          <p className="text-gray-600">
            {filteredItems.length > 0
              ? `${filteredItems.length} ${
                  activeCategory
                    ? getCategoryLabel(activeCategory)
                    : 'item' + (filteredItems.length !== 1 ? 's' : '')
                } in your wardrobe`
              : 'Your wardrobe is empty'}
          </p>
        </div>

        {error && <ErrorMessage message={error} onRetry={loadWardrobe} />}

        {items.length > 0 && (
          <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        )}

        {items.length === 0 && !error && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wardrobe is empty</h3>
            <p className="text-gray-600 mb-6">Upload your first items to get started!</p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              Upload Items
            </button>
          </div>
        )}

        {filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onClick={handleItemClick} />
            ))}
          </div>
        )}

        {items.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No {activeCategory && getCategoryLabel(activeCategory)} yet.
            </p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              Upload More Items
            </button>
          </div>
        )}
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onItemUpdated={handleItemUpdated}
          onItemDeleted={handleItemDeleted}
        />
      )}

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default WardrobePage;
