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
    <div className="flex flex-wrap gap-3 mb-8 justify-center">
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value || 'all'}
          onClick={() => onCategoryChange(value)}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeCategory === value
              ? 'bg-blue-600 text-white shadow-xl scale-110 border-2 border-blue-700'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-2 border-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
