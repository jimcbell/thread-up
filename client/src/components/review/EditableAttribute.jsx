import { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const CATEGORIES = ['top', 'bottom', 'dress', 'shoes', 'outerwear'];
const PATTERNS = ['solid', 'striped', 'floral', 'plaid', 'printed', 'other'];
const FORMALITY = ['casual', 'business_casual', 'formal'];
const COLORS = [
  'red', 'blue', 'green', 'black', 'white', 'navy', 'gray',
  'beige', 'brown', 'pink', 'purple', 'yellow', 'orange'
];

const EditableAttribute = ({ label, value, type, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      await onSave(editValue);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setIsEditing(false);
      }, 1000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const formatValue = (val) => {
    if (Array.isArray(val)) {
      return val.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ');
    }
    return val?.charAt(0).toUpperCase() + val?.slice(1) || 'Not set';
  };

  const renderEditor = () => {
    if (type === 'colors') {
      const selectedColors = Array.isArray(editValue) ? editValue : [];

      const toggleColor = (color) => {
        if (selectedColors.includes(color)) {
          setEditValue(selectedColors.filter(c => c !== color));
        } else {
          setEditValue([...selectedColors, color]);
        }
      };

      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                selectedColors.includes(color)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      );
    }

    const options = type === 'category' ? CATEGORIES
      : type === 'pattern' ? PATTERNS
      : type === 'formality' ? FORMALITY
      : [];

    return (
      <select
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="input mt-2"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {saved && (
          <span className="text-green-600 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Saved
          </span>
        )}
      </div>

      {!isEditing ? (
        <div
          onClick={() => setIsEditing(true)}
          className="px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-transparent hover:border-primary-300 transition-colors"
        >
          <p className="text-gray-900">{formatValue(value)}</p>
        </div>
      ) : (
        <div>
          {renderEditor()}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary text-sm flex items-center"
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableAttribute;
