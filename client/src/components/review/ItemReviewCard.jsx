import { useState } from 'react';
import EditableAttribute from './EditableAttribute';
import LoadingSpinner from '../common/LoadingSpinner';
import { clothingAPI } from '../../services/api';

const ItemReviewCard = ({ item, onApprove, onReject }) => {
  const [itemData, setItemData] = useState(item);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleAttributeUpdate = async (field, value) => {
    try {
      const updated = await clothingAPI.updateItem(item.id, { [field]: value });
      setItemData(updated);
    } catch (error) {
      console.error('Failed to update attribute:', error);
      throw error;
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(item.id);
    } catch (error) {
      console.error('Failed to approve:', error);
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject(item.id);
    } catch (error) {
      console.error('Failed to reject:', error);
      setRejecting(false);
    }
  };

  return (
    <div className="card">
      {/* Image */}
      <div className="relative">
        <img src={itemData.signed_url} alt="Clothing item" className="w-full h-64 object-cover" />
      </div>

      {/* Attributes */}
      <div className="p-4">
        <EditableAttribute
          label="Category"
          value={itemData.category}
          type="category"
          onSave={(value) => handleAttributeUpdate('category', value)}
        />

        <EditableAttribute
          label="Colors"
          value={itemData.colors}
          type="colors"
          onSave={(value) => handleAttributeUpdate('colors', value)}
        />

        <EditableAttribute
          label="Pattern"
          value={itemData.pattern}
          type="pattern"
          onSave={(value) => handleAttributeUpdate('pattern', value)}
        />

        <EditableAttribute
          label="Formality"
          value={itemData.formality}
          type="formality"
          onSave={(value) => handleAttributeUpdate('formality', value)}
        />

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleApprove}
            disabled={approving || rejecting}
            className="flex-1 btn-primary flex items-center justify-center"
          >
            {approving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Approving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Approve
              </>
            )}
          </button>

          <button
            onClick={() => setShowRejectConfirm(true)}
            disabled={approving || rejecting}
            className="flex-1 btn-danger flex items-center justify-center"
          >
            {rejecting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Rejecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Reject
              </>
            )}
          </button>
        </div>

        {/* Reject Confirmation */}
        {showRejectConfirm && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-3">
              Are you sure? This item will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button onClick={handleReject} className="btn-danger text-sm">
                Yes, Remove
              </button>
              <button onClick={() => setShowRejectConfirm(false)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemReviewCard;
