import { useState } from 'react';
import Modal from '../common/Modal';
import EditableAttribute from '../review/EditableAttribute';
import LoadingSpinner from '../common/LoadingSpinner';
import { clothingAPI } from '../../services/api';

const ItemDetailModal = ({ item, isOpen, onClose, onItemUpdated, onItemDeleted }) => {
  const [itemData, setItemData] = useState(item);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!item) return null;

  const handleAttributeUpdate = async (field, value) => {
    try {
      const updated = await clothingAPI.updateItem(item.id, { [field]: value });
      setItemData(updated);
      if (onItemUpdated) {
        onItemUpdated(updated);
      }
    } catch (error) {
      console.error('Failed to update attribute:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clothingAPI.deleteItem(item.id);
      if (onItemDeleted) {
        onItemDeleted(item.id);
      }
      onClose();
    } catch (error) {
      console.error('Failed to delete item:', error);
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Item Details" size="lg">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div>
          <img
            src={itemData.signed_url}
            alt={itemData.category}
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Details */}
        <div>
          {isEditing ? (
            <>
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

              <button onClick={() => setIsEditing(false)} className="btn-secondary w-full mt-4">
                Done Editing
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-lg text-gray-900 capitalize">{itemData.category}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Colors</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {itemData.colors?.map((color) => (
                      <span
                        key={color}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm capitalize"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Pattern</label>
                  <p className="text-lg text-gray-900 capitalize">{itemData.pattern}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Formality</label>
                  <p className="text-lg text-gray-900 capitalize">
                    {itemData.formality?.replace('_', ' ')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Date Added</label>
                  <p className="text-lg text-gray-900">
                    {itemData.created_at ? formatDate(itemData.created_at) : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => setIsEditing(true)} className="btn-primary w-full">
                  Edit Item
                </button>

                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger w-full">
                    Delete from Wardrobe
                  </button>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 mb-3">
                      Remove this item from your wardrobe?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="btn-danger flex-1 text-sm flex items-center justify-center"
                      >
                        {deleting && <LoadingSpinner size="sm" className="mr-2" />}
                        Yes, Remove
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleting}
                        className="btn-secondary flex-1 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ItemDetailModal;
