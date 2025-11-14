import { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const OutfitCard = ({ outfit, onSave, onUnsave, isSaved = false }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleSaveClick = async () => {
    setSaving(true);
    try {
      if (saved) {
        await onUnsave(outfit.id);
        setSaved(false);
      } else {
        await onSave(outfit.id);
        setSaved(true);
      }
    } catch (error) {
      console.error('Failed to save/unsave outfit:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="p-6">
        {/* Outfit Items */}
        <div className="space-y-4 mb-4">
          {outfit.top && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">TOP</p>
              <img
                src={outfit.top.image_url}
                alt="Top"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {outfit.dress && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">DRESS</p>
              <img
                src={outfit.dress.image_url}
                alt="Dress"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {outfit.bottom && !outfit.dress && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">BOTTOM</p>
              <img
                src={outfit.bottom.image_url}
                alt="Bottom"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {outfit.shoes && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">SHOES</p>
              <img
                src={outfit.shoes.image_url}
                alt="Shoes"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          disabled={saving}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
            saved
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {saving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              {saved ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Save Outfit
                </>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OutfitCard;
