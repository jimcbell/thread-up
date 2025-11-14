const CATEGORIES = [
  { value: null, label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'dress', label: 'Dresses' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'outerwear', label: 'Outerwear' },
];

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value || 'all'}
          onClick={() => onCategoryChange(value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeCategory === value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
