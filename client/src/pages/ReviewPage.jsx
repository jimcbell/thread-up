import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import ItemReviewCard from '../components/review/ItemReviewCard';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorMessage from '../components/common/ErrorMessage';
import ToastNotification from '../components/common/ToastNotification';
import { clothingAPI } from '../services/api';

const ReviewPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [removingItems, setRemovingItems] = useState(new Set());

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const data = await clothingAPI.getPendingItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      await clothingAPI.approveItem(itemId);

      // Add to removing set for animation
      setRemovingItems(prev => new Set(prev).add(itemId));

      // Remove after animation
      setTimeout(() => {
        setItems(prev => prev.filter(item => item.id !== itemId));
        setRemovingItems(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 500);

      setToast({ message: 'Item added to wardrobe!', type: 'success' });
    } catch (err) {
      console.error('Failed to approve item:', err);
      setToast({ message: 'Failed to approve item', type: 'error' });
    }
  };

  const handleReject = async (itemId) => {
    try {
      await clothingAPI.rejectItem(itemId);

      // Add to removing set for animation
      setRemovingItems(prev => new Set(prev).add(itemId));

      // Remove after animation
      setTimeout(() => {
        setItems(prev => prev.filter(item => item.id !== itemId));
        setRemovingItems(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 500);

      setToast({ message: 'Item removed', type: 'info' });
    } catch (err) {
      console.error('Failed to reject item:', err);
      setToast({ message: 'Failed to reject item', type: 'error' });
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading items for review..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Items</h1>
          <p className="text-gray-600">
            {items.length > 0
              ? `${items.length} item${items.length !== 1 ? 's' : ''} need${items.length === 1 ? 's' : ''} your review`
              : 'All items reviewed!'}
          </p>
        </div>

        {error && <ErrorMessage message={error} onRetry={loadPendingItems} />}

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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items to review
            </h3>
            <p className="text-gray-600 mb-6">
              Upload more items to get started!
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary"
            >
              Upload Items
            </button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`transition-all duration-500 ${
                    removingItems.has(item.id) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <ItemReviewCard
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="mt-8 text-center p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  All items added to wardrobe! 🎉
                </h3>
                <button
                  onClick={() => navigate('/wardrobe')}
                  className="btn-primary mt-4"
                >
                  Go to Wardrobe
                </button>
              </div>
            )}
          </>
        )}
      </div>

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

export default ReviewPage;
